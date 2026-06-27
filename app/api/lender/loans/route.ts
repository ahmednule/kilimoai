import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

async function getUserFromToken(req: NextRequest) {
  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return null

  const session = getSession()
  try {
    const result = await session.run(
      `MATCH (u:User {sessionToken: $token})
       OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
       RETURN u, r.name AS roleName`,
      { token }
    )
    if (result.records.length === 0) return null
    const record = result.records[0]
    const user = record.get('u').properties
    const relRole = record.get('roleName')
    user.role = relRole || user.role || null
    return user
  } finally {
    await session.close()
  }
}

export async function GET(req: NextRequest) {
  try {
    const lender = await getUserFromToken(req)
    if (!lender) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (lender.role !== 'lender') {
      return NextResponse.json({ success: false, error: 'Lender role required' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const statusFilter = searchParams.get('status') || 'all'
    const loanId = searchParams.get('loanId') || ''

    const session = getSession()
    try {
      // Query LoanApplication nodes through the User -> APPLIED_FOR -> LoanApplication path
      const conditions: string[] = []
      const params: Record<string, any> = {}
      if (statusFilter !== 'all') { conditions.push('toLower(l.status) = toLower($statusFilter)'); params.statusFilter = statusFilter }
      if (loanId) { conditions.push('l.id = $loanId'); params.loanId = loanId }
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      const result = await session.run(`
        MATCH (u:User)-[:APPLIED_FOR]->(l:LoanApplication)
        OPTIONAL MATCH (u)-[:LOCATED_IN]->(co:County)
        OPTIONAL MATCH (u)-[:GROWS]->(c:Crop)
        OPTIONAL MATCH (u)-[:MEMBER_OF]->(cg:ChamaGroup)
        ${whereClause}
        RETURN l,
               u.id AS farmerId, u.name AS farmerName, u.phone AS farmerPhone, u.email AS farmerEmail,
               u.acreage AS acreage, u.creditScore AS creditScore,
               collect(DISTINCT c.name) AS crops,
               co.name AS countyName,
               cg.name AS chamaName
        ORDER BY l.date DESC
      `, params)

      const loans = result.records.map(r => {
        const props = r.get('l').properties
        const crops = r.get('crops') || []
        return {
          id: props.id,
          farmerId: r.get('farmerId') || props.farmerId || '',
          farmerName: r.get('farmerName') || props.farmerName || '',
          farmerPhone: r.get('farmerPhone') || '',
          farmerEmail: r.get('farmerEmail') || '',
          county: r.get('countyName') || props.county || '',
          crops,
          acreage: Number(r.get('acreage') || props.acres || 0),
          loanAmount: Number(props.amount || 0),
          riskScore: props.riskLevel === 'LOW' ? 20 : props.riskLevel === 'MEDIUM' ? 50 : props.riskLevel === 'HIGH' ? 85 : 0,
          creditScore: Number(r.get('creditScore') || 0),
          status: props.status || 'pending',
          hasChama: !!r.get('chamaName'),
          chamaName: r.get('chamaName') || null,
          createdAt: props.date ? props.date.toString() : '',
        }
      })

      const stats = {
        total: loans.length,
        pending: loans.filter((l: any) => l.status === 'pending' || l.status === 'pending_verification').length,
        approved: loans.filter((l: any) => l.status === 'approved').length,
        rejected: loans.filter((l: any) => l.status === 'rejected').length,
        disbursed: loans.filter((l: any) => l.status === 'disbursed').length,
      }

      return NextResponse.json({ success: true, loans, stats })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[lender loans GET]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const lender = await getUserFromToken(req)
    if (!lender) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (lender.role !== 'lender') {
      return NextResponse.json({ success: false, error: 'Lender role required' }, { status: 403 })
    }

    const { loanId, action, amount, interestRate, duration, reason } = await req.json()

    if (!loanId || !action) {
      return NextResponse.json({ success: false, error: 'loanId and action are required' }, { status: 400 })
    }

    if (!['approve', 'counter', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }

    const newStatus = action === 'approve' ? 'approved' : action === 'counter' ? 'countered' : 'rejected'

    const session = getSession()
    try {
      // Find the loan application through the User -> APPLIED_FOR -> LoanApplication path
      const check = await session.run(
        `MATCH (u:User)-[:APPLIED_FOR]->(l:LoanApplication {id: $loanId})
         RETURN l, u.id AS farmerId, u.phone AS farmerPhone, u.name AS farmerName`,
        { loanId }
      )

      if (check.records.length === 0) {
        // Fallback: check legacy FarmerProfile path
        const legacyCheck = await session.run(
          `MATCH (fp:FarmerProfile)-[:HAS_LOAN]->(l:LoanApplication {id: $loanId})
           OPTIONAL MATCH (u:User)-[:HAS_PROFILE]->(fp)
           RETURN l, u.id AS farmerId, u.phone AS farmerPhone, u.name AS farmerName`,
          { loanId }
        )
        if (legacyCheck.records.length === 0) {
          return NextResponse.json({ success: false, error: 'Loan not found' }, { status: 404 })
        }
        check.records = legacyCheck.records
      }

      const farmerId = check.records[0].get('farmerId')
      const farmerPhone = check.records[0].get('farmerPhone') || ''
      const farmerName = check.records[0].get('farmerName') || ''

      // Update loan status
      await session.run(
        `MATCH (l:LoanApplication {id: $loanId})
         SET l.status = $newStatus,
             l.decidedAt = datetime(),
             l.decidedBy = $lenderId,
             l.decisionReason = $reason
         ${amount ? ', l.approvedAmount = $amount' : ''}
         ${interestRate ? ', l.interestRate = $interestRate' : ''}
         ${duration ? ', l.duration = $duration' : ''}`,
        { loanId, lenderId: lender.id, newStatus, reason: reason || '', amount: amount || null, interestRate: interestRate || null, duration: duration || null }
      )

      // If approved, create ActiveLoan node and trigger Masumi
      if (action === 'approve') {
        const activeLoanId = `active-${loanId}`
        const masumiRef = `MSM-${Date.now().toString(36).toUpperCase()}`

        await session.run(
          `MATCH (u:User {id: $farmerId}), (lender:User {id: $lenderId})
           MATCH (l:LoanApplication {id: $loanId})
           OPTIONAL MATCH (u)-[:LOCATED_IN]->(co:County)
           CREATE (al:ActiveLoan {
             id: $activeLoanId,
             farmerId: $farmerId,
             lenderId: $lenderId,
             amount: COALESCE(l.approvedAmount, l.amount),
             interestRate: COALESCE(l.interestRate, 12),
             duration: COALESCE(l.duration, 12),
             disbursedAt: datetime(),
             status: 'disbursed',
             disbursedVia: 'mpesa',
             masumiRef: $masumiRef,
             recipientPhone: u.phone,
             county: co.name,
             totalPaid: 0,
             remainingBalance: COALESCE(l.approvedAmount, l.amount),
             dailyInterest: ROUND(COALESCE(l.approvedAmount, l.amount) * (COALESCE(l.interestRate, 12) / 100.0) / 365, 2)
           })
           CREATE (lender)-[:DISBURSED]->(al)
           CREATE (u)-[:RECEIVED_LOAN]->(al)
           SET l.masumiRef = $masumiRef,
               l.status = 'disbursed'`,
          { loanId, farmerId, lenderId: lender.id, activeLoanId, masumiRef }
        )

        return NextResponse.json({
          success: true,
          message: 'Loan approved and disbursed via Masumi M-Pesa',
          masumiRef,
        })
      }

      return NextResponse.json({
        success: true,
        message: `Loan ${action === 'counter' ? 'countered' : 'rejected'} successfully`,
      })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[lender loans POST]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

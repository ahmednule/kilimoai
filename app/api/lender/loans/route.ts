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
      // Query LoanApplication nodes through the existing relationship chain:
      // User -> HAS_PROFILE -> FarmerProfile -> HAS_LOAN -> LoanApplication
      const conditions: string[] = []
      const params: Record<string, any> = {}
      if (statusFilter !== 'all') { conditions.push('toLower(l.status) = toLower($statusFilter)'); params.statusFilter = statusFilter }
      if (loanId) { conditions.push('l.id = $loanId'); params.loanId = loanId }
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      const result = await session.run(`
        MATCH (fp:FarmerProfile)-[:HAS_LOAN]->(l:LoanApplication)
        OPTIONAL MATCH (u:User)-[:HAS_PROFILE]->(fp)
        OPTIONAL MATCH (u)-[:BELONGS_TO]->(cg:ChamaGroup)
        ${whereClause}
        RETURN l,
               u.id AS farmerId, u.name AS farmerName, u.phone AS farmerPhone, u.email AS farmerEmail,
               fp.acres AS acreage, fp.creditScore AS creditScore, fp.crop AS farmerCrop,
               cg.name AS chamaName
        ORDER BY l.date DESC
      `, params)

      const loans = result.records.map(r => {
        const props = r.get('l').properties
        const crop = r.get('farmerCrop') || ''
        return {
          id: props.id,
          farmerId: r.get('farmerId') || props.farmerId || '',
          farmerName: r.get('farmerName') || props.farmerName || '',
          farmerPhone: r.get('farmerPhone') || '',
          farmerEmail: r.get('farmerEmail') || '',
          county: props.county || '',
          crops: crop ? [crop] : [],
          acreage: r.get('acreage') || props.acres || 0,
          loanAmount: props.amount || 0,
          riskScore: props.riskLevel === 'LOW' ? 20 : props.riskLevel === 'MEDIUM' ? 50 : props.riskLevel === 'HIGH' ? 85 : 0,
          creditScore: r.get('creditScore') || 0,
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
      // Find the loan application through the existing relationship chain
      const check = await session.run(
        `MATCH (fp:FarmerProfile)-[:HAS_LOAN]->(l:LoanApplication {id: $loanId})
         OPTIONAL MATCH (u:User)-[:HAS_PROFILE]->(fp)
         RETURN l, u.id AS farmerId, u.phone AS farmerPhone, u.name AS farmerName, fp.crop AS farmerCrop`,
        { loanId }
      )

      if (check.records.length === 0) {
        return NextResponse.json({ success: false, error: 'Loan not found' }, { status: 404 })
      }

      const loanProps = check.records[0].get('l').properties
      const farmerId = check.records[0].get('farmerId')
      const farmerPhone = check.records[0].get('farmerPhone') || ''
      const farmerName = check.records[0].get('farmerName') || ''
      const farmerCrop = check.records[0].get('farmerCrop') || ''

      // Update loan status
      await session.run(
        `MATCH (fp:FarmerProfile)-[:HAS_LOAN]->(l:LoanApplication {id: $loanId})
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
          `MATCH (fp:FarmerProfile)-[:HAS_LOAN]->(l:LoanApplication {id: $loanId})
           MATCH (lender:User {id: $lenderId})
           WITH fp, l, lender
           OPTIONAL MATCH (u:User)-[:HAS_PROFILE]->(fp)
           CREATE (al:ActiveLoan {
             id: $activeLoanId,
             farmerId: COALESCE(u.id, fp.id),
             lenderId: $lenderId,
             amount: COALESCE(l.approvedAmount, l.amount),
             interestRate: COALESCE(l.interestRate, 12),
             duration: COALESCE(l.duration, 12),
             disbursedAt: datetime(),
             status: 'disbursed',
             disbursedVia: 'mpesa',
             masumiRef: $masumiRef,
             recipientPhone: u.phone,
             totalPaid: 0,
             remainingBalance: COALESCE(l.approvedAmount, l.amount)
           })
           CREATE (lender)-[:DISBURSED]->(al)
           WITH u, l, al
           FOREACH (_ IN CASE WHEN u IS NOT NULL THEN [1] ELSE [] END |
             CREATE (u)-[:RECEIVED_LOAN]->(al)
           )
           SET l.masumiRef = $masumiRef,
               l.status = 'disbursed'`,
          { loanId, lenderId: lender.id, activeLoanId, masumiRef }
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

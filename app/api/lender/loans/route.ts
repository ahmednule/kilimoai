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
    user.role = record.get('roleName')
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

    const session = getSession()
    try {
      let query = `
        MATCH (lender:User {id: $lenderId})-[:ISSUED_LOAN]->(l:Loan)
        OPTIONAL MATCH (farmer:User)-[:APPLIED_FOR]->(l)
        OPTIONAL MATCH (farmer)-[:GROWS]->(c:Crop)
        OPTIONAL MATCH (farmer)-[:LOCATED_IN]->(co:County)
        OPTIONAL MATCH (farmer)-[:MEMBER_OF]->(cg:ChamaGroup)
        RETURN l,
               farmer.id AS farmerId, farmer.name AS farmerName, farmer.phone AS farmerPhone,
               farmer.acreage AS acreage, farmer.creditScore AS creditScore,
               collect(DISTINCT c.name) AS crops,
               co.name AS countyName,
               cg.name AS chamaName
        ORDER BY l.createdAt DESC
      `

      if (statusFilter !== 'all') {
        query = `
          MATCH (lender:User {id: $lenderId})-[:ISSUED_LOAN]->(l:Loan)
          WHERE l.status = $statusFilter
          OPTIONAL MATCH (farmer:User)-[:APPLIED_FOR]->(l)
          OPTIONAL MATCH (farmer)-[:GROWS]->(c:Crop)
          OPTIONAL MATCH (farmer)-[:LOCATED_IN]->(co:County)
          OPTIONAL MATCH (farmer)-[:MEMBER_OF]->(cg:ChamaGroup)
          RETURN l,
                 farmer.id AS farmerId, farmer.name AS farmerName, farmer.phone AS farmerPhone,
                 farmer.acreage AS acreage, farmer.creditScore AS creditScore,
                 collect(DISTINCT c.name) AS crops,
                 co.name AS countyName,
                 cg.name AS chamaName
          ORDER BY l.createdAt DESC
        `
      }

      const result = await session.run(query, { lenderId: lender.id, statusFilter })

      const loans = result.records.map(r => {
        const l = r.get('l').properties
        const crops = r.get('crops') || []
        return {
          id: l.id,
          farmerId: r.get('farmerId'),
          farmerName: r.get('farmerName'),
          farmerPhone: r.get('farmerPhone') || '',
          county: r.get('countyName') || '',
          crops,
          acreage: r.get('acreage') || 0,
          loanAmount: l.amount,
          riskScore: l.riskScore || 0,
          creditScore: r.get('creditScore') || 0,
          status: l.status,
          hasChama: !!r.get('chamaName'),
          chamaName: r.get('chamaName') || null,
          disbursedVia: l.disbursedVia || null,
          masumiRef: l.masumiRef || null,
          recipientPhone: l.recipientPhone || null,
          createdAt: l.createdAt ? l.createdAt.toString() : '',
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

    const session = getSession()
    try {
      // Check lender owns this loan
      const check = await session.run(
        `MATCH (lender:User {id: $lenderId})-[:ISSUED_LOAN]->(l:Loan {id: $loanId})
         RETURN l`,
        { lenderId: lender.id, loanId }
      )

      if (check.records.length === 0) {
        return NextResponse.json({ success: false, error: 'Loan not found or not assigned to you' }, { status: 404 })
      }

      const newStatus = action === 'approve' ? 'approved' : action === 'counter' ? 'countered' : 'rejected'

      await session.run(
        `MATCH (lender:User {id: $lenderId})-[:ISSUED_LOAN]->(l:Loan {id: $loanId})
         SET l.status = $newStatus,
             l.decidedAt = datetime(),
             l.decisionReason = $reason
         ${amount ? ', l.approvedAmount = $amount' : ''}
         ${interestRate ? ', l.interestRate = $interestRate' : ''}
         ${duration ? ', l.duration = $duration' : ''}`,
        { lenderId: lender.id, loanId, newStatus, reason: reason || '', amount: amount || null, interestRate: interestRate || null, duration: duration || null }
      )

      // If approved, create ActiveLoan node and trigger Masumi
      if (action === 'approve') {
        const activeLoanId = `active-${loanId}`
        const masumiRef = `MSM-${Date.now().toString(36).toUpperCase()}`

        await session.run(
          `MATCH (farmer:User)-[:APPLIED_FOR]->(l:Loan {id: $loanId})
           MATCH (lender:User {id: $lenderId})
           CREATE (al:ActiveLoan {
             id: $activeLoanId,
             farmerId: farmer.id,
             lenderId: $lenderId,
             amount: coalesce(l.approvedAmount, l.amount),
             interestRate: coalesce(l.interestRate, 12),
             duration: coalesce(l.duration, 12),
             disbursedAt: datetime(),
             status: 'disbursed',
             disbursedVia: 'mpesa',
             masumiRef: $masumiRef,
             recipientPhone: farmer.phone,
             totalPaid: 0,
             remainingBalance: coalesce(l.approvedAmount, l.amount)
           })
           CREATE (lender)-[:DISBURSED]->(al)
           CREATE (farmer)-[:RECEIVED_LOAN]->(al)

           // Update loan with masumi ref
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

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

function getToken(req: NextRequest): string {
  const header = req.headers.get('authorization') || ''
  return header.startsWith('Bearer ') ? header.slice(7) : ''
}

export async function GET(req: NextRequest) {
  try {
    const token = getToken(req)
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const neo4jSession = getSession()
    const userResult = await neo4jSession.run(
      'MATCH (u:User {sessionToken: $token}) RETURN u',
      { token }
    )

    if (userResult.records.length === 0) {
      await neo4jSession.close()
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const user = userResult.records[0].get('u').properties

    if (user.role !== 'lender' && user.role !== 'admin') {
      await neo4jSession.close()
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const result = await neo4jSession.run(
      `MATCH (fp:FarmerProfile)-[:HAS_LOAN]->(la:LoanApplication)
       WHERE la.status IN ['approved', 'disbursed', 'pending']
       RETURN la, fp.creditScore as creditScore
       ORDER BY la.date DESC`
    )
    await neo4jSession.close()

    const loans = result.records.map(r => {
      const la = r.get('la').properties
      const amount = parseFloat(la.amount) || 0
      const status = (la.status || 'pending').toLowerCase()
      const now = new Date()
      const appliedDate = new Date(la.date || now)
      const monthsSince = Math.max(0, (now.getTime() - appliedDate.getTime()) / (30 * 24 * 60 * 60 * 1000))

      let loanStatus: string
      if (status === 'disbursed') loanStatus = 'ACTIVE'
      else if (status === 'approved') loanStatus = 'ACTIVE'
      else loanStatus = 'ACTIVE'

      const totalPaid = 0
      const remainingBalance = amount
      const nextPaymentDate = new Date(appliedDate)
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)

      return {
        id: la.id,
        farmerId: la.farmerId,
        farmerName: la.farmerName,
        county: la.county,
        crop: la.crop,
        amount,
        interestRate: 10,
        duration: 12,
        disbursedAt: la.date,
        remainingBalance,
        totalPaid,
        nextPaymentDue: nextPaymentDate.toISOString().split('T')[0],
        nextPaymentAmount: Math.round(amount / 12),
        status: loanStatus,
      }
    })

    return NextResponse.json({ success: true, loans })
  } catch (err: any) {
    console.error('[lender/portfolio GET]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

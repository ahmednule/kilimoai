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
    user.role = record.get('roleName') || user.role || null
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

    const session = getSession()
    try {
      const result = await session.run(`
        MATCH (al:ActiveLoan)
        OPTIONAL MATCH (u:User)-[:RECEIVED_LOAN]->(al)
        OPTIONAL MATCH (u)-[:HAS_PROFILE]->(fp:FarmerProfile)
        RETURN al,
               u.id AS farmerId, u.name AS farmerName, u.phone AS farmerPhone,
               fp.crop AS farmerCrop, fp.acres AS acreage
        ORDER BY al.disbursedAt DESC
      `)

      const loans = result.records.map(r => {
        const props = r.get('al').properties
        return {
          id: props.id,
          farmerId: r.get('farmerId') || props.farmerId || '',
          farmerName: r.get('farmerName') || '',
          farmerPhone: r.get('farmerPhone') || '',
          county: props.county || '',
          crop: r.get('farmerCrop') || '',
          acreage: r.get('acreage') || 0,
          amount: props.amount ? props.amount.toNumber() : 0,
          interestRate: props.interestRate ? props.interestRate.toNumber() : 0,
          duration: props.duration ? props.duration.toNumber() : 0,
          disbursedAt: props.disbursedAt ? props.disbursedAt.toString() : '',
          remainingBalance: props.remainingBalance ? props.remainingBalance.toNumber() : 0,
          totalPaid: props.totalPaid ? props.totalPaid.toNumber() : 0,
          nextPaymentDue: props.nextPaymentDue ? props.nextPaymentDue.toString() : '-',
          nextPaymentAmount: props.nextPaymentAmount ? props.nextPaymentAmount.toNumber() : 0,
          status: props.status === 'paid_off' ? 'PAID_OFF' : props.status === 'defaulted' ? 'DEFAULTED' : 'ACTIVE',
        }
      })

      return NextResponse.json({ success: true, loans })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[lender portfolio GET]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

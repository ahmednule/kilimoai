import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

async function getUserFromSession(req: NextRequest) {
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

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromSession(req)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'farmer') return NextResponse.json({ success: false, error: 'Farmer role required' }, { status: 403 })

    const { loanId, amount } = await req.json()
    if (!loanId || !amount) {
      return NextResponse.json({ success: false, error: 'loanId and amount are required' }, { status: 400 })
    }

    const paymentRef = `MPESA-${Date.now().toString(36).toUpperCase()}`
    const today = new Date().toISOString().split('T')[0]

    const session = getSession()
    try {
      // Check the active loan belongs to this farmer
      const check = await session.run(
        `MATCH (u:User {id: $farmerId})-[:RECEIVED_LOAN]->(al:ActiveLoan {id: $loanId})
         RETURN al`,
        { farmerId: user.id, loanId }
      )

      if (check.records.length === 0) {
        return NextResponse.json({ success: false, error: 'Active loan not found' }, { status: 404 })
      }

      const props = check.records[0].get('al').properties
      const currentBalance = Number(props.remainingBalance || 0)
      const totalPaidSoFar = Number(props.totalPaid || 0)

      if (amount > currentBalance) {
        return NextResponse.json({ success: false, error: 'Payment exceeds remaining balance' }, { status: 400 })
      }

      const newBalance = currentBalance - amount
      const newTotalPaid = totalPaidSoFar + amount
      const newStatus = newBalance <= 0 ? 'paid_off' : props.status

      // Create payment record on the ActiveLoan
      await session.run(
        `MATCH (u:User {id: $farmerId})-[:RECEIVED_LOAN]->(al:ActiveLoan {id: $loanId})
         SET al.totalPaid = $newTotalPaid,
             al.remainingBalance = $newBalance,
             al.status = $newStatus
         CREATE (al)-[:HAS_PAYMENT]->(p:PaymentRecord {
           id: $paymentRef,
           date: $today,
           amount: $amount,
           method: 'MPESA',
           mpesaRef: $paymentRef
         })`,
        { farmerId: user.id, loanId, amount, newTotalPaid, newBalance, newStatus, paymentRef, today }
      )

      return NextResponse.json({
        success: true,
        message: 'Payment processed successfully',
        paymentRef,
        remainingBalance: newBalance,
        totalPaid: newTotalPaid,
        status: newStatus === 'paid_off' ? 'PAID_OFF' : 'ACTIVE',
      })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[farmer loans pay]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

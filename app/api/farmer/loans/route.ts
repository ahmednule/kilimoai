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

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromSession(req)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'farmer') return NextResponse.json({ success: false, error: 'Farmer role required' }, { status: 403 })

    const session = getSession()
    try {
      // Query pending applications
      const appResult = await session.run(`
        MATCH (u:User {id: $farmerId})-[:APPLIED_FOR]->(la:LoanApplication)
        OPTIONAL MATCH (lp:LoanProduct {id: la.productId})
        RETURN la, lp.name AS productName, lp.provider AS productProvider,
               lp.interestRate AS productRate, lp.tenureMonths AS productTenure
        ORDER BY la.date DESC
      `, { farmerId: user.id })

      const applications = appResult.records.map(r => {
        const props = r.get('la').properties
        return {
          id: props.id,
          productId: props.productId || '',
          productName: r.get('productName') || '',
          productProvider: r.get('productProvider') || '',
          productRate: r.get('productRate') ? Number(r.get('productRate')) : 0,
          productTenure: r.get('productTenure') ? Number(r.get('productTenure')) : 0,
          amount: Number(props.amount || 0),
          status: props.status || 'pending',
          date: props.date ? props.date.toString() : '',
          county: props.county || '',
          crop: props.crop || '',
          acres: Number(props.acres || 0),
          riskLevel: props.riskLevel || 'UNKNOWN',
        }
      })

      // Query active loans (disbursed)
      const activeResult = await session.run(`
        MATCH (u:User {id: $farmerId})-[:RECEIVED_LOAN]->(al:ActiveLoan)
        RETURN al
        ORDER BY al.disbursedAt DESC
      `, { farmerId: user.id })

      const activeLoans = activeResult.records.map(r => {
        const props = r.get('al').properties
        const amount = Number(props.amount || 0)
        const interestRate = Number(props.interestRate || 12)
        const duration = Number(props.duration || 12)
        const totalPaid = Number(props.totalPaid || 0)
        const remainingBalance = Number(props.remainingBalance || amount)
        const dailyInterest = Number(props.dailyInterest || (amount * (interestRate / 100) / 365))
        const disbursedAt = props.disbursedAt ? new Date(props.disbursedAt.toString()) : new Date()

        // Calculate maturity date
        const maturityDate = new Date(disbursedAt)
        maturityDate.setMonth(maturityDate.getMonth() + duration)

        const now = new Date()
        const isMatured = now >= maturityDate

        // Calculate time remaining or overdue
        let msRemaining = maturityDate.getTime() - now.getTime()
        let daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)))
        let daysOverdue = isMatured ? Math.ceil((now.getTime() - maturityDate.getTime()) / (1000 * 60 * 60 * 24)) : 0

        // Calculate accrued interest since disbursement (or since maturity if overdue)
        const msSinceDisbursement = now.getTime() - disbursedAt.getTime()
        const daysSinceDisbursement = Math.floor(msSinceDisbursement / (1000 * 60 * 60 * 24))
        const accruedInterest = Math.round(dailyInterest * daysSinceDisbursement * 100) / 100

        return {
          id: props.id,
          amount,
          interestRate,
          duration,
          disbursedAt: disbursedAt.toISOString(),
          maturityDate: maturityDate.toISOString(),
          remainingBalance,
          totalPaid,
          dailyInterest,
          accruedInterest,
          status: props.status === 'paid_off' ? 'PAID_OFF' : props.status === 'defaulted' ? 'DEFAULTED' : isMatured ? 'MATURED' : 'ACTIVE',
          daysRemaining,
          daysOverdue,
          masumiRef: props.masumiRef || '',
          disbursedVia: props.disbursedVia || 'mpesa',
          recipientPhone: props.recipientPhone || '',
          county: props.county || '',
          crop: props.crop || '',
        }
      })

      // Determine state
      const pendingApp = applications.find(a => a.status === 'pending' || a.status === 'pending_verification')
      const activeLoan = activeLoans.find(a => a.status === 'ACTIVE' || a.status === 'MATURED')

      return NextResponse.json({
        success: true,
        applications,
        activeLoans,
        state: activeLoan ? 'active' : pendingApp ? 'pending' : 'none',
        pendingApplication: pendingApp || null,
        activeLoan: activeLoan || null,
      })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[farmer loans GET]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

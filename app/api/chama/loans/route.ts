import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

async function getUserFromToken(req: NextRequest) {
  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return null

  const session = getSession()
  try {
    const result = await session.run(
      'MATCH (u:User {sessionToken: $token}) RETURN u',
      { token }
    )
    return result.records.length > 0 ? result.records[0].get('u').properties : null
  } finally {
    await session.close()
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { chamaId, loanAmount, purpose } = await req.json()

    if (!chamaId || !loanAmount) {
      return NextResponse.json({ success: false, error: 'Missing chamaId or loanAmount' }, { status: 400 })
    }

    const loanId = `chama-loan-${chamaId}-${user.id}-${Date.now()}`
    const session = getSession()
    try {
      await session.run(
        `MATCH (u:User {id: $userId}), (c:ChamaGroup {id: $chamaId})
         CREATE (l:LoanApplication {
           id: $loanId,
           loanAmount: $loanAmount,
           purpose: $purpose,
           status: 'PENDING',
           type: 'chama',
           appliedAt: datetime()
         })
         CREATE (u)-[:APPLIED]->(l)
         CREATE (l)-[:FOR_CHAMA]->(c)`,
        { userId: user.id, chamaId, loanId, loanAmount: parseFloat(loanAmount), purpose: purpose || '' }
      )

      return NextResponse.json({ success: true, loanId })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[chama loans POST]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

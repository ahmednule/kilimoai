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

async function getActiveMembership(userId: string, chamaId: string) {
  const session = getSession()
  try {
    const result = await session.run(
      `MATCH (u:User {id: $userId})-[r:BELONGS_TO]->(c:ChamaGroup {id: $chamaId})
       WHERE r.status = 'ACTIVE'
       RETURN r`,
      { userId, chamaId }
    )
    return result.records.length > 0 ? result.records[0].get('r') : null
  } finally {
    await session.close()
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const chamaId = searchParams.get('chamaId')

    const session = getSession()
    try {
      const result = await session.run(
        `MATCH (c:ChamaGroup {id: $chamaId})<-[r:CONTRIBUTED_TO]-(cont:Contribution)
         RETURN cont
         ORDER BY cont.createdAt DESC
         LIMIT 50`,
        { chamaId }
      )

      const contributions = result.records.map(record => {
        const p = record.get('cont').properties
        return {
          id: p.id,
          chamaId,
          amount: p.amount || 0,
          date: p.createdAt ? p.createdAt.toString() : '',
          method: p.method || 'MPESA',
          mpesaRef: p.mpesaRef || undefined,
        }
      })

      return NextResponse.json({ success: true, contributions })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[chama contributions GET]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { chamaId, amount, method, mpesaRef } = await req.json()

    if (!chamaId || !amount) {
      return NextResponse.json({ success: false, error: 'Missing chamaId or amount' }, { status: 400 })
    }

    const membership = await getActiveMembership(user.id, chamaId)
    if (!membership) {
      return NextResponse.json({ success: false, error: 'Not an active member' }, { status: 403 })
    }

    const contId = `cont-${chamaId}-${user.id}-${Date.now()}`
    const session = getSession()
    try {
      await session.run(
        `MATCH (u:User {id: $userId}), (c:ChamaGroup {id: $chamaId})
         CREATE (cont:Contribution {
           id: $contId,
           amount: $amount,
           method: $method,
           mpesaRef: $mpesaRef,
           createdAt: datetime()
         })
         CREATE (u)-[:MADE_CONTRIBUTION]->(cont)
         CREATE (cont)-[:CONTRIBUTED_TO]->(c)

         MATCH (u)-[r:BELONGS_TO]->(c)
         SET r.totalContributed = coalesce(r.totalContributed, 0) + $amount

         SET c.totalSavings = coalesce(c.totalSavings, 0) + $amount`,
        { userId: user.id, chamaId, contId, amount: parseFloat(amount), method: method || 'MPESA', mpesaRef: mpesaRef || '' }
      )

      return NextResponse.json({ success: true, contribution: { id: contId, chamaId, amount: parseFloat(amount), method: method || 'MPESA' } })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[chama contributions POST]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

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

function generateMpesaRef(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let ref = 'QE'
  for (let i = 0; i < 8; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)]
  }
  return ref
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken(req)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, method = 'MPESA' } = await req.json()
    const chamaId = params.id

    if (!amount || amount < 100) {
      return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 })
    }

    const session = getSession()
    try {
      const membership = await session.run(
        `MATCH (u:User {id: $userId})-[r:BELONGS_TO]->(c:Chama {id: $chamaId})
         RETURN r`,
        { userId: user.id, chamaId }
      )

      if (membership.records.length === 0) {
        return NextResponse.json({ success: false, error: 'Not a member of this chama' }, { status: 403 })
      }

      const contId = `con-${Date.now()}`
      const mpesaRef = method === 'MPESA' ? generateMpesaRef() : null

      await session.run(
        `MATCH (u:User {id: $userId}), (c:Chama {id: $chamaId})
         CREATE (c:ChamaContribution {
           id: $contId,
           chamaId: $chamaId,
           userId: $userId,
           amount: $amount,
           method: $method,
           mpesaRef: $mpesaRef,
           date: datetime()
         })
         CREATE (u)-[:CONTRIBUTED]->(c)`,
        { userId: user.id, chamaId, contId, amount, method, mpesaRef }
      )

      await session.run(
        `MATCH (u:User {id: $userId})-[r:BELONGS_TO]->(c:Chama {id: $chamaId})
         SET r.totalContributed = coalesce(r.totalContributed, 0) + $amount`,
        { userId: user.id, chamaId, amount }
      )

      await session.run(
        `MATCH (c:Chama {id: $chamaId})
         SET c.totalSavings = coalesce(c.totalSavings, 0) + $amount`,
        { chamaId, amount }
      )

      return NextResponse.json({
        success: true,
        contribution: {
          id: contId,
          chamaId,
          amount,
          method,
          mpesaRef,
          date: new Date().toISOString(),
        },
      })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[chama contribute POST]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken(req)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const chamaId = params.id

    const session = getSession()
    try {
      const result = await session.run(
        `MATCH (c:ChamaContribution {chamaId: $chamaId, userId: $userId})
         RETURN c
         ORDER BY c.date DESC`,
        { chamaId, userId: user.id }
      )

      const contributions = result.records.map(record => {
        const props = record.get('c').properties
        return {
          id: props.id,
          chamaId: props.chamaId,
          amount: props.amount,
          date: props.date ? props.date.toString() : '',
          method: props.method || 'MPESA',
          mpesaRef: props.mpesaRef || undefined,
        }
      })

      return NextResponse.json({ success: true, contributions })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[chama contribute GET]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}
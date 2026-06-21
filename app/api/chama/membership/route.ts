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

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const session = getSession()
    try {
      const result = await session.run(
        `MATCH (u:User {id: $userId})-[r:BELONGS_TO]->(c:Chama)
         RETURN r, c.id AS chamaId, c.name AS chamaName
         ORDER BY r.joinedAt DESC`,
        { userId: user.id }
      )

      const memberships = result.records.map(record => {
        const rel = record.get('r').properties
        return {
          id: rel.id || `mem-${record.get('chamaId')}-${user.id}`,
          userId: user.id,
          chamaId: record.get('chamaId'),
          chamaName: record.get('chamaName'),
          status: rel.status || 'PENDING',
          totalContributed: rel.totalContributed || 0,
          joinedAt: rel.joinedAt ? rel.joinedAt.toString() : '',
        }
      })

      return NextResponse.json({ success: true, memberships })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[chama membership GET]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { chamaId } = await req.json()

    if (!chamaId) {
      return NextResponse.json({ success: false, error: 'Missing chamaId' }, { status: 400 })
    }

    const session = getSession()
    try {
      const existing = await session.run(
        `MATCH (u:User {id: $userId})-[r:BELONGS_TO]->(c:Chama {id: $chamaId})
         RETURN r`,
        { userId: user.id, chamaId }
      )

      if (existing.records.length > 0) {
        return NextResponse.json({ success: false, error: 'Already a member or pending' }, { status: 409 })
      }

      const memId = `mem-${chamaId}-${user.id}`

      await session.run(
        `MATCH (u:User {id: $userId}), (c:Chama {id: $chamaId})
         CREATE (u)-[r:BELONGS_TO]->(c)
         SET r.id = $memId, r.status = 'PENDING', r.totalContributed = 0, r.joinedAt = datetime()`,
        { userId: user.id, chamaId, memId }
      )

      return NextResponse.json({
        success: true,
        membership: { id: memId, userId: user.id, chamaId, status: 'PENDING', totalContributed: 0 },
      })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[chama membership POST]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}
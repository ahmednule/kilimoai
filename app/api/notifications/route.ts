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
    const user = await getUserFromToken(req)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const unreadOnly = searchParams.get('unread') === 'true'

    const session = getSession()
    try {
      let query = `
        MATCH (u:User {id: $userId})-[:HAS_NOTIFICATION]->(n:Notification)
        RETURN n
        ORDER BY n.createdAt DESC
      `
      if (unreadOnly) {
        query = `
          MATCH (u:User {id: $userId})-[:HAS_NOTIFICATION]->(n:Notification)
          WHERE n.read = false
          RETURN n
          ORDER BY n.createdAt DESC
        `
      }

      const result = await session.run(query, { userId: user.id })
      const notifications = result.records.map(r => {
        const props = r.get('n').properties
        return {
          id: props.id,
          userId: props.userId,
          type: props.type,
          title: props.title,
          body: props.body,
          read: props.read === true,
          createdAt: props.createdAt ? props.createdAt.toString() : '',
        }
      })

      return NextResponse.json({ success: true, notifications })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[notifications GET]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { notificationId } = await req.json()
    if (!notificationId) {
      return NextResponse.json({ success: false, error: 'notificationId is required' }, { status: 400 })
    }

    const session = getSession()
    try {
      await session.run(
        `MATCH (u:User {id: $userId})-[:HAS_NOTIFICATION]->(n:Notification {id: $notificationId})
         SET n.read = true
         RETURN n`,
        { userId: user.id, notificationId }
      )

      return NextResponse.json({ success: true })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[notifications PATCH]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

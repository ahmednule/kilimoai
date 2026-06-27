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
    const agent = await getUserFromToken(req)
    if (!agent) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (agent.role !== 'agent') return NextResponse.json({ success: false, error: 'Agent role required' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const statusFilter = searchParams.get('status') || 'all'

    const session = getSession()
    try {
      let query = `
        MATCH (agent:User {id: $agentId})-[:SCHEDULED]->(s:VisitSchedule)
        OPTIONAL MATCH (farmer:User {id: s.farmerId})
        RETURN s,
               farmer.name AS farmerName,
               farmer.phone AS farmerPhone,
               farmer.email AS farmerEmail
        ORDER BY s.date ASC, s.time ASC
      `
      if (statusFilter !== 'all') {
        query = `
          MATCH (agent:User {id: $agentId})-[:SCHEDULED]->(s:VisitSchedule)
          WHERE s.status = $statusFilter
          OPTIONAL MATCH (farmer:User {id: s.farmerId})
          RETURN s,
                 farmer.name AS farmerName,
                 farmer.phone AS farmerPhone,
                 farmer.email AS farmerEmail
          ORDER BY s.date ASC, s.time ASC
        `
      }

      const result = await session.run(query, { agentId: agent.id, statusFilter })

      const schedules = result.records.map(r => {
        const props = r.get('s').properties
        return {
          id: props.id,
          agentId: props.agentId,
          farmerId: props.farmerId,
          farmerName: props.farmerName || r.get('farmerName') || '',
          farmerPhone: r.get('farmerPhone') || '',
          farmerEmail: r.get('farmerEmail') || '',
          county: props.county || '',
          crop: props.crop || '',
          date: props.date || '',
          time: props.time || '',
          notes: props.notes || '',
          status: props.status || 'pending',
          createdAt: props.createdAt ? props.createdAt.toString() : '',
        }
      })

      return NextResponse.json({ success: true, schedules })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[agent schedules GET]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const agent = await getUserFromToken(req)
    if (!agent) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (agent.role !== 'agent') return NextResponse.json({ success: false, error: 'Agent role required' }, { status: 403 })

    const { farmerId, farmerName, county, crop, date, time, notes } = await req.json()
    if (!farmerId || !date || !time) {
      return NextResponse.json({ success: false, error: 'farmerId, date, and time are required' }, { status: 400 })
    }

    const id = `vs-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const createdAt = new Date().toISOString()

    const session = getSession()
    try {
      // Verify farmer exists
      const farmerCheck = await session.run(
        `MATCH (farmer:User {id: $farmerId}) RETURN farmer`,
        { farmerId }
      )
      if (farmerCheck.records.length === 0) {
        return NextResponse.json({ success: false, error: 'Farmer not found' }, { status: 404 })
      }

      // Create schedule
      await session.run(
        `MATCH (agent:User {id: $agentId}), (farmer:User {id: $farmerId})
         CREATE (s:VisitSchedule {
           id: $id,
           agentId: $agentId,
           farmerId: $farmerId,
           farmerName: $farmerName,
           county: $county,
           crop: $crop,
           date: $date,
           time: $time,
           notes: $notes,
           status: 'pending',
           createdAt: $createdAt
         })
         CREATE (agent)-[:SCHEDULED]->(s)
         MERGE (agent)-[:SUPERVISES]->(farmer)
         RETURN s`,
        { agentId: agent.id, farmerId, farmerName: farmerName || '', county: county || '', crop: crop || '', date, time, notes: notes || '', id, createdAt }
      )

      // Create notification for farmer
      await session.run(
        `MATCH (farmer:User {id: $farmerId})
         CREATE (n:Notification {
           id: $notifId,
           userId: $farmerId,
           type: 'schedule_visit',
           title: $notifTitle,
           body: $notifBody,
           read: false,
           createdAt: $createdAt
         })
         CREATE (farmer)-[:HAS_NOTIFICATION]->(n)`,
        {
          farmerId,
          notifId: `notif-${id}`,
          notifTitle: 'Field Visit Scheduled',
          notifBody: `Agent ${agent.name} has scheduled a field visit on ${date} at ${time}.${notes ? ' Note: ' + notes : ''}`,
          createdAt,
        }
      )

      return NextResponse.json({ success: true, id })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[agent schedules POST]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const agent = await getUserFromToken(req)
    if (!agent) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (agent.role !== 'agent') return NextResponse.json({ success: false, error: 'Agent role required' }, { status: 403 })

    const { scheduleId, status } = await req.json()
    if (!scheduleId || !status) {
      return NextResponse.json({ success: false, error: 'scheduleId and status are required' }, { status: 400 })
    }
    if (!['confirmed', 'completed'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Status must be confirmed or completed' }, { status: 400 })
    }

    const session = getSession()
    try {
      const result = await session.run(
        `MATCH (agent:User {id: $agentId})-[:SCHEDULED]->(s:VisitSchedule {id: $scheduleId})
         SET s.status = $status
         RETURN s`,
        { agentId: agent.id, scheduleId, status }
      )

      if (result.records.length === 0) {
        return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 })
      }

      return NextResponse.json({ success: true, message: `Schedule ${status}` })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[agent schedules PATCH]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

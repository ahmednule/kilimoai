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
    const relRole = record.get('roleName')
    user.role = relRole || user.role || null
    return user
  } finally {
    await session.close()
  }
}

export async function POST(req: NextRequest) {
  try {
    const agent = await getUserFromToken(req)
    if (!agent) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (agent.role !== 'agent') {
      return NextResponse.json({ success: false, error: 'Agent role required' }, { status: 403 })
    }

    const { farmerId, discrepancies, notes } = await req.json()

    if (!farmerId) {
      return NextResponse.json({ success: false, error: 'farmerId is required' }, { status: 400 })
    }

    if (!discrepancies || !Array.isArray(discrepancies) || discrepancies.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one discrepancy is required' }, { status: 400 })
    }

    const session = getSession()
    try {
      // Ensure farmer exists and has 'farmer' role
      const farmerCheck = await session.run(
        `MATCH (farmer:User {id: $farmerId})-[:HAS_ROLE]->(:Role {name: 'farmer'})
         RETURN farmer`,
        { farmerId }
      )
      if (farmerCheck.records.length === 0) {
        return NextResponse.json({ success: false, error: 'Farmer not found' }, { status: 404 })
      }

      const reportId = `vr-${farmerId}-${Date.now()}`

      await session.run(
        `MATCH (agent:User {id: $agentId}), (farmer:User {id: $farmerId})
         MERGE (agent)-[:SUPERVISES]->(farmer)
         CREATE (vr:VerificationReport {
           id: $reportId,
           farmerId: $farmerId,
           agentId: $agentId,
           status: 'flagged',
           discrepancies: $discrepancies,
           notes: $notes,
           visitedAt: datetime()
         })
         CREATE (agent)-[:CONDUCTED_VERIFICATION]->(vr)
         CREATE (farmer)-[:HAS_VERIFICATION]->(vr)`,
        { agentId: agent.id, farmerId, reportId, discrepancies, notes: notes || '' }
      )

      return NextResponse.json({
        success: true,
        message: 'Farmer flagged with discrepancies',
        reportId,
        discrepancies,
      })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[agent flag]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const session = getSession()

    const result = await session.run(
      `MATCH (u:User {sessionToken: $token})
       OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
       OPTIONAL MATCH (u)-[:LOCATED_IN]->(co:County)
       RETURN u, r.name AS roleName, co.name AS countyName`,
      { token }
    )

    await session.close()

    if (result.records.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid or expired session' }, { status: 401 })
    }

    const record = result.records[0]
    const user = record.get('u').properties

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: record.get('roleName'),
        county: record.get('countyName'),
      }
    })
  } catch (err: any) {
    console.error('[session]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

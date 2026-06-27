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

export async function GET(req: NextRequest) {
  try {
    const lender = await getUserFromToken(req)
    if (!lender) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (lender.role !== 'lender') {
      return NextResponse.json({ success: false, error: 'Lender role required' }, { status: 403 })
    }

    const session = getSession()
    try {
      const result = await session.run(`
        MATCH (farmer:User)-[:HAS_ROLE]->(:Role {name: 'farmer'})
        WHERE farmer.verified = true
        OPTIONAL MATCH (farmer)-[:GROWS]->(c:Crop)
        OPTIONAL MATCH (farmer)-[:LOCATED_IN]->(co:County)
        OPTIONAL MATCH (farmer)-[:APPLIED_FOR]->(l:Loan)
        OPTIONAL MATCH (farmer)-[:MEMBER_OF]->(cg:ChamaGroup)
        RETURN farmer,
               collect(DISTINCT c.name) AS crops,
               co.name AS countyName,
               collect(DISTINCT l {.id, .amount, .status}) AS loans,
               cg.name AS chamaName
        ORDER BY farmer.name
      `)

      const farmers = result.records.map(r => {
        const f = r.get('farmer').properties
        const crops = r.get('crops') || []
        const loans = r.get('loans') || []
        return {
          id: f.id,
          name: f.name,
          phone: f.phone || '',
          county: r.get('countyName') || '',
          crops,
          acreage: f.acreage || 0,
          creditScore: f.creditScore || 0,
          language: f.language || 'en',
          hasChama: !!r.get('chamaName'),
          chamaName: r.get('chamaName') || null,
          verified: true,
        }
      })

      return NextResponse.json({
        success: true,
        farmers,
        total: farmers.length,
      })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[lender farmers]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

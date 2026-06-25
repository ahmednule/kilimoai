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
    user.role = record.get('roleName')
    return user
  } finally {
    await session.close()
  }
}

export async function GET(req: NextRequest) {
  try {
    const agent = await getUserFromToken(req)
    if (!agent) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (agent.role !== 'agent') {
      return NextResponse.json({ success: false, error: 'Agent role required' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const statusFilter = searchParams.get('status') || 'all'

    const session = getSession()
    try {
      let query = `
        MATCH (agent:User {id: $agentId})-[:SUPERVISES]->(farmer:User)
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
      `

      if (statusFilter === 'pending') {
        query = `
          MATCH (agent:User {id: $agentId})-[:SUPERVISES]->(farmer:User)
          WHERE farmer.verified <> true OR farmer.verified IS NULL
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
        `
      } else if (statusFilter === 'verified') {
        query = `
          MATCH (agent:User {id: $agentId})-[:SUPERVISES]->(farmer:User)
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
        `
      } else if (statusFilter === 'flagged') {
        query = `
          MATCH (agent:User {id: $agentId})-[:SUPERVISES]->(farmer:User)
          OPTIONAL MATCH (vr:VerificationReport {farmerId: farmer.id, status: 'flagged'})
          WHERE vr IS NOT NULL
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
        `
      }

      const result = await session.run(query, { agentId: agent.id })

      const farmers = result.records.map(r => {
        const f = r.get('farmer').properties
        const crops = r.get('crops') || []
        const loans = r.get('loans') || []
        const activeLoan = loans.find((l: any) => l?.status === 'pending_verification' || l?.status === 'pending')
        return {
          id: f.id,
          name: f.name,
          phone: f.phone || '',
          county: r.get('countyName') || '',
          crops,
          acreage: f.acreage || 0,
          loanAmount: activeLoan?.amount || f.loanAmount || 0,
          status: f.verified === true ? 'verified' : 'pending',
          creditScore: f.creditScore || 0,
          language: f.language || 'en',
          hasChama: !!r.get('chamaName'),
          chamaName: r.get('chamaName') || null,
        }
      })

      // Determine status for stats
      const total = farmers.length
      const pending = farmers.filter(f => f.status === 'pending').length
      const verified = farmers.filter(f => f.status === 'verified').length

      return NextResponse.json({
        success: true,
        farmers,
        stats: { total, pending, verified },
      })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[agent farmers]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

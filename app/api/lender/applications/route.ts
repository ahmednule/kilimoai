import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

function getToken(req: NextRequest): string {
  const header = req.headers.get('authorization') || ''
  return header.startsWith('Bearer ') ? header.slice(7) : ''
}

export async function GET(req: NextRequest) {
  try {
    const token = getToken(req)
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const neo4jSession = getSession()
    const userResult = await neo4jSession.run(
      'MATCH (u:User {sessionToken: $token}) RETURN u',
      { token }
    )

    if (userResult.records.length === 0) {
      await neo4jSession.close()
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const user = userResult.records[0].get('u').properties
    const { searchParams } = new URL(req.url)
    const farmerId = searchParams.get('farmerId')

    let query: string
    let params: Record<string, any>

    if (farmerId) {
      query = `MATCH (fp:FarmerProfile {id: $farmerId})-[:HAS_LOAN]->(la:LoanApplication)
               OPTIONAL MATCH (fp)-[:MEMBER_OF]->(ch:ChamaGroup)
               RETURN la, fp.creditScore as creditScore, fp.totalBorrowed as totalBorrowed,
                      fp.totalRepaid as totalRepaid, fp.activeLoans as activeLoans,
                      fp.defaulted as defaulted, fp.joinDate as joinDate, fp.acres as farmAcres,
                      ch.name as chamaName
               ORDER BY la.date DESC`
      params = { farmerId }
    } else if (user.role === 'lender' || user.role === 'admin') {
      query = `MATCH (fp:FarmerProfile)-[:HAS_LOAN]->(la:LoanApplication)
               OPTIONAL MATCH (fp)-[:MEMBER_OF]->(ch:ChamaGroup)
               RETURN la, fp.creditScore as creditScore, fp.totalBorrowed as totalBorrowed,
                      fp.totalRepaid as totalRepaid, fp.activeLoans as activeLoans,
                      fp.defaulted as defaulted, fp.joinDate as joinDate, fp.acres as farmAcres,
                      ch.name as chamaName
               ORDER BY la.date DESC`
      params = {}
    } else if (user.role === 'farmer') {
      query = `MATCH (u:User {id: $userId})-[:HAS_PROFILE]->(fp:FarmerProfile)-[:HAS_LOAN]->(la:LoanApplication)
               OPTIONAL MATCH (fp)-[:MEMBER_OF]->(ch:ChamaGroup)
               RETURN la, fp.creditScore as creditScore, fp.totalBorrowed as totalBorrowed,
                      fp.totalRepaid as totalRepaid, fp.activeLoans as activeLoans,
                      fp.defaulted as defaulted, fp.joinDate as joinDate, fp.acres as farmAcres,
                      ch.name as chamaName
               ORDER BY la.date DESC`
      params = { userId: user.id }
    } else {
      await neo4jSession.close()
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const result = await neo4jSession.run(query, params)
    await neo4jSession.close()

    const applications = result.records.map(r => {
      const la = r.get('la').properties
      const creditScore = parseFloat(r.get('creditScore')) || 50
      const status = (la.status || 'pending').toUpperCase()
      const normalizedStatus = status === 'DISBURSED' ? 'APPROVED' : status
      const totalBorrowed = parseFloat(r.get('totalBorrowed')) || 0
      const totalRepaid = parseFloat(r.get('totalRepaid')) || 0
      const activeLoansCount = parseInt(r.get('activeLoans')) || 0
      const hasDefaulted = r.get('defaulted') === true

      return {
        id: la.id,
        farmerId: la.farmerId,
        farmerName: la.farmerName,
        county: la.county,
        crop: la.crop,
        acres: parseFloat(la.acres) || 0,
        loanAmount: parseFloat(la.amount) || 0,
        riskLevel: (la.riskLevel || 'UNKNOWN').toUpperCase(),
        riskScore: 100 - creditScore,
        status: normalizedStatus,
        appliedAt: la.date,
        farmAcres: parseFloat(r.get('farmAcres')) || parseFloat(la.acres) || 0,
        totalBorrowed,
        totalRepaid,
        activeLoansCount,
        hasDefaulted,
        chamaName: r.get('chamaName') || null,
      }
    })

    return NextResponse.json({ success: true, applications })
  } catch (err: any) {
    console.error('[lender/applications GET]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

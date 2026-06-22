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

    const session = getSession()
    const userResult = await session.run(
      'MATCH (u:User {sessionToken: $token}) RETURN u',
      { token }
    )

    if (userResult.records.length === 0) {
      await session.close()
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const user = userResult.records[0].get('u').properties
    const { searchParams } = new URL(req.url)
    const farmerId = searchParams.get('farmerId')

    let query: string
    let params: Record<string, string>

    if (farmerId) {
      query = `MATCH (fp:FarmerProfile {id: $farmerId})-[:HAS_ASSESSMENT]->(a:Assessment)
               RETURN a ORDER BY a.date DESC`
      params = { farmerId }
    } else if (user.role === 'agent' || user.role === 'lender' || user.role === 'admin') {
      query = `MATCH (a:Assessment)
               RETURN a ORDER BY a.date DESC`
      params = {}
    } else {
      query = `MATCH (u:User {id: $userId})-[:HAS_PROFILE]->(fp:FarmerProfile)-[:HAS_ASSESSMENT]->(a:Assessment)
               RETURN a ORDER BY a.date DESC`
      params = { userId: user.id }
    }

    const result = await session.run(query, params)
    await session.close()

    const assessments = result.records.map(r => {
      const a = r.get('a').properties
      return {
        id: a.id,
        farmerId: a.farmerId,
        date: a.date,
        crop: a.crop,
        acres: a.acres,
        loanAmount: a.loanAmount,
        riskLevel: a.riskLevel,
        expectedYield: a.expectedYield,
        expectedRevenue: a.expectedRevenue,
        rainfall: a.rainfall,
      }
    })

    return NextResponse.json({ success: true, assessments })
  } catch (err: any) {
    console.error('[assessments GET]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getToken(req)
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const session = getSession()
    const userResult = await session.run(
      'MATCH (u:User {sessionToken: $token}) RETURN u',
      { token }
    )

    if (userResult.records.length === 0) {
      await session.close()
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const user = userResult.records[0].get('u').properties

    const {
      farmerId, farmerName, county, crop, acres,
      loanAmount, riskLevel, expectedYield, expectedRevenue, rainfall,
      verdict, scenarios,
    } = await req.json()

    const id = `as-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    const date = new Date().toISOString().split('T')[0]

    await session.run(
      `CREATE (a:Assessment {
        id: $id,
        farmerId: $farmerId,
        farmerName: $farmerName,
        date: $date,
        crop: $crop,
        acres: $acres,
        loanAmount: $loanAmount,
        riskLevel: $riskLevel,
        expectedYield: $expectedYield,
        expectedRevenue: $expectedRevenue,
        rainfall: $rainfall,
        verdict: $verdict,
        scenarios: $scenarios,
        createdAt: datetime()
      })`,
      {
        id,
        farmerId,
        farmerName,
        date,
        crop,
        acres: parseFloat(acres) || 0,
        loanAmount: parseFloat(loanAmount) || 0,
        riskLevel,
        expectedYield: parseFloat(expectedYield) || 0,
        expectedRevenue: parseFloat(expectedRevenue) || 0,
        rainfall: rainfall || '',
        verdict: verdict || '',
        scenarios: JSON.stringify(scenarios || {}),
      }
    )

    await session.run(
      `MATCH (fp:FarmerProfile {id: $farmerId}), (a:Assessment {id: $id})
       MERGE (fp)-[:HAS_ASSESSMENT]->(a)`,
      { farmerId, id }
    )

    await session.close()

    const assessment = {
      id, farmerId, farmerName, date, crop, acres,
      loanAmount, riskLevel, expectedYield, expectedRevenue,
      rainfall, verdict, scenarios,
    }

    return NextResponse.json({ success: true, assessment })
  } catch (err: any) {
    console.error('[assessments POST]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = getToken(req)
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const session = getSession()
    const userResult = await session.run(
      'MATCH (u:User {sessionToken: $token}) RETURN u',
      { token }
    )

    if (userResult.records.length === 0) {
      await session.close()
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id, status, notes, adjustedLoan } = await req.json()

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Missing id or status' }, { status: 400 })
    }

    const setClauses = ['a.status = $status']
    const params: Record<string, any> = { id, status }

    if (notes !== undefined) {
      setClauses.push('a.agentNotes = $notes')
      params.notes = notes
    }
    if (adjustedLoan !== undefined) {
      setClauses.push('a.adjustedLoan = $adjustedLoan')
      params.adjustedLoan = adjustedLoan
    }

    await session.run(
      `MATCH (a:Assessment {id: $id}) SET ${setClauses.join(', ')}`,
      params
    )

    await session.close()

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[assessments PATCH]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

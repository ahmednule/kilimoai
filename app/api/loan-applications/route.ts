import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId') || ''

    const session = getSession()
    try {
      let query = `
        MATCH (la:LoanApplication)
        OPTIONAL MATCH (u:User)-[:HAS_PROFILE]->(:FarmerProfile)-[:HAS_LOAN]->(la)
        RETURN la,
               u.id AS userId, u.name AS userName, u.email AS userEmail, u.phone AS userPhone
        ORDER BY la.date DESC
      `
      const params: Record<string, any> = {}
      if (productId) {
        query = `
          MATCH (la:LoanApplication {productId: $productId})
          OPTIONAL MATCH (u:User)-[:HAS_PROFILE]->(:FarmerProfile)-[:HAS_LOAN]->(la)
          RETURN la,
                 u.id AS userId, u.name AS userName, u.email AS userEmail, u.phone AS userPhone
          ORDER BY la.date DESC
        `
        params.productId = productId
      }

      const result = await session.run(query, params)
      const applications = result.records.map(r => {
        const props = r.get('la').properties
        return {
          id: props.id,
          productId: props.productId || '',
          farmerId: props.farmerId || '',
          farmerName: props.farmerName || r.get('userName') || '',
          farmerEmail: r.get('userEmail') || '',
          farmerPhone: r.get('userPhone') || '',
          amount: props.amount ? props.amount.toNumber() : 0,
          status: props.status || 'pending',
          date: props.date ? props.date.toString() : '',
          county: props.county || '',
          crop: props.crop || '',
          acres: props.acres ? props.acres.toNumber() : 0,
          riskLevel: props.riskLevel || 'UNKNOWN',
        }
      })

      return NextResponse.json({ success: true, applications })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[loan-applications GET]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, farmerId, farmerName, amount, county, crop, acres, riskLevel } = body

    if (!productId || !farmerId || !amount) {
      return NextResponse.json({ success: false, error: 'productId, farmerId, and amount are required' }, { status: 400 })
    }

    const id = `la-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const today = new Date().toISOString().split('T')[0]

    const session = getSession()
    try {
      await session.run(`
        MATCH (fp:FarmerProfile {id: $farmerId})
        CREATE (la:LoanApplication {
          id: $id,
          productId: $productId,
          farmerId: $farmerId,
          farmerName: $farmerName,
          amount: $amount,
          status: 'pending',
          date: $today,
          county: $county,
          crop: $crop,
          acres: $acres,
          riskLevel: $riskLevel
        })
        CREATE (fp)-[:HAS_LOAN]->(la)
        RETURN la
      `, { id, productId, farmerId, farmerName: farmerName || '', amount, today, county: county || '', crop: crop || '', acres: acres || 0, riskLevel: riskLevel || 'UNKNOWN' })

      return NextResponse.json({ success: true, id })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[loan-applications POST]', err.message || err)
    if (err.message?.includes('MATCH')) {
      return NextResponse.json({ success: false, error: 'Farmer profile not found. Please set up your profile first.' }, { status: 404 })
    }
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

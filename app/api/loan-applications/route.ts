import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId') || ''
    const farmerId = searchParams.get('farmerId') || ''

    const session = getSession()
    try {
      const params: Record<string, any> = {}
      let where = ''
      if (productId) { where = 'WHERE la.productId = $productId'; params.productId = productId }
      if (farmerId) { where = 'WHERE la.farmerId = $farmerId'; params.farmerId = farmerId }

      const result = await session.run(`
        MATCH (la:LoanApplication)
        ${where}
        RETURN la
        ORDER BY la.date DESC
      `, params)

      const applications = result.records.map(r => {
        const props = r.get('la').properties
        return {
          id: props.id,
          productId: props.productId || '',
          farmerId: props.farmerId || '',
          farmerName: props.farmerName || '',
          amount: props.amount ? Number(props.amount) : 0,
          status: props.status || 'pending',
          date: props.date ? props.date.toString() : '',
          county: props.county || '',
          crop: props.crop || '',
          acres: props.acres ? Number(props.acres) : 0,
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
      // Find User with farmer role
      const userCheck = await session.run(
        `MATCH (u:User {id: $farmerId})-[:HAS_ROLE]->(:Role {name: 'farmer'})
         RETURN u`,
        { farmerId }
      )
      if (userCheck.records.length === 0) {
        return NextResponse.json({ success: false, error: 'Farmer not found' }, { status: 404 })
      }

      await session.run(`
        MATCH (u:User {id: $farmerId})
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
        CREATE (u)-[:APPLIED_FOR]->(la)
        RETURN la
      `, { id, productId, farmerId, farmerName: farmerName || '', amount, today, county: county || '', crop: crop || '', acres: acres || 0, riskLevel: riskLevel || 'UNKNOWN' })

      return NextResponse.json({ success: true, id })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[loan-applications POST]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

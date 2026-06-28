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

function toNum(v: any): number {
  if (v === null || v === undefined) return 0
  if (typeof v.toNumber === 'function') return v.toNumber()
  return Number(v)
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const createdBy = searchParams.get('createdBy') || ''

    const session = getSession()
    try {
      const whereClause = createdBy ? 'WHERE p.createdBy = $createdBy' : ''
      const result = await session.run(`
        MATCH (p:LoanProduct)
        ${whereClause}
        RETURN p ORDER BY p.minAmount ASC
      `, { createdBy })

      const products = result.records.map(r => {
        const props = r.get('p').properties
        return {
          id: props.id,
          name: props.name,
          provider: props.provider,
          minAmount: toNum(props.minAmount),
          maxAmount: toNum(props.maxAmount),
          interestRate: toNum(props.interestRate),
          tenureMonths: toNum(props.tenureMonths),
          eligibility: props.eligibility || '',
          description: props.description || '',
          category: props.category || '',
          createdBy: props.createdBy || '',
        }
      })
      return NextResponse.json({ success: true, products })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[loan-products GET]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'lender') return NextResponse.json({ success: false, error: 'Lenders only' }, { status: 403 })

    const body = await req.json()
    const { name, provider, minAmount, maxAmount, interestRate, tenureMonths, eligibility, description, category } = body

    if (!name || !provider) {
      return NextResponse.json({ success: false, error: 'Name and provider are required' }, { status: 400 })
    }

    const id = `lp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

    const session = getSession()
    try {
      await session.run(`
        MATCH (lender:User {id: $lenderId})
        CREATE (p:LoanProduct {
          id: $id, name: $name, provider: $provider,
          minAmount: $minAmount, maxAmount: $maxAmount,
          interestRate: $interestRate, tenureMonths: $tenureMonths,
          eligibility: $eligibility, description: $description,
          category: $category, createdBy: $lenderId
        })
        CREATE (lender)-[:CREATED]->(p)
      `, {
        lenderId: user.id, id,
        name, provider,
        minAmount: minAmount || 0, maxAmount: maxAmount || 0,
        interestRate: interestRate || 0, tenureMonths: tenureMonths || 0,
        eligibility: eligibility || '', description: description || '', category: category || '',
      })

      return NextResponse.json({ success: true, id })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[loan-products POST]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'lender') return NextResponse.json({ success: false, error: 'Lenders only' }, { status: 403 })

    const body = await req.json()
    const { id, name, provider, minAmount, maxAmount, interestRate, tenureMonths, eligibility, description, category } = body

    if (!id) return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 })

    const session = getSession()
    try {
      const result = await session.run(
        'MATCH (p:LoanProduct {id: $id}) RETURN p.createdBy AS createdBy',
        { id }
      )
      if (result.records.length === 0) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
      }
      if (result.records[0].get('createdBy') !== user.id) {
        return NextResponse.json({ success: false, error: 'Not your product' }, { status: 403 })
      }

      const sets: string[] = []
      const params: Record<string, any> = { id }
      if (name !== undefined) { sets.push('p.name = $name'); params.name = name }
      if (provider !== undefined) { sets.push('p.provider = $provider'); params.provider = provider }
      if (minAmount !== undefined) { sets.push('p.minAmount = $minAmount'); params.minAmount = minAmount }
      if (maxAmount !== undefined) { sets.push('p.maxAmount = $maxAmount'); params.maxAmount = maxAmount }
      if (interestRate !== undefined) { sets.push('p.interestRate = $interestRate'); params.interestRate = interestRate }
      if (tenureMonths !== undefined) { sets.push('p.tenureMonths = $tenureMonths'); params.tenureMonths = tenureMonths }
      if (eligibility !== undefined) { sets.push('p.eligibility = $eligibility'); params.eligibility = eligibility }
      if (description !== undefined) { sets.push('p.description = $description'); params.description = description }
      if (category !== undefined) { sets.push('p.category = $category'); params.category = category }

      if (sets.length === 0) return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })

      await session.run(`MATCH (p:LoanProduct {id: $id}) SET ${sets.join(', ')}`, params)

      return NextResponse.json({ success: true })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[loan-products PATCH]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'lender') return NextResponse.json({ success: false, error: 'Lenders only' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 })

    const session = getSession()
    try {
      const result = await session.run(
        'MATCH (p:LoanProduct {id: $id}) RETURN p.createdBy AS createdBy',
        { id }
      )
      if (result.records.length === 0) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
      }
      if (result.records[0].get('createdBy') !== user.id) {
        return NextResponse.json({ success: false, error: 'Not your product' }, { status: 403 })
      }

      await session.run(
        'MATCH (p:LoanProduct {id: $id}) DETACH DELETE p',
        { id }
      )

      return NextResponse.json({ success: true })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[loan-products DELETE]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

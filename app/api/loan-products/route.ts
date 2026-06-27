import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

export async function GET() {
  try {
    const session = getSession()
    try {
      const result = await session.run(`
        MATCH (p:LoanProduct)
        RETURN p ORDER BY p.minAmount ASC
      `)
      const products = result.records.map(r => {
        const props = r.get('p').properties
        return {
          id: props.id,
          name: props.name,
          provider: props.provider,
          minAmount: props.minAmount ? props.minAmount.toNumber() : 0,
          maxAmount: props.maxAmount ? props.maxAmount.toNumber() : 0,
          interestRate: props.interestRate ? props.interestRate.toNumber() : 0,
          tenureMonths: props.tenureMonths ? props.tenureMonths.toNumber() : 0,
          eligibility: props.eligibility || '',
          description: props.description || '',
          category: props.category || '',
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
    const body = await req.json()
    const { name, provider, minAmount, maxAmount, interestRate, tenureMonths, eligibility, description, category } = body

    if (!name || !provider) {
      return NextResponse.json({ success: false, error: 'Name and provider are required' }, { status: 400 })
    }

    const id = `lp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

    const session = getSession()
    try {
      await session.run(`
        CREATE (p:LoanProduct {
          id: $id,
          name: $name,
          provider: $provider,
          minAmount: $minAmount,
          maxAmount: $maxAmount,
          interestRate: $interestRate,
          tenureMonths: $tenureMonths,
          eligibility: $eligibility,
          description: $description,
          category: $category
        })
        RETURN p
      `, { id, name, provider, minAmount: minAmount || 0, maxAmount: maxAmount || 0, interestRate: interestRate || 0, tenureMonths: tenureMonths || 0, eligibility: eligibility || '', description: description || '', category: category || '' })

      return NextResponse.json({ success: true, id })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[loan-products POST]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

export async function GET(req: NextRequest) {
  try {
    const session = getSession()
    try {
      const result = await session.run(`
        MATCH (o:Order)
        OPTIONAL MATCH (u:User {id: o.buyerId})
        RETURN o, u.name AS buyerName
        ORDER BY o.date DESC
      `)

      const orders = result.records.map(r => {
        const p = r.get('o').properties
        return {
          id: p.id,
          listingId: p.listingId || '',
          buyerId: p.buyerId || '',
          buyerName: r.get('buyerName') || p.buyerName || '',
          seller: p.seller || '',
          crop: p.crop || '',
          quantity: p.quantity || 0,
          price: p.price || 0,
          total: p.total || 0,
          county: p.county || '',
          status: p.status || 'PENDING',
          date: p.date ? p.date.toString() : '',
        }
      })

      return NextResponse.json({ success: true, orders })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[marketplace orders GET]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { listingId, buyerId, buyerName, seller, crop, quantity, price, county } = await req.json()

    if (!listingId || !buyerId || !crop || !quantity || !price) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const session = getSession()
    try {
      const orderId = `ord-${Date.now()}`
      const total = quantity * price
      const date = new Date().toISOString()

      await session.run(`
        CREATE (o:Order {
          id: $id,
          listingId: $listingId,
          buyerId: $buyerId,
          buyerName: $buyerName,
          seller: $seller,
          crop: $crop,
          quantity: $quantity,
          price: $price,
          total: $total,
          county: $county,
          status: 'PENDING',
          date: $date
        })
      `, { id: orderId, listingId, buyerId, buyerName: buyerName || '', seller: seller || '', crop, quantity: Number(quantity), price: Number(price), total, county: county || '', date })

      return NextResponse.json({
        success: true,
        order: { id: orderId, listingId, buyerId, crop, quantity, price, total, status: 'PENDING', date },
      })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[marketplace orders POST]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

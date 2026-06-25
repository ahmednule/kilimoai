import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const county = searchParams.get('county') || ''
    const crop = searchParams.get('crop') || ''
    const status = searchParams.get('status') || 'active'

    const session = getSession()
    try {
      const conditions: string[] = ["l.status = $status"]
      const params: Record<string, any> = { status }
      if (county) { conditions.push('l.county = $county'); params.county = county }
      if (crop) { conditions.push('toLower(l.crop) CONTAINS toLower($crop)'); params.crop = crop }

      const result = await session.run(`
        MATCH (l:MarketListing)
        WHERE ${conditions.join(' AND ')}
        RETURN l
        ORDER BY l.date DESC
      `, params)

      const listings = result.records.map(r => {
        const p = r.get('l').properties
        return {
          id: p.id,
          crop: p.crop,
          quantity: p.quantity || 0,
          unit: p.unit || 'bags',
          price: p.pricePerUnit || 0,
          seller: p.seller || '',
          county: p.county || '',
          quality: p.quality || 'Grade 1',
          available: p.available || p.date ? new Date(p.date.toString()).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' }) : '',
          status: p.status || 'active',
          date: p.date ? p.date.toString() : '',
        }
      })

      return NextResponse.json({ success: true, listings })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[marketplace listings GET]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

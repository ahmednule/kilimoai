import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

export async function GET(req: NextRequest) {
  try {
    const session = getSession()

    const result = await session.run(
      `MATCH (s:PestScan) RETURN s ORDER BY s.date DESC`
    )

    await session.close()

    const scans = result.records.map(r => {
      const s = r.get('s').properties
      return {
        id: s.id,
        pest: s.pest,
        confidence: s.confidence,
        recommendation: s.recommendation,
        severity: s.severity,
        date: s.date,
        crop: s.crop || null,
        location: s.location || null,
      }
    })

    return NextResponse.json({ success: true, scans })
  } catch (err: any) {
    console.error('[pest-check history GET]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

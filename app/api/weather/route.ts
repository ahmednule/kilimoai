import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

function getSeason(): string {
  const m = new Date().getMonth() + 1
  if (m >= 3 && m <= 5) return 'Long rains season'
  if (m >= 10 && m <= 12) return 'Short rains season'
  return 'Dry season'
}

function fmt(d: Date): string {
  return d.toISOString().split('T')[0]
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const county = searchParams.get('county')

    if (!county) {
      return NextResponse.json({ success: false, error: 'county parameter required' }, { status: 400 })
    }

    const session = getSession()
    let lat: number, lng: number

    try {
      // Look up county coords from Neo4j (all 47 counties are seeded)
      const coordsResult = await session.run(
        'MATCH (c:County {name: $county}) RETURN c.lat AS lat, c.lng AS lng',
        { county }
      )

      if (coordsResult.records.length === 0) {
        return NextResponse.json({ success: false, error: `County "${county}" not found in database` }, { status: 404 })
      }

      lat = coordsResult.records[0].get('lat')
      lng = coordsResult.records[0].get('lng')
    } finally {
      await session.close()
    }

    // Fetch 90-day rainfall from Open-Meteo
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 90)

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_sum&timezone=Africa%2FNairobi&start_date=${fmt(start)}&end_date=${fmt(end)}`
    const res = await fetch(url)
    const data = await res.json()

    const total: number = (data.daily?.precipitation_sum ?? [])
      .reduce((sum: number, v: number | null) => sum + (v ?? 0), 0)

    const rainfallMm = Math.round(total)
    const periodDays = 90
    const season = getSeason()
    const adequacyPct = Math.min(100, Math.round((rainfallMm / 400) * 100))
    const forecastLabel = rainfallMm >= 250
      ? 'Good rains forecast'
      : rainfallMm >= 150
      ? 'Moderate rainfall'
      : 'Low rainfall — caution'

    const weather = { county, rainfallMm, periodDays, season, forecastLabel, adequacyPct, fetchedAt: new Date().toISOString() }

    // Save to Neo4j as WeatherRecord
    const writeSession = getSession()
    try {
      await writeSession.run(
        `CREATE (w:WeatherRecord {
          county: $county,
          rainfallMm: $rainfallMm,
          periodDays: $periodDays,
          season: $season,
          forecastLabel: $forecastLabel,
          adequacyPct: $adequacyPct,
          fetchedAt: datetime()
        })`,
        weather
      )
    } finally {
      await writeSession.close()
    }

    return NextResponse.json({ success: true, weather })
  } catch (err: any) {
    console.error('[weather GET]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

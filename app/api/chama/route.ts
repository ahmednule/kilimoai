import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

async function getUserFromToken(req: NextRequest) {
  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return null

  const session = getSession()
  try {
    const result = await session.run(
      'MATCH (u:User {sessionToken: $token}) RETURN u',
      { token }
    )
    return result.records.length > 0 ? result.records[0].get('u').properties : null
  } finally {
    await session.close()
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const county = searchParams.get('county')
    const search = searchParams.get('search') || ''
    const language = searchParams.get('language') || 'en'

    const session = getSession()
    try {
      let query: string
      let params: Record<string, any> = {}

      if (county && county !== 'ALL') {
        query = `
          MATCH (c:ChamaGroup {county: $county})
          WHERE toLower(c.name) CONTAINS toLower($search)
          RETURN c
          ORDER BY c.totalSavings DESC
        `
        params = { county, search }
      } else {
        query = `
          MATCH (c:ChamaGroup)
          WHERE toLower(c.name) CONTAINS toLower($search)
          RETURN c
          ORDER BY c.totalSavings DESC
        `
        params = { search }
      }

      const toNum = (v: any): number => typeof v === 'number' ? v : Number(v?.toNumber?.() ?? v ?? 0)

      const result = await session.run(query, params)
      const chamas = result.records.map(record => {
        const props = record.get('c').properties
        return {
          id: props.id,
          name: props.name,
          county: props.county,
          description: props.description || '',
          registrationFee: toNum(props.registrationFee),
          memberCount: toNum(props.memberCount),
          totalSavings: toNum(props.totalSavings),
          createdAt: props.createdAt ? props.createdAt.toString() : '',
        }
      })

      return NextResponse.json({ success: true, chamas })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[chama GET]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { name, county, description, registrationFee } = await req.json()

    if (!name || !county || !description) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const chamaId = `ch-${Date.now()}`

    const session = getSession()
    try {
      await session.run(
        `CREATE (c:ChamaGroup {
          id: $id,
          name: $name,
          county: $county,
          description: $description,
          registrationFee: $fee,
          memberCount: 1,
          totalSavings: 0,
          createdAt: datetime()
        })`,
        { id: chamaId, name, county, description, fee: registrationFee || 500 }
      )

      await session.run(
        `MATCH (u:User {id: $userId}), (c:ChamaGroup {id: $chamaId})
         MERGE (u)-[r:BELONGS_TO]->(c)
         SET r.status = 'ACTIVE', r.totalContributed = 0, r.joinedAt = datetime()`,
        { userId: user.id, chamaId }
      )

      return NextResponse.json({
        success: true,
        chama: { id: chamaId, name, county, description, registrationFee: registrationFee || 500, memberCount: 1, totalSavings: 0 },
      })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[chama POST]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}
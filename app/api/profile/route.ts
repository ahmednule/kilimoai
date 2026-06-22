import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

async function getUserFromToken(req: NextRequest) {
  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return null

  const session = getSession()
  const result = await session.run(
    'MATCH (u:User {sessionToken: $token}) RETURN u',
    { token }
  )
  await session.close()
  return result.records.length > 0 ? result.records[0].get('u').properties : null
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const session = getSession()
    const result = await session.run(
      `MATCH (u:User {id: $userId})-[:HAS_PROFILE]->(fp:FarmerProfile)
       RETURN fp`,
      { userId: user.id }
    )
    await session.close()

    if (result.records.length > 0) {
      const props = result.records[0].get('fp').properties
      return NextResponse.json({
        success: true,
        profile: {
          name: props.name,
          email: user.email,
          role: user.role,
          county: props.county,
          crops: safeParseJson(props.crops, []),
          language: props.language || 'en',
        },
      })
    }

    return NextResponse.json({
      success: true,
      profile: {
        name: user.name,
        email: user.email,
        role: user.role,
        county: user.county || '',
        crops: [],
        language: 'en',
      },
    })
  } catch (err: any) {
    console.error('[profile GET]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

function safeParseJson(raw: any, fallback: any) {
  if (!raw) return fallback
  if (typeof raw === 'object') return raw
  try { return JSON.parse(raw) } catch { return fallback }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { name, county, crops, language } = await req.json()

    if (!name || !county || !crops || !Array.isArray(crops)) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const cropsJson = JSON.stringify(crops)
    const totalAcres = crops.reduce((sum: number, c: any) => sum + (parseFloat(c.acres) || 0), 0)

    const profileId = `fp-${user.id}`

    const session = getSession()

    await session.run(
      `MERGE (fp:FarmerProfile {id: $profileId})
       ON CREATE SET fp.name = $name, fp.county = $county, fp.crops = $crops, fp.totalAcres = $totalAcres, fp.language = $language, fp.createdAt = datetime()
       ON MATCH SET fp.name = $name, fp.county = $county, fp.crops = $crops, fp.totalAcres = $totalAcres, fp.language = $language`,
      { profileId, name, county, crops: cropsJson, totalAcres, language: language || 'en' }
    )

    await session.run(
      `MATCH (u:User {id: $userId}), (fp:FarmerProfile {id: $profileId})
       MERGE (u)-[:HAS_PROFILE]->(fp)`,
      { userId: user.id, profileId }
    )

    await session.close()

    return NextResponse.json({ success: true, profile: { id: profileId, name, county, crops, totalAcres, language } })
  } catch (err: any) {
    console.error('[profile PUT]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

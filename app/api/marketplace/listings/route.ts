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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const county = searchParams.get('county') || ''
    const crop = searchParams.get('crop') || ''
    const verificationStatus = searchParams.get('verificationStatus') || ''
    const farmerId = searchParams.get('farmerId') || ''

    const session = getSession()
    try {
      const conditions: string[] = []
      const params: Record<string, any> = {}

      if (farmerId) { conditions.push('l.farmerId = $farmerId'); params.farmerId = farmerId }
      if (county) { conditions.push('l.county = $county'); params.county = county }
      if (crop) { conditions.push('toLower(l.crop) CONTAINS toLower($crop)'); params.crop = crop }
      if (verificationStatus) { conditions.push('l.verificationStatus = $verificationStatus'); params.verificationStatus = verificationStatus }

      // Buyer-facing: only verified + active listings
      const isAgentView = searchParams.get('agent') === 'true'
      if (!farmerId && !isAgentView) {
        conditions.push('l.verificationStatus = "verified"', 'l.status = "active"')
      }

      const result = await session.run(`
        MATCH (l:MarketListing)
        ${whereClause}
        RETURN l
        ORDER BY l.date DESC
      `, params)

      const listings = result.records.map(r => {
        const p = r.get('l').properties
        return {
          id: p.id,
          farmerId: p.farmerId || '',
          farmerName: p.farmerName || p.seller || '',
          crop: p.crop,
          quantity: Number(p.quantity || 0),
          unit: p.unit || 'bags',
          pricePerUnit: Number(p.pricePerUnit || 0),
          seller: p.seller || '',
          county: p.county || '',
          quality: p.quality || 'Grade 1',
          verificationStatus: p.verificationStatus || 'pending_verification',
          status: p.status || 'active',
          agentNotes: p.agentNotes || '',
          date: p.date ? p.date.toString() : '',
          available: p.available || '',
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

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'farmer') return NextResponse.json({ success: false, error: 'Farmers only' }, { status: 403 })

    const { crop, quantity, unit, pricePerUnit, quality, available } = await req.json()
    if (!crop || !quantity || !pricePerUnit) {
      return NextResponse.json({ success: false, error: 'crop, quantity, and pricePerUnit are required' }, { status: 400 })
    }

    const id = `ml-${Date.now().toString(36)}`
    const date = new Date().toISOString().split('T')[0]

    const session = getSession()
    try {
      // Get farmer's county
      const countyRes = await session.run(
        `MATCH (u:User {id: $farmerId})-[:LOCATED_IN]->(co:County) RETURN co.name AS name`,
        { farmerId: user.id }
      )
      const county = countyRes.records.length > 0 ? countyRes.records[0].get('name') : user.county || ''

      await session.run(
        `MATCH (u:User {id: $farmerId})
         CREATE (l:MarketListing {
           id: $id, farmerId: $farmerId, farmerName: $farmerName,
           crop: $crop, quantity: $quantity, unit: $unit,
           pricePerUnit: $pricePerUnit, county: $county, quality: $quality,
           verificationStatus: 'pending_verification', status: 'active',
           date: $date, available: $available,
           agentNotes: ''
         })
         CREATE (u)-[:HAS_LISTING]->(l)`,
        {
          farmerId: user.id, farmerName: user.name || 'Farmer',
          id, crop, quantity: Number(quantity), unit: unit || 'bags',
          pricePerUnit: Number(pricePerUnit), county,
          quality: quality || 'Grade 1',
          date, available: available || '',
        }
      )

      return NextResponse.json({ success: true, id })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[marketplace listings POST]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { listingId, action, agentNotes } = await req.json()
    if (!listingId || !action) {
      return NextResponse.json({ success: false, error: 'listingId and action required' }, { status: 400 })
    }

    const validActions = ['verify', 'reject', 'mark_sold']
    if (!validActions.includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }

    const session = getSession()
    try {
      if (action === 'verify' || action === 'reject') {
        if (user.role !== 'agent') return NextResponse.json({ success: false, error: 'Agents only' }, { status: 403 })

        const newStatus = action === 'verify' ? 'verified' : 'rejected'
        await session.run(
          `MATCH (l:MarketListing {id: $listingId})
           SET l.verificationStatus = $newStatus,
               l.agentNotes = $agentNotes,
               l.verifiedAt = datetime(),
               l.verifiedBy = $agentId`,
          { listingId, newStatus, agentNotes: agentNotes || '', agentId: user.id }
        )
        return NextResponse.json({ success: true, message: `Listing ${newStatus}` })
      }

      if (action === 'mark_sold') {
        await session.run(
          `MATCH (l:MarketListing {id: $listingId})
           SET l.verificationStatus = 'sold', l.status = 'sold'`,
          { listingId }
        )
        return NextResponse.json({ success: true, message: 'Listed as sold' })
      }

      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[marketplace listings PATCH]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

export async function GET(req: NextRequest) {
  try {
    const header = req.headers.get('authorization') || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const session = getSession()
    try {
      const result = await session.run(
        `MATCH (u:User {sessionToken: $token})
         OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
         OPTIONAL MATCH (u)-[:LOCATED_IN]->(co:County)
         OPTIONAL MATCH (u)-[:GROWS]->(c:Crop)
         RETURN u,
                r.name AS roleName,
                co.name AS countyName,
                collect(DISTINCT c.name) AS cropNames`,
        { token }
      )

      if (result.records.length === 0) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
      }

      const record = result.records[0]
      const user = record.get('u').properties
      const roleName = record.get('roleName') || 'farmer'
      const countyName = record.get('countyName') || ''
      const cropNames: string[] = (record.get('cropNames') || []).filter(Boolean)

      const crops = cropNames.map((name: string) => ({
        crop: name,
        acres: user.acreage ? Number(user.acreage) / Math.max(cropNames.length, 1) : 0,
        isRented: false,
        rentPerAcre: 0,
      }))

      const profile = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        county: countyName,
        role: roleName,
        crops,
        crop: cropNames.join(', '),
        acres: user.acreage ? Number(user.acreage) : 0,
        rentedAcres: user.rentedAcres ? Number(user.rentedAcres) : 0,
        rentCostPerAcre: user.rentCostPerAcre ? Number(user.rentCostPerAcre) : 0,
        language: user.language || 'en',
        verified: user.verified === true,
      }

      return NextResponse.json({ success: true, profile })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[profile GET]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const header = req.headers.get('authorization') || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { crops, phone, language } = await req.json()

    const session = getSession()
    try {
      // Find user
      const userResult = await session.run(
        `MATCH (u:User {sessionToken: $token}) RETURN u`,
        { token }
      )
      if (userResult.records.length === 0) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
      }

      const user = userResult.records[0].get('u').properties
      const totalAcres = Array.isArray(crops)
        ? crops.reduce((s: number, c: any) => s + (parseFloat(c.acres) || 0), 0)
        : 0

      // Remove old GROWS relationships and create new ones
      await session.run(
        `MATCH (u:User {id: $id}) OPTIONAL MATCH (u)-[r:GROWS]->() DELETE r`,
        { id: user.id }
      )

      if (Array.isArray(crops) && crops.length > 0) {
        for (const c of crops) {
          await session.run(
            `MATCH (u:User {id: $id})
             MATCH (crop:Crop {name: $cropName})
             MERGE (u)-[:GROWS]->(crop)`,
            { id: user.id, cropName: c.crop }
          )
        }
      }

      // Calculate rent totals
      const rentedAcresTotal = Array.isArray(crops)
        ? crops.reduce((s: number, c: any) => s + (c.isRented ? parseFloat(c.acres) || 0 : 0), 0)
        : 0
      const totalRentCost = Array.isArray(crops)
        ? crops.reduce((s: number, c: any) => s + (c.isRented ? (parseFloat(c.acres) || 0) * (parseFloat(c.rentPerAcre) || 0) : 0), 0)
        : 0

      // Update user properties
      const setClauses: string[] = ['u.acreage = $acreage', 'u.rentedAcres = $rentedAcres', 'u.rentCostPerAcre = $rentCostPerAcre']
      if (language) setClauses.push('u.language = $language')
      if (phone) setClauses.push('u.phone = $phone')

      await session.run(
        `MATCH (u:User {id: $id})
         SET ${setClauses.join(', ')}`,
        { id: user.id, acreage: totalAcres, rentedAcres: rentedAcresTotal, rentCostPerAcre: rentedAcresTotal > 0 ? Math.round(totalRentCost / rentedAcresTotal) : 0, language: language || 'en', phone: phone || '' }
      )

      // Link phone via HAS_PHONE relationship
      if (phone) {
        await session.run(
          `MATCH (u:User {id: $id})
           OPTIONAL MATCH (u)-[r:HAS_PHONE]->()
           DELETE r
           WITH u
           MERGE (p:Phone {number: $phone})
           CREATE (u)-[:HAS_PHONE]->(p)`,
          { id: user.id, phone }
        )
      }

      // Fetch updated profile
      const result = await session.run(
        `MATCH (u:User {id: $id})
         OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
         OPTIONAL MATCH (u)-[:LOCATED_IN]->(co:County)
         OPTIONAL MATCH (u)-[:GROWS]->(c:Crop)
         RETURN u, r.name AS roleName, co.name AS countyName,
                collect(DISTINCT c.name) AS cropNames`,
        { id: user.id }
      )

      const record = result.records[0]
      const updated = record.get('u').properties
      const cropNames: string[] = (record.get('cropNames') || []).filter(Boolean)
      const updatedCrops = cropNames.map((name: string) => ({
        crop: name,
        acres: updated.acreage ? Number(updated.acreage) / Math.max(cropNames.length, 1) : 0,
        isRented: false,
        rentPerAcre: 0,
      }))

      return NextResponse.json({
        success: true,
        profile: {
          name: updated.name || '',
          email: updated.email || '',
          phone: updated.phone || '',
          county: record.get('countyName') || '',
          role: record.get('roleName') || 'farmer',
          crops: updatedCrops,
          crop: cropNames.join(', '),
          acres: updated.acreage ? Number(updated.acreage) : 0,
          rentedAcres: updated.rentedAcres ? Number(updated.rentedAcres) : 0,
          rentCostPerAcre: updated.rentCostPerAcre ? Number(updated.rentCostPerAcre) : 0,
          language: updated.language || 'en',
          verified: updated.verified === true,
        },
      })
    } finally {
      await session.close()
    }
  } catch (err: any) {
    console.error('[profile PUT]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

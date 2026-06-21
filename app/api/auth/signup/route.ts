import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'
import crypto from 'crypto'

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, county, role } = await req.json()

    if (!name || !email || !password || !county || !role) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 })
    }

    const validRoles = ['farmer', 'agent', 'lender', 'buyer', 'admin']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 })
    }

    const session = getSession()
    const lowerEmail = email.toLowerCase()

    const existing = await session.run(
      'MATCH (u:User {email: $email}) RETURN u',
      { email: lowerEmail }
    )

    if (existing.records.length > 0) {
      await session.close()
      return NextResponse.json({ success: false, error: 'An account with this email already exists' }, { status: 409 })
    }

    const id = `u-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    const sessionToken = generateToken()

    await session.run(
      `CREATE (u:User {
        id: $id,
        name: $name,
        email: $email,
        password: $password,
        role: $role,
        county: $county,
        sessionToken: $sessionToken,
        createdAt: datetime()
      })`,
      { id, name, email: lowerEmail, password, role, county, sessionToken }
    )

    await session.close()

    return NextResponse.json({
      success: true,
      sessionToken,
      user: { name, email: lowerEmail, role, county }
    })
  } catch (err: any) {
    console.error('[signup]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}
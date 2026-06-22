import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'
import crypto from 'crypto'

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 })
    }

    const session = getSession()
    const lowerEmail = email.toLowerCase()

    const result = await session.run(
      'MATCH (u:User {email: $email}) RETURN u',
      { email: lowerEmail }
    )

    if (result.records.length === 0) {
      await session.close()
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 })
    }

    const user = result.records[0].get('u').properties

    if (user.password !== password) {
      await session.close()
      return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 })
    }

    const sessionToken = generateToken()

    await session.run(
      'MATCH (u:User {email: $email}) SET u.sessionToken = $token',
      { email: lowerEmail, token: sessionToken }
    )

    await session.close()

    return NextResponse.json({
      success: true,
      sessionToken,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        county: user.county,
      }
    })
  } catch (err: any) {
    console.error('[login]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}
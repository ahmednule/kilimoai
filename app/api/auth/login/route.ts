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

    // Traverse relationships for role + county (matches seed schema)
    const result = await session.run(
      `MATCH (u:User {email: $email})
       OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
       OPTIONAL MATCH (u)-[:LOCATED_IN]->(co:County)
       RETURN u, r.name AS roleName, co.name AS countyName`,
      { email: lowerEmail }
    )

    if (result.records.length === 0) {
      await session.close()
      return NextResponse.json({ success: false, error: 'Account not found. Did you sign up?' }, { status: 401 })
    }

    const record = result.records[0]
    const user = record.get('u').properties
    const roleName = record.get('roleName')
    const countyName = record.get('countyName')

    if (user.password !== password) {
      await session.close()
      return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 })
    }

    if (user.emailVerified !== true) {
      await session.close()
      return NextResponse.json({
        success: false,
        error: 'Please verify your email before logging in. Check your inbox for the verification link.',
        needsVerification: true,
      }, { status: 403 })
    }

    const sessionToken = generateToken()

    await session.run(
      'MATCH (u:User {email: $email}) SET u.sessionToken = $token',
      { email: lowerEmail, token: sessionToken }
    )

    await session.close()

    const response = NextResponse.json({
      success: true,
      sessionToken,
      user: {
        name: user.name,
        email: user.email,
        role: roleName,
        county: countyName,
      }
    })
    response.cookies.set('kilimo-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    return response
  } catch (err: any) {
    console.error('[login]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

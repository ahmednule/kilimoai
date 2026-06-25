import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.json({ success: false, error: 'Invalid verification link' }, { status: 400 })
    }

    const session = getSession()
    const lowerEmail = email.toLowerCase()

    const result = await session.run(
      'MATCH (u:User {email: $email, verificationToken: $token}) RETURN u',
      { email: lowerEmail, token }
    )

    if (result.records.length === 0) {
      await session.close()
      return NextResponse.json({ success: false, error: 'Invalid or expired verification link' }, { status: 400 })
    }

    await session.run(
      'MATCH (u:User {email: $email}) SET u.verified = true, u.verificationToken = null',
      { email: lowerEmail }
    )

    await session.close()

    return NextResponse.json({ success: true, message: 'Email verified! You can now log in.' })
  } catch (err: any) {
    console.error('[verify]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

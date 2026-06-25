import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

export async function POST(req: NextRequest) {
  try {
    const { email, token, password } = await req.json()

    if (!email || !token || !password) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const session = getSession()
    const lowerEmail = email.toLowerCase()

    const result = await session.run(
      `MATCH (u:User {email: $email, resetToken: $token})
       WHERE u.resetTokenExpiry > datetime()
       RETURN u`,
      { email: lowerEmail, token }
    )

    if (result.records.length === 0) {
      await session.close()
      return NextResponse.json({ success: false, error: 'Invalid or expired reset token' }, { status: 400 })
    }

    await session.run(
      `MATCH (u:User {email: $email})
       SET u.password = $password, u.resetToken = null, u.resetTokenExpiry = null`,
      { email: lowerEmail, password }
    )

    await session.close()

    return NextResponse.json({ success: true, message: 'Password reset successfully! You can now log in.' })
  } catch (err: any) {
    console.error('[reset-password]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

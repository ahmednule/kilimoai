import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const session = getSession()
    const lowerEmail = email.toLowerCase()

    const result = await session.run(
      'MATCH (u:User {email: $email}) RETURN u',
      { email: lowerEmail }
    )

    if (result.records.length === 0) {
      await session.close()
      // Don't reveal if user exists — security best practice
      return NextResponse.json({ success: true, message: 'If this email exists, a reset link has been sent.' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiry = Date.now() + 60 * 60 * 1000 // 1 hour, in epoch ms

    await session.run(
      'MATCH (u:User {email: $email}) SET u.resetToken = $token, u.resetTokenExpiry = $expiry',
      { email: lowerEmail, token: resetToken, expiry }
    )

    await session.close()

    await sendPasswordResetEmail(lowerEmail, resetToken)

    return NextResponse.json({ success: true, message: 'If this email exists, a reset link has been sent.' })
  } catch (err: any) {
    console.error('[forgot-password]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

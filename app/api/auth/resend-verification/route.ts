import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'
import { sendVerificationEmail } from '@/lib/email'
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
      return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 })
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')

    await session.run(
      'MATCH (u:User {email: $email}) SET u.verificationToken = $token',
      { email: lowerEmail, token: verificationToken }
    )

    await session.close()

    const emailSent = await sendVerificationEmail(lowerEmail, verificationToken)

    return NextResponse.json({
      success: true,
      emailSent,
      message: emailSent
        ? 'Verification email sent!'
        : 'Verification email could not be sent. Contact support.',
    })
  } catch (err: any) {
    console.error('[resend-verification]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

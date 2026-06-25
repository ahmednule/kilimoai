import nodemailer from 'nodemailer'

function getTransporter() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT) || 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn('[email] SMTP not configured — skipping verification email to', email)
    return false
  }

  const appUrl = process.env.APP_URL || 'http://localhost:3000'
  const link = `${appUrl}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@kilimo.ai',
      to: email,
      subject: 'Verify your Kilimo AI account',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#16a34a;">Kilimo AI</h2>
          <p>Welcome! Click the link below to verify your email address:</p>
          <a href="${link}" style="display:inline-block;padding:12px 24px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;margin:16px 0;">
            Verify Email
          </a>
          <p style="color:#666;font-size:13px;">Or paste this link in your browser:<br/>${link}</p>
          <p style="color:#999;font-size:12px;">If you didn't create an account, ignore this email.</p>
        </div>
      `,
    })
    return true
  } catch (err) {
    console.error('[email] Failed to send verification email:', err)
    return false
  }
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn('[email] SMTP not configured — skipping password reset email to', email)
    return false
  }

  const appUrl = process.env.APP_URL || 'http://localhost:3000'
  const link = `${appUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@kilimo.ai',
      to: email,
      subject: 'Reset your Kilimo AI password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#16a34a;">Kilimo AI</h2>
          <p>Click the link below to reset your password. This link expires in 1 hour.</p>
          <a href="${link}" style="display:inline-block;padding:12px 24px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;margin:16px 0;">
            Reset Password
          </a>
          <p style="color:#666;font-size:13px;">Or paste this link in your browser:<br/>${link}</p>
          <p style="color:#999;font-size:12px;">If you didn't request a reset, ignore this email.</p>
        </div>
      `,
    })
    return true
  } catch (err) {
    console.error('[email] Failed to send reset email:', err)
    return false
  }
}

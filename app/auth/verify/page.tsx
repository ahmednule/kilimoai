'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle2, XCircle, Mail, ArrowRight } from 'lucide-react'
import { getLanguage, Language } from '@/lib/i18n'

const UI_TEXT = {
  en: {
    title: 'Check your email',
    subtitle: 'We sent a verification link to',
    subtitle2: "Click the link to activate your account, then log in.",
    verifying: 'Verifying your email...',
    success: 'Email verified!',
    successMsg: 'Your account is now active. You can log in.',
    error: 'Verification failed',
    errorMsg: 'This link may be expired or invalid. Try signing up again.',
    login: 'Log In',
    resend: 'Resend verification email',
    resending: 'Sending...',
    resent: 'Verification email resent!',
  },
  sw: {
    title: 'Angalia barua pepe yako',
    subtitle: 'Tumetuma kiungo cha uthibitisho kwa',
    subtitle2: 'Bofya kiungo ili kuamilisha akaunti yako, kisha ingia.',
    verifying: 'Inathibitisha barua pepe yako...',
    success: 'Barua pepe imethibitishwa!',
    successMsg: 'Akaunti yako sasa imeamilishwa. Unaweza kuingia.',
    error: 'Uthibitisho umeshindwa',
    errorMsg: 'Kiungo hiki kinaweza kuwa kimeisha au si sahihi. Jaribu kujisajili tena.',
    login: 'Ingia',
    resend: 'Tuma tena barua pepe ya uthibitisho',
    resending: 'Inatuma...',
    resent: 'Barua pepe ya uthibitisho imetumwa tena!',
  }
}

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [lang, setLang] = useState<Language>('en')
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resentMsg, setResentMsg] = useState('')

  useEffect(() => {
    setLang(getLanguage())
  }, [])

  // Handle verification link ── Gets called when user clicks the link in email
  useEffect(() => {
    const token = searchParams.get('token')
    const emailParam = searchParams.get('email')
    if (token && emailParam) {
      setEmail(emailParam)
      setStatus('verifying')
      verifyEmail(token, emailParam)
    } else {
      // Show the "check your email" screen
      const storedEmail = localStorage.getItem('kilimo-signup-email')
      if (storedEmail) setEmail(storedEmail)
    }
  }, [searchParams])

  const verifyEmail = useCallback(async (token: string, emailParam: string) => {
    try {
      const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(emailParam)}`)
      const data = await res.json()
      setStatus(data.success ? 'success' : 'error')
      if (data.success) {
        localStorage.removeItem('kilimo-signup-email')
      }
    } catch {
      setStatus('error')
    }
  }, [])

  const handleResend = async () => {
    if (!email || resending) return
    setResending(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      setResentMsg(UI_TEXT[lang].resent)
    } catch {}
    setResending(false)
    setTimeout(() => setResentMsg(''), 4000)
  }

  const t = UI_TEXT[lang]

  return (
    <div className="text-center">
      {status === 'verifying' ? (
        <div className="py-8">
          <Loader2 className="w-12 h-12 text-green-primary animate-spin mx-auto mb-4" />
          <p className="text-text-primary font-medium">{t.verifying}</p>
        </div>
      ) : status === 'success' ? (
        <div className="py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-text-primary mb-2">{t.success}</h1>
          <p className="text-sm text-text-muted mb-6">{t.successMsg}</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-primary text-white font-semibold rounded-xl hover:bg-green-primary/90 transition-all"
          >
            {t.login} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : status === 'error' ? (
        <div className="py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-text-primary mb-2">{t.error}</h1>
          <p className="text-sm text-text-muted mb-6">{t.errorMsg}</p>
          <Link
            href="/auth/signup"
            className="text-green-primary hover:underline font-medium"
          >
            {t.error}
          </Link>
        </div>
      ) : (
        <div className="py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-green-primary" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-text-primary mb-2">{t.title}</h1>
          <p className="text-sm text-text-muted">
            {t.subtitle} <span className="text-text-primary font-medium">{email}</span>
          </p>
          <p className="text-sm text-text-muted mt-1">{t.subtitle2}</p>

          <div className="mt-8 space-y-3">
            <Link
              href="/auth/login"
              className="block w-full py-3 rounded-xl bg-green-primary text-white font-semibold hover:bg-green-primary/90 transition-all"
            >
              {t.login}
            </Link>

            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full py-3 rounded-xl border border-border-subtle text-sm text-text-muted hover:text-text-primary hover:border-green-primary/30 transition-all"
            >
              {resending ? t.resending : resentMsg || t.resend}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

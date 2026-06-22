'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react'
import { getLanguage, Language } from '@/lib/i18n'

const UI_TEXT = {
  en: {
    title: 'Forgot password?',
    subtitle: "No worries, we'll send you reset instructions.",
    email: 'Email',
    emailPlaceholder: 'farmer@kilimo.com',
    sendReset: 'Send Reset Link',
    sending: 'Sending...',
    back: 'Back to Log In',
    checkEmail: 'Check your email',
    emailSent: 'If an account exists for',
    emailSent2: "you'll receive a reset link shortly.",
  },
  sw: {
    title: 'Umesahau nenosiri?',
    subtitle: 'Usiwe na wasiwasi, tutakutumia maagizo ya kuweka upya.',
    email: 'Barua pepe',
    emailPlaceholder: 'farmer@kilimo.com',
    sendReset: 'Tuma Kiungo cha Kuweka Upya',
    sending: 'Inatuma...',
    back: 'Rudi kwa Kuingia',
    checkEmail: 'Angalia barua pepe yako',
    emailSent: 'Ikiwa akaunti ipo kwa',
    emailSent2: 'utapokea kiungo cha kuweka upya hivi karibuni.',
  }
}

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [lang, setLang] = useState<Language>('en')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLang(getLanguage())
  }, [])

  const t = UI_TEXT[lang]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError(lang === 'sw' ? 'Tafadhali ingiza barua pepe yako' : 'Please enter your email address')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 1500)
  }

  return (
    <>
      <div className="mb-8">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.back}
        </Link>
        <h1 className="font-serif text-2xl font-bold text-text-primary">{sent ? t.checkEmail : t.title}</h1>
        <p className="mt-1 text-sm text-text-muted">{sent ? `${t.emailSent} ${email}, ${t.emailSent2}` : t.subtitle}</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {sent ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-text-muted">
            {t.emailSent}{' '}
            <span className="text-text-primary font-medium">{email}</span>
            , {t.emailSent2}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">
              {t.email}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full h-11 rounded-lg border border-border-subtle bg-dark-base pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-green-primary/40 focus:border-green-primary/40 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-green-primary hover:bg-green-light text-text-primary font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? t.sending : t.sendReset}
          </button>
        </form>
      )}
    </>
  )
}

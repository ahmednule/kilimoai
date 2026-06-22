'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { login, getDashboardPath } from '@/lib/auth'
import { getLanguage, Language } from '@/lib/i18n'

const UI_TEXT = {
  en: {
    title: 'Welcome back',
    subtitle: 'Enter your credentials to continue',
    email: 'Email',
    emailPlaceholder: 'farmer@kilimo.com',
    password: 'Password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    login: 'Log In',
    loggingIn: 'Logging in...',
    forgotPassword: 'Forgot password?',
    forgotComingSoon: 'Password reset is coming soon!',
    googleSignIn: 'Continue with Google',
    orContinue: 'or continue with',
    noAccount: "Don't have an account?",
    signUp: 'Sign Up',
    googleComingSoon: 'Google sign-in is coming soon!',
    fillBoth: 'Please enter both email and password',
    loginFailed: 'Login failed',
  },
  sw: {
    title: 'Karibu tena',
    subtitle: 'Ingiza vitambulisho vyako kuendelea',
    email: 'Barua pepe',
    emailPlaceholder: 'farmer@kilimo.com',
    password: 'Nenosiri',
    showPassword: 'Onyesha nenosiri',
    hidePassword: 'Ficha nenosiri',
    login: 'Ingia',
    loggingIn: 'Inaingia...',
    forgotPassword: 'Umesahau nenosiri?',
    forgotComingSoon: 'Kuweka upya nenosiri kunakuja hivi karibuni!',
    googleSignIn: 'Endelea na Google',
    orContinue: 'au endelea na',
    noAccount: 'Huna akaunti?',
    signUp: 'Jisajili',
    googleComingSoon: 'Kuingia kwa Google kunakuja hivi karibuni!',
    fillBoth: 'Tafadhali ingiza barua pepe na nenosiri',
    loginFailed: 'Imeshindwa kuingia',
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [lang, setLang] = useState<Language>('en')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLang(getLanguage())
  }, [])

  const t = UI_TEXT[lang]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError(t.fillBoth)
      return
    }

    setLoading(true)
    const result = await login(email.trim(), password)
    setLoading(false)

    if (result.success) {
      const session = JSON.parse(localStorage.getItem('kilimo-session') || '{}')
      router.push(getDashboardPath(session.role))
    } else {
      setError(result.error || t.loginFailed)
    }
  }

  const handleGoogleClick = () => {
    alert(lang === 'sw' ? 'Kuingia kwa Google kunakuja hivi karibuni!' : 'Google sign-in is coming soon!')
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-text-primary">{t.title}</h1>
        <p className="mt-1 text-sm text-text-muted">{t.subtitle}</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">
            {t.email}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            className="w-full h-11 rounded-lg border border-border-subtle bg-dark-base px-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-green-primary/40 focus:border-green-primary/40 transition-all"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1.5">
            {t.password}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 rounded-lg border border-border-subtle bg-dark-base px-4 pr-11 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-green-primary/40 focus:border-green-primary/40 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-1 top-1 bottom-1 w-10 flex items-center justify-center rounded-r-lg text-text-muted hover:text-text-primary transition-colors"
              aria-label={showPw ? t.hidePassword : t.showPassword}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-xs text-text-muted hover:text-green-primary transition-colors"
          >
            {t.forgotPassword}
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-green-primary hover:bg-green-light text-text-primary font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? t.loggingIn : t.login}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-border-subtle" />
          <span className="text-xs text-text-muted uppercase">{t.orContinue}</span>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>
        <button
          type="button"
          onClick={handleGoogleClick}
          className="mt-4 w-full h-11 rounded-lg border border-border-subtle bg-dark-base hover:bg-dark-base/50 text-text-primary font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.3-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.86-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {t.googleSignIn}
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-text-muted">
        {t.noAccount}{' '}
        <Link href="/auth/signup" className="text-green-primary hover:underline font-medium">
          {t.signUp}
        </Link>
      </p>
    </>
  )
}

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, ChevronsUpDown, Check, Sprout, Users } from 'lucide-react'
import { signup } from '@/lib/auth'
import { getLanguage, Language } from '@/lib/i18n'
import { KENYAN_COUNTIES } from '@/lib/constants'

const UI_TEXT = {
  en: {
    title: 'Create your account',
    subtitle: 'Join Kilimo AI to get started',
    name: 'Full Name',
    namePlaceholder: 'Jane Muthoni',
    email: 'Email',
    emailPlaceholder: 'jane@example.com',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    county: 'County',
    countyPlaceholder: 'Select your county...',
    role: 'I am a',
    roleFarmer: 'Farmer',
    roleFarmerDesc: 'Growing crops, assessing loan risk',
    roleAgent: 'Extension Agent',
    roleAgentDesc: 'Advising farmers, approving loans',
    signup: 'Create Account',
    signingUp: 'Creating account...',
    googleSignIn: 'Continue with Google',
    orContinue: 'or continue with',
    hasAccount: 'Already have an account?',
    logIn: 'Log In',
    terms: 'By creating an account you agree to our',
    termsLink: 'Terms of Service',
    and: 'and',
    privacyLink: 'Privacy Policy',
    googleComingSoon: 'Google sign-in is coming soon!',
    passwordsNoMatch: 'Passwords do not match',
    fillAll: 'Please fill in all fields',
    passwordTooShort: 'Password must be at least 6 characters',
    passwordWeak: 'Weak — add numbers or symbols',
    passwordMedium: 'Fair — almost there',
    passwordStrong: 'Strong password',
  },
  sw: {
    title: 'Fungua akaunti yako',
    subtitle: 'Jiunge na Kilimo AI kuanza',
    name: 'Jina Kamili',
    namePlaceholder: 'Jane Muthoni',
    email: 'Barua pepe',
    emailPlaceholder: 'jane@example.com',
    password: 'Nenosiri',
    confirmPassword: 'Thibitisha Nenosiri',
    county: 'Kaunti',
    countyPlaceholder: 'Chagua kaunti yako...',
    role: 'Mimi ni',
    roleFarmer: 'Mkulima',
    roleFarmerDesc: 'Kulima mazao, kutathmini hatari ya mkopo',
    roleAgent: 'Wakala wa Kilimo',
    roleAgentDesc: 'Kushauri wakulima, kuidhinisha mikopo',
    signup: 'Fungua Akaunti',
    signingUp: 'Inafungua akaunti...',
    googleSignIn: 'Endelea na Google',
    orContinue: 'au endelea na',
    hasAccount: 'Tayari una akaunti?',
    logIn: 'Ingia',
    terms: 'Kwa kufungua akaunti unakubali',
    termsLink: 'Masharti ya Huduma',
    and: 'na',
    privacyLink: 'Sera ya Faragha',
    googleComingSoon: 'Kuingia kwa Google kunakuja hivi karibuni!',
    passwordsNoMatch: 'Nenosiri hayalingani',
    fillAll: 'Tafadhali jaza sehemu zote',
    passwordTooShort: 'Nenosiri lazima liwe na angalau herufi 6',
    passwordWeak: 'Dhaifu — ongeza nambari au alama',
    passwordMedium: 'Wastani — karibu',
    passwordStrong: 'Nenosiri imara',
  }
}

type PasswordStrength = 'none' | 'weak' | 'medium' | 'strong'

function getPasswordStrength(pw: string): PasswordStrength {
  if (!pw) return 'none'
  if (pw.length < 6) return 'weak'
  const hasUpper = /[A-Z]/.test(pw)
  const hasLower = /[a-z]/.test(pw)
  const hasNumber = /\d/.test(pw)
  const hasSymbol = /[^A-Za-z0-9]/.test(pw)
  const score = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length
  if (pw.length >= 8 && score >= 3) return 'strong'
  if (pw.length >= 6 && score >= 2) return 'medium'
  return 'weak'
}

export default function SignupPage() {
  const router = useRouter()
  const [lang, setLang] = useState<Language>('en')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [county, setCounty] = useState('')
  const [role, setRole] = useState<'farmer' | 'agent'>('farmer')
  const [showPw, setShowPw] = useState(false)
  const [countyOpen, setCountyOpen] = useState(false)
  const [countySearch, setCountySearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLang(getLanguage())
  }, [])

  const t = UI_TEXT[lang]

  const pwStrength = useMemo(() => getPasswordStrength(password), [password])
  const strengthColor = pwStrength === 'strong' ? 'bg-green-500' : pwStrength === 'medium' ? 'bg-gold-harvest' : pwStrength === 'weak' ? 'bg-red-500' : 'bg-border-subtle'

  const filteredCounties = KENYAN_COUNTIES.filter((c: string) =>
    c.toLowerCase().includes(countySearch.toLowerCase())
  )

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setError('')

  //   if (!name.trim() || !email.trim() || !password || !confirmPw || !county) {
  //     setError(t.fillAll)
  //     return
  //   }

  //   if (password.length < 6) {
  //     setError(t.passwordTooShort)
  //     return
  //   }

  //   if (password !== confirmPw) {
  //     setError(t.passwordsNoMatch)
  //     return
  //   }

  //   setLoading(true)
  //   const result = signup(name.trim(), email.trim(), password, county, role)
  //   setLoading(false)

  //   if (result.success) {
  //     router.push('/dashboard')
  //   } else {
  //     setError(result.error || t.fillAll)
  //   }
  // }
// Replace your existing handleSubmit in app/auth/signup/page.tsx with this:

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')

  if (!name.trim() || !email.trim() || !password || !confirmPw || !county) {
    setError(t.fillAll)
    return
  }
  if (password.length < 6) {
    setError(t.passwordTooShort)
    return
  }
  if (password !== confirmPw) {
    setError(t.passwordsNoMatch)
    return
  }

  setLoading(true)
  const result = await signup(name.trim(), email.trim(), password, county, role)
  setLoading(false)

  if (!result.success) {
    setError(result.error || t.fillAll)
    return
  }

  if (role === 'farmer') {
    const partial = {
      name:    name.trim(),
      county,
      language: lang,
    }
    localStorage.setItem('kilimo-profile-partial', JSON.stringify(partial))
    router.push('/onboarding')
  } else {
    router.push('/lender')
  }
}
  const handleGoogleClick = () => {
    alert(lang === 'sw' ? 'Kuingia kwa Google kunakuja hivi karibuni!' : 'Google sign-in is coming soon!')
  }

  const handleCountySelect = (c: string) => {
    setCounty(c)
    setCountyOpen(false)
    setCountySearch('')
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
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1.5">
            {t.name}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
            className="w-full h-11 rounded-lg border border-border-subtle bg-dark-base px-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-green-primary/40 focus:border-green-primary/40 transition-all"
          />
        </div>

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
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            {t.password}
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 rounded-lg border border-border-subtle bg-dark-base px-4 pr-11 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-green-primary/40 focus:border-green-primary/40 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-1 top-1 bottom-1 w-10 flex items-center justify-center rounded-r-lg text-text-muted hover:text-text-primary transition-colors"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                <div className={`h-1 flex-1 rounded-full transition-colors ${pwStrength === 'weak' || pwStrength === 'medium' || pwStrength === 'strong' ? 'bg-red-500' : 'bg-border-subtle'}`} />
                <div className={`h-1 flex-1 rounded-full transition-colors ${pwStrength === 'medium' || pwStrength === 'strong' ? 'bg-gold-harvest' : 'bg-border-subtle'}`} />
                <div className={`h-1 flex-1 rounded-full transition-colors ${pwStrength === 'strong' ? 'bg-green-500' : 'bg-border-subtle'}`} />
              </div>
              <p className={`text-xs ${
                pwStrength === 'strong' ? 'text-green-500' : pwStrength === 'medium' ? 'text-gold-harvest' : 'text-text-muted'
              }`}>
                {pwStrength === 'strong' ? t.passwordStrong : pwStrength === 'medium' ? t.passwordMedium : t.passwordWeak}
              </p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPw" className="block text-sm font-medium text-text-secondary mb-1.5">
            {t.confirmPassword}
          </label>
          <input
            id="confirmPw"
            type={showPw ? 'text' : 'password'}
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            className="w-full h-11 rounded-lg border border-border-subtle bg-dark-base px-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-green-primary/40 focus:border-green-primary/40 transition-all"
          />
        </div>

        {/* County Select */}
        <div className="relative">
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            {t.county}
          </label>
          <button
            type="button"
            onClick={() => setCountyOpen(!countyOpen)}
            className="w-full h-11 rounded-lg border border-border-subtle bg-dark-base px-4 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-green-primary/40 transition-all"
          >
            <span className={county ? 'text-text-primary' : 'text-text-muted'}>
              {county || t.countyPlaceholder}
            </span>
            <ChevronsUpDown className="w-4 h-4 text-text-muted" />
          </button>

          {countyOpen && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-border-subtle bg-dark-mid shadow-xl">
              <div className="p-2">
                <input
                  type="text"
                  placeholder={lang === 'sw' ? 'Tafuta kaunti...' : 'Search counties...'}
                  value={countySearch}
                  onChange={(e) => setCountySearch(e.target.value)}
                  className="w-full h-9 rounded-md border border-border-subtle bg-dark-base px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-green-primary/40"
                  autoFocus
                />
              </div>
              <div className="max-h-44 overflow-y-auto scrollbar-thin">
                {filteredCounties.map((c: string) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => handleCountySelect(c)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-green-primary/10 transition-colors flex items-center justify-between ${
                      county === c ? 'text-green-primary font-medium' : 'text-text-secondary'
                    }`}
                  >
                    {c}
                    {county === c && <Check className="w-4 h-4" />}
                  </button>
                ))}
                {filteredCounties.length === 0 && (
                  <p className="px-4 py-2 text-sm text-text-muted">
                    {lang === 'sw' ? 'Hakuna kaunti iliyopatikana' : 'No counties found'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            {t.role}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('farmer')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                role === 'farmer'
                  ? 'bg-green-primary/10 border-green-primary/40 text-green-primary shadow-lg shadow-green-primary/10'
                  : 'border-border-subtle text-text-muted hover:border-green-primary/30 hover:text-text-primary'
              }`}
            >
              <Sprout className="w-6 h-6" />
              <span className="text-sm font-semibold">{t.roleFarmer}</span>
              <span className="text-xs text-text-muted leading-tight text-center">{t.roleFarmerDesc}</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('agent')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                role === 'agent'
                  ? 'bg-green-primary/10 border-green-primary/40 text-green-primary shadow-lg shadow-green-primary/10'
                  : 'border-border-subtle text-text-muted hover:border-green-primary/30 hover:text-text-primary'
              }`}
            >
              <Users className="w-6 h-6" />
              <span className="text-sm font-semibold">{t.roleAgent}</span>
              <span className="text-xs text-text-muted leading-tight text-center">{t.roleAgentDesc}</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-green-primary hover:bg-green-light text-text-primary font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? t.signingUp : t.signup}
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
        {t.hasAccount}{' '}
        <Link href="/auth/login" className="text-green-primary hover:underline font-medium">
          {t.logIn}
        </Link>
      </p>

      <p className="mt-6 text-center text-xs text-text-muted leading-relaxed">
        {t.terms}{' '}
        <Link href="/terms" className="text-green-primary hover:underline">{t.termsLink}</Link>{' '}
        {t.and}{' '}
        <Link href="/privacy" className="text-green-primary hover:underline">{t.privacyLink}</Link>
      </p>
    </>
  )
}

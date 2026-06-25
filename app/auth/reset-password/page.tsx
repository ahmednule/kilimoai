'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { getLanguage, Language } from '@/lib/i18n'

const UI_TEXT = {
  en: {
    title: 'Reset your password',
    subtitle: 'Enter a new password for your account.',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    reset: 'Reset Password',
    resetting: 'Resetting...',
    success: 'Password reset successful!',
    successMsg: 'You can now log in with your new password.',
    login: 'Log In',
    back: 'Back',
    invalidTitle: 'Invalid or expired link',
    invalidMsg: 'This password reset link may have expired. Request a new one.',
    requestNew: 'Request new reset link',
    passwordsNoMatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 6 characters',
  },
  sw: {
    title: 'Weka upya nenosiri lako',
    subtitle: 'Ingiza nenosiri jipya la akaunti yako.',
    newPassword: 'Nenosiri Jipya',
    confirmPassword: 'Thibitisha Nenosiri',
    reset: 'Weka Upya Nenosiri',
    resetting: 'Inaweka upya...',
    success: 'Nenosiri limewekwa upya!',
    successMsg: 'Sasa unaweza kuingia kwa nenosiri lako jipya.',
    login: 'Ingia',
    back: 'Rudi',
    invalidTitle: 'Kiungo batili au kimeisha',
    invalidMsg: 'Kiungo hiki cha kuweka upya nenosiri kinaweza kuwa kimeisha. Omba kipya.',
    requestNew: 'Omba kiungo kipya',
    passwordsNoMatch: 'Nenosiri hayalingani',
    passwordTooShort: 'Nenosiri lazima liwe na angalau herufi 6',
  }
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [lang, setLang] = useState<Language>('en')
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form')

  useEffect(() => {
    setLang(getLanguage())
    const t = searchParams.get('token')
    const e = searchParams.get('email')
    if (t && e) { setToken(t); setEmail(e) }
    else { setStatus('error') }
  }, [searchParams])

  const t = UI_TEXT[lang]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      toast.error(t.passwordTooShort)
      return
    }
    if (password !== confirmPw) {
      toast.error(t.passwordsNoMatch)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
        toast.success(lang === 'sw' ? 'Nenosiri limewekwa upya!' : 'Password reset!')
      } else {
        toast.error(data.error || 'Reset failed')
        if (data.error?.includes('expired')) setStatus('error')
      }
    } catch {
      toast.error('Network error')
    }
    setLoading(false)
  }

  if (status === 'error') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-text-primary mb-2">{t.invalidTitle}</h1>
        <p className="text-sm text-text-muted mb-6">{t.invalidMsg}</p>
        <Link
          href="/auth/forgot-password"
          className="text-green-primary hover:underline font-medium"
        >
          {t.requestNew}
        </Link>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-text-primary mb-2">{t.success}</h1>
        <p className="text-sm text-text-muted mb-6">{t.successMsg}</p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-primary text-white font-semibold rounded-xl hover:bg-green-primary/90 transition-all"
        >
          {t.login}
        </Link>
      </div>
    )
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
        <h1 className="font-serif text-2xl font-bold text-text-primary">{t.title}</h1>
        <p className="mt-1 text-sm text-text-muted">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">{t.newPassword}</label>
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
              className="absolute right-1 top-1 bottom-1 w-10 flex items-center justify-center rounded-r-lg text-text-muted hover:text-text-primary"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">{t.confirmPassword}</label>
          <input
            type={showPw ? 'text' : 'password'}
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            className="w-full h-11 rounded-lg border border-border-subtle bg-dark-base px-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-green-primary/40 focus:border-green-primary/40 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-green-primary hover:bg-green-light text-text-primary font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? t.resetting : t.reset}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-text-muted" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}

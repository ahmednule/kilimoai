'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  User, Mail, Building2, MapPin, Sprout, Shield, Loader2, BadgeCheck,
} from 'lucide-react'
import { Language } from '@/lib/types'
import { CROPS, KENYAN_COUNTIES } from '@/lib/constants'
import { getSession, getToken } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { t, getLanguage } from '@/lib/i18n'

type View = 'LOADING' | 'UNAUTHORIZED' | 'READY'

interface ProfileData {
  name: string
  email: string
  role: string
  county: string
  crops: { crop: string; acres: number; isRented: boolean }[]
  language: Language
}

export default function ProfilePage() {
  const router = useRouter()
  const [view, setView] = useState<View>('LOADING')
  const [language, setLanguage] = useState<Language>('en')
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [editName, setEditName] = useState('')
  const [editCounty, setEditCounty] = useState('')
  const [editCrop, setEditCrop] = useState('')
  const [editAcres, setEditAcres] = useState('')
  const [editLang, setEditLang] = useState<Language>('en')

  const tr = (key: string) => t(key, language)

  const isFarmer = profile?.role === 'farmer'

  useEffect(() => {
    const session = getSession()
    if (!session.isAuthenticated) {
      setView('UNAUTHORIZED')
      return
    }
    const token = getToken()
    setLanguage(getLanguage())

    fetch('/api/profile', {
      headers: { authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const p = data.profile
          setProfile(p)
          setEditName(p.name || '')
          setEditCounty(p.county || '')
          const firstCrop = p.crops?.[0]
          setEditCrop(firstCrop?.crop || 'maize')
          setEditAcres(String(firstCrop?.acres || ''))
          setEditLang(p.language || 'en')
        }
      })
      .finally(() => setView('READY'))
  }, [])

  const handleSave = () => {
    if (!profile) return
    setSaving(true)
    const token = getToken()
    const crops = isFarmer
      ? [{ crop: editCrop, acres: parseFloat(editAcres) || 0, isRented: false }]
      : []

    fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: editName,
        county: editCounty,
        crops,
        language: editLang,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setProfile(prev => prev ? { ...prev, name: editName, county: editCounty, crops, language: editLang } : prev)
          localStorage.setItem('kilimo-language', editLang)
          setLanguage(editLang)
          setEditing(false)
        }
      })
      .finally(() => setSaving(false))
  }

  if (view === 'LOADING') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-text-muted animate-spin" />
          <p className="text-text-muted text-sm">{tr('app.loading')}</p>
        </div>
      </div>
    )
  }

  if (view === 'UNAUTHORIZED') {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="text-center max-w-sm animate-fadeIn">
          <Shield className="w-12 h-12 text-text-muted/40 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">{tr('profile.title')}</h2>
          <p className="text-sm text-text-muted mb-6">Please log in to view your profile.</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-5 py-2 rounded-xl bg-green-primary text-white text-sm font-medium hover:bg-green-primary/90 transition-colors"
          >
            Log in
          </button>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const initials = profile.name
    ? profile.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : '??'

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      farmer: 'bg-green-400/10 text-green-400 border-green-400/20',
      agent: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
      lender: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
      buyer: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
      admin: 'bg-red-400/10 text-red-400 border-red-400/20',
    }
    return colors[role] || 'bg-text-muted/10 text-text-muted border-text-muted/20'
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 h-full overflow-y-auto max-w-3xl">
      <div>
        <p className="text-text-muted text-xs uppercase tracking-widest mb-1">account</p>
        <h1 className="text-2xl font-serif font-semibold text-text-primary">{tr('profile.title')}</h1>
      </div>

      {/* Avatar + basic info */}
      <div className="bg-dark-mid border border-border-subtle rounded-xl p-6 flex items-center gap-5 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-green-primary flex items-center justify-center text-lg font-bold text-green-100 shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-text-primary">{profile.name}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', roleBadge(profile.role))}>
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </span>
            <span className="text-sm text-text-muted">{profile.county}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">{profile.email}</p>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-dark-mid border border-border-subtle rounded-xl p-6 space-y-4 animate-fadeIn">
        {/* Name */}
        <div>
          <label className="text-xs font-medium text-text-primary flex items-center gap-1.5 mb-1.5">
            <User className="w-3.5 h-3.5 text-green-400" />
            {tr('profile.name')}
          </label>
          {editing ? (
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="w-full bg-dark-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-green-primary/50"
            />
          ) : (
            <p className="text-sm text-text-muted">{profile.name}</p>
          )}
        </div>

        {/* County */}
        <div>
          <label className="text-xs font-medium text-text-primary flex items-center gap-1.5 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-green-400" />
            {tr('profile.county')}
          </label>
          {editing ? (
            <select
              value={editCounty}
              onChange={e => setEditCounty(e.target.value)}
              className="w-full bg-dark-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-green-primary/50"
            >
              {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <p className="text-sm text-text-muted">{profile.county}</p>
          )}
        </div>

        {/* Farmer-specific fields */}
        {isFarmer && (
          <>
            <div>
              <label className="text-xs font-medium text-text-primary flex items-center gap-1.5 mb-1.5">
                <Sprout className="w-3.5 h-3.5 text-green-400" />
                {tr('profile.crops')}
              </label>
              {editing ? (
                <select
                  value={editCrop}
                  onChange={e => setEditCrop(e.target.value)}
                  className="w-full bg-dark-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-green-primary/50"
                >
                  {CROPS.map(c => (
                    <option key={c.value} value={c.value}>{c.label[language] || c.label.en}</option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-text-muted">
                  {profile.crops.map(c => c.crop).join(', ') || '-'}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-text-primary flex items-center gap-1.5 mb-1.5">
                <Building2 className="w-3.5 h-3.5 text-green-400" />
                {tr('profile.farmSize')}
              </label>
              {editing ? (
                <input
                  type="number"
                  value={editAcres}
                  onChange={e => setEditAcres(e.target.value)}
                  step="0.25"
                  className="w-full bg-dark-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-green-primary/50"
                />
              ) : (
                <p className="text-sm text-text-muted">
                  {profile.crops.reduce((s, c) => s + c.acres, 0)} acres
                </p>
              )}
            </div>
          </>
        )}

        {/* Language */}
        <div>
          <label className="text-xs font-medium text-text-primary flex items-center gap-1.5 mb-1.5">
            <Mail className="w-3.5 h-3.5 text-green-400" />
            {tr('profile.language')}
          </label>
          {editing ? (
            <select
              value={editLang}
              onChange={e => setEditLang(e.target.value as Language)}
              className="w-full bg-dark-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-green-primary/50"
            >
              <option value="en">English</option>
              <option value="sw">Kiswahili</option>
            </select>
          ) : (
            <p className="text-sm text-text-muted">{language === 'en' ? 'English' : 'Kiswahili'}</p>
          )}
        </div>

        {/* Save / edit */}
        <div className="pt-4 flex items-center gap-3">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-green-primary text-white rounded-lg text-sm font-medium hover:bg-green-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? tr('app.loading') : tr('profile.save')}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-border-subtle rounded-lg text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-5 py-2 border border-border-subtle rounded-lg text-sm text-text-primary hover:border-green-primary/40 transition-colors"
            >
              {tr('profile.edit')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Building2, MapPin, Percent, Sprout, ChevronRight } from 'lucide-react'
import { FarmerProfile, Language } from '@/lib/types'
import { CROPS, KENYAN_COUNTIES } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<FarmerProfile | null>(null)
  const [language, setLanguage] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit form state
  const [editCrop, setEditCrop] = useState('')
  const [editAcres, setEditAcres] = useState('')
  const [editLang, setEditLang] = useState<Language>('en')
  const [editCounty, setEditCounty] = useState('')

  useEffect(() => {
    const savedLang = localStorage.getItem('kilimo-language') as Language | null
    const savedProfile = localStorage.getItem('kilimo-profile')

    if (savedLang) setLanguage(savedLang)

    if (savedProfile) {
      try {
        const parsed: FarmerProfile = JSON.parse(savedProfile)
        setProfile(parsed)
        setEditCrop(parsed.crop)
        setEditAcres(String(parsed.acres))
        setEditLang(parsed.language)
        setEditCounty(parsed.county)
      } catch { /* corrupt */ }
    }

    setMounted(true)
  }, [])

  if (!mounted) return null
  if (!profile) return null

  const handleSave = () => {
    setSaving(true)
    const updated: FarmerProfile = {
      ...profile,
      crop: editCrop,
      acres: parseFloat(editAcres) || profile.acres,
      language: editLang,
      county: editCounty,
    }
    localStorage.setItem('kilimo-profile', JSON.stringify(updated))
    localStorage.setItem('kilimo-language', editLang)
    setProfile(updated)
    setLanguage(editLang)
    setEditing(false)
    setSaving(false)
  }

  const initials = profile.name
    ? profile.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '??'

  const cropInfo = CROPS.find(c => c.value === profile.crop)
  const cropLabel = cropInfo?.label[language] ?? profile.crop

  return (
    <div className="p-8 space-y-6 h-full overflow-y-auto max-w-3xl">
      <div>
        <p className="text-text-muted text-xs uppercase tracking-widest mb-1">account</p>
        <h1 className="text-2xl font-serif font-semibold text-text-primary">
          {language === 'sw' ? 'Wasifu Wangu' : 'My Profile'}
        </h1>
      </div>

      {/* Avatar + basic info */}
      <div className="bg-dark-mid border border-border-subtle rounded-xl p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-green-primary flex items-center justify-center text-lg font-bold text-green-100 shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-text-primary">{profile.name}</h2>
          <p className="text-sm text-text-muted">
            {profile.county} &middot; {profile.acres} acres &middot; {cropLabel}
          </p>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-dark-mid border border-border-subtle rounded-xl p-6 space-y-4">
        {/* Crop */}
        <div>
          <label className="text-xs font-medium text-text-primary flex items-center gap-1.5 mb-1.5">
            <Sprout className="w-3.5 h-3.5 text-green-400" />
            {language === 'sw' ? 'Zao' : 'Crop'}
          </label>
          {editing ? (
            <select
              value={editCrop}
              onChange={e => setEditCrop(e.target.value)}
              className="w-full bg-dark-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-green-primary/50"
            >
              {CROPS.map(c => (
                <option key={c.value} value={c.value}>{c.label[language]}</option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-text-muted">{cropLabel}</p>
          )}
        </div>

        {/* Acres */}
        <div>
          <label className="text-xs font-medium text-text-primary flex items-center gap-1.5 mb-1.5">
            <Percent className="w-3.5 h-3.5 text-green-400" />
            {language === 'sw' ? 'Ekari' : 'Acres'}
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
            <p className="text-sm text-text-muted">{profile.acres} acres</p>
          )}
        </div>

        {/* County */}
        <div>
          <label className="text-xs font-medium text-text-primary flex items-center gap-1.5 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-green-400" />
            {language === 'sw' ? 'Kaunti' : 'County'}
          </label>
          {editing ? (
            <select
              value={editCounty}
              onChange={e => setEditCounty(e.target.value)}
              className="w-full bg-dark-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-green-primary/50"
            >
              {KENYAN_COUNTIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-text-muted">{profile.county}</p>
          )}
        </div>

        {/* Language */}
        <div>
          <label className="text-xs font-medium text-text-primary flex items-center gap-1.5 mb-1.5">
            <Mail className="w-3.5 h-3.5 text-green-400" />
            {language === 'sw' ? 'Lugha' : 'Language'}
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

        {/* Status */}
        <div className="pt-4 border-t border-border-subtle">
          <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm text-text-muted">
              {language === 'sw' ? 'Akaunti imejazwa · Tathmini imekamilika' : 'Account complete · Assessment submitted'}
            </span>
          </div>
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
                {saving
                  ? (language === 'sw' ? 'Inahifadhi...' : 'Saving...')
                  : (language === 'sw' ? 'Hifadhi mabadiliko' : 'Save changes')}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-border-subtle rounded-lg text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                {language === 'sw' ? 'Ghairi' : 'Cancel'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-5 py-2 border border-border-subtle rounded-lg text-sm text-text-primary hover:border-green-primary/40 transition-colors"
            >
              {language === 'sw' ? 'Hariri wasifu' : 'Edit profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
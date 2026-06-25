'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, TrendingDown, Droplets, Home, AlertTriangle, Plus, Trash2, ChevronDown, Phone, Loader2 } from 'lucide-react'
import { FarmerProfile, Language, CropEntry } from '@/lib/types'
import { CROPS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { getToken } from '@/lib/auth'

const LOAN_PER_ACRE = 35000

interface CropRow {
  id: string
  crop: string
  acres: string
  isRented: boolean
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null)
  const [language, setLanguage] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [savingOnboard, setSavingOnboard] = useState(false)
  const [onboardPhone, setOnboardPhone] = useState('')
  const [cropRows, setCropRows] = useState<CropRow[]>([
    { id: generateId(), crop: '', acres: '', isRented: false },
  ])
  const [openSelect, setOpenSelect] = useState<string | null>(null)
  const [onboardErrors, setOnboardErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const savedLang = localStorage.getItem('kilimo-language') as Language | null
    const savedProfile = localStorage.getItem('kilimo-profile')
    if (savedLang) setLanguage(savedLang)

    const hydrate = (p: FarmerProfile) => {
      setProfile(p)
      if (p.language) setLanguage(p.language)
      if (p.role === 'farmer' && (!p.crops || p.crops.length === 0)) {
        setShowOnboarding(true)
      }
    }

    if (savedProfile) {
      try {
        const parsed: FarmerProfile = JSON.parse(savedProfile)
        hydrate(parsed)
        setLoading(false)
        setMounted(true)
        return
      } catch (e) {
        console.error('[dashboard] corrupt localStorage profile', e)
      }
    }

    ;(async () => {
      try {
        const token = getToken()
        if (!token) {
          setLoading(false)
          setMounted(true)
          return
        }
        const res = await fetch('/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          console.error('[dashboard] profile API returned', res.status)
          setError(`Failed to load profile (${res.status})`)
        } else {
          const data = await res.json()
          if (data.success && data.profile) {
            const p = data.profile as FarmerProfile
            hydrate(p)
            localStorage.setItem('kilimo-profile', JSON.stringify(p))
          } else {
            console.error('[dashboard] profile API error', data.error)
            setError(data.error || 'Failed to load profile')
          }
        }
      } catch (e) {
        console.error('[dashboard] profile fetch failed', e)
        setError('Network error loading profile')
      }
      setLoading(false)
      setMounted(true)
    })()
  }, [])

  const usedCrops = cropRows.filter(r => r.crop).map(r => r.crop)
  const totalOnboardAcres = cropRows.reduce((s, r) => s + (parseFloat(r.acres) || 0), 0)
  const rentedOnboardAcres = cropRows.reduce((s, r) => r.isRented ? s + (parseFloat(r.acres) || 0) : s, 0)
  const rentCharge = cropRows.reduce((s, r) => r.isRented ? s + (parseFloat(r.acres) || 0) * (parseFloat(r.rentPerAcre as string) || 0) : s, 0)

  const validateOnboard = () => {
    const e: Record<string, string> = {}
    cropRows.forEach(r => {
      if (!r.crop) e[`crop-${r.id}`] = 'Select a crop'
      if (!r.acres || parseFloat(r.acres) <= 0) e[`acres-${r.id}`] = 'Enter valid acreage'
    })
    if (cropRows.some(r => r.crop) && !onboardPhone.trim()) e['phone'] = 'Phone number required for M-Pesa disbursement'
    setOnboardErrors(e)
    return Object.keys(e).length === 0
  }

  const handleOnboardSave = async () => {
    if (!validateOnboard()) return
    setSavingOnboard(true)
    try {
      const token = getToken()
      const cropsData = cropRows
        .filter(r => r.crop && r.acres)
        .map(r => ({ crop: r.crop, acres: parseFloat(r.acres), isRented: r.isRented, rentPerAcre: r.isRented ? (parseFloat(r.rentPerAcre as string) || 0) : 0 }))

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ crops: cropsData, phone: onboardPhone, language }),
      })

      if (!res.ok) {
        console.error('[dashboard] onboard save failed', res.status)
        return
      }

      const data = await res.json()
      if (data.success && data.profile) {
        const p: FarmerProfile = data.profile
        setProfile(p)
        localStorage.setItem('kilimo-profile', JSON.stringify(p))
        setShowOnboarding(false)
      }
    } catch (e) {
      console.error('[dashboard] onboard save error', e)
    }
    setSavingOnboard(false)
  }

  if (!mounted) return null

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-text-muted text-sm">Loading profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <AlertTriangle className="w-12 h-12 text-yellow-400/50 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">Could not load profile</h2>
          <p className="text-sm text-text-muted mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-dark-mid border border-border-subtle text-sm text-text-primary hover:bg-dark-base">Retry</button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-dark-mid border border-border-subtle flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-text-muted/25" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">Profile not found</h2>
          <p className="text-sm text-text-muted">Please set up your farm profile to see your dashboard.</p>
        </div>
      </div>
    )
  }

  const crops = profile.crops || []
  const totalAcres = crops.reduce((sum, c) => sum + (c.acres || 0), 0)
  const rentedAcres = crops.reduce((sum, c) => (c.isRented ? sum + (c.acres || 0) : sum), 0)
  const estimatedLoan = Math.round(totalAcres * LOAN_PER_ACRE)

  const cropLabels = crops.map(entry => {
    const cropDef = CROPS.find(c => c.value === entry.crop)
    return cropDef?.label?.[language] ?? entry.crop
  }).join(', ')

  const repaymentMonth = 9
  const today = new Date()
  const remainingMonths = repaymentMonth - (today.getMonth() + 1) > 0
    ? repaymentMonth - (today.getMonth() + 1)
    : 0

  function getSeasonValue() {
    const m = new Date().getMonth() + 1
    if (m >= 3 && m <= 5) return { en: 'Long rains', sw: 'Masika' }
    if (m >= 10 && m <= 12) return { en: 'Short rains', sw: 'Vuli' }
    return { en: 'Dry season', sw: 'Kiangazi' }
  }

  return (
    <>
      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg bg-dark-mid border border-border-subtle rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Set up your farm</h2>
              <p className="text-sm text-text-muted mt-1">Add crops you grow so we can personalise your experience.</p>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-medium text-text-primary flex items-center gap-1.5 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-green-400" />
                M-Pesa Phone Number
              </label>
              <input
                type="tel"
                value={onboardPhone}
                onChange={e => setOnboardPhone(e.target.value)}
                placeholder="e.g. 0712345678"
                className={cn(
                  'w-full h-10 rounded-lg border bg-dark-base px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-green-primary/40',
                  onboardErrors['phone'] ? 'border-red-500/50' : 'border-border-subtle'
                )}
              />
              {onboardErrors['phone'] && <p className="mt-1 text-xs text-red-400">{onboardErrors['phone']}</p>}
            </div>

            {/* Crop rows */}
            {cropRows.map((row, idx) => (
              <div key={row.id} className="p-4 rounded-xl bg-dark-base border border-border-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted uppercase tracking-wider">Crop {idx + 1}</span>
                  {cropRows.length > 1 && (
                    <button type="button" onClick={() => { setCropRows(p => p.filter(r => r.id !== row.id)); setOnboardErrors({}) }} className="p-1 rounded-md text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="relative">
                  <button type="button" onClick={() => setOpenSelect(openSelect === row.id ? null : row.id)}
                    className={cn('w-full h-10 rounded-lg border bg-dark-base px-3 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-green-primary/40',
                      onboardErrors[`crop-${row.id}`] ? 'border-red-500/50' : 'border-border-subtle',
                      row.crop ? 'text-text-primary' : 'text-text-muted'
                    )}
                  >
                    {row.crop ? CROPS.find(c => c.value === row.crop)?.label[language] ?? row.crop : 'Select a crop'}
                    <ChevronDown className={cn('w-4 h-4 text-text-muted', openSelect === row.id && 'rotate-180')} />
                  </button>
                  {openSelect === row.id && (
                    <div className="absolute z-20 mt-1 w-full rounded-lg border border-border-subtle bg-dark-mid shadow-xl overflow-hidden">
                      {CROPS.map(c => (
                        <button key={c.value} type="button"
                          onClick={() => {
                            if (c.value !== row.crop && usedCrops.includes(c.value)) {
                              setOnboardErrors(p => ({ ...p, [`crop-${row.id}`]: 'Crop already added' }))
                            } else {
                              setCropRows(p => p.map(r => r.id === row.id ? { ...r, crop: c.value } : r))
                              setOnboardErrors(p => { const n = { ...p }; delete n[`crop-${row.id}`]; return n })
                            }
                            setOpenSelect(null)
                          }}
                          className={cn('w-full text-left px-3 py-2.5 text-sm transition-colors',
                            row.crop === c.value ? 'bg-green-primary/10 text-green-primary font-medium' : 'text-text-secondary hover:bg-green-primary/5'
                          )}
                        >{c.label[language]}</button>
                      ))}
                    </div>
                  )}
                  {onboardErrors[`crop-${row.id}`] && <p className="mt-1 text-xs text-red-400">{onboardErrors[`crop-${row.id}`]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Acres</label>
                  <input type="number" min="0.1" step="0.1" value={row.acres}
                    onChange={e => { setCropRows(p => p.map(r => r.id === row.id ? { ...r, acres: e.target.value } : r)); setOnboardErrors(p => { const n = { ...p }; delete n[`acres-${row.id}`]; return n }) }}
                    placeholder="e.g. 2.5"
                    className={cn('w-full h-10 rounded-lg border bg-dark-base px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-green-primary/40',
                      onboardErrors[`acres-${row.id}`] ? 'border-red-500/50' : 'border-border-subtle'
                    )}
                  />
                  {onboardErrors[`acres-${row.id}`] && <p className="mt-1 text-xs text-red-400">{onboardErrors[`acres-${row.id}`]}</p>}
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={row.isRented}
                    onChange={e => setCropRows(p => p.map(r => r.id === row.id ? { ...r, isRented: e.target.checked, rentPerAcre: e.target.checked ? '' : row.rentPerAcre } : r))}
                    className="w-4 h-4 rounded border-border-subtle bg-dark-base text-green-primary focus:ring-green-primary/40 accent-green-primary"
                  />
                  <span className="text-sm text-text-primary">Rented land</span>
                </label>
                {row.isRented && (
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Rent per acre (KES)</label>
                    <input type="number" min="0" step="100" value={row.rentPerAcre ?? ''}
                      onChange={e => setCropRows(p => p.map(r => r.id === row.id ? { ...r, rentPerAcre: e.target.value } : r))}
                      placeholder="e.g. 5000"
                      className="w-full h-10 rounded-lg border border-border-subtle bg-dark-base px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-green-primary/40"
                    />
                  </div>
                )}
              </div>
            ))}

            {cropRows.length < CROPS.length && (
              <button type="button" onClick={() => setCropRows(p => [...p, { id: generateId(), crop: '', acres: '', isRented: false }])}
                className="w-full h-10 rounded-lg border border-dashed border-border-subtle text-text-muted text-sm flex items-center justify-center gap-2 hover:border-green-primary/40 hover:text-green-primary transition-colors"
              >
                <Plus className="w-4 h-4" /> Add another crop
              </button>
            )}

            {totalOnboardAcres > 0 && (
              <div className="rounded-xl bg-dark-base border border-border-subtle p-4 space-y-2">
                <p className="text-xs text-text-muted uppercase tracking-wider">Summary</p>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Total acres</span>
                  <span className="text-text-primary font-medium">{totalOnboardAcres.toFixed(1)} acres</span>
                </div>
            {rentedOnboardAcres > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Rented charge ({rentedOnboardAcres.toFixed(1)} acres)</span>
                <span className="text-yellow-400 font-medium">KES {rentCharge.toLocaleString()}</span>
              </div>
            )}
            {cropRows.some(r => r.isRented) && (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Avg rent/acre</span>
                <span className="text-text-primary font-medium">KES {Math.round(rentedOnboardAcres > 0 ? rentCharge / rentedOnboardAcres : 0).toLocaleString()}</span>
              </div>
            )}
              </div>
            )}

            <button onClick={handleOnboardSave} disabled={savingOnboard}
              className="w-full h-11 rounded-lg bg-green-primary hover:bg-green-primary/90 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {savingOnboard && <Loader2 className="w-4 h-4 animate-spin" />}
              {savingOnboard ? 'Saving...' : 'Save & go to dashboard'}
            </button>
          </motion.div>
        </div>
      )}

      {/* Close dropdown backdrop */}
      {openSelect && <div className="fixed inset-0 z-40" onClick={() => setOpenSelect(null)} />}

      {/* Dashboard content */}
      <div className="p-8 space-y-8 h-full overflow-y-auto">
        <div>
          <p className="text-text-muted text-xs uppercase tracking-widest mb-1">welcome back</p>
          <h1 className="text-2xl font-serif font-semibold text-text-primary">{profile.name}</h1>
          <p className="text-sm text-text-muted mt-0.5">{profile.county} · {totalAcres.toFixed(1)} acres · {cropLabels}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {([
            { label: { en: 'Loan amount', sw: 'Mkopo' }, value: `KES ${estimatedLoan.toLocaleString()}`, sub: { en: `${totalAcres.toFixed(1)} acres · ${cropLabels}`, sw: `${totalAcres.toFixed(1)} eka · ${cropLabels}` }, icon: CreditCard, color: 'text-green-400', bg: 'bg-green-primary/10' },
            { label: { en: 'Repayment', sw: 'Malipo' }, value: { en: `${repaymentMonth} months`, sw: `Miezi ${repaymentMonth}` }, sub: { en: remainingMonths > 0 ? `${remainingMonths} months remaining` : 'Due now', sw: remainingMonths > 0 ? `Miezi ${remainingMonths} iliyobaki` : 'Inadaiwa sasa' }, icon: TrendingDown, color: 'text-yellow-400', bg: 'bg-yellow-primary/10' },
            { label: { en: 'Current season', sw: 'Msimu' }, value: getSeasonValue(), sub: { en: 'See farm tips', sw: 'Angalia vidokezo' }, icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-primary/10' },
          ] as const).map((card, idx) => (
            <div key={idx} className="bg-dark-mid border border-border-subtle rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <div className={cn('p-1.5 rounded-lg', card.bg)}><card.icon className={cn('w-5 h-5', card.color)} /></div>
                <span className="text-xs text-text-muted font-medium uppercase tracking-wider">{card.label[language] ?? card.label.en}</span>
              </div>
              <p className="text-xl font-semibold text-text-primary">
                {typeof card.value === 'string' ? card.value : (card.value as Record<string,string>)[language] ?? (card.value as Record<string,string>).en}
              </p>
              <p className="text-xs text-text-muted/70 leading-snug">{(typeof card.sub === 'object' ? (card.sub as Record<string,string>)[language] ?? (card.sub as Record<string,string>).en : card.sub)}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-dark-mid border border-border-subtle rounded-xl p-5">
            <p className="text-xs uppercase tracking-wider text-text-muted mb-4">{language === 'sw' ? 'Mazao' : 'Crops'}</p>
            {crops.length === 0 ? (
              <p className="text-sm text-text-muted">{language === 'sw' ? 'Hakuna mazao bado' : 'No crops added yet'}</p>
            ) : (
              <div className="space-y-3">
                {crops.map((entry, i) => {
                  const cropDef = CROPS.find(c => c.value === entry.crop)
                  const label = cropDef?.label?.[language] ?? entry.crop
                  return (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-text-primary">{label}</span>
                        {entry.isRented && <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-primary/10 text-yellow-400 font-medium">{language === 'sw' ? 'Kukodi' : 'Rented'}</span>}
                      </div>
                      <span className="text-text-muted">{entry.acres} {language === 'sw' ? 'eka' : 'ac'}</span>
                    </div>
                  )
                })}
              </div>
            )}
            {crops.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border-subtle flex justify-between text-sm">
                <span className="text-text-muted">{language === 'sw' ? 'Jumla' : 'Total'}</span>
                <span className="text-text-primary font-semibold">{totalAcres.toFixed(1)} {language === 'sw' ? 'eka' : 'acres'}</span>
              </div>
            )}
          </div>

          <div className="bg-dark-mid border border-border-subtle rounded-xl p-5">
            <p className="text-xs uppercase tracking-wider text-text-muted mb-4">{language === 'sw' ? 'Shamba la Kukodi' : 'Rented Land'}</p>
            {rentedAcres > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-primary/10 flex items-center justify-center"><Home className="w-5 h-5 text-yellow-400" /></div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{rentedAcres.toFixed(1)} {language === 'sw' ? 'eka zilizokodiwa' : 'rented acres'}</p>
                    <p className="text-xs text-text-muted">KES {profile.rentCostPerAcre?.toLocaleString() || '0'}/{language === 'sw' ? 'eka' : 'acre'}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-border-subtle flex justify-between text-sm">
                  <span className="text-text-muted">{language === 'sw' ? 'Ada ya kukodi' : 'Rent charge'}</span>
                  <span className="text-yellow-400 font-semibold">KES {((profile.rentCostPerAcre || 0) * rentedAcres).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-muted">{language === 'sw' ? 'Hakuna shamba la kukodi.' : 'No rented land.'}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-dark-mid border border-border-subtle rounded-xl p-5">
            <p className="text-xs uppercase tracking-wider text-text-muted mb-3">Repayment plan</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 rounded-full bg-green-300 flex items-center justify-center text-amber-900 text-[10px] font-bold">OK</div>
              <div><p className="text-sm font-medium text-text-primary">KES 60,000 — Pay now</p><p className="text-xs text-text-muted">Jul 2026 installment</p></div>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 rounded-full bg-dark-base border border-border-subtle flex items-center justify-center text-amber-100 text-[10px] font-bold">OK</div>
              <div><p className="text-sm font-medium text-text-muted">KES 60,000 — Aug 2026</p><p className="text-xs text-text-muted">2 upcoming installments</p></div>
            </div>
            <button className="mt-2 text-xs text-green-400 hover:text-green-300 transition-colors">View full plan &rsaquo;</button>
          </div>
          <div className="bg-dark-mid border border-border-subtle rounded-xl p-5">
            <p className="text-xs uppercase tracking-wider text-text-muted mb-3">Farm tips</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-text-primary"><span className="text-green-400 mt-0.5">&bull;</span>Apply top-dressing fertilizer in the next 7 days for better maize yields</li>
              <li className="flex items-start gap-2 text-sm text-text-primary"><span className="text-green-400 mt-0.5">&bull;</span>Scout for fall armyworm — early signs reported in neighboring counties</li>
              <li className="flex items-start gap-2 text-sm text-text-primary"><span className="text-green-400 mt-0.5">&bull;</span>Contact your input supplier before the end of the month — discounts available</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

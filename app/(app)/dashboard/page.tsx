'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, TrendingDown, Droplets, Home, AlertTriangle, Plus, Trash2, ChevronDown, Phone, Loader2 } from 'lucide-react'
import { FarmerProfile, Language, CropEntry } from '@/lib/types'
import { CROPS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { getToken } from '@/lib/auth'
import { getAssessments, type StoredAssessment } from '@/lib/assessments'

interface CropRow {
  id: string
  crop: string
  acres: string
  isRented: boolean
  rentPerAcre?: string
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
  const [latestAssessment, setLatestAssessment] = useState<StoredAssessment | null>(null)

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

  // Load latest assessment from localStorage
  useEffect(() => {
    if (!profile) return
    const all = getAssessments()
    if (all.length > 0) {
      setLatestAssessment(all[0])
    }
  }, [profile])

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
  const perCropRented = crops.reduce((sum, c) => (c.isRented ? sum + (c.acres || 0) : sum), 0)
  const rentedAcres = perCropRented || profile.rentedAcres || 0
  const rentedCrops = crops.filter(c => c.isRented)
  const rentPerAcre = rentedCrops.length > 0
    ? Math.round(rentedCrops.reduce((s, c) => s + (c.rentPerAcre ?? 0), 0) / rentedCrops.length)
    : (profile.rentCostPerAcre ?? 0)
  const totalRentCharge = rentedCrops.length > 0
    ? Math.round(rentedCrops.reduce((s, c) => s + ((c.rentPerAcre ?? 0) * (c.acres ?? 0)), 0))
    : Math.round((profile.rentCostPerAcre ?? 0) * rentedAcres)
  const hasAssessment = !!latestAssessment
  const assessedLoan = latestAssessment?.scenarios?.recommendedMaxLoan ?? null
  const assessedLoanAmount = latestAssessment?.scenarios?.loanAmount ?? null

  const cropLabels = crops.map(entry => {
    const cropDef = CROPS.find(c => c.value === entry.crop)
    return cropDef?.label?.[language] ?? entry.crop
  }).join(', ')

  function getSeasonValue() {
    const m = new Date().getMonth() + 1
    if (m >= 3 && m <= 5) return { en: 'Long rains', sw: 'Masika' }
    if (m >= 10 && m <= 12) return { en: 'Short rains', sw: 'Vuli' }
    return { en: 'Dry season', sw: 'Kiangazi' }
  }

  function cropSpecificTips(crops: CropEntry[], lang: Language): string[] {
    const season = getSeasonValue()
    const firstCrop = crops[0]?.crop
    const tips: string[] = []
    const sw = lang === 'sw'

    if (firstCrop === 'maize' || crops.some(c => c.crop === 'maize')) {
      tips.push(sw
        ? 'Panda mbegu za mahindi mara tu mvua za masika zipo imara — usikimbilie mvua ya kwanza'
        : 'Plant maize seeds once the long rains are established — don\'t rush the first shower')
      tips.push(sw
        ? 'Tumia mbolea ya DAP wakati wa kupanda na CAN baadaye kwa mavuno bora'
        : 'Apply DAP fertilizer at planting and CAN for top-dressing for better yields')
    }
    if (firstCrop === 'beans' || crops.some(c => c.crop === 'beans')) {
      tips.push(sw
        ? 'Maharagwe hufanya vizuri kwenye udongo ulioandaliwa vizuri — epuka kuotesha kwenye udongo uliojaa maji'
        : 'Beans do well in well-prepared soil — avoid waterlogging at germination')
    }
    if (firstCrop === 'coffee' || crops.some(c => c.crop === 'coffee')) {
      tips.push(sw
        ? 'Kagua kahawa yako mara kwa mara kwa dalili za kutu ya kahawa (CLR) haswa wakati wa masika'
        : 'Scout coffee regularly for CLR (Coffee Leaf Rust) signs especially during the wet season')
    }
    if (firstCrop === 'tomatoes' || crops.some(c => c.crop === 'tomatoes')) {
      tips.push(sw
        ? 'Nyanya zinahitaji kupogolewa na kufungwa ili kuzuia magonjwa na kuboresha mtiririko wa hewa'
        : 'Prune and stake tomatoes to prevent disease and improve air circulation')
    }
    if (firstCrop === 'potatoes' || crops.some(c => c.crop === 'potatoes')) {
      tips.push(sw
        ? 'Zungusha viazi na mazao yasiyo ya mboga za mizizi ili kuepuka ugonjwa wa mchanga'
        : 'Rotate potatoes with non-root crops to avoid soil-borne diseases')
    }
    if (season.en === 'Long rains') {
      tips.push(sw
        ? 'Huu msimu unafaa kwa mazao ya mahindi, maharagwe, na mboga — panga ukuzaji wako ipasavyo'
        : 'This season is ideal for maize, beans, and vegetables — plan your planting accordingly')
    } else if (season.en === 'Short rains') {
      tips.push(sw
        ? 'Vuli inafaa zaidi kwa mboga za majani na maharagwe ya kukomaa haraka'
        : 'Short rains are best for leafy vegetables and fast-maturing beans')
    } else {
      tips.push(sw
        ? 'Kiangazi — zingatia umwagiliaji kwa mazao yaliyopo na uandae shamba kwa msimu ujao'
        : 'Dry season — consider irrigation for existing crops and prepare land for the next season')
    }
    tips.push(sw
      ? 'Wasiliana na afisa wa ugani wa eneo lako kwa ushauri wa kibinafsi'
      : 'Contact your local extension officer for personalized advice')

    return tips.slice(0, 4)
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
          {/* Loan amount card */}
          <div className="bg-dark-mid border border-border-subtle rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-green-primary/10"><CreditCard className="w-5 h-5 text-green-400" /></div>
              <span className="text-xs text-text-muted font-medium uppercase tracking-wider">{language === 'sw' ? 'Mkopo' : 'Loan amount'}</span>
            </div>
            {hasAssessment && assessedLoan ? (
              <>
                <p className="text-xl font-semibold text-text-primary">KES {assessedLoan.toLocaleString()}</p>
                <p className="text-xs text-text-muted/70 leading-snug">
                  {language === 'sw'
                    ? `Pendekezo la AI · KSh ${assessedLoanAmount?.toLocaleString() ?? '—'} uliouliza`
                    : `AI-recommended · You asked for KSh ${assessedLoanAmount?.toLocaleString() ?? '—'}`}
                </p>
              </>
            ) : (
              <>
                <p className="text-xl font-semibold text-text-muted/40">—</p>
                <a href="/chat" className="text-xs text-green-400 hover:text-green-300 transition-colors">
                  {language === 'sw' ? 'Anza tathmini ya mkopo' : 'Start a loan assessment'} &rsaquo;
                </a>
              </>
            )}
          </div>

          {/* Repayment card */}
          <div className="bg-dark-mid border border-border-subtle rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-yellow-primary/10"><TrendingDown className="w-5 h-5 text-yellow-400" /></div>
              <span className="text-xs text-text-muted font-medium uppercase tracking-wider">{language === 'sw' ? 'Malipo' : 'Repayment'}</span>
            </div>
            {hasAssessment && assessedLoan ? (
              (() => {
                const total = Math.round(assessedLoan * 1.18)
                const monthly = Math.round(total / 6)
                return <>
                  <p className="text-xl font-semibold text-text-primary">{language === 'sw' ? `KES ${monthly.toLocaleString()}/mwezi` : `KES ${monthly.toLocaleString()}/mo`}</p>
                  <p className="text-xs text-text-muted/70 leading-snug">{language === 'sw' ? `Jumla KES ${total.toLocaleString()} · miezi 6` : `Total KES ${total.toLocaleString()} · 6 months`}</p>
                </>
              })()
            ) : (
              <>
                <p className="text-xl font-semibold text-text-muted/40">—</p>
                <p className="text-xs text-text-muted/70 leading-snug">
                  {language === 'sw' ? 'Kamilisha tathmini kuona makadirio' : 'Complete assessment to see estimates'}
                </p>
              </>
            )}
          </div>

          {/* Current season card */}
          <div className="bg-dark-mid border border-border-subtle rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-primary/10"><Droplets className="w-5 h-5 text-blue-400" /></div>
              <span className="text-xs text-text-muted font-medium uppercase tracking-wider">{language === 'sw' ? 'Msimu' : 'Current season'}</span>
            </div>
            <p className="text-xl font-semibold text-text-primary">{getSeasonValue()[language] ?? getSeasonValue().en}</p>
            <p className="text-xs text-text-muted/70 leading-snug">
              {hasAssessment && latestAssessment?.riskLevel
                ? (language === 'sw'
                  ? `Hatari: ${latestAssessment.riskLevel === 'HIGH' ? 'Juu' : latestAssessment.riskLevel === 'MEDIUM' ? 'Wastani' : 'Chini'}`
                  : `Risk: ${latestAssessment.riskLevel}`)
                : (language === 'sw'
                  ? 'Hatari: — · ' : 'Risk: — · ')}
              {!hasAssessment && <a href="/chat" className="text-green-400 hover:text-green-300">{language === 'sw' ? 'Anza tathmini' : 'Assess now'}</a>}
            </p>
          </div>
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
                    <p className="text-xs text-text-muted">KES {rentPerAcre.toLocaleString()}/{language === 'sw' ? 'eka' : 'acre'}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-border-subtle flex justify-between text-sm">
                  <span className="text-text-muted">{language === 'sw' ? 'Ada ya kukodi' : 'Rent charge'}</span>
                  <span className="text-yellow-400 font-semibold">KES {totalRentCharge.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-muted">{language === 'sw' ? 'Hakuna shamba la kukodi.' : 'No rented land.'}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-dark-mid border border-border-subtle rounded-xl p-5">
            <p className="text-xs uppercase tracking-wider text-text-muted mb-3">{language === 'sw' ? 'Mpango wa malipo' : 'Repayment plan'}</p>
            {hasAssessment && assessedLoan ? (
              (() => {
                const monthly = Math.round(assessedLoan * 1.18 / 6)
                const now = new Date()
                const currentMonth = now.getMonth()
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                const nextMonth = (currentMonth + 1) % 12
                const nextNextMonth = (currentMonth + 2) % 12
                const currentYear = now.getFullYear()
                const year1 = nextMonth < currentMonth ? currentYear + 1 : currentYear
                const year2 = nextNextMonth < currentMonth ? currentYear + 1 : currentYear
                const instal1 = `${months[nextMonth]} ${year1}`
                const instal2 = `${months[nextNextMonth]} ${year2}`
                const remaining = 6 - 1 // first month is "due now"
                return <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-6 h-6 rounded-full bg-green-300 flex items-center justify-center text-amber-900 text-[10px] font-bold">OK</div>
                    <div><p className="text-sm font-medium text-text-primary">KES {monthly.toLocaleString()} — {language === 'sw' ? 'Lipa sasa' : 'Pay now'}</p><p className="text-xs text-text-muted">{instal1} {language === 'sw' ? 'awamu' : 'installment'}</p></div>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-6 h-6 rounded-full bg-dark-base border border-border-subtle flex items-center justify-center text-amber-100 text-[10px] font-bold">OK</div>
                    <div><p className="text-sm font-medium text-text-muted">KES {monthly.toLocaleString()} — {instal2}</p><p className="text-xs text-text-muted">{remaining} {language === 'sw' ? 'awamu zimesalia' : 'upcoming installments'}</p></div>
                  </div>
                </>
              })()
            ) : (
              <div className="py-4 text-center">
                <p className="text-sm text-text-muted mb-3">{language === 'sw' ? 'Hakuna mpango wa malipo bado' : 'No repayment plan yet'}</p>
                <a href="/chat" className="text-xs text-green-400 hover:text-green-300 transition-colors">{language === 'sw' ? 'Anza tathmini ya mkopo' : 'Start a loan assessment'} &rsaquo;</a>
              </div>
            )}
          </div>
          <div className="bg-dark-mid border border-border-subtle rounded-xl p-5">
            <p className="text-xs uppercase tracking-wider text-text-muted mb-3">{language === 'sw' ? 'Vidokezo vya kilimo' : 'Farm tips'}</p>
            <ul className="space-y-3">
              {crops.length > 0 ? cropSpecificTips(crops, language).map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-primary"><span className="text-green-400 mt-0.5">&bull;</span>{tip}</li>
              )) : (
                <li className="flex items-start gap-2 text-sm text-text-muted">{language === 'sw' ? 'Ongeza mazao yako ili kupata vidokezo' : 'Add your crops to get personalized tips'}</li>
              )}
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

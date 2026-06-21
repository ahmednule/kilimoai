'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronDown, Loader2, Plus, Trash2 } from 'lucide-react'
import { getLanguage, Language } from '@/lib/i18n'
import { CROPS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { CropEntry } from '@/lib/types'

interface CropRow {
  id: string
  crop: string
  acres: string
  isRented: boolean
}

const RENT_CHARGE_PER_ACRE = 5000

const UI_TEXT = {
  en: {
    step:        'Step 2 of 2',
    title:       'Tell us about your farm',
    subtitle:    'Add all the crops you grow. We\'ll use this to personalise your assessment.',
    cropLabel:   'Crop',
    cropPH:      'Select a crop',
    acresLabel:  'Acres',
    acresPH:     'e.g. 2.5',
    rentedLabel: 'Rented land',
    rentedHint:  'You are charged KES 5,000/acre for rented land',
    addCrop:     '+ Add another crop',
    cta:         'Go to my dashboard',
    loading:     'Setting up\u2026',
    errorCrop:   'Please select a crop',
    errorAcres:  'Enter a valid acreage (e.g. 1.5)',
    errorDuplicate: 'This crop is already added',
    rentCharge:  'Rented land charge',
    totalAcres:  'Total acres',
    summary:     'Summary',
  },
  sw: {
    step:        'Hatua ya 2 kati ya 2',
    title:       'Tuambie kuhusu shamba lako',
    subtitle:    'Ongeza mazao yote unayolima. Tutatumia hii kubinafsisha tathmini yako.',
    cropLabel:   'Zao',
    cropPH:      'Chagua zao',
    acresLabel:  'Ekari',
    acresPH:     'mfano 2.5',
    rentedLabel: 'Shamba la kukodi',
    rentedHint:  'Unatozwa KES 5,000/kwa ekari kwa shamba la kukodi',
    addCrop:     '+ Ongeza zao jingine',
    cta:         'Nenda kwenye dashibodi',
    loading:     'Inaweka\u2026',
    errorCrop:   'Tafadhali chagua zao',
    errorAcres:  'Ingiza ekari sahihi (mfano 1.5)',
    errorDuplicate: 'Zao hili tayari limeongezwa',
    rentCharge:  'Ada ya shamba la kukodi',
    totalAcres:  'Jumla ya ekari',
    summary:     'Muhtasari',
  },
}

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

export default function OnboardingPage() {
  const router = useRouter()
  const [lang,       setLang]       = useState<Language>('en')
  const [rows,       setRows]       = useState<CropRow[]>([
    { id: generateId(), crop: '', acres: '', isRented: false },
  ])
  const [openSelect, setOpenSelect] = useState<string | null>(null)
  const [errors,     setErrors]     = useState<Record<string, string>>({})
  const [loading,    setLoading]    = useState(false)

  useEffect(() => {
    setLang(getLanguage())

    const partial = localStorage.getItem('kilimo-profile-partial')
    if (!partial) {
      router.replace('/auth/signup')
    }
  }, [router])

  const t = UI_TEXT[lang]

  const usedCrops = rows.filter(r => r.crop).map(r => r.crop)

  const updateRow = (id: string, patch: Partial<CropRow>) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r))
    setErrors(e => { const n = { ...e }; delete n[id]; return n })
  }

  const removeRow = (id: string) => {
    if (rows.length <= 1) return
    setRows(prev => prev.filter(r => r.id !== id))
    setErrors(e => { const n = { ...e }; delete n[id]; return n })
  }

  const addRow = () => {
    setRows(prev => [...prev, { id: generateId(), crop: '', acres: '', isRented: false }])
  }

  const totalAcres = rows.reduce((sum, r) => sum + (parseFloat(r.acres) || 0), 0)
  const rentedAcres = rows.reduce((sum, r) => r.isRented ? sum + (parseFloat(r.acres) || 0) : sum, 0)
  const rentCharge = rentedAcres * RENT_CHARGE_PER_ACRE

  const validate = () => {
    const e: Record<string, string> = {}
    rows.forEach(r => {
      if (!r.crop) e[`crop-${r.id}`] = t.errorCrop
      if (!r.acres || parseFloat(r.acres) <= 0) e[`acres-${r.id}`] = t.errorAcres
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    const crops: CropEntry[] = rows.map(r => ({
      crop: r.crop,
      acres: parseFloat(r.acres),
      isRented: r.isRented,
    }))

    try {
      const raw     = localStorage.getItem('kilimo-profile-partial') ?? '{}'
      const partial = JSON.parse(raw)

      const token = localStorage.getItem('kilimo-token')

      const profile = {
        ...partial,
        crops,
        language: lang,
      }

      // Persist to Neo4j via API
      if (token) {
        await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profile),
        })
      }

      localStorage.setItem('kilimo-profile', JSON.stringify(profile))
      localStorage.removeItem('kilimo-profile-partial')
      localStorage.setItem('kilimo-onboarded', 'true')

      router.push('/dashboard')
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-base flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-[11px] text-text-muted mb-2">
            <span>{t.step}</span>
            <span>100%</span>
          </div>
          <div className="h-1 bg-border-subtle rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '50%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full bg-green-primary rounded-full"
            />
          </div>
        </div>

        <h1 className="font-serif text-2xl font-bold text-text-primary mb-1">{t.title}</h1>
        <p className="text-sm text-text-muted mb-8">{t.subtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {rows.map((row, idx) => (
            <div key={row.id} className="p-4 rounded-xl bg-dark-mid border border-border-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted uppercase tracking-wider">
                  {idx === 0 ? (rows.length === 1 ? t.cropLabel : `${t.cropLabel} 1`) : `${t.cropLabel} ${idx + 1}`}
                </span>
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="p-1 rounded-md text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Crop selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenSelect(openSelect === row.id ? null : row.id)}
                  className={cn(
                    'w-full h-10 rounded-lg border bg-dark-base px-3 text-sm text-left flex items-center justify-between transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-green-primary/40',
                    errors[`crop-${row.id}`] ? 'border-red-500/50' : 'border-border-subtle',
                    row.crop ? 'text-text-primary' : 'text-text-muted'
                  )}
                >
                  {row.crop
                    ? CROPS.find(c => c.value === row.crop)?.label[lang] ?? row.crop
                    : t.cropPH}
                  <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', openSelect === row.id && 'rotate-180')} />
                </button>

                {openSelect === row.id && (
                  <div className="absolute z-20 mt-1 w-full rounded-lg border border-border-subtle bg-dark-mid shadow-xl overflow-hidden">
                    {CROPS.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => {
                          if (c.value !== row.crop && usedCrops.some(x => x === c.value)) {
                            setErrors(p => ({ ...p, [`crop-${row.id}`]: t.errorDuplicate }))
                          } else {
                            updateRow(row.id, { crop: c.value })
                          }
                          setOpenSelect(null)
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2.5 text-sm transition-colors',
                          row.crop === c.value
                            ? 'bg-green-primary/10 text-green-primary font-medium'
                            : 'text-text-secondary hover:bg-green-primary/5'
                        )}
                      >
                        {c.label[lang]}
                      </button>
                    ))}
                  </div>
                )}
                {errors[`crop-${row.id}`] && <p className="mt-1 text-xs text-red-400">{errors[`crop-${row.id}`]}</p>}
              </div>

              {/* Acres */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  {t.acresLabel}
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={row.acres}
                  onChange={e => updateRow(row.id, { acres: e.target.value })}
                  placeholder={t.acresPH}
                  className={cn(
                    'w-full h-10 rounded-lg border bg-dark-base px-3 text-sm text-text-primary placeholder:text-text-muted transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-green-primary/40',
                    errors[`acres-${row.id}`] ? 'border-red-500/50' : 'border-border-subtle'
                  )}
                />
                {errors[`acres-${row.id}`] && <p className="mt-1 text-xs text-red-400">{errors[`acres-${row.id}`]}</p>}
              </div>

              {/* Rented toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={row.isRented}
                  onChange={e => updateRow(row.id, { isRented: e.target.checked })}
                  className="w-4 h-4 rounded border-border-subtle bg-dark-base text-green-primary focus:ring-green-primary/40 accent-green-primary"
                />
                <span className="text-sm text-text-primary">{t.rentedLabel}</span>
                <span className="text-xs text-text-muted">({t.rentedHint})</span>
              </label>
            </div>
          ))}

          {/* Add crop button */}
          {rows.length < CROPS.length && (
            <button
              type="button"
              onClick={addRow}
              className="w-full h-10 rounded-lg border border-dashed border-border-subtle text-text-muted text-sm flex items-center justify-center gap-2 hover:border-green-primary/40 hover:text-green-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t.addCrop}
            </button>
          )}

          {/* Summary */}
          {totalAcres > 0 && (
            <div className="rounded-xl bg-dark-mid border border-border-subtle p-4 space-y-2">
              <p className="text-xs text-text-muted uppercase tracking-wider">{t.summary}</p>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">{t.totalAcres}</span>
                <span className="text-text-primary font-medium">{totalAcres.toFixed(1)} acres</span>
              </div>
              {rentedAcres > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">{t.rentCharge} ({rentedAcres.toFixed(1)} acres)</span>
                  <span className="text-yellow-400 font-medium">KES {rentCharge.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-green-primary hover:bg-green-primary/90 text-text-primary font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? t.loading : t.cta}
          </button>
        </form>
      </motion.div>

      {/* Close crop dropdown on outside click */}
      {openSelect && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenSelect(null)} />
      )}
    </div>
  )
}
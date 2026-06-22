'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { CreditCard, Clock, CalendarDays, TrendingDown, Droplets, Home } from 'lucide-react'
import { FarmerProfile, Language } from '@/lib/types'
import { CROPS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const LOAN_PER_ACRE = 35000
const RENT_CHARGE_PER_ACRE = 5000

export default function DashboardPage() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null)
  const [language, setLanguage] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedProfile = localStorage.getItem('kilimo-profile')
    const savedLang = localStorage.getItem('kilimo-language') as Language | null

    if (savedLang) setLanguage(savedLang)

    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile))
      } catch {
        /* corrupt — handle gracefully */
      }
    }

    setMounted(true)
  }, [])

  if (!mounted) return null
  if (!profile) return null

  const crops = profile.crops || []
  const totalAcres = crops.reduce((sum, c) => sum + (c.acres || 0), 0)
  const rentedAcres = crops.reduce((sum, c) => (c.isRented ? sum + (c.acres || 0) : sum), 0)
  const estimatedLoan = Math.round(totalAcres * LOAN_PER_ACRE)
  const rentCharge = rentedAcres * RENT_CHARGE_PER_ACRE

  const cropLabels = crops.map(entry => {
    const cropDef = CROPS.find(c => c.value === entry.crop)
    return cropDef?.label?.[language] ?? entry.crop
  }).join(', ')

  const repaymentMonth = 9
  const today = new Date()
  const remainingMonths = repaymentMonth - (today.getMonth() + 1) > 0
    ? repaymentMonth - (today.getMonth() + 1)
    : 0

  const cards = [
    {
      label: { en: 'Loan amount',    sw: 'Mkopo'          },
      value: `KES ${estimatedLoan.toLocaleString()}`,
      sub:   { en: `${totalAcres.toFixed(1)} acres · ${cropLabels}`, sw: `${totalAcres.toFixed(1)} eka · ${cropLabels}` },
      icon:  CreditCard,
      color: 'text-green-400',
      bg:    'bg-green-primary/10',
    },
    {
      label: { en: 'Repayment',      sw: 'Malipo'        },
      value: { en: `${repaymentMonth} months`, sw: `Miezi ${repaymentMonth}` },
      sub:   {
        en: remainingMonths > 0 ? `${remainingMonths} months remaining` : 'Due now',
        sw: remainingMonths > 0 ? `Miezi ${remainingMonths} iliyobaki` : 'Inadaiwa sasa',
      },
      icon:  TrendingDown,
      color: 'text-yellow-400',
      bg:    'bg-yellow-primary/10',
    },
    {
      label: { en: 'Current season', sw: 'Msimu'         },
      value: getSeasonValue(),
      sub:   { en: 'See farm tips', sw: 'Angalia vidokezo' },
      icon:  Droplets,
      color: 'text-blue-400',
      bg:    'bg-blue-primary/10',
    },
  ] as const

  function getSeasonValue() {
    const m = new Date().getMonth() + 1
    if (m >= 3  && m <= 5)  return { en: 'Long rains',   sw: 'Masika'  }
    if (m >= 10 && m <= 12)  return { en: 'Short rains',  sw: 'Vuli'    }
    return { en: 'Dry season', sw: 'Kiangazi' }
  }

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto">
      <div>
        <p className="text-text-muted text-xs uppercase tracking-widest mb-1">welcome back</p>
        <h1 className="text-2xl font-serif font-semibold text-text-primary">
          {profile.name}
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          {profile.county} · {totalAcres.toFixed(1)} acres · {cropLabels}
        </p>
      </div>

      {/* Metric cards — 3-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="bg-dark-mid border border-border-subtle rounded-xl p-5 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2.5">
              <div className={cn('p-1.5 rounded-lg', card.bg)}>
                <card.icon className={cn('w-5 h-5', card.color)} />
              </div>
              <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
                {card.label[language as 'en'] ?? card.label.en}
              </span>
            </div>
            <p className="text-xl font-semibold text-text-primary">
              {typeof card.value === 'string' ? card.value : (card.value as Record<string,string>)[language] ?? (card.value as Record<string,string>).en}
            </p>
            <p className="text-xs text-text-muted/70 leading-snug">{card.sub[language as 'en'] ?? (card.sub as Record<string,string>).en}</p>
          </div>
        ))}
      </div>

      {/* Crops breakdown + rented land */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Crops breakdown */}
        <div className="bg-dark-mid border border-border-subtle rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-text-muted mb-4">{language === 'sw' ? 'Mazao' : 'Crops'}</p>
          <div className="space-y-3">
            {crops.map((entry, i) => {
              const cropDef = CROPS.find(c => c.value === entry.crop)
              const label = cropDef?.label?.[language] ?? entry.crop
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-text-primary">{label}</span>
                    {entry.isRented && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-primary/10 text-yellow-400 font-medium">
                        {language === 'sw' ? 'Kukodi' : 'Rented'}
                      </span>
                    )}
                  </div>
                  <span className="text-text-muted">{entry.acres} {language === 'sw' ? 'eka' : 'ac'}</span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-border-subtle flex justify-between text-sm">
            <span className="text-text-muted">{language === 'sw' ? 'Jumla' : 'Total'}</span>
            <span className="text-text-primary font-semibold">{totalAcres.toFixed(1)} {language === 'sw' ? 'eka' : 'acres'}</span>
          </div>
        </div>

        {/* Rented land summary */}
        <div className="bg-dark-mid border border-border-subtle rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-text-muted mb-4">{language === 'sw' ? 'Shamba la Kukodi' : 'Rented Land'}</p>
          {rentedAcres > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-primary/10 flex items-center justify-center">
                  <Home className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{rentedAcres.toFixed(1)} {language === 'sw' ? 'eka zilizokodiwa' : 'rented acres'}</p>
                  <p className="text-xs text-text-muted">KES {RENT_CHARGE_PER_ACRE.toLocaleString()}/{language === 'sw' ? 'eka' : 'acre'}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-border-subtle flex justify-between text-sm">
                <span className="text-text-muted">{language === 'sw' ? 'Ada ya kukodi' : 'Rent charge'}</span>
                <span className="text-yellow-400 font-semibold">KES {rentCharge.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-muted">
              {language === 'sw' ? 'Hakuna shamba la kukodi. Hutozwi ada yoyote.' : 'No rented land. No extra charges apply.'}
            </p>
          )}
        </div>
      </div>

      {/* Tips / upcoming */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-dark-mid border border-border-subtle rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-text-muted mb-3">Repayment plan</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 rounded-full bg-green-300 flex items-center justify-center text-amber-900 text-[10px] font-bold">
              OK
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">KES 60,000 — Pay now</p>
              <p className="text-xs text-text-muted">Jul 2026 installment</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 rounded-full bg-dark-base border border-border-subtle flex items-center justify-center text-amber-100 text-[10px] font-bold">
              OK
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">KES 60,000 — Aug 2026</p>
              <p className="text-xs text-text-muted">2 upcoming installments</p>
            </div>
          </div>
          <button className="mt-2 text-xs text-green-400 hover:text-green-300 transition-colors">
            View full plan &rsaquo;
          </button>
        </div>

        <div className="bg-dark-mid border border-border-subtle rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-text-muted mb-3">Farm tips</p>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm text-text-primary">
              <span className="text-green-400 mt-0.5">&bull;</span>
              Apply top-dressing fertilizer in the next 7 days for better maize yields
            </li>
            <li className="flex items-start gap-2 text-sm text-text-primary">
              <span className="text-green-400 mt-0.5">&bull;</span>
              Scout for fall armyworm — early signs reported in neighboring counties
            </li>
            <li className="flex items-start gap-2 text-sm text-text-primary">
              <span className="text-green-400 mt-0.5">&bull;</span>
              Contact your input supplier before the end of the month — discounts available
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
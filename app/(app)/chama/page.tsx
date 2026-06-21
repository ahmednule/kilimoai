'use client'

import { useState, useEffect } from 'react'
import { Users, TrendingUp, UserPlus, Sparkle, ChevronDown, Wallet, Shield, UsersRound, Coins } from 'lucide-react'
import { Language } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function ChamaPage() {
  const [language, setLanguage] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedLang = localStorage.getItem('kilimo-language') as Language | null
    if (savedLang) setLanguage(savedLang)
    setMounted(true)
  }, [])

  if (!mounted) return null

  const GROUP_LOANS = {
    en: {
      title: 'Chama Group Loans',
      subtitle: 'Pool resources for larger, lower-interest loans',
      description: 'Kilimo AI partners with registered Chamas, cooperatives, and farmer groups to offer discounted loans with shared liability.',
      items: [
        {
          title: 'Group Discount Rate',
          desc: 'Group loans with lower interest rates starting at 4.5% p.a.',
          icon: TrendingUp,
          color: 'text-green-400',
          bg: 'bg-green-primary/10',
        },
        {
          title: 'Shared Liability',
          desc: 'Group members co-guarantee each other, making approval easier',
          icon: UsersRound,
          color: 'text-blue-400',
          bg: 'bg-blue-400/10',
        },
        {
          title: 'Mutual Savings Pool',
          desc: 'Build a rainy-day fund the whole Chama can draw from during planting season',
          icon: Coins,
          color: 'text-yellow-400',
          bg: 'bg-yellow-primary/10',
        },
        {
          title: 'Collective Buying',
          desc: 'Negotiate input suppliers as a group and save on fertilizer, seeds, equipment',
          icon: Shield,
          color: 'text-purple-400',
          bg: 'bg-purple-400/10',
        },
      ],
      cta: 'Register your chama',
      ctaDesc: 'Get 10+ members together and qualify for our best rates',
      stats: [
        { value: '4.5%', label: 'Min interest rate' },
        { value: '10+',    label: 'Members required' },
        { value: 'KES 2M', label: 'Max loan per group' },
      ],
    },
    sw: {
      title: 'Mikopo ya Vikundi vya Chama',
      subtitle: 'Weka rasilimali pamoja kwa mikopo mikubwa yenye riba ndogo',
      description: 'Kilimo AI inashirikiana na Chama, ushirika, na vikundi vya wakulima kutoa mikopo yenye punguzo na dhamana ya pamoja.',
      items: [
        {
          title: 'Kiwango cha Punguzo la Kikundi',
          desc: 'Mikopo ya kikundi yenye viwango vya chini vya riba kuanzia 4.5% kwa mwaka',
          icon: TrendingUp,
          color: 'text-green-400',
          bg: 'bg-green-primary/10',
        },
        {
          title: 'Dhamana ya Pamoja',
          desc: 'Wanakikundi wanadhamini wao kwa wao, na kurahisisha kuidhika',
          icon: UsersRound,
          color: 'text-blue-400',
          bg: 'bg-blue-400/10',
        },
        {
          title: 'Hazina ya Akiba ya Pamoja',
          desc: 'Tengeneza hazina ya siku ngumu ambayo Chama nzima inaweza kutumia wakati wa msimu wa kupanda',
          icon: Coins,
          color: 'text-yellow-400',
          bg: 'bg-yellow-primary/10',
        },
        {
          title: 'Manunuzi ya Pamoja',
          desc: 'Shirikiana kujadili na wauzaji wa pembejeo kwa punguzo la mbolea, mbegu, vifaa',
          icon: Shield,
          color: 'text-purple-400',
          bg: 'bg-purple-400/10',
        },
      ],
      cta: 'Sajili chama yako',
      ctaDesc: 'Kusanya wanachama 10+ na ufuzu kwa viwango vyetu bora',
      stats: [
        { value: '4.5%', label: 'Riba ya chini' },
        { value: '10+',    label: 'Wanachama wanaohitajika' },
        { value: 'KES 2M',  label: 'Mkopo wa juu kwa kikundi' },
      ],
    },
  }

  const t = GROUP_LOANS[language]

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <p className="text-text-muted text-xs uppercase tracking-widest mb-1">GROUP FINANCE</p>
        <h1 className="text-2xl font-serif font-semibold text-text-primary">{t.title}</h1>
        <p className="text-sm text-text-muted mt-1 max-w-2xl">
          {t.subtitle}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {t.stats.map((s, i) => (
          <div key={i} className="bg-dark-mid border border-border-subtle rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-text-primary">{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="max-w-2xl">
        <p className="text-sm text-text-muted leading-relaxed">{t.description}</p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {t.items.map((item, idx) => (
          <div key={idx} className="bg-dark-mid border border-border-subtle rounded-xl p-5 flex items-start gap-3">
            <div className={cn('p-2 rounded-lg', item.bg)}>
              <item.icon className={cn('w-5 h-5', item.color)} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{item.title}</p>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-green-primary/10 to-dark-mid border border-green-primary/20 rounded-xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-base font-semibold text-text-primary">
              {language === 'sw' ? 'Tayari kuanza?' : 'Ready to get started?'}
            </p>
            <p className="text-xs text-text-muted mt-1">{t.ctaDesc}</p>
          </div>
          <button className="px-5 py-2.5 bg-green-primary text-white rounded-lg text-sm font-medium hover:bg-green-primary/90 transition-colors flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            {t.cta}
          </button>
        </div>
      </div>
    </div>
  )
}
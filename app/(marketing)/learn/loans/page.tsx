'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, TrendingDown, Sun, Droplets, ArrowRight, ClipboardCheck, Calculator, Coins, CheckCircle2, AlertTriangle, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { FabButton } from '@/components/chatbot/FabButton'
import { useLanguage, FloatingOrb, FadeInView, TiltCard } from '@/components/marketing/shared'

const UI_TEXT = {
  en: {
    badge: 'Loans',
    title: 'Know If a Loan Makes Sense Before You Borrow',
    subtitle: 'We don\'t sell loans. We tell you the truth about whether a loan is right for your farm.',
    problem: 'Most farm loans fail because of timing — planting when the rains are late, borrowing when prices are low, committing to repayment schedules that don\'t match harvest cycles.',
    problem2: 'Kilimo AI changes that by analyzing real data before you borrow.',
    scenariosTitle: 'Three Scenarios, One Honest Answer',
    scenariosSub: 'Instead of one optimistic projection, you get the full picture',
    bestTitle: 'Best Case',
    bestDesc: 'Rains come on time, yields hit the high end, market prices are favourable. Your loan is easily repayable.',
    expectedTitle: 'Expected Case',
    expectedDesc: 'Normal season based on historical averages. The most likely outcome for your county and crop.',
    worstTitle: 'Worst Case',
    worstDesc: 'Drought, pest outbreak, or price drop. We show you if you can still survive — or if you should wait.',
    whatWeAnalyzeTitle: 'What We Analyze',
    whatWeAnalyze1: '45-day rainfall forecast for your specific county',
    whatWeAnalyze2: 'Historical yield benchmarks for your crop',
    whatWeAnalyze3: 'Current market prices and seasonal trends',
    whatWeAnalyze4: 'Pest and disease risk in your area',
    whatWeAnalyze5: 'Your farm size, crop type, and planned inputs',
    cta: 'Check Your Loan Risk Now',
    ctaSub: 'Free. 3 minutes. No registration required.',
  },
  sw: {
    badge: 'Mikopo',
    title: 'Jua Kama Mkopo Una Maana Kabla ya Kukopa',
    subtitle: 'Hatuzi mikopo. Tunakuambia ukweli kuhusu kama mkopo unafaa kwa shamba lako.',
    problem: 'Mikopo mingi ya kilimo inashindwa kwa sababu ya wakati — kupanda wakati mvua ichelewa, kukopa wakati bei ni chini, kukubali ratiba za marejesho zisizolingana na msimu wa mavuno.',
    problem2: 'Kilimo AI inabadilisha hili kwa kuchambua data halisi kabla ya kukopa.',
    scenariosTitle: 'Matokeo Matatu, Jibu Moja la Kweli',
    scenariosSub: 'Badala ya utabiri mmoja wa matumaini, unapata picha kamili',
    bestTitle: 'Hali Bora',
    bestDesc: 'Mvua inakuja kwa wakati, mavuno ni mengi, bei za soko ni nzuri. Mkopo wako unalipika kwa urahisi.',
    expectedTitle: 'Hali Inayotarajiwa',
    expectedDesc: 'Msimu wa kawaida kulingana na wastani wa kihistoria. Matokeo yanayowezekana zaidi kwa kaunti na zao lako.',
    worstTitle: 'Hali Mbaya',
    worstDesc: 'Ukame, wadudu, au kushuka kwa bei. Tunaonyesha kama bado unaweza kuvumilia — au kama unapaswa kusubiri.',
    whatWeAnalyzeTitle: 'Tunachambua Nini',
    whatWeAnalyze1: 'Utabiri wa mvua wa siku 45 kwa kaunti yako',
    whatWeAnalyze2: 'Viwango vya mavuno ya kihistoria kwa zao lako',
    whatWeAnalyze3: 'Bei za sasa za soko na mwenendo wa msimu',
    whatWeAnalyze4: 'Hatari ya wadudu na magonjwa katika eneo lako',
    whatWeAnalyze5: 'Ukubwa wa shamba lako, aina ya zao, na pembejeo zilizopangwa',
    cta: 'Angalia Hatari ya Mkopo Wako Sasa',
    ctaSub: 'Bure. Dakika 3. Hakuna usajili unaohitajika.',
  },
}

export default function LoansPage() {
  const { language } = useLanguage()
  const t = UI_TEXT[language]

  const scenarios = [
    { icon: TrendingDown, title: t.bestTitle, desc: t.bestDesc, color: '#22C55E', border: 'border-risk-low/30', bg: 'bg-risk-low/5' },
    { icon: BarChart3, title: t.expectedTitle, desc: t.expectedDesc, color: '#D4A843', border: 'border-risk-medium/30', bg: 'bg-risk-medium/5' },
    { icon: AlertTriangle, title: t.worstTitle, desc: t.worstDesc, color: '#EF4444', border: 'border-risk-high/30', bg: 'bg-risk-high/5' },
  ]

  const analysisItems = [
    { icon: Droplets, text: t.whatWeAnalyze1, color: '#2B6CB0' },
    { icon: BarChart3, text: t.whatWeAnalyze2, color: '#D4A843' },
    { icon: TrendingDown, text: t.whatWeAnalyze3, color: '#22C55E' },
    { icon: ShieldCheck, text: t.whatWeAnalyze4, color: '#EF4444' },
    { icon: Sun, text: t.whatWeAnalyze5, color: '#1A7A4A' },
  ]

  return (
    <main className="relative">
      {/* ─── Hero ─── */}
      <section className="py-20 bg-dark-mid relative overflow-hidden">
        <FloatingOrb className="top-1/4 -right-20" size={300} color="rgba(212,168,67,0.04)" speed={25} delay={0} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <FadeInView>
            <span className="text-xs font-semibold tracking-widest uppercase text-gold-harvest mb-3 block">{t.badge}</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary mb-4">{t.title}</h1>
            <p className="text-lg text-gold-harvest font-medium mb-6">{t.subtitle}</p>
            <p className="text-text-muted text-sm max-w-2xl mx-auto leading-relaxed mb-4">{t.problem}</p>
            <p className="text-text-muted text-sm leading-relaxed">{t.problem2}</p>
          </FadeInView>
        </div>
      </section>

      {/* ─── Three Scenarios ─── */}
      <section className="py-16 bg-dark-base">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">{t.scenariosTitle}</h2>
            <p className="text-text-muted text-sm mt-2">{t.scenariosSub}</p>
          </FadeInView>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scenarios.map((s, i) => (
              <FadeInView key={i} delay={i * 0.15}>
                <div className={`rounded-2xl p-6 border ${s.border} ${s.bg} h-full`}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-dark-mid">
                    <s.icon className="w-6 h-6" style={{ color: s.color }} />
                  </div>
                  <h3 className="font-serif font-semibold text-text-primary mb-2">{s.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{s.desc}</p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* ─── What We Analyze ─── */}
      <section className="py-16 bg-dark-mid">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">{t.whatWeAnalyzeTitle}</h2>
          </FadeInView>

          <div className="space-y-3">
            {analysisItems.map((item, i) => (
              <FadeInView key={i} delay={i * 0.1} y={10}>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-base border border-border-subtle">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}15` }}>
                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <p className="text-text-muted text-sm">{item.text}</p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 bg-dark-base">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <FadeInView>
            <p className="text-text-muted text-sm mb-4">{t.ctaSub}</p>
            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold-harvest text-dark-base font-semibold rounded-xl hover:bg-gold-harvest/90 transition-all hover:scale-105 shadow-lg shadow-gold-harvest/20"
            >
              {t.cta}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </FadeInView>
        </div>
      </section>
      <FabButton />
    </main>
  )
}

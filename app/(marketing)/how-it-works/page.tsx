'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { MessageSquare, Cloud, BarChart3, ArrowRight, ClipboardCheck, Calculator, Coins, ShieldCheck, CheckCircle2, ChevronDown } from 'lucide-react'
import { FabButton } from '@/components/chatbot/FabButton'
import { useLanguage, FloatingOrb, FadeInView, TiltCard } from '@/components/marketing/shared'

const UI_TEXT = {
  en: {
    badge: 'Process',
    title: 'How It Works',
    step1Title: 'Tell us your plan',
    step1Desc: 'Crop, acreage, county, what you need to borrow',
    step2Title: 'We pull real data',
    step2Desc: 'Rainfall forecasts, yield benchmarks, market prices',
    step3Title: 'Get your honest verdict',
    step3Desc: 'Best case, expected, worst case — in Swahili or English',
    loanFlowTitle: 'Your Loan Assessment Journey',
    loanFlowSubtitle: 'Five simple steps from field plan to financial clarity',
    step1: 'Farm Profile',
    step1Desc: 'Tell us your crop, acreage, and county',
    step2: 'Loan Request',
    step2Desc: 'How much do you need and what for?',
    step3: 'Repayment Plan',
    step3Desc: 'When and how will you pay back?',
    step4: 'Risk Analysis',
    step4Desc: 'AI crunches weather, yield, and price data',
    step5: 'Your Verdict',
    step5Desc: '3 scenarios in Swahili — honest and clear',
    cta: 'Start Your Assessment',
    ctaSub: 'It takes 3 minutes. No registration.',
  },
  sw: {
    badge: 'Mchakato',
    title: 'Jinsi Inavyofanya Kazi',
    step1Title: 'Tuambie mpango wako',
    step1Desc: 'Zao, ekari, kaunti, unahitaji kukopa kiasi gani',
    step2Title: 'Tunapata data halisi',
    step2Desc: 'Utabiri wa mvua, viwango vya mavuno, bei za soko',
    step3Title: 'Pata hukumu yako ya kweli',
    step3Desc: 'Hali bora, inayotarajiwa, mbaya zaidi — kwa Kiswahili au Kiingereza',
    loanFlowTitle: 'Safari Yako ya Tathmini ya Mkopo',
    loanFlowSubtitle: 'Hatua tano rahisi kutoka mpango wa shamba hadi ufahamu wa kifedha',
    step1: 'Wasifu wa Shamba',
    step1Desc: 'Tuambie zao lako, ekari, na kaunti',
    step2: 'Ombi la Mkopo',
    step2Desc: 'Unahitaji kiasi gani na kwa nini?',
    step3: 'Mpango wa Marejesho',
    step3Desc: 'Lini na vipi utalipa?',
    step4: 'Uchambuzi wa Hatari',
    step4Desc: 'AI inachambua data ya hali ya hewa, mavuno, na bei',
    step5: 'Hukumu Yako',
    step5Desc: 'Matokeo 3 kwa Kiswahili — ya kweli na wazi',
    cta: 'Anza Tathmini Yako',
    ctaSub: 'Inachukua dakika 3. Hakuna usajili.',
  },
}

const STEP_COLORS = ['#1A7A4A', '#2B6CB0', '#D4A843']
const FLOW_ICONS = [ClipboardCheck, Calculator, Coins, ShieldCheck, CheckCircle2]
const FLOW_COLORS = ['#1A7A4A', '#2B6CB0', '#8B5E3C', '#D4A843', '#22C55E']

export default function HowItWorksPage() {
  const { language } = useLanguage()
  const router = useRouter()
  const t = UI_TEXT[language]

  const [hasProfile, setHasProfile] = useState(false)
  useEffect(() => {
    setHasProfile(!!localStorage.getItem('kilimo-profile'))
  }, [])

  const steps = [
    { icon: MessageSquare, title: t.step1Title, description: t.step1Desc, color: STEP_COLORS[0] },
    { icon: Cloud, title: t.step2Title, description: t.step2Desc, color: STEP_COLORS[1] },
    { icon: BarChart3, title: t.step3Title, description: t.step3Desc, color: STEP_COLORS[2] },
  ]

  const loanFlowSteps = [
    { title: t.step1, desc: t.step1Desc },
    { title: t.step2, desc: t.step2Desc },
    { title: t.step3, desc: t.step3Desc },
    { title: t.step4, desc: t.step4Desc },
    { title: t.step5, desc: t.step5Desc },
  ]

  return (
    <main className="relative">
      {/* ─── 3-Step Process ─── */}
      <section className="py-20 bg-dark-mid relative overflow-hidden">
        <FloatingOrb className="top-1/3 -right-20" size={250} color="rgba(212,168,67,0.04)" speed={30} delay={1} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInView className="text-center mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase text-gold-harvest mb-3 block">{t.badge}</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary">{t.title}</h1>
          </FadeInView>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-0.5">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-green-primary via-sky-blue to-gold-harvest origin-left"
              />
            </div>
            {steps.map((step, index) => (
              <FadeInView key={index} delay={index * 0.2}>
                <TiltCard className="relative bg-dark-base border border-border-subtle rounded-2xl p-6 text-center hover:border-green-primary/20 transition-colors">
                  <div className="flex items-center justify-center mb-5">
                    <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gold-harvest text-dark-base font-bold text-sm flex items-center justify-center shadow-lg">
                      {index + 1}
                    </span>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${step.color}15` }}
                    >
                      <step.icon className="w-8 h-8" style={{ color: step.color }} />
                    </motion.div>
                  </div>
                  <h2 className="font-serif text-lg font-semibold text-text-primary mb-2">{step.title}</h2>
                  <p className="text-text-muted text-sm leading-relaxed">{step.description}</p>
                </TiltCard>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Loan Flow ─── */}
      <section className="py-20 bg-dark-base relative overflow-hidden">
        <FloatingOrb className="top-10 left-1/4" size={300} color="rgba(43,108,176,0.04)" speed={28} delay={0} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInView className="text-center mb-4">
            <span className="text-xs font-semibold tracking-widest uppercase text-sky-blue mb-3 block">
              {language === 'en' ? 'Your Journey' : 'Safari Yako'}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary mb-3">{t.loanFlowTitle}</h2>
            <p className="text-text-muted text-base max-w-xl mx-auto">{t.loanFlowSubtitle}</p>
          </FadeInView>

          <div className="mt-12 relative">
            <div className="hidden lg:block absolute top-12 left-[5%] right-[5%] h-0.5">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-green-primary via-sky-blue via-earth-brown via-gold-harvest to-risk-low origin-left"
              />
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.2, type: 'spring' }}
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-dark-base shadow-lg"
                  style={{ left: `${i * 25}%`, backgroundColor: FLOW_COLORS[i] }}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {loanFlowSteps.map((step, index) => {
                const Icon = FLOW_ICONS[index]
                return (
                  <FadeInView key={index} delay={index * 0.15}>
                    <TiltCard className="group bg-dark-mid border border-border-subtle rounded-2xl p-5 text-center transition-colors h-full">
                      <motion.div
                        whileHover={{ rotateY: 360 }}
                        transition={{ duration: 0.6 }}
                        className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: `${FLOW_COLORS[index]}15` }}
                      >
                        <Icon className="w-7 h-7" style={{ color: FLOW_COLORS[index] }} />
                      </motion.div>
                      <div className="w-6 h-6 rounded-full bg-dark-base border-2 mx-auto mb-3 flex items-center justify-center text-xs font-bold"
                        style={{ borderColor: FLOW_COLORS[index], color: FLOW_COLORS[index] }}
                      >
                        {index + 1}
                      </div>
                      <h3 className="font-serif font-semibold text-text-primary text-sm mb-1.5">{step.title}</h3>
                      <p className="text-text-muted text-xs leading-relaxed">{step.desc}</p>
                    </TiltCard>
                  </FadeInView>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 bg-dark-mid">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <FadeInView>
            <p className="text-text-muted text-sm mb-4">{t.ctaSub}</p>
            <button
              onClick={() => router.push(hasProfile ? '/chat' : '/auth/login')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold-harvest text-dark-base font-semibold rounded-xl hover:bg-gold-harvest/90 transition-all hover:scale-105 shadow-lg shadow-gold-harvest/20 cursor-pointer"
            >
              {t.cta}
              <ArrowRight className="w-5 h-5" />
            </button>
          </FadeInView>
        </div>
      </section>

      <FabButton />
    </main>
  )
}

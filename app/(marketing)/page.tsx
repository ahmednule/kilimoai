'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, TrendingDown, Users, AlertTriangle, Sprout } from 'lucide-react'
import { FabButton } from '@/components/chatbot/FabButton'
import { useLanguage, FloatingOrb, StaggerWords, CountUp, FadeInView } from '@/components/marketing/shared'

const UI_TEXT = {
  en: {
    heroTitle: "Jua Ukweli Kabla ya Kukopa",
    heroSubtitle: "Know the truth before you borrow",
    heroDescription: "AI-powered farm financial intelligence for Kenyan smallholder farmers. Real weather data. Real market prices. Real risk assessment — in Swahili.",
    ctaPrimary: "Check My Loan Risk — It's Free",
    ctaSecondary: "See How It Works",
    stat1: "30% of farm loans default due to poor timing",
    stat2: "1 extension worker per 1,000 farmers",
    stat3: "Ksh 2.4B lost to preventable defaults annually",
    bigStat: "KSh 2.4 Billion",
    bigStatLabel: "lost to preventable loan defaults every year in Kenya",
    trustFeature1: "Data-Driven, Not Guesswork",
    trustFeature2: "Swahili-First Design",
    trustFeature3: "No Hidden Agenda",
    trustFeature4: "100% Free for Farmers",
    tryNow: "Try it now — 3 minutes, no registration",
  },
  sw: {
    heroTitle: "Jua Ukweli Kabla ya Kukopa",
    heroSubtitle: "Fahamu ukweli kabla ya kukopa",
    heroDescription: "Akili ya fedha za kilimo inayoendeshwa na AI kwa wakulima wadogo wa Kenya. Data halisi ya hali ya hewa. Bei halisi za soko. Tathmini halisi ya hatari — kwa Kiswahili.",
    ctaPrimary: "Angalia Hatari ya Mkopo — Ni Bure",
    ctaSecondary: "Ona Jinsi Inavyofanya Kazi",
    stat1: "30% ya mikopo ya kilimo inashindwa kulipwa kutokana na wakati mbaya",
    stat2: "Mtaalamu 1 wa kilimo kwa wakulima 1,000",
    stat3: "Ksh 2.4B inapotea kwa kushindwa kulipa kuzuiliwa kila mwaka",
    bigStat: "KSh Bilioni 2.4",
    bigStatLabel: "inapotea kwa mikopo inayoshindwa kulipwa kila mwaka nchini Kenya",
    trustFeature1: "Inayoongozwa na Data, Si Makisio",
    trustFeature2: "Ubunifu wa Kiswahili Kwanza",
    trustFeature3: "Hakuna Ajenda ya Siri",
    trustFeature4: "Bure 100% kwa Wakulima",
    tryNow: "Jaribu sasa — dakika 3, hakuna usajili",
  },
}

export default function HomePage() {
  const { language } = useLanguage()
  const router = useRouter()
  const t = UI_TEXT[language]

  const [hasProfile, setHasProfile] = useState(false)
  useEffect(() => {
    setHasProfile(!!localStorage.getItem('kilimo-profile'))
  }, [])

  const stats = [
    { icon: TrendingDown, text: t.stat1 },
    { icon: Users, text: t.stat2 },
    { icon: AlertTriangle, text: t.stat3 },
  ]

  return (
    <main className="relative">
      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pb-8">
        <FloatingOrb className="top-1/4 -right-24" size={400} color="rgba(26,122,74,0.08)" speed={25} delay={0} />
        <FloatingOrb className="bottom-1/4 -left-24" size={350} color="rgba(212,168,67,0.06)" speed={22} delay={2} />
        <FloatingOrb className="top-1/2 left-1/3" size={200} color="rgba(43,108,176,0.06)" speed={18} delay={4} />

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-primary/30 to-transparent" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <StaggerWords
              text={t.heroTitle}
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary leading-tight px-2 block"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-3 text-lg sm:text-xl text-gold-harvest font-medium"
            >
              {t.heroSubtitle}
            </motion.p>

            {/* Big stat */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.6, ease: 'easeOut' }}
              className="mt-8 mb-6"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-risk-high via-gold-harvest to-risk-high bg-clip-text text-transparent"
                style={{
                  backgroundSize: '200% auto',
                  animation: 'shimmer 3s linear infinite',
                }}
              >
                {t.bigStat}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.3 }}
                className="mt-2 text-sm sm:text-base text-risk-high/80 font-medium max-w-md mx-auto leading-snug"
              >
                {t.bigStatLabel}
              </motion.p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.5 }}
              className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed px-4"
            >
              {t.heroDescription}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.7 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 px-4"
            >
              <motion.button
                onClick={() => router.push(hasProfile ? '/chat' : '/auth/login')}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold-harvest text-dark-base font-semibold rounded-xl hover:bg-gold-harvest/90 transition-all duration-200 active:scale-95 shadow-lg shadow-gold-harvest/20 min-h-[56px] relative overflow-hidden cursor-pointer"
              >
                <motion.span
                  className="absolute inset-0 bg-white/20 rounded-xl"
                  animate={{ scale: [1, 1.5, 1], opacity: [0, 0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  {t.ctaPrimary}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
              <Link
                href="/how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border border-text-muted/30 text-text-primary font-semibold rounded-xl hover:bg-text-primary/5 transition-all duration-200 min-h-[56px]"
              >
                {t.ctaSecondary}
                <ChevronDown className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2 }}
              className="mt-6 text-xs text-text-muted"
            >
              {t.tryNow}
            </motion.p>
          </div>

          {/* Stat cards */}
          <div className="mt-14 grid grid-cols-1 gap-4 max-w-4xl mx-auto px-4 md:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.9 + index * 0.15 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-dark-mid/80 backdrop-blur-sm border border-border-subtle rounded-xl p-4 flex items-start gap-3 hover:border-risk-high/30 transition-colors cursor-default"
              >
                <div className="w-10 h-10 rounded-lg bg-risk-high/10 flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-5 h-5 text-risk-high" />
                </div>
                <p className="text-sm text-text-muted leading-relaxed">{stat.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="mt-12 flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-text-muted"
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="py-10 bg-green-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1),transparent)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <CountUp target={15} label="+ loan products" duration={2} />
            <CountUp target={47} label="counties covered" duration={2} />
            <CountUp target={3} label="scenario outcomes" duration={2} />
            <CountUp target={100} label="% free for farmers" duration={2} />
          </div>
        </div>
      </section>

      {/* ─── Quick trust bar ─── */}
      <section className="py-14 bg-dark-base">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView className="text-center mb-2">
            <p className="text-xs font-semibold tracking-widest uppercase text-text-muted">
              {language === 'en' ? 'Why Farmers Trust Kilimo AI' : 'Kwa Nini Wakulima Wanaamini Kilimo AI'}
            </p>
          </FadeInView>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              t.trustFeature1,
              t.trustFeature2,
              t.trustFeature3,
              t.trustFeature4,
            ].map((item, i) => (
              <FadeInView key={i} delay={i * 0.1}>
                <div className="text-center p-4 rounded-xl bg-dark-mid border border-border-subtle h-full">
                  <div className="w-8 h-8 rounded-lg bg-green-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Sprout className="w-4 h-4 text-green-primary" />
                  </div>
                  <p className="text-sm text-text-primary font-medium">{item}</p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      <FabButton />
    </main>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingDown, Users, AlertTriangle, Sprout, MessageSquare, Cloud, BarChart3, Camera, Languages, Wifi, LogIn, UserPlus } from 'lucide-react'
import { FabButton } from '@/components/chatbot/FabButton'

type Language = 'en' | 'sw'

const UI_TEXT = {
  en: {
    heroTitle: "Jua Ukweli Kabla ya Kukopa",
    heroSubtitle: "Know the truth before you borrow",
    heroDescription: "AI-powered farm financial intelligence for Kenyan smallholder farmers. Real weather data. Real market prices. Real risk assessment â€” in Swahili.",
    ctaPrimary: "Check My Loan Risk",
    ctaSecondary: "See How It Works",
    stat1: "30% of farm loans default due to poor timing",
    stat2: "1 extension worker per 1,000 farmers",
    stat3: "Ksh 2.4B lost to preventable defaults annually",
    howItWorksTitle: "How It Works",
    step1Title: "Tell us your plan",
    step1Desc: "Crop, acreage, county, what you need to borrow",
    step2Title: "We pull real data",
    step2Desc: "Rainfall forecasts, yield benchmarks, market prices",
    step3Title: "Get your honest verdict",
    step3Desc: "Best case, expected, worst case â€” in Swahili or English",
    featuresTitle: "Built for Kenyan Farmers",
    feature1Title: "Scenario Analysis",
    feature1Desc: "See all three outcomes, not just the optimistic one",
    feature2Title: "Weather Intelligence",
    feature2Desc: "Real Open-Meteo rainfall data for your county",
    feature3Title: "Pest Detection",
    feature3Desc: "Upload a photo, we adjust your loan recommendation",
    feature4Title: "Chama Mode",
    feature4Desc: "Group loans for cooperatives and savings groups",
    feature5Title: "Speaks Swahili",
    feature5Desc: "Full Swahili language support, not just translation",
    feature6Title: "Works Offline",
    feature6Desc: "PWA that works even with poor connectivity",
    statsBar1: "15+ loan products",
    statsBar2: "47 counties covered",
    statsBar3: "3 scenario outcomes",
    statsBar4: "100% free for farmers",
    ctaTitle: "Ready to borrow right?",
    ctaSubtitle: "It takes 3 minutes. No registration required.",
    ctaButton: "Start Your Assessment",
footerTagline: "Know the truth before you borrow",
    footerCredit: "Built for the Kenya AI Challenge 2026 | Mercy Corps AgriFin",
navLogin: "Log In",
    navSignup: "Sign Up",
  },
  sw: {
    heroTitle: "Jua Ukweli Kabla ya Kukopa",
    heroSubtitle: "Fahamu ukweli kabla ya kukopa",
    heroDescription: "Akili ya fedha za kilimo inayoendeshwa na AI kwa wakulima wadogo wa Kenya. Data halisi ya hali ya hewa. Bei halisi za soko. Tathmini halisi ya hatari â€” kwa Kiswahili.",
    ctaPrimary: "Angalia Hatari ya Mkopo",
    ctaSecondary: "Ona Jinsi Inavyofanya Kazi",
    stat1: "30% ya mikopo ya kilimo inashindwa kulipwa kutokana na wakati mbaya",
    stat2: "Mtaalamu 1 wa kilimo kwa wakulima 1,000",
    stat3: "Ksh 2.4B inapotea kwa kushindwa kulipa kuzuiliwa kila mwaka",
    howItWorksTitle: "Jinsi Inavyofanya Kazi",
    step1Title: "Tuambie mpango wako",
    step1Desc: "Zao, ekari, kaunti, unahitaji kukopa kiasi gani",
    step2Title: "Tunapata data halisi",
    step2Desc: "Utabiri wa mvua, viwango vya mavuno, bei za soko",
    step3Title: "Pata hukumu yako ya kweli",
    step3Desc: "Hali bora, inayotarajiwa, mbaya zaidi â€” kwa Kiswahili au Kiingereza",
    featuresTitle: "Imejengwa kwa Wakulima wa Kenya",
    feature1Title: "Uchambuzi wa Hali",
    feature1Desc: "Ona matokeo yote matatu, si ya matumaini tu",
    feature2Title: "Akili ya Hali ya Hewa",
    feature2Desc: "Data halisi ya mvua ya Open-Meteo kwa kaunti yako",
    feature3Title: "Kugundua Wadudu",
    feature3Desc: "Pakia picha, tunaboresha mapendekezo yako ya mkopo",
    feature4Title: "Hali ya Chama",
    feature4Desc: "Mikopo ya kikundi kwa vyama vya ushirika na vikundi vya akiba",
    feature5Title: "Inazungumza Kiswahili",
    feature5Desc: "Msaada kamili wa lugha ya Kiswahili, si tafsiri tu",
    feature6Title: "Inafanya Kazi Nje ya Mtandao",
    feature6Desc: "PWA inayofanya kazi hata na muunganisho mbaya",
    statsBar1: "15+ bidhaa za mikopo",
    statsBar2: "Kaunti 47 zimefunikwa",
    statsBar3: "Matokeo 3 ya hali",
    statsBar4: "Bure 100% kwa wakulima",
    ctaTitle: "Tayari kukopa sawa?",
    ctaSubtitle: "Inachukua dakika 3. Hakuna usajili unaohitajika.",
    ctaButton: "Anza Tathmini Yako",
    footerTagline: "Jua ukweli kabla ya kukopa",
    footerCredit: "Imejengwa kwa Changamoto ya AI ya Kenya 2026 | Mercy Corps AgriFin",
    navLogin: "Ingia",
    navSignup: "Jisajili",
  }
}

function LanguageToggle({ language, onChange }: { language: Language; onChange: (lang: Language) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-dark-mid p-1">
      <button
        type="button"
        onClick={() => {
          console.log('[v0] Language toggle clicked: EN')
          onChange('en')
        }}
        className={`min-w-[44px] min-h-[44px] flex items-center justify-center text-sm font-medium rounded-full transition-all duration-200 active:scale-95 ${
          language === 'en'
            ? "bg-green-primary text-text-primary"
            : "text-text-muted hover:text-text-primary"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => {
          console.log('[v0] Language toggle clicked: SW')
          onChange('sw')
        }}
        className={`min-w-[44px] min-h-[44px] flex items-center justify-center text-sm font-medium rounded-full transition-all duration-200 active:scale-95 ${
          language === 'sw'
            ? "bg-green-primary text-text-primary"
            : "text-text-muted hover:text-text-primary"
        }`}
      >
        SW
      </button>
    </div>
  )
}

export default function LandingPage() {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('kilimo-language') as Language | null
    if (saved) setLanguage(saved)
  }, [])

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('kilimo-language', lang)
  }

  const t = UI_TEXT[language]

  const stats = [
    { icon: TrendingDown, text: t.stat1 },
    { icon: Users, text: t.stat2 },
    { icon: AlertTriangle, text: t.stat3 },
  ]

  const steps = [
    { icon: MessageSquare, title: t.step1Title, description: t.step1Desc, color: '#1A7A4A' },
    { icon: Cloud, title: t.step2Title, description: t.step2Desc, color: '#2B6CB0' },
    { icon: BarChart3, title: t.step3Title, description: t.step3Desc, color: '#D4A843' },
  ]

  const features = [
    { icon: BarChart3, title: t.feature1Title, description: t.feature1Desc, color: '#D4A843' },
    { icon: Cloud, title: t.feature2Title, description: t.feature2Desc, color: '#2B6CB0' },
    { icon: Camera, title: t.feature3Title, description: t.feature3Desc, color: '#8B5E3C' },
    { icon: Users, title: t.feature4Title, description: t.feature4Desc, color: '#2C9E61' },
    { icon: Languages, title: t.feature5Title, description: t.feature5Desc, color: '#1A7A4A' },
    { icon: Wifi, title: t.feature6Title, description: t.feature6Desc, color: '#22C55E' },
  ]

  const statsBar = [t.statsBar1, t.statsBar2, t.statsBar3, t.statsBar4]

  return (
    <main className="relative z-10 min-h-screen bg-dark-base">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-base/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-10 h-10 rounded-xl bg-green-primary flex items-center justify-center group-hover:bg-green-light transition-colors">
                <Sprout className="w-6 h-6 text-text-primary" />
              </div>
              <span className="hidden sm:inline font-serif text-xl font-semibold text-text-primary">
                Kilimo AI
              </span>
            </Link>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link href="/auth/login" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-text-primary/5">
                <LogIn className="w-4 h-4" />
                <span className="hidden xs:inline">{t.navLogin}</span>
              </Link>
              <Link href="/auth/signup" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-green-primary hover:bg-green-light text-text-primary transition-colors rounded-lg">
                <UserPlus className="w-4 h-4" />
                <span className="hidden xs:inline">{t.navSignup}</span>
              </Link>
              <div className="w-px h-5 bg-border-subtle mx-0.5 hidden xs:block" />
            <LanguageToggle language={language} onChange={handleLanguageChange} />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-green-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gold-harvest/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight px-2">
              {t.heroTitle}
            </h1>
            
            <p className="mt-2 text-lg sm:text-xl text-gold-harvest font-medium">
              {t.heroSubtitle}
            </p>

            <p className="mt-6 text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed px-4">
              {t.heroDescription}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
              <Link
                href="/chat"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold-harvest text-dark-base font-semibold rounded-xl hover:bg-gold-harvest/90 transition-all duration-200 active:scale-95 shadow-lg shadow-gold-harvest/20 min-h-[56px]"
              >
                {t.ctaPrimary}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border border-text-muted/30 text-text-primary font-semibold rounded-xl hover:bg-text-primary/5 transition-all duration-200 min-h-[56px]"
              >
                {t.ctaSecondary}
              </a>
            </div>
          </div>

          {/* Floating stat cards */}
          <div className="mt-12 grid grid-cols-1 gap-4 max-w-4xl mx-auto px-4 md:grid-cols-3">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-dark-mid/80 backdrop-blur-sm border border-border-subtle rounded-xl p-4 flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-risk-high/10 flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-5 h-5 text-risk-high" />
                </div>
                <p className="text-sm text-text-muted leading-relaxed">
                  {stat.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-dark-mid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
              {t.howItWorksTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="relative bg-dark-base border border-border-subtle rounded-2xl p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gold-harvest text-dark-base font-bold text-sm flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${step.color}15` }}
                    >
                      <step.icon className="w-7 h-7" style={{ color: step.color }} />
                    </div>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-dark-base">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary">
              {t.featuresTitle}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-dark-mid border border-border-subtle rounded-2xl p-6 hover:border-green-primary/30 transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="font-serif text-lg font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 bg-green-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {statsBar.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-text-primary font-semibold text-sm md:text-base">
                  {stat}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-dark-mid">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              {t.ctaTitle}
            </h2>
            <p className="text-text-muted text-lg mb-8">
              {t.ctaSubtitle}
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold-harvest text-dark-base font-semibold rounded-xl hover:bg-gold-harvest/90 transition-all duration-200 hover:scale-105 shadow-lg shadow-gold-harvest/20"
            >
              {t.ctaButton}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-dark-base border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-green-primary flex items-center justify-center">
                <Sprout className="w-6 h-6 text-text-primary" />
              </div>
              <div>
                <span className="font-serif text-lg font-semibold text-text-primary">Kilimo AI</span>
                <p className="text-xs text-text-muted">{t.footerTagline}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageToggle language={language} onChange={handleLanguageChange} />
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border-subtle text-center">
            <p className="text-text-muted text-sm">{t.footerCredit}</p>
          </div>
        </div>
      </footer>
      <FabButton />
    </main>
  )
}

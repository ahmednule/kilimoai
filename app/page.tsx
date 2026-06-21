'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion'
import {
  ArrowRight, TrendingDown, Users, AlertTriangle, Sprout, MessageSquare,
  Cloud, BarChart3, Camera, Languages, Wifi, LogIn, UserPlus,
  FileText, Calculator, ShieldCheck, ClipboardCheck, Coins,
  ChevronDown, Star, PiggyBank, HeartHandshake, Landmark,
  Building2, TrendingUp, CheckCircle2
} from 'lucide-react'
import { FabButton } from '@/components/chatbot/FabButton'

type Language = 'en' | 'sw'

const UI_TEXT = {
  en: {
    heroTitle: "Jua Ukweli Kabla ya Kukopa",
    heroSubtitle: "Know the truth before you borrow",
    heroDescription: "AI-powered farm financial intelligence for Kenyan smallholder farmers. Real weather data. Real market prices. Real risk assessment — in Swahili.",
    heroBigStat: "KSh 2.4 Billion",
    heroBigStatLabel: "lost to preventable loan defaults every year in Kenya",
    ctaPrimary: "Check My Loan Risk — It's Free",
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
    step3Desc: "Best case, expected, worst case — in Swahili or English",
    featuresTitle: "Built for Kenyan Farmers",
    feature1Title: "Scenario Analysis",
    feature1Desc: "See all three outcomes — best, expected, worst case — not just the optimistic one. Make informed borrowing decisions with full transparency.",
    feature2Title: "Weather Intelligence",
    feature2Desc: "Real Open-Meteo rainfall data for your county. We check if the rains will come when your crop needs them most.",
    feature3Title: "Pest Detection",
    feature3Desc: "Upload a photo of your crop. Our AI detects pests and diseases, then adjusts your loan recommendation accordingly.",
    feature4Title: "Chama Mode",
    feature4Desc: "Group loans for cooperatives and savings groups. Manage contributions, track members, and apply as a collective.",
    feature5Title: "Speaks Swahili",
    feature5Desc: "Full Swahili language support — not just translation. Every feature, every report, every recommendation in Kiswahili.",
    feature6Title: "Works Offline",
    feature6Desc: "Progressive Web App that works even with poor connectivity. Your data syncs when you're back online.",
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
    loanFlowTitle: "Your Loan Assessment Journey",
    loanFlowSubtitle: "Five simple steps from field plan to financial clarity",
    loanFlowStep1Title: "Farm Profile",
    loanFlowStep1Desc: "Tell us your crop, acreage, and county",
    loanFlowStep2Title: "Loan Request",
    loanFlowStep2Desc: "How much do you need and what for?",
    loanFlowStep3Title: "Repayment Plan",
    loanFlowStep3Desc: "When and how will you pay back?",
    loanFlowStep4Title: "Risk Analysis",
    loanFlowStep4Desc: "AI crunches weather, yield, and price data",
    loanFlowStep5Title: "Your Verdict",
    loanFlowStep5Desc: "3 scenarios in Swahili — honest and clear",
    chamaTitle: "Stronger Together — Chama Mode",
    chamaSubtitle: "Designed for Kenya's 400,000+ savings groups and cooperatives",
    chamaFeature1Title: "Group Applications",
    chamaFeature1Desc: "Apply for loans as a registered chama. Your collective track record strengthens the application.",
    chamaFeature2Title: "Member Tracking",
    chamaFeature2Desc: "Track each member's contributions, attendance, and loan history in one place.",
    chamaFeature3Title: "Collective Risk Score",
    chamaFeature3Desc: "AI assesses the group's combined farming capacity for better loan terms.",
    chamaFeature4Title: "Transparent Ledger",
    chamaFeature4Desc: "Every contribution, every loan, every repayment — visible to all members.",
    trustTitle: "Why Farmers Trust Kilimo AI",
    trustItem1Title: "Data-Driven, Not Guesswork",
    trustItem1Desc: "We pull real weather forecasts, historical yields, and live market prices — not estimates.",
    trustItem2Title: "Swahili-First Design",
    trustItem2Desc: "Built in Swahili from day one. Every farmer understands every word.",
    trustItem3Title: "No Hidden Agenda",
    trustItem3Desc: "We don't sell loans. We tell you if a loan makes sense for your farm, period.",
    trustItem4Title: "Farmer Cooperatives Love Us",
    trustItem4Desc: "Already trusted by chamas across 12 counties for group loan assessments.",
  },
  sw: {
    heroTitle: "Jua Ukweli Kabla ya Kukopa",
    heroSubtitle: "Fahamu ukweli kabla ya kukopa",
    heroDescription: "Akili ya fedha za kilimo inayoendeshwa na AI kwa wakulima wadogo wa Kenya. Data halisi ya hali ya hewa. Bei halisi za soko. Tathmini halisi ya hatari — kwa Kiswahili.",
    heroBigStat: "KSh Bilioni 2.4",
    heroBigStatLabel: "inapotea kwa mikopo inayoshindwa kulipwa kila mwaka nchini Kenya",
    ctaPrimary: "Angalia Hatari ya Mkopo — Ni Bure",
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
    step3Desc: "Hali bora, inayotarajiwa, mbaya zaidi — kwa Kiswahili au Kiingereza",
    featuresTitle: "Imejengwa kwa Wakulima wa Kenya",
    feature1Title: "Uchambuzi wa Hali",
    feature1Desc: "Ona matokeo yote matatu — bora, yanayotarajiwa, na mabaya. Fanya maamuzi ya kukopa kwa uwazi kamili.",
    feature2Title: "Akili ya Hali ya Hewa",
    feature2Desc: "Data halisi ya mvua ya Open-Meteo kwa kaunti yako. Tunaangalia kama mvua itakuja wakati mazao yako yanahitaji zaidi.",
    feature3Title: "Kugundua Wadudu",
    feature3Desc: "Pakia picha ya zao lako. AI yetu inagundua wadudu na magonjwa, halafu inaboresha mapendekezo yako ya mkopo.",
    feature4Title: "Hali ya Chama",
    feature4Desc: "Mikopo ya kikundi kwa vyama vya ushirika na vikundi vya akiba. Dhibiti michango, fuatilia wanachama, na omba kwa pamoja.",
    feature5Title: "Inazungumza Kiswahili",
    feature5Desc: "Msaada kamili wa lugha ya Kiswahili — si tafsiri tu. Kila kipengele, kila ripoti, kila mapendekezo kwa Kiswahili.",
    feature6Title: "Inafanya Kazi Nje ya Mtandao",
    feature6Desc: "Programu inayoendelea kufanya kazi hata pasipo mtandao. Data yako inasawazishwa utakapounganishwa tena.",
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
    loanFlowTitle: "Safari Yako ya Tathmini ya Mkopo",
    loanFlowSubtitle: "Hatua tano rahisi kutoka mpango wa shamba hadi ufahamu wa kifedha",
    loanFlowStep1Title: "Wasifu wa Shamba",
    loanFlowStep1Desc: "Tuambie zao lako, ekari, na kaunti",
    loanFlowStep2Title: "Ombi la Mkopo",
    loanFlowStep2Desc: "Unahitaji kiasi gani na kwa nini?",
    loanFlowStep3Title: "Mpango wa Marejesho",
    loanFlowStep3Desc: "Lini na vipi utalipa?",
    loanFlowStep4Title: "Uchambuzi wa Hatari",
    loanFlowStep4Desc: "AI inachambua data ya hali ya hewa, mavuno, na bei",
    loanFlowStep5Title: "Hukumu Yako",
    loanFlowStep5Desc: "Matokeo 3 kwa Kiswahili — ya kweli na wazi",
    chamaTitle: "Nguvu Pamoja — Hali ya Chama",
    chamaSubtitle: "Imeundwa kwa zaidi ya vikundi 400,000 vya akiba na vyama vya ushirika nchini Kenya",
    chamaFeature1Title: "Maombi ya Kikundi",
    chamaFeature1Desc: "Omba mikopo kama chama kilichosajiliwa. Rekodi yenu ya pamoja inaimarisha maombi.",
    chamaFeature2Title: "Ufuatiliaji wa Wanachama",
    chamaFeature2Desc: "Fuatilia michango ya kila mwanachama, mahudhurio, na historia ya mikopo mahali pamoja.",
    chamaFeature3Title: "Alama ya Hatari ya Pamoja",
    chamaFeature3Desc: "AI inatathmini uwezo wa kilimo wa kikundi kwa pamoja kwa masharti bora ya mkopo.",
    chamaFeature4Title: "Ledger ya Uwazi",
    chamaFeature4Desc: "Kila mchango, kila mkopo, kila marejesho — yanaonekana kwa wanachama wote.",
    trustTitle: "Kwa Nini Wakulima Wanaamini Kilimo AI",
    trustItem1Title: "Inayoongozwa na Data, Si Makisio",
    trustItem1Desc: "Tunapata utabiri halisi wa hali ya hewa, mavuno ya kihistoria, na bei za soko za moja kwa moja — si makadirio.",
    trustItem2Title: "Ubunifu wa Kiswahili Kwanza",
    trustItem2Desc: "Imejengwa kwa Kiswahili tangu siku ya kwanza. Kila mkulima anaelewa kila neno.",
    trustItem3Title: "Hakuna Ajenda ya Siri",
    trustItem3Desc: "Hatuzi mikopo. Tunakuambia kama mkopo una maana kwa shamba lako, hakuna zaidi.",
    trustItem4Title: "Vyama vya Ushirika Vinatupenda",
    trustItem4Desc: "Tayari tunaaminika na vyama vya ushirika katika kaunti 12 kwa tathmini za mikopo ya vikundi.",
  }
}

// ─── Reusable animation components ───

function StaggerWords({ text, className }: { text: string; className?: string }) {
  const words = text.split(' ')
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: 'easeOut' }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

function FadeInView({ children, className, delay = 0, duration = 0.6, y = 24 }: {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  y?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: 'blur(2px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function FloatingOrb({ className, size = 300, color, speed = 20, delay = 0 }: {
  className?: string
  size?: number
  color: string
  speed?: number
  delay?: number
}) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{ width: size, height: size, backgroundColor: color }}
      animate={{
        x: [0, 30, -20, 15, -10, 0],
        y: [0, -25, 15, -30, 10, 0],
        scale: [1, 1.05, 0.95, 1.03, 0.97, 1],
      }}
      transition={{
        duration: speed,
        delay,
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'easeInOut',
      }}
    />
  )
}

function CountUp({ target, label, duration = 2 }: { target: number; label: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const increment = target / (duration * 60)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return (
    <div ref={ref} className="text-center">
      <span className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
        {count}{label.startsWith('+') ? '+' : ''}
      </span>
      <p className="text-text-muted text-xs mt-0.5">{label.replace(/^\d+\+?\s*/, '')}</p>
    </div>
  )
}

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 20 })

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width - 0.5
    const cy = (e.clientY - rect.top) / rect.height - 0.5
    x.set(cx)
    y.set(cy)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function LanguageToggle({ language, onChange }: { language: Language; onChange: (lang: Language) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-dark-mid p-1">
      <button
        type="button"
        onClick={() => onChange('en')}
        className={`min-w-[44px] min-h-[44px] flex items-center justify-center text-sm font-medium rounded-full transition-all duration-200 active:scale-95 ${
          language === 'en'
            ? 'bg-green-primary text-text-primary'
            : 'text-text-muted hover:text-text-primary'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => onChange('sw')}
        className={`min-w-[44px] min-h-[44px] flex items-center justify-center text-sm font-medium rounded-full transition-all duration-200 active:scale-95 ${
          language === 'sw'
            ? 'bg-green-primary text-text-primary'
            : 'text-text-muted hover:text-text-primary'
        }`}
      >
        SW
      </button>
    </div>
  )
}

// ─── Loan flow step data (not translated, uses t) ───
const LOAN_FLOW_ICONS = [ClipboardCheck, Calculator, Coins, ShieldCheck, CheckCircle2]

const LOAN_FLOW_COLORS = ['#1A7A4A', '#2B6CB0', '#8B5E3C', '#D4A843', '#22C55E']

// ─── Main page ───

export default function LandingPage() {
  const [language, setLanguage] = useState<Language>('en')
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()

  useEffect(() => {
    const saved = localStorage.getItem('kilimo-language') as Language | null
    if (saved) setLanguage(saved)
  }, [])

  useEffect(() => {
    const unsub = scrollY.on('change', (v) => setScrolled(v > 60))
    return () => unsub()
  }, [scrollY])

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

  const chamaFeatures = [
    { icon: HeartHandshake, title: t.chamaFeature1Title, desc: t.chamaFeature1Desc, color: '#22C55E' },
    { icon: Users, title: t.chamaFeature2Title, desc: t.chamaFeature2Desc, color: '#2B6CB0' },
    { icon: TrendingUp, title: t.chamaFeature3Title, desc: t.chamaFeature3Desc, color: '#D4A843' },
    { icon: FileText, title: t.chamaFeature4Title, desc: t.chamaFeature4Desc, color: '#8B5E3C' },
  ]

  const trustItems = [
    { icon: BarChart3, title: t.trustItem1Title, desc: t.trustItem1Desc, color: '#D4A843' },
    { icon: Languages, title: t.trustItem2Title, desc: t.trustItem2Desc, color: '#1A7A4A' },
    { icon: ShieldCheck, title: t.trustItem3Title, desc: t.trustItem3Desc, color: '#2B6CB0' },
    { icon: HeartHandshake, title: t.trustItem4Title, desc: t.trustItem4Desc, color: '#22C55E' },
  ]

  const loanFlowSteps = [
    { title: t.loanFlowStep1Title, desc: t.loanFlowStep1Desc },
    { title: t.loanFlowStep2Title, desc: t.loanFlowStep2Desc },
    { title: t.loanFlowStep3Title, desc: t.loanFlowStep3Desc },
    { title: t.loanFlowStep4Title, desc: t.loanFlowStep4Desc },
    { title: t.loanFlowStep5Title, desc: t.loanFlowStep5Desc },
  ]

  return (
    <main className="relative z-10 min-h-screen bg-dark-base overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <motion.nav
        animate={{
          height: scrolled ? 56 : 64,
          backgroundColor: scrolled ? 'rgba(15,26,19,0.95)' : 'rgba(15,26,19,0.8)',
          borderBottomColor: scrolled ? 'rgba(26,122,74,0.2)' : 'rgba(255,255,255,0.08)',
        }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full gap-3">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <motion.div
                whileHover={{ rotate: -10, scale: 1.05 }}
                className="w-9 h-9 rounded-xl bg-green-primary flex items-center justify-center transition-colors"
              >
                <Sprout className="w-5 h-5 text-text-primary" />
              </motion.div>
              <motion.span
                animate={{ fontSize: scrolled ? '1rem' : '1.125rem' }}
                className="hidden sm:inline font-serif font-semibold text-text-primary"
              >
                Kilimo AI
              </motion.span>
            </Link>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-text-primary/5"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden xs:inline">{t.navLogin}</span>
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-green-primary hover:bg-green-light text-text-primary transition-colors rounded-lg"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden xs:inline">{t.navSignup}</span>
              </Link>
              <div className="w-px h-5 bg-border-subtle mx-0.5 hidden xs:block" />
              <LanguageToggle language={language} onChange={handleLanguageChange} />
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ─── Hero Section ─── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-8">
        {/* Floating orbs */}
        <FloatingOrb className="top-1/4 -right-24" size={400} color="rgba(26,122,74,0.08)" speed={25} delay={0} />
        <FloatingOrb className="bottom-1/4 -left-24" size={350} color="rgba(212,168,67,0.06)" speed={22} delay={2} />
        <FloatingOrb className="top-1/2 left-1/3" size={200} color="rgba(43,108,176,0.06)" speed={18} delay={4} />

        {/* Grain stripe at bottom */}
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

            {/* ─── BIG STAT ─── */}
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
                className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-risk-high via-gold-harvest to-risk-high bg-clip-text text-transparent bg-[length:200%_auto]"
                style={{
                  backgroundSize: '200% auto',
                  animation: 'shimmer 3s linear infinite',
                }}
              >
                {t.heroBigStat}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.3 }}
                className="mt-2 text-sm sm:text-base text-risk-high/80 font-medium max-w-md mx-auto leading-snug"
              >
                {t.heroBigStatLabel}
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
              <Link
                href="/chat"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold-harvest text-dark-base font-semibold rounded-xl hover:bg-gold-harvest/90 transition-all duration-200 active:scale-95 shadow-lg shadow-gold-harvest/20 min-h-[56px] relative overflow-hidden"
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
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border border-text-muted/30 text-text-primary font-semibold rounded-xl hover:bg-text-primary/5 transition-all duration-200 min-h-[56px]"
              >
                {t.ctaSecondary}
                <ChevronDown className="w-4 h-4" />
              </a>
            </motion.div>
          </div>

          {/* Floating stat cards */}
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
                <p className="text-sm text-text-muted leading-relaxed">
                  {stat.text}
                </p>
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

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-20 bg-dark-mid relative overflow-hidden">
        <FloatingOrb className="top-1/3 -right-20" size={250} color="rgba(212,168,67,0.04)" speed={30} delay={1} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInView className="text-center mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase text-gold-harvest mb-3 block">
              {language === 'en' ? 'Process' : 'Mchakato'}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary">
              {t.howItWorksTitle}
            </h2>
          </FadeInView>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8 relative">
            {/* Connecting line on desktop */}
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
              <FadeInView key={index} delay={index * 0.2} className="relative">
                <TiltCard className="relative bg-dark-base border border-border-subtle rounded-2xl p-6 text-center hover:border-green-primary/20 transition-colors duration-300">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="flex items-center justify-center mb-5"
                  >
                    <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gold-harvest text-dark-base font-bold text-sm flex items-center justify-center shadow-lg">
                      {index + 1}
                    </span>
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${step.color}15` }}
                    >
                      <step.icon className="w-8 h-8" style={{ color: step.color }} />
                    </div>
                  </motion.div>
                  <h3 className="font-serif text-lg font-semibold text-text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {step.description}
                  </p>
                </TiltCard>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Loan Application Flow ─── */}
      <section className="py-20 bg-dark-base relative overflow-hidden">
        <FloatingOrb className="top-10 left-1/4" size={300} color="rgba(43,108,176,0.04)" speed={28} delay={0} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInView className="text-center mb-4">
            <span className="text-xs font-semibold tracking-widest uppercase text-sky-blue mb-3 block">
              {language === 'en' ? 'Your Journey' : 'Safari Yako'}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary mb-3">
              {t.loanFlowTitle}
            </h2>
            <p className="text-text-muted text-base max-w-xl mx-auto">{t.loanFlowSubtitle}</p>
          </FadeInView>

          <div className="mt-12 relative">
            {/* Flow line */}
            <div className="hidden lg:block absolute top-12 left-[5%] right-[5%] h-0.5">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-green-primary via-sky-blue via-earth-brown via-gold-harvest to-risk-low origin-left"
              />
              {/* Flow dots */}
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.2, type: 'spring' }}
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-dark-base shadow-lg"
                  style={{
                    left: `${i * 25}%`,
                    backgroundColor: LOAN_FLOW_COLORS[i],
                  }}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {loanFlowSteps.map((step, index) => {
                const Icon = LOAN_FLOW_ICONS[index]
                return (
                  <FadeInView key={index} delay={index * 0.15} className="relative">
                    <TiltCard className="group bg-dark-mid border border-border-subtle rounded-2xl p-5 text-center hover:border-opacity-50 transition-colors duration-300 h-full"
                      style={{
                        ['--hover-border' as string]: LOAN_FLOW_COLORS[index],
                      }}
                    >
                      <motion.div
                        whileHover={{ rotateY: 360 }}
                        transition={{ duration: 0.6 }}
                        className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: `${LOAN_FLOW_COLORS[index]}15` }}
                      >
                        <Icon className="w-7 h-7" style={{ color: LOAN_FLOW_COLORS[index] }} />
                      </motion.div>
                      <div className="w-6 h-6 rounded-full bg-dark-base border-2 mx-auto mb-3 flex items-center justify-center text-xs font-bold"
                        style={{ borderColor: LOAN_FLOW_COLORS[index], color: LOAN_FLOW_COLORS[index] }}
                      >
                        {index + 1}
                      </div>
                      <h4 className="font-serif font-semibold text-text-primary text-sm mb-1.5">
                        {step.title}
                      </h4>
                      <p className="text-text-muted text-xs leading-relaxed">
                        {step.desc}
                      </p>
                    </TiltCard>
                  </FadeInView>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-20 bg-dark-mid relative overflow-hidden">
        <FloatingOrb className="bottom-10 right-1/4" size={280} color="rgba(26,122,74,0.05)" speed={24} delay={3} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInView className="text-center mb-4">
            <span className="text-xs font-semibold tracking-widest uppercase text-green-primary mb-3 block">
              {language === 'en' ? 'Features' : 'Vipengele'}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary">
              {t.featuresTitle}
            </h2>
          </FadeInView>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <FadeInView key={index} delay={index * 0.08}>
                <TiltCard className="group bg-dark-base border border-border-subtle rounded-2xl p-6 hover:border-green-primary/30 transition-all duration-300 h-full cursor-default">
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                  </motion.div>
                  <h3 className="font-serif text-lg font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </TiltCard>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Chama Section ─── */}
      <section className="py-20 bg-dark-base relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Decorative member circles */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-border-subtle"
              style={{
                width: 40 + Math.random() * 40,
                height: 40 + Math.random() * 40,
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
              }}
              animate={{
                x: [0, Math.random() * 30 - 15, 0],
                y: [0, Math.random() * 30 - 15, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                repeatType: 'mirror',
                delay: Math.random() * 3,
              }}
            />
          ))}
          {/* Connecting lines */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1200 600">
            {Array.from({ length: 12 }).map((_, i) => {
              const x1 = 100 + Math.random() * 1000
              const y1 = 50 + Math.random() * 500
              const x2 = 100 + Math.random() * 1000
              const y2 = 50 + Math.random() * 500
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2C9E61" strokeWidth="1" />
            })}
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInView className="text-center mb-4">
            <span className="text-xs font-semibold tracking-widest uppercase text-green-light mb-3 block">
              {language === 'en' ? 'For Groups' : 'Kwa Vikundi'}
            </span>
          </FadeInView>

          {/* Two-column layout: text left, illustration right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mt-8">
            {/* Left: Text content */}
            <FadeInView delay={0.2}>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                {t.chamaTitle}
              </h2>
              <p className="text-text-muted text-base leading-relaxed mb-8">
                {t.chamaSubtitle}
              </p>
              <div className="space-y-4">
                {chamaFeatures.map((item, i) => (
                  <FadeInView key={i} delay={0.3 + i * 0.1} y={12}>
                    <div className="flex gap-4 p-4 rounded-xl bg-dark-mid border border-border-subtle hover:border-green-primary/20 transition-colors">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${item.color}15` }}>
                        <item.icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <div>
                        <h4 className="font-serif font-semibold text-text-primary text-sm mb-0.5">{item.title}</h4>
                        <p className="text-text-muted text-xs leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </FadeInView>
                ))}
              </div>
            </FadeInView>

            {/* Right: Chama illustration */}
            <FadeInView delay={0.4}>
              <div className="relative flex items-center justify-center h-[400px]">
                {/* Center chama hub */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute w-24 h-24 rounded-2xl bg-green-primary/20 border-2 border-green-primary flex items-center justify-center z-10 shadow-lg shadow-green-primary/20"
                >
                  <Building2 className="w-10 h-10 text-green-primary" />
                </motion.div>

                {/* Orbiting member circles */}
                {[
                  { icon: Users, color: '#22C55E', orbit: 120, angle: 0 },
                  { icon: PiggyBank, color: '#2B6CB0', orbit: 120, angle: 60 },
                  { icon: Landmark, color: '#D4A843', orbit: 120, angle: 120 },
                  { icon: HeartHandshake, color: '#8B5E3C', orbit: 120, angle: 180 },
                  { icon: Star, color: '#1A7A4A', orbit: 120, angle: 240 },
                  { icon: TrendingUp, color: '#2C9E61', orbit: 120, angle: 300 },
                ].map((member, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-14 h-14 rounded-xl border-2 flex items-center justify-center bg-dark-mid shadow-lg"
                    style={{
                      borderColor: member.color,
                      x: Math.cos((member.angle * Math.PI) / 180) * member.orbit,
                      y: Math.sin((member.angle * Math.PI) / 180) * member.orbit,
                    }}
                    animate={{
                      x: [
                        Math.cos(((member.angle + 0) * Math.PI) / 180) * member.orbit,
                        Math.cos(((member.angle + 60) * Math.PI) / 180) * member.orbit,
                        Math.cos(((member.angle + 120) * Math.PI) / 180) * member.orbit,
                        Math.cos(((member.angle + 180) * Math.PI) / 180) * member.orbit,
                        Math.cos(((member.angle + 240) * Math.PI) / 180) * member.orbit,
                        Math.cos(((member.angle + 300) * Math.PI) / 180) * member.orbit,
                        Math.cos(((member.angle + 360) * Math.PI) / 180) * member.orbit,
                      ],
                      y: [
                        Math.sin(((member.angle + 0) * Math.PI) / 180) * member.orbit,
                        Math.sin(((member.angle + 60) * Math.PI) / 180) * member.orbit,
                        Math.sin(((member.angle + 120) * Math.PI) / 180) * member.orbit,
                        Math.sin(((member.angle + 180) * Math.PI) / 180) * member.orbit,
                        Math.sin(((member.angle + 240) * Math.PI) / 180) * member.orbit,
                        Math.sin(((member.angle + 300) * Math.PI) / 180) * member.orbit,
                        Math.sin(((member.angle + 360) * Math.PI) / 180) * member.orbit,
                      ],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
                  >
                    <member.icon className="w-6 h-6" style={{ color: member.color }} />
                  </motion.div>
                ))}

                {/* Connecting ring */}
                <motion.div
                  className="absolute w-[260px] h-[260px] rounded-full border border-dashed border-green-primary/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute w-[200px] h-[200px] rounded-full border border-dashed border-gold-harvest/15"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* ─── Trust Section ─── */}
      <section className="py-20 bg-dark-mid relative overflow-hidden">
        <FloatingOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={350} color="rgba(26,122,74,0.04)" speed={20} delay={0} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInView className="text-center mb-4">
            <span className="text-xs font-semibold tracking-widest uppercase text-gold-harvest mb-3 block">
              {language === 'en' ? 'Why Us' : 'Kwa Nini Sisi'}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary">
              {t.trustTitle}
            </h2>
          </FadeInView>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {trustItems.map((item, index) => (
              <FadeInView key={index} delay={index * 0.1} y={16}>
                <div className="group bg-dark-base border border-border-subtle rounded-2xl p-6 hover:border-green-primary/20 transition-colors h-full flex gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${item.color}15` }}>
                    <item.icon className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-text-primary mb-1.5">{item.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-20 bg-dark-base relative overflow-hidden">
        <FloatingOrb className="top-0 right-1/3" size={300} color="rgba(212,168,67,0.06)" speed={22} delay={1} />
        <FloatingOrb className="bottom-0 left-1/3" size={250} color="rgba(26,122,74,0.05)" speed={26} delay={3} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <FadeInView>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              {t.ctaTitle}
            </h2>
            <p className="text-text-muted text-lg mb-8">
              {t.ctaSubtitle}
            </p>
            <Link
              href="/chat"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold-harvest text-dark-base font-semibold rounded-xl hover:bg-gold-harvest/90 transition-all duration-200 hover:scale-105 shadow-lg shadow-gold-harvest/20 relative overflow-hidden"
            >
              <motion.span
                className="absolute inset-0 bg-white/20 rounded-xl"
                animate={{ scale: [1, 1.5, 1], opacity: [0, 0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="relative z-10 flex items-center gap-2">
                {t.ctaButton}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </FadeInView>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-12 bg-dark-mid border-t border-border-subtle">
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

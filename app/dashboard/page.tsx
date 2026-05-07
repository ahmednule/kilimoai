'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Sprout, 
  Home,
  MessageSquare, 
  BarChart3, 
  Cloud, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Droplets,
  Sun,
  Thermometer,
  MapPin,
  Leaf,
  Calendar,
  PiggyBank,
  Target
} from 'lucide-react'
import { FarmerProfile, Language, RiskLevel, ScenarioResult } from '@/lib/types'

type DashboardText = {
  welcome: string
  dashboard: string
  yourFarm: string
  location: string
  crop: string
  acres: string
  quickActions: string
  newAssessment: string
  viewHistory: string
  weatherOutlook: string
  rainfall: string
  temperature: string
  humidity: string
  forecast: string
  good: string
  moderate: string
  poor: string
  riskSummary: string
  currentRisk: string
  recommendedLoan: string
  maxSafeLoan: string
  repaymentChance: string
  recentAssessments: string
  noAssessments: string
  startFirst: string
  low: string
  medium: string
  high: string
  tips: string
  tip1: string
  tip2: string
  tip3: string
}

const UI_TEXT: Record<Language, DashboardText> = {
  en: {
    welcome: "Welcome back",
    dashboard: "Dashboard",
    yourFarm: "Your Farm",
    location: "Location",
    crop: "Crop",
    acres: "Acres",
    quickActions: "Quick Actions",
    newAssessment: "New Loan Assessment",
    viewHistory: "Chat History",
    weatherOutlook: "Weather Outlook",
    rainfall: "Rainfall",
    temperature: "Temperature",
    humidity: "Humidity",
    forecast: "7-Day Forecast",
    good: "Good",
    moderate: "Moderate",
    poor: "Poor",
    riskSummary: "Risk Summary",
    currentRisk: "Current Risk Level",
    recommendedLoan: "Recommended Loan",
    maxSafeLoan: "Max Safe Loan",
    repaymentChance: "Repayment Chance",
    recentAssessments: "Recent Assessments",
    noAssessments: "No assessments yet",
    startFirst: "Start your first loan assessment",
    low: "Low Risk",
    medium: "Medium Risk",
    high: "High Risk",
    tips: "Smart Farming Tips",
    tip1: "Apply for loans before the planting season starts",
    tip2: "Keep weather forecasts in mind when planning",
    tip3: "Consider crop insurance for high-risk seasons",
  },
  sw: {
    welcome: "Karibu tena",
    dashboard: "Dashibodi",
    yourFarm: "Shamba Lako",
    location: "Mahali",
    crop: "Zao",
    acres: "Ekari",
    quickActions: "Vitendo vya Haraka",
    newAssessment: "Tathmini Mpya ya Mkopo",
    viewHistory: "Historia ya Mazungumzo",
    weatherOutlook: "Mtazamo wa Hali ya Hewa",
    rainfall: "Mvua",
    temperature: "Joto",
    humidity: "Unyevu",
    forecast: "Utabiri wa Siku 7",
    good: "Nzuri",
    moderate: "Wastani",
    poor: "Mbaya",
    riskSummary: "Muhtasari wa Hatari",
    currentRisk: "Kiwango cha Hatari",
    recommendedLoan: "Mkopo Unaopendekezwa",
    maxSafeLoan: "Mkopo Salama Zaidi",
    repaymentChance: "Nafasi ya Kulipa",
    recentAssessments: "Tathmini za Hivi Karibuni",
    noAssessments: "Hakuna tathmini bado",
    startFirst: "Anza tathmini yako ya kwanza ya mkopo",
    low: "Hatari Ndogo",
    medium: "Hatari ya Wastani",
    high: "Hatari Kubwa",
    tips: "Vidokezo vya Kilimo Bora",
    tip1: "Omba mkopo kabla ya msimu wa kupanda kuanza",
    tip2: "Zingatia utabiri wa hali ya hewa unapopanga",
    tip3: "Fikiria bima ya mazao kwa misimu ya hatari kubwa",
  }
}

function LanguageToggle({ language, onChange }: { language: Language; onChange: (lang: Language) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-dark-mid p-1">
      <button
        type="button"
        onClick={() => onChange('en')}
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
        onClick={() => onChange('sw')}
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

function RiskBadge({ level, language }: { level: RiskLevel; language: Language }) {
  const t = UI_TEXT[language]
  
  const config = {
    LOW: { bg: 'bg-risk-low/10', text: 'text-risk-low', label: t.low },
    MEDIUM: { bg: 'bg-risk-medium/10', text: 'text-risk-medium', label: t.medium },
    HIGH: { bg: 'bg-risk-high/10', text: 'text-risk-high', label: t.high },
    UNKNOWN: { bg: 'bg-text-muted/10', text: 'text-text-muted', label: '--' },
  }

  const { bg, text, label } = config[level]

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${bg} ${text}`}>
      {level === 'LOW' && <CheckCircle className="w-4 h-4" />}
      {level === 'MEDIUM' && <AlertTriangle className="w-4 h-4" />}
      {level === 'HIGH' && <AlertTriangle className="w-4 h-4" />}
      {label}
    </span>
  )
}

// Mock weather data
const mockWeather = {
  rainfall: 85,
  temperature: 24,
  humidity: 72,
  forecast: 'good' as const,
}

// Mock assessment history
const mockAssessments: Array<{
  id: string
  date: string
  crop: string
  loanAmount: number
  riskLevel: RiskLevel
}> = [
  { id: '1', date: '2026-05-01', crop: 'Maize', loanAmount: 45000, riskLevel: 'MEDIUM' },
  { id: '2', date: '2026-04-15', crop: 'Beans', loanAmount: 25000, riskLevel: 'LOW' },
]

export default function DashboardPage() {
  const [language, setLanguage] = useState<Language>('en')
  const [profile, setProfile] = useState<FarmerProfile | null>(null)
  const [currentRisk] = useState<RiskLevel>('MEDIUM')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem('kilimo-language') as Language | null
    if (savedLang) setLanguage(savedLang)
    
    // Try to get saved profile
    const savedProfile = localStorage.getItem('kilimo-profile')
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile))
      } catch {
        // Invalid profile data
      }
    }
  }, [])

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('kilimo-language', lang)
  }

  const t = UI_TEXT[language]

  if (!mounted) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-dark-base pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-dark-base/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-green-primary flex items-center justify-center">
                <Sprout className="w-6 h-6 text-text-primary" />
              </div>
              <span className="font-serif text-xl font-semibold text-text-primary">
                Kilimo AI
              </span>
            </Link>
            <LanguageToggle language={language} onChange={handleLanguageChange} />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
            {t.welcome}, {profile?.name || 'Farmer'}
          </h1>
          <p className="text-text-muted mt-1">{t.dashboard}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link
            href="/chat"
            className="flex flex-col items-center justify-center gap-2 p-4 bg-gold-harvest text-dark-base rounded-2xl min-h-[100px] active:scale-95 transition-transform"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="text-sm font-semibold text-center">{t.newAssessment}</span>
          </Link>
          <Link
            href="/chat"
            className="flex flex-col items-center justify-center gap-2 p-4 bg-dark-mid border border-border-subtle text-text-primary rounded-2xl min-h-[100px] active:scale-95 transition-transform"
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-sm font-semibold text-center">{t.viewHistory}</span>
          </Link>
        </div>

        {/* Farm Profile Card */}
        {profile && (
          <div className="bg-dark-mid border border-border-subtle rounded-2xl p-4 mb-6">
            <h2 className="font-serif text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-primary" />
              {t.yourFarm}
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-xl bg-green-primary/10 flex items-center justify-center mb-2">
                  <MapPin className="w-5 h-5 text-green-primary" />
                </div>
                <p className="text-xs text-text-muted">{t.location}</p>
                <p className="text-sm font-medium text-text-primary">{profile.county}</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-xl bg-gold-harvest/10 flex items-center justify-center mb-2">
                  <Sprout className="w-5 h-5 text-gold-harvest" />
                </div>
                <p className="text-xs text-text-muted">{t.crop}</p>
                <p className="text-sm font-medium text-text-primary capitalize">{profile.crop}</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-xl bg-earth-brown/10 flex items-center justify-center mb-2">
                  <Target className="w-5 h-5 text-earth-brown" />
                </div>
                <p className="text-xs text-text-muted">{t.acres}</p>
                <p className="text-sm font-medium text-text-primary">{profile.acres}</p>
              </div>
            </div>
          </div>
        )}

        {/* Weather Card */}
        <div className="bg-dark-mid border border-border-subtle rounded-2xl p-4 mb-6">
          <h2 className="font-serif text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-sky-500" />
            {t.weatherOutlook}
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-dark-base rounded-xl">
              <Droplets className="w-6 h-6 mx-auto text-sky-500 mb-1" />
              <p className="text-xs text-text-muted">{t.rainfall}</p>
              <p className="text-lg font-mono font-bold text-text-primary">{mockWeather.rainfall}%</p>
            </div>
            <div className="text-center p-3 bg-dark-base rounded-xl">
              <Thermometer className="w-6 h-6 mx-auto text-orange-500 mb-1" />
              <p className="text-xs text-text-muted">{t.temperature}</p>
              <p className="text-lg font-mono font-bold text-text-primary">{mockWeather.temperature}°C</p>
            </div>
            <div className="text-center p-3 bg-dark-base rounded-xl">
              <Sun className="w-6 h-6 mx-auto text-yellow-500 mb-1" />
              <p className="text-xs text-text-muted">{t.humidity}</p>
              <p className="text-lg font-mono font-bold text-text-primary">{mockWeather.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-risk-low/10 rounded-xl">
            <span className="text-sm text-text-muted">{t.forecast}</span>
            <span className="text-sm font-semibold text-risk-low">{t.good}</span>
          </div>
        </div>

        {/* Risk Summary Card */}
        <div className="bg-dark-mid border border-border-subtle rounded-2xl p-4 mb-6">
          <h2 className="font-serif text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gold-harvest" />
            {t.riskSummary}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">{t.currentRisk}</span>
              <RiskBadge level={currentRisk} language={language} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">{t.recommendedLoan}</span>
              <span className="font-mono font-bold text-text-primary">Ksh 35,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">{t.maxSafeLoan}</span>
              <span className="font-mono font-bold text-risk-low">Ksh 45,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">{t.repaymentChance}</span>
              <span className="font-mono font-bold text-green-primary">75%</span>
            </div>
          </div>
        </div>

        {/* Recent Assessments */}
        <div className="bg-dark-mid border border-border-subtle rounded-2xl p-4 mb-6">
          <h2 className="font-serif text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-primary" />
            {t.recentAssessments}
          </h2>
          {mockAssessments.length > 0 ? (
            <div className="space-y-3">
              {mockAssessments.map((assessment) => (
                <div 
                  key={assessment.id}
                  className="flex items-center justify-between p-3 bg-dark-base rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-primary/10 flex items-center justify-center">
                      <Sprout className="w-5 h-5 text-green-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{assessment.crop}</p>
                      <p className="text-xs text-text-muted">{assessment.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold text-text-primary">
                        Ksh {assessment.loanAmount.toLocaleString()}
                      </p>
                      <RiskBadge level={assessment.riskLevel} language={language} />
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <PiggyBank className="w-12 h-12 mx-auto text-text-muted mb-3" />
              <p className="text-text-muted mb-2">{t.noAssessments}</p>
              <Link 
                href="/chat"
                className="text-gold-harvest font-medium"
              >
                {t.startFirst}
              </Link>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="bg-dark-mid border border-border-subtle rounded-2xl p-4">
          <h2 className="font-serif text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gold-harvest" />
            {t.tips}
          </h2>
          <div className="space-y-3">
            {[t.tip1, t.tip2, t.tip3].map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-dark-base rounded-xl">
                <div className="w-6 h-6 rounded-full bg-gold-harvest/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-gold-harvest">{index + 1}</span>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-dark-mid/95 backdrop-blur-md border-t border-border-subtle z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-around h-16">
            <Link 
              href="/"
              className="flex flex-col items-center gap-1 min-w-[64px] min-h-[44px] justify-center text-text-muted"
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </Link>
            <Link 
              href="/dashboard"
              className="flex flex-col items-center gap-1 min-w-[64px] min-h-[44px] justify-center text-green-primary"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs font-medium">Dashboard</span>
            </Link>
            <Link 
              href="/chat"
              className="flex flex-col items-center gap-1 min-w-[64px] min-h-[44px] justify-center text-text-muted"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs">Chat</span>
            </Link>
          </div>
        </div>
      </nav>
    </main>
  )
}

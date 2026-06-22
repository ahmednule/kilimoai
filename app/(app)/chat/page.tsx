'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { FarmerProfile, Language, RiskLevel, ScenarioResult } from '@/lib/types'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { AssessmentTracker, AssessmentStep, WeatherData } from '@/components/chat/AssessmentTracker'
import { COUNTY_COORDS } from '@/lib/constants'
import { saveAssessment, type StoredAssessment } from '@/lib/assessments'

const INITIAL_STEPS: AssessmentStep[] = [
  { id: 1, label: 'Farm profile',   detail: '—',                            status: 'pending' },
  { id: 2, label: 'Loan request',   detail: 'Amount · purpose',             status: 'pending' },
  { id: 3, label: 'Repayment plan', detail: 'Duration · post-harvest',      status: 'pending' },
  { id: 4, label: 'Risk analysis',  detail: 'Rainfall · yield · market',    status: 'pending' },
  { id: 5, label: 'View results',   detail: '3 scenarios · recommendation', status: 'pending' },
]

export default function ChatPage() {
  const router = useRouter()

  const [profile,      setProfile]      = useState<FarmerProfile | null>(null)
  const [hydrated,     setHydrated]     = useState(false)
  const [language,     setLanguage]     = useState<Language>('en')
  const [riskLevel,    setRiskLevel]    = useState<RiskLevel>('UNKNOWN')
  const [steps,        setSteps]        = useState<AssessmentStep[]>(INITIAL_STEPS)
  const [weather,      setWeather]      = useState<WeatherData | null>(null)
  const [resultsReady, setResultsReady] = useState(false)
  const [recommendedLoanId, setRecommendedLoanId] = useState<string | null>(null)

  // On mount: read profile + language from localStorage
  // If no profile exists redirect to /profile so the user can fill it in
  useEffect(() => {
    const savedLang    = localStorage.getItem('kilimo-language') as Language | null
    const savedProfile = localStorage.getItem('kilimo-profile')

    if (savedLang) setLanguage(savedLang)

    if (savedProfile) {
      try {
        const parsed: FarmerProfile = JSON.parse(savedProfile)
        setProfile(parsed)
        if (parsed.language) setLanguage(parsed.language)
      } catch {
        // corrupt data — redirect to fill profile
        router.replace('/profile')
        return
      }
    } else {
      // No profile saved — send to /profile to complete setup
      // Change this to '/auth/signup' if you'd rather gate on auth first
      router.replace('/profile')
      return
    }

    setHydrated(true)
  }, [router])

  // Mark step 1 done + kick off weather fetch once profile lands
  useEffect(() => {
    if (!profile) return

    const totalAcres = profile.crops.reduce((s, c) => s + c.acres, 0)
    const cropSummary = profile.crops.map(c => c.crop).join(', ')

    setSteps(prev => prev.map(s =>
      s.id === 1
        ? { ...s, status: 'done', detail: `${totalAcres} ac · ${cropSummary} · ${profile.county}` }
        : s.id === 2
        ? { ...s, status: 'active' }
        : s
    ))

    fetchWeather(profile.county)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  const fmt = (d: Date) => d.toISOString().split('T')[0]

  const getSeason = () => {
    const m = new Date().getMonth() + 1
    if (m >= 3  && m <= 5)  return 'Long rains season'
    if (m >= 10 && m <= 12) return 'Short rains season'
    return 'Dry season'
  }

  const fetchWeather = async (county: string) => {
    const coords = COUNTY_COORDS[county]
    if (!coords) return
    try {
      const { lat, lng } = coords
      const end   = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 90)

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_sum&timezone=Africa%2FNairobi&start_date=${fmt(start)}&end_date=${fmt(end)}`
      const res  = await fetch(url)
      const data = await res.json()

      const total: number = (data.daily?.precipitation_sum ?? [])
        .reduce((sum: number, v: number | null) => sum + (v ?? 0), 0)

      const rainfallMm  = Math.round(total)
      const adequacyPct = Math.min(100, Math.round((rainfallMm / 400) * 100))

      setWeather({
        county,
        rainfallMm,
        periodDays:    90,
        season:        getSeason(),
        forecastLabel: rainfallMm >= 250
          ? 'Good rains forecast'
          : rainfallMm >= 150
          ? 'Moderate rainfall'
          : 'Low rainfall — caution',
        adequacyPct,
      })
    } catch {
      // silently skip — weather card shows "pending"
    }
  }

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('kilimo-language', lang)
  }, [])

  const handleReset = useCallback(() => {
    // "New assessment" keeps the profile but resets the conversation state
    setRiskLevel('UNKNOWN')
    setSteps(prev => prev.map((s, i) =>
      i === 0
        ? { ...s, status: 'done' }
        : i === 1
        ? { ...s, status: 'active', detail: 'Amount · purpose' }
        : { ...s, status: 'pending' }
    ))
    setWeather(null)
    setResultsReady(false)
  }, [])

  const handleRiskUpdate = useCallback((level: RiskLevel) => {
    setRiskLevel(level)
  }, [])

  const handleStepComplete = useCallback((stepId: number) => {
    setSteps(prev => {
      const next = prev.map(s => {
        if (s.id === stepId)     return { ...s, status: 'done'   as const }
        if (s.id === stepId + 1) return { ...s, status: 'active' as const }
        return s
      })
      if (next.find(s => s.id === 4)?.status === 'done') setResultsReady(true)
      return next
    })
  }, [])

  const handleScenarioResult = useCallback((scenarios: ScenarioResult) => {
    if (!profile) return
    const totalCropAcres = profile.crops.reduce((s, c) => s + c.acres, 0)
    const cropNameList = profile.crops.map(c => c.crop).join(', ')
    const assessment: StoredAssessment = {
      id: `assess-${Date.now()}`,
      farmerEmail: localStorage.getItem('kilimo-email') ?? '',
      farmerName: profile.name,
      county: profile.county,
      crop: cropNameList,
      acres: totalCropAcres,
      riskLevel: scenarios.riskLevel,
      verdict: scenarios.verdict,
      scenarios: {
        bestCase: { ...scenarios.bestCase },
        expectedCase: { ...scenarios.expectedCase },
        worstCase: { ...scenarios.worstCase },
        loanAmount: scenarios.loanAmount,
        recommendedMaxLoan: scenarios.recommendedMaxLoan,
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    saveAssessment(assessment)
    setRecommendedLoanId(null)
  }, [profile])

if (!hydrated || !profile) return null

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-w-0">
        {/* New assessment header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border-subtle shrink-0">
          <h2 className="font-serif text-lg font-semibold text-text-primary">Loan Assessment</h2>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle text-xs text-text-muted hover:text-text-primary hover:border-green-primary/40 transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            New assessment
          </button>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <ChatPanel
            profile={profile}
            language={language}
            onLanguageChange={handleLanguageChange}
            onRiskUpdate={handleRiskUpdate}
            onStepComplete={handleStepComplete}
            onScenarioResult={handleScenarioResult}
          />

          <AssessmentTracker
            profile={profile}
            language={language}
            steps={steps}
            weather={weather}
            resultsReady={resultsReady}
            recommendedLoanId={recommendedLoanId}
          />
        </div>
      </div>
    </div>
  )
}
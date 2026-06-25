'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { FarmerProfile, Language, RiskLevel, ScenarioResult, WeatherData } from '@/lib/types'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { AssessmentTracker, AssessmentStep } from '@/components/chat/AssessmentTracker'
import { saveAssessment, type StoredAssessment } from '@/lib/assessments'
import { getToken } from '@/lib/auth'
import { loadChatState, saveChatState } from '@/lib/chat'

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
  const [riskLevel,    setRiskLevel]    = useState<RiskLevel>(() => loadChatState<RiskLevel>('kilimo-chat-risk', 'UNKNOWN'))
  const [steps,        setSteps]        = useState<AssessmentStep[]>(() => loadChatState<AssessmentStep[]>('kilimo-chat-steps', INITIAL_STEPS))
  const [weather,      setWeather]      = useState<WeatherData | null>(null)
  const [resultsReady, setResultsReady] = useState(() => loadChatState<boolean>('kilimo-chat-result', false))
  const [recommendedLoanId, setRecommendedLoanId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [latestVerdict, setLatestVerdict] = useState<string | null>(null)
  const [latestRisk, setLatestRisk] = useState<string | null>(null)
  const [chatKey, setChatKey] = useState(0)

  // Persist state changes to localStorage
  useEffect(() => { saveChatState('kilimo-chat-risk', riskLevel) }, [riskLevel])
  useEffect(() => { saveChatState('kilimo-chat-steps', steps) }, [steps])
  useEffect(() => { saveChatState('kilimo-chat-result', resultsReady) }, [resultsReady])

  const loadProfile = useCallback(async () => {
    const savedLang = localStorage.getItem('kilimo-language') as Language | null
    const savedProfile = localStorage.getItem('kilimo-profile')

    if (savedLang) setLanguage(savedLang)

    if (savedProfile) {
      try {
        const parsed: FarmerProfile = JSON.parse(savedProfile)
        setProfile(parsed)
        if (parsed.language) setLanguage(parsed.language)
        setHydrated(true)
        return
      } catch (e) {
        console.error('[chat] corrupt localStorage profile', e)
      }
    }

    // Fallback: try API
    try {
      const token = getToken()
      if (!token) {
        console.error('[chat] no auth token found')
        setLoadError('Not authenticated')
        setHydrated(true)
        return
      }
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        console.error('[chat] profile API returned', res.status)
        setLoadError(`Failed to load profile (${res.status})`)
        setHydrated(true)
        return
      }
      const data = await res.json()
      if (data.success && data.profile) {
        const p = data.profile as FarmerProfile
        setProfile(p)
        localStorage.setItem('kilimo-profile', JSON.stringify(p))
        if (p.language) setLanguage(p.language)
      } else {
        console.error('[chat] profile API error', data.error)
        setLoadError(data.error || 'Profile not found')
      }
    } catch (e) {
      console.error('[chat] profile fetch failed', e)
      setLoadError('Network error loading profile')
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

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
  }, [profile])

  const fetchWeather = async (county: string) => {
    try {
      const res = await fetch(`/api/weather?county=${encodeURIComponent(county)}`)
      const data = await res.json()
      if (data.success && data.weather) {
        setWeather(data.weather)
      } else {
        console.error('[chat] weather API error', data.error)
      }
    } catch (e) {
      console.error('[chat] weather fetch failed', e)
    }
  }

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('kilimo-language', lang)
  }, [])

  const handleReset = useCallback(() => {
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
    setChatKey(k => k + 1)
    setRecommendedLoanId(null)
    setLatestVerdict(null)
    setLatestRisk(null)
    try { localStorage.removeItem('kilimo-chat-messages') } catch {}
    try { localStorage.removeItem('kilimo-chat-steps') } catch {}
    try { localStorage.removeItem('kilimo-chat-risk') } catch {}
    try { localStorage.removeItem('kilimo-chat-result') } catch {}
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
    setLatestVerdict(scenarios.verdict)
    setLatestRisk(scenarios.riskLevel)
  }, [profile])

  if (!hydrated) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-text-muted text-sm">Loading...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <AlertTriangle className="w-12 h-12 text-yellow-400/50 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">Could not load assessment</h2>
          <p className="text-sm text-text-muted mb-4">{loadError}</p>
          <button
            onClick={loadProfile}
            className="px-4 py-2 rounded-lg bg-dark-mid border border-border-subtle text-sm text-text-primary hover:bg-dark-base"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-dark-mid border border-border-subtle flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-text-muted/25" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">No farm profile found</h2>
          <p className="text-sm text-text-muted mb-4">Please set up your farm profile before starting an assessment.</p>
          <button
            onClick={() => router.push('/profile')}
            className="px-4 py-2.5 rounded-xl bg-green-primary text-green-100 text-sm font-medium hover:bg-green-light transition-colors"
          >
            Go to Profile
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-w-0">
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
            key={chatKey}
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
            verdict={latestVerdict}
            riskLevel={latestRisk}
          />
        </div>
      </div>
    </div>
  )
}

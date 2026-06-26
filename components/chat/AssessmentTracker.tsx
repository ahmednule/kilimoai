'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check, CloudRain, AlertTriangle, ShieldCheck, ChevronRight, ChevronDown, BarChart3 } from 'lucide-react'
import { FarmerProfile, Language } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export interface AssessmentStep {
  id: number
  label: string
  detail: string
  status: 'done' | 'active' | 'pending'
}

export interface WeatherData {
  county: string
  rainfallMm: number
  periodDays: number
  season: string
  forecastLabel: string
  adequacyPct: number
}

interface AssessmentTrackerProps {
  profile: FarmerProfile
  language: Language
  steps: AssessmentStep[]
  weather: WeatherData | null
  resultsReady: boolean
  recommendedLoanId?: string | null
  verdict?: string | null
  riskLevel?: string | null
}

const STEP_COUNT = 5

function StepCircle({ step }: { step: AssessmentStep }) {
  if (step.status === 'done') {
    return (
      <div className="relative z-10 w-6 h-6 rounded-full bg-green-primary flex items-center justify-center shrink-0">
        <Check className="w-3 h-3 text-green-100" />
      </div>
    )
  }
  if (step.status === 'active') {
    return (
      <div className="relative z-10 w-6 h-6 rounded-full border border-green-400/60 bg-green-primary/10 flex items-center justify-center shrink-0">
        <span className="text-[11px] font-medium text-green-400">{step.id}</span>
      </div>
    )
  }
  return (
    <div className="relative z-10 w-6 h-6 rounded-full border border-border-subtle bg-dark-mid flex items-center justify-center shrink-0">
      <span className="text-[11px] text-text-muted/40">{step.id}</span>
    </div>
  )
}

function TrackerContent({
  steps, weather, resultsReady, recommendedLoanId, verdict, riskLevel, language
}: {
  steps: AssessmentStep[]
  weather: WeatherData | null
  resultsReady: boolean
  recommendedLoanId?: string | null
  verdict?: string | null
  riskLevel?: string | null
  language: Language
}) {
  const router = useRouter()
  const doneCount = steps.filter(s => s.status === 'done').length

  return (
    <>
      <div className="px-4 py-3.5 border-b border-border-subtle">
        <p className="text-[13px] font-medium text-text-primary">Assessment progress</p>
        <p className="text-[11px] text-text-muted mt-0.5">
          {doneCount} of {STEP_COUNT} steps complete
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none">
        <ol className="flex flex-col gap-0">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1
            return (
              <li key={step.id} className="flex gap-3 relative pb-5 last:pb-0">
                {!isLast && (
                  <div
                    className={cn(
                      'absolute left-3 top-7 bottom-0 w-px',
                      step.status === 'done' ? 'bg-green-primary/40' : 'bg-border-subtle'
                    )}
                  />
                )}
                <StepCircle step={step} />
                <div className="pt-0.5 min-w-0">
                  <p className={cn(
                    'text-[12px] font-medium leading-tight',
                    step.status === 'done'  && 'text-text-muted/50',
                    step.status === 'active'  && 'text-text-primary',
                    step.status === 'pending' && 'text-text-muted/40'
                  )}>
                    {step.label}
                  </p>
                  <p className="text-[11px] text-text-muted/50 mt-0.5 leading-snug">{step.detail}</p>
                  {step.status === 'active' && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 bg-green-primary/10 border border-green-primary/20 rounded-full text-[10px] text-green-400">
                      In progress
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="h-px bg-border-subtle mx-0" />

      {weather ? (
        <div className="mx-3 my-3 p-3 bg-dark-base rounded-xl border border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] text-text-muted">
              <CloudRain className="w-3.5 h-3.5" />
              {weather.county} · {weather.periodDays} days
            </span>
            <span className="text-lg font-semibold text-text-primary font-mono">{weather.rainfallMm} mm</span>
          </div>
          <p className="text-[11px] text-text-muted mt-1">{weather.forecastLabel} · {weather.season}</p>
          <div className="mt-2 h-1 bg-border-subtle rounded-full overflow-hidden">
            <div className="h-full bg-green-primary rounded-full transition-all duration-700" style={{ width: `${weather.adequacyPct}%` }} />
          </div>
        </div>
      ) : (
        <div className="mx-3 my-3 p-3 bg-dark-base rounded-xl border border-border-subtle">
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted/50">
            <CloudRain className="w-3.5 h-3.5" />
            Weather data pending…
          </div>
        </div>
      )}

      {resultsReady ? (
        <div className="mx-3 mb-3 p-3 bg-dark-base rounded-xl border border-border-subtle">
          <div className="flex items-center gap-2 mb-2">
            {riskLevel === 'LOW' ? (
              <ShieldCheck className="w-4 h-4 text-risk-low" />
            ) : riskLevel === 'HIGH' ? (
              <AlertTriangle className="w-4 h-4 text-risk-high" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-risk-medium" />
            )}
            <span className={cn(
              'text-[11px] font-semibold uppercase tracking-wide',
              riskLevel === 'LOW' ? 'text-risk-low' : riskLevel === 'HIGH' ? 'text-risk-high' : 'text-risk-medium'
            )}>
              {language === 'sw'
                ? (riskLevel === 'LOW' ? 'Hatari Ndogo' : riskLevel === 'HIGH' ? 'Hatari Kubwa' : 'Hatari Wastani')
                : `${riskLevel} RISK`}
            </span>
          </div>
          {verdict && <p className="text-[12px] text-text-primary leading-snug mb-3">{verdict}</p>}
          <button
            onClick={() => router.push(`/loans${recommendedLoanId ? `?loan=${recommendedLoanId}` : ''}`)}
            className="w-full py-2 rounded-lg text-[12px] font-semibold bg-gold-harvest text-dark-base hover:opacity-90 transition-all"
          >
            {language === 'sw' ? 'Tazama Mikopo Inayofaa →' : 'View matching loans →'}
          </button>
        </div>
      ) : (
        <div className="px-3 pb-4">
          <button disabled
            className="w-full py-2.5 rounded-lg text-[13px] font-semibold bg-gold-harvest/20 text-gold-harvest/40 cursor-not-allowed"
          >
            {language === 'sw' ? 'Tazama matokeo kamili →' : 'View full results →'}
          </button>
        </div>
      )}
    </>
  )
}

export function AssessmentTracker(props: AssessmentTrackerProps) {
  const { steps } = props
  const [mobileOpen, setMobileOpen] = useState(false)
  const doneCount = steps.filter(s => s.status === 'done').length

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed right-4 bottom-20 z-40 w-12 h-12 rounded-full bg-green-primary shadow-lg flex items-center justify-center"
        aria-label="Toggle assessment progress"
      >
        <BarChart3 className="w-5 h-5 text-green-100" />
        {doneCount > 0 && doneCount < STEP_COUNT && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold-harvest text-[10px] font-bold text-dark-base flex items-center justify-center">
            {doneCount}
          </span>
        )}
      </button>

      {/* Mobile Sheet drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-[280px] p-0 bg-dark-mid border-border-subtle">
          <TrackerContent {...props} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[280px] shrink-0 bg-dark-mid border-l border-border-subtle overflow-hidden">
        <TrackerContent {...props} />
      </aside>
    </>
  )
}
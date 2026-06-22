'use client'

import { useRouter } from 'next/navigation'
import { Check, CloudRain } from 'lucide-react'
import { FarmerProfile, Language } from '@/lib/types'
import { cn } from '@/lib/utils'

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
  /** 0–100, used for the progress bar */
  adequacyPct: number
}

interface AssessmentTrackerProps {
  profile: FarmerProfile
  language: Language
  steps: AssessmentStep[]
  weather: WeatherData | null
  resultsReady: boolean
  recommendedLoanId?: string | null
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

export function AssessmentTracker({
  profile,
  language,
  steps,
  weather,
  resultsReady,
  recommendedLoanId,
}: AssessmentTrackerProps) {
  const router = useRouter()
  const doneCount = steps.filter(s => s.status === 'done').length

  return (
    <aside className="flex flex-col w-[280px] shrink-0 bg-dark-mid border-l border-border-subtle overflow-hidden">

      {/* Header */}
      <div className="px-4 py-3.5 border-b border-border-subtle">
        <p className="text-[13px] font-medium text-text-primary">Assessment progress</p>
        <p className="text-[11px] text-text-muted mt-0.5">
          {doneCount} of {STEP_COUNT} steps complete
        </p>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none">
        <ol className="flex flex-col gap-0">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1
            return (
              <li key={step.id} className="flex gap-3 relative pb-5 last:pb-0">
                {/* Connector line */}
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
                  <p
                    className={cn(
                      'text-[12px] font-medium leading-tight',
                      step.status === 'done'  && 'text-text-muted/50',
                      step.status === 'active'  && 'text-text-primary',
                      step.status === 'pending' && 'text-text-muted/40'
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-[11px] text-text-muted/50 mt-0.5 leading-snug">
                    {step.detail}
                  </p>
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

      {/* Divider */}
      <div className="h-px bg-border-subtle mx-0" />

      {/* Weather card */}
      {weather ? (
        <div className="mx-3 my-3 p-3 bg-dark-base rounded-xl border border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] text-text-muted">
              <CloudRain className="w-3.5 h-3.5" />
              {weather.county} · {weather.periodDays} days
            </span>
            <span className="text-lg font-semibold text-text-primary font-mono">
              {weather.rainfallMm} mm
            </span>
          </div>
          <p className="text-[11px] text-text-muted mt-1">
            {weather.forecastLabel} · {weather.season}
          </p>
          <div className="mt-2 h-1 bg-border-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-green-primary rounded-full transition-all duration-700"
              style={{ width: `${weather.adequacyPct}%` }}
            />
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

      {/* Footer CTA */}
      <div className="px-3 pb-4">
        <button
          onClick={() => {
            if (resultsReady) {
              const loanParam = recommendedLoanId ? `?loan=${recommendedLoanId}` : ''
              router.push(`/loans${loanParam}`)
            }
          }}
          disabled={!resultsReady}
          className={cn(
            'w-full py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200',
            resultsReady
              ? 'bg-gold-harvest text-dark-base hover:opacity-90 cursor-pointer'
              : 'bg-gold-harvest/20 text-gold-harvest/40 cursor-not-allowed'
          )}
        >
          View full results →
        </button>
      </div>
    </aside>
  )
}
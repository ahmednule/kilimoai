'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, Phone, Mail, MapPin, Sprout, Landmark, Shield, AlertTriangle,
  TrendingUp, TrendingDown, CloudRain, DollarSign, CheckCircle2,
  Star, ChevronRight, Users, Clock, Award, BadgeCheck, XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FarmerRiskProfile, ScenarioResult, RiskLevel, Language } from '@/lib/types'
import { RiskBadge } from '@/components/shared/RiskBadge'
import { getSession } from '@/lib/auth'

type View = 'LOADING' | 'UNAUTHORIZED' | 'PROFILE'

const MOCK_PROFILES: Record<string, FarmerRiskProfile> = {
  'app-1': {
    id: 'f-1', name: 'Samuel Mwangi', county: 'Nyeri', crop: 'coffee', acres: 3,
    isRented: false, riskLevel: 'LOW', riskScore: 18,
    scenarioResult: {
      riskLevel: 'LOW',
      verdict: 'Samuel has a strong credit profile with consistent coffee yields and cooperative membership.',
      bestCase: { yield: 2200, revenue: 132000, canRepay: true, probability: 35, rainfall: 'good' },
      expectedCase: { yield: 1800, revenue: 108000, canRepay: true, probability: 50, rainfall: 'average' },
      worstCase: { yield: 1300, revenue: 78000, canRepay: true, probability: 15, rainfall: 'poor' },
      loanAmount: 85000,
      recommendedMaxLoan: 100000,
      cropType: 'coffee',
    },
    assessedAt: '2026-06-18T08:30:00Z',
    creditHistory: true,
    hasCollateral: true,
    chamaMembership: true,
    phoneNumber: '+254 712 345 678',
    email: 'samuel.m@example.com',
  },
  'app-2': {
    id: 'f-2', name: 'Grace Akinyi', county: 'Kisumu', crop: 'rice', acres: 5,
    isRented: true, riskLevel: 'MEDIUM', riskScore: 45,
    scenarioResult: {
      riskLevel: 'MEDIUM',
      verdict: 'Grace shows moderate potential but land is rented. A smaller starter loan is recommended.',
      bestCase: { yield: 3200, revenue: 160000, canRepay: true, probability: 25, rainfall: 'good' },
      expectedCase: { yield: 2400, revenue: 120000, canRepay: true, probability: 50, rainfall: 'average' },
      worstCase: { yield: 1400, revenue: 70000, canRepay: false, probability: 25, rainfall: 'poor' },
      loanAmount: 120000,
      recommendedMaxLoan: 80000,
      cropType: 'rice',
    },
    assessedAt: '2026-06-17T14:00:00Z',
    creditHistory: false,
    hasCollateral: false,
    chamaMembership: false,
    phoneNumber: '+254 723 987 654',
    email: 'grace.a@example.com',
  },
  'app-3': {
    id: 'f-3', name: 'Peter Kamau', county: 'Nakuru', crop: 'maize', acres: 10,
    isRented: false, riskLevel: 'HIGH', riskScore: 72,
    scenarioResult: {
      riskLevel: 'HIGH',
      verdict: 'Peter operates at scale but maize is volatile. Weather risk is significant in this county.',
      bestCase: { yield: 250, revenue: 250000, canRepay: true, probability: 20, rainfall: 'good' },
      expectedCase: { yield: 170, revenue: 170000, canRepay: false, probability: 45, rainfall: 'average' },
      worstCase: { yield: 90, revenue: 90000, canRepay: false, probability: 35, rainfall: 'poor' },
      loanAmount: 200000,
      recommendedMaxLoan: 120000,
      cropType: 'maize',
    },
    assessedAt: '2026-06-16T10:15:00Z',
    creditHistory: false,
    hasCollateral: true,
    chamaMembership: true,
    phoneNumber: '+254 734 561 234',
    email: 'peter.k@example.com',
  },
}

const riskConfig: Record<RiskLevel, { color: string; bg: string; border: string }> = {
  LOW:     { color: 'text-risk-low', bg: 'bg-risk-low/10', border: 'border-risk-low/30' },
  MEDIUM:  { color: 'text-risk-medium', bg: 'bg-risk-medium/10', border: 'border-risk-medium/30' },
  HIGH:    { color: 'text-risk-high', bg: 'bg-risk-high/10', border: 'border-risk-high/30' },
  UNKNOWN: { color: 'text-text-muted', bg: 'bg-text-muted/10', border: 'border-text-muted/30' },
}

const rainfallLabel = (r: string) => {
  if (r === 'good') return { en: 'Good rains', sw: 'Mvua nzuri' }
  if (r === 'average') return { en: 'Average rains', sw: 'Mvua ya wastani' }
  return { en: 'Poor rains', sw: 'Mvua kidogo' }
}

const formatKES = (n: number) => `Ksh ${n.toLocaleString('en-KE')}`

export default function FarmerRiskProfilePage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState<View>('LOADING')
  const [language] = useState<Language>('en')
  const [profile, setProfile] = useState<FarmerRiskProfile | null>(null)

  useEffect(() => {
    const session = getSession()
    if (!session.isAuthenticated || session.role !== 'lender') {
      setView('UNAUTHORIZED')
    } else {
      setProfile(MOCK_PROFILES[id] ?? null)
      setView('PROFILE')
    }
    setMounted(true)
  }, [id])

  if (!mounted) return null
  if (view === 'LOADING') return <div className="flex h-full items-center justify-center"><p className="text-text-muted text-sm">Loading...</p></div>
  if (view === 'UNAUTHORIZED') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-text-muted/40 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">Lender Access Only</h2>
          <p className="text-sm text-text-muted">You must be logged in as a lender to view farmer profiles.</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-text-muted/40 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">Farmer Not Found</h2>
          <button onClick={() => router.push('/lender')} className="text-sm text-green-400 hover:underline mt-2">
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  const risk = riskConfig[profile.riskLevel]
  const { scenarioResult: sr } = profile

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle">
        <button
          onClick={() => router.push('/lender')}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">{profile.name}</h1>
            <p className="text-sm text-text-muted mt-1">Risk profile &amp; assessment</p>
          </div>
          <RiskBadge level={profile.riskLevel} />
        </div>
      </div>

      <div className="p-6 grid grid-cols-3 gap-4">
        {/* Left column: Farmer details */}
        <div className="col-span-1 space-y-4">
          {/* Contact card */}
          <div className="bg-dark-mid border border-border-subtle rounded-xl p-4">
            <h3 className="text-xs uppercase tracking-widest text-text-muted/60 mb-3">Farmer Details</h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-text-muted shrink-0" />
                <span className="text-text-primary">{profile.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-text-muted shrink-0" />
                <span className="text-text-primary text-[13px]">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-text-muted shrink-0" />
                <span className="text-text-primary">{profile.county}</span>
              </div>
            </div>
          </div>

          {/* Farm card */}
          <div className="bg-dark-mid border border-border-subtle rounded-xl p-4">
            <h3 className="text-xs uppercase tracking-widest text-text-muted/60 mb-3">Farm Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-text-muted uppercase">Crop</p>
                <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5 text-green-400" />
                  {profile.crop}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase">Acreage</p>
                <p className="text-sm font-medium text-text-primary">{profile.acres} acres</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase">Land tenure</p>
                <p className={cn('text-sm font-medium', profile.isRented ? 'text-yellow-400' : 'text-green-400')}>
                  {profile.isRented ? 'Rented' : 'Owned'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase">Risk score</p>
                <p className={cn('text-sm font-bold', risk.color)}>{profile.riskScore}/100</p>
              </div>
            </div>
          </div>

          {/* Flags card */}
          <div className="bg-dark-mid border border-border-subtle rounded-xl p-4">
            <h3 className="text-xs uppercase tracking-widest text-text-muted/60 mb-3">Verification Flags</h3>
            <div className="space-y-2">
              {[
                { key: 'creditHistory', label: 'Credit history', icon: Clock },
                { key: 'hasCollateral', label: 'Has collateral', icon: Landmark },
                { key: 'chamaMembership', label: 'Chama member', icon: Users },
              ].map(f => {
                const val = profile[f.key as keyof FarmerRiskProfile] as boolean
                return (
                  <div key={f.key} className="flex items-center justify-between">
                    <span className="text-[12px] text-text-muted flex items-center gap-1.5">
                      <f.icon className="w-3.5 h-3.5" />
                      {f.label}
                    </span>
                    {val ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400/60" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right columns: Scenario analysis */}
        <div className="col-span-2 space-y-4">
          {/* Verdict */}
          <div className={cn('rounded-xl border p-4', risk.bg, risk.border)}>
            <h3 className="text-xs uppercase tracking-widest text-text-muted/60 mb-2">AI Verdict</h3>
            <p className={cn('text-sm', risk.color)}>{sr.verdict}</p>
            <div className="mt-3 flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-text-muted">
                <Award className="w-3.5 h-3.5" />
                Recommended max: {formatKES(sr.recommendedMaxLoan)}
              </span>
              <span className="flex items-center gap-1 text-text-muted">
                <DollarSign className="w-3.5 h-3.5" />
                Requested: {formatKES(sr.loanAmount)}
              </span>
            </div>
          </div>

          {/* Three scenarios */}
          <div className="grid grid-cols-3 gap-3">
            {(['bestCase', 'expectedCase', 'worstCase'] as const).map((key, i) => {
              const c = sr[key]
              const isBest = i === 0
              const isExpected = i === 1
              const isWorst = i === 2
              return (
                <div key={key} className={cn(
                  'rounded-xl border p-4',
                  isBest ? 'border-risk-low/30 bg-risk-low/5' :
                  isExpected ? 'border-risk-medium/30 bg-risk-medium/5' :
                  'border-risk-high/30 bg-risk-high/5',
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn(
                      'text-[11px] font-semibold uppercase tracking-wide',
                      isBest ? 'text-risk-low' : isExpected ? 'text-risk-medium' : 'text-risk-high',
                    )}>
                      {isBest ? 'Best case' : isExpected ? 'Expected' : 'Worst case'}
                    </span>
                    <span className="text-[10px] text-text-muted">{c.probability}%</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                      <CloudRain className="w-3 h-3" />
                      {rainfallLabel(c.rainfall).en}
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted uppercase">Yield</p>
                      <p className="text-lg font-bold text-text-primary">{c.yield} <span className="text-[11px] font-normal text-text-muted">kg</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted uppercase">Revenue</p>
                      <p className="text-sm font-semibold text-text-primary">{formatKES(c.revenue)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 border-t border-border-subtle">
                      {c.canRepay ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-[11px] text-green-400 font-medium">Can repay</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-red-400" />
                          <span className="text-[11px] text-red-400 font-medium">Cannot repay</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => router.push(`/lender/approve/${profile.id}`)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-primary text-green-100 text-sm font-semibold hover:bg-green-light transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve Loan
            </button>
            <button
              onClick={() => router.push(`/lender/approve/${profile.id}?mode=counter`)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-sm font-semibold hover:bg-yellow-400/20 transition-colors"
            >
              <TrendingDown className="w-4 h-4" />
              Counter-offer
            </button>
            <button
              onClick={() => router.push(`/lender/approve/${profile.id}?mode=reject`)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-400/10 border border-red-400/30 text-red-400 text-sm font-semibold hover:bg-red-400/20 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Clock,
  MapPin, Sprout, Shield, Landmark, BadgeCheck, Loader2,
  BarChart3, ArrowUpRight, DollarSign, Activity, FileText,
  CalendarDays,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LoanApplication, RiskLevel, Language } from '@/lib/types'
import { getSession, getToken } from '@/lib/auth'
import { t, getLanguage } from '@/lib/i18n'

const getSeason = () => {
  const m = new Date().getMonth() + 1
  if (m >= 3 && m <= 5) return { en: 'Long Rains', sw: 'Masika', color: 'text-blue-400', bg: 'bg-blue-400/10' }
  if (m >= 10 && m <= 12) return { en: 'Short Rains', sw: 'Vuli', color: 'text-cyan-400', bg: 'bg-cyan-400/10' }
  return { en: 'Dry Season', sw: 'Kiangazi', color: 'text-amber-400', bg: 'bg-amber-400/10' }
}

type View = 'LOADING' | 'UNAUTHORIZED' | 'DASHBOARD'

const RISK_CONFIG: Record<RiskLevel, { color: string; bg: string; bar: string; labelKey: string }> = {
  LOW:     { color: 'text-risk-low', bg: 'bg-risk-low/10', bar: 'bg-risk-low', labelKey: 'lender.risk.low' },
  MEDIUM:  { color: 'text-risk-medium', bg: 'bg-risk-medium/10', bar: 'bg-risk-medium', labelKey: 'lender.risk.medium' },
  HIGH:    { color: 'text-risk-high', bg: 'bg-risk-high/10', bar: 'bg-risk-high', labelKey: 'lender.risk.high' },
  UNKNOWN: { color: 'text-text-muted', bg: 'bg-text-muted/10', bar: 'bg-text-muted', labelKey: 'lender.risk.unknown' },
}

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; bg: string; labelKey: string }> = {
  PENDING:   { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10', labelKey: 'lender.status.pending' },
  APPROVED:  { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10', labelKey: 'lender.status.approved' },
  REJECTED:  { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', labelKey: 'lender.status.rejected' },
  COUNTERED: { icon: AlertTriangle, color: 'text-blue-400', bg: 'bg-blue-400/10', labelKey: 'lender.status.countered' },
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
const formatKES = (n: number) => `${t('currency.ksh')} ${n.toLocaleString('en-KE')}`

export default function LenderDashboard() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState<View>('LOADING')
  const [language, setLanguage] = useState<Language>('en')
  const [applications, setApplications] = useState<LoanApplication[]>([])

  const tr = (key: string) => t(key, language)

  useEffect(() => {
    const session = getSession()
    if (!session.isAuthenticated || session.role !== 'lender') {
      setView('UNAUTHORIZED')
    } else {
      const token = getToken()
      fetch('/api/lender/applications', {
        headers: { authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) setApplications(data.applications)
        })
        .finally(() => setView('DASHBOARD'))
    }
    setLanguage(getLanguage())
    setMounted(true)
  }, [])

  const stats = useMemo(() => {
    const approved = applications.filter(a => a.status === 'APPROVED')
    const totalAmount = applications.reduce((s, a) => s + a.loanAmount, 0)
    const approvedAmount = approved.reduce((s, a) => s + a.loanAmount, 0)
    const totalAcres = applications.reduce((s, a) => s + (a.farmAcres ?? a.acres), 0)
    const chamaMembers = applications.filter(a => a.chamaName).length
    const cropCounts: Record<string, number> = {}
    applications.forEach(a => { cropCounts[a.crop] = (cropCounts[a.crop] || 0) + 1 })
    const topCrop = Object.entries(cropCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'
    return {
      total: applications.length,
      pending: applications.filter(a => a.status === 'PENDING').length,
      approved: approved.length,
      rejected: applications.filter(a => a.status === 'REJECTED').length,
      avgRisk: applications.length > 0
        ? Math.round(applications.reduce((s, a) => s + a.riskScore, 0) / applications.length)
        : 0,
      totalAmount,
      approvedAmount,
      approvalRate: applications.length > 0
        ? Math.round((approved.length / applications.length) * 100)
        : 0,
      totalAcres,
      avgFarmSize: applications.length > 0
        ? Math.round(totalAcres / applications.length)
        : 0,
      chamaMembers,
      topCrop,
    }
  }, [applications])

  const riskDistribution = useMemo(() => {
    const counts: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, UNKNOWN: 0 }
    applications.forEach(a => { counts[a.riskLevel] = (counts[a.riskLevel] || 0) + 1 })
    const max = Math.max(...Object.values(counts), 1)
    return { counts, max }
  }, [applications])

  const topPending = useMemo(() => {
    return [...applications]
      .filter(a => a.status === 'PENDING')
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5)
  }, [applications])

  const recentActivity = useMemo(() => {
    return [...applications]
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
      .slice(0, 6)
  }, [applications])

  if (!mounted) return null

  if (view === 'LOADING') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-text-muted animate-spin" />
          <p className="text-text-muted text-sm">{tr('app.loading')}</p>
        </div>
      </div>
    )
  }

  if (view === 'UNAUTHORIZED') {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="text-center max-w-sm animate-fadeIn">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-dark-mid border border-border-subtle flex items-center justify-center">
            <Shield className="w-8 h-8 text-text-muted/30" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">{tr('lender.unauthorizedTitle')}</h2>
          <p className="text-sm text-text-muted mb-6">{tr('lender.unauthorizedDesc')}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-primary text-white text-sm font-medium hover:bg-green-primary/90 transition-colors"
          >
            <Shield className="w-4 h-4" />
            {tr('lender.unauthorizedCTA')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto animate-fadeIn">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-border-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-text-primary flex items-center gap-2.5">
              <Landmark className="w-5 h-5 text-gold-harvest" />
              {tr('lender.title')}
            </h1>
            <p className="text-sm text-text-muted mt-1">{tr('lender.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-mid border border-border-subtle w-fit">
            <BadgeCheck className="w-4 h-4 text-green-400" />
            <span className="text-xs text-text-primary font-medium">{tr('lender.verifiedBadge')}</span>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: 'lender.stats.applications', value: stats.total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { key: 'lender.stats.pendingReview', value: stats.pending, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { key: 'lender.stats.approved', value: stats.approved, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
          { key: 'lender.stats.rejected', value: stats.rejected, icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
          { key: 'lender.stats.avgRisk', value: `${stats.avgRisk}/100`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { key: 'lender.stats.approvalRate', value: `${stats.approvalRate}%`, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        ].map(s => (
          <div key={s.key} className={cn('rounded-xl p-3 border border-border-subtle', s.bg)}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <s.icon className={cn('w-3.5 h-3.5', s.color)} />
              <span className="text-[10px] text-text-muted uppercase tracking-wide whitespace-nowrap">{tr(s.key)}</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-text-primary font-mono tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Farm profile summary row */}
      <div className="px-4 sm:px-6 lg:px-8 py-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Acres', value: `${stats.totalAcres.toLocaleString()} ac`, icon: Sprout, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Avg Farm Size', value: `${stats.avgFarmSize} ac`, icon: MapPin, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Top Crop', value: stats.topCrop, icon: Sprout, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { label: 'Chama Members', value: stats.chamaMembers, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
          { label: 'Season', value: getSeason().en, icon: CalendarDays, color: getSeason().color, bg: getSeason().bg },
        ].map(s => (
          <div key={s.label} className={cn('rounded-xl p-3 border border-border-subtle', s.bg)}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <s.icon className={cn('w-3.5 h-3.5', s.color)} />
              <span className="text-[10px] text-text-muted uppercase tracking-wide">{s.label}</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-text-primary font-mono tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main grid: risk chart + top pending + recent */}
      <div className="px-4 sm:px-6 lg:px-8 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Risk distribution */}
        <div className="bg-dark-mid border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-text-primary">{tr('lender.riskDistribution')}</h2>
          </div>
          <div className="space-y-3">
            {(Object.entries(RISK_CONFIG) as [RiskLevel, typeof RISK_CONFIG[RiskLevel]][]).map(([level, cfg]) => {
              const count = riskDistribution.counts[level] || 0
              const pct = Math.round((count / Math.max(applications.length, 1)) * 100)
              return (
                <div key={level}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={cn('font-medium', cfg.color)}>{tr(cfg.labelKey)}</span>
                    <span className="text-text-muted">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-dark-base overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', cfg.bar)}
                      style={{ width: `${(count / riskDistribution.max) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          {applications.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
              <span className="text-text-muted">{tr('lender.totalPortfolio')}</span>
              <span className="text-text-primary font-mono font-bold">{formatKES(stats.totalAmount)}</span>
            </div>
          )}
        </div>

        {/* Top pending (highest risk) */}
        <div className="bg-dark-mid border border-border-subtle rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <h2 className="text-sm font-semibold text-text-primary">{tr('lender.topPending')}</h2>
            </div>
            <button
              onClick={() => router.push('/lender/applications')}
              className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-0.5"
            >
              {tr('lender.viewAll')} <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          {topPending.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-6">{tr('lender.noPending')}</p>
          ) : (
            <div className="space-y-2">
              {topPending.map(app => {
                const cfg = RISK_CONFIG[app.riskLevel]
                return (
                  <div
                    key={app.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-base/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/lender/farmer/${app.id}`)}
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', cfg.bg)}>
                      <Sprout className={cn('w-4 h-4', cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary truncate">{app.farmerName}</p>
                      <p className="text-[10px] text-text-muted flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />{app.county} · {formatKES(app.loanAmount)}
                      </p>
                    </div>
                    <span className={cn('text-[10px] font-semibold', cfg.color)}>{app.riskScore}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-dark-mid border border-border-subtle rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-text-primary">{tr('lender.recentActivity')}</h2>
            </div>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-6">{tr('lender.noActivity')}</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.map(app => {
                const cfg = STATUS_CONFIG[app.status]
                const Icon = cfg.icon
                return (
                  <div
                    key={app.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-dark-base/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/lender/farmer/${app.id}`)}
                  >
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5', cfg.bg)}>
                      <Icon className={cn('w-3.5 h-3.5', cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-primary">
                        <span className="font-medium">{app.farmerName}</span>
                        <span className="text-text-muted"> — {tr(cfg.labelKey)}</span>
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {formatKES(app.loanAmount)} · {formatDate(app.appliedAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-dark-mid border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-gold-harvest" />
            <h2 className="text-sm font-semibold text-text-primary">{tr('lender.quickActions')}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button onClick={() => router.push('/lender/applications')}
              className="flex items-center gap-2 p-3 rounded-lg bg-dark-base border border-border-subtle hover:border-purple-400/30 transition-all text-left">
              <FileText className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-text-primary">{tr('lender.nav.applications')}</span>
            </button>
            <button onClick={() => router.push('/lender/farmer')}
              className="flex items-center gap-2 p-3 rounded-lg bg-dark-base border border-border-subtle hover:border-purple-400/30 transition-all text-left">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-text-primary">{tr('lender.nav.farmers')}</span>
            </button>
            <button onClick={() => router.push('/lender/analytics')}
              className="flex items-center gap-2 p-3 rounded-lg bg-dark-base border border-border-subtle hover:border-purple-400/30 transition-all text-left">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-text-primary">{tr('lender.nav.analytics')}</span>
            </button>
            <button onClick={() => router.push('/lender/settings')}
              className="flex items-center gap-2 p-3 rounded-lg bg-dark-base border border-border-subtle hover:border-purple-400/30 transition-all text-left">
              <Activity className="w-4 h-4 text-text-muted" />
              <span className="text-xs font-medium text-text-primary">{tr('lender.nav.settings')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

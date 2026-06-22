'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Clock,
  Search, Filter, MapPin, ChevronDown, Eye, Sprout, Shield, Landmark,
  BadgeCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { KENYAN_COUNTIES } from '@/lib/constants'
import { LoanApplication, RiskLevel, Language } from '@/lib/types'
import { getSession } from '@/lib/auth'
import { t, getLanguage } from '@/lib/i18n'

type View = 'LOADING' | 'UNAUTHORIZED' | 'DASHBOARD'

const MOCK_APPLICATIONS: LoanApplication[] = [
  {
    id: 'app-1', farmerId: 'f-1', farmerName: 'Samuel Mwangi', county: 'Nyeri',
    crop: 'coffee', acres: 3, loanAmount: 85000, riskLevel: 'LOW', riskScore: 18,
    status: 'PENDING', appliedAt: '2026-06-18T08:30:00Z',
  },
  {
    id: 'app-2', farmerId: 'f-2', farmerName: 'Grace Akinyi', county: 'Kisumu',
    crop: 'rice', acres: 5, loanAmount: 120000, riskLevel: 'MEDIUM', riskScore: 45,
    status: 'PENDING', appliedAt: '2026-06-17T14:00:00Z',
  },
  {
    id: 'app-3', farmerId: 'f-3', farmerName: 'Peter Kamau', county: 'Nakuru',
    crop: 'maize', acres: 10, loanAmount: 200000, riskLevel: 'HIGH', riskScore: 72,
    status: 'PENDING', appliedAt: '2026-06-16T10:15:00Z',
  },
  {
    id: 'app-4', farmerId: 'f-4', farmerName: 'Jane Wanjiku', county: 'Kiambu',
    crop: 'tea', acres: 2, loanAmount: 45000, riskLevel: 'LOW', riskScore: 12,
    status: 'APPROVED', appliedAt: '2026-06-10T09:00:00Z',
  },
  {
    id: 'app-5', farmerId: 'f-5', farmerName: 'David Ochieng', county: 'Migori',
    crop: 'sorghum', acres: 6, loanAmount: 95000, riskLevel: 'MEDIUM', riskScore: 52,
    status: 'COUNTERED', appliedAt: '2026-06-12T11:45:00Z',
  },
  {
    id: 'app-6', farmerId: 'f-6', farmerName: 'Mary Wambui', county: 'Nyeri',
    crop: 'beans', acres: 4, loanAmount: 65000, riskLevel: 'MEDIUM', riskScore: 38,
    status: 'REJECTED', appliedAt: '2026-06-08T16:20:00Z',
  },
  {
    id: 'app-7', farmerId: 'f-7', farmerName: 'Joseph Kiprotich', county: 'Uasin Gishu',
    crop: 'wheat', acres: 15, loanAmount: 350000, riskLevel: 'LOW', riskScore: 22,
    status: 'PENDING', appliedAt: '2026-06-19T07:00:00Z',
  },
  {
    id: 'app-8', farmerId: 'f-8', farmerName: 'Amina Hassan', county: 'Mombasa',
    crop: 'tomatoes', acres: 1, loanAmount: 30000, riskLevel: 'LOW', riskScore: 10,
    status: 'APPROVED', appliedAt: '2026-06-05T13:30:00Z',
  },
]

const RISK_CONFIG: Record<RiskLevel, { color: string; bg: string; border: string; bar: string; labelKey: string }> = {
  LOW:     { color: 'text-risk-low', bg: 'bg-risk-low/10', border: 'border-risk-low/30', bar: 'bg-risk-low', labelKey: 'lender.risk.low' },
  MEDIUM:  { color: 'text-risk-medium', bg: 'bg-risk-medium/10', border: 'border-risk-medium/30', bar: 'bg-risk-medium', labelKey: 'lender.risk.medium' },
  HIGH:    { color: 'text-risk-high', bg: 'bg-risk-high/10', border: 'border-risk-high/30', bar: 'bg-risk-high', labelKey: 'lender.risk.high' },
  UNKNOWN: { color: 'text-text-muted', bg: 'bg-text-muted/10', border: 'border-text-muted/30', bar: 'bg-text-muted', labelKey: 'lender.risk.unknown' },
}

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; bg: string; labelKey: string }> = {
  PENDING:   { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10', labelKey: 'lender.status.pending' },
  APPROVED:  { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10', labelKey: 'lender.status.approved' },
  REJECTED:  { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', labelKey: 'lender.status.rejected' },
  COUNTERED: { icon: AlertTriangle, color: 'text-blue-400', bg: 'bg-blue-400/10', labelKey: 'lender.status.countered' },
}

const SORT_KEYS = [
  { key: 'date' as const, labelKey: 'lender.sort.date' },
  { key: 'amount' as const, labelKey: 'lender.sort.amount' },
  { key: 'risk' as const, labelKey: 'lender.sort.risk' },
]

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
const formatKES = (n: number) => `${t('currency.ksh')} ${n.toLocaleString('en-KE')}`

export default function LenderDashboard() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState<View>('LOADING')
  const [language, setLanguage] = useState<Language>('en')
  const [applications] = useState<LoanApplication[]>(MOCK_APPLICATIONS)

  const [countyFilter, setCountyFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'risk'>('date')

  const tr = (key: string) => t(key, language)

  useEffect(() => {
    const session = getSession()
    if (!session.isAuthenticated || session.role !== 'lender') {
      setView('UNAUTHORIZED')
    } else {
      setView('DASHBOARD')
    }
    setLanguage(getLanguage())
    setMounted(true)
  }, [])

  const filtered = useMemo(() => {
    return applications
      .filter(a => countyFilter === 'ALL' || a.county === countyFilter)
      .filter(a => statusFilter === 'ALL' || a.status === statusFilter)
      .filter(a => {
        if (!searchTerm) return true
        const q = searchTerm.toLowerCase()
        return a.farmerName.toLowerCase().includes(q) || a.county.toLowerCase().includes(q) || a.crop.toLowerCase().includes(q)
      })
      .sort((a, b) => {
        if (sortBy === 'date') return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
        if (sortBy === 'amount') return b.loanAmount - a.loanAmount
        return a.riskScore - b.riskScore
      })
  }, [applications, countyFilter, statusFilter, searchTerm, sortBy])

  const stats = useMemo(() => {
    const approved = applications.filter(a => a.status === 'APPROVED')
    const avgRisk = applications.length > 0
      ? Math.round(applications.reduce((s, a) => s + a.riskScore, 0) / applications.length)
      : 0
    return {
      total: applications.length,
      pending: applications.filter(a => a.status === 'PENDING').length,
      approved: approved.length,
      rejected: applications.filter(a => a.status === 'REJECTED').length,
      countered: applications.filter(a => a.status === 'COUNTERED').length,
      disbursed: approved.reduce((acc, a) => acc + a.loanAmount, 0),
      avgRisk,
    }
  }, [applications])

  if (!mounted) return null

  if (view === 'LOADING') {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-text-muted text-sm">{tr('app.loading')}</p>
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
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-border-subtle">
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

      {/* Stats bar */}
      <div className="px-4 sm:px-6 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: 'lender.stats.applications', value: stats.total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { key: 'lender.stats.pendingReview', value: stats.pending, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { key: 'lender.stats.approved', value: stats.approved, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
          { key: 'lender.stats.rejected', value: stats.rejected, icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
          { key: 'lender.stats.countered', value: stats.countered, icon: AlertTriangle, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { key: 'lender.stats.avgRisk', value: `${stats.avgRisk}/100`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
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

      {/* Filters */}
      <div className="px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-2.5 border-b border-border-subtle">
        <div className="flex items-center gap-2 w-full sm:flex-1 sm:min-w-[180px] bg-dark-mid border border-border-subtle rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            type="text"
            placeholder={tr('lender.filters.search')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-text-primary w-full placeholder:text-text-muted/50"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            <select
              value={countyFilter}
              onChange={e => setCountyFilter(e.target.value)}
              className="appearance-none bg-dark-mid border border-border-subtle rounded-lg pl-8 pr-8 py-2 text-xs text-text-primary cursor-pointer outline-none"
            >
              <option value="ALL">{tr('lender.filters.allCounties')}</option>
              {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none bg-dark-mid border border-border-subtle rounded-lg pl-8 pr-8 py-2 text-xs text-text-primary cursor-pointer outline-none"
            >
              <option value="ALL">{tr('lender.filters.allStatus')}</option>
              <option value="PENDING">{tr('lender.status.pending')}</option>
              <option value="APPROVED">{tr('lender.status.approved')}</option>
              <option value="REJECTED">{tr('lender.status.rejected')}</option>
              <option value="COUNTERED">{tr('lender.status.countered')}</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 sm:ml-auto">
            <span className="text-[11px] text-text-muted hidden sm:inline">{tr('lender.filters.sortBy')}</span>
            {SORT_KEYS.map(s => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all',
                  sortBy === s.key
                    ? 'bg-gold-harvest/20 text-gold-harvest border border-gold-harvest/30'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                {tr(s.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications list */}
      <div className="px-4 sm:px-6 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-20 animate-fadeIn">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-dark-mid border border-border-subtle flex items-center justify-center">
              <Search className="w-6 h-6 text-text-muted/25" />
            </div>
            <p className="text-text-primary font-medium text-sm mb-1">{tr('lender.empty.title')}</p>
            <p className="text-text-muted text-xs">{tr('lender.empty.desc')}</p>
          </div>
        ) : (
          filtered.map((app, i) => {
            const riskCfg = RISK_CONFIG[app.riskLevel]
            const statusCfg = STATUS_CONFIG[app.status]
            const StatusIcon = statusCfg.icon
            return (
              <div
                key={app.id}
                className="bg-dark-mid border border-border-subtle rounded-xl p-4 hover:border-border-subtle/60 transition-all cursor-pointer group animate-fadeIn"
                style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }}
                onClick={() => router.push(`/lender/farmer/${app.id}`)}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  {/* Left: farmer info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-sm font-semibold text-text-primary group-hover:text-green-400 transition-colors truncate">
                        {app.farmerName}
                      </h3>
                      <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0', riskCfg.bg, riskCfg.color)}>
                        {app.riskLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-text-muted flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.county}</span>
                      <span className="flex items-center gap-1"><Sprout className="w-3 h-3" />{app.crop}</span>
                      <span>{app.acres} {tr('lender.acres')}</span>
                    </div>
                  </div>

                  {/* Middle: loan + risk bar */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-text-primary font-mono">{formatKES(app.loanAmount)}</p>
                    <div className="flex items-center gap-1.5 justify-end mt-1">
                      <span className="text-[10px] text-text-muted">{tr('lender.riskScore')}:</span>
                      <span className={cn('text-[10px] font-semibold', riskCfg.color)}>{app.riskScore}</span>
                      <div className="w-16 h-1.5 rounded-full bg-dark-base overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', riskCfg.bar)}
                          style={{ width: `${app.riskScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: status + date */}
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end gap-1 min-w-[90px]">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium', statusCfg.bg, statusCfg.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {tr(statusCfg.labelKey)}
                      </span>
                      <span className="text-[10px] text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(app.appliedAt)}
                      </span>
                    </div>
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center transition-all', riskCfg.bg, riskCfg.border, 'border group-hover:scale-110')}>
                      <Eye className="w-4 h-4 text-text-muted/50 group-hover:text-green-400 transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Risk detail footer */}
                <div className={cn('mt-3 pt-3 border-t border-border-subtle text-[11px]', riskCfg.color)}>
                  {tr(riskCfg.labelKey)}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

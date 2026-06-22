'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText, Search, Filter, MapPin, ChevronDown, Eye, Sprout, Clock,
  CheckCircle2, XCircle, AlertTriangle, TrendingUp, Users, Loader2,
  CalendarDays, UsersRound, BadgeCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { KENYAN_COUNTIES } from '@/lib/constants'
import { LoanApplication, RiskLevel, Language } from '@/lib/types'
import { getSession, getToken } from '@/lib/auth'
import { t, getLanguage } from '@/lib/i18n'

type View = 'LOADING' | 'UNAUTHORIZED' | 'READY'

const RISK_CONFIG: Record<RiskLevel, { color: string; bg: string; bar: string }> = {
  LOW:     { color: 'text-risk-low', bg: 'bg-risk-low/10', bar: 'bg-risk-low' },
  MEDIUM:  { color: 'text-risk-medium', bg: 'bg-risk-medium/10', bar: 'bg-risk-medium' },
  HIGH:    { color: 'text-risk-high', bg: 'bg-risk-high/10', bar: 'bg-risk-high' },
  UNKNOWN: { color: 'text-text-muted', bg: 'bg-text-muted/10', bar: 'bg-text-muted' },
}

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; bg: string; labelKey: string }> = {
  PENDING:   { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10', labelKey: 'lender.status.pending' },
  APPROVED:  { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10', labelKey: 'lender.status.approved' },
  REJECTED:  { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', labelKey: 'lender.status.rejected' },
  COUNTERED: { icon: AlertTriangle, color: 'text-blue-400', bg: 'bg-blue-400/10', labelKey: 'lender.status.countered' },
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
const formatKES = (n: number) => `${t('currency.ksh')} ${n.toLocaleString('en-KE')}`

const getSeason = () => {
  const m = new Date().getMonth() + 1
  if (m >= 3 && m <= 5) return { en: 'Long Rains', sw: 'Masika', color: 'text-blue-400 bg-blue-400/10' }
  if (m >= 10 && m <= 12) return { en: 'Short Rains', sw: 'Vuli', color: 'text-cyan-400 bg-cyan-400/10' }
  return { en: 'Dry Season', sw: 'Kiangazi', color: 'text-amber-400 bg-amber-400/10' }
}

export default function LenderApplicationsPage() {
  const router = useRouter()
  const [view, setView] = useState<View>('LOADING')
  const [language, setLanguage] = useState<Language>('en')
  const [applications, setApplications] = useState<LoanApplication[]>([])
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
      const token = getToken()
      fetch('/api/lender/applications', {
        headers: { authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) setApplications(data.applications)
        })
        .finally(() => setView('READY'))
    }
    setLanguage(getLanguage())
  }, [])

  useEffect(() => {
    if (view === 'UNAUTHORIZED') {
      const tmr = setTimeout(() => router.push('/auth/login'), 2000)
      return () => clearTimeout(tmr)
    }
  }, [view, router])

  const SORT_KEYS = [
    { key: 'date' as const, labelKey: 'lender.sort.date' },
    { key: 'amount' as const, labelKey: 'lender.sort.amount' },
    { key: 'risk' as const, labelKey: 'lender.sort.risk' },
  ]

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
  }, [countyFilter, statusFilter, searchTerm, sortBy])

  const stats = useMemo(() => ({
    total: applications.length,
    pending: applications.filter(a => a.status === 'PENDING').length,
    approved: applications.filter(a => a.status === 'APPROVED').length,
    avgRisk: applications.length > 0
      ? Math.round(applications.reduce((s, a) => s + a.riskScore, 0) / applications.length)
      : 0,
  }), [])

  if (view === 'LOADING') return (
    <div className="flex h-full items-center justify-center">
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 text-text-muted animate-spin" />
        <p className="text-text-muted text-sm">{tr('app.loading')}</p>
      </div>
    </div>
  )

  if (view === 'UNAUTHORIZED') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <FileText className="w-12 h-12 text-purple-400 mx-auto" />
          <p className="text-text-primary font-semibold text-lg">Access Denied</p>
          <p className="text-text-muted text-sm">Only lenders can access this page.</p>
          <p className="text-text-muted/60 text-xs">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
        <FileText className="w-3.5 h-3.5" />
        <span>{tr('lender.title')} / {tr('lender.nav.applications')}</span>
      </div>
      <h1 className="text-xl sm:text-2xl font-serif font-bold text-text-primary mb-1">
        {tr('lender.nav.applications')}
      </h1>
      <p className="text-sm text-text-muted mb-6">{tr('lender.subtitle')}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {[
          { key: 'lender.stats.applications', value: stats.total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { key: 'lender.stats.pendingReview', value: stats.pending, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { key: 'lender.stats.approved', value: stats.approved, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
          { key: 'lender.stats.rejected', value: applications.filter(a => a.status === 'REJECTED').length, icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
          { key: 'lender.stats.avgRisk', value: `${stats.avgRisk}/100`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ].map(s => (
          <div key={s.key} className={cn('rounded-xl p-3 border border-border-subtle', s.bg)}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <s.icon className={cn('w-3.5 h-3.5', s.color)} />
              <span className="text-[10px] text-text-muted uppercase tracking-wide">{s.key.includes('.') ? tr(s.key) : s.key}</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-text-primary">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 mb-4">
        <div className="flex items-center gap-2 w-full sm:flex-1 bg-dark-mid border border-border-subtle rounded-xl px-3 py-2.5">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input type="text" placeholder={tr('lender.filters.search')} value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-text-primary w-full placeholder:text-text-muted/50"
          />
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            <select value={countyFilter} onChange={e => setCountyFilter(e.target.value)}
              className="appearance-none bg-dark-mid border border-border-subtle rounded-xl pl-8 pr-8 py-2.5 text-xs text-text-primary cursor-pointer outline-none"
            >
              <option value="ALL">{tr('lender.filters.allCounties')}</option>
              {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none bg-dark-mid border border-border-subtle rounded-xl pl-8 pr-8 py-2.5 text-xs text-text-primary cursor-pointer outline-none"
            >
              <option value="ALL">{tr('lender.filters.allStatus')}</option>
              <option value="PENDING">{tr('lender.status.pending')}</option>
              <option value="APPROVED">{tr('lender.status.approved')}</option>
              <option value="REJECTED">{tr('lender.status.rejected')}</option>
              <option value="COUNTERED">{tr('lender.status.countered')}</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
          </div>
          <div className="flex items-center gap-1">
            {SORT_KEYS.map(s => (
              <button key={s.key} onClick={() => setSortBy(s.key)}
                className={cn('px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all',
                  sortBy === s.key ? 'bg-purple-400/20 text-purple-400 border border-purple-400/30' : 'text-text-muted hover:text-text-primary'
                )}
              >{tr(s.labelKey)}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-10 h-10 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted text-sm">{tr('lender.empty.title')}</p>
          </div>
        ) : (
          filtered.map((app) => {
            const riskCfg = RISK_CONFIG[app.riskLevel]
            const statusCfg = STATUS_CONFIG[app.status]
            const StatusIcon = statusCfg.icon
            const season = getSeason()
            const repaymentRate = app.totalBorrowed && app.totalBorrowed > 0
              ? Math.round((app.totalRepaid! / app.totalBorrowed) * 100)
              : null
            return (
              <div key={app.id}
                className="bg-dark-mid border border-border-subtle rounded-xl p-4 hover:border-purple-400/20 transition-all cursor-pointer group"
                onClick={() => router.push(`/lender/farmer/${app.id}`)}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-sm font-semibold text-text-primary group-hover:text-purple-400 transition-colors truncate">
                        {app.farmerName}
                      </h3>
                      <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0', riskCfg.bg, riskCfg.color)}>
                        {app.riskLevel}
                      </span>
                      {app.chamaName && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-400/10 text-indigo-400">
                          <UsersRound className="w-2.5 h-2.5" />
                          Chama
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-text-muted flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.county}</span>
                      <span className="flex items-center gap-1"><Sprout className="w-3 h-3" />{app.crop}</span>
                      <span>{app.farmAcres ?? app.acres} {tr('lender.acres')}</span>
                      <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium', season.color)}>
                        <CalendarDays className="w-2.5 h-2.5" />
                        {season.en}
                      </span>
                    </div>
                    {repaymentRate !== null && (
                      <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                        <span className={cn(
                          repaymentRate >= 80 ? 'text-green-400' : repaymentRate >= 50 ? 'text-yellow-400' : 'text-red-400'
                        )}>
                          {repaymentRate}% repaid
                        </span>
                        {app.hasDefaulted && (
                          <span className="text-red-400 flex items-center gap-0.5">
                            <XCircle className="w-2.5 h-2.5" />
                            Defaulted
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-text-primary">{formatKES(app.loanAmount)}</p>
                    <div className="flex items-center gap-1.5 justify-end mt-1">
                      <span className="text-[10px] text-text-muted">{tr('lender.riskScore')}:</span>
                      <span className={cn('text-[10px] font-semibold', riskCfg.color)}>{app.riskScore}</span>
                      <div className="w-16 h-1.5 rounded-full bg-dark-base overflow-hidden">
                        <div className={cn('h-full rounded-full', riskCfg.bar)} style={{ width: `${app.riskScore}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium', statusCfg.bg, statusCfg.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {tr(statusCfg.labelKey)}
                      </span>
                      <span className="text-[10px] text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(app.appliedAt)}
                      </span>
                    </div>
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', riskCfg.bg, 'border border-purple-400/20 group-hover:scale-110 transition-all')}>
                      <Eye className="w-4 h-4 text-text-muted/50 group-hover:text-purple-400 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

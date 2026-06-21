'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, TrendingUp, AlertTriangle, CheckCircle2,
  XCircle, Clock, Search, Filter, MapPin, ChevronDown, Eye,
  Sprout, Shield, Landmark, BadgeCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { KENYAN_COUNTIES } from '@/lib/constants'
import { LoanApplication, RiskLevel, Language } from '@/lib/types'
import { getSession } from '@/lib/auth'

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

const riskConfig: Record<RiskLevel, { color: string; bg: string; border: string; label: string }> = {
  LOW:     { color: 'text-risk-low', bg: 'bg-risk-low/10', border: 'border-risk-low/30', label: 'Low risk — recommend approve' },
  MEDIUM:  { color: 'text-risk-medium', bg: 'bg-risk-medium/10', border: 'border-risk-medium/30', label: 'Medium risk — review carefully' },
  HIGH:    { color: 'text-risk-high', bg: 'bg-risk-high/10', border: 'border-risk-high/30', label: 'High risk — likely decline' },
  UNKNOWN: { color: 'text-text-muted', bg: 'bg-text-muted/10', border: 'border-text-muted/30', label: 'Unknown' },
}

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
  PENDING:   { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Pending' },
  APPROVED:  { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Approved' },
  REJECTED:  { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Rejected' },
  COUNTERED: { icon: AlertTriangle, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Counter-offer' },
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
const formatKES = (n: number) => `Ksh ${n.toLocaleString('en-KE')}`

export default function LenderDashboard() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState<View>('LOADING')
  const [language] = useState<Language>('en')
  const [applications] = useState<LoanApplication[]>(MOCK_APPLICATIONS)

  const [countyFilter, setCountyFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'risk'>('date')

  useEffect(() => {
    const session = getSession()
    if (!session.isAuthenticated || session.role !== 'lender') {
      setView('UNAUTHORIZED')
    } else {
      setView('DASHBOARD')
    }
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

  const stats = useMemo(() => ({
    total: applications.length,
    pending: applications.filter(a => a.status === 'PENDING').length,
    approved: applications.filter(a => a.status === 'APPROVED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
    totalDisbursed: applications.filter(a => a.status === 'APPROVED').reduce((acc, a) => acc + a.loanAmount, 0),
  }), [applications])

  if (!mounted) return null
  if (view === 'LOADING') return <div className="flex h-full items-center justify-center"><p className="text-text-muted text-sm">Loading...</p></div>
  if (view === 'UNAUTHORIZED') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-text-muted/40 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">Lender Access Only</h2>
          <p className="text-sm text-text-muted">You must be logged in as a lender to view this dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary flex items-center gap-2">
              <Landmark className="w-5 h-5 text-gold-harvest" />
              Lender Dashboard
            </h1>
            <p className="text-sm text-text-muted mt-1">Verified farmer loan applications ready for review</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-mid border border-border-subtle">
            <BadgeCheck className="w-4 h-4 text-green-400" />
            <span className="text-xs text-text-primary font-medium">Verified Lender</span>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-6 py-4 grid grid-cols-5 gap-3">
        {[
          { label: 'Applications', value: stats.total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
          { label: 'Disbursed', value: formatKES(stats.totalDisbursed), icon: Landmark, color: 'text-gold-harvest', bg: 'bg-gold-harvest/10' },
        ].map(s => (
          <div key={s.label} className={cn('rounded-xl p-3 border border-border-subtle', s.bg)}>
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={cn('w-4 h-4', s.color)} />
              <span className="text-[11px] text-text-muted uppercase tracking-wide">{s.label}</span>
            </div>
            <p className="text-lg font-bold text-text-primary">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="px-6 py-3 flex items-center gap-3 flex-wrap border-b border-border-subtle">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-dark-mid border border-border-subtle rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search by name, county or crop..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-text-primary w-full placeholder:text-text-muted/50"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          <select
            value={countyFilter}
            onChange={e => setCountyFilter(e.target.value)}
            className="appearance-none bg-dark-mid border border-border-subtle rounded-lg pl-8 pr-8 py-2 text-xs text-text-primary cursor-pointer outline-none"
          >
            <option value="ALL">All counties</option>
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
            <option value="ALL">All status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="COUNTERED">Counter-offers</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[11px] text-text-muted">Sort by:</span>
          {[
            { key: 'date' as const, label: 'Date' },
            { key: 'amount' as const, label: 'Amount' },
            { key: 'risk' as const, label: 'Risk' },
          ].map(s => (
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
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications list */}
      <div className="px-6 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
            <p className="text-text-muted text-sm">No applications match your filters</p>
          </div>
        ) : (
          filtered.map(app => {
            const risk = riskConfig[app.riskLevel]
            const status = statusConfig[app.status]
            const StatusIcon = status.icon
            return (
              <div
                key={app.id}
                className="bg-dark-mid border border-border-subtle rounded-xl p-4 hover:border-border-subtle/60 transition-all cursor-pointer group"
                onClick={() => router.push(`/lender/farmer/${app.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: farmer info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-text-primary group-hover:text-green-400 transition-colors">
                        {app.farmerName}
                      </h3>
                      <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium', risk.bg, risk.color)}>
                        {app.riskLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-text-muted">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.county}</span>
                      <span className="flex items-center gap-1"><Sprout className="w-3 h-3" />{app.crop}</span>
                      <span>{app.acres} acres</span>
                    </div>
                  </div>

                  {/* Middle: loan info */}
                  <div className="text-right">
                    <p className="text-sm font-bold text-text-primary">{formatKES(app.loanAmount)}</p>
                    <p className={cn('text-[10px]', risk.color)}>Risk score: {app.riskScore}/100</p>
                  </div>

                  {/* Right: status + date */}
                  <div className="text-right flex flex-col items-end gap-1 min-w-[100px]">
                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium', status.bg, status.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                    <span className="text-[10px] text-text-muted">{formatDate(app.appliedAt)}</span>
                  </div>

                  <Eye className="w-4 h-4 text-text-muted/30 group-hover:text-green-400 transition-colors shrink-0 ml-2" />
                </div>

                {/* Risk detail */}
                <div className={cn('mt-3 pt-3 border-t border-border-subtle text-[11px]', risk.color)}>
                  {risk.label}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

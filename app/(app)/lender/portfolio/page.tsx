'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Landmark, TrendingUp, TrendingDown, Users, Clock, Shield, Search, Filter, MapPin,
  Sprout, ChevronDown, DollarSign, Calendar, CheckCircle2, AlertTriangle,
  BadgeCheck, ArrowUpRight, XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { KENYAN_COUNTIES } from '@/lib/constants'
import { ActiveLoan, Language } from '@/lib/types'
import { getSession, getToken } from '@/lib/auth'

type View = 'LOADING' | 'UNAUTHORIZED' | 'PORTFOLIO'

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  ACTIVE:    { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Active' },
  PAID_OFF:  { icon: BadgeCheck, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Paid off' },
  DEFAULTED: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Defaulted' },
}

const formatDate = (d: string) => {
  if (d === '-') return '-'
  return new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
}
const formatKES = (n: number) => `Ksh ${n.toLocaleString('en-KE')}`

export default function LenderPortfolio() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState<View>('LOADING')
  const [language] = useState<Language>('en')
  const [loans, setLoans] = useState<ActiveLoan[]>([])
  const [fetching, setFetching] = useState(true)

  const [countyFilter, setCountyFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedLoan, setExpandedLoan] = useState<string | null>(null)

  useEffect(() => {
    const session = getSession()
    if (!session.isAuthenticated || session.role !== 'lender') {
      setView('UNAUTHORIZED')
      setMounted(true)
      return
    }
    setView('PORTFOLIO')
    setMounted(true)

    ;(async () => {
      try {
        const token = getToken()
        const res = await fetch('/api/lender/portfolio', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.success) setLoans(data.loans || [])
        }
      } catch (e) {
        console.error('Failed to fetch portfolio', e)
      } finally {
        setFetching(false)
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    return loans
      .filter(l => countyFilter === 'ALL' || l.county === countyFilter)
      .filter(l => statusFilter === 'ALL' || l.status === statusFilter)
      .filter(l => {
        if (!searchTerm) return true
        const q = searchTerm.toLowerCase()
        return l.farmerName.toLowerCase().includes(q) || l.county.toLowerCase().includes(q) || l.crop.toLowerCase().includes(q)
      })
  }, [loans, countyFilter, statusFilter, searchTerm])

  const stats = useMemo(() => ({
    active: loans.filter(l => l.status === 'ACTIVE').length,
    paidOff: loans.filter(l => l.status === 'PAID_OFF').length,
    defaulted: loans.filter(l => l.status === 'DEFAULTED').length,
    totalOutstanding: loans.filter(l => l.status !== 'PAID_OFF').reduce((acc, l) => acc + l.remainingBalance, 0),
    totalDisbursed: loans.reduce((acc, l) => acc + l.amount, 0),
    onTimeRate: loans.filter(l => l.status !== 'DEFAULTED').length / Math.max(loans.length, 1) * 100,
  }), [loans])

  if (!mounted) return null
  if (view === 'LOADING') return <div className="flex h-full items-center justify-center"><p className="text-text-muted text-sm">Loading...</p></div>
  if (view === 'UNAUTHORIZED') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-text-muted/40 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">Lender Access Only</h2>
          <p className="text-sm text-text-muted">You must be logged in as a lender to view your portfolio.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-border-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-text-primary flex items-center gap-2">
              <Landmark className="w-5 h-5 text-gold-harvest" />
              Loan Portfolio
            </h1>
            <p className="text-sm text-text-muted mt-1">Active loans and repayment tracking</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-mid border border-border-subtle w-fit">
            <BadgeCheck className="w-4 h-4 text-green-400" />
            <span className="text-xs text-text-primary font-medium">Verified Lender</span>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-4 sm:px-6 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Active Loans', value: stats.active, icon: Users, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Paid Off', value: stats.paidOff, icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Defaulted', value: stats.defaulted, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10' },
          { label: 'Outstanding', value: formatKES(stats.totalOutstanding), icon: TrendingDown, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'On-time rate', value: `${Math.round(stats.onTimeRate)}%`, icon: TrendingUp, color: 'text-gold-harvest', bg: 'bg-gold-harvest/10' },
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
      <div className="px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-2.5 border-b border-border-subtle">
        <div className="flex items-center gap-2 w-full sm:flex-1 sm:min-w-[180px] bg-dark-mid border border-border-subtle rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search by name, county or crop..."
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
              <option value="ACTIVE">Active</option>
              <option value="PAID_OFF">Paid off</option>
              <option value="DEFAULTED">Defaulted</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Loans list */}
      <div className="px-4 sm:px-6 py-4 space-y-3">
        {fetching ? (
          <div className="text-center py-16">
            <p className="text-text-muted text-sm">Loading portfolio...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
            <p className="text-text-muted text-sm">{loans.length === 0 ? 'No active loans yet. Approve a loan application to get started.' : 'No loans match your filters'}</p>
          </div>
        ) : (
          filtered.map(loan => {
            const status = statusConfig[loan.status]
            const StatusIcon = status.icon
            const isExpanded = expandedLoan === loan.id
            const progress = loan.totalPaid / (loan.amount * (1 + loan.interestRate / 100)) * 100

            return (
              <div key={loan.id} className="bg-dark-mid border border-border-subtle rounded-xl overflow-hidden">
                {/* Main row */}
                <div
                  className="p-4 cursor-pointer hover:bg-dark-base/50 transition-colors"
                  onClick={() => setExpandedLoan(isExpanded ? null : loan.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-semibold text-text-primary truncate max-w-[180px] sm:max-w-none">{loan.farmerName}</h3>
                        <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0', status.bg, status.color)}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 text-[11px] text-text-muted flex-wrap">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{loan.county}</span>
                        <span className="flex items-center gap-1"><Sprout className="w-3 h-3" />{loan.crop}</span>
                        <span>{loan.duration} mos</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-text-primary">{formatKES(loan.amount)}</p>
                      <p className="text-[10px] text-text-muted">{loan.interestRate}% interest</p>
                    </div>

                    <ChevronDown className={cn('w-4 h-4 text-text-muted shrink-0 mt-1 transition-transform', isExpanded && 'rotate-180')} />
                  </div>

                  {/* Next payment + progress */}
                  <div className="flex items-end justify-between gap-3 mt-2">
                    <div className="text-left min-w-0">
                      <p className="text-[10px] text-text-muted uppercase">Next</p>
                      {loan.nextPaymentDue === '-' ? (
                        <p className="text-[11px] text-text-muted">-</p>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-text-primary">{formatKES(loan.nextPaymentAmount)}</span>
                          <span className="text-[10px] text-text-muted flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(loan.nextPaymentDue)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress bar */}
                    {loan.status === 'ACTIVE' && (
                      <div className="flex-1 max-w-[140px] sm:max-w-[200px]">
                        <div className="w-full h-1.5 bg-dark-base rounded-full overflow-hidden">
                          <div className="h-full bg-green-primary rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                        </div>
                        <div className="flex justify-between mt-1 text-[9px] sm:text-[10px]">
                          <span className="text-text-muted">{formatKES(loan.totalPaid)}</span>
                          <span className="text-text-muted">{formatKES(loan.remainingBalance)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded: payment history */}
                {isExpanded && (
                  <div className="border-t border-border-subtle bg-dark-base/50 px-4 py-3">
                    <h4 className="text-[11px] uppercase tracking-widest text-text-muted/60 mb-2">Payment History</h4>
                    <p className="text-[12px] text-text-muted">No payments recorded yet</p>

                    {/* Disbursement info */}
                    <div className="mt-3 pt-3 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                      <span className="text-text-muted">Disbursed: {formatDate(loan.disbursedAt)}</span>
                      <span className={cn('font-medium', loan.status === 'ACTIVE' ? 'text-green-400' : loan.status === 'PAID_OFF' ? 'text-blue-400' : 'text-red-400')}>
                        {loan.status === 'ACTIVE' ? `${formatKES(loan.remainingBalance)} outstanding` :
                         loan.status === 'PAID_OFF' ? 'Fully repaid' :
                         'In default'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

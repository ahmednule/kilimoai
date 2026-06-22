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
import { ActiveLoan, PaymentRecord, Language } from '@/lib/types'
import { getSession } from '@/lib/auth'

type View = 'LOADING' | 'UNAUTHORIZED' | 'PORTFOLIO'

const MOCK_PAYMENTS: Record<string, PaymentRecord[]> = {
  'loan-1': [
    { id: 'pay-1', date: '2026-04-15', amount: 9800, method: 'MPESA', mpesaRef: 'QE8X2K9ABC' },
    { id: 'pay-2', date: '2026-05-15', amount: 9800, method: 'MPESA', mpesaRef: 'RF7Y1M5DEF' },
    { id: 'pay-3', date: '2026-06-15', amount: 9800, method: 'MPESA', mpesaRef: 'PG3N8W7GHI' },
  ],
  'loan-2': [
    { id: 'pay-4', date: '2026-03-20', amount: 23000, method: 'BANK' },
    { id: 'pay-5', date: '2026-04-20', amount: 23000, method: 'BANK' },
  ],
  'loan-3': [
    { id: 'pay-6', date: '2026-06-01', amount: 3250, method: 'MPESA', mpesaRef: 'LM6B4T2JKL' },
  ],
  'loan-4': [
    { id: 'pay-7', date: '2026-05-10', amount: 4200, method: 'MPESA', mpesaRef: 'SN2F8G6MNO' },
    { id: 'pay-8', date: '2026-06-10', amount: 4200, method: 'MPESA', mpesaRef: 'DP7K3H9PQR' },
  ],
}

const MOCK_LOANS: ActiveLoan[] = [
  {
    id: 'loan-1', farmerId: 'f-1', farmerName: 'Samuel Mwangi', county: 'Nyeri',
    crop: 'coffee', amount: 85000, interestRate: 12, duration: 12,
    disbursedAt: '2026-03-15', remainingBalance: 55600, totalPaid: 29400,
    nextPaymentDue: '2026-07-15', nextPaymentAmount: 9800, status: 'ACTIVE',
  },
  {
    id: 'loan-2', farmerId: 'f-4', farmerName: 'Jane Wanjiku', county: 'Kiambu',
    crop: 'tea', amount: 45000, interestRate: 10, duration: 9,
    disbursedAt: '2026-02-20', remainingBalance: 0, totalPaid: 49500,
    nextPaymentDue: '-', nextPaymentAmount: 0, status: 'PAID_OFF',
  },
  {
    id: 'loan-3', farmerId: 'f-8', farmerName: 'Amina Hassan', county: 'Mombasa',
    crop: 'tomatoes', amount: 30000, interestRate: 8, duration: 6,
    disbursedAt: '2026-05-01', remainingBalance: 26750, totalPaid: 3250,
    nextPaymentDue: '2026-07-01', nextPaymentAmount: 5417, status: 'ACTIVE',
  },
  {
    id: 'loan-4', farmerId: 'f-9', farmerName: 'John Baraka', county: 'Taita-Taveta',
    crop: 'avocado', amount: 55000, interestRate: 14, duration: 18,
    disbursedAt: '2026-04-10', remainingBalance: 46600, totalPaid: 8400,
    nextPaymentDue: '2026-07-10', nextPaymentAmount: 4200, status: 'ACTIVE',
  },
  {
    id: 'loan-5', farmerId: 'f-10', farmerName: 'Fatuma Juma', county: 'Kilifi',
    crop: 'maize', amount: 120000, interestRate: 15, duration: 24,
    disbursedAt: '2025-11-01', remainingBalance: 0, totalPaid: 0,
    nextPaymentDue: '2026-02-01', nextPaymentAmount: 5750, status: 'DEFAULTED',
  },
]

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
  const [loans] = useState<ActiveLoan[]>(MOCK_LOANS)

  const [countyFilter, setCountyFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedLoan, setExpandedLoan] = useState<string | null>(null)

  useEffect(() => {
    const session = getSession()
    if (!session.isAuthenticated || session.role !== 'lender') {
      setView('UNAUTHORIZED')
    } else {
      setView('PORTFOLIO')
    }
    setMounted(true)
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
      <div className="px-6 py-5 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary flex items-center gap-2">
              <Landmark className="w-5 h-5 text-gold-harvest" />
              Loan Portfolio
            </h1>
            <p className="text-sm text-text-muted mt-1">Active loans and repayment tracking</p>
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
            <option value="ACTIVE">Active</option>
            <option value="PAID_OFF">Paid off</option>
            <option value="DEFAULTED">Defaulted</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Loans list */}
      <div className="px-6 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
            <p className="text-text-muted text-sm">No loans match your filters</p>
          </div>
        ) : (
          filtered.map(loan => {
            const status = statusConfig[loan.status]
            const StatusIcon = status.icon
            const isExpanded = expandedLoan === loan.id
            const payments = MOCK_PAYMENTS[loan.id] ?? []
            const progress = loan.totalPaid / (loan.amount * (1 + loan.interestRate / 100)) * 100

            return (
              <div key={loan.id} className="bg-dark-mid border border-border-subtle rounded-xl overflow-hidden">
                {/* Main row */}
                <div
                  className="p-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-dark-base/50 transition-colors"
                  onClick={() => setExpandedLoan(isExpanded ? null : loan.id)}
                >
                  {/* Left: farmer info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-text-primary">{loan.farmerName}</h3>
                      <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium', status.bg, status.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-text-muted">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{loan.county}</span>
                      <span className="flex items-center gap-1"><Sprout className="w-3 h-3" />{loan.crop}</span>
                      <span>{loan.duration} mos</span>
                    </div>
                    {/* Progress bar */}
                    {loan.status === 'ACTIVE' && (
                      <div className="mt-2">
                        <div className="w-full h-1.5 bg-dark-base rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-primary rounded-full transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-[10px]">
                          <span className="text-text-muted">{formatKES(loan.totalPaid)} paid</span>
                          <span className="text-text-muted">{formatKES(loan.remainingBalance)} remaining</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Middle: loan amounts */}
                  <div className="text-right">
                    <p className="text-sm font-bold text-text-primary">{formatKES(loan.amount)}</p>
                    <p className="text-[10px] text-text-muted">{loan.interestRate}% interest</p>
                  </div>

                  {/* Right: next payment */}
                  <div className="text-right min-w-[100px]">
                    <p className="text-[10px] text-text-muted uppercase">Next payment</p>
                    {loan.nextPaymentDue === '-' ? (
                      <p className="text-[11px] text-text-muted">-</p>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-text-primary">
                          {formatKES(loan.nextPaymentAmount)}
                        </p>
                        <p className="text-[10px] text-text-muted flex items-center justify-end gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(loan.nextPaymentDue)}
                        </p>
                      </>
                    )}
                  </div>

                  <ChevronDown className={cn('w-4 h-4 text-text-muted shrink-0 transition-transform', isExpanded && 'rotate-180')} />
                </div>

                {/* Expanded: payment history */}
                {isExpanded && (
                  <div className="border-t border-border-subtle bg-dark-base/50 px-4 py-3">
                    <h4 className="text-[11px] uppercase tracking-widest text-text-muted/60 mb-2">Payment History</h4>
                    {payments.length === 0 ? (
                      <p className="text-[12px] text-text-muted">No payments recorded yet</p>
                    ) : (
                      <div className="space-y-1.5">
                        {payments.map(p => (
                          <div key={p.id} className="flex items-center justify-between text-[12px]">
                            <div className="flex items-center gap-3">
                              <span className="text-text-muted">{formatDate(p.date)}</span>
                              <span className={cn(
                                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium',
                                p.method === 'MPESA' ? 'bg-green-400/10 text-green-400' : 'bg-blue-400/10 text-blue-400'
                              )}>
                                {p.method}
                                {p.mpesaRef && <span className="text-text-muted/60 ml-1">{p.mpesaRef}</span>}
                              </span>
                            </div>
                            <span className="text-text-primary font-medium">{formatKES(p.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Disbursement info */}
                    <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between text-[11px]">
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

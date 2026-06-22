'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Landmark, TrendingUp, TrendingDown, Search, Filter, MapPin,
  Sprout, Calendar, CheckCircle2, AlertTriangle, BadgeCheck,
  DollarSign, Loader2, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { KENYAN_COUNTIES } from '@/lib/constants'
import { ActiveLoan } from '@/lib/types'
import { getSession, getToken } from '@/lib/auth'

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  ACTIVE:    { color: 'text-green-400', bg: 'bg-green-400/10', label: 'Active' },
  PAID_OFF:  { color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Paid off' },
  DEFAULTED: { color: 'text-red-400', bg: 'bg-red-400/10', label: 'Defaulted' },
}

const formatDate = (d: string) => {
  if (d === '-') return '-'
  return new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
}
const formatKES = (n: number) => `Ksh ${n.toLocaleString('en-KE')}`

export default function LenderPortfolio() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState<'LOADING' | 'UNAUTHORIZED' | 'READY'>('LOADING')
  const [loans, setLoans] = useState<ActiveLoan[]>([])

  const [countyFilter, setCountyFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const session = getSession()
    if (!session.isAuthenticated || session.role !== 'lender') {
      setView('UNAUTHORIZED')
    } else {
      const token = getToken()
      fetch('/api/lender/portfolio', {
        headers: { authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) setLoans(data.loans)
        })
        .finally(() => setView('READY'))
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

  const stats = useMemo(() => {
    const active = loans.filter(l => l.status === 'ACTIVE')
    const paidOff = loans.filter(l => l.status === 'PAID_OFF')
    const defaulted = loans.filter(l => l.status === 'DEFAULTED')
    const outstanding = active.reduce((s, l) => s + l.remainingBalance, 0)
    const atRisk = defaulted.reduce((s, l) => s + l.remainingBalance, 0)
    const totalAmount = loans.reduce((s, l) => s + l.amount, 0)
    const collected = paidOff.reduce((s, l) => s + l.amount, 0)
    return {
      totalCount: loans.length,
      activeCount: active.length,
      paidOffCount: paidOff.length,
      defaultedCount: defaulted.length,
      outstanding,
      atRisk,
      totalAmount,
      collected,
      healthPct: loans.length > 0 ? Math.round((paidOff.length + active.length) / loans.length * 100) : 0,
    }
  }, [loans])

  if (!mounted) return null

  if (view === 'LOADING') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-text-muted animate-spin" />
          <p className="text-text-muted text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (view === 'UNAUTHORIZED') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Landmark className="w-12 h-12 text-text-muted/40 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">Lender Access Only</h2>
          <p className="text-sm text-text-muted">Please log in as a lender to view your portfolio.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto animate-fadeIn">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-text-primary flex items-center gap-2">
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

      {/* KPI row */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Disbursed', value: formatKES(stats.totalAmount), icon: DollarSign, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Outstanding', value: formatKES(stats.outstanding), icon: TrendingDown, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'At Risk', value: formatKES(stats.atRisk), icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10' },
          { label: 'Collected', value: formatKES(stats.collected), icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Active Loans', value: stats.activeCount, icon: BadgeCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Portfolio Health', value: `${stats.healthPct}%`, icon: TrendingUp, color: 'text-gold-harvest', bg: 'bg-gold-harvest/10' },
        ].map(s => (
          <div key={s.label} className={cn('rounded-xl p-3 border border-border-subtle', s.bg)}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <s.icon className={cn('w-3.5 h-3.5', s.color)} />
              <span className="text-[10px] text-text-muted uppercase tracking-wide">{s.label}</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-text-primary font-mono tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Portfolio health bar */}
      <div className="px-4 sm:px-6 lg:px-8 pb-4">
        <div className="bg-dark-mid border border-border-subtle rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-text-muted uppercase tracking-wide">Portfolio Breakdown</span>
            <span className="text-[11px] text-text-muted">{stats.totalCount} loans total</span>
          </div>
          <div className="h-3 rounded-full bg-dark-base overflow-hidden flex">
            {stats.activeCount > 0 && (
              <div
                className="bg-green-400 h-full transition-all"
                style={{ width: `${(stats.activeCount / Math.max(stats.totalCount, 1)) * 100}%` }}
                title={`Active: ${stats.activeCount}`}
              />
            )}
            {stats.paidOffCount > 0 && (
              <div
                className="bg-blue-400 h-full transition-all"
                style={{ width: `${(stats.paidOffCount / Math.max(stats.totalCount, 1)) * 100}%` }}
                title={`Paid off: ${stats.paidOffCount}`}
              />
            )}
            {stats.defaultedCount > 0 && (
              <div
                className="bg-red-400 h-full transition-all"
                style={{ width: `${(stats.defaultedCount / Math.max(stats.totalCount, 1)) * 100}%` }}
                title={`Defaulted: ${stats.defaultedCount}`}
              />
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" /> Active ({stats.activeCount})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Paid off ({stats.paidOffCount})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Defaulted ({stats.defaultedCount})</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 lg:px-8 pb-3 flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
        <div className="flex items-center gap-2 w-full sm:w-64 bg-dark-mid border border-border-subtle rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search farmer, county or crop..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-text-primary w-full placeholder:text-text-muted/50"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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

      {/* Compact table */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-dark-mid border border-border-subtle rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
              <p className="text-text-muted text-sm">No loans match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left px-4 py-3 text-text-muted font-medium uppercase tracking-wider">Farmer</th>
                    <th className="text-left px-4 py-3 text-text-muted font-medium uppercase tracking-wider hidden sm:table-cell">County</th>
                    <th className="text-left px-4 py-3 text-text-muted font-medium uppercase tracking-wider hidden md:table-cell">Crop</th>
                    <th className="text-right px-4 py-3 text-text-muted font-medium uppercase tracking-wider">Amount</th>
                    <th className="text-right px-4 py-3 text-text-muted font-medium uppercase tracking-wider hidden sm:table-cell">Outstanding</th>
                    <th className="text-right px-4 py-3 text-text-muted font-medium uppercase tracking-wider hidden lg:table-cell">Next Payment</th>
                    <th className="text-right px-4 py-3 text-text-muted font-medium uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((loan, i) => {
                    const status = statusConfig[loan.status]
                    return (
                      <tr
                        key={loan.id}
                        className={cn(
                          'border-b border-border-subtle/50 hover:bg-dark-base/50 transition-colors cursor-pointer',
                          i === filtered.length - 1 && 'border-b-0'
                        )}
                        onClick={() => router.push(`/lender/farmer/${loan.farmerId}`)}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-text-primary">{loan.farmerName}</p>
                          <p className="text-[10px] text-text-muted sm:hidden">{loan.county} · {loan.crop}</p>
                        </td>
                        <td className="px-4 py-3 text-text-muted hidden sm:table-cell">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" />{loan.county}</span>
                        </td>
                        <td className="px-4 py-3 text-text-muted hidden md:table-cell">
                          <span className="flex items-center gap-1"><Sprout className="w-3 h-3 shrink-0" />{loan.crop}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-text-primary">{formatKES(loan.amount)}</td>
                        <td className="px-4 py-3 text-right font-mono hidden sm:table-cell">
                          {loan.status === 'PAID_OFF' ? (
                            <span className="text-blue-400">—</span>
                          ) : (
                            <span className="text-text-primary">{formatKES(loan.remainingBalance)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right hidden lg:table-cell">
                          {loan.nextPaymentDue === '-' ? (
                            <span className="text-text-muted">—</span>
                          ) : (
                            <span className="flex items-center justify-end gap-1 text-text-muted">
                              <Calendar className="w-3 h-3" />
                              {formatDate(loan.nextPaymentDue)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium', status.bg, status.color)}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer summary */}
        {filtered.length > 0 && (
          <div className="mt-3 flex items-center justify-between text-[11px] text-text-muted px-1">
            <span>Showing {filtered.length} of {loans.length} loans</span>
            <span className="font-mono">
              Outstanding: {formatKES(filtered.reduce((s, l) => s + l.remainingBalance, 0))}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, ClipboardCheck, ShieldAlert, CalendarDays, ArrowUpRight, Search, Phone, MapPin, Sprout } from 'lucide-react'
import { getToken } from '@/lib/auth'

interface ApiFarmer {
  id: string
  name: string
  phone: string
  county: string
  crops: string[]
  acreage: number
  loanAmount: number
  status: string
  creditScore: number
  language: string
  hasChama: boolean
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pending',  color: 'text-risk-medium', bg: 'bg-risk-medium/10' },
  verified: { label: 'Verified', color: 'text-risk-low',   bg: 'bg-risk-low/10'    },
  flagged:  { label: 'Flagged',  color: 'text-risk-high',  bg: 'bg-risk-high/10'    },
}

export default function AgentDashboardPage() {
  const [farmers, setFarmers] = useState<ApiFarmer[]>([])
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFarmers()
  }, [])

  async function loadFarmers() {
    const token = getToken()
    if (!token) return
    try {
      const res = await fetch('/api/agent/farmers', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setFarmers(data.farmers)
        setStats(data.stats)
      }
    } catch {}
    setLoading(false)
  }

  const filtered = farmers
    .filter(f => {
      if (statusFilter !== 'all' && f.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return f.name.toLowerCase().includes(q) || f.id.toLowerCase().includes(q) || f.county.toLowerCase().includes(q)
      }
      return true
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-green-primary border-t-transparent rounded-full" /></div>
  }

  const statCards = [
    { label: 'Total Assigned', value: stats.total, icon: Users, color: 'text-green-primary', bg: 'bg-green-primary/10' },
    { label: 'Pending', value: stats.pending, icon: ClipboardCheck, color: 'text-risk-medium', bg: 'bg-risk-medium/10' },
    { label: 'Verified', value: stats.verified, icon: ShieldAlert, color: 'text-risk-low', bg: 'bg-risk-low/10' },
    { label: 'Flagged', value: '—', icon: CalendarDays, color: 'text-sky-blue', bg: 'bg-sky-blue/10' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Agent Dashboard</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-text-primary">My Assigned Farmers</h1>
        <p className="text-sm text-text-muted mt-1">Verify, flag, and schedule field visits for farmers in your area</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statCards.map((s, i) => (
          <div key={i} className="bg-dark-mid border border-border-subtle rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <span className={`text-lg font-bold font-serif ${s.color}`}>{s.value}</span>
            </div>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID, or county..."
            className="w-full bg-dark-mid border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green-primary/50" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-dark-mid border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-green-primary/50">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map(farmer => {
          const status = STATUS_CONFIG[farmer.status] || STATUS_CONFIG.pending
          const cropLabel = farmer.crops?.[0] || 'N/A'
          return (
            <Link key={farmer.id} href={`/agent/verify/${farmer.id}`}
              className="block bg-dark-mid border border-border-subtle rounded-xl p-4 hover:border-green-primary/30 transition-colors group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-serif font-semibold text-text-primary text-sm truncate">{farmer.name}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${status.color} ${status.bg}`}>{status.label}</span>
                    {farmer.hasChama && <span className="text-[10px] px-1.5 py-0.5 rounded font-medium text-gold-harvest bg-gold-harvest/10">Chama</span>}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {farmer.county}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {farmer.phone}</span>
                    <span className="flex items-center gap-1"><Sprout className="w-3 h-3" /> {cropLabel} — {farmer.acreage} ac</span>
                    <span>KSh {farmer.loanAmount.toLocaleString()}</span>
                    <span>Score: {farmer.creditScore}</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-green-primary transition-colors flex-shrink-0 mt-0.5" />
              </div>
            </Link>
          )
        })}
        {filtered.length === 0 && <div className="text-center py-12 text-text-muted text-sm">No farmers match your filters.</div>}
      </div>
    </div>
  )
}

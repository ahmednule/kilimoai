'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, ClipboardCheck, ShieldAlert, CalendarDays, ArrowUpRight, Search, Filter, Phone, MapPin, Sprout, ChevronDown } from 'lucide-react'

type FarmerStatus = 'pending' | 'verified' | 'flagged' | 'scheduled'

interface AssignedFarmer {
  id: string
  name: string
  phone: string
  county: string
  crop: string
  acres: number
  loanAmount: number
  status: FarmerStatus
  lastUpdated: string
  riskLevel: 'low' | 'medium' | 'high'
}

const MOCK_FARMERS: AssignedFarmer[] = [
  { id: 'F-001', name: 'Grace Wanjiku', phone: '+254 712 345 678', county: 'Nakuru', crop: 'Maize', acres: 3.5, loanAmount: 45000, status: 'pending', lastUpdated: '2026-06-20', riskLevel: 'medium' },
  { id: 'F-002', name: 'Peter Kamau', phone: '+254 723 456 789', county: 'Uasin Gishu', crop: 'Wheat', acres: 5, loanAmount: 85000, status: 'verified', lastUpdated: '2026-06-19', riskLevel: 'low' },
  { id: 'F-003', name: 'Jane Akinyi', phone: '+254 734 567 890', county: 'Kisumu', crop: 'Rice', acres: 2, loanAmount: 35000, status: 'flagged', lastUpdated: '2026-06-18', riskLevel: 'high' },
  { id: 'F-004', name: 'David Mwangi', phone: '+254 745 678 901', county: 'Kiambu', crop: 'Coffee', acres: 1.5, loanAmount: 60000, status: 'scheduled', lastUpdated: '2026-06-21', riskLevel: 'medium' },
  { id: 'F-005', name: 'Sarah Chebet', phone: '+254 756 789 012', county: 'Nandi', crop: 'Tea', acres: 2.5, loanAmount: 55000, status: 'pending', lastUpdated: '2026-06-20', riskLevel: 'low' },
  { id: 'F-006', name: 'James Ochieng', phone: '+254 767 890 123', county: 'Siaya', crop: 'Maize', acres: 4, loanAmount: 70000, status: 'pending', lastUpdated: '2026-06-17', riskLevel: 'high' },
  { id: 'F-007', name: 'Mary Nduta', phone: '+254 778 901 234', county: 'Meru', crop: 'Tomato', acres: 1, loanAmount: 25000, status: 'verified', lastUpdated: '2026-06-15', riskLevel: 'low' },
  { id: 'F-008', name: 'Samuel Kiprop', phone: '+254 789 012 345', county: 'Bomet', crop: 'Maize', acres: 6, loanAmount: 95000, status: 'scheduled', lastUpdated: '2026-06-21', riskLevel: 'medium' },
]

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'text-risk-medium', bg: 'bg-risk-medium/10', icon: ClipboardCheck },
  verified:   { label: 'Verified',   color: 'text-risk-low',   bg: 'bg-risk-low/10',    icon: ShieldAlert },
  flagged:    { label: 'Flagged',    color: 'text-risk-high',  bg: 'bg-risk-high/10',    icon: ShieldAlert },
  scheduled:  { label: 'Scheduled',  color: 'text-sky-blue',   bg: 'bg-sky-blue/10',     icon: CalendarDays },
}

const STATS = [
  { label: 'Total Assigned', value: '24', icon: Users, color: 'text-green-primary', bg: 'bg-green-primary/10' },
  { label: 'Pending', value: '8', icon: ClipboardCheck, color: 'text-risk-medium', bg: 'bg-risk-medium/10' },
  { label: 'Flagged', value: '3', icon: ShieldAlert, color: 'text-risk-high', bg: 'bg-risk-high/10' },
  { label: 'Scheduled', value: '5', icon: CalendarDays, color: 'text-sky-blue', bg: 'bg-sky-blue/10' },
]

export default function AgentDashboardPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FarmerStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'county' | 'loanAmount'>('name')

  const filtered = MOCK_FARMERS
    .filter(f => {
      if (statusFilter !== 'all' && f.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return f.name.toLowerCase().includes(q) || f.id.toLowerCase().includes(q) || f.county.toLowerCase().includes(q)
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'county') return a.county.localeCompare(b.county)
      return b.loanAmount - a.loanAmount
    })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Agent Dashboard</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-text-primary">My Assigned Farmers</h1>
        <p className="text-sm text-text-muted mt-1">Verify, flag, and schedule field visits for farmers in your area</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {STATS.map((s, i) => (
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID, or county..."
            className="w-full bg-dark-mid border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green-primary/50"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as FarmerStatus | 'all')}
            className="bg-dark-mid border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-green-primary/50"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="flagged">Flagged</option>
            <option value="scheduled">Scheduled</option>
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'name' | 'county' | 'loanAmount')}
            className="bg-dark-mid border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-green-primary/50"
          >
            <option value="name">Sort: Name</option>
            <option value="county">Sort: County</option>
            <option value="loanAmount">Sort: Loan</option>
          </select>
        </div>
      </div>

      {/* Farmer list */}
      <div className="space-y-2">
        {filtered.map(farmer => {
          const status = STATUS_CONFIG[farmer.status]
          return (
            <Link
              key={farmer.id}
              href={`/agent/verify/${farmer.id}`}
              className="block bg-dark-mid border border-border-subtle rounded-xl p-4 hover:border-green-primary/30 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-serif font-semibold text-text-primary text-sm truncate">{farmer.name}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${status.color} ${status.bg}`}>
                      {status.label}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      farmer.riskLevel === 'low' ? 'text-risk-low bg-risk-low/10' :
                      farmer.riskLevel === 'medium' ? 'text-risk-medium bg-risk-medium/10' :
                      'text-risk-high bg-risk-high/10'
                    }`}>
                      {farmer.riskLevel}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {farmer.county}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {farmer.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sprout className="w-3 h-3" /> {farmer.crop} — {farmer.acres} ac
                    </span>
                    <span>KSh {farmer.loanAmount.toLocaleString()}</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-green-primary transition-colors flex-shrink-0 mt-0.5" />
              </div>
            </Link>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-text-muted text-sm">No farmers match your filters.</div>
        )}
      </div>
    </div>
  )
}

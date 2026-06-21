'use client'

import { BarChart3, TrendingUp, Users, DollarSign, Sprout, ShoppingCart, Shield, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const METRICS = [
  { label: 'Active Users', value: '1,284', change: '+12.3%', up: true, icon: Users },
  { label: 'Total Loans', value: 'KES 47.2M', change: '+8.7%', up: true, icon: DollarSign },
  { label: 'Avg Risk Score', value: '64.2', change: '-2.1%', up: false, icon: TrendingUp },
  { label: 'Crop Listings', value: '3,840', change: '+23.5%', up: true, icon: Sprout },
  { label: 'Loan Products', value: '17', change: '+2', up: true, icon: ShoppingCart },
  { label: 'Active Agents', value: '128', change: '+5.8%', up: true, icon: Shield },
]

const MONTHLY = [
  { month: 'Jan', users: 820, loans: 28, revenue: 1.2 },
  { month: 'Feb', users: 890, loans: 32, revenue: 1.4 },
  { month: 'Mar', users: 960, loans: 35, revenue: 1.6 },
  { month: 'Apr', users: 1050, loans: 38, revenue: 1.8 },
  { month: 'May', users: 1140, loans: 42, revenue: 2.1 },
  { month: 'Jun', users: 1284, loans: 47, revenue: 2.4 },
]

const TOP_COUNTIES = [
  { county: 'Nakuru', farmers: 142, loans: 48, color: 'bg-green-400' },
  { county: 'Kiambu', farmers: 128, loans: 42, color: 'bg-blue-400' },
  { county: 'Uasin Gishu', farmers: 115, loans: 38, color: 'bg-purple-400' },
  { county: 'Meru', farmers: 98, loans: 35, color: 'bg-orange-400' },
  { county: 'Kisumu', farmers: 87, loans: 29, color: 'bg-yellow-400' },
]

const maxFarmers = Math.max(...TOP_COUNTIES.map(c => c.farmers))
const maxRevenue = Math.max(...MONTHLY.map(m => m.revenue))

export default function AdminAnalyticsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
        <BarChart3 className="w-3.5 h-3.5" />
        <span>Admin / Analytics</span>
      </div>
      <h1 className="text-xl sm:text-2xl font-serif font-bold text-text-primary mb-1">Analytics</h1>
      <p className="text-sm text-text-muted mb-6">Platform metrics and growth trends</p>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {METRICS.map((m, i) => (
          <div key={i} className="bg-dark-mid border border-border-subtle rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted">{m.label}</span>
              <m.icon className="w-4 h-4 text-text-muted" />
            </div>
            <p className="text-lg font-bold text-text-primary">{m.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {m.up ? <ArrowUpRight className="w-3 h-3 text-risk-low" /> : <ArrowDownRight className="w-3 h-3 text-risk-high" />}
              <span className={`text-xs font-medium ${m.up ? 'text-risk-low' : 'text-risk-high'}`}>{m.change}</span>
              <span className="text-xs text-text-muted/60">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Growth chart (bars) */}
        <div className="bg-dark-mid border border-border-subtle rounded-xl p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Monthly Growth (KES Revenue)</h2>
          <div className="flex items-end gap-2 h-40">
            {MONTHLY.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-text-muted">KES {m.revenue}M</span>
                <div
                  className="w-full bg-green-primary/60 rounded-t-md hover:bg-green-primary transition-colors"
                  style={{ height: `${(m.revenue / maxRevenue) * 120}px` }}
                />
                <span className="text-[10px] text-text-muted">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top counties */}
        <div className="bg-dark-mid border border-border-subtle rounded-xl p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Top Counties by Farmers</h2>
          <div className="space-y-3">
            {TOP_COUNTIES.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-text-muted w-24">{c.county}</span>
                <div className="flex-1 h-4 bg-dark-base rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${c.color}`} style={{ width: `${(c.farmers / maxFarmers) * 100}%` }} />
                </div>
                <span className="text-xs text-text-primary font-medium w-16 text-right">{c.farmers}</span>
                <span className="text-xs text-text-muted w-12 text-right">{c.loans} loans</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

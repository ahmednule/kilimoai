'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, Shield, TrendingUp, DollarSign, Sprout, Store,
  ShoppingCart, Activity, BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
  AlertTriangle, CheckCircle2, Clock, UserX,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSession, UserRole } from '@/lib/auth'
import { Language } from '@/lib/types'
import { getLanguage } from '@/lib/i18n'

type View = 'LOADING' | 'UNAUTHORIZED' | 'DASHBOARD'

const ADMIN_STATS = [
  { label: 'Total Users', value: '1,284', change: '+12%', up: true, icon: Users },
  { label: 'Active Loans', value: '347', change: '+8%', up: true, icon: DollarSign },
  { label: 'Transactions', value: '5,620', change: '+23%', up: true, icon: Activity },
  { label: 'Revenue', value: 'KES 2.4M', change: '+18%', up: true, icon: TrendingUp },
]

const RECENT_ACTIVITY = [
  { id: 1, action: 'New farmer registered', user: 'John Kamau', role: 'farmer', time: '2 min ago', icon: Sprout },
  { id: 2, action: 'Loan approved', user: 'Equity Bank', role: 'lender', time: '15 min ago', icon: DollarSign },
  { id: 3, action: 'Crop purchase completed', user: 'Sarah Wanjiku', role: 'buyer', time: '32 min ago', icon: ShoppingCart },
  { id: 4, action: 'Agent verified farmer', user: 'Agent Muthoni', role: 'agent', time: '1 hour ago', icon: Shield },
  { id: 5, action: 'Chama group created', user: 'Umoja Group', role: 'farmer', time: '2 hours ago', icon: Users },
  { id: 6, action: 'Pest alert resolved', user: 'System', role: 'admin', time: '3 hours ago', icon: AlertTriangle },
]

const roleIcons: Record<string, typeof Sprout> = {
  farmer: Sprout,
  agent: Shield,
  lender: Store,
  buyer: ShoppingCart,
  admin: Shield,
}

const roleColors: Record<string, string> = {
  farmer: 'text-green-400 bg-green-400/10',
  agent: 'text-blue-400 bg-blue-400/10',
  lender: 'text-purple-400 bg-purple-400/10',
  buyer: 'text-orange-400 bg-orange-400/10',
  admin: 'text-red-400 bg-red-400/10',
}

export default function AdminPage() {
  const router = useRouter()
  const [view, setView] = useState<View>('LOADING')
  const [lang, setLang] = useState<Language>('en')

  useEffect(() => {
    const savedLang = getLanguage()
    if (savedLang) setLang(savedLang)

    const sess = getSession()
    if (!sess.isAuthenticated || sess.role !== 'admin') {
      setView('UNAUTHORIZED')
    } else {
      setView('DASHBOARD')
    }
  }, [])

  useEffect(() => {
    if (view === 'UNAUTHORIZED') {
      const t = setTimeout(() => router.push('/auth/login'), 2000)
      return () => clearTimeout(t)
    }
  }, [view, router])

  if (view === 'LOADING') return null

  if (view === 'UNAUTHORIZED') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <Shield className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-text-primary font-semibold text-lg">
            {lang === 'sw' ? 'Ufikiaji Umekataliwa' : 'Access Denied'}
          </p>
          <p className="text-text-muted text-sm">
            {lang === 'sw' ? 'Ni wasimamizi pekee wanaoweza kufikia ukurasa huu.' : 'Only administrators can access this page.'}
          </p>
          <p className="text-text-muted/60 text-xs">
            {lang === 'sw' ? 'Inaelekeza kwenye kuingia...' : 'Redirecting to login...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-text-primary">
              {lang === 'sw' ? 'Jopo la Msimamizi' : 'Admin Panel'}
            </h1>
            <p className="text-sm text-text-muted mt-1">
              {lang === 'sw' ? 'Simamia jukwaa, watumiaji na shughuli zote' : 'Manage platform, users, and all activity'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 px-3 py-1.5 bg-green-400/10 border border-green-400/20 rounded-full text-xs text-green-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {lang === 'sw' ? 'Mtandaoni' : 'System Online'}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          {ADMIN_STATS.map(({ label, value, change, up, icon: Icon }) => (
            <div key={label} className="bg-dark-mid rounded-xl border border-border-subtle p-4 hover:border-green-primary/20 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-muted">{label}</span>
                <Icon className="w-4 h-4 text-green-primary/60" />
              </div>
              <p className="text-2xl font-bold text-text-primary">{value}</p>
              <div className="flex items-center gap-1 mt-1">
                {up ? (
                  <ArrowUpRight className="w-3 h-3 text-green-400" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-400" />
                )}
                <span className={cn('text-xs font-medium', up ? 'text-green-400' : 'text-red-400')}>
                  {change}
                </span>
                <span className="text-xs text-text-muted/60">
                  {lang === 'sw' ? 'mwezi huu' : 'this month'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="col-span-2 bg-dark-mid rounded-xl border border-border-subtle p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-primary">
                {lang === 'sw' ? 'Shughuli za Hivi Karibuni' : 'Recent Activity'}
              </h2>
              <button className="text-xs text-green-primary hover:underline">
                {lang === 'sw' ? 'Tazama Zote' : 'View All'}
              </button>
            </div>
            <div className="space-y-1">
              {RECENT_ACTIVITY.map((item) => {
                const Icon = roleIcons[item.role]
                return (
                  <div key={item.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-dark-base/50 transition-colors">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', roleColors[item.role])}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary">{item.action}</p>
                      <p className="text-xs text-text-muted">{item.user}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full', roleColors[item.role])}>
                        {item.role}
                      </span>
                      <span className="text-[11px] text-text-muted/60 w-20 text-right">{item.time}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-dark-mid rounded-xl border border-border-subtle p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">
              {lang === 'sw' ? 'Vitendo vya Haraka' : 'Quick Actions'}
            </h2>
            <div className="space-y-2">
              {[
                { icon: Users, label: lang === 'sw' ? 'Dhibiti Watumiaji' : 'Manage Users', color: 'text-blue-400 bg-blue-400/10' },
                { icon: DollarSign, label: lang === 'sw' ? 'Dhibiti Mikopo' : 'Manage Loans', color: 'text-purple-400 bg-purple-400/10' },
                { icon: BarChart3, label: lang === 'sw' ? 'Ripoti za Takwimu' : 'Analytics Reports', color: 'text-green-400 bg-green-400/10' },
                { icon: Shield, label: lang === 'sw' ? 'Usalama na Vipimo' : 'Security & Logs', color: 'text-red-400 bg-red-400/10' },
                { icon: PieChart, label: lang === 'sw' ? 'Mipangilio ya Mfumo' : 'System Settings', color: 'text-orange-400 bg-orange-400/10' },
                { icon: UserX, label: lang === 'sw' ? 'Vitendo vya Kikundi' : 'Bulk Actions', color: 'text-yellow-400 bg-yellow-400/10' },
              ].map(({ icon: Icon, label, color }) => (
                <button
                  key={label}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-dark-base transition-colors text-left"
                >
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-text-primary">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-dark-mid rounded-xl border border-border-subtle p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4">
            {lang === 'sw' ? 'Usambazaji wa Majukumu' : 'Role Distribution'}
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {[
              { role: 'farmer' as UserRole, count: 842, pct: 66, color: 'bg-green-400' },
              { role: 'agent' as UserRole, count: 128, pct: 10, color: 'bg-blue-400' },
              { role: 'lender' as UserRole, count: 156, pct: 12, color: 'bg-purple-400' },
              { role: 'buyer' as UserRole, count: 145, pct: 11, color: 'bg-orange-400' },
              { role: 'admin' as UserRole, count: 13, pct: 1, color: 'bg-red-400' },
            ].map(({ role, count, pct, color }) => (
              <div key={role} className="text-center">
                <div className="w-full h-2 bg-dark-base rounded-full mb-3 overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-sm font-medium text-text-primary capitalize">{role}s</p>
                <p className="text-xs text-text-muted mt-0.5">{count.toLocaleString()}</p>
                <span className="text-[10px] text-text-muted/60">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
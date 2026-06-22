'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Package, CheckCircle2, Clock, XCircle, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Language } from '@/lib/types'
import { getSession } from '@/lib/auth'
import { getLanguage } from '@/lib/i18n'

interface Order {
  id: string; farmer: string; crop: string; quantity: number; price: number; total: number; status: string; date: string
}

const MOCK_ORDERS: Order[] = [
  { id: 'ord-1', farmer: 'Samuel Mwangi', crop: 'maize', quantity: 40, price: 4200, total: 168000, status: 'CONFIRMED', date: '2026-06-15' },
  { id: 'ord-2', farmer: 'Grace Akinyi', crop: 'rice', quantity: 25, price: 5800, total: 145000, status: 'PENDING', date: '2026-06-18' },
  { id: 'ord-3', farmer: 'Jane Wanjiku', crop: 'tea', quantity: 100, price: 350, total: 35000, status: 'DELIVERED', date: '2026-06-10' },
  { id: 'ord-4', farmer: 'David Ochieng', crop: 'maize', quantity: 50, price: 3900, total: 195000, status: 'CANCELLED', date: '2026-06-05' },
  { id: 'ord-5', farmer: 'Mary Wambui', crop: 'beans', quantity: 20, price: 6800, total: 136000, status: 'DELIVERED', date: '2026-06-01' },
]

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  PENDING:   { label: 'Pending', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  CONFIRMED: { label: 'Confirmed', icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
}

export default function BuyerOrdersPage() {
  const router = useRouter()
  const [view, setView] = useState<'LOADING' | 'UNAUTHORIZED' | 'READY'>('LOADING')
  const [lang, setLang] = useState<Language>('en')

  useEffect(() => {
    const savedLang = getLanguage()
    if (savedLang) setLang(savedLang)
    const sess = getSession()
    if (!sess.isAuthenticated || sess.role !== 'buyer') {
      setView('UNAUTHORIZED')
    } else {
      setView('READY')
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
          <ShoppingCart className="w-12 h-12 text-orange-400 mx-auto" />
          <p className="text-text-primary font-semibold text-lg">Access Denied</p>
          <p className="text-text-muted text-sm">Only buyers can access this page.</p>
          <p className="text-text-muted/60 text-xs">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  const totalSpent = MOCK_ORDERS.reduce((sum, o) => sum + o.total, 0)
  const activeCount = MOCK_ORDERS.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED').length

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
        <Package className="w-3.5 h-3.5" />
        <span>{lang === 'sw' ? 'Maagizo Yangu' : 'My Orders'}</span>
      </div>
      <h1 className="text-xl sm:text-2xl font-serif font-bold text-text-primary mb-1">
        {lang === 'sw' ? 'Maagizo Yangu' : 'My Orders'}
      </h1>
      <p className="text-sm text-text-muted mb-6">
        {lang === 'sw' ? 'Fuatilia maagizo yako ya mazao' : 'Track your produce orders'}
      </p>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-dark-mid rounded-xl border border-border-subtle p-4">
          <span className="text-xs text-text-muted">{lang === 'sw' ? 'Jumla ya Maagizo' : 'Total Orders'}</span>
          <p className="text-2xl font-bold text-text-primary mt-2">{MOCK_ORDERS.length}</p>
        </div>
        <div className="bg-dark-mid rounded-xl border border-border-subtle p-4">
          <span className="text-xs text-text-muted">{lang === 'sw' ? 'Yanayoendelea' : 'Active Orders'}</span>
          <p className="text-2xl font-bold text-text-primary mt-2">{activeCount}</p>
        </div>
        <div className="bg-dark-mid rounded-xl border border-border-subtle p-4">
          <span className="text-xs text-text-muted">{lang === 'sw' ? 'Yamewasilishwa' : 'Delivered'}</span>
          <p className="text-2xl font-bold text-green-400 mt-2">{MOCK_ORDERS.filter(o => o.status === 'DELIVERED').length}</p>
        </div>
        <div className="bg-dark-mid rounded-xl border border-border-subtle p-4">
          <span className="text-xs text-text-muted">{lang === 'sw' ? 'Matumizi Yote' : 'Total Spent'}</span>
          <p className="text-2xl font-bold text-orange-400 mt-2">KES {totalSpent.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-dark-mid rounded-xl border border-border-subtle overflow-hidden">
        <div className="divide-y divide-border-subtle">
          {MOCK_ORDERS.map(order => {
            const status = STATUS_CONFIG[order.status]
            const StatusIcon = status.icon
            return (
              <div key={order.id} className="p-4 flex items-center gap-4 hover:bg-dark-base/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-dark-base flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary capitalize">{order.crop}</p>
                  <p className="text-xs text-text-muted">{order.farmer} &middot; {order.quantity} bags &middot; KES {order.price.toLocaleString()}/bag</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-text-primary">KES {order.total.toLocaleString()}</p>
                  <p className="text-[11px] text-text-muted/60">{order.date}</p>
                </div>
                <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium', status.color, status.bg)}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">{status.label}</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-muted hover:text-orange-400 transition-colors flex-shrink-0" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

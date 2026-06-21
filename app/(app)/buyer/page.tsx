'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShoppingCart, Sprout, MapPin, TrendingUp, DollarSign,
  Search, Filter, Eye, Package, Calendar, ArrowUpRight,
  CheckCircle2, Clock, XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Language } from '@/lib/types'
import { getSession } from '@/lib/auth'
import { getLanguage } from '@/lib/i18n'
import { KENYAN_COUNTIES, CROPS } from '@/lib/constants'

type View = 'LOADING' | 'UNAUTHORIZED' | 'DASHBOARD'

const MOCK_LISTINGS = [
  { id: 1, farmer: 'Samuel Mwangi', crop: 'maize', quantity: 120, unit: 'bags', price: 4200, county: 'Nyeri', quality: 'Grade 1', available: 'Jul 2026' },
  { id: 2, farmer: 'Grace Akinyi', crop: 'rice', quantity: 85, unit: 'bags', price: 5800, county: 'Kisumu', quality: 'Grade 2', available: 'Aug 2026' },
  { id: 3, farmer: 'Peter Kamau', crop: 'coffee', quantity: 40, unit: 'bags', price: 15000, county: 'Nakuru', quality: 'Premium', available: 'Sep 2026' },
  { id: 4, farmer: 'Jane Wanjiku', crop: 'tea', quantity: 200, unit: 'kgs', price: 350, county: 'Kiambu', quality: 'Grade 1', available: 'Jul 2026' },
  { id: 5, farmer: 'David Ochieng', crop: 'maize', quantity: 300, unit: 'bags', price: 3900, county: 'Migori', quality: 'Grade 2', available: 'Aug 2026' },
  { id: 6, farmer: 'Mary Wambui', crop: 'beans', quantity: 60, unit: 'bags', price: 6800, county: 'Nyeri', quality: 'Grade 1', available: 'Jul 2026' },
  { id: 7, farmer: 'Joseph Kiprotich', crop: 'wheat', quantity: 150, unit: 'bags', price: 4500, county: 'Uasin Gishu', quality: 'Grade 1', available: 'Sep 2026' },
  { id: 8, farmer: 'Amina Hassan', crop: 'tomatoes', quantity: 500, unit: 'crates', price: 2800, county: 'Mombasa', quality: 'Grade 1', available: 'Jul 2026' },
]

const MOCK_MY_ORDERS = [
  { id: 'ord-1', farmer: 'Samuel Mwangi', crop: 'maize', quantity: 40, price: 4200, total: 168000, status: 'CONFIRMED', date: '2026-06-15' },
  { id: 'ord-2', farmer: 'Grace Akinyi', crop: 'rice', quantity: 25, price: 5800, total: 145000, status: 'PENDING', date: '2026-06-18' },
  { id: 'ord-3', farmer: 'Jane Wanjiku', crop: 'tea', quantity: 100, price: 350, total: 35000, status: 'DELIVERED', date: '2026-06-10' },
]

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  PENDING:   { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  CONFIRMED: { icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  DELIVERED: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
  CANCELLED: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
}

export default function BuyerPage() {
  const router = useRouter()
  const [view, setView] = useState<View>('LOADING')
  const [lang, setLang] = useState<Language>('en')
  const [tab, setTab] = useState<'marketplace' | 'orders'>('marketplace')
  const [search, setSearch] = useState('')
  const [countyFilter, setCountyFilter] = useState('')
  const [cropFilter, setCropFilter] = useState('')

  useEffect(() => {
    const savedLang = getLanguage()
    if (savedLang) setLang(savedLang)

    const sess = getSession()
    if (!sess.isAuthenticated || sess.role !== 'buyer') {
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
          <ShoppingCart className="w-12 h-12 text-orange-400 mx-auto" />
          <p className="text-text-primary font-semibold text-lg">
            {lang === 'sw' ? 'Ufikiaji Umekataliwa' : 'Access Denied'}
          </p>
          <p className="text-text-muted text-sm">
            {lang === 'sw' ? 'Ni wanunuzi pekee wanaoweza kufikia ukurasa huu.' : 'Only buyers can access this page.'}
          </p>
          <p className="text-text-muted/60 text-xs">
            {lang === 'sw' ? 'Inaelekeza kwenye kuingia...' : 'Redirecting to login...'}
          </p>
        </div>
      </div>
    )
  }

  const filteredListings = MOCK_LISTINGS.filter(l => {
    if (search && !l.farmer.toLowerCase().includes(search.toLowerCase()) && !l.crop.toLowerCase().includes(search.toLowerCase())) return false
    if (countyFilter && l.county !== countyFilter) return false
    if (cropFilter && l.crop !== cropFilter) return false
    return true
  })

  const totalSpent = MOCK_MY_ORDERS.reduce((sum, o) => sum + o.total, 0)
  const activeOrders = MOCK_MY_ORDERS.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED').length

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-text-primary">
              {lang === 'sw' ? 'Jopo la Mnunuzi' : 'Buyer Dashboard'}
            </h1>
            <p className="text-sm text-text-muted mt-1">
              {lang === 'sw' ? 'Soko la mazao ya moja kwa moja kutoka kwa wakulima' : 'Direct-from-farmer produce marketplace'}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-dark-mid rounded-lg border border-border-subtle p-1">
            {(['marketplace', 'orders'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-4 py-1.5 rounded-md text-xs font-medium transition-all',
                  tab === t
                    ? 'bg-orange-400/10 text-orange-400 border border-orange-400/20'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                {t === 'marketplace'
                  ? lang === 'sw' ? 'Soko' : 'Marketplace'
                  : lang === 'sw' ? 'Maagizo' : 'Orders'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-dark-mid rounded-xl border border-border-subtle p-4">
            <span className="text-xs text-text-muted">{lang === 'sw' ? 'Orodha Zinazopatikana' : 'Available Listings'}</span>
            <p className="text-2xl font-bold text-text-primary mt-2">{MOCK_LISTINGS.length}</p>
          </div>
          <div className="bg-dark-mid rounded-xl border border-border-subtle p-4">
            <span className="text-xs text-text-muted">{lang === 'sw' ? 'Maagizo Yanayoendelea' : 'Active Orders'}</span>
            <p className="text-2xl font-bold text-text-primary mt-2">{activeOrders}</p>
          </div>
          <div className="bg-dark-mid rounded-xl border border-border-subtle p-4">
            <span className="text-xs text-text-muted">{lang === 'sw' ? 'Matumizi Yote' : 'Total Spent'}</span>
            <p className="text-2xl font-bold text-green-400 mt-2">KES {totalSpent.toLocaleString()}</p>
          </div>
          <div className="bg-dark-mid rounded-xl border border-border-subtle p-4">
            <span className="text-xs text-text-muted">{lang === 'sw' ? 'Kaunti Zinazohudumiwa' : 'Counties Served'}</span>
            <p className="text-2xl font-bold text-text-primary mt-2">5</p>
          </div>
        </div>

        {/* Tab Content */}
        {tab === 'marketplace' ? (
          <>
            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={lang === 'sw' ? 'Tafuta kwa jina au zao...' : 'Search by name or crop...'}
                  className="w-full pl-10 pr-4 py-2 bg-dark-mid border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-orange-400/30"
                />
              </div>
              <select
                value={countyFilter}
                onChange={e => setCountyFilter(e.target.value)}
                className="px-3 py-2 bg-dark-mid border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:border-orange-400/30"
              >
                <option value="">{lang === 'sw' ? 'Kaunti zote' : 'All counties'}</option>
                {KENYAN_COUNTIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={cropFilter}
                onChange={e => setCropFilter(e.target.value)}
                className="px-3 py-2 bg-dark-mid border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:border-orange-400/30"
              >
                <option value="">{lang === 'sw' ? 'Mazao yote' : 'All crops'}</option>
                {CROPS.map(c => (
                  <option key={c.value} value={c.value}>{c.label[lang] || c.value}</option>
                ))}
              </select>
            </div>

            {/* Listings Grid */}
            {filteredListings.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted text-sm">
                  {lang === 'sw' ? 'Hakuna orodha zilizopatikana' : 'No listings found'}
                </p>
                <p className="text-text-muted/60 text-xs mt-1">
                  {lang === 'sw' ? 'Jaribu kurekebisha vichujio vyako' : 'Try adjusting your filters'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredListings.map(item => (
                  <div key={item.id} className="bg-dark-mid rounded-xl border border-border-subtle p-5 hover:border-orange-400/20 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-orange-400/10 flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary capitalize">{item.crop}</p>
                          <span className="text-[11px] text-orange-400 font-medium">{item.quality}</span>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-orange-400">KES {item.price.toLocaleString()}</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <MapPin className="w-3 h-3" /> {item.county}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Package className="w-3 h-3" /> {item.quantity} {item.unit}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Calendar className="w-3 h-3" /> {lang === 'sw' ? 'Inapatikana' : 'Available'}: {item.available}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                      <span className="text-xs text-text-muted">{item.farmer}</span>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-400 text-dark-base text-xs font-medium rounded-lg hover:bg-orange-500 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                        {lang === 'sw' ? 'Tazama' : 'View'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* My Orders */}
            <div className="bg-dark-mid rounded-xl border border-border-subtle overflow-hidden">
              <div className="p-4 border-b border-border-subtle">
                <h2 className="text-sm font-semibold text-text-primary">
                  {lang === 'sw' ? 'Maagizo Yangu' : 'My Orders'}
                </h2>
              </div>
              {MOCK_MY_ORDERS.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-10 h-10 text-text-muted mx-auto mb-3" />
                  <p className="text-text-muted text-sm">
                    {lang === 'sw' ? 'Hakuna maagizo bado' : 'No orders yet'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border-subtle">
                  {MOCK_MY_ORDERS.map(order => {
                    const statusConfig = STATUS_CONFIG[order.status]
                    const StatusIcon = statusConfig.icon
                    return (
                      <div key={order.id} className="p-4 flex items-center gap-4 hover:bg-dark-base/30 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-dark-base flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4 text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary capitalize">{order.crop}</p>
                          <p className="text-xs text-text-muted">{order.farmer} · {order.quantity} {lang === 'sw' ? 'magunia' : 'bags'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-text-primary">KES {order.total.toLocaleString()}</p>
                          <p className="text-[11px] text-text-muted/60">{order.date}</p>
                        </div>
                        <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium', statusConfig.color, statusConfig.bg)}>
                          <StatusIcon className="w-3 h-3" />
                          {order.status}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
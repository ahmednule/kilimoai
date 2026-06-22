'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, MapPin, Search, Eye, Package, Calendar, Store } from 'lucide-react'
import { Language } from '@/lib/types'
import { getSession } from '@/lib/auth'
import { getLanguage } from '@/lib/i18n'
import { KENYAN_COUNTIES, CROPS } from '@/lib/constants'

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

export default function BuyerMarketplacePage() {
  const router = useRouter()
  const [view, setView] = useState<'LOADING' | 'UNAUTHORIZED' | 'READY'>('LOADING')
  const [lang, setLang] = useState<Language>('en')
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

  const filtered = MOCK_LISTINGS.filter(l => {
    if (search && !l.farmer.toLowerCase().includes(search.toLowerCase()) && !l.crop.toLowerCase().includes(search.toLowerCase())) return false
    if (countyFilter && l.county !== countyFilter) return false
    if (cropFilter && l.crop !== cropFilter) return false
    return true
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
        <Store className="w-3.5 h-3.5" />
        <span>Marketplace</span>
      </div>
      <h1 className="text-xl sm:text-2xl font-serif font-bold text-text-primary mb-1">
        {lang === 'sw' ? 'Soko la Mazao' : 'Produce Marketplace'}
      </h1>
      <p className="text-sm text-text-muted mb-6">
        {lang === 'sw' ? 'Mazao ya moja kwa moja kutoka kwa wakulima' : 'Direct-from-farmer produce'}
      </p>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-dark-mid rounded-xl border border-border-subtle p-4">
          <span className="text-xs text-text-muted">{lang === 'sw' ? 'Orodha Zote' : 'Total Listings'}</span>
          <p className="text-2xl font-bold text-text-primary mt-2">{MOCK_LISTINGS.length}</p>
        </div>
        <div className="bg-dark-mid rounded-xl border border-border-subtle p-4">
          <span className="text-xs text-text-muted">{lang === 'sw' ? 'Wakulima' : 'Farmers'}</span>
          <p className="text-2xl font-bold text-text-primary mt-2">{new Set(MOCK_LISTINGS.map(l => l.farmer)).size}</p>
        </div>
        <div className="bg-dark-mid rounded-xl border border-border-subtle p-4">
          <span className="text-xs text-text-muted">{lang === 'sw' ? 'Kaunti' : 'Counties'}</span>
          <p className="text-2xl font-bold text-text-primary mt-2">{new Set(MOCK_LISTINGS.map(l => l.county)).size}</p>
        </div>
        <div className="bg-dark-mid rounded-xl border border-border-subtle p-4">
          <span className="text-xs text-text-muted">{lang === 'sw' ? 'Mazao' : 'Crops'}</span>
          <p className="text-2xl font-bold text-text-primary mt-2">{new Set(MOCK_LISTINGS.map(l => l.crop)).size}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'sw' ? 'Tafuta kwa jina au zao...' : 'Search by name or crop...'}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-mid border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-orange-400/30"
          />
        </div>
        <select value={countyFilter} onChange={e => setCountyFilter(e.target.value)}
          className="px-3 py-2.5 bg-dark-mid border border-border-subtle rounded-xl text-sm text-text-primary focus:outline-none focus:border-orange-400/30"
        >
          <option value="">{lang === 'sw' ? 'Kaunti zote' : 'All counties'}</option>
          {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={cropFilter} onChange={e => setCropFilter(e.target.value)}
          className="px-3 py-2.5 bg-dark-mid border border-border-subtle rounded-xl text-sm text-text-primary focus:outline-none focus:border-orange-400/30"
        >
          <option value="">{lang === 'sw' ? 'Mazao yote' : 'All crops'}</option>
          {CROPS.map(c => <option key={c.value} value={c.value}>{c.label[lang] || c.value}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm">{lang === 'sw' ? 'Hakuna orodha zilizopatikana' : 'No listings found'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(item => (
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
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-text-muted"><MapPin className="w-3 h-3" /> {item.county}</div>
                <div className="flex items-center gap-2 text-xs text-text-muted"><Package className="w-3 h-3" /> {item.quantity} {item.unit}</div>
                <div className="flex items-center gap-2 text-xs text-text-muted"><Calendar className="w-3 h-3" /> {lang === 'sw' ? 'Inapatikana' : 'Available'}: {item.available}</div>
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
    </div>
  )
}

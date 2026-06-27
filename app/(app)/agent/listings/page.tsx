'use client'

import { useState, useEffect } from 'react'
import { ClipboardCheck, CheckCircle2, XCircle, MapPin, Scale, Sprout, Store, Search, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSession, getToken } from '@/lib/auth'
import { getLanguage } from '@/lib/i18n'
import { toast } from 'sonner'
import type { Language, MarketListing } from '@/lib/types'

const STATUS_STYLE: Record<string, { icon: any; color: string; bg: string }> = {
  pending_verification: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  verified:             { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
  rejected:             { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
  sold:                 { icon: Store, color: 'text-blue-400', bg: 'bg-blue-400/10' },
}

export default function AgentListingsPage() {
  const [lang, setLang] = useState<Language>('en')
  const [view, setView] = useState<'LOADING' | 'AGENT' | 'ERROR'>('LOADING')
  const [listings, setListings] = useState<MarketListing[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'all'>('pending')
  const [search, setSearch] = useState('')

  // Verify modal
  const [selected, setSelected] = useState<MarketListing | null>(null)
  const [agentNotes, setAgentNotes] = useState('')
  const [actioning, setActioning] = useState(false)

  useEffect(() => {
    const savedLang = getLanguage()
    if (savedLang) setLang(savedLang)

    const sess = getSession()
    if (!sess.isAuthenticated || sess.role !== 'agent') {
      setView('ERROR')
      return
    }
    setView('AGENT')
    loadListings()
  }, [])

  async function loadListings() {
    setLoading(true)
    const token = getToken()
    try {
      const res = await fetch('/api/marketplace/listings?agent=true', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setListings(data.listings || [])
    } catch {}
    setLoading(false)
  }

  async function handleAction(action: 'verify' | 'reject') {
    if (!selected) return
    setActioning(true)
    const token = getToken()
    try {
      const res = await fetch('/api/marketplace/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ listingId: selected.id, action, agentNotes }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(action === 'verify'
          ? (lang === 'sw' ? 'Imehakikiwa' : 'Verified')
          : (lang === 'sw' ? 'Imekataliwa' : 'Rejected'))
        setSelected(null)
        setAgentNotes('')
        loadListings()
      } else {
        toast.error(data.error || 'Failed')
      }
    } catch { toast.error('Network error') }
    setActioning(false)
  }

  if (view === 'LOADING') return null
  if (view === 'ERROR') return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-3">
        <ClipboardCheck className="w-12 h-12 text-blue-400 mx-auto" />
        <p className="text-text-primary font-semibold text-lg">{lang === 'sw' ? 'Ufikiaji Umekataliwa' : 'Access Denied'}</p>
        <p className="text-text-muted text-sm">{lang === 'sw' ? 'Ni wakala pekee wanaoweza kufikia ukurasa huu.' : 'Only agents can access this page.'}</p>
      </div>
    </div>
  )

  const pendingListings = listings.filter(l => l.verificationStatus === 'pending_verification')
  const displayListings = tab === 'pending' ? pendingListings : listings

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-text-primary">
              {lang === 'sw' ? 'Hakiki Mazao' : 'Verify Yields'}
            </h1>
            <p className="text-sm text-text-muted mt-1">
              {lang === 'sw' ? 'Hakiki na kudhibitisha mazao yaliyowekwa na wakulima' : 'Review and verify farmer produce listings'}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-dark-mid rounded-lg border border-border-subtle p-1">
            {(['pending', 'all'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={cn('px-4 py-1.5 rounded-md text-xs font-medium transition-all',
                  tab === t ? 'bg-blue-400/10 text-blue-400 border border-blue-400/20' : 'text-text-muted hover:text-text-primary'
                )}>
                {t === 'pending'
                  ? (lang === 'sw' ? 'Inasubiri' : `Pending (${pendingListings.length})`)
                  : (lang === 'sw' ? 'Zote' : 'All')}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'sw' ? 'Tafuta kwa zao, mkulima, au kaunti...' : 'Search by crop, farmer, or county...'}
            className="w-full pl-10 pr-4 py-2 bg-dark-mid border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-blue-400/30" />
        </div>

        {/* Listings */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
          </div>
        ) : displayListings.length === 0 ? (
          <div className="text-center py-20">
            <ClipboardCheck className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted font-medium">
              {tab === 'pending'
                ? (lang === 'sw' ? 'Hakuna mazao yanayosubiri kuhakikiwa' : 'No pending listings')
                : (lang === 'sw' ? 'Hakuna mazao yaliyowekwa' : 'No listings found')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayListings
              .filter(l => !search || l.crop.toLowerCase().includes(search.toLowerCase()) || l.farmerName.toLowerCase().includes(search.toLowerCase()) || l.county.toLowerCase().includes(search.toLowerCase()))
              .map(item => {
                const sc = STATUS_STYLE[item.verificationStatus] || STATUS_STYLE.pending_verification
                const StatusIcon = sc.icon
                return (
                  <div key={item.id} className="bg-dark-mid rounded-xl border border-border-subtle p-4 hover:border-blue-400/20 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-text-primary capitalize">{item.crop}</h3>
                          <span className="text-[11px] text-green-400">{item.quality}</span>
                          <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium', sc.color, sc.bg)}>
                            <StatusIcon className="w-2.5 h-2.5" />
                            {item.verificationStatus.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                          <span className="flex items-center gap-1"><Sprout className="w-3 h-3" /> {item.farmerName}</span>
                          <span className="flex items-center gap-1"><Scale className="w-3 h-3" /> {item.quantity} {item.unit}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.county}</span>
                          <span className="font-medium text-green-400">KES {item.pricePerUnit.toLocaleString()}/{item.unit}</span>
                        </div>
                        {item.agentNotes && (
                          <p className="text-[11px] text-text-muted/60 mt-1 italic">{item.agentNotes}</p>
                        )}
                      </div>
                      {item.verificationStatus === 'pending_verification' && (
                        <div className="flex items-center gap-2 ml-3 shrink-0">
                          <button onClick={() => { setSelected(item); setAgentNotes('') }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-400/10 text-green-400 text-xs font-medium rounded-lg hover:bg-green-400/20 transition-colors">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {lang === 'sw' ? 'Hakiki' : 'Verify'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>

      {/* Verify/Reject Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-dark-mid border border-border-subtle rounded-2xl p-6 w-full max-w-md relative">
            <h2 className="text-lg font-semibold text-text-primary mb-1 capitalize">{selected.crop}</h2>
            <p className="text-xs text-text-muted mb-4">
              {selected.farmerName} &middot; {selected.county} &middot; {selected.quantity} {selected.unit}
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted mb-1 block">{lang === 'sw' ? 'Vidokezo' : 'Notes'}</label>
                <textarea value={agentNotes} onChange={e => setAgentNotes(e.target.value)} rows={3}
                  placeholder={lang === 'sw' ? 'Ingiza vidokezo vya ubora...' : 'Enter quality notes...'}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark-base border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-blue-400/50 resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleAction('reject')} disabled={actioning}
                  className="flex-1 py-2.5 rounded-xl bg-red-400/10 text-red-400 font-medium text-sm hover:bg-red-400/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  {lang === 'sw' ? 'Kataa' : 'Reject'}
                </button>
                <button onClick={() => handleAction('verify')} disabled={actioning}
                  className="flex-1 py-2.5 rounded-xl bg-green-400/10 text-green-400 font-medium text-sm hover:bg-green-400/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {lang === 'sw' ? 'Hakiki' : 'Verify'}
                </button>
              </div>
              <button onClick={() => setSelected(null)}
                className="w-full py-2 text-xs text-text-muted hover:text-text-primary transition-colors">
                {lang === 'sw' ? 'Ghairi' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

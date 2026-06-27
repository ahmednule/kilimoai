'use client'

import { useState, useEffect } from 'react'
import { Store, Sprout, Package, DollarSign, Clock, CheckCircle2, XCircle, Plus, X, AlertTriangle, MapPin, Scale } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSession, getToken } from '@/lib/auth'
import { getLanguage } from '@/lib/i18n'
import { CROPS } from '@/lib/constants'
import { toast } from 'sonner'
import type { Language, MarketListing } from '@/lib/types'

const STATUS_STYLE: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  pending_verification: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Pending Verification' },
  verified:             { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Verified' },
  rejected:             { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Rejected' },
  sold:                 { icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Sold' },
}

export default function MyListingsPage() {
  const [lang, setLang] = useState<Language>('en')
  const [view, setView] = useState<'LOADING' | 'FARMER' | 'ERROR'>('LOADING')
  const [listings, setListings] = useState<MarketListing[]>([])
  const [loading, setLoading] = useState(true)

  // Create listing form
  const [showForm, setShowForm] = useState(false)
  const [crop, setCrop] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('bags')
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [quality, setQuality] = useState('Grade 1')
  const [available, setAvailable] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const savedLang = getLanguage()
    if (savedLang) setLang(savedLang)

    const sess = getSession()
    if (!sess.isAuthenticated || sess.role !== 'farmer') {
      setView('ERROR')
      return
    }
    setView('FARMER')
    loadListings()
  }, [])

  async function loadListings() {
    setLoading(true)
    const token = getToken()
    try {
      const res = await fetch('/api/marketplace/listings?farmerId=' + encodeURIComponent(getSession().id || ''), {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setListings(data.listings || [])
    } catch {}
    setLoading(false)
  }

  async function handleSubmit() {
    if (!crop || !quantity || !pricePerUnit) {
      toast.error(lang === 'sw' ? 'Tafadhali jaza sehemu zote muhimu' : 'Please fill all required fields')
      return
    }
    setSubmitting(true)
    const token = getToken()
    try {
      const res = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ crop, quantity: Number(quantity), unit, pricePerUnit: Number(pricePerUnit), quality, available }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(lang === 'sw' ? 'Orodha imewekwa!' : 'Listing created!')
        setShowForm(false)
        setCrop(''); setQuantity(''); setUnit('bags'); setPricePerUnit(''); setQuality('Grade 1'); setAvailable('')
        loadListings()
      } else {
        toast.error(data.error || 'Failed')
      }
    } catch { toast.error('Network error') }
    setSubmitting(false)
  }

  if (view === 'LOADING') return null
  if (view === 'ERROR') return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-3">
        <Store className="w-12 h-12 text-green-400 mx-auto" />
        <p className="text-text-primary font-semibold text-lg">{lang === 'sw' ? 'Ufikiaji Umekataliwa' : 'Access Denied'}</p>
        <p className="text-text-muted text-sm">{lang === 'sw' ? 'Ni wakulima pekee wanaoweza kufikia ukurasa huu.' : 'Only farmers can access this page.'}</p>
      </div>
    </div>
  )

  const pendingCount = listings.filter(l => l.verificationStatus === 'pending_verification').length
  const verifiedCount = listings.filter(l => l.verificationStatus === 'verified').length
  const soldCount = listings.filter(l => l.verificationStatus === 'sold').length
  const totalQty = listings.reduce((s, l) => s + l.quantity, 0)
  const totalValue = listings.reduce((s, l) => s + l.quantity * l.pricePerUnit, 0)

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-text-primary">
              {lang === 'sw' ? 'Mazao Yangu' : 'My Yields'}
            </h1>
            <p className="text-sm text-text-muted mt-1">
              {lang === 'sw' ? 'Weka na kusimamia mazao yako kwa ajili ya soko' : 'List and manage your produce for the marketplace'}
            </p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-primary text-white text-sm font-medium rounded-xl hover:bg-green-600 transition-colors">
            <Plus className="w-4 h-4" />
            {lang === 'sw' ? 'Weka Orodha Mpya' : 'New Listing'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-dark-mid rounded-xl border border-border-subtle p-4">
            <span className="text-xs text-text-muted">{lang === 'sw' ? 'Kusubiri' : 'Pending'}</span>
            <p className="text-2xl font-bold text-yellow-400 mt-2">{pendingCount}</p>
          </div>
          <div className="bg-dark-mid rounded-xl border border-border-subtle p-4">
            <span className="text-xs text-text-muted">{lang === 'sw' ? 'Imehakikiwa' : 'Verified'}</span>
            <p className="text-2xl font-bold text-green-400 mt-2">{verifiedCount}</p>
          </div>
          <div className="bg-dark-mid rounded-xl border border-border-subtle p-4">
            <span className="text-xs text-text-muted">{lang === 'sw' ? 'Jumla' : 'Total Qty'}</span>
            <p className="text-2xl font-bold text-text-primary mt-2">{totalQty} {unit}</p>
          </div>
          <div className="bg-dark-mid rounded-xl border border-border-subtle p-4">
            <span className="text-xs text-text-muted">{lang === 'sw' ? 'Thamani' : 'Value'}</span>
            <p className="text-2xl font-bold text-green-400 mt-2">KES {totalValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Listings */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <Sprout className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted font-medium">
              {lang === 'sw' ? 'Hakuna mazao yaliyowekwa bado' : 'No yields listed yet'}
            </p>
            <p className="text-xs text-text-muted/60 mt-1">
              {lang === 'sw' ? 'Bofya "Weka Orodha Mpya" kuanza' : 'Click "New Listing" to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map(item => {
              const sc = STATUS_STYLE[item.verificationStatus] || STATUS_STYLE.pending_verification
              const StatusIcon = sc.icon
              return (
                <div key={item.id} className="bg-dark-mid rounded-xl border border-border-subtle p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary capitalize">{item.crop}</h3>
                      <span className="text-[11px] text-green-400 font-medium">{item.quality}</span>
                    </div>
                    <span className="text-lg font-bold text-green-400">KES {item.pricePerUnit.toLocaleString()}/{item.unit}</span>
                  </div>
                  <div className="space-y-1.5 mb-3 text-xs text-text-muted">
                    <div className="flex items-center gap-1.5"><Scale className="w-3 h-3" /> {item.quantity} {item.unit}</div>
                    <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {item.county}</div>
                    {item.available && <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Available: {item.available}</div>}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                    <div className={cn('flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium', sc.color, sc.bg)}>
                      <StatusIcon className="w-3 h-3" />
                      {sc.label}
                    </div>
                    {item.agentNotes && (
                      <span className="text-[10px] text-text-muted/60" title={item.agentNotes}>
                        <AlertTriangle className="w-3 h-3 inline-block mr-0.5" />
                        {item.agentNotes.length > 20 ? item.agentNotes.slice(0, 20) + '...' : item.agentNotes}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Listing Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-dark-mid border border-border-subtle rounded-2xl p-6 w-full max-w-md relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              {lang === 'sw' ? 'Weka Mazao Yako' : 'List Your Produce'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted mb-1 block">{lang === 'sw' ? 'Zao' : 'Crop'} *</label>
                <select value={crop} onChange={e => setCrop(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark-base border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-green-400/50">
                  <option value="">{lang === 'sw' ? 'Chagua zao' : 'Select crop'}</option>
                  {CROPS.map(c => (
                    <option key={c.value} value={c.value}>{c.label[lang] || c.value}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">{lang === 'sw' ? 'Kiasi' : 'Quantity'} *</label>
                  <input type="number" min={1} value={quantity} onChange={e => setQuantity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-dark-base border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-green-400/50" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">{lang === 'sw' ? 'Kipimo' : 'Unit'}</label>
                  <select value={unit} onChange={e => setUnit(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-dark-base border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-green-400/50">
                    <option value="bags">Bags</option>
                    <option value="kg">Kg</option>
                    <option value="tonnes">Tonnes</option>
                    <option value="crates">Crates</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">{lang === 'sw' ? 'Bei kwa kipimo' : 'Price per unit'} (KES) *</label>
                <input type="number" min={1} value={pricePerUnit} onChange={e => setPricePerUnit(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark-base border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-green-400/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">{lang === 'sw' ? 'Ubora' : 'Quality'}</label>
                  <select value={quality} onChange={e => setQuality(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-dark-base border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-green-400/50">
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Premium">Premium</option>
                    <option value="Organic">Organic</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">{lang === 'sw' ? 'Inapatikana' : 'Available'}</label>
                  <input type="month" value={available} onChange={e => setAvailable(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-dark-base border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-green-400/50" />
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-border-subtle">
                <span className="text-sm text-text-muted">{lang === 'sw' ? 'Thamani ya jumla' : 'Total value'}</span>
                <span className="text-lg font-bold text-green-400">
                  KES {(Number(quantity) * Number(pricePerUnit)).toLocaleString() || '0'}
                </span>
              </div>
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full py-3 rounded-xl bg-green-primary text-white font-semibold hover:bg-green-600 transition-all disabled:opacity-50">
                {submitting ? (lang === 'sw' ? 'Inaweka...' : 'Submitting...') : (lang === 'sw' ? 'Weka Orodha' : 'Submit Listing')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

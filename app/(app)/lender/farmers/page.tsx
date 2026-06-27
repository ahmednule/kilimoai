'use client'

import { useState, useEffect } from 'react'
import { Users, Search, MapPin, Phone, Sprout, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react'
import { getToken } from '@/lib/auth'

interface VerifiedFarmer {
  id: string
  name: string
  phone: string
  county: string
  crops: string[]
  acreage: number
  creditScore: number
  language: string
  hasChama: boolean
  chamaName: string | null
  verified: boolean
}

export default function LenderFarmersPage() {
  const [farmers, setFarmers] = useState<VerifiedFarmer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadFarmers()
  }, [])

  async function loadFarmers() {
    const token = getToken()
    if (!token) return
    try {
      const res = await fetch('/api/lender/farmers', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setFarmers(data.farmers || [])
    } catch {}
    setLoading(false)
  }

  const filtered = farmers.filter(f => {
    if (!search) return true
    const q = search.toLowerCase()
    return f.name.toLowerCase().includes(q) || f.county.toLowerCase().includes(q) || f.crops.some(c => c.toLowerCase().includes(q))
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
          <Users className="w-3.5 h-3.5" />
          <span>Lender / Farmers</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-text-primary">Verified Farmers</h1>
        <p className="text-sm text-text-muted mt-1">
          Browse farmers who have been verified by field agents and are eligible for loan matching
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, county, or crop..."
          className="w-full bg-dark-mid border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green-primary/50"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-green-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">{search ? 'No farmers match your search' : 'No verified farmers yet'}</p>
          <p className="text-xs mt-1">
            {search ? 'Try a different search term' : 'Farmers appear here once an agent verifies their information'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(farmer => {
            const cropLabel = farmer.crops?.[0] || 'N/A'
            return (
              <div key={farmer.id} className="bg-dark-mid border border-border-subtle rounded-xl p-5 hover:border-green-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-primary/15 flex items-center justify-center text-sm font-bold text-green-primary">
                      {farmer.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-text-primary text-sm">{farmer.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-risk-low">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-text-muted">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{farmer.county}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sprout className="w-3.5 h-3.5 shrink-0" />
                    <span>{cropLabel} — {farmer.acreage} acres</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{farmer.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Credit Score: {farmer.creditScore || 'N/A'}</span>
                  </div>
                  {farmer.hasChama && (
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-gold-harvest">{farmer.chamaName || 'Chama member'}</span>
                    </div>
                  )}
                </div>

                {farmer.crops && farmer.crops.length > 1 && (
                  <div className="mt-3 pt-3 border-t border-border-subtle">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">All Crops</p>
                    <div className="flex flex-wrap gap-1">
                      {farmer.crops.map((c, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-dark-base text-text-muted">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

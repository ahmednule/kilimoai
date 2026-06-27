'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Building2, ChevronDown, ShieldAlert, Search, CheckCircle2,
  Info, X, Send, Landmark, Star, Users,
} from 'lucide-react'
import { FarmerProfile, Language, RiskLevel } from '@/lib/types'
import { cn } from '@/lib/utils'
import { getAssessments, StoredAssessment } from '@/lib/assessments'
import { getToken } from '@/lib/auth'

interface LoanProduct {
  id: string
  name: string
  provider: string
  minAmount: number
  maxAmount: number
  interestRate: number
  tenureMonths: number
  eligibility: string
  description: string
  category: string
}

const CATEGORY_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  input:    { color: 'text-green-400', bg: 'bg-green-primary/10', border: 'border-green-primary/20' },
  equipment:{ color: 'text-blue-400',  bg: 'bg-blue-400/10',     border: 'border-blue-400/20' },
  seasonal: { color: 'text-gold-harvest', bg: 'bg-gold-harvest/10', border: 'border-gold-harvest/20' },
  working:  { color: 'text-purple-400', bg: 'bg-purple-400/10',  border: 'border-purple-400/20' },
}

const formatKES = (n: number) => `KES ${n.toLocaleString('en-KE')}`
const riskFromProfile = (p: FarmerProfile): RiskLevel => {
  const totalAcres = p.crops.reduce((s, c) => s + c.acres, 0)
  const rentedShare = p.crops.filter(c => c.isRented).reduce((s, c) => s + c.acres, 0) / Math.max(totalAcres, 1)
  const cropCount = p.crops.length
  if (totalAcres <= 0.5 || rentedShare > 0.7) return 'HIGH'
  if (totalAcres <= 2 && rentedShare > 0.5 && cropCount <= 1) return 'HIGH'
  if (totalAcres <= 3 || rentedShare > 0.3 || cropCount <= 1) return 'MEDIUM'
  return 'LOW'
}

export default function LoansPage() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null)
  const [language, setLanguage] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)
  const [products, setProducts] = useState<LoanProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [applyProduct, setApplyProduct] = useState<LoanProduct | null>(null)
  const [amount, setAmount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [recommendedMaxLoan, setRecommendedMaxLoan] = useState<number | null>(null)

  useEffect(() => {
    const savedLang = localStorage.getItem('kilimo-language') as Language | null
    const savedProfile = localStorage.getItem('kilimo-profile')
    if (savedLang) setLanguage(savedLang)
    if (savedProfile) {
      try { setProfile(JSON.parse(savedProfile)) } catch {}
    }
    const assessments = getAssessments()
    if (assessments.length > 0) {
      setRecommendedMaxLoan(assessments[0].scenarios.recommendedMaxLoan)
    }
    setMounted(true)
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/loan-products')
      const data = await res.json()
      if (data.success) setProducts(data.products || [])
    } catch (e) {
      console.error('Failed to fetch products', e)
    } finally {
      setLoading(false)
    }
  }

  const computedRisk = useMemo(() => profile ? riskFromProfile(profile) : 'UNKNOWN', [profile])
  const totalAcres = useMemo(() => profile ? profile.crops.reduce((s, c) => s + c.acres, 0) : 0, [profile])
  const cropSummary = useMemo(() => profile ? profile.crops.map(c => c.crop).join(', ') : '', [profile])

  const filtered = products.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.provider.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  })

  const handleApply = (product: LoanProduct) => {
    setApplyProduct(product)
    setAmount(product.minAmount)
    setSubmitted(false)
  }

  const handleSubmit = async () => {
    if (!applyProduct || !profile) return
    setSubmitting(true)
    try {
      const token = getToken()
      const farmerProfile = JSON.parse(localStorage.getItem('kilimo-profile') || '{}')
      const farmerId = localStorage.getItem('kilimo-user-id') || `fp-${Date.now()}`
      const res = await fetch('/api/loan-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: applyProduct.id,
          farmerId,
          farmerName: farmerProfile.name || profile.name,
          amount,
          county: profile.county,
          crop: cropSummary,
          acres: totalAcres,
          riskLevel: computedRisk,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
        setTimeout(() => { setApplyProduct(null); setSubmitted(false) }, 2000)
      }
    } catch (e) {
      console.error('Failed to submit application', e)
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-border-subtle">
        <p className="text-text-muted text-[10px] uppercase tracking-widest mb-1">finance hub</p>
        <h1 className="text-xl sm:text-2xl font-serif font-semibold text-text-primary">
          {language === 'sw' ? 'Bidhaa za Mikopo' : 'Loan Products'}
        </h1>
        <p className="text-sm text-text-muted mt-1">
          {language === 'sw'
            ? 'Linganisha chaguo za mikopo kulingana na wasifu wako'
            : 'Compare loan options tailored to your farm profile'}
        </p>
      </div>

      {/* Profile stats */}
      {profile && (
        <div className="px-4 sm:px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Farm size', value: `${totalAcres} acres` },
            { label: 'Crops', value: cropSummary || '—' },
            { label: 'County', value: profile.county },
            { label: 'Risk', value: computedRisk },
          ].map((s, i) => (
            <div key={i} className="bg-dark-mid border border-border-subtle rounded-lg px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-text-muted">{s.label}</p>
              <p className="text-sm font-semibold text-text-primary truncate">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {recommendedMaxLoan && (
        <div className="px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">
              Recommended limit: {formatKES(recommendedMaxLoan)}
            </span>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-4 sm:px-6 py-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={language === 'sw' ? 'Tafuta...' : 'Search products...'}
            className="w-full pl-9 pr-4 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Product cards */}
      <div className="px-4 sm:px-6 pb-6 space-y-3">
        {loading ? (
          <p className="text-text-muted text-sm text-center py-12">Loading products...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <Landmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{products.length === 0 ? 'No loan products available' : 'No matching products'}</p>
          </div>
        ) : (
          filtered.map(product => {
            const style = CATEGORY_STYLES[product.category] || CATEGORY_STYLES.working
            const isExpanded = expanded === product.id

            return (
              <div
                key={product.id}
                className={cn('bg-dark-mid border rounded-xl p-4 sm:p-5 transition-all hover:border-green-primary/30', 'border-border-subtle')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={cn('p-2 rounded-lg shrink-0', style.bg)}>
                      <Building2 className={cn('w-5 h-5', style.color)} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-text-primary truncate">{product.name}</h3>
                      <p className="text-xs text-text-muted">{product.provider}</p>
                    </div>
                  </div>
                  <span className={cn('text-[10px] font-medium uppercase px-2 py-0.5 rounded-full shrink-0', style.bg, style.color)}>
                    {product.category}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-dark-base rounded-lg p-2 text-center">
                    <p className="text-sm font-bold text-text-primary">{product.minAmount > 0 ? formatKES(product.minAmount) : '—'} – {product.maxAmount > 0 ? formatKES(product.maxAmount) : '—'}</p>
                    <p className="text-[10px] text-text-muted">{language === 'sw' ? 'Kiwango' : 'Amount'}</p>
                  </div>
                  <div className="bg-dark-base rounded-lg p-2 text-center">
                    <p className="text-base font-bold text-text-primary">{product.interestRate}%</p>
                    <p className="text-[10px] text-text-muted">APR</p>
                  </div>
                  <div className="bg-dark-base rounded-lg p-2 text-center">
                    <p className="text-xs font-bold text-text-primary">{product.tenureMonths} months</p>
                    <p className="text-[10px] text-text-muted">{language === 'sw' ? 'Muda' : 'Duration'}</p>
                  </div>
                  <div className="bg-dark-base rounded-lg p-2 text-center">
                    <p className="text-xs font-bold text-text-primary truncate" title={product.eligibility}>
                      {product.eligibility || '—'}
                    </p>
                    <p className="text-[10px] text-text-muted">{language === 'sw' ? 'Masharti' : 'Eligibility'}</p>
                  </div>
                </div>

                {product.description && (
                  <p className="text-xs text-text-muted mt-3 leading-relaxed">{product.description}</p>
                )}

                <button
                  onClick={() => setExpanded(isExpanded ? null : product.id)}
                  className="mt-3 text-xs text-green-400 font-medium flex items-center gap-1 hover:text-green-300 transition-colors"
                >
                  {isExpanded ? (language === 'sw' ? 'Funga' : 'Hide') : (language === 'sw' ? 'Ona maelezo' : 'Details')}
                  <ChevronDown className={cn('w-3 h-3 transition-transform', isExpanded && 'rotate-180')} />
                </button>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border-subtle">
                    <p className="text-xs font-medium text-text-primary mb-1">{language === 'sw' ? 'Masharti kamili' : 'Full eligibility'}</p>
                    <p className="text-xs text-text-muted mb-4">{product.eligibility}</p>
                    <button
                      onClick={() => handleApply(product)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-primary/10 border border-green-primary/20 text-xs text-green-400 font-medium hover:bg-green-primary/20 transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      {language === 'sw' ? 'Tuma maombi' : 'Apply now'}
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Apply modal */}
      {applyProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-dark-mid border border-border-subtle rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                {language === 'sw' ? 'Omba Mkopo' : 'Apply for Loan'}
              </h2>
              <button onClick={() => { setApplyProduct(null); setSubmitted(false) }} className="p-1 hover:bg-dark-base rounded-lg transition-colors">
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-8 space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-primary/10 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <p className="font-semibold text-green-400">{language === 'sw' ? 'Ombi limewasilishwa!' : 'Application submitted!'}</p>
                <p className="text-xs text-text-muted">{language === 'sw' ? 'Utapata ufuatiliaji kupitia SMS' : 'You will receive follow-up via SMS'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-text-muted">
                  {language === 'sw'
                    ? `Unaomba ${applyProduct.name}`
                    : `Applying for ${applyProduct.name}`}
                </p>
                {profile && (
                  <div className="bg-dark-base rounded-lg p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-primary/20 flex items-center justify-center text-xs font-semibold text-green-400">
                      {profile.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{profile.name}</p>
                      <p className="text-xs text-text-muted">{profile.county} · {totalAcres} acres</p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-text-muted">{language === 'sw' ? 'Kiasi' : 'Amount (KES)'}</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:border-green-primary/50 mt-1"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!amount || submitting}
                  className="w-full py-2.5 rounded-lg bg-green-primary text-dark-base font-semibold text-sm hover:bg-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (language === 'sw' ? 'Inatuma...' : 'Submitting...') : (language === 'sw' ? 'Tuma Ombi' : 'Submit Application')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

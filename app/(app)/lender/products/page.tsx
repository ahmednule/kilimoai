'use client'

import { useState, useEffect } from 'react'
import {
  Landmark, Plus, Users, Search, Filter, ChevronDown, MapPin, Sprout,
  DollarSign, Clock, CheckCircle2, AlertTriangle, BadgeCheck, X, Shield,
  Pencil, Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSession, getToken } from '@/lib/auth'
import { Language } from '@/lib/types'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { toast } from 'sonner'

type View = 'LOADING' | 'UNAUTHORIZED' | 'PRODUCTS'

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

interface LoanApplication {
  id: string
  farmerName: string
  farmerEmail: string
  amount: number
  status: string
  date: string
  county: string
  crop: string
  riskLevel: string
}

const CATEGORIES = ['input', 'equipment', 'seasonal', 'working']

const formatKES = (n: number) => `Ksh ${n.toLocaleString('en-KE')}`

const defaultForm = { name: '', provider: '', minAmount: 0, maxAmount: 0, interestRate: 0, tenureMonths: 0, eligibility: '', description: '', category: 'input' }

export default function LenderProducts() {
  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState<View>('LOADING')
  const [language] = useState<Language>('en')
  const [products, setProducts] = useState<LoanProduct[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<LoanProduct | null>(null)
  const [form, setForm] = useState(defaultForm)

  // Selected product applicants
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [applicants, setApplicants] = useState<LoanApplication[]>([])
  const [applicantsLoading, setApplicantsLoading] = useState(false)

  const lenderId = getSession().id || ''

  useEffect(() => {
    const session = getSession()
    if (!session.isAuthenticated || session.role !== 'lender') {
      setView('UNAUTHORIZED')
      setMounted(true)
      return
    }
    setView('PRODUCTS')
    setMounted(true)
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const token = getToken()
    try {
      const res = await fetch(`/api/loan-products?createdBy=${encodeURIComponent(lenderId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setProducts(data.products || [])
    } catch (e) {
      console.error('Failed to fetch products', e)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplicants = async (productId: string) => {
    setApplicantsLoading(true)
    setSelectedProduct(productId)
    try {
      const token = getToken()
      const res = await fetch(`/api/loan-applications?productId=${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setApplicants(data.applications || [])
    } catch (e) {
      console.error('Failed to fetch applicants', e)
    } finally {
      setApplicantsLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm)
    setFormOpen(true)
  }

  const openEdit = (product: LoanProduct) => {
    setEditing(product)
    setForm({
      name: product.name,
      provider: product.provider,
      minAmount: product.minAmount,
      maxAmount: product.maxAmount,
      interestRate: product.interestRate,
      tenureMonths: product.tenureMonths,
      eligibility: product.eligibility,
      description: product.description,
      category: product.category,
    })
    setFormOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.provider) return
    const token = getToken()
    try {
      const url = '/api/loan-products'
      const method = editing ? 'PATCH' : 'POST'
      const body = editing ? { id: editing.id, ...form } : form

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editing ? 'Product updated' : 'Product created')
        setFormOpen(false)
        setEditing(null)
        fetchProducts()
      } else {
        toast.error(data.error || 'Failed')
      }
    } catch (e) {
      toast.error('Network error')
    }
  }

  const handleDelete = async (product: LoanProduct) => {
    if (!confirm(`Delete "${product.name}"?`)) return
    const token = getToken()
    try {
      const res = await fetch(`/api/loan-products?id=${product.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Product deleted')
        fetchProducts()
      } else {
        toast.error(data.error || 'Failed')
      }
    } catch {
      toast.error('Network error')
    }
  }

  if (!mounted) return null
  if (view === 'LOADING') return <div className="flex h-full items-center justify-center"><p className="text-text-muted text-sm">Loading...</p></div>
  if (view === 'UNAUTHORIZED') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-text-muted/40 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">Lender Access Only</h2>
          <p className="text-sm text-text-muted">You must be logged in as a lender to manage loan products.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-border-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-text-primary flex items-center gap-2">
              <Landmark className="w-5 h-5 text-gold-harvest" />
              My Loan Products
            </h1>
            <p className="text-sm text-text-muted mt-1">Create, edit, and manage your loan products</p>
          </div>
          <button onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-primary text-green-100 text-sm font-medium hover:bg-green-light transition-colors w-fit">
            <Plus className="w-4 h-4" />
            New Product
          </button>
        </div>
      </div>

      {/* Products list */}
      <div className="px-4 sm:px-6 py-4 space-y-3">
        {loading ? (
          <p className="text-text-muted text-sm text-center py-12">Loading products...</p>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Landmark className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
            <p className="text-text-muted text-sm">No loan products yet. Create your first product.</p>
          </div>
        ) : (
          products.map(product => (
            <div key={product.id} className="bg-dark-mid border border-border-subtle rounded-xl overflow-hidden">
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-text-primary">{product.name}</h3>
                    <p className="text-[11px] text-text-muted mt-0.5">{product.provider}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium',
                      product.category === 'input' ? 'bg-green-400/10 text-green-400' :
                      product.category === 'equipment' ? 'bg-blue-400/10 text-blue-400' :
                      product.category === 'seasonal' ? 'bg-gold-harvest/10 text-gold-harvest' :
                      'bg-purple-400/10 text-purple-400'
                    )}>
                      {product.category}
                    </span>
                    <button onClick={() => openEdit(product)}
                      className="p-1.5 text-text-muted hover:text-blue-400 rounded-lg hover:bg-dark-base transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(product)}
                      className="p-1.5 text-text-muted hover:text-red-400 rounded-lg hover:bg-dark-base transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div>
                    <p className="text-[10px] text-text-muted uppercase">Range</p>
                    <p className="text-sm font-semibold text-text-primary">{formatKES(product.minAmount)} – {formatKES(product.maxAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted uppercase">Interest</p>
                    <p className="text-sm font-semibold text-text-primary">{product.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted uppercase">Tenure</p>
                    <p className="text-sm font-semibold text-text-primary">{product.tenureMonths} months</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted uppercase">Eligibility</p>
                    <p className="text-sm text-text-primary truncate" title={product.eligibility}>{product.eligibility}</p>
                  </div>
                </div>

                {product.description && (
                  <p className="text-[12px] text-text-muted mt-3 leading-relaxed">{product.description}</p>
                )}

                <div className="mt-3 pt-3 border-t border-border-subtle">
                  <button onClick={() => fetchApplicants(product.id)}
                    className="inline-flex items-center gap-1.5 text-[12px] text-green-400 hover:text-green-300 transition-colors">
                    <Users className="w-3.5 h-3.5" />
                    View applicants
                  </button>
                </div>
              </div>

              {/* Applicants panel */}
              {selectedProduct === product.id && (
                <div className="border-t border-border-subtle bg-dark-base/50 px-4 sm:px-5 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[11px] uppercase tracking-widest text-text-muted/60">Applicants</h4>
                    <button onClick={() => setSelectedProduct(null)} className="p-1 text-text-muted hover:text-text-primary">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {applicantsLoading ? (
                    <p className="text-[12px] text-text-muted">Loading...</p>
                  ) : applicants.length === 0 ? (
                    <p className="text-[12px] text-text-muted">No applications yet</p>
                  ) : (
                    <div className="space-y-2">
                      {applicants.map(a => (
                        <div key={a.id} className="flex items-center justify-between gap-2 text-[12px]">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-text-primary font-medium truncate">{a.farmerName}</span>
                            <span className={cn(
                              'inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium',
                              a.riskLevel === 'LOW' ? 'bg-risk-low/10 text-risk-low' :
                              a.riskLevel === 'HIGH' ? 'bg-risk-high/10 text-risk-high' :
                              'bg-risk-medium/10 text-risk-medium'
                            )}>{a.riskLevel}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-text-primary font-medium">{formatKES(a.amount)}</span>
                            <span className={cn(
                              'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium',
                              a.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400' :
                              a.status === 'approved' ? 'bg-green-400/10 text-green-400' :
                              'bg-red-400/10 text-red-400'
                            )}>{a.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create/Edit sheet */}
      <Sheet open={formOpen} onOpenChange={(open) => { if (!open) { setFormOpen(false); setEditing(null) } }}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-dark-mid border-border-subtle overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-text-primary">{editing ? 'Edit Product' : 'New Loan Product'}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-text-muted mb-1">Product Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full h-10 rounded-lg border border-border-subtle bg-dark-base px-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-green-primary/40"
                placeholder="e.g. Kilimo Input Loan" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-text-muted mb-1">Provider</label>
              <input value={form.provider} onChange={e => setForm(p => ({ ...p, provider: e.target.value }))}
                className="w-full h-10 rounded-lg border border-border-subtle bg-dark-base px-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-green-primary/40"
                placeholder="e.g. Equity Bank" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-text-muted mb-1">Min Amount (Ksh)</label>
                <input type="number" value={form.minAmount || ''} onChange={e => setForm(p => ({ ...p, minAmount: Number(e.target.value) }))}
                  className="w-full h-10 rounded-lg border border-border-subtle bg-dark-base px-3 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-green-primary/40" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-text-muted mb-1">Max Amount (Ksh)</label>
                <input type="number" value={form.maxAmount || ''} onChange={e => setForm(p => ({ ...p, maxAmount: Number(e.target.value) }))}
                  className="w-full h-10 rounded-lg border border-border-subtle bg-dark-base px-3 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-green-primary/40" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-text-muted mb-1">Interest Rate (%)</label>
                <input type="number" step="0.1" value={form.interestRate || ''} onChange={e => setForm(p => ({ ...p, interestRate: Number(e.target.value) }))}
                  className="w-full h-10 rounded-lg border border-border-subtle bg-dark-base px-3 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-green-primary/40" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-text-muted mb-1">Tenure (months)</label>
                <input type="number" value={form.tenureMonths || ''} onChange={e => setForm(p => ({ ...p, tenureMonths: Number(e.target.value) }))}
                  className="w-full h-10 rounded-lg border border-border-subtle bg-dark-base px-3 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-green-primary/40" />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-text-muted mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full h-10 rounded-lg border border-border-subtle bg-dark-base px-3 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-green-primary/40">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-text-muted mb-1">Eligibility</label>
              <input value={form.eligibility} onChange={e => setForm(p => ({ ...p, eligibility: e.target.value }))}
                className="w-full h-10 rounded-lg border border-border-subtle bg-dark-base px-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-green-primary/40"
                placeholder="e.g. Active farmer with 1+ acre" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-text-muted mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
                className="w-full rounded-lg border border-border-subtle bg-dark-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-green-primary/40 resize-none" />
            </div>
            <button onClick={handleSave} disabled={!form.name || !form.provider}
              className="w-full h-11 rounded-lg bg-green-primary hover:bg-green-light text-green-100 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {editing ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

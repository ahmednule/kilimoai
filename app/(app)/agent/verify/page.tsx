'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ClipboardCheck, ArrowRight, Loader2 } from 'lucide-react'
import { getToken } from '@/lib/auth'

export default function VerifyPage() {
  const [farmers, setFarmers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) return
    fetch('/api/agent/farmers?status=pending', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { if (data.success) setFarmers(data.farmers) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-green-primary" /></div>

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
        <ClipboardCheck className="w-3.5 h-3.5" />
        <span>Agent / Verify Farmers</span>
      </div>
      <h1 className="text-xl sm:text-2xl font-serif font-bold text-text-primary mb-3">Verify Farmers</h1>
      <p className="text-text-muted text-sm mb-6">Select a farmer to review and verify their information.</p>

      <div className="grid gap-3">
        {farmers.map(f => (
          <Link key={f.id} href={`/agent/verify/${f.id}`}
            className="bg-dark-mid border border-border-subtle rounded-xl p-4 hover:border-green-primary/30 transition-colors flex items-center justify-between group">
            <div>
              <span className="text-sm text-text-primary font-medium">{f.name}</span>
              <span className="text-xs text-text-muted ml-3">{f.county}</span>
              {f.crops?.[0] && <span className="text-xs text-text-muted ml-3">{f.crops[0]} — {f.acreage} ac</span>}
              {f.hasChama && <span className="text-xs text-gold-harvest ml-3">Chama</span>}
            </div>
            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-green-primary transition-colors" />
          </Link>
        ))}
        {farmers.length === 0 && <p className="text-center py-8 text-text-muted text-sm">No pending farmers to verify.</p>}
      </div>
    </div>
  )
}

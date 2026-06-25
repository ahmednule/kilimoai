'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone, Sprout, ShieldCheck, AlertTriangle, Loader2, CheckCircle2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { getToken } from '@/lib/auth'

export default function VerifyFarmerPage() {
  const { id } = useParams()
  const router = useRouter()
  const [farmer, setFarmer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    loadFarmer()
  }, [])

  async function loadFarmer() {
    const token = getToken()
    if (!token) return
    try {
      const res = await fetch(`/api/agent/farmers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        const found = data.farmers.find((f: any) => f.id === id)
        if (found) setFarmer(found)
      }
    } catch {}
    setLoading(false)
  }

  async function handleVerify() {
    const token = getToken()
    if (!token || verifying) return
    setVerifying(true)
    try {
      const res = await fetch('/api/agent/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ farmerId: id, notes: 'Verified during field visit' }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Farmer verified successfully!')
        router.push('/agent/dashboard')
      } else {
        toast.error(data.error || 'Verification failed')
      }
    } catch {
      toast.error('Network error')
    }
    setVerifying(false)
  }

  async function handleFlag() {
    const token = getToken()
    if (!token || verifying) return
    setVerifying(true)
    try {
      const res = await fetch('/api/agent/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          farmerId: id,
          discrepancies: ['Claimed acreage does not match GPS measurement', 'Crop type differs from application'],
          notes: 'Field visit revealed discrepancies in self-reported data',
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.error('Farmer flagged with discrepancies')
        router.push('/agent/dashboard')
      } else {
        toast.error(data.error || 'Failed to flag')
      }
    } catch {
      toast.error('Network error')
    }
    setVerifying(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-green-primary" /></div>
  }

  if (!farmer) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <Link href="/agent/dashboard" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>
        <p className="text-text-muted text-center py-12">Farmer not found.</p>
      </div>
    )
  }

  const cropLabel = farmer.crops?.[0] || 'N/A'

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <Link href="/agent/dashboard" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <div className="bg-dark-mid border border-border-subtle rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-text-muted mb-0.5">Farmer</p>
            <h1 className="text-xl font-serif font-bold text-text-primary">{farmer.name}</h1>
          </div>
          <span className={`text-xs px-2 py-1 rounded font-medium ${
            farmer.status === 'verified' ? 'text-risk-low bg-risk-low/10' : 'text-risk-medium bg-risk-medium/10'
          }`}>
            {farmer.status === 'verified' ? 'Verified' : 'Pending verification'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-6">
          {[
            { icon: MapPin, label: 'County', value: farmer.county },
            { icon: Sprout, label: 'Crop', value: `${cropLabel} — ${farmer.acreage} ac` },
            { icon: Phone, label: 'Phone', value: farmer.phone || 'N/A' },
            { icon: Users, label: 'Chama', value: farmer.hasChama ? (farmer.chamaName || 'Member') : 'None' },
            { icon: ShieldCheck, label: 'Credit Score', value: farmer.creditScore?.toString() || 'N/A' },
          ].map((item, i) => (
            <div key={i} className="bg-dark-base rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-primary/10 flex items-center justify-center">
                <item.icon className="w-4 h-4 text-green-primary" />
              </div>
              <div>
                <p className="text-xs text-text-muted">{item.label}</p>
                <p className="text-sm text-text-primary font-medium">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {farmer.status !== 'verified' && (
          <div className="border-t border-border-subtle pt-4 space-y-3">
            <p className="text-sm text-text-primary font-medium">Verification Actions</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleVerify} disabled={verifying}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-risk-low/10 border border-risk-low/30 text-risk-low text-sm font-medium rounded-xl hover:bg-risk-low/20 transition-colors disabled:opacity-50">
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Mark as Verified
              </button>
              <button onClick={handleFlag} disabled={verifying}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-risk-high/10 border border-risk-high/30 text-risk-high text-sm font-medium rounded-xl hover:bg-risk-high/20 transition-colors disabled:opacity-50">
                <AlertTriangle className="w-4 h-4" />
                Flag Discrepancy
              </button>
            </div>
          </div>
        )}
        {farmer.status === 'verified' && (
          <div className="border-t border-border-subtle pt-4">
            <div className="flex items-center gap-2 text-sm text-risk-low">
              <CheckCircle2 className="w-4 h-4" />
              This farmer has been verified
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

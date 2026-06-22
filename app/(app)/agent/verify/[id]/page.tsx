'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone, Sprout, ShieldCheck, AlertTriangle } from 'lucide-react'

export default function VerifyFarmerPage() {
  const { id } = useParams()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <Link href="/agent/verify" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to verify
      </Link>

      <div className="bg-dark-mid border border-border-subtle rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-text-muted mb-0.5">Farmer ID</p>
            <h1 className="text-xl font-serif font-bold text-text-primary">{id}</h1>
          </div>
          <span className="text-xs px-2 py-1 rounded font-medium text-risk-medium bg-risk-medium/10">Pending verification</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-6">
          {[
            { icon: MapPin, label: 'County', value: 'Nakuru' },
            { icon: Sprout, label: 'Crop', value: 'Maize — 3.5 ac' },
            { icon: Phone, label: 'Phone', value: '+254 712 345 678' },
            { icon: AlertTriangle, label: 'Risk Level', value: 'Medium' },
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

        <div className="border-t border-border-subtle pt-4 space-y-3">
          <p className="text-sm text-text-primary font-medium">Verification Actions</p>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-risk-low/10 border border-risk-low/30 text-risk-low text-sm font-medium rounded-xl hover:bg-risk-low/20 transition-colors">
              <ShieldCheck className="w-4 h-4" />
              Mark as Verified
            </button>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-risk-high/10 border border-risk-high/30 text-risk-high text-sm font-medium rounded-xl hover:bg-risk-high/20 transition-colors">
              <AlertTriangle className="w-4 h-4" />
              Flag Discrepancy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

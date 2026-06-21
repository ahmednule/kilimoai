'use client'

import { ShieldAlert, MapPin, Sprout, AlertTriangle } from 'lucide-react'

const FLAGGED = [
  { name: 'Jane Akinyi', county: 'Kisumu', issue: 'Crop type mismatch — reported maize, satellite shows rice', severity: 'high', id: 'F-003' },
  { name: 'John Kariuki', county: 'Nyeri', issue: 'Acreage discrepancy — claims 5 ac, records show 2 ac', severity: 'medium', id: 'F-012' },
  { name: 'Faith Moraa', county: 'Kisii', issue: 'Phone number not reachable for 3 days', severity: 'medium', id: 'F-015' },
]

export default function FlaggedPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>Agent / Flagged</span>
      </div>
      <h1 className="text-xl sm:text-2xl font-serif font-bold text-text-primary mb-1">Flagged Farmers</h1>
      <p className="text-sm text-text-muted mb-6">Farmers with data discrepancies that need investigation</p>

      <div className="space-y-3">
        {FLAGGED.map((f, i) => (
          <div key={i} className="bg-dark-mid border border-border-subtle rounded-xl p-4 hover:border-risk-high/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-risk-high" />
              <span className="text-sm font-semibold text-text-primary">{f.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                f.severity === 'high' ? 'text-risk-high bg-risk-high/10' : 'text-risk-medium bg-risk-medium/10'
              }`}>{f.severity}</span>
            </div>
            <p className="text-xs text-text-muted flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3" /> {f.county}
            </p>
            <p className="text-xs text-text-primary">{f.issue}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

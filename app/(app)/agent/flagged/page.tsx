'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShieldAlert, MapPin, Sprout, AlertTriangle, Loader2, UserCheck, ChevronDown, ChevronRight, ArrowUpRight } from 'lucide-react'
import { getToken } from '@/lib/auth'
import { cn } from '@/lib/utils'

interface FlaggedDetail {
  discrepancies: string[]
  notes: string
  visitedAt: string
}

interface FlaggedFarmer {
  id: string
  name: string
  phone: string
  county: string
  crops: string[]
  acreage: number
  status: string
  flaggedDetail: FlaggedDetail | null
  assigned: boolean
}

export default function FlaggedPage() {
  const [farmers, setFarmers] = useState<FlaggedFarmer[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    loadFlagged()
  }, [])

  async function loadFlagged() {
    const token = getToken()
    if (!token) return
    try {
      const res = await fetch('/api/agent/farmers?status=flagged', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setFarmers(data.farmers || [])
    } catch {}
    setLoading(false)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Agent / Flagged</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-text-primary">Flagged Farmers</h1>
        <p className="text-sm text-text-muted mt-1">Farmers with data discrepancies that need investigation</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-5 h-5 animate-spin text-green-primary" /></div>
      ) : farmers.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No flagged farmers</p>
          <p className="text-xs mt-1">Flagged farmers will appear here when discrepancies are reported</p>
        </div>
      ) : (
        <div className="space-y-3">
          {farmers.map(f => {
            const isExpanded = expanded === f.id
            const details = f.flaggedDetail
            return (
              <div key={f.id} className="bg-dark-mid border border-risk-high/20 rounded-xl hover:border-risk-high/40 transition-colors">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <AlertTriangle className="w-4 h-4 text-risk-high shrink-0" />
                        <span className="text-sm font-semibold text-text-primary">{f.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium text-risk-high bg-risk-high/10">Flagged</span>
                        {f.assigned && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium text-sky-blue bg-sky-blue/10 flex items-center gap-0.5">
                            <UserCheck className="w-2.5 h-2.5" /> Assigned
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {f.county}</span>
                        <span className="flex items-center gap-1"><Sprout className="w-3 h-3" /> {f.crops?.[0] || 'N/A'} — {f.acreage} ac</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/agent/verify/${f.id}`}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-dark-base border border-border-subtle text-text-muted text-[10px] font-medium hover:text-text-primary transition-colors">
                        Review <ArrowUpRight className="w-3 h-3" />
                      </Link>
                      <button
                        onClick={() => setExpanded(isExpanded ? null : f.id)}
                        className="p-1.5 rounded-lg hover:bg-dark-base transition-colors"
                      >
                        <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', isExpanded && 'rotate-180')} />
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && details && (
                  <div className="border-t border-risk-high/20 px-4 py-3 space-y-3">
                    {details.discrepancies.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-risk-high font-medium mb-1.5">Discrepancies</p>
                        <ul className="space-y-1">
                          {details.discrepancies.map((d, i) => (
                            <li key={i} className="text-xs text-text-primary flex items-start gap-2">
                              <span className="text-risk-high mt-0.5">•</span>
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {details.notes && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-0.5">Agent Notes</p>
                        <p className="text-xs text-text-primary">{details.notes}</p>
                      </div>
                    )}
                    {details.visitedAt && (
                      <p className="text-[10px] text-text-muted">Reported: {new Date(details.visitedAt).toLocaleDateString()}</p>
                    )}
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

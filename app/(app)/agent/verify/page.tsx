'use client'

import Link from 'next/link'
import { ClipboardCheck, ArrowRight } from 'lucide-react'

export default function VerifyPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
        <ClipboardCheck className="w-3.5 h-3.5" />
        <span>Agent / Verify Farmers</span>
      </div>
      <h1 className="text-xl sm:text-2xl font-serif font-bold text-text-primary mb-3">Verify Farmers</h1>
      <p className="text-text-muted text-sm mb-6">Select a farmer to review and verify their information.</p>

      <div className="grid gap-3">
        {['F-001 Grace Wanjiku — Nakuru', 'F-005 Sarah Chebet — Nandi', 'F-006 James Ochieng — Siaya'].map((f, i) => (
          <Link key={i} href={`/agent/verify/F-00${i === 0 ? 1 : i === 1 ? 5 : 6}`}
            className="bg-dark-mid border border-border-subtle rounded-xl p-4 hover:border-green-primary/30 transition-colors flex items-center justify-between group"
          >
            <span className="text-sm text-text-primary">{f}</span>
            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-green-primary transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}

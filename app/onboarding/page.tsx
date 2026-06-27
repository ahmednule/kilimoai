'use client'

import { Construction, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-base p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 flex items-center justify-center mx-auto mb-4">
          <Construction className="w-8 h-8 text-yellow-400" />
        </div>
        <h1 className="text-xl font-serif font-bold text-text-primary mb-2">Coming Soon</h1>
        <p className="text-sm text-text-muted mb-6">
          The onboarding experience is being built. You&apos;ll be guided through setting up your profile, crops, and preferences step by step.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-primary text-text-primary text-sm font-semibold rounded-xl hover:bg-green-light transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

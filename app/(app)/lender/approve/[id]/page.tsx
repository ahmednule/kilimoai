'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import {
  ArrowLeft, CheckCircle2, XCircle, TrendingDown, Shield, AlertTriangle,
  DollarSign, Star, Clock, Phone, MapPin, Sprout, FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { RiskLevel, Language } from '@/lib/types'
import { RiskBadge } from '@/components/shared/RiskBadge'
import { getSession } from '@/lib/auth'

type View = 'LOADING' | 'UNAUTHORIZED' | 'DECISION'
type Decision = 'approve' | 'counter' | 'reject'

const MOCK_FARMERS: Record<string, { id: string; name: string; county: string; crop: string; acres: number; loanAmount: number; riskLevel: RiskLevel; riskScore: number; phone: string }> = {
  'f-1': { id: 'f-1', name: 'Samuel Mwangi', county: 'Nyeri', crop: 'coffee', acres: 3, loanAmount: 85000, riskLevel: 'LOW', riskScore: 18, phone: '+254 712 345 678' },
  'f-2': { id: 'f-2', name: 'Grace Akinyi', county: 'Kisumu', crop: 'rice', acres: 5, loanAmount: 120000, riskLevel: 'MEDIUM', riskScore: 45, phone: '+254 723 987 654' },
  'f-3': { id: 'f-3', name: 'Peter Kamau', county: 'Nakuru', crop: 'maize', acres: 10, loanAmount: 200000, riskLevel: 'HIGH', riskScore: 72, phone: '+254 734 561 234' },
}

const formatKES = (n: number) => `Ksh ${n.toLocaleString('en-KE')}`

export default function ApproveLoanPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params?.id as string
  const modeParam = searchParams?.get('mode') ?? 'approve'

  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState<View>('LOADING')
  const [language] = useState<Language>('en')
  const [farmer, setFarmer] = useState<typeof MOCK_FARMERS[string] | null>(null)

  const [decision, setDecision] = useState<Decision>(modeParam as Decision)
  const [submitted, setSubmitted] = useState(false)

  // Approve fields
  const [approvedAmount, setApprovedAmount] = useState(0)
  const [interestRate, setInterestRate] = useState(0)
  const [duration, setDuration] = useState(0)

  // Counter-offer fields
  const [counterAmount, setCounterAmount] = useState(0)
  const [counterRate, setCounterRate] = useState(0)
  const [counterDuration, setCounterDuration] = useState(0)
  const [counterReason, setCounterReason] = useState('')

  // Reject fields
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    const session = getSession()
    if (!session.isAuthenticated || session.role !== 'lender') {
      setView('UNAUTHORIZED')
    } else {
      const f = MOCK_FARMERS[id]
      setFarmer(f ?? null)
      if (f) {
        setApprovedAmount(f.loanAmount)
        setInterestRate(12)
        setDuration(12)
        setCounterAmount(Math.round(f.loanAmount * 0.7))
        setCounterRate(15)
        setCounterDuration(9)
      }
      setView('DECISION')
    }
    setMounted(true)
  }, [id, modeParam])

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => {
      router.push('/lender')
    }, 2000)
  }

  if (!mounted) return null
  if (view === 'LOADING') return <div className="flex h-full items-center justify-center"><p className="text-text-muted text-sm">Loading...</p></div>
  if (view === 'UNAUTHORIZED') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-text-muted/40 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">Lender Access Only</h2>
          <p className="text-sm text-text-muted">You must be logged in as a lender to act on applications.</p>
        </div>
      </div>
    )
  }

  if (!farmer) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-text-muted/40 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">Application Not Found</h2>
          <button onClick={() => router.push('/lender')} className="text-sm text-green-400 hover:underline mt-2">
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  if (submitted) {
    const messages: Record<Decision, string> = {
      approve: `Loan of ${formatKES(approvedAmount)} approved for ${farmer.name}`,
      counter: `Counter-offer of ${formatKES(counterAmount)} sent to ${farmer.name}`,
      reject: `Application for ${farmer.name} has been declined`,
    }
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center p-8 rounded-2xl bg-dark-mid border border-border-subtle max-w-md">
          <div className="w-14 h-14 rounded-full bg-green-primary/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">Decision Recorded</h2>
          <p className="text-sm text-text-muted mb-6">{messages[decision]}</p>
          <button
            onClick={() => router.push('/lender')}
            className="px-6 py-2.5 rounded-xl bg-green-primary text-green-100 text-sm font-medium hover:bg-green-light transition-colors"
          >
            Return to dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle">
        <button
          onClick={() => router.push(`/lender/farmer/${farmer.id}`)}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to profile
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Loan Decision</h1>
            <p className="text-sm text-text-muted mt-1">Review and act on {farmer.name}&apos;s application</p>
          </div>
          <RiskBadge level={farmer.riskLevel} />
        </div>
      </div>

      {/* Farmer summary */}
      <div className="px-6 py-4">
        <div className="bg-dark-mid border border-border-subtle rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-text-primary">{farmer.name}</p>
            <div className="flex items-center gap-3 text-[11px] text-text-muted">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{farmer.county}</span>
              <span className="flex items-center gap-1"><Sprout className="w-3 h-3" />{farmer.crop}</span>
              <span>{farmer.acres} acres</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{farmer.phone}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-text-muted uppercase">Requested</p>
            <p className="text-lg font-bold text-text-primary">{formatKES(farmer.loanAmount)}</p>
          </div>
        </div>
      </div>

      {/* Decision selector */}
      <div className="px-6 pb-2">
        <div className="flex gap-2">
          {([
            { key: 'approve' as Decision, label: 'Approve', icon: CheckCircle2, color: 'text-green-400', activeBg: 'bg-green-primary/10 border-green-primary/30' },
            { key: 'counter' as Decision, label: 'Counter-offer', icon: TrendingDown, color: 'text-yellow-400', activeBg: 'bg-yellow-400/10 border-yellow-400/30' },
            { key: 'reject' as Decision, label: 'Reject', icon: XCircle, color: 'text-red-400', activeBg: 'bg-red-400/10 border-red-400/30' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setDecision(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all border',
                decision === tab.key
                  ? `${tab.activeBg} ${tab.color}`
                  : 'border-transparent text-text-muted hover:text-text-primary hover:bg-dark-mid'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Decision form */}
      <div className="px-6 py-4">
        <div className="bg-dark-mid border border-border-subtle rounded-xl p-6 space-y-5">

          {decision === 'approve' && (
            <>
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Approve Loan
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-text-muted uppercase block mb-1.5">Loan Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input
                      type="number"
                      value={approvedAmount}
                      onChange={e => setApprovedAmount(Number(e.target.value))}
                      className="w-full bg-dark-base border border-border-subtle rounded-lg pl-8 pr-3 py-2.5 text-sm text-text-primary outline-none focus:border-green-primary/50"
                    />
                  </div>
                  <p className="text-[10px] text-text-muted mt-1">Requested: {formatKES(farmer.loanAmount)}</p>
                </div>
                <div>
                  <label className="text-[10px] text-text-muted uppercase block mb-1.5">Interest Rate (%)</label>
                  <input
                    type="number"
                    value={interestRate}
                    onChange={e => setInterestRate(Number(e.target.value))}
                    className="w-full bg-dark-base border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-green-primary/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted uppercase block mb-1.5">Duration (months)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="w-full bg-dark-base border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-green-primary/50"
                  />
                </div>
              </div>

              {/* Loan summary */}
              <div className="bg-dark-base rounded-lg p-3 border border-border-subtle grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-[10px] text-text-muted">Monthly payment</p>
                  <p className="text-sm font-bold text-text-primary">
                    {formatKES(duration > 0 ? Math.round((approvedAmount * (1 + interestRate / 100)) / duration) : 0)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted">Total interest</p>
                  <p className="text-sm font-bold text-text-primary">
                    {formatKES(Math.round(approvedAmount * (interestRate / 100)))}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted">Total repayment</p>
                  <p className="text-sm font-bold text-text-primary">
                    {formatKES(Math.round(approvedAmount * (1 + interestRate / 100)))}
                  </p>
                </div>
              </div>
            </>
          )}

          {decision === 'counter' && (
            <>
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-yellow-400" />
                Counter-offer
              </h3>
              <p className="text-[12px] text-text-muted">Offer adjusted terms below what the farmer requested</p>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-text-muted uppercase block mb-1.5">Offered Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input
                      type="number"
                      value={counterAmount}
                      onChange={e => setCounterAmount(Number(e.target.value))}
                      className="w-full bg-dark-base border border-border-subtle rounded-lg pl-8 pr-3 py-2.5 text-sm text-text-primary outline-none focus:border-yellow-400/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-text-muted uppercase block mb-1.5">Interest Rate (%)</label>
                  <input
                    type="number"
                    value={counterRate}
                    onChange={e => setCounterRate(Number(e.target.value))}
                    className="w-full bg-dark-base border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-yellow-400/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted uppercase block mb-1.5">Duration (months)</label>
                  <input
                    type="number"
                    value={counterDuration}
                    onChange={e => setCounterDuration(Number(e.target.value))}
                    className="w-full bg-dark-base border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-yellow-400/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-text-muted uppercase block mb-1.5">Reason for adjustment</label>
                <textarea
                  value={counterReason}
                  onChange={e => setCounterReason(e.target.value)}
                  placeholder="Explain why you're offering different terms..."
                  rows={3}
                  className="w-full bg-dark-base border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/40 outline-none focus:border-yellow-400/50 resize-none"
                />
              </div>
            </>
          )}

          {decision === 'reject' && (
            <>
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400" />
                Reject Application
              </h3>
              <p className="text-[12px] text-text-muted">
                This will decline the loan application. The farmer will be notified of your decision.
              </p>

              <div>
                <label className="text-[10px] text-text-muted uppercase block mb-1.5">Reason for rejection</label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Provide a reason that will help the farmer understand..."
                  rows={3}
                  className="w-full bg-dark-base border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/40 outline-none focus:border-red-400/50 resize-none"
                />
              </div>

              <div className="space-y-2">
                <p className="text-[11px] text-text-muted">Common reasons:</p>
                {[
                  'Risk score too high for requested amount',
                  'Insufficient credit history',
                  'Crop volatility in this county is too high',
                  'Requested amount exceeds recommended maximum',
                ].map(r => (
                  <button
                    key={r}
                    onClick={() => setRejectReason(r)}
                    className={cn(
                      'block w-full text-left text-[11px] px-3 py-2 rounded-lg border transition-all',
                      rejectReason === r
                        ? 'border-red-400/40 bg-red-400/10 text-red-400'
                        : 'border-border-subtle text-text-muted hover:border-red-400/20 hover:text-text-primary'
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Submit */}
          <div className="pt-4 border-t border-border-subtle">
            <button
              onClick={handleSubmit}
              className={cn(
                'w-full py-3 rounded-xl text-sm font-semibold transition-colors',
                decision === 'approve' ? 'bg-green-primary text-green-100 hover:bg-green-light' :
                decision === 'counter' ? 'bg-yellow-400 text-dark-base hover:bg-yellow-500' :
                'bg-red-500 text-white hover:bg-red-600'
              )}
            >
              {decision === 'approve' ? 'Confirm Approval' :
               decision === 'counter' ? 'Send Counter-offer' :
               'Confirm Rejection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

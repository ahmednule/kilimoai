'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Building2, ArrowUpRight, ChartColumn, CalendarDays, ShieldAlert,
  ChevronDown, Banknote, Leaf, Droplets, Sprout,
  Filter, Search, Star, Info, ExternalLink, Phone, CheckCircle2,
  Smartphone, Building, X, Send, Landmark,
} from 'lucide-react'
import { FarmerProfile, Language, RiskLevel } from '@/lib/types'
import { cn } from '@/lib/utils'
import { getAssessments, StoredAssessment } from '@/lib/assessments'

type LoanBucket = {
  id: string
  name: { en: string; sw: string }
  provider: { en: string; sw: string }
  minAmount: number
  maxAmount: number
  interest: string
  duration: { en: string; sw: string }
  collateral: { en: string; sw: string }
  features: { en: string[]; sw: string[] }
  riskReq: 'LOW' | 'MEDIUM' | 'HIGH'
  color: string
  bg: string
  border: string
}

const LOAN_BUCKETS: LoanBucket[] = [
  { id: 'kilimo-starter', name: { en: 'KilimoBoost Starter', sw: 'KilimoBoost ya Kuanzia' }, provider: { en: 'Equity Bank', sw: 'Equity Bank' }, minAmount: 10000, maxAmount: 50000, interest: '9%', duration: { en: '3 – 12 months', sw: 'Miezi 3 – 12' }, collateral: { en: 'None — crop as security', sw: 'Hakuna — zao kama dhamana' }, features: { en: ['No guarantor required', 'Flexible repayment after harvest', 'Mobile money disbursement'], sw: ['Hakuna mdhamini anayehitajika', 'Malipo rahisi baada ya mavuno', 'Malipo kupitia simu'] }, riskReq: 'LOW', color: 'text-green-400', bg: 'bg-green-primary/10', border: 'border-green-primary/20' },
  { id: 'panda', name: { en: 'Panda Loan', sw: 'Mkopo wa Panda' }, provider: { en: 'Grounded Homes', sw: 'Grounded Homes' }, minAmount: 20000, maxAmount: 200000, interest: '6%', duration: { en: '6 – 18 months', sw: 'Miezi 6 – 18' }, collateral: { en: 'Write-off for proven losses', sw: 'Kusamehewa kwa hasara zilizo dhahiri' }, features: { en: ['Group liability', 'Compulsory crop insurance', 'Technical support included'], sw: ['Dhamana ya kikundi', 'Bima ya mazao ya lazima', 'Msaada wa kiufundi umejumuishwa'] }, riskReq: 'LOW', color: 'text-green-400', bg: 'bg-green-primary/10', border: 'border-green-primary/20' },
  { id: 'kcb-mobigrow', name: { en: 'KCB MobiGrow', sw: 'KCB MobiGrow' }, provider: { en: 'KCB Bank', sw: 'KCB Bank' }, minAmount: 50000, maxAmount: 1000000, interest: '8.5%', duration: { en: '6 – 24 months', sw: 'Miezi 6 – 24' }, collateral: { en: 'Mobile-based credit scoring', sw: 'Ukadirishaji wa mkopo kwa simu' }, features: { en: ['Farm size-based limit', 'Instant M-Pesa disbursement', 'Weather-index insurance'], sw: ['Kiwango kinategemea ukubwa wa shamba', 'Malipo ya papo kwa M-Pesa', 'Bima ya hali ya hewa'] }, riskReq: 'MEDIUM', color: 'text-yellow-400', bg: 'bg-yellow-primary/10', border: 'border-yellow-primary/20' },
  { id: 'unga-millers', name: { en: 'Unga Millers Credit', sw: 'Unga Millers Credit' }, provider: { en: 'AFRACA / Co-op', sw: 'AFRACA / Ushirika' }, minAmount: 30000, maxAmount: 300000, interest: '7%', duration: { en: '12 – 36 months', sw: 'Miezi 12 – 36' }, collateral: { en: 'Off-taker agreement', sw: 'Mkataba wa mnunuzi' }, features: { en: ['Guaranteed buyer', 'Co-op rate discount', 'Inputs bundled'], sw: ['Mnunuzi wa uhakika', 'Punguzo la kiwango cha ushirika', 'Pembejeo zimejumuishwa'] }, riskReq: 'MEDIUM', color: 'text-yellow-400', bg: 'bg-yellow-primary/10', border: 'border-yellow-primary/20' },
  { id: 'sacco', name: { en: 'Sacco Agriculture Loan', sw: 'Mkopo wa Kilimo wa Sacco' }, provider: { en: 'Various SACCOs', sw: 'SACCO mbalimbali' }, minAmount: null, maxAmount: null, interest: '5 – 10%', duration: { en: '6 – 24 months', sw: 'Miezi 6 – 24' }, collateral: { en: 'Savings × multiplier', sw: 'Akiba × kizidishi' }, features: { en: ['Low entry barrier', 'Member dividends', 'Community-based'], sw: ['Kiwango cha kuingia ni kidogo', 'Gawio la wanachama', 'Msingi wa jamii'] }, riskReq: 'MEDIUM', color: 'text-yellow-400', bg: 'bg-yellow-primary/10', border: 'border-yellow-primary/20', minAmount: 0, maxAmount: Infinity },
  { id: 'rainfall-harvest', name: { en: 'Rainfall Harvest Credit', sw: 'Mkopo wa Mavuno ya Mvua' }, provider: { en: 'Insurance-Linked', sw: 'Unganisho na Bima' }, minAmount: 50000, maxAmount: 500000, interest: '6 – 8%', duration: { en: '12 – 24 months', sw: 'Miezi 12 – 24' }, collateral: { en: 'Weather-index backed', sw: 'Inayoungwa mkono na faharisi ya hali ya hewa' }, features: { en: ['Parametric insurance included', 'Auto-payout on drought', 'Lower rate for good risk score'], sw: ['Bima ya kigezo imejumuishwa', 'Malipo ya moja kwa moja kwa ukame', 'Kiwango cha chini kwa alama nzuri'] }, riskReq: 'LOW', color: 'text-green-400', bg: 'bg-green-primary/10', border: 'border-green-primary/20' },
]

interface ApplicationData {
  fullName: string
  phone: string
  amount: number
  paymentMethod: 'mpesa' | 'bank'
  bankName?: string
  bankAccount?: string
  productId: string
}

type RiskFilter = 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'

export default function LoansPage() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null)
  const [language, setLanguage] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)
  const [filter, setFilter] = useState<RiskFilter>('ALL')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [applyModal, setApplyModal] = useState<LoanBucket | null>(null)
  const [application, setApplication] = useState<ApplicationData>({
    fullName: '',
    phone: '',
    amount: 0,
    paymentMethod: 'mpesa',
    bankName: '',
    bankAccount: '',
    productId: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [recommendedMaxLoan, setRecommendedMaxLoan] = useState<number | null>(null)
  const [recommendedLoanId, setRecommendedLoanId] = useState<string | null>(null)

  useEffect(() => {
    const savedLang = localStorage.getItem('kilimo-language') as Language | null
    const savedProfile = localStorage.getItem('kilimo-profile')

    if (savedLang) setLanguage(savedLang)
    if (savedProfile) {
      try { setProfile(JSON.parse(savedProfile)) }
      catch { /* corrupt */ }
    }

    const assessments = getAssessments()
    if (assessments.length > 0) {
      const latest = assessments[0]
      setRecommendedMaxLoan(latest.scenarios.recommendedMaxLoan)

      const recommended = findMatchingLoan(latest.scenarios.recommendedMaxLoan)
      if (recommended) setRecommendedLoanId(recommended.id)
    }

    const params = new URLSearchParams(window.location.search)
    const loanId = params.get('loan')
    if (loanId) setRecommendedLoanId(loanId)

    setMounted(true)
  }, [])

  // ── Dynamic risk computation from profile ──
  const computedRisk = useMemo<RiskLevel>(() => {
    if (!profile) return 'UNKNOWN'
    const totalAcres = profile.crops.reduce((sum, c) => sum + c.acres, 0)
    const rentedShare = profile.crops.filter(c => c.isRented).reduce((sum, c) => sum + c.acres, 0) / Math.max(totalAcres, 1)
    const cropCount = profile.crops.length

    // High risk: tiny farm, heavily rented, single crop concentration
    if (totalAcres <= 0.5 || rentedShare > 0.7) return 'HIGH'
    if (totalAcres <= 2 && rentedShare > 0.5 && cropCount <= 1) return 'HIGH'

    // Medium risk: moderate farm, some diversification
    if (totalAcres <= 3 || rentedShare > 0.3 || cropCount <= 1) return 'MEDIUM'

    // Low risk: diversified, own land
    return 'LOW'
  }, [profile])

  const totalAcres = useMemo(() => {
    if (!profile) return 0
    return profile.crops.reduce((sum, c) => sum + c.acres, 0)
  }, [profile])

  const cropSummary = useMemo(() => {
    if (!profile) return ''
    return profile.crops.map(c => c.crop).join(', ')
  }, [profile])

  // Auto-set filter to match computed risk
  useEffect(() => {
    if (computedRisk !== 'UNKNOWN' && filter === 'ALL' && recommendedMaxLoan === null) {
      setFilter(computedRisk as RiskFilter)
    }
  }, [computedRisk, recommendedMaxLoan])

  if (!mounted) return null

  const l = (val: { en: string; sw: string }) => val[language]

  const getMatchingLoanIds = (loan: LoanBucket): 'exact' | 'near' | 'none' => {
    if (recommendedMaxLoan === null) return 'none'
    if (recommendedMaxLoan >= loan.minAmount && recommendedMaxLoan <= loan.maxAmount) return 'exact'
    if (Math.abs(recommendedMaxLoan - loan.minAmount) < loan.minAmount * 0.2 ||
        Math.abs(recommendedMaxLoan - loan.maxAmount) < loan.maxAmount * 0.2) return 'near'
    return 'none'
  }

  const filtered = LOAN_BUCKETS.filter(l => {
    const riskOk = filter === 'ALL' || l.riskReq === filter
    const searchLower = search.toLowerCase()
    const nameOk = !search || l.name.en.toLowerCase().includes(searchLower) || l.name.sw.toLowerCase().includes(searchLower)
    return riskOk && nameOk
  })

  const handleApply = (loan: LoanBucket) => {
    setApplyModal(loan)
    setApplication({
      fullName: profile?.name ?? '',
      phone: '',
      amount: loan.minAmount,
      paymentMethod: 'mpesa',
      bankName: '',
      bankAccount: '',
      productId: loan.id,
    })
  }

  const handleSubmitApplication = () => {
    const apps = JSON.parse(localStorage.getItem('kilimo-loan-applications') || '[]')
    apps.push({
      ...application,
      id: `app-${Date.now()}`,
      date: new Date().toISOString(),
      productId: applyModal?.id,
      productName: applyModal ? applyModal.name.en : '',
    })
    localStorage.setItem('kilimo-loan-applications', JSON.stringify(apps))
    setSubmitted(true)
    setTimeout(() => {
      setApplyModal(null)
      setSubmitted(false)
    }, 2000)
  }

  return (
    <div className="p-8 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <p className="text-text-muted text-xs uppercase tracking-widest mb-1">finance hub</p>
        <h1 className="text-2xl font-serif font-semibold text-text-primary">
          {language === 'sw' ? 'Bidhaa za Mikopo' : 'Loan Products'}
        </h1>
        <p className="text-sm text-text-muted mt-1">
          {language === 'sw'
            ? 'Linganisha chaguo za mikopo kulingana na wasifu wako wa kilimo'
            : 'Compare loan options tailored to your farm profile'}
        </p>
      </div>

      {/* Stats bar */}
      {profile && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { label: { en: 'Farm size', sw: 'Ukubwa wa shamba' }, value: `${totalAcres} acres` },
            { label: { en: 'Crops', sw: 'Mazao' }, value: cropSummary || '—' },
            { label: { en: 'County', sw: 'Kaunti' }, value: profile.county },
            { label: { en: 'Risk Level', sw: 'Kiwango cha Hatari' }, value: computedRisk === 'UNKNOWN' ? '—' : (language === 'sw'
              ? computedRisk === 'LOW' ? 'Hatari ndogo' : computedRisk === 'MEDIUM' ? 'Hatari ya wastani' : 'Hatari kubwa'
              : computedRisk) },
          ].map((stat, i) => (
            <div key={i} className="bg-dark-mid border border-border-subtle rounded-lg px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-text-muted">
                {stat.label[language]}
              </p>
              <p className="text-sm font-semibold text-text-primary">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
      {recommendedMaxLoan && (
        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-amber-400 font-medium">
            {language === 'sw' ? 'Upeo unaopendekezwa: KES ' : 'Recommended limit: KES '}
            {recommendedMaxLoan.toLocaleString()}
          </span>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={language === 'sw' ? 'Tafuta kwa jina...' : 'Search by name...'}
            className="w-full pl-9 pr-4 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green-primary/50 transition-colors"
          />
        </div>
        {(['ALL', 'LOW', 'MEDIUM'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              filter === f
                ? 'bg-green-primary/15 text-green-400 border border-green-primary/30'
                : 'bg-dark-base border border-border-subtle text-text-muted hover:text-text-primary'
            )}
          >
            {f === 'ALL' ? (language === 'sw' ? 'Zote' : 'All') : f}
          </button>
        ))}
      </div>

      {/* Loan cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(loan => {
          const isExpanded = expanded === loan.id
          const riskLabel = loan.riskReq === 'LOW' ? (language === 'sw' ? 'Hatari ndogo' : 'Low risk') :
                            loan.riskReq === 'MEDIUM' ? (language === 'sw' ? 'Hatari ya wastani' : 'Medium risk') :
                            (language === 'sw' ? 'Hatari kubwa' : 'High risk')
          const match = getMatchingLoanIds(loan)
          const isMatching = match === 'exact'
          const isNear = match === 'near'
          const isRecommended = loan.id === recommendedLoanId

          return (
            <div
              key={loan.id}
              className={cn(
                'bg-dark-mid border rounded-xl p-5 transition-all duration-200',
                isRecommended
                  ? 'border-amber-500/50 shadow-amber-500/5'
                  : 'border-border-subtle',
                'hover:border-green-primary/30'
              )}
            >
              {isRecommended && (
                <div className="mb-3 -mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-medium text-amber-400">
                    <Star className="w-2.5 h-2.5 fill-amber-400" />
                    {language === 'sw' ? 'Imependekezwa' : 'Recommended'}
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2 rounded-lg', loan.bg)}>
                      <Building2 className={cn('w-5 h-5', loan.color)} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-text-primary">{l(loan.name)}</h3>
                      <p className="text-xs text-text-muted">{l(loan.provider)}</p>
                    </div>
                  </div>
                </div>
                <span className={cn(
                  'text-[10px] font-medium uppercase px-2 py-0.5 rounded-full',
                  loan.riskReq === 'LOW' ? 'bg-green-primary/10 text-green-400' : 'bg-yellow-primary/10 text-yellow-400'
                )}>
                  {riskLabel}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="bg-dark-base rounded-lg p-2">
                  <p className="text-sm font-bold text-text-primary">
                    KES {loan.minAmount.toLocaleString()} – {loan.maxAmount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {language === 'sw' ? 'Kiwango' : 'Amount'}
                  </p>
                </div>
                <div className="bg-dark-base rounded-lg p-2">
                  <p className="text-base font-bold text-text-primary">{loan.interest}</p>
                  <p className="text-[10px] text-text-muted">APR</p>
                </div>
                <div className="bg-dark-base rounded-lg p-2">
                  <p className="text-xs font-bold text-text-primary">{l(loan.duration)}</p>
                  <p className="text-[10px] text-text-muted">
                    {language === 'sw' ? 'Muda' : 'Duration'}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                {isMatching && (
                  <span className="text-[10px] text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {language === 'sw' ? 'Inalingana' : 'Matches'}
                  </span>
                )}
                {isNear && (
                  <span className="text-[10px] text-yellow-400 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {language === 'sw' ? 'Karibu' : 'Close'}
                  </span>
                )}
              </div>

              <button
                onClick={() => setExpanded(isExpanded ? null : loan.id)}
                className="mt-2 text-xs text-green-400 font-medium flex items-center gap-1 hover:text-green-300 transition-colors"
              >
                {isExpanded ? (language === 'sw' ? 'Funga maelezo' : 'Hide details') : (language === 'sw' ? 'Ona maelezo' : 'View details')}
                <ChevronDown className={cn('w-3 h-3 transition-transform', isExpanded && 'rotate-180')} />
              </button>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-border-subtle space-y-3">
                  <div className="flex items-start gap-2">
                    <ChartColumn className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-text-primary">{language === 'sw' ? 'Dhamana' : 'Collateral'}</p>
                      <p className="text-xs text-text-muted">{l(loan.collateral)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-text-primary mb-1.5">
                      {language === 'sw' ? 'Sifa' : 'Features'}
                    </p>
                    {loan.features[language].map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-text-muted mb-1">
                        <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleApply(loan)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-primary/10 border border-green-primary/20 text-xs text-green-400 font-medium hover:bg-green-primary/20 transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    {language === 'sw' ? 'Tuma maombi' : 'Apply now'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Apply Modal */}
      {applyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-mid border border-border-subtle rounded-2xl w-full max-w-md p-6 mx-4 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                {language === 'sw' ? 'Omba Mkopo' : 'Apply for Loan'}
              </h2>
              <button
                onClick={() => { setApplyModal(null); setSubmitted(false) }}
                className="p-1 hover:bg-dark-base rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-8 space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-primary/10 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <p className="font-semibold text-green-400">
                  {language === 'sw' ? 'Ombi limewasilishwa!' : 'Application submitted!'}
                </p>
                <p className="text-xs text-text-muted">
                  {language === 'sw' ? 'Utapata ufuatiliaji kupitia SMS' : 'You will receive follow-up via SMS'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-text-muted mb-2">
                  {language === 'sw'
                    ? `Unaomba ${l(applyModal.name)} - KES ${applyModal.minAmount.toLocaleString()}`
                    : `Applying for ${l(applyModal.name)} - KES ${application.amount.toLocaleString()}`}
                </div>

                <div>
                  <label className="text-xs font-medium text-text-muted">{language === 'sw' ? 'Jina Kamili' : 'Full Name'}</label>
                  <input
                    type="text"
                    value={application.fullName}
                    onChange={e => setApplication({ ...application, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:border-green-primary/50 mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-text-muted">{language === 'sw' ? 'Nambari ya Simu' : 'Phone Number'}</label>
                  <input
                    type="tel"
                    value={application.phone}
                    onChange={e => setApplication({ ...application, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:border-green-primary/50 mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-text-muted">{language === 'sw' ? 'Kiasi' : 'Amount (KES)'}</label>
                  <input
                    type="number"
                    value={application.amount}
                    onChange={e => setApplication({ ...application, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:border-green-primary/50 mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-text-muted">{language === 'sw' ? 'Njia ya Malipo' : 'Payment Method'}</label>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => setApplication({ ...application, paymentMethod: 'mpesa' })}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                        application.paymentMethod === 'mpesa'
                          ? 'bg-green-primary/10 border-green-primary/30 text-green-400'
                          : 'bg-dark-base border-border-subtle text-text-muted'
                      )}
                    >
                      <Smartphone className="w-4 h-4" /> M-Pesa
                    </button>
                    <button
                      onClick={() => setApplication({ ...application, paymentMethod: 'bank' })}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                        application.paymentMethod === 'bank'
                          ? 'bg-green-primary/10 border-green-primary/30 text-green-400'
                          : 'bg-dark-base border-border-subtle text-text-muted'
                      )}
                    >
                      <Building className="w-4 h-4" /> Bank
                    </button>
                  </div>
                </div>

                {application.paymentMethod === 'bank' && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-text-muted">{language === 'sw' ? 'Jina la Benki' : 'Bank Name'}</label>
                      <input
                        type="text"
                        value={application.bankName}
                        onChange={e => setApplication({ ...application, bankName: e.target.value })}
                        className="w-full px-3 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:border-green-primary/50 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-muted">{language === 'sw' ? 'Nambari ya Akaunti' : 'Account Number'}</label>
                      <input
                        type="text"
                        value={application.bankAccount}
                        onChange={e => setApplication({ ...application, bankAccount: e.target.value })}
                        className="w-full px-3 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:border-green-primary/50 mt-1"
                      />
                    </div>
                  </>
                )}

                <button
                  onClick={handleSubmitApplication}
                  disabled={!application.phone || !application.amount}
                  className="w-full py-2.5 rounded-lg bg-green-primary text-dark-base font-semibold text-sm hover:bg-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-4"
                >
                  {language === 'sw' ? 'Tuma Ombi' : 'Submit Application'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Helper function */}
      {filtered.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          <Landmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{language === 'sw' ? 'Hakuna mikopo inayolingana' : 'No matching loans'}</p>
        </div>
      )}
    </div>
  )
}

// Finds the best matching loan product for a recommendedMaxLoan
function findMatchingLoan(amount: number): LoanBucket | null {
  for (const loan of LOAN_BUCKETS) {
    if (loan.minAmount <= amount && amount <= loan.maxAmount) return loan
  }
  return null
}

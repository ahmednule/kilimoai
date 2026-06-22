'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Users, TrendingUp, UserPlus, Sparkle, ChevronDown, Wallet, Shield, UsersRound, Coins,
  Search, Filter, MapPin, Clock, CheckCircle2, XCircle, HourglassIcon,
  Send, Plus, ArrowUpRight, Phone, Building2, X, Landmark, Star,
  Smartphone, Lock, Loader2, Upload, Banknote, Calendar, BadgeCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { KENYAN_COUNTIES } from '@/lib/constants'
import { ChamaGroup, ChamaMember, ChamaContribution, MembershipStatus, FarmerProfile, Language } from '@/lib/types'

type View = 'LOADING' | 'UNAUTHENTICATED' | 'BROWSE' | 'PENDING' | 'MEMBER'

type ChamaLoanBucket = {
  id: string
  name: { en: string; sw: string }
  minAmount: number
  maxAmount: number
  interest: string
  duration: { en: string; sw: string }
  color: string
  bg: string
  border: string
  features: { en: string[]; sw: string[] }
}

const CHAMA_LOAN_BUCKETS: ChamaLoanBucket[] = [
  {
    id: 'chama-micro',
    name: { en: 'Chama Micro Credit', sw: 'Mkopo Mdogo wa Chama' },
    minAmount: 5000, maxAmount: 100000,
    interest: '4.5%',
    duration: { en: '3 – 6 months', sw: 'Miezi 3 – 6' },
    color: 'text-green-400', bg: 'bg-green-primary/10', border: 'border-green-primary/20',
    features: {
      en: ['Low group interest rate', 'Quick M-Pesa disbursement', 'No individual collateral'],
      sw: ['Riba ndogo ya kikundi', 'Malipo ya haraka kwa M-Pesa', 'Hakuna dhamana ya mtu binafsi'],
    },
  },
  {
    id: 'chama-expansion',
    name: { en: 'Chama Expansion Loan', sw: 'Mkopo wa Upanuzi wa Chama' },
    minAmount: 100000, maxAmount: 2000000,
    interest: '6%',
    duration: { en: '12 – 24 months', sw: 'Miezi 12 – 24' },
    color: 'text-yellow-400', bg: 'bg-yellow-primary/10', border: 'border-yellow-primary/20',
    features: {
      en: ['Group guarantee accepted', 'Land title optional', 'Flexible seasonal repayment'],
      sw: ['Dhamana ya kikundi inakubalika', 'Hati miliki si lazima', 'Malipo rahisi ya msimu'],
    },
  },
]

const MOCK_CHAMAS: ChamaGroup[] = [
  { id: 'ch-1', name: 'Umoja Farmers Group', county: 'Nakuru', description: 'A 25-member group focused on maize, beans, and dairy farming. Weekly contributions fund equipment and inputs.', registrationFee: 500, memberCount: 25, totalSavings: 480000, createdAt: '2025-01-15' },
  { id: 'ch-2', name: 'Mavuno Bora SACCO', county: 'Nyeri', description: 'Tea and coffee growers pooling resources for processing equipment and fertilizer bulk purchasing.', registrationFee: 1000, memberCount: 40, totalSavings: 1250000, createdAt: '2024-06-01' },
  { id: 'ch-3', name: 'Tumaini Women Group', county: 'Nakuru', description: 'Women-led chama empowering smallholder vegetable farmers through shared irrigation and market access.', registrationFee: 200, memberCount: 18, totalSavings: 250000, createdAt: '2025-03-10' },
  { id: 'ch-4', name: 'Pwani Coconut Co-op', county: 'Mombasa', description: 'Coastal co-op focused on coconut, mango, and cashew value addition with shared processing facility.', registrationFee: 800, memberCount: 32, totalSavings: 670000, createdAt: '2024-09-20' },
  { id: 'ch-5', name: 'Kilimo Chap Chap', county: 'Kiambu', description: 'Fast-growing group of urban-to-rural farmers leveraging tech for precision agriculture near Nairobi.', registrationFee: 1500, memberCount: 15, totalSavings: 320000, createdAt: '2025-06-01' },
  { id: 'ch-6', name: 'Maasai Livestock Trust', county: 'Kajiado', description: 'Pastoralist chama managing communal grazing lands and livestock marketing cooperatively.', registrationFee: 300, memberCount: 50, totalSavings: 890000, createdAt: '2024-03-15' },
]

const MOCK_MY_CHAMAS: ChamaMember[] = [
  { id: 'mem-1', userId: 'user-1', chamaId: 'ch-1', chamaName: 'Umoja Farmers Group', status: 'ACTIVE', totalContributed: 4500, joinedAt: '2025-06-01' },
]

const MOCK_PENDING_MEMBERSHIP: ChamaMember = {
  id: 'mem-99', userId: 'user-1', chamaId: 'ch-3', chamaName: 'Tumaini Women Group', status: 'PENDING', totalContributed: 0, joinedAt: '2025-06-20',
}

const MOCK_CONTRIBUTIONS: ChamaContribution[] = [
  { id: 'con-1', chamaId: 'ch-1', amount: 500, date: '2025-06-01T10:00:00Z', method: 'MPESA', mpesaRef: 'QE8X2K9ABC' },
  { id: 'con-2', chamaId: 'ch-1', amount: 500, date: '2025-06-08T11:30:00Z', method: 'MPESA', mpesaRef: 'RF7Y1M5DEF' },
  { id: 'con-3', chamaId: 'ch-1', amount: 1000, date: '2025-06-15T09:15:00Z', method: 'MPESA', mpesaRef: 'PG3N8W7GHI' },
  { id: 'con-4', chamaId: 'ch-1', amount: 500, date: '2025-06-17T14:45:00Z', method: 'CASH', mpesaRef: undefined },
  { id: 'con-5', chamaId: 'ch-1', amount: 2000, date: '2025-06-20T08:00:00Z', method: 'MPESA', mpesaRef: 'LM6B4T2JKL' },
]

const MOCK_MY_MEMBERS: ChamaMember[] = [
  { id: 'mem-1', userId: 'user-1', chamaId: 'ch-1', chamaName: 'Umoja Farmers Group', status: 'ACTIVE', totalContributed: 4500, joinedAt: '2025-06-01' },
  { id: 'mem-2', userId: 'user-2', chamaId: 'ch-1', chamaName: 'Umoja Farmers Group', status: 'ACTIVE', totalContributed: 8200, joinedAt: '2025-05-15' },
  { id: 'mem-3', userId: 'user-3', chamaId: 'ch-1', chamaName: 'Umoja Farmers Group', status: 'ACTIVE', totalContributed: 3100, joinedAt: '2025-06-10' },
  { id: 'mem-4', userId: 'user-4', chamaId: 'ch-1', chamaName: 'Umoja Farmers Group', status: 'ACTIVE', totalContributed: 12000, joinedAt: '2025-04-20' },
  { id: 'mem-5', userId: 'user-5', chamaId: 'ch-1', chamaName: 'Umoja Farmers Group', status: 'PENDING', totalContributed: 0, joinedAt: '2025-06-19' },
  { id: 'mem-6', userId: 'user-6', chamaId: 'ch-1', chamaName: 'Umoja Farmers Group', status: 'REJECTED', totalContributed: 0, joinedAt: '2025-06-18' },
]

interface ChamaLoanApplication {
  chamaId: string
  loanProductId: string
  amount: number
  purpose: string
}

export default function ChamaPage() {
  const [language, setLanguage] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<FarmerProfile | null>(null)
  const [view, setView] = useState<View>('LOADING')

  // BROWSE state
  const [countyFilter, setCountyFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [joinedId, setJoinedId] = useState<string | null>(null)

  // Create chama modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', county: '', description: '', fee: 500 })
  const [createSubmitted, setCreateSubmitted] = useState(false)
  const [hasProof, setHasProof] = useState(false)

  // M-Pesa contribute
  const [showContributeModal, setShowContributeModal] = useState(false)
  const [contributeAmount, setContributeAmount] = useState(500)
  const [mpesaPin, setMpesaPin] = useState('')
  const [mpesaStep, setMpesaStep] = useState<'amount' | 'pin' | 'confirming' | 'done'>('amount')
  const [contributions, setContributions] = useState<ChamaContribution[]>(MOCK_CONTRIBUTIONS)

  // Loan application
  const [showLoanModal, setShowLoanModal] = useState(false)
  const [loanApp, setLoanApp] = useState<ChamaLoanApplication>({ chamaId: '', loanProductId: '', amount: 0, purpose: '' })
  const [loanSubmitted, setLoanSubmitted] = useState(false)
  const [expandedLoan, setExpandedLoan] = useState<string | null>(null)

  const myChama = MOCK_MY_CHAMAS[0]

  useEffect(() => {
    const savedLang = localStorage.getItem('kilimo-language') as Language | null
    if (savedLang) setLanguage(savedLang)

    const savedProfile = localStorage.getItem('kilimo-profile')
    if (savedProfile) {
      try { setProfile(JSON.parse(savedProfile)) }
      catch { /* corrupt */ }
    }

    // Simulate membership check — replace with API call
    setTimeout(() => {
      if (!savedProfile) {
        setView('UNAUTHENTICATED')
      } else if (MOCK_PENDING_MEMBERSHIP.status === 'PENDING') {
        setView('PENDING')
      } else if (MOCK_MY_CHAMAS.length > 0 && MOCK_MY_CHAMAS[0].status === 'ACTIVE') {
        setView('MEMBER')
      } else {
        setView('BROWSE')
      }
    }, 600)

    setMounted(true)
  }, [])

  if (!mounted) return null

  const l = (val: { en: string; sw: string }) => val[language]

  const filteredChamas = MOCK_CHAMAS.filter(c => {
    if (countyFilter !== 'ALL' && c.county !== countyFilter) return false
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const myActiveChama = MOCK_CHAMAS.find(c => c.id === myChama?.chamaId)

  const totalMyContributions = contributions.reduce((sum, c) => sum + c.amount, 0)

  const handleJoin = (chamaId: string) => {
    setJoinedId(chamaId)
    // Simulate join — replaces with API call
    setTimeout(() => setJoinedId(null), 1500)
  }

  const handleCreateSubmit = () => {
    setCreateSubmitted(true)
    setTimeout(() => {
      setShowCreateModal(false)
      setCreateSubmitted(false)
      setCreateForm({ name: '', county: '', description: '', fee: 500 })
    }, 2000)
  }

  const handleMpesaContribute = () => {
    if (mpesaStep === 'amount') {
      setMpesaStep('pin')
    } else if (mpesaStep === 'pin') {
      setMpesaStep('confirming')
      setTimeout(() => {
        const newContribution: ChamaContribution = {
          id: `con-${Date.now()}`,
          chamaId: myChama.chamaId,
          amount: contributeAmount,
          date: new Date().toISOString(),
          method: 'MPESA',
          mpesaRef: `QE${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        }
        setContributions(prev => [newContribution, ...prev])
        setMpesaStep('done')
      }, 2000)
    } else if (mpesaStep === 'done') {
      setShowContributeModal(false)
      setMpesaStep('amount')
      setContributeAmount(500)
      setMpesaPin('')
    }
  }

  const handleLoanSubmit = () => {
    setLoanSubmitted(true)
    setTimeout(() => {
      setShowLoanModal(false)
      setLoanSubmitted(false)
      setLoanApp({ chamaId: '', loanProductId: '', amount: 0, purpose: '' })
    }, 2000)
  }

  // ── UNAUTHENTICATED VIEW ──
  if (view === 'UNAUTHENTICATED') {
    const t = {
      en: {
        title: 'Chama Group Finance',
        subtitle: 'Pool resources for larger, lower-interest loans',
        description: 'Kilimo AI partners with registered Chamas, cooperatives, and farmer groups to offer discounted loans with shared liability.',
        stats: [
          { value: '4.5%', label: 'Min interest rate' },
          { value: '10+', label: 'Members required' },
          { value: 'KES 2M', label: 'Max loan per group' },
        ],
        items: [
          { title: 'Group Discount Rate', desc: 'Group loans with lower interest rates starting at 4.5% p.a.', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-primary/10' },
          { title: 'Shared Liability', desc: 'Group members co-guarantee each other, making approval easier', icon: UsersRound, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { title: 'Mutual Savings Pool', desc: 'Build a rainy-day fund the whole Chama can draw from during planting season', icon: Coins, color: 'text-yellow-400', bg: 'bg-yellow-primary/10' },
          { title: 'Collective Buying', desc: 'Negotiate input suppliers as a group and save on fertilizer, seeds, equipment', icon: Shield, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ],
        cta: 'Register your chama',
        ctaDesc: 'Get 10+ members together and qualify for our best rates',
        loginPrompt: 'Log in to browse, join, or create a chama',
      },
    }

    const d = t.en

    return (
      <div className="p-8 space-y-8 h-full overflow-y-auto">
        <div>
          <p className="text-text-muted text-xs uppercase tracking-widest mb-1">GROUP FINANCE</p>
          <h1 className="text-2xl font-serif font-semibold text-text-primary">{d.title}</h1>
          <p className="text-sm text-text-muted mt-1 max-w-2xl">{d.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {d.stats.map((s, i) => (
            <div key={i} className="bg-dark-mid border border-border-subtle rounded-xl p-5 text-center">
              <p className="text-2xl font-bold text-text-primary">{s.value}</p>
              <p className="text-xs text-text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="max-w-2xl">
          <p className="text-sm text-text-muted leading-relaxed">{d.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {d.items.map((item, idx) => (
            <div key={idx} className="bg-dark-mid border border-border-subtle rounded-xl p-5 flex items-start gap-3">
              <div className={cn('p-2 rounded-lg', item.bg)}>
                <item.icon className={cn('w-5 h-5', item.color)} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-dark-mid border border-border-subtle rounded-xl p-6 text-center space-y-3">
          <p className="text-sm text-text-muted">{d.loginPrompt}</p>
          <a
            href="/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-primary text-dark-base rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            {d.cta}
          </a>
        </div>
      </div>
    )
  }

  // ── PENDING VIEW ──
  if (view === 'PENDING') {
    return (
      <div className="p-8 space-y-8 h-full overflow-y-auto">
        <div>
          <p className="text-text-muted text-xs uppercase tracking-widest mb-1">GROUP FINANCE</p>
          <h1 className="text-2xl font-serif font-semibold text-text-primary">
            {language === 'sw' ? 'Maombi ya Chama Yanasubiriwa' : 'Chama Application Pending'}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {language === 'sw'
              ? 'Ombi lako la kujiunga na chama linakaguliwa'
              : 'Your application to join a chama is being reviewed'}
          </p>
        </div>

        <div className="bg-dark-mid border border-border-subtle rounded-xl p-8 text-center max-w-lg">
          <div className="w-16 h-16 rounded-full bg-yellow-primary/10 mx-auto flex items-center justify-center mb-4">
            <HourglassIcon className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            {MOCK_PENDING_MEMBERSHIP.chamaName}
          </h2>
          <p className="text-sm text-text-muted mb-4">
            {language === 'sw'
              ? 'Tunakagua ombi lako. Kwa kawaida inachukua siku 1-2 za kazi.'
              : 'We are reviewing your application. This typically takes 1-2 business days.'}
          </p>
          <p className="text-xs text-text-muted">
            {language === 'sw'
              ? `Ulikabidhiwa tarehe: ${new Date(MOCK_PENDING_MEMBERSHIP.joinedAt).toLocaleDateString()}`
              : `Submitted on: ${new Date(MOCK_PENDING_MEMBERSHIP.joinedAt).toLocaleDateString()}`}
          </p>
        </div>
      </div>
    )
  }

  // ── MEMBER VIEW ──
  if (view === 'MEMBER') {
    const myChamaGroup = myActiveChama
    const weeklyMin = myChamaGroup?.registrationFee || 500
    const memberNames = MOCK_MY_MEMBERS.map(m => `user-${m.userId.split('-')[1]}`)

    return (
      <div className="p-8 space-y-6 h-full overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-muted text-xs uppercase tracking-widest mb-1">MY CHAMA</p>
            <h1 className="text-2xl font-serif font-semibold text-text-primary">
              {myChamaGroup?.name || 'My Chama'}
            </h1>
          </div>
          <button
            onClick={() => setShowContributeModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-primary text-dark-base rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
          >
            <Wallet className="w-4 h-4" />
            {language === 'sw' ? 'Changia' : 'Contribute'}
          </button>
        </div>

        {/* Stats row */}
        {myChamaGroup && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: { en: 'My Contributions', sw: 'Michango Yangu' }, value: `KES ${totalMyContributions.toLocaleString()}` },
              { label: { en: 'Group Size', sw: 'Ukubwa wa Kikundi' }, value: `${myChamaGroup.memberCount}` },
              { label: { en: 'Group Savings', sw: 'Akiba ya Kikundi' }, value: `KES ${myChamaGroup.totalSavings.toLocaleString()}` },
              { label: { en: 'Weekly Min', sw: 'Kima cha Wiki' }, value: `KES ${weeklyMin}` },
            ].map((s, i) => (
              <div key={i} className="bg-dark-mid border border-border-subtle rounded-lg px-4 py-3">
                <p className="text-xs text-text-muted">{s.label[language]}</p>
                <p className="text-sm font-semibold text-text-primary mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Members */}
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            {language === 'sw' ? 'Wanachama' : 'Members'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {MOCK_MY_MEMBERS.map(m => {
              const statusIcon = m.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3 text-green-400" /> :
                                 m.status === 'PENDING' ? <Clock className="w-3 h-3 text-yellow-400" /> :
                                 <XCircle className="w-3 h-3 text-red-400" />
              const statusLabel = m.status === 'ACTIVE' ? (language === 'sw' ? 'Amilifu' : 'Active') :
                                  m.status === 'PENDING' ? (language === 'sw' ? 'Inasubiri' : 'Pending') :
                                  (language === 'sw' ? 'Imekataliwa' : 'Rejected')
              return (
                <div key={m.id} className="bg-dark-mid border border-border-subtle rounded-lg px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{`Member ${m.userId.split('-')[1]}`}</p>
                    <p className="text-xs text-text-muted">KES {m.totalContributed.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {statusIcon}
                    <span className="text-[10px] text-text-muted">{statusLabel}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Contribution history */}
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-yellow-400" />
            {language === 'sw' ? 'Historia ya Michango' : 'Contribution History'}
          </h2>
          <div className="bg-dark-mid border border-border-subtle rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-left">
                  <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">{language === 'sw' ? 'Tarehe' : 'Date'}</th>
                  <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">{language === 'sw' ? 'Kiasi' : 'Amount'}</th>
                  <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">{language === 'sw' ? 'Njia' : 'Method'}</th>
                  <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase hidden sm:table-cell">Ref</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map(c => (
                  <tr key={c.id} className="border-b border-border-subtle/50 hover:bg-dark-base/50 transition-colors">
                    <td className="px-4 py-3 text-text-primary">{new Date(c.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-text-primary font-medium">KES {c.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-[10px] font-medium px-2 py-0.5 rounded-full',
                        c.method === 'MPESA' ? 'bg-green-primary/10 text-green-400' : 'bg-yellow-primary/10 text-yellow-400'
                      )}>
                        {c.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted font-mono hidden sm:table-cell">{c.mpesaRef || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chama Loans */}
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-amber-400" />
            {language === 'sw' ? 'Mikopo ya Chama' : 'Chama Group Loans'}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {CHAMA_LOAN_BUCKETS.map(loan => {
              const isExpanded = expandedLoan === loan.id
              return (
                <div key={loan.id} className={cn('bg-dark-mid border rounded-xl p-5', loan.border)}>
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2 rounded-lg', loan.bg)}>
                      <Building2 className={cn('w-5 h-5', loan.color)} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-text-primary">{l(loan.name)}</h3>
                      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                        <div className="bg-dark-base rounded-lg p-2">
                          <p className="text-sm font-bold text-text-primary">KES {loan.minAmount.toLocaleString()} – {loan.maxAmount.toLocaleString()}</p>
                          <p className="text-[10px] text-text-muted">{language === 'sw' ? 'Kiwango' : 'Amount'}</p>
                        </div>
                        <div className="bg-dark-base rounded-lg p-2">
                          <p className="text-base font-bold text-text-primary">{loan.interest}</p>
                          <p className="text-[10px] text-text-muted">APR</p>
                        </div>
                        <div className="bg-dark-base rounded-lg p-2">
                          <p className="text-xs font-bold text-text-primary">{l(loan.duration)}</p>
                          <p className="text-[10px] text-text-muted">{language === 'sw' ? 'Muda' : 'Duration'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedLoan(isExpanded ? null : loan.id)}
                    className="mt-3 text-xs text-green-400 font-medium flex items-center gap-1 hover:text-green-300 transition-colors"
                  >
                    {isExpanded ? (language === 'sw' ? 'Ficha' : 'Hide details') : (language === 'sw' ? 'Maelezo' : 'Details')}
                    <ChevronDown className={cn('w-3 h-3 transition-transform', isExpanded && 'rotate-180')} />
                  </button>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border-subtle space-y-3">
                      {loan.features[language].map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-text-muted">
                          <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />
                          {f}
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setLoanApp({ chamaId: myChama.chamaId, loanProductId: loan.id, amount: loan.minAmount, purpose: '' })
                          setShowLoanModal(true)
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-primary/10 border border-green-primary/20 text-xs text-green-400 font-medium hover:bg-green-primary/20 transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        {language === 'sw' ? 'Omba Mkopo' : 'Apply'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Contribute Modal */}
        {showContributeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-dark-mid border border-border-subtle rounded-2xl w-full max-w-md p-6 mx-4 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-primary">
                  {language === 'sw' ? 'Changia kwa M-Pesa' : 'Contribute via M-Pesa'}
                </h2>
                <button onClick={() => { setShowContributeModal(false); setMpesaStep('amount'); setMpesaPin('') }} className="p-1 hover:bg-dark-base rounded-lg transition-colors">
                  <X className="w-4 h-4 text-text-muted" />
                </button>
              </div>

              {mpesaStep === 'confirming' ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-primary/10 mx-auto flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
                  </div>
                  <p className="text-sm text-text-muted">
                    {language === 'sw' ? 'Inachakata malipo yako...' : 'Processing your payment...'}
                  </p>
                  <p className="text-xs text-text-muted">
                    {language === 'sw' ? 'Angalia simu yako kwa ombi la M-Pesa STK push' : 'Check your phone for the M-Pesa STK push'}
                  </p>
                </div>
              ) : mpesaStep === 'done' ? (
                <div className="text-center py-8 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-green-primary/10 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="font-semibold text-green-400">
                    {language === 'sw' ? 'Malipo yamefanyika!' : 'Payment successful!'}
                  </p>
                  <p className="text-xs text-text-muted">KES {contributeAmount.toLocaleString()} — M-Pesa</p>
                  <button onClick={handleMpesaContribute} className="mt-4 px-6 py-2 bg-green-primary text-dark-base rounded-lg text-sm font-semibold">
                    {language === 'sw' ? 'Sawa' : 'Done'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mpesaStep === 'amount' ? (
                    <>
                      <div>
                        <label className="text-xs font-medium text-text-muted">{language === 'sw' ? 'Kiasi (KES)' : 'Amount (KES)'}</label>
                        <div className="flex gap-2 mt-1">
                          {[200, 500, 1000, 2000].map(amt => (
                            <button
                              key={amt}
                              onClick={() => setContributeAmount(amt)}
                              className={cn(
                                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                                contributeAmount === amt
                                  ? 'bg-green-primary/10 border-green-primary/30 text-green-400'
                                  : 'bg-dark-base border-border-subtle text-text-muted hover:text-text-primary'
                              )}
                            >
                              {amt}
                            </button>
                          ))}
                        </div>
                        <input
                          type="number"
                          value={contributeAmount}
                          onChange={e => setContributeAmount(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary mt-2 focus:outline-none focus:border-green-primary/50"
                          min={100}
                        />
                      </div>
                      <button
                        onClick={handleMpesaContribute}
                        disabled={contributeAmount < 100}
                        className="w-full py-2.5 rounded-lg bg-green-primary text-dark-base font-semibold text-sm hover:bg-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {language === 'sw' ? 'Endelea' : 'Continue'}
                      </button>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-xs font-medium text-text-muted">{language === 'sw' ? 'Namba ya Siri ya M-Pesa' : 'M-Pesa PIN'}</label>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                          <input
                            type="password"
                            maxLength={4}
                            value={mpesaPin}
                            onChange={e => setMpesaPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="w-full pl-9 pr-4 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary tracking-[0.3em] focus:outline-none focus:border-green-primary/50"
                            placeholder="****"
                          />
                        </div>
                        <p className="text-[10px] text-text-muted mt-1">{language === 'sw' ? 'Hii ni simulizi — hakuna PIN halisi inachakatwa' : 'This is simulated — no real PIN is processed'}</p>
                      </div>
                      <div className="bg-dark-base border border-border-subtle rounded-lg p-3">
                        <p className="text-xs text-text-muted">{language === 'sw' ? 'Malipo' : 'Payment'}</p>
                        <p className="text-sm font-semibold text-text-primary">KES {contributeAmount.toLocaleString()}</p>
                        <p className="text-xs text-text-muted mt-1">Paybill: 247247 | Acct: CHAMA-KILIMO</p>
                      </div>
                      <button
                        onClick={handleMpesaContribute}
                        disabled={mpesaPin.length < 4}
                        className="w-full py-2.5 rounded-lg bg-green-primary text-dark-base font-semibold text-sm hover:bg-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Smartphone className="w-4 h-4 inline mr-1.5" />
                        {language === 'sw' ? 'Lipa Kwa M-Pesa' : 'Pay with M-Pesa'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loan Application Modal */}
        {showLoanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-dark-mid border border-border-subtle rounded-2xl w-full max-w-md p-6 mx-4 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-primary">
                  {language === 'sw' ? 'Omba Mkopo wa Chama' : 'Apply for Chama Loan'}
                </h2>
                <button onClick={() => { setShowLoanModal(false); setLoanSubmitted(false) }} className="p-1 hover:bg-dark-base rounded-lg transition-colors">
                  <X className="w-4 h-4 text-text-muted" />
                </button>
              </div>

              {loanSubmitted ? (
                <div className="text-center py-8 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-green-primary/10 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="font-semibold text-green-400">
                    {language === 'sw' ? 'Ombi limewasilishwa!' : 'Application submitted!'}
                  </p>
                  <p className="text-xs text-text-muted">
                    {language === 'sw' ? 'Afisa wa mkopo atawasiliana nawe ndani ya saa 24' : 'A loan officer will contact you within 24 hours'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-text-muted">{language === 'sw' ? 'Kiasi cha Mkopo (KES)' : 'Loan Amount (KES)'}</label>
                    <input
                      type="number"
                      value={loanApp.amount}
                      onChange={e => setLoanApp({ ...loanApp, amount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary mt-1 focus:outline-none focus:border-green-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-muted">{language === 'sw' ? 'Madhumuni' : 'Purpose'}</label>
                    <textarea
                      value={loanApp.purpose}
                      onChange={e => setLoanApp({ ...loanApp, purpose: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary mt-1 focus:outline-none focus:border-green-primary/50 resize-none"
                      placeholder={language === 'sw' ? 'Eleza jinsi utakavyotumia mkopo...' : 'Briefly describe how you will use the loan...'}
                    />
                  </div>
                  <button
                    onClick={handleLoanSubmit}
                    disabled={!loanApp.amount || !loanApp.purpose}
                    className="w-full py-2.5 rounded-lg bg-green-primary text-dark-base font-semibold text-sm hover:bg-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {language === 'sw' ? 'Tuma Ombi' : 'Submit Application'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── BROWSE VIEW (default for authenticated users) ──
  return (
    <div className="p-8 space-y-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-text-muted text-xs uppercase tracking-widest mb-1">GROUP FINANCE</p>
          <h1 className="text-2xl font-serif font-semibold text-text-primary">
            {language === 'sw' ? 'Vikundi vya Chama' : 'Chama Groups'}
          </h1>
          <p className="text-sm text-text-muted mt-1 max-w-2xl">
            {language === 'sw'
              ? 'Vinjari vikundi vya kilimo katika kaunti zako na ujiunge kupata faida za pamoja'
              : 'Browse farming groups across counties and join for shared benefits'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-primary text-dark-base rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {language === 'sw' ? 'Unda Chama' : 'Create Chama'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={language === 'sw' ? 'Tafuta kwa jina...' : 'Search by name...'}
            className="w-full pl-9 pr-4 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green-primary/50 transition-colors"
          />
        </div>
        <select
          value={countyFilter}
          onChange={e => setCountyFilter(e.target.value)}
          className="px-3 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:border-green-primary/50"
        >
          <option value="ALL">{language === 'sw' ? 'Kaunti Zote' : 'All Counties'}</option>
          {KENYAN_COUNTIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Chama cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredChamas.map(chama => {
          const isJoined = joinedId === chama.id
          return (
            <div key={chama.id} className="bg-dark-mid border border-border-subtle rounded-xl p-5 hover:border-green-primary/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-primary/10">
                      <Users className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-text-primary">{chama.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <MapPin className="w-3 h-3 text-text-muted" />
                        <span className="text-xs text-text-muted">{chama.county}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div className="bg-dark-base rounded-lg p-2">
                      <p className="text-sm font-bold text-text-primary">{chama.memberCount}</p>
                      <p className="text-[10px] text-text-muted">{language === 'sw' ? 'Wanachama' : 'Members'}</p>
                    </div>
                    <div className="bg-dark-base rounded-lg p-2">
                      <p className="text-sm font-bold text-text-primary">KES {chama.totalSavings.toLocaleString()}</p>
                      <p className="text-[10px] text-text-muted">{language === 'sw' ? 'Akiba' : 'Savings'}</p>
                    </div>
                    <div className="bg-dark-base rounded-lg p-2">
                      <p className="text-sm font-bold text-text-primary">KES {chama.registrationFee}</p>
                      <p className="text-[10px] text-text-muted">{language === 'sw' ? 'Ada ya Usajili' : 'Reg. Fee'}</p>
                    </div>
                  </div>

                  <p className="text-xs text-text-muted mt-3 leading-relaxed line-clamp-2">{chama.description}</p>

                  <button
                    onClick={() => handleJoin(chama.id)}
                    disabled={isJoined}
                    className={cn(
                      'mt-4 w-full py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2',
                      isJoined
                        ? 'bg-green-primary/10 text-green-400 border border-green-primary/30'
                        : 'bg-green-primary text-dark-base hover:bg-green-600'
                    )}
                  >
                    {isJoined ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        {language === 'sw' ? 'Ombi Limetumwa' : 'Applied'}
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        {language === 'sw' ? 'Jiunge na Chama' : 'Join Chama'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredChamas.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{language === 'sw' ? 'Hakuna vikundi vinavyolingana' : 'No matching groups'}</p>
        </div>
      )}

      {/* Create Chama Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-mid border border-border-subtle rounded-2xl w-full max-w-md p-6 mx-4 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                {language === 'sw' ? 'Unda Chama Mpya' : 'Create New Chama'}
              </h2>
              <button onClick={() => { setShowCreateModal(false); setCreateSubmitted(false) }} className="p-1 hover:bg-dark-base rounded-lg transition-colors">
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            {createSubmitted ? (
              <div className="text-center py-8 space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-primary/10 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <p className="font-semibold text-green-400">
                  {language === 'sw' ? 'Chama imeundwa!' : 'Chama created!'}
                </p>
                <p className="text-xs text-text-muted">
                  {language === 'sw' ? 'Tutakagua ombi lako na kukujulisha' : 'We will review your submission and notify you'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-text-muted">{language === 'sw' ? 'Jina la Chama' : 'Chama Name'}</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary mt-1 focus:outline-none focus:border-green-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted">{language === 'sw' ? 'Kaunti' : 'County'}</label>
                  <select
                    value={createForm.county}
                    onChange={e => setCreateForm({ ...createForm, county: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary mt-1 focus:outline-none focus:border-green-primary/50"
                  >
                    <option value="">{language === 'sw' ? 'Chagua kaunti' : 'Select county'}</option>
                    {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted">{language === 'sw' ? 'Maelezo' : 'Description'}</label>
                  <textarea
                    value={createForm.description}
                    onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary mt-1 focus:outline-none focus:border-green-primary/50 resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted">{language === 'sw' ? 'Ada ya Usajili ya Wiki (KES)' : 'Weekly Registration Fee (KES)'}</label>
                  <input
                    type="number"
                    value={createForm.fee}
                    onChange={e => setCreateForm({ ...createForm, fee: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary mt-1 focus:outline-none focus:border-green-primary/50"
                    min={100}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer bg-dark-base border border-border-subtle rounded-lg px-4 py-3 flex-1 hover:border-green-primary/30 transition-colors">
                    <Upload className="w-4 h-4 text-text-muted" />
                    <span className="text-xs text-text-muted">{language === 'sw' ? 'Pakia uthibitisho wa usajili' : 'Upload registration proof'}</span>
                    <input type="file" className="hidden" onChange={() => setHasProof(true)} />
                  </label>
                  {hasProof && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
                </div>
                <div className="text-[10px] text-text-muted bg-dark-base rounded-lg p-2">
                  {language === 'sw' ? 'Unahitaji wanachama 10+ na uthibitisho wa usajili wa kikundi kuituma' : 'You need 10+ members and proof of group registration to submit'}
                </div>
                <button
                  onClick={handleCreateSubmit}
                  disabled={!createForm.name || !createForm.county || !createForm.description || !hasProof}
                  className="w-full py-2.5 rounded-lg bg-green-primary text-dark-base font-semibold text-sm hover:bg-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {language === 'sw' ? 'Tuma Ombi la Chama' : 'Submit Chama Request'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
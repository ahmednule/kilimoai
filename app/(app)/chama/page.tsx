'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users, Coins, MapPin, Clock, HourglassIcon,
  Send, ArrowUpRight, Building2, BadgeCheck, Sprout,
  UserPlus, Wallet, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Language, ChamaGroup, ChamaMember, ChamaContribution } from '@/lib/types'

type View = 'LOADING' | 'UNAUTHENTICATED' | 'BROWSE' | 'PENDING' | 'MEMBER'

export default function ChamaPage() {
  const [language, setLanguage] = useState<Language>('en')
  const [view, setView] = useState<View>('LOADING')
  const [chama, setChama] = useState<ChamaGroup | null>(null)
  const [membership, setMembership] = useState<ChamaMember | null>(null)
  const [members, setMembers] = useState<ChamaMember[]>([])
  const [contributions, setContributions] = useState<ChamaContribution[]>([])
  const [sessionToken, setSessionToken] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinedMsg, setJoinedMsg] = useState('')

  // Contribution modal
  const [showContribute, setShowContribute] = useState(false)
  const [contributeAmount, setContributeAmount] = useState('')
  const [contributePin, setContributePin] = useState('')
  const [contributing, setContributing] = useState(false)
  const [contributeDone, setContributeDone] = useState('')

  // Loan modal
  const [showLoan, setShowLoan] = useState(false)
  const [loanAmount, setLoanAmount] = useState('')
  const [loanPurpose, setLoanPurpose] = useState('')
  const [submittingLoan, setSubmittingLoan] = useState(false)
  const [loanDone, setLoanDone] = useState('')

  const t = {
    en: {
      badge: 'Chama',
      title: 'Mercy Corps Sustainable Agriculture Group',
      desc: 'Official chama for tracking your farming journey. Access fair loans, group savings, and market linkages.',
      members: 'Members',
      savings: 'Total Savings',
      join: 'Join This Chama',
      joined: 'Request sent! Pending approval.',
      contribute: 'Contribute via M-Pesa',
      contributeTitle: 'Make a Contribution',
      amount: 'Amount (KSh)',
      pin: 'M-Pesa PIN',
      send: 'Send to M-Pesa',
      confirming: 'Confirming...',
      done: 'Contribution recorded!',
      loan: 'Apply for Chama Loan',
      loanTitle: 'Chama Loan Application',
      loanAmount: 'Loan Amount (KSh)',
      purpose: 'Purpose',
      submitLoan: 'Submit Application',
      loanSubmitted: 'Application submitted for review.',
      history: 'Contribution History',
      members_list: 'Chama Members',
      noChama: 'Chama not found. It may not have been seeded yet.',
      login: 'Sign in to access chama features.',
      allCaughtUp: 'No contributions yet. Make your first one!',
      noMembers: 'No other members yet.',
    },
    sw: {
      badge: 'Chama',
      title: 'Kikundi cha Kilimo Endelevu cha Mercy Corps',
      desc: 'Chama rasmi cha kufuatilia safari yako ya kilimo. Pata mikopo ya haki, akiba ya kikundi, na uhusiano wa soko.',
      members: 'Wanachama',
      savings: 'Jumla ya Akiba',
      join: 'Jiunge na Chama Hiki',
      joined: 'Ombi limetumwa! Inasubiri idhini.',
      contribute: 'Changia kwa M-Pesa',
      contributeTitle: 'Toa Mchango',
      amount: 'Kiasi (KSh)',
      pin: 'Nambari ya siri ya M-Pesa',
      send: 'Tuma kwa M-Pesa',
      confirming: 'Inathibitisha...',
      done: 'Mchango umehifadhiwa!',
      loan: 'Omba Mkopo wa Chama',
      loanTitle: 'Maombi ya Mkopo wa Chama',
      loanAmount: 'Kiasi cha Mkopo (KSh)',
      purpose: 'Madhumuni',
      submitLoan: 'Wasilisha Ombi',
      loanSubmitted: 'Ombi limewasilishwa kwa ukaguzi.',
      history: 'Historia ya Michango',
      members_list: 'Wanachama wa Chama',
      noChama: 'Chama hakikupatikana. Huenda bado hakijapandwa.',
      login: 'Ingia ili kutumia huduma za chama.',
      allCaughtUp: 'Hakuna michango bado. Toa mchango wako wa kwanza!',
      noMembers: 'Hakuna wanachama wengine bado.',
    },
  }

  const ui = language === 'sw' ? t.sw : t.en

  useEffect(() => {
    const savedLang = localStorage.getItem('kilimo-language') as Language | null
    if (savedLang) setLanguage(savedLang)
    setSessionToken(localStorage.getItem('kilimo-session') || '')
  }, [])

  useEffect(() => {
    if (!sessionToken) { setView('UNAUTHENTICATED'); return }
    loadData()
  }, [sessionToken])

  const headers = () => ({ Authorization: `Bearer ${sessionToken}` })

  async function loadData() {
    try {
      const chamaRes = await fetch('/api/chama?search=Mercy+Corps')
      const chamaData = await chamaRes.json()
      const found = chamaData.chamas?.[0]
      if (!found) { setView('BROWSE'); setChama(null); return }
      setChama(found)

      const memRes = await fetch('/api/chama/membership', { headers: headers() })
      const memData = await memRes.json()
      const myMem = memData.memberships?.[0]

      if (myMem) {
        setMembership(myMem)
        if (myMem.status === 'ACTIVE') {
          setView('MEMBER')
          loadMembers(found.id)
          loadContributions(found.id)
        } else if (myMem.status === 'PENDING') {
          setView('PENDING')
        } else { setView('BROWSE') }
      } else { setView('BROWSE') }
    } catch { setView('BROWSE') }
  }

  const loadMembers = useCallback(async (chamaId: string) => {
    try {
      const res = await fetch(`/api/chama/membership?chamaId=${chamaId}&all=true`, { headers: headers() })
      const data = await res.json()
      setMembers(data.memberships || [])
    } catch {}
  }, [])

  const loadContributions = useCallback(async (chamaId: string) => {
    try {
      const res = await fetch(`/api/chama/contributions?chamaId=${chamaId}`, { headers: headers() })
      const data = await res.json()
      setContributions(data.contributions || [])
    } catch {}
  }, [])

  async function handleJoin() {
    if (!chama || joining) return
    setJoining(true)
    try {
      const res = await fetch('/api/chama/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers() },
        body: JSON.stringify({ chamaId: chama.id }),
      })
      const data = await res.json()
      if (data.success) { setJoinedMsg(ui.joined); setView('PENDING') }
    } catch {}
    setJoining(false)
  }

  async function handleContribute() {
    if (!chama || contributing) return
    setContributing(true)
    try {
      const res = await fetch('/api/chama/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers() },
        body: JSON.stringify({ chamaId: chama.id, amount: contributeAmount, method: 'MPESA', mpesaRef: `MP${Date.now()}` }),
      })
      const data = await res.json()
      if (data.success) {
        setContributeDone(ui.done)
        setContributeAmount('')
        setContributePin('')
        loadContributions(chama.id)
        // Refresh chama totals
        const chamaRes = await fetch('/api/chama?search=Mercy+Corps')
        const chamaData = await chamaRes.json()
        if (chamaData.chamas?.[0]) setChama(chamaData.chamas[0])
        setTimeout(() => { setShowContribute(false); setContributeDone('') }, 2000)
      }
    } catch {}
    setContributing(false)
  }

  async function handleLoan() {
    if (!chama || submittingLoan) return
    setSubmittingLoan(true)
    try {
      const res = await fetch('/api/chama/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers() },
        body: JSON.stringify({ chamaId: chama.id, loanAmount, purpose: loanPurpose }),
      })
      const data = await res.json()
      if (data.success) {
        setLoanDone(ui.loanSubmitted)
        setLoanAmount('')
        setLoanPurpose('')
        setTimeout(() => { setShowLoan(false); setLoanDone('') }, 2000)
      }
    } catch {}
    setSubmittingLoan(false)
  }

  // ─── RENDER ───

  if (view === 'LOADING') return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-green-primary border-t-transparent rounded-full" /></div>

  if (view === 'UNAUTHENTICATED') return <div className="max-w-md mx-auto mt-20 text-center p-8"><Building2 className="w-12 h-12 text-text-muted mx-auto mb-4" /><p className="text-text-muted">{ui.login}</p></div>

  if (!chama) return <div className="max-w-md mx-auto mt-20 text-center p-8"><p className="text-text-muted">{ui.noChama}</p></div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-dark-mid border border-border-subtle rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-primary/15 flex items-center justify-center">
              <Sprout className="w-7 h-7 text-green-primary" />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-green-primary">{ui.badge}</span>
              <h1 className="font-serif text-xl font-bold text-text-primary mt-0.5">{chama.name}</h1>
              <p className="text-sm text-text-muted mt-1 max-w-xl">{chama.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-dark-base rounded-xl p-4 text-center">
            <Users className="w-5 h-5 text-sky-blue mx-auto mb-1.5" />
            <p className="text-2xl font-bold text-text-primary">{chama.memberCount}</p>
            <p className="text-[11px] text-text-muted">{ui.members}</p>
          </div>
          <div className="bg-dark-base rounded-xl p-4 text-center">
            <Coins className="w-5 h-5 text-gold-harvest mx-auto mb-1.5" />
            <p className="text-2xl font-bold text-text-primary">KSh {(chama.totalSavings || 0).toLocaleString()}</p>
            <p className="text-[11px] text-text-muted">{ui.savings}</p>
          </div>
          <div className="bg-dark-base rounded-xl p-4 text-center">
            <MapPin className="w-5 h-5 text-green-primary mx-auto mb-1.5" />
            <p className="text-lg font-bold text-text-primary">{chama.county}</p>
            <p className="text-[11px] text-text-muted">County</p>
          </div>
          <div className="bg-dark-base rounded-xl p-4 text-center">
            <BadgeCheck className="w-5 h-5 text-gold-harvest mx-auto mb-1.5" />
            <p className="text-lg font-bold text-text-primary">Free</p>
            <p className="text-[11px] text-text-muted">Registration</p>
          </div>
        </div>

        {view === 'BROWSE' && !joinedMsg && (
          <button onClick={handleJoin} disabled={joining}
            className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-gold-harvest text-dark-base font-semibold rounded-xl hover:bg-gold-harvest/90 transition-all disabled:opacity-50">
            <UserPlus className="w-4 h-4" />
            {joining ? '...' : ui.join}
          </button>
        )}
        {joinedMsg && <div className="mt-4 p-3 rounded-lg bg-green-primary/10 border border-green-primary/20 text-green-300 text-sm text-center">{joinedMsg}</div>}
      </div>

      {/* Member view */}
      {view === 'MEMBER' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => setShowContribute(true)}
              className="flex items-center gap-3 p-4 bg-dark-mid border border-border-subtle rounded-xl hover:border-green-primary/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-green-primary/15 flex items-center justify-center">
                <Send className="w-5 h-5 text-green-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-text-primary">{ui.contribute}</p>
                <p className="text-[11px] text-text-muted">M-Pesa</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-text-muted ml-auto" />
            </button>

            <button onClick={() => setShowLoan(true)}
              className="flex items-center gap-3 p-4 bg-dark-mid border border-border-subtle rounded-xl hover:border-gold-harvest/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-gold-harvest/15 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-gold-harvest" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-text-primary">{ui.loan}</p>
                <p className="text-[11px] text-text-muted">{ui.loanAmount}</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-text-muted ml-auto" />
            </button>
          </div>

          {/* History */}
          <div className="bg-dark-mid border border-border-subtle rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-muted" />
              {ui.history}
            </h3>
            {contributions.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-4">{ui.allCaughtUp}</p>
            ) : (
              <div className="space-y-2">
                {contributions.map(c => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0 text-xs">
                    <span className="text-text-primary">KSh {c.amount.toLocaleString()}</span>
                    <span className="text-text-muted">{new Date(c.date).toLocaleDateString()}</span>
                    <span className="text-text-muted">{c.method}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Members */}
          <div className="bg-dark-mid border border-border-subtle rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-text-muted" />
              {ui.members_list}
            </h3>
            {members.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-4">{ui.noMembers}</p>
            ) : (
              <div className="space-y-2">
                {members.slice(0, 10).map(m => (
                  <div key={m.id} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-dark-base border border-border-subtle flex items-center justify-center text-xs text-text-muted">
                        {m.userName?.[0] || '?'}
                      </div>
                      <span className="text-sm text-text-primary">{m.userName || m.chamaName}</span>
                    </div>
                    <span className={cn(
                      'text-[11px] px-2 py-0.5 rounded-full font-medium',
                      m.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      m.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    )}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {view === 'PENDING' && (
        <div className="bg-dark-mid border border-border-subtle rounded-xl p-8 text-center">
          <HourglassIcon className="w-10 h-10 text-gold-harvest mx-auto mb-3" />
          <p className="text-text-primary font-medium">{language === 'sw' ? 'Ombi lako linakaguliwa...' : 'Your membership request is being reviewed...'}</p>
          <p className="text-sm text-text-muted mt-1">{language === 'sw' ? 'Utapokea arifa ikikubaliwa.' : 'You\'ll be notified once approved.'}</p>
        </div>
      )}

      {/* Contribution Modal */}
      {showContribute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-dark-mid border border-border-subtle rounded-2xl p-6 w-full max-w-sm relative">
            <button onClick={() => { setShowContribute(false); setContributeDone('') }} className="absolute top-4 right-4 text-text-muted hover:text-text-primary">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-text-primary mb-4">{ui.contributeTitle}</h2>
            {contributeDone ? (
              <p className="text-green-400 text-center py-4">{contributeDone}</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">{ui.amount}</label>
                  <input type="number" value={contributeAmount} onChange={e => setContributeAmount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-dark-base border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-green-primary/50" placeholder="e.g. 500" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">{ui.pin}</label>
                  <input type="password" value={contributePin} onChange={e => setContributePin(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-dark-base border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-green-primary/50" placeholder="••••" />
                </div>
                <button onClick={handleContribute} disabled={contributing || !contributeAmount}
                  className="w-full py-3 rounded-xl bg-green-primary text-white font-semibold hover:bg-green-primary/90 transition-all disabled:opacity-50">
                  {contributing ? ui.confirming : ui.send}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loan Modal */}
      {showLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-dark-mid border border-border-subtle rounded-2xl p-6 w-full max-w-sm relative">
            <button onClick={() => { setShowLoan(false); setLoanDone('') }} className="absolute top-4 right-4 text-text-muted hover:text-text-primary">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-text-primary mb-4">{ui.loanTitle}</h2>
            {loanDone ? (
              <p className="text-green-400 text-center py-4">{loanDone}</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">{ui.loanAmount}</label>
                  <input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-dark-base border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-gold-harvest/50" placeholder="e.g. 10000" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">{ui.purpose}</label>
                  <textarea value={loanPurpose} onChange={e => setLoanPurpose(e.target.value)} rows={3}
                    className="w-full px-3 py-2.5 rounded-lg bg-dark-base border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-gold-harvest/50 resize-none" placeholder={language === 'sw' ? 'Maelezo ya mkopo...' : 'Loan details...'} />
                </div>
                <button onClick={handleLoan} disabled={submittingLoan || !loanAmount}
                  className="w-full py-3 rounded-xl bg-gold-harvest text-dark-base font-semibold hover:bg-gold-harvest/90 transition-all disabled:opacity-50">
                  {submittingLoan ? '...' : ui.submitLoan}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

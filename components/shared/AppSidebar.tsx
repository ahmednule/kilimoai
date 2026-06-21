'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Sprout, MessageSquare, History, Building2, Users, Bug, UserCog, LogOut,
  LayoutDashboard, ClipboardCheck, ShieldCheck, Bot,
} from 'lucide-react'
import { FarmerProfile, Language, RiskLevel } from '@/lib/types'
import { getSession, type UserRole } from '@/lib/auth'
import { CROPS } from '@/lib/constants'
import { RiskBadge } from '@/components/shared/RiskBadge'
import { cn } from '@/lib/utils'
import { useChatBot } from '@/components/chatbot/ChatBotContext'

const FARMER_NAV = [
  { label: 'Assessment',    icon: MessageSquare,    href: '/chat'      },
  { label: 'My history',    icon: History,          href: '/dashboard' },
  { label: 'AI Assistant',  icon: Bot,              href: '/chatbot'   },
  { label: 'Loan products', icon: Building2,        href: '/loans'     },
  { label: 'Chama',         icon: Users,             href: '/chama'     },
  { label: 'Pest check',    icon: Bug,              href: '/pest-check'},
  { label: 'Profile',        icon: UserCog,           href: '/profile'  },
]

const AGENT_NAV = [
  { label: 'Dashboard',      icon: LayoutDashboard,   href: '/agent'            },
  { label: 'Assessments',    icon: ClipboardCheck,    href: '/agent/assessments' },
  { label: 'Farmers',       icon: ShieldCheck,       href: '/agent/farmers'     },
  { label: 'AI Assistant',  icon: Bot,                href: '/chatbot'   },
  { label: 'Loan products', icon: Building2,          href: '/loans'            },
  { label: 'Profile',        icon: UserCog,            href: '/profile'          },
]

export function AppSidebar() {
  const router   = useRouter()
  const pathname = usePathname()
  const chatBot  = useChatBot()

  const [mounted,   setMounted]   = useState(false)
  const [profile,   setProfile]   = useState<FarmerProfile | null>(null)
  const [language,  setLanguage]  = useState<Language>('en')
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('UNKNOWN')
  const [role,      setRole]      = useState<UserRole | null>(null)

  const NAV_ITENS = role === 'agent' ? AGENT_NAV : FARMER_NAV

  useEffect(() => {
    const savedLang    = localStorage.getItem('kilimo-language') as Language | null
    const savedProfile = localStorage.getItem('kilimo-profile')

    if (savedLang) setLanguage(savedLang)

    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile))
      } catch { /* corrupt */ }
    }

    const sess = getSession()
    if (sess.role) setRole(sess.role)

    setMounted(true)
  }, [])

  if (!mounted) return null

  const isAgent = role === 'agent'

  const cropLabel = profile
    ? CROPS.find(c => c.value === profile.crop)?.label[language] ?? profile.crop
    : ''
  const initials = profile?.name
    ? profile.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '??'

  const handleLogout = () => {
    localStorage.removeItem('kilimo-session')
    localStorage.removeItem('kilimo-profile')
    router.push('/auth/login')
  }

  return (
    <aside className="flex flex-col w-[220px] shrink-0 bg-dark-mid border-r border-border-subtle overflow-hidden">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border-subtle">
        <div className="w-8 h-8 rounded-lg bg-green-primary flex items-center justify-center shrink-0">
          <Sprout className="w-4 h-4 text-green-100" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary leading-none">Kilimo AI</p>
          <p className="text-[10px] text-text-muted mt-0.5 leading-none">
            {isAgent ? 'Extension Agent' : 'Farm risk advisor'}
          </p>
        </div>
      </div>

      {/* Profile / agent info */}
      {isAgent ? (
        <div className="mx-3 mt-3 p-3 bg-dark-base rounded-xl border border-border-subtle">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-blue-100 mb-2">
            AG
          </div>
          <p className="text-sm font-medium text-text-primary leading-tight">Agent Portal</p>
          <p className="text-[11px] text-text-muted mt-0.5">
            {profile?.county ?? '—'} · {profile?.county ?? '—'}
          </p>
          <div className="mt-2 pt-2 border-t border-border-subtle">
            <span className="text-[11px] text-text-muted block">Active status</span>
          </div>
        </div>
      ) : profile ? (
        <div className="mx-3 mt-3 p-3 bg-dark-base rounded-xl border border-border-subtle">
          <div className="w-9 h-9 rounded-full bg-green-primary flex items-center justify-center text-xs font-semibold text-green-100 mb-2">
            {initials}
          </div>
          <p className="text-sm font-medium text-text-primary leading-tight">{profile.name}</p>
          <p className="text-[11px] text-text-muted mt-0.5">{profile.county} · {cropLabel}</p>
          <div className="mt-2 pt-2 border-t border-border-subtle flex justify-between text-[11px]">
            <span className="text-text-muted/60">Acreage</span>
            <span className="text-text-muted font-medium">{profile.acres} ac</span>
          </div>
        </div>
      ) : null}

      {/* Risk pill — farmer only */}
      {!isAgent && (
        <div className="mx-3 mt-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-dark-base rounded-lg border border-border-subtle">
            <span className="text-[11px] text-text-muted flex-1">Risk score</span>
            <RiskBadge level={riskLevel} compact />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="mt-4 px-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border-subtle scrollbar-track-transparent" aria-label="App navigation">
        <p className="text-[10px] uppercase tracking-widest text-text-muted/50 px-2 mb-1">Navigate</p>
        {NAV_ITENS.map(({ label, icon: Icon, href }) => {
          const isChatBot = href === '/chatbot'
          const active = isChatBot ? chatBot.open : pathname.startsWith(href)
          return (
            <button
              key={href}
              onClick={() => {
                if (isChatBot) {
                  chatBot.openChatBot()
                } else {
                  router.push(href)
                }
              }}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 mb-0.5 text-left',
                active
                  ? 'bg-green-primary/10 text-green-400 border border-green-primary/20'
                  : 'text-text-muted hover:bg-dark-base hover:text-text-primary'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-2 border-t border-border-subtle mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-border-subtle text-[12px] text-text-muted hover:text-text-primary hover:border-red-500/40 hover:bg-dark-base transition-all duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log out
        </button>
      </div>
    </aside>
  )
}
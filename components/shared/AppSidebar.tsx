'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Sprout, MessageSquare, History, Building2, Users, Bug, UserCog, LogOut,
  LayoutDashboard, ClipboardCheck, ShieldCheck, Bot, ShoppingCart, Store,
  Shield, BarChart3, Settings, FileText, Package,
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

const LENDER_NAV = [
  { label: 'Dashboard',      icon: LayoutDashboard,   href: '/lender'             },
  { label: 'Applications',   icon: FileText,           href: '/lender/applications' },
  { label: 'Portfolio',      icon: BarChart3,          href: '/lender/portfolio'    },
  { label: 'AI Assistant',   icon: Bot,                href: '/chatbot'            },
  { label: 'Profile',        icon: UserCog,             href: '/profile'            },
]

const BUYER_NAV = [
  { label: 'Dashboard',      icon: LayoutDashboard,  href: '/buyer'           },
  { label: 'Marketplace',    icon: ShoppingCart,      href: '/buyer/marketplace' },
  { label: 'My Orders',      icon: Package,           href: '/buyer/orders'     },
  { label: 'AI Assistant',   icon: Bot,                href: '/chatbot'          },
  { label: 'Profile',        icon: UserCog,             href: '/profile'          },
]

const ADMIN_NAV = [
  { label: 'Dashboard',      icon: LayoutDashboard,   href: '/admin'          },
  { label: 'User Management', icon: Users,             href: '/admin/users'    },
  { label: 'Analytics',      icon: BarChart3,          href: '/admin/analytics' },
  { label: 'AI Assistant',   icon: Bot,                href: '/chatbot'         },
  { label: 'Settings',       icon: Settings,           href: '/admin/settings'  },
  { label: 'Profile',        icon: UserCog,             href: '/profile'         },
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

  const NAV_ITEMS = role === 'agent' ? AGENT_NAV
    : role === 'lender' ? LENDER_NAV
    : role === 'buyer'  ? BUYER_NAV
    : role === 'admin'  ? ADMIN_NAV
    : FARMER_NAV

  const roleColors: Record<UserRole, { color: string; bg: string }> = {
    farmer: { color: 'text-green-400',  bg: 'bg-green-primary/10 border-green-primary/20' },
    agent:  { color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
    lender: { color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    buyer:  { color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
    admin:  { color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
  }

  const activeStyle = role && role !== 'farmer' ? roleColors[role] : roleColors.farmer

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

  const isAgent    = role === 'agent'
  const isLender   = role === 'lender'
  const isBuyer    = role === 'buyer'
  const isAdmin    = role === 'admin'
  const isFarmer   = role !== 'agent' && role !== 'lender' && role !== 'buyer' && role !== 'admin'

  const roleLabel = isAgent ? 'Extension Agent'
    : isLender ? 'Lender Portal'
    : isBuyer ? 'Buyer Portal'
    : isAdmin ? 'Admin Portal'
    : 'Farm risk advisor'

  const RoleIcon = isAgent ? Users
    : isLender  ? Store
    : isBuyer   ? ShoppingCart
    : isAdmin   ? Shield
    : Sprout

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
            {roleLabel}
          </p>
        </div>
      </div>

      {/* Profile / role info */}
      {!isFarmer ? (
        <div className="mx-3 mt-3 p-3 bg-dark-base rounded-xl border border-border-subtle">
          <div className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold mb-2',
            isAgent ? 'bg-blue-500 text-blue-100'
              : isLender ? 'bg-purple-500 text-purple-100'
              : isBuyer ? 'bg-orange-500 text-orange-100'
              : 'bg-red-500 text-red-100'
          )}>
            {isAgent ? 'AG' : isLender ? 'LD' : isBuyer ? 'BY' : 'AD'}
          </div>
          <p className="text-sm font-medium text-text-primary leading-tight">
            {isAgent ? 'Agent Portal' : isLender ? 'Lender Portal' : isBuyer ? 'Buyer Portal' : 'Admin Portal'}
          </p>
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
      {isFarmer && (
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
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
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
                  ? cn(activeStyle.color, activeStyle.bg)
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
'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Sprout, MessageSquare, History, Building2, Users, Bug, UserCog, LogOut,
  LayoutDashboard, ClipboardCheck, ShieldCheck, Bot, ShoppingCart, Store,
  Shield, BarChart3, Settings, FileText, CalendarCheck, Menu,
} from 'lucide-react'
import { FarmerProfile, Language, RiskLevel } from '@/lib/types'
import { getSession, type UserRole } from '@/lib/auth'
import { CROPS } from '@/lib/constants'
import { RiskBadge } from '@/components/shared/RiskBadge'
import { cn } from '@/lib/utils'
import { useChatBot } from '@/components/chatbot/ChatBotContext'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const FARMER_NAV = [
  { label: 'Assessment',    icon: MessageSquare,    href: '/chat'      },
  { label: 'My history',    icon: History,          href: '/dashboard' },
  { label: 'AI Assistant',  icon: Bot,              href: '/chatbot'   },
  { label: 'Loan products', icon: Building2,        href: '/loans'     },
  { label: 'Chama',         icon: Users,            href: '/chama'     },
  { label: 'Pest check',    icon: Bug,              href: '/pest-check'},
  { label: 'Profile',       icon: UserCog,          href: '/profile'   },
]

const AGENT_NAV = [
  { label: 'Dashboard',      icon: LayoutDashboard,   href: '/agent/dashboard' },
  { label: 'Verify Farmers', icon: ClipboardCheck,    href: '/agent/verify'    },
  { label: 'Flagged',        icon: ShieldCheck,       href: '/agent/flagged'   },
  { label: 'Schedule',       icon: CalendarCheck,     href: '/agent/schedule'  },
  { label: 'AI Assistant',   icon: Bot,               href: '/chatbot'         },
  { label: 'Profile',        icon: UserCog,           href: '/profile'         },
]

const LENDER_NAV = [
  { label: 'Dashboard',      icon: LayoutDashboard,   href: '/lender'             },
  { label: 'Applications',   icon: FileText,          href: '/lender'             },
  { label: 'Portfolio',      icon: BarChart3,         href: '/lender/portfolio'    },
  { label: 'AI Assistant',   icon: Bot,               href: '/chatbot'            },
  { label: 'Profile',        icon: UserCog,           href: '/profile'            },
]

const BUYER_NAV = [
  { label: 'Dashboard',      icon: LayoutDashboard,  href: '/buyer' },
  { label: 'AI Assistant',   icon: Bot,               href: '/chatbot' },
  { label: 'Profile',        icon: UserCog,           href: '/profile' },
]

const ADMIN_NAV = [
  { label: 'Dashboard',       icon: LayoutDashboard,   href: '/admin'          },
  { label: 'User Management', icon: Users,             href: '/admin/users'    },
  { label: 'Analytics',       icon: BarChart3,         href: '/admin/analytics' },
  { label: 'AI Assistant',    icon: Bot,               href: '/chatbot'         },
  { label: 'Settings',        icon: Settings,          href: '/admin/settings'  },
  { label: 'Profile',         icon: UserCog,           href: '/profile'         },
]

export function AppSidebar() {
  const router   = useRouter()
  const pathname = usePathname()
  const chatBot  = useChatBot()

  const [profile,  setProfile]  = useState<FarmerProfile | null>(null)
  const [language, setLanguage] = useState<Language>('en')
  const [role,     setRole]     = useState<UserRole | null>(null)
  const [optimisticHref, setOptimisticHref] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const riskLevel: RiskLevel = typeof window !== 'undefined'
    ? (() => { try { const v = localStorage.getItem('kilimo-chat-risk'); return v ? JSON.parse(v) : 'UNKNOWN' } catch { return 'UNKNOWN' } })()
    : 'UNKNOWN'

  useEffect(() => {
    const savedLang = localStorage.getItem('kilimo-language') as Language | null
    const savedProfile = localStorage.getItem('kilimo-profile')
    const sess = getSession()

    if (savedLang) setLanguage(savedLang)
    if (sess.role) setRole(sess.role)
    if (savedProfile) {
      try { setProfile(JSON.parse(savedProfile)) } catch {}
    }
  }, [])

  useEffect(() => {
    if (optimisticHref && pathname.startsWith(optimisticHref)) {
      setOptimisticHref(null)
    }
  }, [pathname, optimisticHref])

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

  const isRouteActive = (href: string) => {
    if (optimisticHref === href) return true
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  const isAgent  = role === 'agent'
  const isLender = role === 'lender'
  const isBuyer  = role === 'buyer'
  const isAdmin  = role === 'admin'
  const isFarmer = role !== 'agent' && role !== 'lender' && role !== 'buyer' && role !== 'admin'

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
    ? (profile.crops && profile.crops.length > 0
        ? (CROPS.find(c => c.value === profile.crops[0].crop)?.label[language] ?? profile.crops[0].crop)
        : profile.crop || '')
    : ''

  const initials = profile?.name
    ? profile.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '??'

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }) } catch {}
    const keys = [
      'kilimo-session', 'kilimo-token', 'kilimo-profile',
      'kilimo-chat-messages', 'kilimo-chat-steps', 'kilimo-chat-risk', 'kilimo-chat-result',
      'kilimo-assessments', 'kilimo-email',
    ]
    keys.forEach(k => { try { localStorage.removeItem(k) } catch {} })
    router.push('/')
  }

  const handleNavClick = (href: string, isChatBotItem: boolean) => {
    setSheetOpen(false)
    if (isChatBotItem) {
      chatBot.openChatBot()
    } else {
      setOptimisticHref(href)
      router.push(href)
    }
  }

  const renderProfileCard = () => {
    if (!isFarmer) {
      return (
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
      )
    }

    if (profile) {
      return (
        <div className="mx-3 mt-3 p-3 bg-dark-base rounded-xl border border-border-subtle">
          <div className="w-9 h-9 rounded-full bg-green-primary flex items-center justify-center text-xs font-semibold text-green-100 mb-2">
            {initials}
          </div>
          <p className="text-sm font-medium text-text-primary leading-tight">{profile.name}</p>
          <p className="text-[11px] text-text-muted mt-0.5">{profile.county} · {cropLabel}</p>
          <div className="mt-2 pt-2 border-t border-border-subtle flex justify-between text-[11px]">
            <span className="text-text-muted/60">Acreage</span>
            <span className="text-text-muted font-medium">{profile.crops?.reduce((s, c) => s + (c.acres || 0), 0) || profile.acres || 0} ac</span>
          </div>
        </div>
      )
    }

    return (
      <div className="mx-3 mt-3 p-3 bg-dark-base rounded-xl border border-border-subtle">
        <div className="w-9 h-9 rounded-full bg-dark-mid flex items-center justify-center text-xs font-semibold text-text-muted mb-2">
          {initials}
        </div>
        <p className="text-sm font-medium text-text-primary leading-tight">
          {getSession().name || 'Farmer'}
        </p>
        <p className="text-[11px] text-text-muted mt-0.5">{getSession().county || '—'}</p>
      </div>
    )
  }

  const renderNavItems = () => (
    <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border-subtle scrollbar-track-transparent" aria-label="App navigation">
      <p className="text-[10px] uppercase tracking-widest text-text-muted/50 px-3 mb-1">Navigate</p>
      {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
        const isChatBotItem = href === '/chatbot'
        const active = isChatBotItem ? chatBot.open : isRouteActive(href)
        return (
          <button
            key={href}
            onClick={() => handleNavClick(href, isChatBotItem)}
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
  )

  const renderSidebarInner = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border-subtle shrink-0">
        <div className="w-8 h-8 rounded-lg bg-green-primary flex items-center justify-center shrink-0">
          <Sprout className="w-4 h-4 text-green-100" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary leading-none">Kilimo AI</p>
          <p className="text-[10px] text-text-muted mt-0.5 leading-none">{roleLabel}</p>
        </div>
      </div>

      {renderProfileCard()}

      {isFarmer && (
        <button
          onClick={() => handleNavClick('/chat', false)}
          className="mx-3 mt-2 w-full text-left shrink-0"
        >
          <div className="flex items-center gap-2 px-3 py-2 bg-dark-base rounded-lg border border-border-subtle hover:border-green-primary/30 transition-all cursor-pointer">
            <span className="text-[11px] text-text-muted flex-1">Risk score</span>
            <RiskBadge level={riskLevel} compact />
          </div>
        </button>
      )}

      <div className="mt-4 px-3">
        {renderNavItems()}
      </div>

      <div className="px-3 pb-4 pt-2 border-t border-border-subtle mt-auto shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-border-subtle text-[12px] text-text-muted hover:text-text-primary hover:border-red-500/40 hover:bg-dark-base transition-all duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile header + Sheet drawer */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-dark-mid border-b border-border-subtle flex items-center gap-2 px-4">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button className="p-1.5 -ml-1 text-text-muted hover:text-text-primary rounded-md hover:bg-dark-base transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0 bg-dark-mid border-border-subtle">
            {renderSidebarInner()}
          </SheetContent>
        </Sheet>
        <Sprout className="w-4 h-4 text-green-primary shrink-0" />
        <span className="text-sm font-semibold text-text-primary">Kilimo AI</span>
        <span className="text-[10px] text-text-muted hidden sm:inline">{roleLabel}</span>
        <div className="ml-auto flex items-center gap-2">
          {isFarmer && <RiskBadge level={riskLevel} compact />}
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[220px] shrink-0 bg-dark-mid border-r border-border-subtle overflow-hidden">
        {renderSidebarInner()}
      </aside>
    </>
  )
}

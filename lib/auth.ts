export type UserRole = 'farmer' | 'agent' | 'lender' | 'buyer' | 'admin'

export interface UserSession {
  isAuthenticated: boolean
  role: UserRole | null
  name: string
  email: string
  county: string
  subRole?: string
}

const SESSION_KEY = 'kilimo-session'

const MOCK_USERS: Record<string, { password: string; role: UserRole; name: string; email: string; county: string }> = {
  'farmer@kilimo.com': { password: 'farmer123', role: 'farmer', name: 'Jane Muthoni', email: 'farmer@kilimo.com', county: 'Kiambu' },
  'agent@kilimo.com': { password: 'agent123', role: 'agent', name: 'Peter Kamau', email: 'agent@kilimo.com', county: 'Murang\'a' },
  'lender@kilimo.com': { password: 'lender123', role: 'lender', name: 'Equity Bank', email: 'lender@kilimo.com', county: 'Nairobi' },
  'buyer@kilimo.com': { password: 'buyer123', role: 'buyer', name: 'Twiga Foods', email: 'buyer@kilimo.com', county: 'Nairobi' },
  'admin@kilimo.com': { password: 'admin123', role: 'admin', name: 'Admin User', email: 'admin@kilimo.com', county: 'Nairobi' },
}

export function getDefaultSession(): UserSession {
  return {
    isAuthenticated: false,
    role: null,
    name: '',
    email: '',
    county: '',
  }
}

export function getSession(): UserSession {
  if (typeof window === 'undefined') return getDefaultSession()
  try {
    const stored = localStorage.getItem(SESSION_KEY)
    if (!stored) return getDefaultSession()
    return JSON.parse(stored)
  } catch {
    return getDefaultSession()
  }
}

export function saveSession(session: UserSession): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function login(email: string, password: string): { success: boolean; error?: string } {
  const user = MOCK_USERS[email]
  if (!user) return { success: false, error: 'User not found. Try farmer@kilimo.com / farmer123' }
  if (user.password !== password) return { success: false, error: 'Incorrect password' }

  const session: UserSession = {
    isAuthenticated: true,
    role: user.role,
    name: user.name,
    email: user.email,
    county: user.county,
  }

  if (user.role === 'farmer') {
    session.subRole = 'agent'
  }

  saveSession(session)
  return { success: true }
}

export function signup(name: string, email: string, county: string, role: UserRole): { success: boolean } {
  const session: UserSession = {
    isAuthenticated: true,
    role,
    name,
    email,
    county,
  }
  saveSession(session)
  return { success: true }
}

export function logout(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}

export function isAuthenticated(): boolean {
  return getSession().isAuthenticated
}

export function getUserRole(): UserRole | null {
  return getSession().role
}

export function getDashboardPath(role: UserRole | null): string {
  switch (role) {
    case 'farmer': return '/dashboard'
    case 'agent': return '/agent'
    case 'lender': return '/lender'
    case 'buyer': return '/buyer'
    case 'admin': return '/admin'
    default: return '/auth/login'
  }
}
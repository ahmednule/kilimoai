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
const TOKEN_KEY = 'kilimo-token'

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

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

function saveSession(session: UserSession, token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  localStorage.setItem(TOKEN_KEY, token)
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!data.success) {
      return { success: false, error: data.error || 'Login failed' }
    }

    const session: UserSession = {
      isAuthenticated: true,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      county: data.user.county,
    }
    saveSession(session, data.sessionToken)
    return { success: true }
  } catch {
    return { success: false, error: 'Network error. Please try again.' }
  }
}

export async function signup(
  name: string,
  email: string,
  password: string,
  county: string,
  role: UserRole
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, county, role }),
    })

    const data = await res.json()

    if (!data.success) {
      return { success: false, error: data.error || 'Signup failed' }
    }

    const session: UserSession = {
      isAuthenticated: true,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      county: data.user.county,
    }
    saveSession(session, data.sessionToken)
    return { success: true }
  } catch {
    return { success: false, error: 'Network error. Please try again.' }
  }
}

export function logout(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(TOKEN_KEY)
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

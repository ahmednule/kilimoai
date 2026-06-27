import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/features',
  '/how-it-works',
  '/learn/chama',
  '/learn/loans',
  '/pest-disease',
  '/privacy',
  '/auth/login',
  '/auth/signup',
  '/auth/verify',
  '/auth/forgot-password',
  '/auth/reset-password',
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/')) ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/images/')

  if (isPublic) return NextResponse.next()

  const token = request.cookies.get('kilimo-token')
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
}

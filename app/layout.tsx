import type { Metadata, Viewport } from 'next'
import { DM_Sans, Fraunces, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { OfflineIndicator } from '@/components/shared/OfflineIndicator'
import './globals.css'

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const fraunces = Fraunces({ 
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Kilimo AI - Farm Financial Decision Engine',
  description: 'Know the truth before you borrow. AI-powered farm financial intelligence for Kenyan smallholder farmers.',
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: ['farm', 'loan', 'agriculture', 'Kenya', 'AI', 'financial', 'smallholder', 'farmers'],
  authors: [{ name: 'Kenya AI Challenge 2026' }],
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Kilimo AI',
  },
  openGraph: {
    title: 'Kilimo AI - Farm Financial Decision Engine',
    description: 'Know the truth before you borrow. AI-powered farm financial intelligence for Kenyan smallholder farmers.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1A7A4A',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable} ${jetbrainsMono.variable} bg-dark-base`}>
      <body className="font-sans antialiased bg-dark-base text-text-primary min-h-screen">
        <div className="grain-overlay" aria-hidden="true" />
        {children}
        <OfflineIndicator />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

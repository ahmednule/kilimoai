import type { Metadata } from 'next'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Auth - Kilimo AI',
  description: 'Log in or sign up to Kilimo AI',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1d24',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#e8edf5',
          },
        }}
      />
      <div className="relative z-10 min-h-screen bg-dark-base flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="bg-dark-mid border border-border-subtle rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid md:grid-cols-2">
            {/* Left Panel - Brand */}
            <div className="hidden md:flex relative overflow-hidden bg-gradient-to-br from-green-primary/90 to-green-primary p-12 flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-8">
                  <svg className="w-8 h-8 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8l-3-4H6Z" />
                    <path d="M3 6h18" /><path d="M18 10v4" /><path d="M12 10v4" />
                    <path d="M6 10v4" /><path d="M18 18v2" /><path d="M12 18v2" />
                    <path d="M6 18v2" />
                  </svg>
                </div>
                <h2 className="font-serif text-3xl font-bold text-text-primary leading-tight">
                  Kilimo AI
                </h2>
                <p className="mt-3 text-text-primary/80 text-sm leading-relaxed max-w-xs">
                  Jua Ukweli Kabla ya Kukopa — AI-powered farm financial intelligence for Kenyan smallholder farmers.
                </p>
              </div>
              <div className="space-y-4 mt-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold text-text-primary">1</div>
                  <span className="text-text-primary/90 text-sm">Real weather & market data</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold text-text-primary">2</div>
                  <span className="text-text-primary/90 text-sm">Honest loan risk assessment</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold text-text-primary">3</div>
                  <span className="text-text-primary/90 text-sm">100% free for farmers</span>
                </div>
              </div>
            </div>
            {/* Right Panel - Form */}
            <div className="p-8 md:p-12">
              {children}
            </div>
          </div>
        </div>
        <p className="text-center mt-6 text-text-muted text-xs">
          &copy; {new Date().getFullYear()} Kilimo AI. Built for the Kenya AI Challenge 2026.
        </p>
      </div>
      </div>
    </>
  )
}

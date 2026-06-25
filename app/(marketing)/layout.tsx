'use client'

import { useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { motion, useScroll } from 'framer-motion'
import { Sprout, LogIn, UserPlus, ArrowRight } from 'lucide-react'
import { LanguageContext, LanguageToggle, Language } from '@/components/marketing/shared'

const NAV_TEXT = {
  en: {
    login: 'Sign In',
    signup: 'Start Free',
    tagline: 'Know the truth before you borrow',
    credit: 'Built for the Kenya AI Challenge 2026 | Mercy Corps AgriFin',
  },
  sw: {
    login: 'Ingia',
    signup: 'Anza Bure',
    tagline: 'Jua ukweli kabla ya kukopa',
    credit: 'Imejengwa kwa Changamoto ya AI ya Kenya 2026 | Mercy Corps AgriFin',
  },
}

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useEffect(() => {
    const saved = localStorage.getItem('kilimo-language') as Language | null
    if (saved) setLanguage(saved)
    const unsub = scrollY.on('change', (v) => setScrolled(v > 60))
    return () => unsub()
  }, [scrollY])

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('kilimo-language', lang)
  }

  const t = NAV_TEXT[language]

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <div className="relative z-10 min-h-screen bg-dark-base overflow-x-hidden">
        {/* Navbar */}
        <motion.nav
          animate={{
            height: scrolled ? 56 : 64,
            backgroundColor: scrolled ? 'rgba(15,26,19,0.95)' : 'rgba(15,26,19,0.8)',
            borderBottomColor: scrolled ? 'rgba(26,122,74,0.2)' : 'rgba(255,255,255,0.08)',
          }}
          className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex items-center justify-between h-full gap-3">
              <Link href="/" className="flex items-center gap-2 group shrink-0">
                <motion.div
                  whileHover={{ rotate: -10, scale: 1.05 }}
                  className="w-9 h-9 rounded-xl bg-green-primary flex items-center justify-center transition-colors"
                >
                  <Sprout className="w-5 h-5 text-text-primary" />
                </motion.div>
                <motion.span
                  animate={{ fontSize: scrolled ? '1rem' : '1.125rem' }}
                  className="hidden sm:inline font-serif font-semibold text-text-primary"
                >
                  Kilimo AI
                </motion.span>
              </Link>
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-text-secondary hover:text-green-400 transition-colors rounded-xl hover:bg-green-primary/5 border border-transparent hover:border-green-primary/20"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t.login}</span>
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-gold-harvest text-dark-base rounded-xl hover:bg-gold-harvest/90 transition-all shadow-lg shadow-gold-harvest/20 hover:shadow-gold-harvest/30 active:scale-[0.97]"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t.signup}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <LanguageToggle language={language} onChange={handleLanguageChange} />
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Page content */}
        <div className="pt-16">{children}</div>

        {/* Footer */}
        <footer className="py-12 bg-dark-mid border-t border-border-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-green-primary flex items-center justify-center">
                  <Sprout className="w-6 h-6 text-text-primary" />
                </div>
                <div>
                  <span className="font-serif text-lg font-semibold text-text-primary">Kilimo AI</span>
                  <p className="text-xs text-text-muted">{t.tagline}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-wrap gap-3 text-xs text-text-muted">
                  <Link href="/how-it-works" className="hover:text-text-primary transition-colors">
                    {language === 'en' ? 'How It Works' : 'Jinsi Inavyofanya Kazi'}
                  </Link>
                  <Link href="/features" className="hover:text-text-primary transition-colors">
                    {language === 'en' ? 'Features' : 'Vipengele'}
                  </Link>
                  <Link href="/learn/chama" className="hover:text-text-primary transition-colors">
                    {language === 'en' ? 'Chama' : 'Chama'}
                  </Link>
                  <Link href="/learn/loans" className="hover:text-text-primary transition-colors">
                    {language === 'en' ? 'Loans' : 'Mikopo'}
                  </Link>
                  <Link href="/pest-disease" className="hover:text-text-primary transition-colors">
                    {language === 'en' ? 'Pest & Disease' : 'Wadudu na Magonjwa'}
                  </Link>
                  <Link href="/about" className="hover:text-text-primary transition-colors">
                    {language === 'en' ? 'About' : 'Kuhusu'}
                  </Link>
                </div>
                <div className="flex items-center gap-4">
                  <LanguageToggle language={language} onChange={handleLanguageChange} />
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-border-subtle text-center">
              <p className="text-text-muted text-sm">{t.credit}</p>
            </div>
          </div>
        </footer>
      </div>
    </LanguageContext.Provider>
  )
}
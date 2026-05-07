'use client'

import Link from 'next/link'
import { Sprout } from 'lucide-react'
import { Language } from '@/lib/types'
import { UI_TEXT } from '@/lib/constants'
import { LanguageToggle } from '@/components/shared/LanguageToggle'

interface FooterProps {
  language: Language
  onLanguageChange: (language: Language) => void
}

export function Footer({ language, onLanguageChange }: FooterProps) {
  const t = UI_TEXT[language]

  return (
    <footer className="bg-dark-mid border-t border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-green-primary flex items-center justify-center">
                <Sprout className="w-6 h-6 text-text-primary" />
              </div>
              <span className="font-serif text-xl font-semibold text-text-primary">
                Kilimo AI
              </span>
            </Link>
            <p className="text-text-muted text-sm">{t.footerTagline}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {t.footerLinks.map((link, index) => (
              <Link 
                key={index}
                href="#" 
                className="text-text-muted hover:text-text-primary transition-colors text-sm"
              >
                {link}
              </Link>
            ))}
          </div>

          <LanguageToggle 
            language={language} 
            onChange={onLanguageChange}
          />
        </div>

        <div className="mt-8 pt-8 border-t border-border-subtle">
          <p className="text-center text-text-muted text-xs">
            {t.footerCredit}
          </p>
        </div>
      </div>
    </footer>
  )
}

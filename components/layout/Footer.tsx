import Link from 'next/link'
import { Sprout } from 'lucide-react'
import type { Language } from '@/lib/types'

interface FooterProps {
  language: Language
  onLanguageChange?: (language: Language) => void
}

export function Footer({ language }: FooterProps) {
  return (
    <footer className="bg-dark-mid border-t border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-green-primary flex items-center justify-center">
              <Sprout className="w-6 h-6 text-text-primary" />
            </div>
            <div>
              <span className="font-serif text-lg font-semibold text-text-primary">Kilimo AI</span>
              <p className="text-xs text-text-muted">
                {language === 'en' ? 'Know the truth before you borrow' : 'Jua ukweli kabla ya kukopa'}
              </p>
            </div>
          </div>
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
        </div>
        <div className="mt-8 pt-8 border-t border-border-subtle text-center">
          <p className="text-text-muted text-xs">
            {language === 'en'
              ? 'Built for the Kenya AI Challenge 2026 | Mercy Corps AgriFin'
              : 'Imejengwa kwa Changamoto ya AI ya Kenya 2026 | Mercy Corps AgriFin'}
          </p>
        </div>
      </div>
    </footer>
  )
}

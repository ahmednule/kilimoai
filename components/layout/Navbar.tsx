'use client'

import Link from 'next/link'
import { Sprout } from 'lucide-react'
import { Language } from '@/lib/types'
import { LanguageToggle } from '@/components/shared/LanguageToggle'

interface NavbarProps {
  language: Language
  onLanguageChange: (language: Language) => void
}

export function Navbar({ language, onLanguageChange }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-base/80 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-green-primary flex items-center justify-center group-hover:bg-green-light transition-colors">
              <Sprout className="w-6 h-6 text-text-primary" />
            </div>
            <span className="font-serif text-xl font-semibold text-text-primary">
              Kilimo AI
            </span>
          </Link>
          
          <LanguageToggle 
            language={language} 
            onChange={onLanguageChange}
          />
        </div>
      </div>
    </nav>
  )
}

'use client'

import { Language } from '@/lib/types'
import { cn } from '@/lib/utils'

interface LanguageToggleProps {
  language: Language
  onChange: (language: Language) => void
  className?: string
}

export function LanguageToggle({ language, onChange, className }: LanguageToggleProps) {
  return (
    <div className={cn("flex items-center gap-1 rounded-full bg-dark-mid p-1", className)}>
      <button
        onClick={() => onChange('en')}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200",
          language === 'en'
            ? "bg-green-primary text-text-primary"
            : "text-text-muted hover:text-text-primary"
        )}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <button
        onClick={() => onChange('sw')}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200",
          language === 'sw'
            ? "bg-green-primary text-text-primary"
            : "text-text-muted hover:text-text-primary"
        )}
        aria-pressed={language === 'sw'}
      >
        SW
      </button>
    </div>
  )
}

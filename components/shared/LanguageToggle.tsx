'use client'

import { Language, LANGUAGES } from '@/lib/types'
import { cn } from '@/lib/utils'

interface LanguageToggleProps {
  language: Language
  onChange: (language: Language) => void
  className?: string
}

export function LanguageToggle({ language, onChange, className }: LanguageToggleProps) {
  return (
    <select
      value={language}
      onChange={e => onChange(e.target.value as Language)}
      className={cn(
        "px-3 py-1.5 text-sm font-medium rounded-lg bg-dark-mid border border-border-subtle text-text-primary focus:outline-none focus:border-green-primary/50 cursor-pointer appearance-none",
        className
      )}
    >
      {LANGUAGES.map(l => (
        <option key={l.code} value={l.code}>{l.native} ({l.code.toUpperCase()})</option>
      ))}
    </select>
  )
}

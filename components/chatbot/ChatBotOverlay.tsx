'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { FarmerProfile, Language } from '@/lib/types'
import { ChatBotPanel } from '@/components/chatbot/ChatBotPanel'
import { useChatBot } from '@/components/chatbot/ChatBotContext'

export function ChatBotOverlay() {
  const { open, closeChatBot } = useChatBot()
  const [profile, setProfile] = useState<FarmerProfile | null>(null)
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    const savedLang = localStorage.getItem('kilimo-language') as Language | null
    const savedProfile = localStorage.getItem('kilimo-profile')

    if (savedLang) setLanguage(savedLang)

    if (savedProfile) {
      try {
        const parsed: FarmerProfile = JSON.parse(savedProfile)
        setProfile(parsed)
        if (parsed.language) setLanguage(parsed.language)
      } catch { /* corrupt */ }
    }
  }, [])

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('kilimo-language', lang)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-dark-base flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle bg-dark-mid shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-primary flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-100">
                  <path d="M12 8V4H8" />
                  <rect width="16" height="12" x="4" y="8" rx="2" />
                  <path d="M2 14h2" />
                  <path d="M20 14h2" />
                  <path d="M15 13v2" />
                  <path d="M9 13v2" />
                </svg>
              </div>
              <span className="text-sm font-medium text-text-primary">
                {language === 'sw' ? 'Msaidizi wa Kilimo' : 'AI Farming Assistant'}
              </span>
            </div>
            <button
              onClick={closeChatBot}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-dark-base transition-colors"
              aria-label="Close assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <ChatBotPanel
            profile={profile}
            language={language}
            onLanguageChange={handleLanguageChange}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
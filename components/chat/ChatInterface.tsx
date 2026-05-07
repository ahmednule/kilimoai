'use client'

import { useState, useRef, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { RefreshCw, Sprout, Menu, X } from 'lucide-react'
import { ChatMessage as ChatMessageType, FarmerProfile, Language, RiskLevel, ScenarioResult } from '@/lib/types'
import { QUICK_REPLIES, UI_TEXT, CROPS } from '@/lib/constants'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { QuickReplies } from './QuickReplies'
import { TypingIndicator } from './TypingIndicator'
import { RiskBadge } from '@/components/shared/RiskBadge'
import { LanguageToggle } from '@/components/shared/LanguageToggle'
import { cn } from '@/lib/utils'

interface ChatInterfaceProps {
  profile: FarmerProfile
  onReset: () => void
  onLanguageChange: (language: Language) => void
}

export function ChatInterface({ profile, onReset, onLanguageChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentRisk, setCurrentRisk] = useState<RiskLevel>('UNKNOWN')
  const [language, setLanguage] = useState<Language>(profile.language)
  const [showSidebar, setShowSidebar] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const t = UI_TEXT[language]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Initial greeting
  useEffect(() => {
    const greeting = language === 'sw'
      ? `Asante ${profile.name}! Niko tayari kukusaidia kufanya uamuzi sahihi kuhusu mkopo wako wa kilimo. Unapanga kukopa kiasi gani kwa ${CROPS.find(c => c.value === profile.crop)?.label.sw || profile.crop}?`
      : `Thank you ${profile.name}! I'm ready to help you make the right decision about your farm loan. How much are you planning to borrow for your ${CROPS.find(c => c.value === profile.crop)?.label.en || profile.crop}?`

    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      }
    ])
  }, [profile, language])

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    onLanguageChange(lang)
  }

  const sendMessage = async (content: string) => {
    // Optimistic update - add user message immediately
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          farmerProfile: profile,
          language,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      const assistantMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
        scenarios: data.scenarios as ScenarioResult | undefined,
      }

      setMessages(prev => [...prev, assistantMessage])

      // Update risk level if scenarios returned
      if (data.scenarios?.riskLevel) {
        setCurrentRisk(data.scenarios.riskLevel)
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'sw'
          ? 'Samahani, kulikuwa na tatizo. Tafadhali jaribu tena.'
          : 'Sorry, there was an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const quickReplies = QUICK_REPLIES[language]
  const cropLabel = CROPS.find(c => c.value === profile.crop)?.label[language] || profile.crop

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-dark-base">
      {/* Mobile header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-dark-mid border-b border-border-subtle">
        <button
          onClick={() => setShowSidebar(true)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-dark-base border border-border-subtle"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-text-primary" />
        </button>
        <div className="flex items-center gap-2">
          <Sprout className="w-6 h-6 text-green-primary" />
          <span className="font-serif text-lg font-semibold text-text-primary">Kilimo AI</span>
        </div>
        <LanguageToggle language={language} onChange={handleLanguageChange} />
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-80 bg-dark-mid border-r border-border-subtle flex flex-col transition-transform duration-300 lg:translate-x-0",
        showSidebar ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar header */}
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-green-primary flex items-center justify-center">
              <Sprout className="w-6 h-6 text-text-primary" />
            </div>
            <span className="font-serif text-lg font-semibold text-text-primary">Kilimo AI</span>
          </div>
          <button
            onClick={() => setShowSidebar(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-base transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Profile summary */}
        <div className="p-4 space-y-4 flex-1">
          <div className="bg-dark-base rounded-xl p-4 border border-border-subtle">
            <h3 className="text-xs uppercase tracking-wider text-text-muted mb-3">
              {t.yourProfile}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Name</span>
                <span className="text-text-primary font-medium">{profile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">County</span>
                <span className="text-text-primary font-medium">{profile.county}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Crop</span>
                <span className="text-text-primary font-medium">{cropLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Acres</span>
                <span className="text-text-primary font-medium font-mono">{profile.acres}</span>
              </div>
            </div>
          </div>

          {/* Risk indicator */}
          <div className="bg-dark-base rounded-xl p-4 border border-border-subtle">
            <h3 className="text-xs uppercase tracking-wider text-text-muted mb-3">
              {t.riskLevel}
            </h3>
            <RiskBadge level={currentRisk} className="w-full justify-center py-2" />
          </div>

          {/* Language toggle (desktop) */}
          <div className="hidden lg:block">
            <LanguageToggle 
              language={language} 
              onChange={handleLanguageChange}
              className="w-full justify-center"
            />
          </div>
        </div>

        {/* New assessment button */}
        <div className="p-4 border-t border-border-subtle">
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 py-3 bg-dark-base border border-border-subtle rounded-xl text-text-muted hover:text-text-primary hover:border-green-primary/50 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            {t.newAssessment}
          </button>
        </div>
      </aside>

      {/* Sidebar overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Chat area */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                language={language} 
              />
            ))}
            
            <AnimatePresence>
              {isLoading && <TypingIndicator language={language} />}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick replies */}
        <div className="px-4 pb-2">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence>
              {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
                <QuickReplies
                  suggestions={quickReplies}
                  onSelect={sendMessage}
                  disabled={isLoading}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input */}
        <ChatInput 
          onSend={sendMessage} 
          disabled={isLoading} 
          language={language} 
        />
      </main>
    </div>
  )
}

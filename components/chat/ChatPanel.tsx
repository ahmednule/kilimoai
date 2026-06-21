'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { ChatMessage as ChatMessageType, FarmerProfile, Language, RiskLevel, ScenarioResult } from '@/lib/types'
import { QUICK_REPLIES, UI_TEXT, CROPS } from '@/lib/constants'
import { ChatMessage } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { LanguageToggle } from '@/components/shared/LanguageToggle'
import { cn } from '@/lib/utils'

interface ChatPanelProps {
  profile: FarmerProfile
  language: Language
  onLanguageChange: (lang: Language) => void
  /** Called when the AI returns a risk level so the parent can update the tracker */
  onRiskUpdate: (level: RiskLevel) => void
  /** Called each time a step is completed */
  onStepComplete: (stepId: number) => void
  /** Called when the AI returns scenario results so the parent can persist them */
  onScenarioResult?: (scenarios: ScenarioResult) => void
}

function parseScenarioJSON(text: string): ScenarioResult | null {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
  if (!jsonMatch) return null
  try {
    const parsed = JSON.parse(jsonMatch[1])
    if (
      parsed.riskLevel &&
      parsed.verdict &&
      parsed.bestCase &&
      parsed.expectedCase &&
      parsed.worstCase
    ) {
      return parsed as ScenarioResult
    }
    return null
  } catch {
    return null
  }
}

function buildCropSummary(crops: { crop: string; acres: number }[], lang: Language): string {
  if (!crops.length) return ''
  return crops
    .map(c => {
      const label = CROPS.find(x => x.value === c.crop)?.label[lang] ?? c.crop
      return `${label} (${c.acres} ac)`
    })
    .join(', ')
}

export function ChatPanel({
  profile,
  language,
  onLanguageChange,
  onRiskUpdate,
  onStepComplete,
  onScenarioResult,
}: ChatPanelProps) {
  const [messages, setMessages]   = useState<ChatMessageType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [draft, setDraft]         = useState('')
  const messagesEndRef             = useRef<HTMLDivElement>(null)
  const textareaRef                = useRef<HTMLTextAreaElement>(null)
  const t                          = UI_TEXT[language]
  const quickReplies               = QUICK_REPLIES[language]
  const totalAcres = profile.crops.reduce((s, c) => s + c.acres, 0)
  const cropSummary = buildCropSummary(profile.crops, language)

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Initial greeting
  useEffect(() => {
    const greeting = language === 'sw'
      ? `Habari ${profile.name}! Niko tayari kukusaidia. Unapanga kukopa kiasi gani kwa ${cropSummary}?`
      : `Hello ${profile.name}! Ready to help you make the right call on your farm loan. You're growing ${cropSummary} on ${totalAcres} acres in ${profile.county} — how much are you looking to borrow?`

    setMessages([{
      id: '0',
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
    }])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMsg: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setDraft('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          farmerProfile: profile,
          language,
        }),
      })

      if (!res.ok) throw new Error('API error')

      const data = await res.json()

      const rawContent: string = data.message ?? data.reply ?? ''
      const scenarios = parseScenarioJSON(rawContent)
      const cleanContent = rawContent.replace(/```json[\s\S]*?```/, '').replace(/\n{3,}/g, '\n\n').trim()

      const assistantMsg: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cleanContent,
        timestamp: new Date(),
        scenarios: scenarios ?? undefined,
      }

      setMessages(prev => [...prev, assistantMsg])

      if (scenarios?.riskLevel) {
        onRiskUpdate(scenarios.riskLevel)
        onStepComplete(4) // risk analysis done
        onScenarioResult?.(scenarios)
      }
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'sw'
          ? 'Samahani, kulikuwa na tatizo. Tafadhali jaribu tena.'
          : 'Something went wrong — please try again.',
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(draft)
    }
  }

  const lastIsAssistant =
    messages.length > 0 && messages[messages.length - 1].role === 'assistant'

  return (
    <section className="flex-1 flex flex-col min-w-0 bg-dark-base overflow-hidden">

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle bg-dark-mid shrink-0">
        <p className="text-[13px] text-text-muted">
          Chatting as <span className="text-text-primary font-medium">{profile.name}</span>
        </p>
        <LanguageToggle language={language} onChange={onLanguageChange} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin scrollbar-thumb-border-subtle scrollbar-track-transparent">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} language={language} />
        ))}

        <AnimatePresence>
          {isLoading && <TypingIndicator language={language} />}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Quick-reply chips */}
      <AnimatePresence>
        {!isLoading && lastIsAssistant && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-5 pb-2 flex gap-2 flex-wrap"
          >
            {quickReplies.slice(0, 4).map(reply => (
              <button
                key={reply}
                onClick={() => sendMessage(reply)}
                className="px-3 py-1.5 border border-border-subtle rounded-full text-[12px] text-green-400 hover:bg-green-primary/10 hover:border-green-primary/40 transition-all duration-150 whitespace-nowrap"
              >
                {reply}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="px-5 py-3 border-t border-border-subtle bg-dark-mid shrink-0 flex items-center gap-3">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKey}
          placeholder={t.chatPlaceholder ?? 'Ask about your loan, risk, or crop…'}
          rows={1}
          disabled={isLoading}
          className={cn(
            'flex-1 resize-none bg-dark-base border border-border-subtle rounded-xl px-4 py-2.5 text-[13px] text-text-primary placeholder:text-text-muted/40',
            'focus:outline-none focus:ring-1 focus:ring-green-primary/50 focus:border-green-primary',
            'transition-all duration-150 min-h-[42px] max-h-[120px] leading-relaxed',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        />
        <button
          onClick={() => sendMessage(draft)}
          disabled={!draft.trim() || isLoading}
          aria-label="Send message"
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150',
            draft.trim() && !isLoading
              ? 'bg-green-primary hover:bg-green-primary/80'
              : 'bg-green-primary/20 cursor-not-allowed'
          )}
        >
          <Send className="w-4 h-4 text-green-100" />
        </button>
      </div>
    </section>
  )
}
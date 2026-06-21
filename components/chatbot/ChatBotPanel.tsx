'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Send, Volume2, Mic, MicOff, Globe } from 'lucide-react'
import { ChatMessage as ChatMessageType, Language, FarmerProfile } from '@/lib/types'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { TypingIndicator } from '@/components/chat/TypingIndicator'
import { cn } from '@/lib/utils'

interface ChatBotPanelProps {
  profile: FarmerProfile | null
  language: Language
  onLanguageChange: (lang: Language) => void
}

const STT_LANG: Record<Language, string> = { en: 'en-KE', sw: 'sw-KE' }
const TTS_LANG: Record<Language, string> = { en: 'en-KE', sw: 'sw-KE' }

export function ChatBotPanel({ profile, language, onLanguageChange }: ChatBotPanelProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [draft, setDraft] = useState('')
  const [listening, setListening] = useState(false)
  const [sttSupported, setSttSupported] = useState(true)
  const recognitionRef = useRef<InstanceType<typeof SpeechRecognition> | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    const greeting = language === 'sw'
      ? 'Habari! Mimi ni msaidizi wako wa kilimo. Unaweza kuniuliza kuhusu mazao, wadudu, hali ya hewa, udongo, soko, au mifugo. Nitakusaidia kwa Kiswahili au Kiingereza. Uliza chochote!'
      : 'Hello! I\'m your farming assistant. Ask me about crops, pests, weather, soil, market prices, or livestock. I can help in English or Swahili. What would you like to know?'

    setMessages([{
      id: '0',
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
    }])

    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        setSttSupported(false)
        return
      }
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = STT_LANG[language]
    }
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMsg: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }
    const historyForApi = [...messages, userMsg]
    setMessages(historyForApi)
    setDraft('')
    setIsLoading(true)

    try {
      const farmerProfile: FarmerProfile = profile ?? {
        name: 'Farmer',
        county: 'Unknown',
        acres: 0,
        crop: 'maize',
        language,
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyForApi.map(m => ({ role: m.role, content: m.content })),
          farmerProfile,
          language,
          mode: 'general',
        }),
      })

      if (!res.ok) throw new Error('API error')

      const data = await res.json()

      const assistantMsg: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply ?? data.message ?? '',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMsg])
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
  }, [messages, isLoading, profile, language])

  const speakMessage = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = TTS_LANG[language]
    utterance.rate = 0.95
    window.speechSynthesis.speak(utterance)
  }, [language])

  const startListening = useCallback(() => {
    const rec = recognitionRef.current
    if (!rec || listening) return
    setListening(true)

    let finalTranscript = ''
    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }
      setDraft(finalTranscript + interim)
    }

    rec.onend = () => {
      setListening(false)
      if (finalTranscript.trim()) {
        sendMessage(finalTranscript.trim())
      }
    }

    rec.onerror = () => {
      setListening(false)
    }

    rec.lang = STT_LANG[language]
    rec.start()
  }, [listening, language, sendMessage])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(draft)
    }
  }

  const lastIsAssistant = messages.length > 0 && messages[messages.length - 1].role === 'assistant'

  return (
    <section className="flex-1 flex flex-col min-w-0 bg-dark-base overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle bg-dark-mid shrink-0">
        <p className="text-[13px] text-text-muted">
          {language === 'sw' ? 'Msaidizi wa Kilimo' : 'Farming Assistant'}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onLanguageChange(language === 'en' ? 'sw' : 'en')}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border-subtle text-[11px] text-text-muted hover:text-text-primary hover:border-green-primary/40 transition-all"
          >
            <Globe className="w-3 h-3" />
            {language === 'en' ? 'SW' : 'EN'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin scrollbar-thumb-border-subtle scrollbar-track-transparent">
        {messages.map(msg => (
          <div key={msg.id} className="relative group">
            <ChatMessage message={msg} language={language} />
            {msg.role === 'assistant' && (
              <button
                onClick={() => speakMessage(msg.content)}
                className="absolute -right-2 top-1 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-dark-mid border border-border-subtle text-text-muted hover:text-green-400"
                aria-label="Read aloud"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        <AnimatePresence>
          {isLoading && <TypingIndicator language={language} />}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      <div className="px-5 py-3 border-t border-border-subtle bg-dark-mid shrink-0 flex items-center gap-3">
        {sttSupported && (
          <button
            onClick={listening ? stopListening : startListening}
            disabled={isLoading}
            aria-label={listening ? 'Stop listening' : 'Start voice input'}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150',
              listening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-dark-base border border-border-subtle text-text-muted hover:text-green-400 hover:border-green-primary/40',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        )}

        <textarea
          ref={textareaRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={language === 'sw' ? 'Uliza swali la kilimo...' : 'Ask a farming question...'}
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

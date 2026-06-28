'use client'

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Send, Camera, X, Trash2, Mic, MicOff, Volume2 } from 'lucide-react'
import { ChatMessage as ChatMessageType, FarmerProfile, Language, ChatMode, RiskLevel, ScenarioResult, PestScanResult } from '@/lib/types'
import { QUICK_REPLIES, UI_TEXT, CROPS } from '@/lib/constants'
import { ChatMessage } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { LanguageToggle } from '@/components/shared/LanguageToggle'
import { cn } from '@/lib/utils'
import { getChatMessages, saveChatMessages, clearChatMessages } from '@/lib/chat'
import { useVoiceInput } from '@/components/chatbot/VoiceInput'
import { useVoiceOutput } from '@/components/chatbot/VoiceOutput'

interface ChatPanelProps {
  profile: FarmerProfile
  language: Language
  mode?: ChatMode
  onLanguageChange: (lang: Language) => void
  onModeChange?: (mode: ChatMode) => void
  onRiskUpdate: (level: RiskLevel) => void
  onStepComplete: (stepId: number) => void
  onScenarioResult?: (scenarios: ScenarioResult) => void
}

function parseScenarioJSON(text: string): ScenarioResult | null {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
  if (!jsonMatch) return null
  try {
    const parsed = JSON.parse(jsonMatch[1])
    if (parsed.riskLevel && parsed.verdict && parsed.bestCase && parsed.expectedCase && parsed.worstCase) {
      return parsed as ScenarioResult
    }
    return null
  } catch {
    return null
  }
}

function buildCropSummary(crops: { crop: string; acres: number }[], lang: Language): string {
  if (!crops.length) return ''
  return crops.map(c => {
    const label = CROPS.find(x => x.value === c.crop)?.label[lang] ?? c.crop
    return `${label} (${c.acres} ac)`
  }).join(', ')
}

export function ChatPanel({
  profile,
  language,
  mode = 'assessment',
  onLanguageChange,
  onModeChange,
  onRiskUpdate,
  onStepComplete,
  onScenarioResult,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>(() => {
    const saved = getChatMessages()
    return saved.length > 0 ? saved : []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [draft, setDraft] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const voiceInput = useVoiceInput({
    language,
    onResult: (transcript) => sendMessage(transcript),
  })
  const voiceOutput = useVoiceOutput(language)

  const t = UI_TEXT[language]
  const quickReplies = QUICK_REPLIES[language]

  const totalAcres = profile.crops.reduce((s, c) => s + c.acres, 0)
  const cropSummary = buildCropSummary(profile.crops, language)
  const rentDetail = profile.rentedAcres && profile.rentedAcres > 0
    ? `, ${profile.rentedAcres} rented at KES ${profile.rentCostPerAcre || 0}/acre`
    : ''

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Auto-save messages to localStorage with debounce
  useEffect(() => {
    if (!initialized) {
      setInitialized(true)
      return
    }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => saveChatMessages(messages), 500)
  }, [messages, initialized])

  // Add greeting only if no saved messages exist
  useEffect(() => {
    if (messages.length > 0) return

    const isGeneral = mode === 'general'
    const greeting = isGeneral
      ? (language === 'sw'
        ? `Habari ${profile.name}! Niko hapa kukusaidia na maswali yoyote ya kilimo. Unauliza nini kuhusu ${cropSummary}?`
        : `Hello ${profile.name}! I'm here to help with any farming questions. What would you like to know about your ${cropSummary}?`)
      : (language === 'sw'
        ? `Habari ${profile.name}! Niko tayari kukusaidia na tathmini ya mkopo wako. Unapanga kukopa kiasi gani kwa ${cropSummary}?`
        : `Hello ${profile.name}! Ready to help you make the right call on your farm loan. You're growing ${cropSummary} on ${totalAcres} acres${rentDetail} in ${profile.county} — how much are you looking to borrow?`)

    setMessages([{ id: '0', role: 'assistant', content: greeting, timestamp: new Date() }])
  }, [profile, cropSummary, totalAcres, language, mode])

  const handleClearHistory = useCallback(() => {
    clearChatMessages()
    setMessages([])
  }, [])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const TIMEOUT_MS = 30_000
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

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
      const allMessages = [...messages, userMsg]
      // Keep greeting (index 0) + last 19 messages to bound token usage
      const trimmed = allMessages.length > 20
        ? [allMessages[0], ...allMessages.slice(-19)]
        : allMessages

      const res = await fetch('/api/chat', {
        signal: controller.signal,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: trimmed.map(m => ({ role: m.role, content: m.content })),
          farmerProfile: profile,
          language,
          mode,
        }),
      })
      clearTimeout(timeoutId)

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
        onStepComplete(4)
        onScenarioResult?.(scenarios)
      }
    } catch (err: any) {
      clearTimeout(timeoutId)
      if (err?.name === 'AbortError') return
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'sw'
          ? 'Samahani, kulikuwa na tatizo. Tafadhali jaribu tena.'
          : 'Something went wrong — please try again.',
        timestamp: new Date(),
      }])
    } finally {
      if (controller === abortRef.current) {
        setIsLoading(false)
      }
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = () => setSelectedImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const scanImage = async () => {
    if (!selectedImage || isScanning) return
    setIsScanning(true)

    const imageUrl = selectedImage
    const userMsg: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: language === 'sw'
        ? '[Kuchambua picha ya mmea...]'
        : '[Scanning crop image...]',
      timestamp: new Date(),
      imageUrl,
    }
    setMessages(prev => [...prev, userMsg])
    setSelectedImage(null)
    setSelectedFile(null)

    try {
      const res = await fetch('/api/pest-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageUrl, source: 'authenticated' }),
      })

      if (!res.ok) throw new Error('Scan failed')

      const data = await res.json()
      const pestResult: PestScanResult = {
        pest: data.pest,
        confidence: data.confidence,
        severity: data.severity,
        recommendation: data.recommendation,
        isPest: data.isPest ?? (data.severity === 'HIGH' || data.severity === 'MEDIUM'),
        affectedCrops: data.affectedCrops,
        commonName: data.commonName,
        scientificName: data.scientificName,
        treatment: data.treatment,
      }

      const scanSummary = language === 'sw'
        ? `Uchambuzi wa picha umekamilika. Wadudu waliotambuliwa: **${data.pest}** (${data.confidence}% uhakika). Ukali: ${data.severity === 'HIGH' ? 'Juu' : data.severity === 'MEDIUM' ? 'Wastani' : 'Chini'}.`
        : `Image analysis complete. Identified: **${data.pest}** (${data.confidence}% confidence). Severity: ${data.severity}.`

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: scanSummary,
        timestamp: new Date(),
        pestScan: pestResult,
        imageUrl,
      }])

      const followUp = language === 'sw'
        ? `Nimegundua ${data.pest} kwenye mazao yako. Ungependa kujua zaidi kuhusu matibabu au kinga?`
        : `I spotted ${data.pest} on your crops. Would you like to know more about treatment or prevention?`
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: followUp,
        timestamp: new Date(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'sw'
          ? 'Samahani, uchambuzi wa picha ulishindwa. Tafadhali jaribu tena na picha iliyo wazi zaidi.'
          : 'Sorry, the image analysis failed. Please try again with a clearer photo.',
        timestamp: new Date(),
      }])
    } finally {
      setIsScanning(false)
    }
  }

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(draft)
    }
  }

  const lastIsAssistant = messages.length > 0 && messages[messages.length - 1].role === 'assistant'

  return (
    <section className="flex-1 flex flex-col min-w-0 bg-dark-base overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border-subtle bg-dark-mid shrink-0">
        <p className="text-[12px] sm:text-[13px] text-text-muted truncate min-w-0 mr-2">
          {language === 'sw' ? `Mazungumzo kama ${profile.name}` : `Chatting as ${profile.name}`}
        </p>
        <LanguageToggle language={language} onChange={onLanguageChange} />
      </div>

      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-3 sm:py-4 space-y-3 scrollbar-thin scrollbar-thumb-border-subtle scrollbar-track-transparent">
        {messages.map(msg => (
          <div key={msg.id} className="relative group">
            <ChatMessage message={msg} language={language} />
            {msg.role === 'assistant' && !msg.pestScan && (
              <button
                onClick={() => voiceOutput.speak(msg.content)}
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
          {isScanning && (
            <div className="flex items-center gap-2 px-1">
              <div className="animate-pulse w-5 h-5 rounded-full bg-green-primary/30" />
              <span className="text-[12px] text-text-muted">
                {language === 'sw' ? 'Inachambua picha...' : 'Analyzing image...'}
              </span>
            </div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      <AnimatePresence>
        {!isLoading && !isScanning && lastIsAssistant && (
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

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 py-2 bg-dark-mid border-t border-border-subtle"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-border-subtle shrink-0 bg-dark-base">
                <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-text-primary truncate">
                  {selectedFile?.name ?? 'Crop image'}
                </p>
                <p className="text-[10px] text-text-muted">
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(0)} KB` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={scanImage}
                  disabled={isScanning}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150',
                    isScanning
                      ? 'bg-green-primary/30 text-green-200 cursor-not-allowed'
                      : 'bg-green-primary text-green-100 hover:bg-green-primary/80'
                  )}
                >
                  {isScanning
                    ? (language === 'sw' ? 'Inachambua...' : 'Scanning...')
                    : (language === 'sw' ? 'Chambua Wadudu' : 'Scan Pest')
                  }
                </button>
                <button
                  onClick={() => { setSelectedImage(null); setSelectedFile(null) }}
                  disabled={isScanning}
                  className="p-1.5 rounded-lg hover:bg-text-primary/10 text-text-muted hover:text-text-primary transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-t border-border-subtle bg-dark-mid shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isScanning}
            aria-label="Upload crop image"
            className={cn(
              'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150 border',
              isScanning
                ? 'border-border-subtle text-text-muted cursor-not-allowed'
                : 'border-border-subtle text-green-400 hover:bg-green-primary/10 hover:border-green-primary/30'
            )}
          >
            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {voiceInput.supported && (
            <button
              onClick={voiceInput.listening ? voiceInput.stopListening : voiceInput.startListening}
              disabled={isLoading || isScanning}
              aria-label={voiceInput.listening ? 'Stop listening' : 'Start voice input'}
              className={cn(
                'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150',
                voiceInput.listening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-dark-base border border-border-subtle text-text-muted hover:text-green-400 hover:border-green-primary/40',
                (isLoading || isScanning) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {voiceInput.listening ? <MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          )}

          <textarea
            ref={textareaRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKey}
            placeholder={t.chatPlaceholder ?? 'Ask about your loan, risk, or crop…'}
            rows={1}
            disabled={isLoading || isScanning}
            className={cn(
              'flex-1 resize-none bg-dark-base border border-border-subtle rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-[12px] sm:text-[13px] text-text-primary placeholder:text-text-muted/40',
              'focus:outline-none focus:ring-1 focus:ring-green-primary/50 focus:border-green-primary',
              'transition-all duration-150 min-h-[38px] sm:min-h-[42px] max-h-[120px] leading-relaxed',
              (isLoading || isScanning) && 'opacity-50 cursor-not-allowed'
            )}
          />
          <button
            onClick={() => sendMessage(draft)}
            disabled={!draft.trim() || isLoading || isScanning}
            aria-label="Send message"
            className={cn(
              'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150',
              draft.trim() && !isLoading && !isScanning
                ? 'bg-green-primary hover:bg-green-primary/80'
                : 'bg-green-primary/20 cursor-not-allowed'
            )}
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-100" />
          </button>
        </div>
      </div>
    </section>
  )
}

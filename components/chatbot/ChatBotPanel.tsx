'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Send, Volume2, Mic, MicOff, Globe, Camera, X } from 'lucide-react'
import { ChatMessage as ChatMessageType, Language, FarmerProfile, PestScanResult } from '@/lib/types'
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const recognitionRef = useRef<any>(null)
  const abortRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    const greeting = language === 'sw'
      ? 'Habari! Mimi ni msaidizi wako wa kilimo. Unaweza kuniuliza kuhusu mazao, wadudu, hali ya hewa, udongo, soko, au mifugo. Pia unaweza kupiga picha ya mmea wako ili kutambua wadudu na magonjwa.'
      : 'Hello! I\'m your farming assistant. Ask me about crops, pests, weather, soil, market prices, or livestock. You can also snap a photo of your plant to identify pests and diseases.'
    setMessages([{
      id: '0',
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
    }])
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSttSupported(false)
      return
    }
    if (!recognitionRef.current) {
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = true
      recognitionRef.current = rec
    }
    recognitionRef.current.lang = STT_LANG[language]
  }, [language])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const timeoutId = setTimeout(() => controller.abort(), 30_000)

    const userMsg: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }
    const allMessages = [...messages, userMsg]
    const trimmed = allMessages.length > 20
      ? [allMessages[0], ...allMessages.slice(-19)]
      : allMessages
    setMessages(allMessages)
    setDraft('')
    setIsLoading(true)

    try {
      const farmerProfile: FarmerProfile = profile ?? {
        name: 'Farmer',
        county: 'Unknown',
        crops: [],
        language,
      }

      const res = await fetch('/api/chat', {
        signal: controller.signal,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: trimmed.map(m => ({ role: m.role, content: m.content })),
          farmerProfile,
          language,
          mode: 'general',
        }),
      })
      clearTimeout(timeoutId)

      if (!res.ok) throw new Error('API error')

      const data = await res.json()
      const assistantMsg: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply ?? data.message ?? '',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMsg])
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
  }, [messages, isLoading, profile, language])

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
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: language === 'sw' ? '[Kuchambua picha ya mmea...]' : '[Scanning crop image...]',
      timestamp: new Date(),
      imageUrl,
    }])
    setSelectedImage(null)
    setSelectedFile(null)

    try {
      const res = await fetch('/api/pest-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageUrl,
          source: profile ? 'authenticated' : 'anonymous',
        }),
      })

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

      const summary = language === 'sw'
        ? `Uchambuzi wa picha umekamilika. Wadudu waliotambuliwa: **${data.pest}** (${data.confidence}% uhakika).`
        : `Image analysis complete. Identified: **${data.pest}** (${data.confidence}% confidence).`

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: summary,
        timestamp: new Date(),
        pestScan: pestResult,
        imageUrl,
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'sw'
          ? 'Samahani, uchambuzi wa picha ulishindwa. Eleza dalili unazoziona kwenye mmea wako nami nitakusaidia kutambua.'
          : 'Image analysis failed. Describe the symptoms you see on your plant and I\'ll help identify the issue.',
        timestamp: new Date(),
      }])
    } finally {
      setIsScanning(false)
    }
  }

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
    rec.onresult = (event: any) => {
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
      if (finalTranscript.trim()) sendMessage(finalTranscript.trim())
    }

    rec.onerror = () => setListening(false)
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
            {msg.role === 'assistant' && !msg.pestScan && (
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
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 py-2 bg-dark-mid border-t border-border-subtle"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border-subtle shrink-0 bg-dark-base">
                <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-text-primary truncate">
                  {selectedFile?.name ?? 'Crop image'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={scanImage}
                  disabled={isScanning}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-green-primary text-green-100 hover:bg-green-primary/80 transition-all disabled:opacity-50"
                >
                  {isScanning
                    ? (language === 'sw' ? 'Inachambua...' : 'Scanning...')
                    : (language === 'sw' ? 'Chambua' : 'Scan')
                  }
                </button>
                <button
                  onClick={() => { setSelectedImage(null); setSelectedFile(null) }}
                  disabled={isScanning}
                  className="p-1 rounded-lg hover:bg-text-primary/10 text-text-muted"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-5 py-3 border-t border-border-subtle bg-dark-mid shrink-0 flex items-center gap-3">
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
          disabled={isScanning}
          aria-label="Upload crop image"
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150 border',
            isScanning
              ? 'border-border-subtle text-text-muted cursor-not-allowed'
              : 'border-border-subtle text-green-400 hover:bg-green-primary/10 hover:border-green-primary/30'
          )}
        >
          <Camera className="w-4 h-4" />
        </button>

        {sttSupported && (
          <button
            onClick={listening ? stopListening : startListening}
            disabled={isLoading || isScanning}
            aria-label={listening ? 'Stop listening' : 'Start voice input'}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150',
              listening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-dark-base border border-border-subtle text-text-muted hover:text-green-400 hover:border-green-primary/40',
              (isLoading || isScanning) && 'opacity-50 cursor-not-allowed'
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
          disabled={isLoading || isScanning}
          className={cn(
            'flex-1 resize-none bg-dark-base border border-border-subtle rounded-xl px-4 py-2.5 text-[13px] text-text-primary placeholder:text-text-muted/40',
            'focus:outline-none focus:ring-1 focus:ring-green-primary/50 focus:border-green-primary',
            'transition-all duration-150 min-h-[42px] max-h-[120px] leading-relaxed',
            (isLoading || isScanning) && 'opacity-50 cursor-not-allowed'
          )}
        />

        <button
          onClick={() => sendMessage(draft)}
          disabled={!draft.trim() || isLoading || isScanning}
          aria-label="Send message"
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150',
            draft.trim() && !isLoading && !isScanning
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

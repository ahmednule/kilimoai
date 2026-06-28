'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Language } from '@/lib/types'

interface UseVoiceInputOptions {
  language: Language
  onResult: (transcript: string) => void
  onListeningChange?: (listening: boolean) => void
}

const LANG_MAP: Record<Language, string> = { en: 'en-KE', sw: 'sw-KE', ki: 'en-KE', lu: 'en-KE' }

export function useVoiceInput({ language, onResult, onListeningChange }: UseVoiceInputOptions) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const finalRef = useRef('')
  const onResultRef = useRef(onResult)

  onResultRef.current = onResult

  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      setError('Speech recognition not supported in this browser')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = LANG_MAP[language]

    recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalRef.current += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }
    }

    recognition.onend = () => {
      setListening(false)
      onListeningChange?.(false)
      const final = finalRef.current.trim()
      if (final) {
        onResultRef.current(final)
      }
      finalRef.current = ''
    }

    recognition.onerror = (event: any) => {
      setListening(false)
      onListeningChange?.(false)
      finalRef.current = ''
      if (event.error === 'not-allowed') {
        setError('Microphone access denied')
      } else if (event.error !== 'no-speech') {
        setError(event.error)
      }
    }

    recognitionRef.current = recognition
  }, [language, onListeningChange])

  const startListening = useCallback(() => {
    const rec = recognitionRef.current
    if (!rec || listening) return

    setError(null)
    finalRef.current = ''
    try {
      rec.lang = LANG_MAP[language]
      rec.start()
      setListening(true)
      onListeningChange?.(true)
    } catch {
      setListening(false)
    }
  }, [listening, language, onListeningChange])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  return { listening, supported, error, startListening, stopListening }
}

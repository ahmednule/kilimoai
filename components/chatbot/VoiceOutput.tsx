'use client'

import { useCallback, useRef } from 'react'
import { Language } from '@/lib/types'

const TTS_LANG: Record<Language, string> = { en: 'en-KE', sw: 'sw-KE' }

export function useVoiceOutput(language: Language) {
  const speakingRef = useRef(false)

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    window.speechSynthesis.cancel()
    speakingRef.current = true

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = TTS_LANG[language]
    utterance.rate = 0.95

    utterance.onend = () => { speakingRef.current = false }
    utterance.onerror = () => { speakingRef.current = false }

    window.speechSynthesis.speak(utterance)
  }, [language])

  const stop = useCallback(() => {
    if (typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    speakingRef.current = false
  }, [])

  const isSpeaking = () => speakingRef.current

  return { speak, stop, isSpeaking }
}

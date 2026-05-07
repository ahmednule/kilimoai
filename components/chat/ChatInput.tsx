'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { Language } from '@/lib/types'
import { UI_TEXT } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled: boolean
  language: Language
}

export function ChatInput({ onSend, disabled, language }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const t = UI_TEXT[language]

  const adjustHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px'
    }
  }

  useEffect(() => {
    adjustHeight()
  }, [message])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || disabled) return
    onSend(message.trim())
    setMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-dark-mid border-t border-border-subtle p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.chatPlaceholder}
              disabled={disabled}
              rows={1}
              className={cn(
                "w-full px-4 py-3 bg-dark-base border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-green-primary/50 focus:border-green-primary resize-none transition-all text-base",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              style={{ minHeight: '48px' }}
            />
            {message.length > 200 && (
              <span className="absolute right-3 bottom-3 text-xs text-text-muted">
                {message.length}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className={cn(
              "w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl transition-all duration-200",
              message.trim() && !disabled
                ? "bg-gold-harvest text-dark-base hover:bg-gold-harvest/90"
                : "bg-dark-base border border-border-subtle text-text-muted cursor-not-allowed"
            )}
            aria-label={t.sendButton}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-text-muted uppercase tracking-wider font-mono">
            {language === 'en' ? 'EN' : 'SW'}
          </span>
        </div>
      </div>
    </form>
  )
}

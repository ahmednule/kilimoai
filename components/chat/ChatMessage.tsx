'use client'

import { motion } from 'framer-motion'
import { ChatMessage as ChatMessageType, Language } from '@/lib/types'
import { ScenarioCards } from './ScenarioCards'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: ChatMessageType
  language: Language
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
}

export function ChatMessage({ message, language }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 100 }}
      className={cn(
        "flex",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "max-w-[85%] sm:max-w-[75%]",
        isUser ? "order-1" : "order-2"
      )}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser 
              ? "bg-gold-harvest/20 border border-gold-harvest/30 rounded-br-md"
              : "bg-dark-mid border-l-2 border-green-primary rounded-bl-md"
          )}
        >
          <p className="text-text-primary text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>

          {message.scenarios && (
            <ScenarioCards scenarios={message.scenarios} language={language} />
          )}
        </div>

        <p className={cn(
          "text-xs text-text-muted mt-1.5",
          isUser ? "text-right" : "text-left"
        )}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </motion.div>
  )
}

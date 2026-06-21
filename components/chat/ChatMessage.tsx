'use client'

import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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

const markdownComponents = {
  strong: ({ ...props }) => <strong className="font-bold text-inherit" {...props} />,
  em: ({ ...props }) => <em className="italic text-inherit" {...props} />,
  ul: ({ ...props }) => <ul className="list-disc pl-5 my-1 space-y-0.5" {...props} />,
  ol: ({ ...props }) => <ol className="list-decimal pl-5 my-1 space-y-0.5" {...props} />,
  li: ({ ...props }) => <li className="text-text-primary text-sm sm:text-base leading-relaxed" {...props} />,
  p: ({ ...props }) => <p className="text-text-primary text-sm sm:text-base leading-relaxed my-0.5" {...props} />,
  h1: ({ ...props }) => <h1 className="text-lg font-bold text-text-primary my-1" {...props} />,
  h2: ({ ...props }) => <h2 className="text-base font-semibold text-text-primary my-1" {...props} />,
  h3: ({ ...props }) => <h3 className="text-sm font-semibold text-text-primary my-0.5" {...props} />,
  code: ({ ...props }) => (
    <code className="bg-black/20 px-1.5 py-0.5 rounded text-[13px] font-mono" {...props} />
  ),
  pre: ({ ...props }) => (
    <pre className="bg-black/20 rounded-lg p-3 my-1 overflow-x-auto text-[13px] leading-relaxed" {...props} />
  ),
  blockquote: ({ ...props }) => (
    <blockquote className="border-l-2 border-green-primary/40 pl-3 italic text-text-muted my-1" {...props} />
  ),
  hr: ({ ...props }) => <hr className="border-border-subtle my-2" {...props} />,
  table: ({ ...props }) => (
    <div className="overflow-x-auto my-1">
      <table className="min-w-full text-sm border-collapse" {...props} />
    </div>
  ),
  th: ({ ...props }) => (
    <th className="border border-border-subtle px-2 py-1 text-left font-semibold bg-black/10" {...props} />
  ),
  td: ({ ...props }) => (
    <td className="border border-border-subtle px-2 py-1" {...props} />
  ),
  a: ({ ...props }) => (
    <a className="text-green-400 underline underline-offset-2 hover:text-green-300" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  del: ({ ...props }) => <del className="line-through text-text-muted/70" {...props} />,
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
          {isUser ? (
            <p className="text-text-primary text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {message.content}
            </ReactMarkdown>
          )}

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

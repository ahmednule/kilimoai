'use client'

import type { ReactNode } from 'react'
import { ChatBotProvider } from '@/components/chatbot/ChatBotContext'
import { ChatBotOverlay } from '@/components/chatbot/ChatBotOverlay'

export function ChatBotWrapper({ children }: { children: ReactNode }) {
  return (
    <ChatBotProvider>
      {children}
      <ChatBotOverlay />
    </ChatBotProvider>
  )
}
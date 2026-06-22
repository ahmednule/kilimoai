'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface ChatBotContextValue {
  open: boolean
  openChatBot: () => void
  closeChatBot: () => void
  toggleChatBot: () => void
}

const ChatBotContext = createContext<ChatBotContextValue>({
  open: false,
  openChatBot: () => {},
  closeChatBot: () => {},
  toggleChatBot: () => {},
})

export function ChatBotProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const openChatBot = useCallback(() => setOpen(true), [])
  const closeChatBot = useCallback(() => setOpen(false), [])
  const toggleChatBot = useCallback(() => setOpen(prev => !prev), [])

  return (
    <ChatBotContext.Provider value={{ open, openChatBot, closeChatBot, toggleChatBot }}>
      {children}
    </ChatBotContext.Provider>
  )
}

export function useChatBot(): ChatBotContextValue {
  return useContext(ChatBotContext)
}

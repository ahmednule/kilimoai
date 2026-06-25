import { ChatMessage } from '@/lib/types'

const MESSAGES_KEY = 'kilimo-chat-messages'
const STEPS_KEY = 'kilimo-chat-steps'
const RISK_KEY = 'kilimo-chat-risk'
const RESULT_KEY = 'kilimo-chat-result'

export function getChatMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(MESSAGES_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
  } catch (e) {
    console.error('[chat] failed to load messages', e)
    return []
  }
}

export function saveChatMessages(messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
  } catch (e) {
    console.error('[chat] failed to save messages', e)
  }
}

export function clearChatMessages(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(MESSAGES_KEY)
  localStorage.removeItem(STEPS_KEY)
  localStorage.removeItem(RISK_KEY)
  localStorage.removeItem(RESULT_KEY)
}

export function saveChatState(key: string, data: any): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {}
}

export function loadChatState<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

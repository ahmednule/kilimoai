'use client'

import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useChatBot } from '@/components/chatbot/ChatBotContext'

export function FabButton() {
  const { open, openChatBot, closeChatBot, toggleChatBot } = useChatBot()

  return (
    <motion.button
      onClick={() => {
        if (open) {
          closeChatBot()
        } else {
          openChatBot()
        }
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={
        open
          ? { scale: 1 }
          : {
              scale: [1, 1.08, 1],
              boxShadow: [
                '0 0 0 0 rgba(26,122,74,0.4)',
                '0 0 0 12px rgba(26,122,74,0)',
                '0 0 0 0 rgba(26,122,74,0)',
              ],
            }
      }
      transition={
        open
          ? { duration: 0.2 }
          : {
              scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            }
      }
      aria-label={open ? 'Close AI Assistant' : 'Open AI Assistant'}
      className="fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-2xl bg-green-primary flex items-center justify-center shadow-lg shadow-green-primary/30 hover:bg-green-light transition-colors duration-200"
    >
      <MessageCircle className="w-6 h-6 text-text-primary" />
    </motion.button>
  )
}

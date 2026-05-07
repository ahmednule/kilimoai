'use client'

import { motion } from 'framer-motion'
import { Language } from '@/lib/types'
import { UI_TEXT } from '@/lib/constants'

interface TypingIndicatorProps {
  language: Language
}

export function TypingIndicator({ language }: TypingIndicatorProps) {
  const t = UI_TEXT[language]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex justify-start"
    >
      <div className="bg-dark-mid border-l-2 border-green-primary rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-green-primary rounded-full"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
          <span className="text-text-muted text-sm">{t.thinking}</span>
        </div>
      </div>
    </motion.div>
  )
}

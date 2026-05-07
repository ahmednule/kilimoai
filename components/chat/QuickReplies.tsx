'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface QuickRepliesProps {
  suggestions: string[]
  onSelect: (text: string) => void
  disabled: boolean
}

export function QuickReplies({ suggestions, onSelect, disabled }: QuickRepliesProps) {
  if (disabled) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="overflow-x-auto hide-scrollbar -mx-2 px-2"
    >
      <div className="flex gap-2 pb-2">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={suggestion}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            onClick={() => onSelect(suggestion)}
            disabled={disabled}
            className={cn(
              "flex-shrink-0 px-4 py-2 bg-dark-mid border border-border-subtle rounded-full text-sm text-text-muted hover:text-text-primary hover:border-green-primary/50 hover:bg-green-primary/10 transition-all duration-200 whitespace-nowrap",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

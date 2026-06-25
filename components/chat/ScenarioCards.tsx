'use client'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { ScenarioResult, CaseResult, Language } from '@/lib/types'
import { UI_TEXT } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface ScenarioCardsProps {
  scenarios: ScenarioResult
  language: Language
}

function formatKsh(amount: number): string {
  return `Ksh ${amount.toLocaleString('en-KE')}`
}

function CaseCard({ 
  type, 
  data, 
  index, 
  language 
}: { 
  type: 'best' | 'expected' | 'worst'
  data: CaseResult
  index: number
  language: Language
}) {
  const t = UI_TEXT[language]
  
  const config = {
    best: {
      title: t.bestCase,
      subtitle: t.goodRains,
      borderColor: 'border-risk-low',
      glowColor: 'shadow-risk-low/30',
      bgGlow: 'from-risk-low/10',
      textColor: 'text-risk-low',
      barColor: 'bg-risk-low',
    },
    expected: {
      title: t.expectedCase,
      subtitle: t.averageRains,
      borderColor: 'border-risk-medium',
      glowColor: 'shadow-risk-medium/30',
      bgGlow: 'from-risk-medium/10',
      textColor: 'text-risk-medium',
      barColor: 'bg-risk-medium',
    },
    worst: {
      title: t.worstCase,
      subtitle: t.poorRains,
      borderColor: 'border-risk-high',
      glowColor: 'shadow-risk-high/30',
      bgGlow: 'from-risk-high/10',
      textColor: 'text-risk-high',
      barColor: 'bg-risk-high',
    },
  }

  const c = config[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.2,
        type: 'spring',
        stiffness: 100,
      }}
      className={cn(
        "bg-dark-mid rounded-2xl p-5 border-2",
        c.borderColor,
        `shadow-lg ${c.glowColor}`
      )}
    >
      {/* Header */}
      <div className={cn("text-center pb-4 border-b border-border-subtle bg-gradient-to-b", c.bgGlow, "to-transparent -mx-5 -mt-5 px-5 pt-5 rounded-t-2xl")}>
        <h4 className={cn("font-serif text-lg font-bold", c.textColor)}>
          {c.title}
        </h4>
        <p className="text-text-muted text-xs mt-0.5">{c.subtitle}</p>
      </div>

      {/* Stats */}
      <div className="mt-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-text-muted text-sm">{t.yield}</span>
          <span className="font-mono text-text-primary font-semibold">
            {data.yield} {t.bags}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-muted text-sm">{t.revenue}</span>
          <span className="font-mono text-text-primary font-semibold">
            {formatKsh(data.revenue)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-muted text-sm">{data.canRepay ? t.canRepay : t.cannotRepay}</span>
          <span className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center",
            data.canRepay ? "bg-risk-low/20" : "bg-risk-high/20"
          )}>
            {data.canRepay ? (
              <Check className="w-4 h-4 text-risk-low" />
            ) : (
              <X className="w-4 h-4 text-risk-high" />
            )}
          </span>
        </div>
      </div>

      {/* Probability bar */}
      <div className="mt-4 pt-4 border-t border-border-subtle">
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="text-text-muted">{t.probability}</span>
          <span className={cn("font-mono font-bold", c.textColor)}>
            {data.probability}%
          </span>
        </div>
        <div className="h-2 bg-dark-base rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.probability}%` }}
            transition={{ duration: 0.8, delay: index * 0.2 + 0.3, ease: 'easeOut' }}
            className={cn("h-full rounded-full", c.barColor)}
          />
        </div>
      </div>
    </motion.div>
  )
}

export function ScenarioCards({ scenarios, language }: ScenarioCardsProps) {
  return (
    <div className="mt-4 -mx-2 px-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <CaseCard type="best" data={scenarios.bestCase} index={0} language={language} />
        <CaseCard type="expected" data={scenarios.expectedCase} index={1} language={language} />
        <CaseCard type="worst" data={scenarios.worstCase} index={2} language={language} />
      </div>
    </div>
  )
}

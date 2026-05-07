'use client'

import { motion } from 'framer-motion'
import { Language } from '@/lib/types'
import { UI_TEXT } from '@/lib/constants'

interface StatsProps {
  language: Language
}

export function Stats({ language }: StatsProps) {
  const t = UI_TEXT[language]

  const stats = [
    { value: '15+', label: t.statsBar1 },
    { value: '47', label: t.statsBar2 },
    { value: '3', label: t.statsBar3 },
    { value: '100%', label: t.statsBar4 },
  ]

  return (
    <section className="py-8 bg-green-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="font-mono text-3xl sm:text-4xl font-bold text-text-primary">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-green-muted/90">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

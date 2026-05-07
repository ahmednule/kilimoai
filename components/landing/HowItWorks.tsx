'use client'

import { motion } from 'framer-motion'
import { MessageSquare, Cloud, BarChart3 } from 'lucide-react'
import { Language } from '@/lib/types'
import { UI_TEXT } from '@/lib/constants'

interface HowItWorksProps {
  language: Language
}

export function HowItWorks({ language }: HowItWorksProps) {
  const t = UI_TEXT[language]

  const steps = [
    {
      icon: MessageSquare,
      title: t.step1Title,
      description: t.step1Desc,
      color: 'green-primary',
    },
    {
      icon: Cloud,
      title: t.step2Title,
      description: t.step2Desc,
      color: 'sky-blue',
    },
    {
      icon: BarChart3,
      title: t.step3Title,
      description: t.step3Desc,
      color: 'gold-harvest',
    },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-dark-mid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary">
            {t.howItWorksTitle}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-border-subtle" />
              )}

              <div className="relative bg-dark-base border border-border-subtle rounded-2xl p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gold-harvest text-dark-base font-bold text-sm flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className={`w-16 h-16 rounded-2xl bg-${step.color}/10 flex items-center justify-center`}
                       style={{ backgroundColor: `var(--${step.color})`, opacity: 0.15 }}>
                    <step.icon className="w-8 h-8" style={{ color: `var(--${step.color})` }} />
                  </div>
                </div>

                <h3 className="font-serif text-xl font-semibold text-text-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

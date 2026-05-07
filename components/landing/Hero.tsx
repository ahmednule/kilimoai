'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingDown, Users, AlertTriangle } from 'lucide-react'
import { Language } from '@/lib/types'
import { UI_TEXT } from '@/lib/constants'

interface HeroProps {
  language: Language
}

export function Hero({ language }: HeroProps) {
  const t = UI_TEXT[language]

  const stats = [
    { icon: TrendingDown, text: t.stat1, delay: 0.4 },
    { icon: Users, text: t.stat2, delay: 0.6 },
    { icon: AlertTriangle, text: t.stat3, delay: 0.8 },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-green-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gold-harvest/5 rounded-full blur-3xl" />
        
        {/* Animated maize pattern */}
        <svg
          className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-auto opacity-10"
          viewBox="0 0 200 400"
          fill="none"
          aria-hidden="true"
        >
          <motion.path
            d="M100 0 Q120 100 100 200 Q80 300 100 400"
            stroke="currentColor"
            strokeWidth="2"
            className="text-green-primary"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          {[40, 80, 120, 160, 200, 240, 280, 320].map((y, i) => (
            <motion.ellipse
              key={y}
              cx={i % 2 === 0 ? 85 : 115}
              cy={y}
              rx="15"
              ry="25"
              className="fill-green-primary/30"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
            />
          ))}
        </svg>
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary leading-tight"
          >
            {t.heroTitle}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-2 text-lg sm:text-xl text-gold-harvest font-medium"
          >
            {t.heroSubtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed"
          >
            {t.heroDescription}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/chat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold-harvest text-dark-base font-semibold rounded-xl hover:bg-gold-harvest/90 transition-all duration-200 hover:scale-105 shadow-lg shadow-gold-harvest/20"
            >
              {t.ctaPrimary}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border border-text-muted/30 text-text-primary font-semibold rounded-xl hover:bg-text-primary/5 transition-all duration-200"
            >
              {t.ctaSecondary}
            </a>
          </motion.div>
        </div>

        {/* Floating stat cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: stat.delay }}
              className="bg-dark-mid/80 backdrop-blur-sm border border-border-subtle rounded-xl p-4 flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-risk-high/10 flex items-center justify-center flex-shrink-0">
                <stat.icon className="w-5 h-5 text-risk-high" />
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                {stat.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

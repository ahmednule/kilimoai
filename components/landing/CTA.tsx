'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Language } from '@/lib/types'
import { UI_TEXT } from '@/lib/constants'

interface CTAProps {
  language: Language
}

export function CTA({ language }: CTAProps) {
  const t = UI_TEXT[language]

  return (
    <section className="py-20 bg-dark-base">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-dark-mid border-2 border-gold-harvest/30 rounded-3xl p-8 sm:p-12 text-center overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-gold-harvest/5 to-transparent" />
          
          <div className="relative z-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
              {t.ctaTitle}
            </h2>
            <p className="mt-3 text-text-muted">
              {t.ctaSubtitle}
            </p>
            <Link
              href="/chat"
              className="mt-8 inline-flex items-center justify-center gap-2 px-10 py-4 bg-gold-harvest text-dark-base font-semibold rounded-xl hover:bg-gold-harvest/90 transition-all duration-200 hover:scale-105 shadow-lg shadow-gold-harvest/20"
            >
              {t.ctaButton}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

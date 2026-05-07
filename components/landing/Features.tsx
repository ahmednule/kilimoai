'use client'

import { motion } from 'framer-motion'
import { BarChart3, Cloud, Camera, Users, Languages, Wifi } from 'lucide-react'
import { Language } from '@/lib/types'
import { UI_TEXT } from '@/lib/constants'

interface FeaturesProps {
  language: Language
}

export function Features({ language }: FeaturesProps) {
  const t = UI_TEXT[language]

  const features = [
    {
      icon: BarChart3,
      title: t.feature1Title,
      description: t.feature1Desc,
      color: '#D4A843',
    },
    {
      icon: Cloud,
      title: t.feature2Title,
      description: t.feature2Desc,
      color: '#2B6CB0',
    },
    {
      icon: Camera,
      title: t.feature3Title,
      description: t.feature3Desc,
      color: '#8B5E3C',
    },
    {
      icon: Users,
      title: t.feature4Title,
      description: t.feature4Desc,
      color: '#2C9E61',
    },
    {
      icon: Languages,
      title: t.feature5Title,
      description: t.feature5Desc,
      color: '#1A7A4A',
    },
    {
      icon: Wifi,
      title: t.feature6Title,
      description: t.feature6Desc,
      color: '#22C55E',
    },
  ]

  return (
    <section className="py-20 bg-dark-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary">
            {t.featuresTitle}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-dark-mid border border-border-subtle rounded-2xl p-6 hover:border-green-primary/30 transition-all duration-300"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
              </div>

              <h3 className="font-serif text-lg font-semibold text-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

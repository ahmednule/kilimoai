'use client'

import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react'
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'

export type Language = 'en' | 'sw'

export const LanguageContext = createContext<{
  language: Language
  setLanguage: (l: Language) => void
}>({ language: 'en', setLanguage: () => {} })

export function useLanguage() {
  return useContext(LanguageContext)
}

export function FloatingOrb({ className, size = 300, color, speed = 20, delay = 0 }: {
  className?: string
  size?: number
  color: string
  speed?: number
  delay?: number
}) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{ width: size, height: size, backgroundColor: color }}
      animate={{
        x: [0, 30, -20, 15, -10, 0],
        y: [0, -25, 15, -30, 10, 0],
        scale: [1, 1.05, 0.95, 1.03, 0.97, 1],
      }}
      transition={{
        duration: speed,
        delay,
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'easeInOut',
      }}
    />
  )
}

export function FadeInView({ children, className, delay = 0, duration = 0.6, y = 24 }: {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  y?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: 'blur(2px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerWords({ text, className }: { text: string; className?: string }) {
  const words = text.split(' ')
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: 'easeOut' }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

export function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 20 })

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width - 0.5
    const cy = (e.clientY - rect.top) / rect.height - 0.5
    x.set(cx)
    y.set(cy)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function CountUp({ target, label, duration = 2 }: { target: number; label: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const increment = target / (duration * 60)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return (
    <div ref={ref} className="text-center">
      <span className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
        {count}{label.startsWith('+') ? '+' : ''}
      </span>
      <p className="text-text-muted text-xs mt-0.5">{label.replace(/^\d+\+?\s*/, '')}</p>
    </div>
  )
}

const LANGUAGES = [
  { code: 'en' as Language, native: 'English', label: 'EN' },
  { code: 'sw' as Language, native: 'Kiswahili', label: 'SW' },
  { code: 'ki' as Language, native: 'Gĩkũyũ', label: 'KI' },
  { code: 'lu' as Language, native: 'Dholuo', label: 'LU' },
]

export function LanguageToggle({ language, onChange }: { language: Language; onChange: (lang: Language) => void }) {
  return (
    <select
      value={language}
      onChange={e => onChange(e.target.value as Language)}
      className="px-3 py-1.5 text-sm font-medium rounded-lg bg-dark-mid border border-border-subtle text-text-primary focus:outline-none focus:border-green-primary/50 cursor-pointer appearance-none"
    >
      {LANGUAGES.map(l => (
        <option key={l.code} value={l.code}>{l.native} ({l.label})</option>
      ))}
    </select>
  )
}
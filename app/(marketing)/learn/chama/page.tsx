'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Users, PiggyBank, Landmark, HeartHandshake, Star, TrendingUp, Building2, FileText, ArrowRight } from 'lucide-react'
import { FabButton } from '@/components/chatbot/FabButton'
import { useLanguage, FloatingOrb, FadeInView } from '@/components/marketing/shared'

const UI_TEXT = {
  en: {
    badge: 'For Groups',
    title: 'Stronger Together — Chama Mode',
    subtitle: 'Designed for Kenya\'s 400,000+ savings groups, cooperatives, and chamas',
    feature1Title: 'Group Applications',
    feature1Desc: 'Apply for loans as a registered chama. Your collective track record strengthens the application and can unlock better terms.',
    feature2Title: 'Member Tracking',
    feature2Desc: 'Track each member\'s contributions, attendance, and loan history in one place. No more scattered notebooks.',
    feature3Title: 'Collective Risk Score',
    feature3Desc: 'AI assesses the group\'s combined farming capacity across all members for a more accurate, fair risk profile.',
    feature4Title: 'Transparent Ledger',
    feature4Desc: 'Every contribution, every loan, every repayment — visible to all members in real time. Full transparency builds trust.',
    howItWorks: 'A chama registers on Kilimo AI, adds members, and applies for a group assessment. The AI evaluates each member\'s farm profile and the group\'s combined history. Results are shared with the whole chama.',
    cta: 'Start Your Group Assessment',
    members: 'members',
  },
  sw: {
    badge: 'Kwa Vikundi',
    title: 'Nguvu Pamoja — Hali ya Chama',
    subtitle: 'Imeundwa kwa zaidi ya vikundi 400,000 vya akiba, vyama vya ushirika, na chama nchini Kenya',
    feature1Title: 'Maombi ya Kikundi',
    feature1Desc: 'Omba mikopo kama chama kilichosajiliwa. Rekodi yenu ya pamoja inaimarisha maombi na inaweza kufungua masharti bora.',
    feature2Title: 'Ufuatiliaji wa Wanachama',
    feature2Desc: 'Fuatilia michango ya kila mwanachama, mahudhurio, na historia ya mikopo mahali pamoja. Hakuna madaftari yaliyotawanyika.',
    feature3Title: 'Alama ya Hatari ya Pamoja',
    feature3Desc: 'AI inatathmini uwezo wa kilimo wa kikundi kwa pamoja kwa wasifu sahihi zaidi wa hatari.',
    feature4Title: 'Uwazi wa Kifedha',
    feature4Desc: 'Kila mchango, kila mkopo, kila marejesho — yanaonekana kwa wanachama wote kwa wakati halisi. Uwazi kamili unajenga uaminifu.',
    howItWorks: 'Chama kinajiandikisha kwenye Kilimo AI, kinaongeza wanachama, na kinatuma ombi la tathmini ya kikundi. AI inatathmini wasifu wa kila mwanachama na historia ya kikundi. Matokeo yanashirishwa na chama kizima.',
    cta: 'Anza Tathmini ya Kikundi Chako',
    members: 'wanachama',
  },
}

export default function ChamaPage() {
  const { language } = useLanguage()
  const router = useRouter()
  const t = UI_TEXT[language]

  const [hasProfile, setHasProfile] = useState(false)
  useEffect(() => {
    setHasProfile(!!localStorage.getItem('kilimo-profile'))
  }, [])

  const features = [
    { icon: HeartHandshake, title: t.feature1Title, desc: t.feature1Desc, color: '#22C55E' },
    { icon: Users, title: t.feature2Title, desc: t.feature2Desc, color: '#2B6CB0' },
    { icon: TrendingUp, title: t.feature3Title, desc: t.feature3Desc, color: '#D4A843' },
    { icon: FileText, title: t.feature4Title, desc: t.feature4Desc, color: '#8B5E3C' },
  ]

  return (
    <main className="relative">
      <section className="py-20 bg-dark-base relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1200 600">
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={i}
                x1={100 + Math.random() * 1000} y1={50 + Math.random() * 500}
                x2={100 + Math.random() * 1000} y2={50 + Math.random() * 500}
                stroke="#2C9E61" strokeWidth="1"
              />
            ))}
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <FadeInView className="text-center mb-4">
            <span className="text-xs font-semibold tracking-widest uppercase text-green-light mb-3 block">{t.badge}</span>
          </FadeInView>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mt-4">
            <FadeInView delay={0.2}>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary mb-4">{t.title}</h1>
              <p className="text-text-muted text-base leading-relaxed mb-8">{t.subtitle}</p>
              <div className="space-y-4">
                {features.map((item, i) => (
                  <FadeInView key={i} delay={0.3 + i * 0.1} y={12}>
                    <div className="flex gap-4 p-4 rounded-xl bg-dark-mid border border-border-subtle hover:border-green-primary/20 transition-colors">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${item.color}15` }}>
                        <item.icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <div>
                        <h3 className="font-serif font-semibold text-text-primary text-sm mb-0.5">{item.title}</h3>
                        <p className="text-text-muted text-xs leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </FadeInView>
                ))}
              </div>
            </FadeInView>

            <FadeInView delay={0.4}>
              <div className="relative flex items-center justify-center h-[420px]">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute w-24 h-24 rounded-2xl bg-green-primary/20 border-2 border-green-primary flex items-center justify-center z-10 shadow-lg shadow-green-primary/20"
                >
                  <Building2 className="w-10 h-10 text-green-primary" />
                </motion.div>

                {[
                  { icon: Users, color: '#22C55E', orbit: 120, angle: 0 },
                  { icon: PiggyBank, color: '#2B6CB0', orbit: 120, angle: 60 },
                  { icon: Landmark, color: '#D4A843', orbit: 120, angle: 120 },
                  { icon: HeartHandshake, color: '#8B5E3C', orbit: 120, angle: 180 },
                  { icon: Star, color: '#1A7A4A', orbit: 120, angle: 240 },
                  { icon: TrendingUp, color: '#2C9E61', orbit: 120, angle: 300 },
                ].map((member, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-14 h-14 rounded-xl border-2 flex items-center justify-center bg-dark-mid shadow-lg"
                    style={{ borderColor: member.color }}
                    animate={{
                      x: Array.from({ length: 7 }, (_, k) =>
                        Math.cos(((member.angle + k * 60) * Math.PI) / 180) * member.orbit
                      ),
                      y: Array.from({ length: 7 }, (_, k) =>
                        Math.sin(((member.angle + k * 60) * Math.PI) / 180) * member.orbit
                      ),
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
                  >
                    <member.icon className="w-6 h-6" style={{ color: member.color }} />
                  </motion.div>
                ))}

                <motion.div
                  className="absolute w-[260px] h-[260px] rounded-full border border-dashed border-green-primary/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute w-[200px] h-[200px] rounded-full border border-dashed border-gold-harvest/15"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </FadeInView>
          </div>

          <FadeInView delay={0.5} className="mt-12 max-w-3xl mx-auto text-center">
            <div className="bg-dark-mid border border-border-subtle rounded-2xl p-6">
              <p className="text-text-muted text-sm leading-relaxed mb-4">{t.howItWorks}</p>
              <button
                onClick={() => router.push(hasProfile ? '/chat' : '/auth/login')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gold-harvest text-dark-base font-semibold rounded-xl hover:bg-gold-harvest/90 transition-all hover:scale-105 cursor-pointer"
              >
                {t.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </FadeInView>
        </div>
      </section>
      <FabButton />
    </main>
  )
}

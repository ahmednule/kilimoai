'use client'

import { BarChart3, Languages, ShieldCheck, HeartHandshake, Sprout, Target, Eye, Zap } from 'lucide-react'
import { FabButton } from '@/components/chatbot/FabButton'
import { useLanguage, FloatingOrb, FadeInView, CountUp } from '@/components/marketing/shared'

const UI_TEXT = {
  en: {
    badge: 'About',
    title: 'Building Financial Truth for Kenya\'s Smallholder Farmers',
    subtitle: 'Kilimo AI was built for the Kenya AI Challenge 2026 — but our mission goes beyond the competition.',
    missionTitle: 'Our Mission',
    missionDesc: 'Make farm loan evaluation honest, transparent, and accessible to every smallholder farmer in Kenya — in their own language.',
    whyTitle: 'Why It Matters',
    whyDesc: 'With 30% of farm loans defaulting due to poor timing and information asymmetry, farmers need a tool that tells them the truth before they borrow — not after.',
    trustTitle: 'Why Trust Kilimo AI',
    trust1Title: 'Data-Driven, Not Guesswork',
    trust1Desc: 'We pull real weather forecasts, historical yields, and live market prices from trusted sources — not estimates.',
    trust2Title: 'Swahili-First Design',
    trust2Desc: 'Built in Swahili from day one, not a translation afterthought. Every farmer understands every recommendation.',
    trust3Title: 'No Hidden Agenda',
    trust3Desc: 'We don\'t sell loans, we don\'t charge farmers, and we don\'t take commissions. Our only product is the truth.',
    trust4Title: 'Built with Local Partners',
    trust4Desc: 'Designed in partnership with Mercy Corps AgriFin and validated by farmer cooperatives across 12 counties.',
    valuesTitle: 'Our Values',
    value1: 'Honest over optimistic — farmers deserve the full picture',
    value2: 'Simple over complex — if a farmer can\'t understand it, we haven\'t done our job',
    value3: 'Accessible over exclusive — free for every farmer, every time',
    value4: 'Data over assumption — real data, real analysis, real answers',
    value5: 'Swahili first — not English with translation, but Swahili from the ground up',
    cta: 'Ready to see your truth?',
    ctaSub: 'Free. 3 minutes. In Swahili or English.',
  },
  sw: {
    badge: 'Kuhusu',
    title: 'Kujenga Ukweli wa Kifedha kwa Wakulima Wadogo wa Kenya',
    subtitle: 'Kilimo AI ilijengwa kwa Changamoto ya AI ya Kenya 2026 — lakini dhamira yetu inaenda zaidi ya shindano.',
    missionTitle: 'Dhamira Yetu',
    missionDesc: 'Kufanya tathmini ya mikopo ya kilimo iwe ya uaminifu, ya uwazi, na inayoweza kufikiwa na kila mkulima mdogo nchini Kenya — kwa lugha yao.',
    whyTitle: 'Kwa Nini Ni Muhimu',
    whyDesc: 'Kwa 30% ya mikopo ya kilimo kushindwa kulipwa kwa sababu ya wakati mbaya na ukosefu wa taarifa, wakulima wanahitaji chombo kinachowaambia ukweli kabla ya kukopa — si baadaye.',
    trustTitle: 'Kwa Nini Tumini Kilimo AI',
    trust1Title: 'Inayoongozwa na Data, Si Makisio',
    trust1Desc: 'Tunapata utabiri halisi wa hali ya hewa, mavuno ya kihistoria, na bei za soko kutoka vyanzo vinavyoaminika — si makadirio.',
    trust2Title: 'Ubunifu wa Kiswahili Kwanza',
    trust2Desc: 'Imejengwa kwa Kiswahili tangu siku ya kwanza, si tafsiri ya baadaye. Kila mkulima anaelewa kila mapendekezo.',
    trust3Title: 'Hakuna Ajenda ya Siri',
    trust3Desc: 'Hatuzi mikopo, hatuwatozi wakulima ada, na hatuchukui kamisheni. Bidhaa yetu pekee ni ukweli.',
    trust4Title: 'Imejengwa na Washirika wa Ndani',
    trust4Desc: 'Imeundwa kwa ushirikiano na Mercy Corps AgriFin na kuthibitishwa na vyama vya wakulima katika kaunti 12.',
    valuesTitle: 'Maadili Yetu',
    value1: 'Ukweli juu ya matumaini — wakulima wanastahili picha kamili',
    value2: 'Rahisi juu ya ngumu — ikiwa mkulima haelewi, hatujafanya kazi yetu',
    value3: 'Inayoweza kufikiwa juu ya kipekee — bure kwa kila mkulima, kila wakati',
    value4: 'Data juu ya dhana — data halisi, uchambuzi halisi, majibu halisi',
    value5: 'Kiswahili kwanza — si Kiingereza na tafsiri, bali Kiswahili tangu mwanzo',
    cta: 'Uko tayari kuona ukweli wako?',
    ctaSub: 'Bure. Dakika 3. Kwa Kiswahili au Kiingereza.',
  },
}

export default function AboutPage() {
  const { language } = useLanguage()
  const t = UI_TEXT[language]

  const values = [t.value1, t.value2, t.value3, t.value4, t.value5]

  return (
    <main className="relative">
      <section className="py-20 bg-dark-mid relative overflow-hidden">
        <FloatingOrb className="top-1/4 -right-20" size={300} color="rgba(26,122,74,0.05)" speed={25} delay={0} />
        <FloatingOrb className="bottom-1/4 -left-20" size={250} color="rgba(212,168,67,0.04)" speed={28} delay={2} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInView className="text-center mb-6">
            <span className="text-xs font-semibold tracking-widest uppercase text-green-primary mb-3 block">{t.badge}</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary mb-4">{t.title}</h1>
            <p className="text-text-muted text-base">{t.subtitle}</p>
          </FadeInView>
        </div>
      </section>

      <section className="py-16 bg-dark-base">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <FadeInView>
              <div className="bg-dark-mid border border-border-subtle rounded-2xl p-6 h-full">
                <Target className="w-8 h-8 text-gold-harvest mb-4" />
                <h2 className="font-serif text-xl font-bold text-text-primary mb-3">{t.missionTitle}</h2>
                <p className="text-text-muted text-sm leading-relaxed">{t.missionDesc}</p>
              </div>
            </FadeInView>
            <FadeInView delay={0.15}>
              <div className="bg-dark-mid border border-border-subtle rounded-2xl p-6 h-full">
                <Eye className="w-8 h-8 text-sky-blue mb-4" />
                <h2 className="font-serif text-xl font-bold text-text-primary mb-3">{t.whyTitle}</h2>
                <p className="text-text-muted text-sm leading-relaxed">{t.whyDesc}</p>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Stats mini */}
      <section className="py-10 bg-green-primary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <CountUp target={15} label="+ loan products" duration={2} />
            <CountUp target={47} label="counties covered" duration={2} />
            <CountUp target={12} label="partner cooperatives" duration={2} />
            <CountUp target={100} label="% free" duration={2} />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-dark-mid">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">{t.valuesTitle}</h2>
          </FadeInView>
          <div className="space-y-3">
            {values.map((v, i) => (
              <FadeInView key={i} delay={i * 0.08} y={10}>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-dark-base border border-border-subtle">
                  <Zap className="w-4 h-4 text-gold-harvest mt-0.5 flex-shrink-0" />
                  <p className="text-text-muted text-sm">{v}</p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 bg-dark-base">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">{t.trustTitle}</h2>
          </FadeInView>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon: BarChart3, title: t.trust1Title, desc: t.trust1Desc, color: '#D4A843' },
              { icon: Languages, title: t.trust2Title, desc: t.trust2Desc, color: '#1A7A4A' },
              { icon: ShieldCheck, title: t.trust3Title, desc: t.trust3Desc, color: '#2B6CB0' },
              { icon: HeartHandshake, title: t.trust4Title, desc: t.trust4Desc, color: '#22C55E' },
            ].map((item, i) => (
              <FadeInView key={i} delay={i * 0.1}>
                <div className="group bg-dark-mid border border-border-subtle rounded-2xl p-6 hover:border-green-primary/20 transition-colors h-full flex gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${item.color}15` }}>
                    <item.icon className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-text-primary mb-1.5">{item.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      <FabButton />
    </main>
  )
}

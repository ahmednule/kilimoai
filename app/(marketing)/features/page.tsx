'use client'

import { BarChart3, Cloud, Camera, Users, Languages, Wifi } from 'lucide-react'
import { FabButton } from '@/components/chatbot/FabButton'
import { useLanguage, FloatingOrb, FadeInView, TiltCard } from '@/components/marketing/shared'

const UI_TEXT = {
  en: {
    badge: 'Features',
    title: 'Built for Kenyan Farmers',
    f1Title: 'Scenario Analysis',
    f1Desc: 'See all three outcomes — best, expected, worst case — not just the optimistic one. Make informed borrowing decisions with full transparency about what could go right or wrong.',
    f2Title: 'Weather Intelligence',
    f2Desc: 'Real Open-Meteo rainfall data for your county. We check if the rains will come when your crop needs them most and adjust risk accordingly.',
    f3Title: 'Pest Detection',
    f3Desc: 'Upload a photo of your crop. Our AI detects pests and diseases in seconds, then adjusts your loan recommendation based on the damage.',
    f4Title: 'Chama Mode',
    f4Desc: 'Group loans for cooperatives and savings groups. Manage contributions, track members, and apply as a collective for better terms.',
    f5Title: 'Speaks Swahili',
    f5Desc: 'Full Swahili language support — not just translation. Every feature, every report, every recommendation is in Kiswahili.',
    f6Title: 'Works Offline',
    f6Desc: 'Progressive Web App that works even with poor connectivity. Your data syncs when you are back online — built for rural Kenya.',
    subtext: 'Every feature is 100% free for farmers. No catch.',
  },
  sw: {
    badge: 'Vipengele',
    title: 'Imejengwa kwa Wakulima wa Kenya',
    f1Title: 'Uchambuzi wa Hali',
    f1Desc: 'Ona matokeo yote matatu — bora, yanayotarajiwa, na mabaya. Fanya maamuzi ya kukopa kwa uwazi kamili kuhusu kinachoweza kwenda sawa au vibaya.',
    f2Title: 'Akili ya Hali ya Hewa',
    f2Desc: 'Data halisi ya mvua ya Open-Meteo kwa kaunti yako. Tunaangalia kama mvua itakuja wakati mazao yako yanahitaji zaidi na kurekebisha hatari ipasavyo.',
    f3Title: 'Kugundua Wadudu',
    f3Desc: 'Pakia picha ya zao lako. AI yetu inagundua wadudu na magonjwa kwa sekunde, halafu inarekebisha mapendekezo yako ya mkopo.',
    f4Title: 'Hali ya Chama',
    f4Desc: 'Mikopo ya kikundi kwa vyama vya ushirika na vikundi vya akiba. Dhibiti michango, fuatilia wanachama, na omba kwa pamoja kwa masharti bora.',
    f5Title: 'Inazungumza Kiswahili',
    f5Desc: 'Msaada kamili wa lugha ya Kiswahili — si tafsiri tu. Kila kipengele, kila ripoti, kila mapendekezo ni kwa Kiswahili.',
    f6Title: 'Inafanya Kazi Nje ya Mtandao',
    f6Desc: 'Programu inayoendelea kufanya kazi hata pasipo mtandao. Data yako inasawazishwa utakapounganishwa tena — imejengwa kwa vijijini Kenya.',
    subtext: 'Kila kipengele ni bure 100% kwa wakulima. Hakuna mtego.',
  },
}

const FEATURES = [
  { icon: BarChart3, color: '#D4A843', key: 'f1' },
  { icon: Cloud, color: '#2B6CB0', key: 'f2' },
  { icon: Camera, color: '#8B5E3C', key: 'f3' },
  { icon: Users, color: '#2C9E61', key: 'f4' },
  { icon: Languages, color: '#1A7A4A', key: 'f5' },
  { icon: Wifi, color: '#22C55E', key: 'f6' },
]

export default function FeaturesPage() {
  const { language } = useLanguage()
  const t = UI_TEXT[language]

  return (
    <main className="relative">
      <section className="py-20 bg-dark-mid relative overflow-hidden min-h-screen flex items-center">
        <FloatingOrb className="bottom-10 right-1/4" size={280} color="rgba(26,122,74,0.05)" speed={24} delay={3} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <FadeInView className="text-center mb-4">
            <span className="text-xs font-semibold tracking-widest uppercase text-green-primary mb-3 block">{t.badge}</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary">{t.title}</h1>
          </FadeInView>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat, index) => {
              const title = t[`${feat.key}Title` as keyof typeof t] as string
              const desc = t[`${feat.key}Desc` as keyof typeof t] as string
              return (
                <FadeInView key={index} delay={index * 0.08}>
                  <TiltCard className="group bg-dark-base border border-border-subtle rounded-2xl p-6 hover:border-green-primary/30 transition-all duration-300 h-full cursor-default">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${feat.color}15` }}
                    >
                      <feat.icon className="w-6 h-6" style={{ color: feat.color }} />
                    </div>
                    <h2 className="font-serif text-lg font-semibold text-text-primary mb-2">{title}</h2>
                    <p className="text-text-muted text-sm leading-relaxed">{desc}</p>
                  </TiltCard>
                </FadeInView>
              )
            })}
          </div>

          <FadeInView delay={0.6} className="text-center mt-10">
            <p className="text-sm text-text-muted italic">{t.subtext}</p>
          </FadeInView>
        </div>
      </section>
      <FabButton />
    </main>
  )
}

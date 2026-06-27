'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sprout } from 'lucide-react'
import { getLanguage, Language } from '@/lib/i18n'

const UI_TEXT = {
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: June 2026',
    backHome: 'Back to Home',
    intro: 'Your privacy matters. This policy explains what data Kilimo AI collects, how we use it, and your rights over it.',
    whatWeCollect: 'What we collect',
    collectItems: [
      'Farm details you share (crop type, acreage, county, loan amount)',
      'Assessment results and scenarios we generate for you',
      'Your name, email, and phone number (if you create an account)',
      'Chat conversations with the AI assistant',
      'Pest photos you upload for detection',
      'Language preference and basic device info for offline support',
    ],
    whyWeCollect: 'Why we collect it',
    whyItems: [
      'To give you accurate loan risk assessments based on real data',
      'To save your history so you can track your farm progress',
      'To improve our AI models for Kenyan agriculture',
      'To let you log in and access your records from any device',
    ],
    sharing: 'How we handle your data',
    noSell: 'We never sell your data.',
    sharingDesc: 'We do not sell, rent, or trade your personal information to anyone. Your data stays with Kilimo AI. We only use it to provide and improve the service for you.',
    storage: 'How long we keep it',
    storageDesc: 'We keep your data for as long as your account is active, so you can access your history and assessments anytime. If you want us to delete everything, just ask.',
    yourRights: 'Your rights',
    right1: 'You can request a copy of all data we have about you.',
    right2: 'You can ask us to correct anything that is wrong.',
    right3: 'You can ask us to delete your data completely, at any time.',
    right4: 'We will confirm deletion within 30 days.',
    howToRequest: 'How to request deletion',
    requestDesc: 'To request data access, correction, or deletion, send an email to:',
    contactEmail: 'itsahmednule@gmail.com',
    misc: 'Other details',
    miscItems: [
      'We do not use cookies for tracking or advertising.',
      'We do not serve third-party ads.',
      'The AI chat is powered by Featherless AI — your messages are processed to generate responses but are not used to train their models.',
      'This app works offline as a PWA; data syncs when you reconnect.',
    ],
    footer: 'Kilimo AI — Know the truth before you borrow.',
  },
  sw: {
    title: 'Sera ya Faragha',
    lastUpdated: 'Ilisasishwa mwisho: Juni 2026',
    backHome: 'Rudi nyumbani',
    intro: 'Faragha yako ni muhimu. Sera hii inaelezea data gani Kilimo AI inakusanya, jinsi tunavyotumia, na haki zako juu yake.',
    whatWeCollect: 'Tunachokusanya',
    collectItems: [
      'Maelezo ya shamba unayoshiriki (zao, ekari, kaunti, kiasi cha mkopo)',
      'Matokeo ya tathmini na hali tunazozalisha kwa ajili yako',
      'Jina lako, barua pepe, na nambari ya simu (ikiwa utafungua akaunti)',
      'Mazungumzo na msaidizi wa AI',
      'Picha za wadudu unazopakia kwa kugundua',
      'Upendeleo wa lugha na maelezo ya msingi ya kifaa kwa msaada nje ya mtandao',
    ],
    whyWeCollect: 'Kwa nini tunakusanya',
    whyItems: [
      'Kukupa tathmini sahihi za hatari ya mkopo kulingana na data halisi',
      'Kuhifadhi historia yako ili uweze kufuatilia maendeleo ya shamba lako',
      'Kuboresha mifano yetu ya AI kwa kilimo cha Kenya',
      'Kukuwezesha kuingia na kupata rekodi zako kutoka kifaa chochote',
    ],
    sharing: 'Jinsi tunavyoshughulikia data yako',
    noSell: 'Hatuwahi kuuza data yako.',
    sharingDesc: 'Hatuuzi, kukodisha, au kubadilishana maelezo yako ya kibinafsi na mtu yeyote. Data yako inakaa na Kilimo AI. Tunaitumia tu kutoa na kuboresha huduma kwako.',
    storage: 'Muda tunaoweka',
    storageDesc: 'Tunahifadhi data yako kwa muda wote akaunti yako inavyofanya kazi, ili uweze kupata historia yako na tathmini wakati wowote. Ikiwa unataka tufute kila kitu, omba tu.',
    yourRights: 'Haki zako',
    right1: 'Unaweza kuomba nakala ya data zote tulizo nazo kukuhusu.',
    right2: 'Unaweza kutuomba turekebishe chochote kisicho sahihi.',
    right3: 'Unaweza kutuomba tufute data yako kabisa, wakati wowote.',
    right4: 'Tutathibitisha ufutaji ndani ya siku 30.',
    howToRequest: 'Jinsi ya kuomba ufutaji',
    requestDesc: 'Kuomba upatikanaji wa data, marekebisho, au ufutaji, tuma barua pepe kwa:',
    contactEmail: 'itsahmednule@gmail.com',
    misc: 'Maelezo mengine',
    miscItems: [
      'Hatutumii vidakuzi kwa ufuatiliaji au matangazo.',
      'Hatutumii matangazo ya watu wengine.',
      'Mazungumzo ya AI yanaendeshwa na Featherless AI — ujumbe wako unashughulikiwa kutoa majibu lakini hautumiki kufunza mifano yao.',
      'Programu hii inafanya kazi nje ya mtandao kama PWA; data inasawazishwa unapounganisha tena.',
    ],
    footer: 'Kilimo AI — Jua ukweli kabla ya kukopa.',
  }
}

const LANG_OPTIONS: { code: Language; label: string }[] = [
  { code: 'en', label: 'English (EN)' },
  { code: 'sw', label: 'Kiswahili (SW)' },
  { code: 'ki', label: 'Gĩkũyũ (KI)' },
  { code: 'lu', label: 'Dholuo (LU)' },
]

function LanguageToggle({ language, onChange }: { language: Language; onChange: (lang: Language) => void }) {
  return (
    <select
      value={language}
      onChange={e => onChange(e.target.value as Language)}
      className="px-3 py-1.5 text-sm font-medium rounded-lg bg-dark-mid border border-border-subtle text-text-primary focus:outline-none focus:border-green-primary/50 cursor-pointer appearance-none"
    >
      {LANG_OPTIONS.map(l => (
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  )
}

export default function PrivacyPage() {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    setLanguage(getLanguage())
  }, [])

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('kilimo-language', lang)
  }

  const t = UI_TEXT[language]

  return (
    <main className="relative z-10 min-h-screen bg-dark-base">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-base/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-green-primary flex items-center justify-center group-hover:bg-green-light transition-colors">
              <Sprout className="w-6 h-6 text-text-primary" />
            </div>
            <span className="font-serif text-xl font-semibold text-text-primary">Kilimo AI</span>
          </Link>
          <LanguageToggle language={language} onChange={handleLanguageChange} />
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.backHome}
        </Link>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary mb-2">
          {t.title}
        </h1>
        <p className="text-sm text-text-muted mb-8">{t.lastUpdated}</p>

        <p className="text-text-muted leading-relaxed mb-10">{t.intro}</p>

        <Section title={t.whatWeCollect}>
          <ul className="space-y-2">
            {t.collectItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-primary flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title={t.whyWeCollect}>
          <ul className="space-y-2">
            {t.whyItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold-harvest flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title={t.sharing}>
          <p className="text-green-primary font-semibold text-base mb-2">{t.noSell}</p>
          <p className="text-sm text-text-muted leading-relaxed">{t.sharingDesc}</p>
        </Section>

        <Section title={t.storage}>
          <p className="text-sm text-text-muted leading-relaxed">{t.storageDesc}</p>
        </Section>

        <Section title={t.yourRights}>
          <ul className="space-y-2">
            {[t.right1, t.right2, t.right3, t.right4].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title={t.howToRequest}>
          <p className="text-sm text-text-muted leading-relaxed mb-2">{t.requestDesc}</p>
          <a
            href={`mailto:${t.contactEmail}`}
            className="text-green-primary hover:text-green-light font-medium text-sm underline underline-offset-2"
          >
            {t.contactEmail}
          </a>
        </Section>

        <Section title={t.misc}>
          <ul className="space-y-2">
            {t.miscItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-text-muted/40 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <div className="mt-16 pt-8 border-t border-border-subtle text-center">
          <p className="text-text-muted text-sm">{t.footer}</p>
        </div>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-serif text-lg font-semibold text-text-primary mb-3">{title}</h2>
      {children}
    </section>
  )
}

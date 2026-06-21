'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Search, ShieldCheck, ArrowRight, Sprout, Droplets, Thermometer, Leaf, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { FabButton } from '@/components/chatbot/FabButton'
import { useLanguage, FloatingOrb, FadeInView, TiltCard } from '@/components/marketing/shared'

const UI_TEXT = {
  en: {
    badge: 'Pest & Disease',
    title: 'Crop Disease Library & AI Scanner',
    subtitle: 'Identify, understand, and treat common Kenyan crop diseases — or let our AI scan your crop in seconds.',
    scannerTitle: 'How Our AI Scanner Works',
    scannerStep1Title: 'Snap a Photo',
    scannerStep1Desc: 'Take a clear photo of the affected leaf, stem, or fruit with your phone.',
    scannerStep2Title: 'Upload to Kilimo AI',
    scannerStep2Desc: 'Send the photo through our chat. The AI analyses the image pattern against thousands of known diseases.',
    scannerStep3Title: 'Get Instant Diagnosis',
    scannerStep3Desc: 'Receive the disease name, severity, and treatment recommendations in Swahili or English.',
    scannerStep4Title: 'Adjusted Loan Risk',
    scannerStep4Desc: 'If pests could affect your harvest, the risk assessment is updated automatically.',
    cta: 'Try the AI Scanner',
    ctaSub: 'Free. No account needed.',
    diseasesTitle: 'Common Crop Diseases in Kenya',
    search: 'Search crops or diseases...',
    crop: 'Crop',
    disease: 'Disease',
    symptoms: 'Symptoms',
    treatment: 'Treatment',
    prevention: 'Prevention',
    noResults: 'No diseases found matching your search.',
  },
  sw: {
    badge: 'Wadudu na Magonjwa',
    title: 'Maktaba ya Magonjwa ya Mazao na Skana ya AI',
    subtitle: 'Tambua, elewa, na tibu magonjwa ya kawaida ya mazao nchini Kenya — au acha AI yetu ichambue zao lako kwa sekunde.',
    scannerTitle: 'Jinsi Skana Yetu ya AI Inavyofanya Kazi',
    scannerStep1Title: 'Piga Picha',
    scannerStep1Desc: 'Piga picha wazi ya jani, shina, au tunda lililoathirika kwa simu yako.',
    scannerStep2Title: 'Pakia kwenye Kilimo AI',
    scannerStep2Desc: 'Tuma picha kupitia mazungumzo yetu. AI inachambua muundo wa picha dhidi ya maelfu ya magonjwa yanayojulikana.',
    scannerStep3Title: 'Pata Utambuzi wa Papo Hapo',
    scannerStep3Desc: 'Pokea jina la ugonjwa, ukali, na mapendekezo ya matibabu kwa Kiswahili au Kiingereza.',
    scannerStep4Title: 'Hatari ya Mkopo Imerekebishwa',
    scannerStep4Desc: 'Ikiwa wadudu wanaweza kuathiri mavuno yako, tathmini ya hatari inarekebishwa kiotomatiki.',
    cta: 'Jaribu Skana ya AI',
    ctaSub: 'Bure. Hakuna akaunti inayohitajika.',
    diseasesTitle: 'Magonjwa ya Kawaida ya Mazao Nchini Kenya',
    search: 'Tafuta mazao au magonjwa...',
    crop: 'Zao',
    disease: 'Ugonjwa',
    symptoms: 'Dalili',
    treatment: 'Matibabu',
    prevention: 'Kinga',
    noResults: 'Hakuna magonjwa yaliyopatikana yanayolingana na utafutaji wako.',
  },
}

interface Disease {
  id: number
  crop: string
  disease: string
  symptoms: string
  treatment: string
  prevention: string
  severity: 'high' | 'medium' | 'low'
}

const DISEASES: Disease[] = [
  { id: 1, crop: 'Maize', disease: 'Maize Lethal Necrosis Disease (MLND)', symptoms: 'Yellow streaks on leaves, stunted growth, dead heart leaves, poor cob formation', treatment: 'No cure. Remove and destroy infected plants. Use certified disease-free seeds.', prevention: 'Plant resistant varieties, control thrips and aphids, practice crop rotation', severity: 'high' },
  { id: 2, crop: 'Maize', disease: 'Fall Armyworm', symptoms: 'Holes in leaves, window-pane damage, sawdust-like frass near whorl, damaged tassels', treatment: 'Apply neem extract or recommended pesticides early morning. Biological control with parasitoids.', prevention: 'Early planting, intercropping, scout fields weekly, use push-pull method', severity: 'high' },
  { id: 3, crop: 'Maize', disease: 'Maize Streak Virus', symptoms: 'Pale green to white streaks along leaf veins, stunted growth, poor grain fill', treatment: 'No cure. Remove infected plants. Control leafhopper vectors.', prevention: 'Plant resistant varieties, control leafhoppers, avoid planting near infected fields', severity: 'medium' },
  { id: 4, crop: 'Coffee', disease: 'Coffee Berry Disease (CBD)', symptoms: 'Dark sunken lesions on green berries, berry drop, brown spots on leaves', treatment: 'Apply copper-based fungicides during wet season. Prune to improve air circulation.', prevention: 'Plant resistant varieties (e.g. Ruiru 11), proper spacing, regular pruning', severity: 'high' },
  { id: 5, crop: 'Coffee', disease: 'Coffee Leaf Rust', symptoms: 'Yellow-orange powdery spots on undersides of leaves, leaf drop, reduced yield', treatment: 'Apply fungicides containing copper or triazoles. Remove severely infected leaves.', prevention: 'Plant resistant varieties, maintain shade levels, proper nutrition to boost plant health', severity: 'high' },
  { id: 6, crop: 'Tomato', disease: 'Late Blight', symptoms: 'Water-soaked lesions on leaves and stems, white fungal growth in humid conditions, rotting fruit', treatment: 'Apply fungicides (chlorothalonil, mancozeb). Remove infected plant parts immediately.', prevention: 'Avoid overhead irrigation, ensure proper spacing, use resistant varieties', severity: 'high' },
  { id: 7, crop: 'Tomato', disease: 'Tuta Absoluta (Tomato Leaf Miner)', symptoms: 'Large blotch mines in leaves, black frass inside mines, damaged fruit and stems', treatment: 'Use pheromone traps, apply recommended insecticides, remove infested leaves.', prevention: 'Use netting in nurseries, rotate with non-solanum crops, release natural enemies', severity: 'high' },
  { id: 8, crop: 'Tomato', disease: 'Bacterial Wilt', symptoms: 'Sudden wilting of leaves, brown vascular tissue when stem is cut, plant collapse', treatment: 'No cure. Remove and destroy infected plants. Solarize soil before replanting.', prevention: 'Use grafted seedlings, crop rotation (avoid solanaceous crops for 3+ years), improve drainage', severity: 'high' },
  { id: 9, crop: 'Beans', disease: 'Angular Leaf Spot', symptoms: 'Angular grey-brown spots on leaves, dark lesions on pods, premature defoliation', treatment: 'Apply copper-based fungicides. Use disease-free seeds.', prevention: 'Plant resistant varieties, crop rotation, avoid dense planting', severity: 'medium' },
  { id: 10, crop: 'Beans', disease: 'Anthracnose', symptoms: 'Dark sunken lesions on pods, brown spots on leaves and stems, seed discoloration', treatment: 'Remove infected plants. Apply fungicides (carbendazim, mancozeb).', prevention: 'Use certified disease-free seeds, practice crop rotation, avoid working in wet fields', severity: 'medium' },
  { id: 11, crop: 'Banana', disease: 'Panama Disease (Fusarium Wilt)', symptoms: 'Yellowing of lower leaves, splitting of pseudostem, vascular discoloration, wilting', treatment: 'No cure. Quarantine affected area. Use resistant varieties for replanting.', prevention: 'Plant resistant varieties (e.g. FHIA hybrids), use tissue culture plantlets, avoid contaminated tools', severity: 'high' },
  { id: 12, crop: 'Banana', disease: 'Black Sigatoka', symptoms: 'Dark streaks on leaves that enlarge to black spots, premature leaf death, reduced fruit size', treatment: 'Apply fungicides (chlorothalonil, mancozeb). Remove severely affected leaves.', prevention: 'Proper spacing, regular de-leafing, plant resistant varieties', severity: 'medium' },
  { id: 13, crop: 'Potato', disease: 'Late Blight', symptoms: 'Water-soaked lesions on leaves, white fungal growth on undersides, brown rotting tubers', treatment: 'Apply fungicides immediately (metalaxyl, mancozeb). Remove and destroy infected foliage.', prevention: 'Use certified disease-free seed potatoes, hill soil around stems, avoid overhead irrigation', severity: 'high' },
  { id: 14, crop: 'Potato', disease: 'Bacterial Wilt', symptoms: 'Wilting of leaves, brown ring in cut tuber, ooze from cut stems, stunted growth', treatment: 'No cure. Remove and destroy infected plants. Disinfect tools.', prevention: 'Use certified clean seed, practice long crop rotation, plant resistant varieties', severity: 'high' },
]

const SCANNER_COLORS = ['#1A7A4A', '#2B6CB0', '#D4A843', '#22C55E']
const SCANNER_ICONS = [Camera, Search, ShieldCheck, AlertTriangle]

export default function PestDiseasePage() {
  const { language } = useLanguage()
  const t = UI_TEXT[language]
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? DISEASES.filter(d =>
        d.crop.toLowerCase().includes(search.toLowerCase()) ||
        d.disease.toLowerCase().includes(search.toLowerCase()) ||
        d.symptoms.toLowerCase().includes(search.toLowerCase())
      )
    : DISEASES

  const scannerSteps = [
    { icon: SCANNER_ICONS[0], title: t.scannerStep1Title, desc: t.scannerStep1Desc, color: SCANNER_COLORS[0] },
    { icon: SCANNER_ICONS[1], title: t.scannerStep2Title, desc: t.scannerStep2Desc, color: SCANNER_COLORS[1] },
    { icon: SCANNER_ICONS[2], title: t.scannerStep3Title, desc: t.scannerStep3Desc, color: SCANNER_COLORS[2] },
    { icon: SCANNER_ICONS[3], title: t.scannerStep4Title, desc: t.scannerStep4Desc, color: SCANNER_COLORS[3] },
  ]

  return (
    <main className="relative">
      {/* ─── Hero ─── */}
      <section className="py-20 bg-dark-mid relative overflow-hidden">
        <FloatingOrb className="top-1/4 -right-20" size={300} color="rgba(43,108,176,0.05)" speed={25} delay={0} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <FadeInView>
            <span className="text-xs font-semibold tracking-widest uppercase text-sky-blue mb-3 block">{t.badge}</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary mb-4">{t.title}</h1>
            <p className="text-text-muted text-base max-w-2xl mx-auto">{t.subtitle}</p>
          </FadeInView>
        </div>
      </section>

      {/* ─── Scanner How It Works ─── */}
      <section className="py-16 bg-dark-base relative overflow-hidden">
        <FloatingOrb className="bottom-10 left-1/3" size={200} color="rgba(26,122,74,0.04)" speed={22} delay={2} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInView className="text-center mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">{t.scannerTitle}</h2>
          </FadeInView>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {scannerSteps.map((step, index) => (
              <FadeInView key={index} delay={index * 0.12}>
                <TiltCard className="relative bg-dark-mid border border-border-subtle rounded-2xl p-5 text-center h-full hover:border-green-primary/20 transition-colors">
                  <div className="flex items-center justify-center mb-4">
                    <span className="absolute -top-2.5 -left-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-dark-base"
                      style={{ backgroundColor: step.color }}>
                      {index + 1}
                    </span>
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${step.color}15` }}>
                      <step.icon className="w-7 h-7" style={{ color: step.color }} />
                    </div>
                  </div>
                  <h3 className="font-serif font-semibold text-text-primary text-sm mb-1.5">{step.title}</h3>
                  <p className="text-text-muted text-xs leading-relaxed">{step.desc}</p>
                </TiltCard>
              </FadeInView>
            ))}
          </div>

          <FadeInView delay={0.6} className="text-center mt-10">
            <p className="text-text-muted text-xs mb-4">{t.ctaSub}</p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold-harvest text-dark-base font-semibold rounded-xl hover:bg-gold-harvest/90 transition-all hover:scale-105"
            >
              {t.cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeInView>
        </div>
      </section>

      {/* ─── Disease Library ─── */}
      <section className="py-16 bg-dark-mid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView className="text-center mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">{t.diseasesTitle}</h2>
          </FadeInView>

          <FadeInView delay={0.2} className="mb-8 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.search}
                className="w-full bg-dark-base border border-border-subtle rounded-xl py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green-primary/50 transition-colors"
              />
            </div>
          </FadeInView>

          {filtered.length === 0 ? (
            <FadeInView className="text-center py-10">
              <p className="text-text-muted">{t.noResults}</p>
            </FadeInView>
          ) : (
            <div className="space-y-4">
              {filtered.map((disease, index) => (
                <FadeInView key={disease.id} delay={index * 0.04} y={10}>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-dark-base border border-border-subtle rounded-2xl p-5 hover:border-green-primary/20 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        disease.severity === 'high' ? 'bg-risk-high' :
                        disease.severity === 'medium' ? 'bg-risk-medium' : 'bg-risk-low'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2 mb-1">
                          <span className="text-xs font-semibold text-gold-harvest uppercase">{disease.crop}</span>
                          <span className="text-sm font-semibold text-text-primary">{disease.disease}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            disease.severity === 'high' ? 'bg-risk-high/10 text-risk-high' :
                            disease.severity === 'medium' ? 'bg-risk-medium/10 text-risk-medium' : 'bg-risk-low/10 text-risk-low'
                          }`}>
                            {disease.severity}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-text-muted font-semibold mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {t.symptoms}
                        </p>
                        <p className="text-text-primary leading-relaxed">{disease.symptoms}</p>
                      </div>
                      <div>
                        <p className="text-text-muted font-semibold mb-1 flex items-center gap-1">
                          <Droplets className="w-3 h-3" /> {t.treatment}
                        </p>
                        <p className="text-text-primary leading-relaxed">{disease.treatment}</p>
                      </div>
                      <div>
                        <p className="text-text-muted font-semibold mb-1 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> {t.prevention}
                        </p>
                        <p className="text-text-primary leading-relaxed">{disease.prevention}</p>
                      </div>
                    </div>
                  </motion.div>
                </FadeInView>
              ))}
            </div>
          )}
        </div>
      </section>

      <FabButton />
    </main>
  )
}

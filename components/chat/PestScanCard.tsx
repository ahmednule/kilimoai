'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Bug, Leaf, CheckCircle, ShieldAlert, Beaker, Sprout, X } from 'lucide-react'
import { PestScanResult, Language } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PestScanCardProps {
  result: PestScanResult
  language: Language
  imagePreview?: string
  onClear?: () => void
}

function confidenceColor(n: number): string {
  if (n >= 80) return 'text-green-400'
  if (n >= 50) return 'text-gold-harvest'
  return 'text-risk-high'
}

function confidenceBg(n: number): string {
  if (n >= 80) return 'bg-green-400/20'
  if (n >= 50) return 'bg-gold-harvest/20'
  return 'bg-risk-high/20'
}

function severityConfig(severity: string) {
  switch (severity) {
    case 'HIGH':
      return { label: 'High', bg: 'bg-red-500/20 text-red-400 border-red-500/30', icon: ShieldAlert }
    case 'MEDIUM':
      return { label: 'Medium', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: AlertTriangle }
    case 'LOW':
      return { label: 'Low', bg: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle }
    default:
      return { label: 'Unknown', bg: 'bg-text-muted/10 text-text-muted border-text-muted/20', icon: X }
  }
}

export function PestScanCard({ result, language, imagePreview }: PestScanCardProps) {
  const sev = severityConfig(result.severity)
  const SevIcon = sev.icon
  const isHighConf = result.confidence >= 60
  const t = language === 'sw' ? {
    pestIdentified: 'Wadudu Waliotambuliwa',
    confidence: 'Uhakika',
    severity: 'Ukali',
    recommendation: 'Mapendekezo',
    affectedCrops: 'Mazao Yanayoathiriwa',
    treatment: 'Matibabu',
    chemical: 'Kemikali',
    organic: 'Asili',
    prevention: 'Kinga',
  } : {
    pestIdentified: 'Pest Identified',
    confidence: 'Confidence',
    severity: 'Severity',
    recommendation: 'Recommendation',
    affectedCrops: 'Affected Crops',
    treatment: 'Treatment',
    chemical: 'Chemical',
    organic: 'Organic',
    prevention: 'Prevention',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mt-3 rounded-xl border border-green-primary/20 bg-dark-mid overflow-hidden"
    >
      {imagePreview && (
        <div className="relative w-full h-40 bg-dark-base">
          <img
            src={imagePreview}
            alt="Scanned crop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-mid/80 to-transparent" />
        </div>
      )}

      <div className="p-4 space-y-3">
        {!isHighConf && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-[12px] text-amber-300 leading-relaxed">
              {language === 'sw'
                ? 'Uhakika wa chini — tumia picha iliyo wazi na yenye mwanga mzuri kwa matokeo bora.'
                : 'Low confidence — try a closer, well-lit photo for better results.'}
            </p>
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
              result.isPest ? 'bg-risk-high/15' : 'bg-green-primary/15'
            )}>
              {result.isPest
                ? <Bug className="w-4 h-4 text-risk-high" />
                : <Leaf className="w-4 h-4 text-green-primary" />
              }
            </div>
            <div>
              <p className="text-[13px] font-semibold text-text-primary leading-tight">
                {result.pest}
              </p>
              {result.commonName && (
                <p className="text-[11px] text-text-muted mt-0.5">{result.commonName}</p>
              )}
              {result.scientificName && (
                <p className="text-[10px] italic text-text-muted/60">{result.scientificName}</p>
              )}
            </div>
          </div>

          <div className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-medium shrink-0',
            sev.bg
          )}>
            <SevIcon className="w-3 h-3" />
            {sev.label}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-text-muted">{t.confidence}</span>
            <span className={cn('text-[11px] font-semibold', confidenceColor(result.confidence))}>
              {result.confidence}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-dark-base overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.confidence}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={cn('h-full rounded-full', confidenceBg(result.confidence).replace('/20', '/60'))}
            />
          </div>
        </div>

        {result.affectedCrops && result.affectedCrops.length > 0 && (
          <div>
            <p className="text-[11px] text-text-muted mb-1">{t.affectedCrops}</p>
            <div className="flex flex-wrap gap-1.5">
              {result.affectedCrops.map((crop, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-dark-base border border-border-subtle text-[10px] text-text-secondary"
                >
                  {crop}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 rounded-lg bg-dark-base border border-border-subtle">
          <p className="text-[11px] text-text-muted mb-1">{t.recommendation}</p>
          <p className="text-[12.5px] text-text-primary leading-relaxed">{result.recommendation}</p>
        </div>

        {result.treatment && (
          <div>
            <p className="text-[11px] text-text-muted mb-2">{t.treatment}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {result.treatment.chemical.length > 0 && (
                <div className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Beaker className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-wider">{t.chemical}</span>
                  </div>
                  <ul className="space-y-1">
                    {result.treatment.chemical.map((item, i) => (
                      <li key={i} className="text-[11px] text-text-secondary leading-relaxed">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.treatment.organic.length > 0 && (
                <div className="p-2.5 rounded-lg bg-green-500/5 border border-green-500/10">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sprout className="w-3 h-3 text-green-400" />
                    <span className="text-[10px] font-semibold text-green-300 uppercase tracking-wider">{t.organic}</span>
                  </div>
                  <ul className="space-y-1">
                    {result.treatment.organic.map((item, i) => (
                      <li key={i} className="text-[11px] text-text-secondary leading-relaxed">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.treatment.prevention.length > 0 && (
                <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider">{t.prevention}</span>
                  </div>
                  <ul className="space-y-1">
                    {result.treatment.prevention.map((item, i) => (
                      <li key={i} className="text-[11px] text-text-secondary leading-relaxed">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {result.isPest !== undefined && (
          <div className="flex items-center gap-2 pt-1">
            <div className={cn(
              'w-1.5 h-1.5 rounded-full',
              result.isPest ? 'bg-risk-high' : 'bg-green-primary'
            )} />
            <span className="text-[10px] text-text-muted">
              {result.isPest
                ? (language === 'sw' ? 'Inahitaji hatua za haraka' : 'Requires immediate action')
                : (language === 'sw' ? 'Inaweza kudhibitiwa kwa urahisi' : 'Easily manageable')
              }
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

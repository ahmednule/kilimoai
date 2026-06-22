'use client'

import { useState, useEffect, useRef } from 'react'
import { Bug, Upload, Scan, Sprout, CheckCircle2, ImageIcon, Camera, Plus } from 'lucide-react'
import { Language } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PestScanRecord {
  id: string
  pest: string
  confidence: number
  recommendation: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'
  date: string
  crop: string | null
  location: string | null
}

const PESTS = [
  { en: 'Fall Armyworm',       sw: 'Mnyau'  },
  { en: 'Maize Stem Borer',    sw: 'Kidomo wa Mahindi' },
  { en: 'Aphids',              sw: 'Vidukari' },
  { en: 'Leaf Rust',           sw: 'Kutu ya Majani' },
  { en: 'Striga (Uyuyu)',     sw: 'Uyuyu' },
  { en: 'Desert Locusts',     sw: 'Nzige wa Jangwani' },
  { en: 'Tomato Blight',      sw: 'Mnyauko wa Nyanya' },
  { en: 'Forage Harvester Ant',sw: 'Siafu wavunaji' },
  { en: 'Maize Weevil',       sw: 'Kidomo cha Ngano' },
  { en: 'Coffee Berry Borer', sw: 'Kidomo cha Kahawa' },
]

export default function PestCheckPage() {
  const [mounted, setMounted] = useState(false)
  const [language, setLanguage] = useState<Language>('en')
  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{
    pest: string
    confidence: number
    recommendation: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'
  } | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [scanHistory, setScanHistory] = useState<PestScanRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const savedLang = localStorage.getItem('kilimo-language') as Language | null
    if (savedLang) setLanguage(savedLang)
    setMounted(true)

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setShowCamera(true)
    } catch (err) {
      alert(language === 'sw' ? 'Ruhsa ya kamera imekataliwa' : 'Camera permission denied')
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg')
    setSelectedImage(dataUrl)
    setShowCamera(false)
    streamRef.current?.getTracks().forEach(t => t.stop())
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setSelectedImage(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleScan = async () => {
    setIsScanning(true)
    setScanResult(null)
    setScanError(null)

    try {
      const res = await fetch('/api/pest-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: selectedImage }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Scan failed')
      }

      setScanResult({
        pest: data.pest,
        confidence: data.confidence,
        recommendation: data.recommendation,
        severity: data.severity,
      })

      // Refresh history after successful scan
      fetchHistory()
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Scan failed')
    } finally {
      setIsScanning(false)
    }
  }

  const resetScan = () => {
    setSelectedImage(null)
    setScanResult(null)
    setScanError(null)
  }

  const severityColor = (sev: string) =>
    sev === 'HIGH' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
    sev === 'MEDIUM' ? 'bg-yellow-primary/10 text-yellow-400 border-yellow-primary/20' :
    sev === 'LOW' ? 'bg-green-primary/10 text-green-400 border-green-primary/20' :
    'bg-dark-base text-text-muted border-border-subtle'

  const handleDownload = () => {
    if (!scanResult) return
    const text = [
      `Pest Check Report`,
      `Date: ${new Date().toLocaleDateString()}`,
      ``,
      `Pest/Disease: ${scanResult.pest}`,
      `Confidence: ${scanResult.confidence}%`,
      `Severity: ${scanResult.severity}`,
      ``,
      `Recommendation:`,
      scanResult.recommendation,
    ].join('\n')

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pest-report-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      const res = await fetch('/api/pest-check/history')
      const data = await res.json()
      if (data.success) {
        setScanHistory(data.scans)
      }
    } catch (err) {
      // silently fail, history not critical
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory()
    }
  }, [activeTab])

  if (!mounted) return null

  return (
    <div className="p-8 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <p className="text-text-muted text-xs uppercase tracking-widest mb-1">crop protection</p>
        <h1 className="text-2xl font-serif font-semibold text-text-primary">
          {language === 'sw' ? 'Kagua Wadudu' : 'Pest Check'}
        </h1>
        <p className="text-sm text-text-muted mt-1">
          {language === 'sw'
            ? 'Piga picha ya zao lako lenye wadudu au ugonjwa na upate utambuzi na mapendekezo'
            : 'Snap a photo of your crop with pests or disease and get diagnosis and recommendations'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-base rounded-lg p-1 w-fit">
        {([
          { id: 'scan', label: { en: 'Scan now', sw: 'Kagua sasa' } },
          { id: 'history', label: { en: 'My history', sw: 'Historia yangu' } },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-dark-mid text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            {tab.label[language]}
          </button>
        ))}
      </div>

      {activeTab === 'scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload / preview */}
          <div>
            {!selectedImage ? (
              <div className="border-2 border-dashed border-border-subtle rounded-xl p-8 flex flex-col items-center justify-center gap-4 min-h-[320px] hover:border-green-primary/40 transition-colors">
                <div className="p-3 rounded-full bg-dark-base">
                  <Camera className="w-6 h-6 text-text-muted" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-text-primary">
                    {language === 'sw' ? 'Leta picha ya zao' : 'Upload a crop photo'}
                  </p>
                  <p className="text-xs text-text-muted">
                    {language === 'sw' ? 'Piga picha ili kugundua wadudu au magonjwa' : 'Capture to detect pests or diseases'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary hover:border-green-primary/40 transition-colors flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    {language === 'sw' ? 'Piga picha' : 'Take photo'}
                  </button>
                  <label className="px-4 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary hover:border-green-primary/40 transition-colors cursor-pointer flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    {language === 'sw' ? 'Chagua faili' : 'Choose file'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-border-subtle relative min-h-[320px] flex items-center justify-center bg-dark-mid">
                <button
                  onClick={resetScan}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-dark-mid border border-border-subtle rounded-lg text-xs text-text-muted hover:text-text-primary z-10"
                >
                  {language === 'sw' ? 'Chukua nyingine' : 'Retake'}
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedImage} alt="Crop" className="max-w-full max-h-[360px] object-contain" />
              </div>
            )}

            {/* Camera modal */}
            {showCamera && (
              <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
                <div className="relative max-w-lg w-full">
                  <video ref={videoRef} className="w-full rounded-xl" autoPlay playsInline muted />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <button
                      onClick={() => { setShowCamera(false); streamRef.current?.getTracks().forEach(t => t.stop()); }}
                      className="px-4 py-2 bg-dark-mid border border-border-subtle rounded-lg text-sm text-white"
                    >
                      {language === 'sw' ? 'Ghairi' : 'Cancel'}
                    </button>
                    <button
                      onClick={capturePhoto}
                      className="p-3 rounded-full bg-white border-4 border-green-primary"
                    >
                      <Camera className="w-5 h-5 text-dark-base" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Scan result */}
          <div>
            <div className="border border-border-subtle rounded-xl p-5 min-h-[320px]">
              {!scanResult && !isScanning && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
                  <Scan className="w-8 h-8 text-text-muted" />
                  <p className="text-sm text-text-muted">
                    {language === 'sw'
                      ? 'Pakia picha ili kuona utambuzi na mapendekezo hapa'
                      : 'Upload an image to see diagnosis & recommendation'}
                  </p>
                  {selectedImage && (
                    <button
                      onClick={handleScan}
                      className="mt-2 px-5 py-2.5 bg-green-primary text-white rounded-lg text-sm font-medium hover:bg-green-primary/90 transition-colors flex items-center gap-2"
                    >
                      <Scan className="w-4 h-4" />
                      {language === 'sw' ? 'Anza kagua' : 'Scan now'}
                    </button>
                  )}
                </div>
              )}

              {isScanning && (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
                  <div className="w-8 h-8 rounded-full border-2 border-green-primary border-t-transparent animate-spin" />
                  <p className="text-sm text-text-muted">
                    {language === 'sw' ? 'Inakagua...' : 'Scanning...'}
                  </p>
                </div>
              )}

              {scanError && !isScanning && (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-12 px-4">
                  <div className="p-3 rounded-full bg-red-500/10">
                    <Bug className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="text-sm font-medium text-red-400 text-center">
                    {language === 'sw' ? 'Hitilafu imetokea' : 'Scan failed'}
                  </p>
                  <p className="text-xs text-text-muted text-center leading-relaxed">{scanError}</p>
                  {selectedImage && (
                    <button
                      onClick={handleScan}
                      className="mt-2 px-4 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary hover:border-green-primary/40 transition-colors"
                    >
                      {language === 'sw' ? 'Jaribu tena' : 'Retry'}
                    </button>
                  )}
                </div>
              )}

              {scanResult && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-dark-base">
                      <Bug className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-text-primary">{scanResult.pest}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-text-muted">
                          {language === 'sw' ? 'Uaminifu' : 'Confidence'}: {scanResult.confidence}%
                        </span>
                        <span className={cn('text-[10px] font-medium uppercase px-2 py-0.5 rounded-full border', severityColor(scanResult.severity))}>
                          {scanResult.severity === 'HIGH'
                            ? (language === 'sw' ? 'HATARI' : 'HIGH')
                            : scanResult.severity === 'MEDIUM'
                            ? 'MEDIUM'
                            : 'LOW'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-dark-base rounded-lg border border-border-subtle">
                    <p className="text-xs font-medium text-text-primary mb-1">
                      {language === 'sw' ? 'Pendekezo' : 'Recommendation'}
                    </p>
                    <p className="text-xs text-text-muted leading-relaxed">{scanResult.recommendation}</p>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 text-xs text-green-400 font-medium hover:text-green-300 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    {language === 'sw' ? 'Chukua ripoti' : 'Download report'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-3 max-w-2xl">
          {scanHistory.length === 0 && !historyLoading && (
            <div className="bg-dark-mid border border-border-subtle rounded-xl p-8 text-center">
              <p className="text-sm text-text-muted">
                {language === 'sw' ? 'Hakuna historia bado. Kagua picha ili kuona hapa.' : 'No history yet. Scan an image to see it here.'}
              </p>
            </div>
          )}
          {historyLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-green-primary border-t-transparent animate-spin" />
            </div>
          )}
          {scanHistory.map((record) => {
            const dateStr = new Date(record.date).toLocaleDateString('en-US', {
              day: 'numeric', month: 'short', year: 'numeric',
            })
            return (
              <div key={record.id} className="bg-dark-mid border border-border-subtle rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{record.pest}</p>
                    <p className="text-xs text-text-muted">{record.location || (language === 'sw' ? 'Haijabainishwa' : 'Unspecified')}</p>
                  </div>
                  <span className={cn(
                    'text-[10px] font-medium uppercase px-2 py-0.5 rounded-full border',
                    record.severity === 'HIGH' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    record.severity === 'MEDIUM' ? 'bg-yellow-primary/10 text-yellow-400 border-yellow-primary/20' :
                    record.severity === 'LOW' ? 'bg-green-primary/10 text-green-400 border-green-primary/20' :
                    'bg-dark-base text-text-muted border-border-subtle'
                  )}>
                    {record.severity === 'HIGH'
                      ? (language === 'sw' ? 'HATARI' : 'HIGH')
                      : record.severity === 'MEDIUM'
                      ? 'MEDIUM'
                      : record.severity === 'LOW'
                      ? 'LOW'
                      : record.severity}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-text-muted">
                  {record.crop && <><span>{record.crop}</span><span>&middot;</span></>}
                  <span>{dateStr}</span>
                  <span>&middot;</span>
                  <span>{language === 'sw' ? 'Uaminifu' : 'Confidence'}: {record.confidence}%</span>
                </div>
                <p className="mt-2 text-xs text-text-muted/80 leading-relaxed">{record.recommendation}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
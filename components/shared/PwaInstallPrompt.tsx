'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<any>(null)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches

    if (isStandalone) return

    if (isIOS) {
      const hasDismissed = localStorage.getItem('kilimo-pwa-ios-dismissed')
      if (!hasDismissed) {
        setShowIOSGuide(true)
      }
      return
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  if (dismissed || (!installEvent && !showIOSGuide)) return null

  const handleInstall = async () => {
    if (!installEvent) return
    installEvent.prompt()
    const result = await installEvent.userChoice
    if (result.outcome === 'accepted') {
      setInstallEvent(null)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    if (showIOSGuide) {
      localStorage.setItem('kilimo-pwa-ios-dismissed', 'true')
    }
  }

  if (showIOSGuide) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
        <div className="bg-dark-mid border border-border-subtle rounded-xl p-4 shadow-2xl">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-primary flex items-center justify-center">
                <Download className="w-4 h-4 text-green-100" />
              </div>
              <p className="text-sm font-semibold text-text-primary">Install Kilimo AI</p>
            </div>
            <button onClick={handleDismiss} className="p-1 text-text-muted hover:text-text-primary">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-text-muted leading-relaxed mb-3">
            Tap the <strong className="text-text-primary">Share</strong> button in Safari, then scroll down and tap <strong className="text-text-primary">Add to Home Screen</strong>.
          </p>
          <button
            onClick={handleDismiss}
            className="w-full py-2 rounded-lg bg-green-primary text-white text-sm font-medium hover:bg-green-light transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-dark-mid border border-border-subtle rounded-xl p-4 shadow-2xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-primary flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-green-100" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">Install Kilimo AI</p>
          <p className="text-xs text-text-muted">Add to your home screen for the best experience</p>
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 px-4 py-2 rounded-lg bg-green-primary text-white text-sm font-medium hover:bg-green-light transition-colors"
        >
          Install
        </button>
        <button onClick={handleDismiss} className="shrink-0 p-1 text-text-muted hover:text-text-primary">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

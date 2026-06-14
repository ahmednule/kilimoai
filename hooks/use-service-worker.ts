'use client'

import { useEffect, useState, useCallback } from 'react'

export function useServiceWorker() {
  const [isRegistered, setIsRegistered] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  const shouldRegister =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    (process.env.NODE_ENV === 'production' ||
     process.env.NEXT_PUBLIC_PWA_DEV === 'true')

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    setIsOffline(!navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if (!shouldRegister) return

    let unregistered = false

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        if (unregistered) return
        setIsRegistered(true)

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                setUpdateAvailable(true)
              }
            })
          }
        })
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error)
      })

    return () => {
      unregistered = true
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [shouldRegister])

  const updateServiceWorker = useCallback(() => {
    if (!shouldRegister) return
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        registration.waiting.addEventListener('statechange', () => {
          if (registration.waiting?.state === 'activated') {
            window.location.reload()
          }
        })
      } else {
        window.location.reload()
      }
    })
  }, [shouldRegister])

  return {
    isRegistered,
    isOffline,
    updateAvailable,
    updateServiceWorker,
  }
}
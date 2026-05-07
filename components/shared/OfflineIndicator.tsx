'use client'

import { useServiceWorker } from '@/hooks/use-service-worker'

export function OfflineIndicator() {
  const { isOffline, updateAvailable, updateServiceWorker } = useServiceWorker()

  if (!isOffline && !updateAvailable) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
      {isOffline && (
        <div className="bg-amber-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a4 4 0 010-5.656m-7.072 7.072a9 9 0 010-12.728m3.536 3.536a4 4 0 010 5.656" />
          </svg>
          <span>You are offline. Some features may be limited.</span>
        </div>
      )}
      
      {updateAvailable && !isOffline && (
        <div className="bg-primary text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 text-sm">
          <span>A new version is available!</span>
          <button
            onClick={updateServiceWorker}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            Update
          </button>
        </div>
      )}
    </div>
  )
}

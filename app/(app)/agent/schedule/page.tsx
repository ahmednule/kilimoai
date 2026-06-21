'use client'

import { CalendarDays, MapPin, Sprout, Phone, ChevronRight } from 'lucide-react'

const VISITS = [
  { farmer: 'David Mwangi', county: 'Kiambu', crop: 'Coffee', date: '2026-06-23', time: '09:00', status: 'confirmed' },
  { farmer: 'Samuel Kiprop', county: 'Bomet', crop: 'Maize', date: '2026-06-24', time: '10:30', status: 'confirmed' },
  { farmer: 'Grace Wanjiku', county: 'Nakuru', crop: 'Maize', date: '2026-06-25', time: '08:00', status: 'pending' },
]

export default function SchedulePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
        <CalendarDays className="w-3.5 h-3.5" />
        <span>Agent / Schedule</span>
      </div>
      <h1 className="text-xl sm:text-2xl font-serif font-bold text-text-primary mb-1">Field Visit Queue</h1>
      <p className="text-sm text-text-muted mb-6">Upcoming field visits sorted by date</p>

      <div className="space-y-3">
        {VISITS.map((v, i) => (
          <div key={i} className="bg-dark-mid border border-border-subtle rounded-xl p-4 hover:border-green-primary/30 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-semibold text-text-primary">{v.farmer}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    v.status === 'confirmed' ? 'text-risk-low bg-risk-low/10' : 'text-risk-medium bg-risk-medium/10'
                  }`}>{v.status}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {v.county}</span>
                  <span className="flex items-center gap-1"><Sprout className="w-3 h-3" /> {v.crop}</span>
                  <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {v.date} at {v.time}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

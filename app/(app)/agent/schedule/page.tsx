'use client'

import { useState, useEffect } from 'react'
import { CalendarDays, MapPin, Sprout, Phone, Plus, Loader2, CheckCircle2, Clock, X, Send, UserCheck, AlertTriangle } from 'lucide-react'
import { getToken } from '@/lib/auth'

interface Schedule {
  id: string
  agentId: string
  farmerId: string
  farmerName: string
  farmerPhone: string
  farmerEmail: string
  county: string
  crop: string
  date: string
  time: string
  notes: string
  status: 'pending' | 'confirmed' | 'completed'
  createdAt: string
}

interface ApiFarmer {
  id: string
  name: string
  phone: string
  county: string
  crops: string[]
  acreage: number
  status: string
}

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'text-risk-medium', bg: 'bg-risk-medium/10' },
  confirmed: { label: 'Confirmed', color: 'text-risk-low',    bg: 'bg-risk-low/10'    },
  completed: { label: 'Completed', color: 'text-green-400',   bg: 'bg-green-400/10'   },
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [farmers, setFarmers] = useState<ApiFarmer[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  // Create form state
  const [selectedFarmer, setSelectedFarmer] = useState('')
  const [visitDate, setVisitDate] = useState('')
  const [visitTime, setVisitTime] = useState('')
  const [visitNotes, setVisitNotes] = useState('')

  useEffect(() => {
    loadSchedules()
    loadFarmers()
  }, [])

  async function loadSchedules() {
    const token = getToken()
    if (!token) return
    try {
      const res = await fetch('/api/agent/schedules', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setSchedules(data.schedules || [])
    } catch {}
    setLoading(false)
  }

  async function loadFarmers() {
    const token = getToken()
    if (!token) return
    try {
      const res = await fetch('/api/agent/farmers?status=pending', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setFarmers(data.farmers || [])
    } catch {}
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFarmer || !visitDate || !visitTime) return
    const token = getToken()
    if (!token) return

    setSubmitting(true)
    const farmer = farmers.find(f => f.id === selectedFarmer)
    try {
      const res = await fetch('/api/agent/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          farmerId: selectedFarmer,
          farmerName: farmer?.name || '',
          county: farmer?.county || '',
          crop: farmer?.crops?.[0] || '',
          date: visitDate,
          time: visitTime,
          notes: visitNotes,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowCreate(false)
        setSelectedFarmer('')
        setVisitDate('')
        setVisitTime('')
        setVisitNotes('')
        loadSchedules()
      }
    } catch {}
    setSubmitting(false)
  }

  async function handleUpdateStatus(scheduleId: string, status: string) {
    const token = getToken()
    if (!token) return
    setUpdating(scheduleId)
    try {
      await fetch('/api/agent/schedules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ scheduleId, status }),
      })
      loadSchedules()
    } catch {}
    setUpdating(null)
  }

  const filtered = schedules.filter(s => statusFilter === 'all' || s.status === statusFilter)
  const pendingCount = schedules.filter(s => s.status === 'pending').length

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Agent / Schedule</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-text-primary">Field Visit Queue</h1>
          <p className="text-sm text-text-muted mt-1">Schedule and manage field visits to verify farmer information</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-primary/10 border border-green-primary/20 text-green-400 text-xs font-medium hover:bg-green-primary/20 transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Schedule Visit
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-3 mb-4 text-xs">
        <span className="text-text-muted">{schedules.length} total</span>
        {pendingCount > 0 && (
          <span className="flex items-center gap-1 text-risk-medium">
            <Clock className="w-3 h-3" />
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'pending', 'confirmed', 'completed'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-green-primary/15 text-green-400 border border-green-primary/30'
                : 'bg-dark-mid text-text-muted border border-border-subtle hover:text-text-primary'
            }`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Schedule list */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-5 h-5 animate-spin text-green-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No field visits scheduled</p>
          <p className="text-xs mt-1">Click &quot;Schedule Visit&quot; to create one</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => {
            const sc = STATUS_CONFIG[s.status]
            return (
              <div key={s.id} className="bg-dark-mid border border-border-subtle rounded-xl p-4 hover:border-green-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-semibold text-text-primary">{s.farmerName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${sc.color} ${sc.bg}`}>{sc.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.county}</span>
                      <span className="flex items-center gap-1"><Sprout className="w-3 h-3" /> {s.crop || 'N/A'}</span>
                      <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {s.date} at {s.time}</span>
                      {s.farmerPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {s.farmerPhone}</span>}
                    </div>
                    {s.notes && <p className="text-xs text-text-muted/70 mt-1 italic">{s.notes}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {s.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(s.id, 'confirmed')}
                          disabled={updating === s.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-risk-low/10 border border-risk-low/30 text-risk-low text-[10px] font-medium hover:bg-risk-low/20 transition-colors disabled:opacity-50"
                        >
                          {updating === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                          Confirm
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(s.id, 'completed')}
                          disabled={updating === s.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-400/10 border border-green-400/20 text-green-400 text-[10px] font-medium hover:bg-green-400/20 transition-colors disabled:opacity-50"
                        >
                          {updating === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                          Complete
                        </button>
                      </>
                    )}
                    {s.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(s.id, 'completed')}
                        disabled={updating === s.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-400/10 border border-green-400/20 text-green-400 text-[10px] font-medium hover:bg-green-400/20 transition-colors disabled:opacity-50"
                      >
                        {updating === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                        Complete
                      </button>
                    )}
                    {s.status === 'completed' && (
                      <span className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] text-green-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Done
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create schedule modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-dark-mid border border-border-subtle rounded-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Schedule Field Visit</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-dark-base rounded-lg transition-colors">
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-muted">Farmer</label>
                <select
                  value={selectedFarmer}
                  onChange={e => {
                    const f = farmers.find(f => f.id === e.target.value)
                    setSelectedFarmer(e.target.value)
                  }}
                  required
                  className="w-full mt-1 px-3 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:border-green-primary/50"
                >
                  <option value="">Select a farmer...</option>
                  {farmers.map(f => (
                    <option key={f.id} value={f.id}>{f.name} — {f.county} ({f.crops?.[0] || 'N/A'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-text-muted">Date</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={e => setVisitDate(e.target.value)}
                    required
                    className="w-full mt-1 px-3 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:border-green-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted">Time</label>
                  <input
                    type="time"
                    value={visitTime}
                    onChange={e => setVisitTime(e.target.value)}
                    required
                    className="w-full mt-1 px-3 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:border-green-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted">Notes (optional)</label>
                <textarea
                  value={visitNotes}
                  onChange={e => setVisitNotes(e.target.value)}
                  rows={2}
                  placeholder="What to check during the visit..."
                  className="w-full mt-1 px-3 py-2 bg-dark-base border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green-primary/50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-green-primary text-dark-base font-semibold text-sm hover:bg-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? 'Scheduling...' : 'Schedule Visit'}
              </button>

              <p className="text-[10px] text-text-muted text-center">
                Farmer will receive a notification in-app. Email notification will be sent if email is available.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

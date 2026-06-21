'use client'

import { useState } from 'react'
import { Settings, Shield, Bell, Globe, Database } from 'lucide-react'

interface SettingSection {
  id: string
  title: string
  subtitle: string
  icon: typeof Shield
  color: string
  toggles: { label: string; description: string; key: string; defaultOn: boolean }[]
}

const SECTIONS: SettingSection[] = [
  {
    id: 'security', title: 'Security', subtitle: 'Authentication and access control',
    icon: Shield, color: 'text-red-400 bg-red-400/10',
    toggles: [
      { label: 'Two-Factor Auth', description: 'Require 2FA for all admin accounts', key: '2fa', defaultOn: true },
      { label: 'IP Whitelisting', description: 'Restrict admin access to approved IPs', key: 'ip_whitelist', defaultOn: false },
      { label: 'Session Timeout', description: 'Auto-logout after 30 minutes of inactivity', key: 'session_timeout', defaultOn: true },
    ],
  },
  {
    id: 'notifications', title: 'Notifications', subtitle: 'System alert preferences',
    icon: Bell, color: 'text-yellow-400 bg-yellow-400/10',
    toggles: [
      { label: 'New User Alerts', description: 'Notify when a new user registers', key: 'new_user', defaultOn: true },
      { label: 'Loan Approvals', description: 'Alert when a loan requires admin review', key: 'loan_approval', defaultOn: true },
      { label: 'Daily Reports', description: 'Send daily platform summary via email', key: 'daily_report', defaultOn: false },
    ],
  },
  {
    id: 'general', title: 'General', subtitle: 'Platform defaults and preferences',
    icon: Globe, color: 'text-green-400 bg-green-400/10',
    toggles: [
      { label: 'Maintenance Mode', description: 'Show maintenance page to non-admin users', key: 'maintenance', defaultOn: false },
      { label: 'Registration Open', description: 'Allow new user signups', key: 'registration', defaultOn: true },
      { label: 'Swahili Default', description: 'Default language for new users in Kenya', key: 'swahili_default', defaultOn: true },
    ],
  },
  {
    id: 'data', title: 'Data & Privacy', subtitle: 'Data retention and privacy settings',
    icon: Database, color: 'text-blue-400 bg-blue-400/10',
    toggles: [
      { label: 'Auto-Archive', description: 'Archive inactive user data after 12 months', key: 'auto_archive', defaultOn: true },
      { label: 'Analytics Tracking', description: 'Collect anonymous usage analytics', key: 'analytics', defaultOn: true },
      { label: 'Data Export', description: 'Allow users to export their data', key: 'data_export', defaultOn: true },
    ],
  },
]

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    SECTIONS.forEach(s => s.toggles.forEach(t => { initial[t.key] = t.defaultOn }))
    return initial
  })
  const [saved, setSaved] = useState(false)

  const toggle = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
        <Settings className="w-3.5 h-3.5" />
        <span>Admin / Settings</span>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-text-primary">Settings</h1>
          <p className="text-sm text-text-muted mt-1">Configure platform-wide preferences and policies</p>
        </div>
        <button onClick={handleSave}
          className="px-5 py-2.5 bg-green-primary text-text-primary text-sm font-semibold rounded-xl hover:bg-green-light transition-colors"
        >
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-4">
        {SECTIONS.map(section => (
          <div key={section.id} className="bg-dark-mid border border-border-subtle rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${section.color}`}>
                <section.icon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-text-primary">{section.title}</h2>
                <p className="text-xs text-text-muted">{section.subtitle}</p>
              </div>
            </div>
            <div className="space-y-3">
              {section.toggles.map(toggleItem => (
                <label key={toggleItem.key} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-dark-base/50 transition-colors cursor-pointer">
                  <div>
                    <p className="text-sm text-text-primary">{toggleItem.label}</p>
                    <p className="text-xs text-text-muted">{toggleItem.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle(toggleItem.key)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${settings[toggleItem.key] ? 'bg-green-primary' : 'bg-dark-base border border-border-subtle'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${settings[toggleItem.key] ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

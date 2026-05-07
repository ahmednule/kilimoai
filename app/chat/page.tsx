'use client'

import { useState, useEffect } from 'react'
import { FarmerProfile, Language } from '@/lib/types'
import { Navbar } from '@/components/layout/Navbar'
import { FarmerProfileForm } from '@/components/chat/FarmerProfileForm'
import { ChatInterface } from '@/components/chat/ChatInterface'

export default function ChatPage() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null)
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('kilimo-language') as Language | null
    if (saved) setLanguage(saved)
  }, [])

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('kilimo-language', lang)
  }

  const handleProfileSubmit = (newProfile: FarmerProfile) => {
    setProfile(newProfile)
    setLanguage(newProfile.language)
    localStorage.setItem('kilimo-language', newProfile.language)
  }

  const handleReset = () => {
    setProfile(null)
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-dark-base">
        <Navbar language={language} onLanguageChange={handleLanguageChange} />
        <FarmerProfileForm 
          onSubmit={handleProfileSubmit}
          initialLanguage={language}
          onLanguageChange={handleLanguageChange}
        />
      </main>
    )
  }

  return (
    <ChatInterface 
      profile={profile} 
      onReset={handleReset}
      onLanguageChange={handleLanguageChange}
    />
  )
}

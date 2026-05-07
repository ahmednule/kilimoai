'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sprout, Search, ChevronDown } from 'lucide-react'
import { FarmerProfile, Language } from '@/lib/types'
import { KENYAN_COUNTIES, CROPS, UI_TEXT } from '@/lib/constants'
import { LanguageToggle } from '@/components/shared/LanguageToggle'
import { cn } from '@/lib/utils'

interface FarmerProfileFormProps {
  onSubmit: (profile: FarmerProfile) => void
  initialLanguage: Language
  onLanguageChange: (language: Language) => void
}

export function FarmerProfileForm({ onSubmit, initialLanguage, onLanguageChange }: FarmerProfileFormProps) {
  const [name, setName] = useState('')
  const [county, setCounty] = useState('')
  const [crop, setCrop] = useState('')
  const [acres, setAcres] = useState('')
  const [language, setLanguage] = useState<Language>(initialLanguage)
  const [countySearch, setCountySearch] = useState('')
  const [showCountyDropdown, setShowCountyDropdown] = useState(false)
  const [showCropDropdown, setShowCropDropdown] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const t = UI_TEXT[language]

  const filteredCounties = useMemo(() => {
    if (!countySearch) return KENYAN_COUNTIES
    return KENYAN_COUNTIES.filter(c => 
      c.toLowerCase().includes(countySearch.toLowerCase())
    )
  }, [countySearch])

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    onLanguageChange(lang)
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = language === 'en' ? 'Name is required' : 'Jina linahitajika'
    if (!county) newErrors.county = language === 'en' ? 'County is required' : 'Kaunti inahitajika'
    if (!crop) newErrors.crop = language === 'en' ? 'Crop is required' : 'Zao linahitajika'
    if (!acres || parseFloat(acres) <= 0) newErrors.acres = language === 'en' ? 'Valid acreage required' : 'Ekari sahihi zinahitajika'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    
    const profile: FarmerProfile = {
      name: name.trim(),
      county,
      crop,
      acres: parseFloat(acres),
      language,
    }
    
    // Save profile to localStorage for dashboard access
    localStorage.setItem('kilimo-profile', JSON.stringify(profile))
    
    onSubmit(profile)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-green-primary mx-auto flex items-center justify-center mb-4">
            <Sprout className="w-8 h-8 text-text-primary" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-text-primary">
            {t.profileTitle}
          </h1>
          <p className="mt-2 text-text-muted text-sm">
            {t.profileSubtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-mid border border-border-subtle rounded-2xl p-6 space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
              {t.nameLabel}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              className={cn(
                "w-full px-4 py-3 bg-dark-base border rounded-xl text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-green-primary/50 focus:border-green-primary transition-all text-base",
                errors.name ? "border-risk-high" : "border-border-subtle"
              )}
            />
            {errors.name && <p className="mt-1 text-xs text-risk-high">{errors.name}</p>}
          </div>

          {/* County */}
          <div className="relative">
            <label htmlFor="county" className="block text-sm font-medium text-text-primary mb-2">
              {t.countyLabel}
            </label>
            <div className="relative">
              <input
                id="county"
                type="text"
                value={county || countySearch}
                onChange={(e) => {
                  setCountySearch(e.target.value)
                  setCounty('')
                  setShowCountyDropdown(true)
                }}
                onFocus={() => setShowCountyDropdown(true)}
                placeholder={t.countyPlaceholder}
                className={cn(
                  "w-full px-4 py-3 pr-10 bg-dark-base border rounded-xl text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-green-primary/50 focus:border-green-primary transition-all text-base",
                  errors.county ? "border-risk-high" : "border-border-subtle"
                )}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            </div>
            {showCountyDropdown && filteredCounties.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-dark-base border border-border-subtle rounded-xl max-h-48 overflow-y-auto shadow-lg">
                {filteredCounties.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCounty(c)
                      setCountySearch('')
                      setShowCountyDropdown(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-text-primary hover:bg-green-primary/10 transition-colors text-sm"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            {errors.county && <p className="mt-1 text-xs text-risk-high">{errors.county}</p>}
          </div>

          {/* Crop */}
          <div className="relative">
            <label htmlFor="crop" className="block text-sm font-medium text-text-primary mb-2">
              {t.cropLabel}
            </label>
            <button
              type="button"
              onClick={() => setShowCropDropdown(!showCropDropdown)}
              className={cn(
                "w-full px-4 py-3 bg-dark-base border rounded-xl text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-green-primary/50 focus:border-green-primary transition-all",
                errors.crop ? "border-risk-high" : "border-border-subtle",
                crop ? "text-text-primary" : "text-text-muted/50"
              )}
            >
              <span>
                {crop ? CROPS.find(c => c.value === crop)?.label[language] : t.cropPlaceholder}
              </span>
              <ChevronDown className="w-5 h-5 text-text-muted" />
            </button>
            {showCropDropdown && (
              <div className="absolute z-20 w-full mt-1 bg-dark-base border border-border-subtle rounded-xl max-h-48 overflow-y-auto shadow-lg">
                {CROPS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      setCrop(c.value)
                      setShowCropDropdown(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-text-primary hover:bg-green-primary/10 transition-colors text-sm"
                  >
                    {c.label[language]}
                  </button>
                ))}
              </div>
            )}
            {errors.crop && <p className="mt-1 text-xs text-risk-high">{errors.crop}</p>}
          </div>

          {/* Acres */}
          <div>
            <label htmlFor="acres" className="block text-sm font-medium text-text-primary mb-2">
              {t.acresLabel}
            </label>
            <input
              id="acres"
              type="number"
              value={acres}
              onChange={(e) => setAcres(e.target.value)}
              placeholder={t.acresPlaceholder}
              min="0.1"
              step="0.1"
              className={cn(
                "w-full px-4 py-3 bg-dark-base border rounded-xl text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-green-primary/50 focus:border-green-primary transition-all text-base",
                errors.acres ? "border-risk-high" : "border-border-subtle"
              )}
            />
            {errors.acres && <p className="mt-1 text-xs text-risk-high">{errors.acres}</p>}
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t.languageLabel}
            </label>
            <LanguageToggle
              language={language}
              onChange={handleLanguageChange}
              className="w-full justify-center"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 bg-gold-harvest text-dark-base font-semibold rounded-xl hover:bg-gold-harvest/90 transition-all duration-200 mt-6"
          >
            {t.submitProfile}
          </button>
        </form>
      </motion.div>

      {/* Close dropdowns on outside click */}
      {(showCountyDropdown || showCropDropdown) && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => {
            setShowCountyDropdown(false)
            setShowCropDropdown(false)
          }} 
        />
      )}
    </div>
  )
}

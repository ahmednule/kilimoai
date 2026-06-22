export const KENYAN_COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet",
  "Embu", "Garissa", "Homa Bay", "Isiolo", "Kajiado",
  "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga",
  "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia",
  "Lamu", "Machakos", "Makueni", "Mandera", "Marsabit",
  "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi",
  "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua",
  "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River",
  "Tharaka-Nithi", "Trans-Nzoia", "Turkana", "Uasin Gishu",
  "Vihiga", "Wajir", "West Pokot"
]

export const COUNTY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Nairobi':  { lat: -1.286,  lng: 36.817 },
  'Nyeri':    { lat: -0.416,  lng: 36.952 },
  'Mombasa':  { lat: -4.043,  lng: 39.668 },
  // ... all 47 counties
}

export const CROPS = [
  { value: "maize", label: { en: "Maize", sw: "Mahindi" } },
  { value: "beans", label: { en: "Beans", sw: "Maharagwe" } },
  { value: "tea", label: { en: "Tea", sw: "Chai" } },
  { value: "coffee", label: { en: "Coffee", sw: "Kahawa" } },
  { value: "wheat", label: { en: "Wheat", sw: "Ngano" } },
  { value: "rice", label: { en: "Rice", sw: "Mchele" } },
  { value: "sorghum", label: { en: "Sorghum", sw: "Mtama" } },
  { value: "potatoes", label: { en: "Potatoes", sw: "Viazi" } },
  { value: "tomatoes", label: { en: "Tomatoes", sw: "Nyanya" } },
  { value: "avocado", label: { en: "Avocado", sw: "Parachichi" } },
  { value: "other", label: { en: "Other", sw: "Nyingine" } },
]

export const QUICK_REPLIES = {
  en: [
    "What if I add an acre?",
    "What's the safest loan amount?",
    "Show me a smaller loan option",
    "What about drought risk?",
    "When should I apply for the loan?",
    "What are my chances of repaying?",
  ],
  sw: [
    "Je, niongeze ekari moja?",
    "Kiasi salama zaidi cha mkopo ni nini?",
    "Nionyeshe chaguo la mkopo mdogo zaidi",
    "Je, ukame unaweza kutokea?",
    "Ninapaswa kuomba mkopo lini?",
    "Nafasi yangu ya kulipa ni ipi?",
  ]
}

export const UI_TEXT = {
  en: {
    // Landing page
    heroTitle: "Jua Ukweli Kabla ya Kukopa",
    heroSubtitle: "Know the truth before you borrow",
    heroDescription: "AI-powered farm financial intelligence for Kenyan smallholder farmers. Real weather data. Real market prices. Real risk assessment — in Swahili.",
    ctaPrimary: "Check My Loan Risk",
    ctaSecondary: "See How It Works",
    
    // Stats
    stat1: "30% of farm loans default due to poor timing",
    stat2: "1 extension worker per 1,000 farmers",
    stat3: "Ksh 2.4B lost to preventable defaults annually",
    
    // How it works
    howItWorksTitle: "How It Works",
    step1Title: "Tell us your plan",
    step1Desc: "Crop, acreage, county, what you need to borrow",
    step2Title: "We pull real data",
    step2Desc: "Rainfall forecasts, yield benchmarks, market prices",
    step3Title: "Get your honest verdict",
    step3Desc: "Best case, expected, worst case — in Swahili or English",
    
    // Features
    featuresTitle: "Built for Kenyan Farmers",
    feature1Title: "Scenario Analysis",
    feature1Desc: "See all three outcomes, not just the optimistic one",
    feature2Title: "Weather Intelligence",
    feature2Desc: "Real Open-Meteo rainfall data for your county",
    feature3Title: "Pest Detection",
    feature3Desc: "Upload a photo, we adjust your loan recommendation",
    feature4Title: "Chama Mode",
    feature4Desc: "Group loans for cooperatives and savings groups",
    feature5Title: "Speaks Swahili",
    feature5Desc: "Full Swahili language support, not just translation",
    feature6Title: "Works Offline",
    feature6Desc: "PWA that works even with poor connectivity",
    
    // Stats bar
    statsBar1: "15+ loan products",
    statsBar2: "47 counties covered",
    statsBar3: "3 scenario outcomes",
    statsBar4: "100% free for farmers",
    
    // CTA section
    ctaTitle: "Ready to borrow right?",
    ctaSubtitle: "It takes 3 minutes. No registration required.",
    ctaButton: "Start Your Assessment",
    
    // Footer
    footerTagline: "Know the truth before you borrow",
    footerLinks: ["How It Works", "For Lenders", "About"],
    footerCredit: "Built for the Kenya AI Challenge 2026 | Mercy Corps AgriFin",
    
    // Chat page
    profileTitle: "Tell us about your farm",
    profileSubtitle: "We need a few details to give you an accurate assessment",
    nameLabel: "What is your name?",
    namePlaceholder: "Enter your name",
    countyLabel: "Which county are you in?",
    countyPlaceholder: "Select your county",
    cropLabel: "What crop are you planning to grow?",
    cropPlaceholder: "Select a crop",
    acresLabel: "How many acres?",
    acresPlaceholder: "e.g., 2",
    languageLabel: "Preferred language",
    submitProfile: "Start My Assessment",
    
    // Chat interface
    chatPlaceholder: "Type your message...",
    sendButton: "Send",
    thinking: "Thinking...",
    newAssessment: "Start New Assessment",
    yourProfile: "Your Profile",
    riskLevel: "Risk Level",
    
    // Scenario cards
    bestCase: "Best Case",
    expectedCase: "Expected Case",
    worstCase: "Worst Case",
    goodRains: "Good rains",
    averageRains: "Average rains",
    poorRains: "Poor rains",
    yield: "Yield",
    revenue: "Revenue",
    bags: "bags",
    probability: "Probability",
    canRepay: "Can repay",
    cannotRepay: "Cannot repay",
  },
  sw: {
    // Landing page
    heroTitle: "Jua Ukweli Kabla ya Kukopa",
    heroSubtitle: "Fahamu ukweli kabla ya kukopa",
    heroDescription: "Akili ya fedha za kilimo inayoendeshwa na AI kwa wakulima wadogo wa Kenya. Data halisi ya hali ya hewa. Bei halisi za soko. Tathmini halisi ya hatari — kwa Kiswahili.",
    ctaPrimary: "Angalia Hatari ya Mkopo",
    ctaSecondary: "Ona Jinsi Inavyofanya Kazi",
    
    // Stats
    stat1: "30% ya mikopo ya kilimo inashindwa kulipwa kutokana na wakati mbaya",
    stat2: "Mtaalamu 1 wa kilimo kwa wakulima 1,000",
    stat3: "Ksh 2.4B inapotea kwa kushindwa kulipa kuzuiliwa kila mwaka",
    
    // How it works
    howItWorksTitle: "Jinsi Inavyofanya Kazi",
    step1Title: "Tuambie mpango wako",
    step1Desc: "Zao, ekari, kaunti, unahitaji kukopa kiasi gani",
    step2Title: "Tunapata data halisi",
    step2Desc: "Utabiri wa mvua, viwango vya mavuno, bei za soko",
    step3Title: "Pata hukumu yako ya kweli",
    step3Desc: "Hali bora, inayotarajiwa, mbaya zaidi — kwa Kiswahili au Kiingereza",
    
    // Features
    featuresTitle: "Imejengwa kwa Wakulima wa Kenya",
    feature1Title: "Uchambuzi wa Hali",
    feature1Desc: "Ona matokeo yote matatu, si ya matumaini tu",
    feature2Title: "Akili ya Hali ya Hewa",
    feature2Desc: "Data halisi ya mvua ya Open-Meteo kwa kaunti yako",
    feature3Title: "Kugundua Wadudu",
    feature3Desc: "Pakia picha, tunaboresha mapendekezo yako ya mkopo",
    feature4Title: "Hali ya Chama",
    feature4Desc: "Mikopo ya kikundi kwa vyama vya ushirika na vikundi vya akiba",
    feature5Title: "Inazungumza Kiswahili",
    feature5Desc: "Msaada kamili wa lugha ya Kiswahili, si tafsiri tu",
    feature6Title: "Inafanya Kazi Nje ya Mtandao",
    feature6Desc: "PWA inayofanya kazi hata na muunganisho mbaya",
    
    // Stats bar
    statsBar1: "15+ bidhaa za mikopo",
    statsBar2: "Kaunti 47 zimefunikwa",
    statsBar3: "Matokeo 3 ya hali",
    statsBar4: "Bure 100% kwa wakulima",
    
    // CTA section
    ctaTitle: "Tayari kukopa sawa?",
    ctaSubtitle: "Inachukua dakika 3. Hakuna usajili unaohitajika.",
    ctaButton: "Anza Tathmini Yako",
    
    // Footer
    footerTagline: "Jua ukweli kabla ya kukopa",
    footerLinks: ["Jinsi Inavyofanya Kazi", "Kwa Wakopeshaji", "Kuhusu"],
    footerCredit: "Imejengwa kwa Changamoto ya AI ya Kenya 2026 | Mercy Corps AgriFin",
    
    // Chat page
    profileTitle: "Tuambie kuhusu shamba lako",
    profileSubtitle: "Tunahitaji maelezo machache kukupa tathmini sahihi",
    nameLabel: "Jina lako ni nani?",
    namePlaceholder: "Ingiza jina lako",
    countyLabel: "Uko kaunti gani?",
    countyPlaceholder: "Chagua kaunti yako",
    cropLabel: "Unapanga kulima zao gani?",
    cropPlaceholder: "Chagua zao",
    acresLabel: "Ekari ngapi?",
    acresPlaceholder: "mfano, 2",
    languageLabel: "Lugha unayopendelea",
    submitProfile: "Anza Tathmini Yangu",
    
    // Chat interface
    chatPlaceholder: "Andika ujumbe wako...",
    sendButton: "Tuma",
    thinking: "Inafikiri...",
    newAssessment: "Anza Tathmini Mpya",
    yourProfile: "Wasifu Wako",
    riskLevel: "Kiwango cha Hatari",
    
    // Scenario cards
    bestCase: "Hali Bora",
    expectedCase: "Hali Inayotarajiwa",
    worstCase: "Hali Mbaya Zaidi",
    goodRains: "Mvua nzuri",
    averageRains: "Mvua ya wastani",
    poorRains: "Mvua kidogo",
    yield: "Mavuno",
    revenue: "Mapato",
    bags: "magunia",
    probability: "Uwezekano",
    canRepay: "Anaweza kulipa",
    cannotRepay: "Hawezi kulipa",
  }
}

export const MOCK_SCENARIO_RESULT = {
  riskLevel: 'MEDIUM' as const,
  verdict: 'This loan is manageable but carries real weather risk. A smaller loan would be safer.',
  bestCase: { yield: 24, revenue: 72000, canRepay: true, probability: 25, rainfall: 'good' as const },
  expectedCase: { yield: 18, revenue: 52000, canRepay: true, probability: 55, rainfall: 'average' as const },
  worstCase: { yield: 10, revenue: 28000, canRepay: false, probability: 20, rainfall: 'poor' as const },
  loanAmount: 45000,
  recommendedMaxLoan: 35000,
  cropType: 'Maize'
}

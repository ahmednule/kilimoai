export type Language = 'en' | 'sw' | 'ki' | 'lu'

export const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'sw', label: 'Swahili', native: 'Kiswahili' },
  { code: 'ki', label: 'Kikuyu', native: 'Gĩkũyũ' },
  { code: 'lu', label: 'Luo', native: 'Dholuo' },
]
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'
export type Rainfall = 'good' | 'average' | 'poor'
export type ChatMode = 'assessment' | 'general' | 'pest' | 'planting'

export interface CropEntry {
  crop: string
  acres: number
  isRented: boolean
  rentPerAcre?: number
}

export interface WeatherData {
  county: string
  rainfallMm: number
  periodDays: number
  season: string
  forecastLabel: string
  adequacyPct: number
}

export interface FarmerProfile {
  name: string
  county: string
  crops: CropEntry[]
  language: Language
  crop?: string
  acres?: number
  rentedAcres?: number
  rentCostPerAcre?: number
  phone?: string
  email?: string
  role?: string
  verified?: boolean
}

export interface CaseResult {
  yield: number
  revenue: number
  canRepay: boolean
  probability: number
  rainfall: Rainfall
}

export interface ScenarioResult {
  riskLevel: RiskLevel
  verdict: string
  bestCase: CaseResult
  expectedCase: CaseResult
  worstCase: CaseResult
  loanAmount: number
  recommendedMaxLoan: number
  cropType: string
}

export interface PestScanResult {
  pest: string
  confidence: number
  severity: Severity
  recommendation: string
  imageUrl?: string
  commonName?: string
  scientificName?: string
  isPest: boolean
  affectedCrops?: string[]
  treatment?: {
    chemical: string[]
    organic: string[]
    prevention: string[]
  }
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  scenarios?: ScenarioResult
  pestScan?: PestScanResult
  imageUrl?: string
}

export interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  farmerProfile: FarmerProfile | null
  currentRisk: RiskLevel
  language: Language
}

export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'REJECTED'

export interface ChamaGroup {
  id: string
  name: string
  county: string
  description: string
  registrationFee: number
  memberCount: number
  totalSavings: number
  createdAt: string
}

export interface ChamaMember {
  id: string
  userId: string
  userName?: string
  chamaId: string
  chamaName: string
  status: MembershipStatus
  totalContributed: number
  joinedAt: string
}

export interface ChamaContribution {
  id: string
  chamaId: string
  amount: number
  date: string
  method: 'MPESA' | 'CASH'
  mpesaRef?: string
}

export interface LoanApplication {
  id: string
  farmerId: string
  farmerName: string
  county: string
  crop: string
  acres: number
  loanAmount: number
  riskLevel: RiskLevel
  riskScore: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COUNTERED'
  appliedAt: string
}

export interface FarmerRiskProfile {
  id: string
  name: string
  county: string
  crop: string
  acres: number
  isRented: boolean
  riskLevel: RiskLevel
  riskScore: number
  scenarioResult: ScenarioResult
  assessedAt: string
  creditHistory: boolean
  hasCollateral: boolean
  chamaMembership: boolean
  phoneNumber: string
  email: string
}

export interface ActiveLoan {
  id: string
  farmerId: string
  farmerName: string
  county: string
  crop: string
  amount: number
  interestRate: number
  duration: number
  disbursedAt: string
  remainingBalance: number
  totalPaid: number
  nextPaymentDue: string
  nextPaymentAmount: number
  status: 'ACTIVE' | 'PAID_OFF' | 'DEFAULTED'
}

export interface PaymentRecord {
  id: string
  date: string
  amount: number
  method: 'MPESA' | 'BANK'
  mpesaRef?: string
}

export type ListingVerificationStatus = 'pending_verification' | 'verified' | 'rejected' | 'sold'

export interface MarketListing {
  id: string
  farmerId: string
  farmerName: string
  crop: string
  quantity: number
  unit: string
  pricePerUnit: number
  county: string
  quality: string
  verificationStatus: ListingVerificationStatus
  status: string
  date: string
  available: string
  agentNotes?: string
}

export interface ListingOrder {
  id: string
  listingId: string
  buyerId: string
  buyerName: string
  seller: string
  crop: string
  quantity: number
  price: number
  total: number
  county: string
  status: string
  date: string
}

export interface VisitSchedule {
  id: string
  agentId: string
  farmerId: string
  farmerName: string
  county: string
  crop: string
  date: string
  time: string
  notes: string
  status: 'pending' | 'confirmed' | 'completed'
  createdAt: string
  farmerPhone?: string
  farmerEmail?: string
}

export interface Notification {
  id: string
  userId: string
  type: 'schedule_visit' | 'verification' | 'loan_update'
  title: string
  body: string
  read: boolean
  createdAt: string
}

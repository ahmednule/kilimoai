export type Language = 'en' | 'sw'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'
export type Rainfall = 'good' | 'average' | 'poor'
export type ChatMode = 'assessment' | 'general'

export interface CropEntry {
  crop: string
  acres: number
  isRented: boolean
}

export interface FarmerProfile {
  name: string
  county: string
  crops: CropEntry[]
  language: Language
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

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  scenarios?: ScenarioResult
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
  farmAcres?: number
  totalBorrowed?: number
  totalRepaid?: number
  activeLoansCount?: number
  hasDefaulted?: boolean
  chamaName?: string | null
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

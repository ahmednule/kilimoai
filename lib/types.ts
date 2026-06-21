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

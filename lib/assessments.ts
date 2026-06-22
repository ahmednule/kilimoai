export interface StoredAssessment {
  id: string
  farmerEmail: string
  farmerName: string
  county: string
  crop: string
  acres: number
  riskLevel: string
  verdict: string
  scenarios: {
    bestCase: { yield: number; revenue: number; canRepay: boolean; probability: number }
    expectedCase: { yield: number; revenue: number; canRepay: boolean; probability: number }
    worstCase: { yield: number; revenue: number; canRepay: boolean; probability: number }
    loanAmount: number
    recommendedMaxLoan: number
  }
  status: 'pending' | 'approved' | 'declined'
  agentNotes?: string
  adjustedLoan?: number
  createdAt: string
}

const ASSESSMENTS_KEY = 'kilimo-assessments'

export function getAssessments(): StoredAssessment[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(ASSESSMENTS_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function saveAssessment(assessment: StoredAssessment): void {
  if (typeof window === 'undefined') return
  const all = getAssessments()
  const idx = all.findIndex(a => a.id === assessment.id)
  if (idx >= 0) {
    all[idx] = assessment
  } else {
    all.unshift(assessment)
  }
  localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(all))
}

export function updateAssessmentStatus(
  id: string,
  status: 'approved' | 'declined',
  notes?: string,
  adjustedLoan?: number
): void {
  if (typeof window === 'undefined') return
  const all = getAssessments()
  const a = all.find(a => a.id === id)
  if (a) {
    a.status = status
    if (notes !== undefined) a.agentNotes = notes
    if (adjustedLoan !== undefined) a.adjustedLoan = adjustedLoan
    localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(all))
  }
}

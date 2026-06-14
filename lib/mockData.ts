export interface LoanProduct {
  id: string
  name: string
  provider: string
  minAmount: number
  maxAmount: number
  interestRate: number
  tenureMonths: number
  eligibility: string
  description: string
  category: 'input' | 'equipment' | 'working' | 'seasonal'
}

export interface LoanApplication {
  id: string
  farmerName: string
  farmerId: string
  productId: string
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'disbursed'
  date: string
  county: string
  crop: string
  acres: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface Payment {
  id: string
  loanId: string
  farmerId: string
  amount: number
  dueDate: string
  paidDate: string | null
  status: 'pending' | 'paid' | 'overdue'
  method: 'mpesa' | 'bank' | 'airtel' | null
}

export interface RepaymentScheduleItem {
  month: number
  dueDate: string
  principal: number
  interest: number
  total: number
  remaining: number
  status: 'paid' | 'pending' | 'overdue'
}

export interface FarmerData {
  id: string
  name: string
  county: string
  acres: number
  crops: string[]
  joinDate: string
  creditScore: number
  totalBorrowed: number
  totalRepaid: number
  activeLoans: number
  defaulted: boolean
  assessments: number
}

export interface MarketListing {
  id: string
  crop: string
  quantity: number
  unit: string
  pricePerUnit: number
  seller: string
  county: string
  date: string
  status: 'active' | 'sold'
}

export interface AssessmentRecord {
  id: string
  farmerId: string
  date: string
  crop: string
  acres: number
  loanAmount: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  expectedYield: number
  expectedRevenue: number
  rainfall: 'good' | 'average' | 'poor'
}

export interface ChamaGroup {
  id: string
  name: string
  county: string
  members: number
  totalSavings: number
  activeLoans: number
  repaymentRate: number
}

export interface DiseaseInfo {
  id: string
  name: string
  crop: string
  symptoms: string
  treatment: string
  severity: 'low' | 'moderate' | 'high'
  imageUrl: string
}

export interface Testimonial {
  id: string
  name: string
  county: string
  role: string
  text: string
  avatar: string
  rating: number
}

export interface AgentRecord {
  id: string
  name: string
  county: string
  farmers: number
  assessments: number
  loansFacilitated: number
  commission: number
  joinDate: string
}

export interface ImpactMetric {
  label: string
  value: number
  prefix?: string
  suffix?: string
  change: number
}

export const LOAN_PRODUCTS: LoanProduct[] = [
  { id: 'lp1', name: 'Kilimo Input Loan', provider: 'Equity Bank', minAmount: 5000, maxAmount: 50000, interestRate: 8, tenureMonths: 6, eligibility: 'Active farmer with at least 1 acre', description: 'Short-term loan for seeds, fertilizer, and pesticides.', category: 'input' },
  { id: 'lp2', name: 'Farm Equipment Lease', provider: 'Co-op Bank', minAmount: 20000, maxAmount: 200000, interestRate: 10, tenureMonths: 12, eligibility: '2+ years farming history', description: 'Lease tractors, irrigation systems, and other equipment.', category: 'equipment' },
  { id: 'lp3', name: 'Seasonal Advance', provider: 'KCB', minAmount: 10000, maxAmount: 100000, interestRate: 9, tenureMonths: 9, eligibility: 'Verified farm records', description: 'Working capital for the full growing season.', category: 'seasonal' },
  { id: 'lp4', name: 'Smallholder Micro-Loan', provider: 'Family Bank', minAmount: 2000, maxAmount: 15000, interestRate: 5, tenureMonths: 3, eligibility: 'Any registered smallholder', description: 'Quick micro-loan for immediate farm needs.', category: 'working' },
  { id: 'lp5', name: 'Harvest Advance', provider: 'Absa', minAmount: 15000, maxAmount: 80000, interestRate: 7, tenureMonths: 4, eligibility: 'Established crop yield history', description: 'Bridge financing between harvest and sale.', category: 'working' },
  { id: 'lp6', name: 'Irrigation Upgrade', provider: 'Co-op Bank', minAmount: 30000, maxAmount: 150000, interestRate: 11, tenureMonths: 18, eligibility: 'Land ownership or long-term lease', description: 'Capital for irrigation system installation and upgrades.', category: 'equipment' },
  { id: 'lp7', name: 'Group Chama Loan', provider: 'Equity Bank', minAmount: 50000, maxAmount: 500000, interestRate: 6, tenureMonths: 12, eligibility: 'Registered chama/savings group, 10+ members', description: 'Group-guaranteed loan for cooperative farming.', category: 'working' },
  { id: 'lp8', name: 'Youth Agri-Fund', provider: 'KCB', minAmount: 5000, maxAmount: 35000, interestRate: 4, tenureMonths: 6, eligibility: 'Farmer under 35, first-time borrower', description: 'Subsidized loans for young farmers entering agriculture.', category: 'input' },
]

export const MOCK_APPLICATIONS: LoanApplication[] = [
  { id: 'app1', farmerName: 'Jane Muthoni', farmerId: 'f1', productId: 'lp1', amount: 30000, status: 'pending', date: '2026-05-15', county: 'Kiambu', crop: 'Maize', acres: 3, riskLevel: 'LOW' },
  { id: 'app2', farmerName: 'John Ochieng', farmerId: 'f2', productId: 'lp3', amount: 50000, status: 'approved', date: '2026-05-10', county: 'Kisumu', crop: 'Rice', acres: 5, riskLevel: 'MEDIUM' },
  { id: 'app3', farmerName: 'Mary Wanjiku', farmerId: 'f3', productId: 'lp2', amount: 80000, status: 'pending', date: '2026-05-18', county: 'Nyeri', crop: 'Coffee', acres: 4, riskLevel: 'LOW' },
  { id: 'app4', farmerName: 'David Kiprop', farmerId: 'f4', productId: 'lp4', amount: 10000, status: 'rejected', date: '2026-05-08', county: 'Uasin Gishu', crop: 'Wheat', acres: 2, riskLevel: 'HIGH' },
  { id: 'app5', farmerName: 'Sarah Chebet', farmerId: 'f5', productId: 'lp5', amount: 40000, status: 'disbursed', date: '2026-04-20', county: 'Nandi', crop: 'Tea', acres: 3, riskLevel: 'LOW' },
  { id: 'app6', farmerName: 'Peter Mwangi', farmerId: 'f6', productId: 'lp1', amount: 25000, status: 'pending', date: '2026-05-20', county: 'Murang\'a', crop: 'Maize', acres: 2, riskLevel: 'MEDIUM' },
]

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'pay1', loanId: 'loan1', farmerId: 'f1', amount: 5000, dueDate: '2026-06-01', paidDate: null, status: 'pending', method: null },
  { id: 'pay2', loanId: 'loan1', farmerId: 'f1', amount: 5000, dueDate: '2026-05-01', paidDate: '2026-04-28', status: 'paid', method: 'mpesa' },
  { id: 'pay3', loanId: 'loan2', farmerId: 'f2', amount: 8000, dueDate: '2026-05-15', paidDate: null, status: 'overdue', method: null },
  { id: 'pay4', loanId: 'loan2', farmerId: 'f2', amount: 8000, dueDate: '2026-04-15', paidDate: '2026-04-10', status: 'paid', method: 'bank' },
]

export const MOCK_FARMERS: FarmerData[] = [
  { id: 'f1', name: 'Jane Muthoni', county: 'Kiambu', acres: 3, crops: ['Maize', 'Beans'], joinDate: '2025-03-10', creditScore: 82, totalBorrowed: 45000, totalRepaid: 30000, activeLoans: 1, defaulted: false, assessments: 3 },
  { id: 'f2', name: 'John Ochieng', county: 'Kisumu', acres: 5, crops: ['Rice'], joinDate: '2025-06-15', creditScore: 65, totalBorrowed: 80000, totalRepaid: 40000, activeLoans: 1, defaulted: false, assessments: 2 },
  { id: 'f3', name: 'Mary Wanjiku', county: 'Nyeri', acres: 4, crops: ['Coffee', 'Tea'], joinDate: '2025-01-20', creditScore: 91, totalBorrowed: 120000, totalRepaid: 120000, activeLoans: 0, defaulted: false, assessments: 5 },
  { id: 'f4', name: 'David Kiprop', county: 'Uasin Gishu', acres: 2, crops: ['Wheat'], joinDate: '2025-09-05', creditScore: 35, totalBorrowed: 20000, totalRepaid: 5000, activeLoans: 1, defaulted: true, assessments: 1 },
  { id: 'f5', name: 'Sarah Chebet', county: 'Nandi', acres: 3, crops: ['Tea'], joinDate: '2025-04-12', creditScore: 78, totalBorrowed: 60000, totalRepaid: 60000, activeLoans: 0, defaulted: false, assessments: 4 },
  { id: 'f6', name: 'Peter Mwangi', county: 'Murang\'a', acres: 2, crops: ['Maize', 'Tomatoes'], joinDate: '2025-11-01', creditScore: 55, totalBorrowed: 25000, totalRepaid: 15000, activeLoans: 1, defaulted: false, assessments: 2 },
  { id: 'f7', name: 'Grace Akinyi', county: 'Homa Bay', acres: 4, crops: ['Sorghum', 'Beans'], joinDate: '2026-01-08', creditScore: 72, totalBorrowed: 35000, totalRepaid: 35000, activeLoans: 0, defaulted: false, assessments: 2 },
  { id: 'f8', name: 'James Kibet', county: 'Elgeyo-Marakwet', acres: 6, crops: ['Potatoes'], joinDate: '2025-07-22', creditScore: 88, totalBorrowed: 95000, totalRepaid: 95000, activeLoans: 0, defaulted: false, assessments: 3 },
]

export const MOCK_MARKET_LISTINGS: MarketListing[] = [
  { id: 'm1', crop: 'Maize', quantity: 50, unit: 'bags', pricePerUnit: 3500, seller: 'Jane Muthoni', county: 'Kiambu', date: '2026-05-20', status: 'active' },
  { id: 'm2', crop: 'Beans', quantity: 20, unit: 'bags', pricePerUnit: 8500, seller: 'Mary Wanjiku', county: 'Nyeri', date: '2026-05-18', status: 'active' },
  { id: 'm3', crop: 'Rice', quantity: 30, unit: 'bags', pricePerUnit: 6500, seller: 'John Ochieng', county: 'Kisumu', date: '2026-05-15', status: 'sold' },
  { id: 'm4', crop: 'Tea', quantity: 100, unit: 'kg', pricePerUnit: 280, seller: 'Sarah Chebet', county: 'Nandi', date: '2026-05-22', status: 'active' },
  { id: 'm5', crop: 'Potatoes', quantity: 40, unit: 'bags', pricePerUnit: 2800, seller: 'James Kibet', county: 'Elgeyo-Marakwet', date: '2026-05-19', status: 'active' },
  { id: 'm6', crop: 'Tomatoes', quantity: 15, unit: 'crates', pricePerUnit: 4500, seller: 'Peter Mwangi', county: 'Murang\'a', date: '2026-05-21', status: 'active' },
]

export const MOCK_ASSESSMENTS: AssessmentRecord[] = [
  { id: 'a1', farmerId: 'f1', date: '2026-05-10', crop: 'Maize', acres: 3, loanAmount: 30000, riskLevel: 'LOW', expectedYield: 24, expectedRevenue: 72000, rainfall: 'good' },
  { id: 'a2', farmerId: 'f2', date: '2026-05-05', crop: 'Rice', acres: 5, loanAmount: 50000, riskLevel: 'MEDIUM', expectedYield: 40, expectedRevenue: 120000, rainfall: 'average' },
  { id: 'a3', farmerId: 'f3', date: '2026-04-28', crop: 'Coffee', acres: 4, loanAmount: 80000, riskLevel: 'LOW', expectedYield: 32, expectedRevenue: 160000, rainfall: 'good' },
  { id: 'a4', farmerId: 'f4', date: '2026-05-01', crop: 'Wheat', acres: 2, loanAmount: 20000, riskLevel: 'HIGH', expectedYield: 8, expectedRevenue: 24000, rainfall: 'poor' },
  { id: 'a5', farmerId: 'f5', date: '2026-04-15', crop: 'Tea', acres: 3, loanAmount: 40000, riskLevel: 'LOW', expectedYield: 4500, expectedRevenue: 135000, rainfall: 'good' },
]

export const MOCK_CHAMA_GROUPS: ChamaGroup[] = [
  { id: 'c1', name: 'Mwiki Farmers', county: 'Kiambu', members: 15, totalSavings: 450000, activeLoans: 3, repaymentRate: 94 },
  { id: 'c2', name: 'Umoja Women Group', county: 'Kisumu', members: 20, totalSavings: 320000, activeLoans: 2, repaymentRate: 88 },
  { id: 'c3', name: 'Nyeri Coffee Co-op', county: 'Nyeri', members: 25, totalSavings: 750000, activeLoans: 4, repaymentRate: 96 },
]

export const MOCK_DISEASES: DiseaseInfo[] = [
  { id: 'd1', name: 'Maize Lethal Necrosis', crop: 'Maize', symptoms: 'Yellowing leaves, stunted growth, dead heart', treatment: 'Remove infected plants. Apply MLN-resistant varieties. Control insect vectors.', severity: 'high', imageUrl: '' },
  { id: 'd2', name: 'Coffee Leaf Rust', crop: 'Coffee', symptoms: 'Orange powdery spots on leaf undersides', treatment: 'Apply copper-based fungicides. Improve air circulation. Use resistant varieties.', severity: 'moderate', imageUrl: '' },
  { id: 'd3', name: 'Tomato Blight', crop: 'Tomatoes', symptoms: 'Dark spots on leaves and stems, fruit rot', treatment: 'Apply fungicide spray. Remove affected leaves. Improve drainage.', severity: 'high', imageUrl: '' },
  { id: 'd4', name: 'Bean Anthracnose', crop: 'Beans', symptoms: 'Dark sunken lesions on pods and leaves', treatment: 'Use certified disease-free seeds. Rotate crops. Apply fungicide early.', severity: 'moderate', imageUrl: '' },
]

export const MOCK_TESTIMONIALS: Testimonial[] = [
  { id: 't1', name: 'Jane Muthoni', county: 'Kiambu', role: 'Maize Farmer', text: 'Kilimo AI helped me understand the real risk before I took a loan. I avoided borrowing too much and now my farm is thriving.', avatar: '', rating: 5 },
  { id: 't2', name: 'John Ochieng', county: 'Kisumu', role: 'Rice Farmer', text: 'The weather data is very accurate. I planted at the right time and got my best harvest ever.', avatar: '', rating: 4 },
  { id: 't3', name: 'Mary Wanjiku', county: 'Nyeri', role: 'Coffee & Tea Farmer', text: 'The Swahili support is fantastic. Finally a platform that speaks our language and understands our farming.', avatar: '', rating: 5 },
  { id: 't4', name: 'David Kiprop', county: 'Uasin Gishu', role: 'Wheat Farmer', text: 'Even when the assessment said I was high risk, the recommendations helped me plan better for next season.', avatar: '', rating: 4 },
]

export const MOCK_AGENTS: AgentRecord[] = [
  { id: 'ag1', name: 'Peter Kamau', county: 'Murang\'a', farmers: 45, assessments: 120, loansFacilitated: 28, commission: 14500, joinDate: '2025-02-01' },
  { id: 'ag2', name: 'Alice Wambui', county: 'Kiambu', farmers: 32, assessments: 85, loansFacilitated: 19, commission: 9800, joinDate: '2025-05-15' },
  { id: 'ag3', name: 'Joseph Otieno', county: 'Kisumu', farmers: 28, assessments: 72, loansFacilitated: 15, commission: 7600, joinDate: '2025-08-10' },
]

export const MOCK_IMPACT_METRICS: ImpactMetric[] = [
  { label: 'Farmers Reached', value: 12500, suffix: '+', change: 23 },
  { label: 'Loans Disbursed', value: 280, prefix: 'Ksh', suffix: 'M', change: 35 },
  { label: 'Default Rate Reduction', value: 42, suffix: '%', change: -8 },
  { label: 'Counties Covered', value: 47, change: 12 },
  { label: 'Agent Network', value: 350, suffix: '+', change: 18 },
  { label: 'Crop Diseases Detected', value: 8500, suffix: '+', change: 45 },
]

export const MOCK_REPAYMENT_SCHEDULES: Record<string, RepaymentScheduleItem[]> = {
  'loan1': [
    { month: 1, dueDate: '2026-06-01', principal: 4500, interest: 500, total: 5000, remaining: 30000, status: 'pending' },
    { month: 2, dueDate: '2026-07-01', principal: 4550, interest: 450, total: 5000, remaining: 25000, status: 'pending' },
    { month: 3, dueDate: '2026-08-01', principal: 4600, interest: 400, total: 5000, remaining: 20000, status: 'pending' },
    { month: 4, dueDate: '2026-09-01', principal: 4650, interest: 350, total: 5000, remaining: 15000, status: 'pending' },
    { month: 5, dueDate: '2026-10-01', principal: 4700, interest: 300, total: 5000, remaining: 10000, status: 'pending' },
    { month: 6, dueDate: '2026-11-01', principal: 4750, interest: 250, total: 5000, remaining: 5000, status: 'pending' },
    { month: 7, dueDate: '2026-12-01', principal: 5000, interest: 0, total: 5000, remaining: 0, status: 'pending' },
  ],
}

export const MARKET_PRICES = [
  { crop: 'Maize', currentPrice: 3500, change: 5.2, unit: 'bag' },
  { crop: 'Beans', currentPrice: 8500, change: -2.1, unit: 'bag' },
  { crop: 'Rice', currentPrice: 6500, change: 3.8, unit: 'bag' },
  { crop: 'Wheat', currentPrice: 4200, change: 1.5, unit: 'bag' },
  { crop: 'Coffee', currentPrice: 520, change: 8.3, unit: 'kg' },
  { crop: 'Tea', currentPrice: 280, change: -0.5, unit: 'kg' },
  { crop: 'Potatoes', currentPrice: 2800, change: 4.7, unit: 'bag' },
  { crop: 'Tomatoes', currentPrice: 4500, change: -3.2, unit: 'crate' },
]
// ============================================================
// Seed users (5 roles)
// ============================================================
CREATE (:User {
  id: 'u-farmer',
  name: 'Jane Muthoni',
  email: 'farmer@kilimo.com',
  password: 'farmer123',
  role: 'farmer',
  county: 'Kiambu',
  createdAt: datetime()
});

CREATE (:User {
  id: 'u-agent',
  name: 'Peter Kamau',
  email: 'agent@kilimo.com',
  password: 'agent123',
  role: 'agent',
  county: "Murang'a",
  createdAt: datetime()
});

CREATE (:User {
  id: 'u-lender',
  name: 'Equity Bank',
  email: 'lender@kilimo.com',
  password: 'lender123',
  role: 'lender',
  county: 'Nairobi',
  createdAt: datetime()
});

CREATE (:User {
  id: 'u-buyer',
  name: 'Twiga Foods',
  email: 'buyer@kilimo.com',
  password: 'buyer123',
  role: 'buyer',
  county: 'Nairobi',
  createdAt: datetime()
});

CREATE (:User {
  id: 'u-admin',
  name: 'Admin User',
  email: 'admin@kilimo.com',
  password: 'admin123',
  role: 'admin',
  county: 'Nairobi',
  createdAt: datetime()
});

// ============================================================
// Seed farmer profiles
// ============================================================
CREATE (:FarmerProfile {
  id: 'fp-1',
  name: 'Jane Muthoni',
  county: 'Kiambu',
  acres: 3,
  crop: 'Maize',
  language: 'en',
  creditScore: 82,
  totalBorrowed: 45000,
  totalRepaid: 30000,
  activeLoans: 1,
  defaulted: false,
  assessments: 3,
  joinDate: '2025-03-10'
});

CREATE (:FarmerProfile {
  id: 'fp-2',
  name: 'John Ochieng',
  county: 'Kisumu',
  acres: 5,
  crop: 'Rice',
  language: 'en',
  creditScore: 65,
  totalBorrowed: 80000,
  totalRepaid: 40000,
  activeLoans: 1,
  defaulted: false,
  assessments: 2,
  joinDate: '2025-06-15'
});

CREATE (:FarmerProfile {
  id: 'fp-3',
  name: 'Mary Wanjiku',
  county: 'Nyeri',
  acres: 4,
  crop: 'Coffee',
  language: 'en',
  creditScore: 91,
  totalBorrowed: 120000,
  totalRepaid: 120000,
  activeLoans: 0,
  defaulted: false,
  assessments: 5,
  joinDate: '2025-01-20'
});

CREATE (:FarmerProfile {
  id: 'fp-4',
  name: 'David Kiprop',
  county: 'Uasin Gishu',
  acres: 2,
  crop: 'Wheat',
  language: 'en',
  creditScore: 35,
  totalBorrowed: 20000,
  totalRepaid: 5000,
  activeLoans: 1,
  defaulted: true,
  assessments: 1,
  joinDate: '2025-09-05'
});

CREATE (:FarmerProfile {
  id: 'fp-5',
  name: 'Sarah Chebet',
  county: 'Nandi',
  acres: 3,
  crop: 'Tea',
  language: 'en',
  creditScore: 78,
  totalBorrowed: 60000,
  totalRepaid: 60000,
  activeLoans: 0,
  defaulted: false,
  assessments: 4,
  joinDate: '2025-04-12'
});

CREATE (:FarmerProfile {
  id: 'fp-6',
  name: 'Peter Mwangi',
  county: "Murang'a",
  acres: 2,
  crop: 'Maize',
  language: 'en',
  creditScore: 55,
  totalBorrowed: 25000,
  totalRepaid: 15000,
  activeLoans: 1,
  defaulted: false,
  assessments: 2,
  joinDate: '2025-11-01'
});

CREATE (:FarmerProfile {
  id: 'fp-7',
  name: 'Grace Akinyi',
  county: 'Homa Bay',
  acres: 4,
  crop: 'Sorghum',
  language: 'en',
  creditScore: 72,
  totalBorrowed: 35000,
  totalRepaid: 35000,
  activeLoans: 0,
  defaulted: false,
  assessments: 2,
  joinDate: '2026-01-08'
});

CREATE (:FarmerProfile {
  id: 'fp-8',
  name: 'James Kibet',
  county: 'Elgeyo-Marakwet',
  acres: 6,
  crop: 'Potatoes',
  language: 'en',
  creditScore: 88,
  totalBorrowed: 95000,
  totalRepaid: 95000,
  activeLoans: 0,
  defaulted: false,
  assessments: 3,
  joinDate: '2025-07-22'
});

// ============================================================
// Seed loan products
// ============================================================
CREATE (:LoanProduct {
  id: 'lp-1',
  name: 'Kilimo Input Loan',
  provider: 'Equity Bank',
  minAmount: 5000,
  maxAmount: 50000,
  interestRate: 8,
  tenureMonths: 6,
  eligibility: 'Active farmer with at least 1 acre',
  description: 'Short-term loan for seeds, fertilizer, and pesticides.',
  category: 'input'
});

CREATE (:LoanProduct {
  id: 'lp-2',
  name: 'Farm Equipment Lease',
  provider: 'Co-op Bank',
  minAmount: 20000,
  maxAmount: 200000,
  interestRate: 10,
  tenureMonths: 12,
  eligibility: '2+ years farming history',
  description: 'Lease tractors, irrigation systems, and other equipment.',
  category: 'equipment'
});

CREATE (:LoanProduct {
  id: 'lp-3',
  name: 'Seasonal Advance',
  provider: 'KCB',
  minAmount: 10000,
  maxAmount: 100000,
  interestRate: 9,
  tenureMonths: 9,
  eligibility: 'Verified farm records',
  description: 'Working capital for the full growing season.',
  category: 'seasonal'
});

CREATE (:LoanProduct {
  id: 'lp-4',
  name: 'Smallholder Micro-Loan',
  provider: 'Family Bank',
  minAmount: 2000,
  maxAmount: 15000,
  interestRate: 5,
  tenureMonths: 3,
  eligibility: 'Any registered smallholder',
  description: 'Quick micro-loan for immediate farm needs.',
  category: 'working'
});

CREATE (:LoanProduct {
  id: 'lp-5',
  name: 'Harvest Advance',
  provider: 'Absa',
  minAmount: 15000,
  maxAmount: 80000,
  interestRate: 7,
  tenureMonths: 4,
  eligibility: 'Established crop yield history',
  description: 'Bridge financing between harvest and sale.',
  category: 'working'
});

CREATE (:LoanProduct {
  id: 'lp-6',
  name: 'Irrigation Upgrade',
  provider: 'Co-op Bank',
  minAmount: 30000,
  maxAmount: 150000,
  interestRate: 11,
  tenureMonths: 18,
  eligibility: 'Land ownership or long-term lease',
  description: 'Capital for irrigation system installation and upgrades.',
  category: 'equipment'
});

CREATE (:LoanProduct {
  id: 'lp-7',
  name: 'Group Chama Loan',
  provider: 'Equity Bank',
  minAmount: 50000,
  maxAmount: 500000,
  interestRate: 6,
  tenureMonths: 12,
  eligibility: 'Registered chama/savings group, 10+ members',
  description: 'Group-guaranteed loan for cooperative farming.',
  category: 'working'
});

CREATE (:LoanProduct {
  id: 'lp-8',
  name: 'Youth Agri-Fund',
  provider: 'KCB',
  minAmount: 5000,
  maxAmount: 35000,
  interestRate: 4,
  tenureMonths: 6,
  eligibility: 'Farmer under 35, first-time borrower',
  description: 'Subsidized loans for young farmers entering agriculture.',
  category: 'input'
});

// ============================================================
// Seed chama groups
// ============================================================
CREATE (:ChamaGroup {
  id: 'ch-1',
  name: 'Mwiki Farmers',
  county: 'Kiambu',
  description: 'Mwiki community farming group focused on maize and vegetables.',
  registrationFee: 500,
  memberCount: 15,
  totalSavings: 450000,
  activeLoans: 3,
  repaymentRate: 94,
  createdAt: datetime()
});

CREATE (:ChamaGroup {
  id: 'ch-2',
  name: 'Umoja Women Group',
  county: 'Kisumu',
  description: 'Women-led farming cooperative in Kisumu county.',
  registrationFee: 300,
  memberCount: 20,
  totalSavings: 320000,
  activeLoans: 2,
  repaymentRate: 88,
  createdAt: datetime()
});

CREATE (:ChamaGroup {
  id: 'ch-3',
  name: 'Nyeri Coffee Co-op',
  county: 'Nyeri',
  description: 'Coffee farming cooperative in the highlands of Nyeri.',
  registrationFee: 1000,
  memberCount: 25,
  totalSavings: 750000,
  activeLoans: 4,
  repaymentRate: 96,
  createdAt: datetime()
});

CREATE (:ChamaGroup {
  id: 'ch-4',
  name: 'Mercy Corps Sustainable Agriculture Group',
  county: 'Meru',
  description: 'Official chama for tracking your farming journey. Access fair loans, group savings, and market linkages.',
  registrationFee: 0,
  memberCount: 1,
  totalSavings: 0,
  activeLoans: 0,
  repaymentRate: 0.94,
  createdAt: datetime()
});

// ============================================================
// Seed assessments
// ============================================================
CREATE (:Assessment {
  id: 'as-1',
  farmerId: 'fp-1',
  date: '2026-05-10',
  crop: 'Maize',
  acres: 3,
  loanAmount: 30000,
  riskLevel: 'LOW',
  expectedYield: 24,
  expectedRevenue: 72000,
  rainfall: 'good'
});

CREATE (:Assessment {
  id: 'as-2',
  farmerId: 'fp-2',
  date: '2026-05-05',
  crop: 'Rice',
  acres: 5,
  loanAmount: 50000,
  riskLevel: 'MEDIUM',
  expectedYield: 40,
  expectedRevenue: 120000,
  rainfall: 'average'
});

CREATE (:Assessment {
  id: 'as-3',
  farmerId: 'fp-3',
  date: '2026-04-28',
  crop: 'Coffee',
  acres: 4,
  loanAmount: 80000,
  riskLevel: 'LOW',
  expectedYield: 32,
  expectedRevenue: 160000,
  rainfall: 'good'
});

CREATE (:Assessment {
  id: 'as-4',
  farmerId: 'fp-4',
  date: '2026-05-01',
  crop: 'Wheat',
  acres: 2,
  loanAmount: 20000,
  riskLevel: 'HIGH',
  expectedYield: 8,
  expectedRevenue: 24000,
  rainfall: 'poor'
});

CREATE (:Assessment {
  id: 'as-5',
  farmerId: 'fp-5',
  date: '2026-04-15',
  crop: 'Tea',
  acres: 3,
  loanAmount: 40000,
  riskLevel: 'LOW',
  expectedYield: 4500,
  expectedRevenue: 135000,
  rainfall: 'good'
});

// ============================================================
// Seed loan applications
// ============================================================
CREATE (:LoanApplication {
  id: 'la-1',
  farmerId: 'fp-1',
  farmerName: 'Jane Muthoni',
  productId: 'lp-1',
  amount: 30000,
  status: 'pending',
  date: '2026-05-15',
  county: 'Kiambu',
  crop: 'Maize',
  acres: 3,
  riskLevel: 'LOW'
});

CREATE (:LoanApplication {
  id: 'la-2',
  farmerId: 'fp-2',
  farmerName: 'John Ochieng',
  productId: 'lp-3',
  amount: 50000,
  status: 'approved',
  date: '2026-05-10',
  county: 'Kisumu',
  crop: 'Rice',
  acres: 5,
  riskLevel: 'MEDIUM'
});

CREATE (:LoanApplication {
  id: 'la-3',
  farmerId: 'fp-3',
  farmerName: 'Mary Wanjiku',
  productId: 'lp-2',
  amount: 80000,
  status: 'pending',
  date: '2026-05-18',
  county: 'Nyeri',
  crop: 'Coffee',
  acres: 4,
  riskLevel: 'LOW'
});

CREATE (:LoanApplication {
  id: 'la-4',
  farmerId: 'fp-4',
  farmerName: 'David Kiprop',
  productId: 'lp-4',
  amount: 10000,
  status: 'rejected',
  date: '2026-05-08',
  county: 'Uasin Gishu',
  crop: 'Wheat',
  acres: 2,
  riskLevel: 'HIGH'
});

CREATE (:LoanApplication {
  id: 'la-5',
  farmerId: 'fp-5',
  farmerName: 'Sarah Chebet',
  productId: 'lp-5',
  amount: 40000,
  status: 'disbursed',
  date: '2026-04-20',
  county: 'Nandi',
  crop: 'Tea',
  acres: 3,
  riskLevel: 'LOW'
});

CREATE (:LoanApplication {
  id: 'la-6',
  farmerId: 'fp-6',
  farmerName: 'Peter Mwangi',
  productId: 'lp-1',
  amount: 25000,
  status: 'pending',
  date: '2026-05-20',
  county: "Murang'a",
  crop: 'Maize',
  acres: 2,
  riskLevel: 'MEDIUM'
});

// ============================================================
// Seed market listings
// ============================================================
CREATE (:MarketListing {
  id: 'ml-1',
  crop: 'Maize',
  quantity: 50,
  unit: 'bags',
  pricePerUnit: 3500,
  seller: 'Jane Muthoni',
  farmerName: 'Jane Muthoni',
  farmerId: 'u-farmer-1',
  county: 'Kiambu',
  date: '2026-05-20',
  status: 'active',
  quality: 'Grade 1',
  available: 'Jun 2026',
  verificationStatus: 'verified'
});

CREATE (:MarketListing {
  id: 'ml-2',
  crop: 'Beans',
  quantity: 20,
  unit: 'bags',
  pricePerUnit: 8500,
  seller: 'Mary Wanjiku',
  farmerName: 'Mary Wanjiku',
  farmerId: 'u-farmer-2',
  county: 'Nyeri',
  date: '2026-05-18',
  status: 'active',
  quality: 'Premium',
  available: 'Jun 2026',
  verificationStatus: 'verified'
});

CREATE (:MarketListing {
  id: 'ml-3',
  crop: 'Rice',
  quantity: 30,
  unit: 'bags',
  pricePerUnit: 6500,
  seller: 'John Ochieng',
  farmerName: 'John Ochieng',
  farmerId: 'u-farmer-3',
  county: 'Kisumu',
  date: '2026-05-15',
  status: 'sold',
  quality: 'Grade 2',
  available: 'May 2026',
  verificationStatus: 'sold'
});

CREATE (:MarketListing {
  id: 'ml-4',
  crop: 'Tea',
  quantity: 100,
  unit: 'kg',
  pricePerUnit: 280,
  seller: 'Sarah Chebet',
  farmerName: 'Sarah Chebet',
  farmerId: 'u-farmer-4',
  county: 'Nandi',
  date: '2026-05-22',
  status: 'active',
  quality: 'Premium',
  available: 'Jun 2026',
  verificationStatus: 'verified'
});

CREATE (:MarketListing {
  id: 'ml-5',
  crop: 'Potatoes',
  quantity: 40,
  unit: 'bags',
  pricePerUnit: 2800,
  seller: 'James Kibet',
  farmerName: 'James Kibet',
  farmerId: 'u-farmer-5',
  county: 'Elgeyo-Marakwet',
  date: '2026-05-19',
  status: 'active',
  quality: 'Grade 1',
  available: 'Jul 2026',
  verificationStatus: 'verified'
});

CREATE (:MarketListing {
  id: 'ml-6',
  crop: 'Tomatoes',
  quantity: 15,
  unit: 'crates',
  pricePerUnit: 4500,
  seller: 'Peter Mwangi',
  farmerName: 'Peter Mwangi',
  farmerId: 'u-farmer-6',
  county: "Murang'a",
  date: '2026-05-21',
  status: 'active',
  quality: 'Grade 1',
  available: 'Jun 2026',
  verificationStatus: 'verified'
});

CREATE (:MarketListing {
  id: 'ml-7',
  crop: 'Sorghum',
  quantity: 25,
  unit: 'bags',
  pricePerUnit: 4200,
  seller: 'Grace Akinyi',
  farmerName: 'Grace Akinyi',
  farmerId: 'u-farmer-7',
  county: 'Homa Bay',
  date: '2026-05-25',
  status: 'active',
  quality: 'Organic',
  available: 'Jul 2026',
  verificationStatus: 'verified'
});

CREATE (:MarketListing {
  id: 'ml-8',
  crop: 'Wheat',
  quantity: 35,
  unit: 'bags',
  pricePerUnit: 3800,
  seller: 'David Kiprop',
  farmerName: 'David Kiprop',
  farmerId: 'u-farmer-8',
  county: 'Uasin Gishu',
  date: '2026-05-23',
  status: 'active',
  quality: 'Grade 1',
  available: 'Aug 2026',
  verificationStatus: 'verified'
});

// ============================================================
// Seed orders
// ============================================================
CREATE (:Order {
  id: 'ord-1',
  listingId: 'ml-3',
  buyerId: 'u-buyer',
  buyerName: 'Twiga Foods',
  seller: 'John Ochieng',
  crop: 'Rice',
  quantity: 30,
  price: 6500,
  total: 195000,
  county: 'Kisumu',
  status: 'DELIVERED',
  date: '2026-05-16T10:30:00Z'
});

CREATE (:Order {
  id: 'ord-2',
  listingId: 'ml-5',
  buyerId: 'u-buyer',
  buyerName: 'Twiga Foods',
  seller: 'James Kibet',
  crop: 'Potatoes',
  quantity: 10,
  price: 2800,
  total: 28000,
  county: 'Elgeyo-Marakwet',
  status: 'CONFIRMED',
  date: '2026-05-20T14:15:00Z'
});

// ============================================================
// Relationships
// ============================================================
MATCH (u:User {id: 'u-farmer'}), (fp:FarmerProfile {id: 'fp-1'})
CREATE (u)-[:HAS_PROFILE]->(fp);

MATCH (u:User {id: 'u-agent'}), (fp:FarmerProfile {id: 'fp-6'})
CREATE (u)-[:MANAGES]->(fp);

MATCH (fp:FarmerProfile {id: 'fp-1'}), (as:Assessment {id: 'as-1'})
CREATE (fp)-[:HAS_ASSESSMENT]->(as);

MATCH (fp:FarmerProfile {id: 'fp-2'}), (as:Assessment {id: 'as-2'})
CREATE (fp)-[:HAS_ASSESSMENT]->(as);

MATCH (fp:FarmerProfile {id: 'fp-3'}), (as:Assessment {id: 'as-3'})
CREATE (fp)-[:HAS_ASSESSMENT]->(as);

MATCH (fp:FarmerProfile {id: 'fp-4'}), (as:Assessment {id: 'as-4'})
CREATE (fp)-[:HAS_ASSESSMENT]->(as);

MATCH (fp:FarmerProfile {id: 'fp-5'}), (as:Assessment {id: 'as-5'})
CREATE (fp)-[:HAS_ASSESSMENT]->(as);

MATCH (fp:FarmerProfile {id: 'fp-1'}), (la:LoanApplication {id: 'la-1'})
CREATE (fp)-[:HAS_LOAN]->(la);

MATCH (fp:FarmerProfile {id: 'fp-2'}), (la:LoanApplication {id: 'la-2'})
CREATE (fp)-[:HAS_LOAN]->(la);

MATCH (fp:FarmerProfile {id: 'fp-3'}), (la:LoanApplication {id: 'la-3'})
CREATE (fp)-[:HAS_LOAN]->(la);

MATCH (fp:FarmerProfile {id: 'fp-4'}), (la:LoanApplication {id: 'la-4'})
CREATE (fp)-[:HAS_LOAN]->(la);

MATCH (fp:FarmerProfile {id: 'fp-5'}), (la:LoanApplication {id: 'la-5'})
CREATE (fp)-[:HAS_LOAN]->(la);

MATCH (fp:FarmerProfile {id: 'fp-6'}), (la:LoanApplication {id: 'la-6'})
CREATE (fp)-[:HAS_LOAN]->(la);

MATCH (u:User {id: 'u-farmer'}), (ch:ChamaGroup {id: 'ch-1'})
CREATE (u)-[:BELONGS_TO {id: 'mem-ch-1-u-farmer', status: 'ACTIVE', totalContributed: 15000, joinedAt: datetime()}]->(ch);

MATCH (u:User {id: 'u-admin'}), (ch:ChamaGroup {id: 'ch-2'})
CREATE (u)-[:BELONGS_TO {id: 'mem-ch-2-u-admin', status: 'ACTIVE', totalContributed: 8000, joinedAt: datetime()}]->(ch);

MATCH (u:User {id: 'u-agent'}), (ch:ChamaGroup {id: 'ch-3'})
CREATE (u)-[:BELONGS_TO {id: 'mem-ch-3-u-agent', status: 'ACTIVE', totalContributed: 22000, joinedAt: datetime()}]->(ch);

MATCH (u:User {id: 'u-farmer'}), (ch:ChamaGroup {id: 'ch-4'})
CREATE (u)-[:BELONGS_TO {id: 'mem-ch-4-u-farmer', status: 'ACTIVE', totalContributed: 0, joinedAt: datetime()}]->(ch);

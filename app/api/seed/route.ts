import { NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'
import { PEST_DISEASES } from '@/lib/pests'

// ─── Master Data ────────────────────────────────────────────────────────────

const ROLES = ['farmer', 'agent', 'lender', 'buyer', 'admin']

// Permissions per role — supports (Role)-[:CAN_ACCESS]->(Feature) RBAC queries
const ROLE_PERMISSIONS: Record<string, string[]> = {
  farmer:  ['chat', 'onboarding', 'risk_score', 'loan_apply'],
  agent:   ['chat', 'agent_dashboard', 'verify_farm', 'flag_discrepancy'],
  lender:  ['chat', 'lender_dashboard', 'approve_loan', 'reject_loan', 'trigger_disbursement'],
  buyer:   ['chat', 'buyer_browse', 'offtake_request'],
  admin:   ['chat', 'admin_panel', 'manage_users', 'view_all_loans', 'manage_chamas'],
}

const CROPS = [
  { name: 'maize',      labelEn: 'Maize',      labelSw: 'Mahindi' },
  { name: 'beans',      labelEn: 'Beans',       labelSw: 'Maharagwe' },
  { name: 'tea',        labelEn: 'Tea',         labelSw: 'Chai' },
  { name: 'coffee',     labelEn: 'Coffee',      labelSw: 'Kahawa' },
  { name: 'wheat',      labelEn: 'Wheat',       labelSw: 'Ngano' },
  { name: 'rice',       labelEn: 'Rice',        labelSw: 'Mchele' },
  { name: 'sorghum',    labelEn: 'Sorghum',     labelSw: 'Mtama' },
  { name: 'potatoes',   labelEn: 'Potatoes',    labelSw: 'Viazi' },
  { name: 'tomatoes',   labelEn: 'Tomatoes',    labelSw: 'Nyanya' },
  { name: 'avocado',    labelEn: 'Avocado',     labelSw: 'Parachichi' },
  { name: 'banana',     labelEn: 'Banana',      labelSw: 'Ndizi' },
  { name: 'cassava',    labelEn: 'Cassava',     labelSw: 'Muhogo' },
  { name: 'millet',     labelEn: 'Millet',      labelSw: 'Wimbi' },
  { name: 'cabbage',    labelEn: 'Cabbage',     labelSw: 'Kabeji' },
  { name: 'onions',     labelEn: 'Onions',      labelSw: 'Kitunguu' },
  { name: 'sugarcane',  labelEn: 'Sugarcane',   labelSw: 'Muwa' },
]

const COUNTIES: { name: string; lat: number; lng: number; region: string }[] = [
  { name: 'Baringo',          lat: 0.466,  lng: 35.958,  region: 'Rift Valley' },
  { name: 'Bomet',            lat: -0.781, lng: 35.332,  region: 'Rift Valley' },
  { name: 'Bungoma',          lat: 0.569,  lng: 34.558,  region: 'Western' },
  { name: 'Busia',            lat: 0.460,  lng: 34.111,  region: 'Western' },
  { name: 'Elgeyo-Marakwet',  lat: 1.049,  lng: 35.505,  region: 'Rift Valley' },
  { name: 'Embu',             lat: -0.537, lng: 37.454,  region: 'Eastern' },
  { name: 'Garissa',          lat: -0.453, lng: 39.646,  region: 'North Eastern' },
  { name: 'Homa Bay',         lat: -0.527, lng: 34.457,  region: 'Nyanza' },
  { name: 'Isiolo',           lat: 0.354,  lng: 37.582,  region: 'Eastern' },
  { name: 'Kajiado',          lat: -1.849, lng: 36.777,  region: 'Rift Valley' },
  { name: 'Kakamega',         lat: 0.283,  lng: 34.752,  region: 'Western' },
  { name: 'Kericho',          lat: -0.368, lng: 35.286,  region: 'Rift Valley' },
  { name: 'Kiambu',           lat: -1.167, lng: 36.833,  region: 'Central' },
  { name: 'Kilifi',           lat: -3.510, lng: 39.908,  region: 'Coast' },
  { name: 'Kirinyaga',        lat: -0.498, lng: 37.276,  region: 'Central' },
  { name: 'Kisii',            lat: -0.677, lng: 34.779,  region: 'Nyanza' },
  { name: 'Kisumu',           lat: -0.091, lng: 34.768,  region: 'Nyanza' },
  { name: 'Kitui',            lat: -1.370, lng: 38.011,  region: 'Eastern' },
  { name: 'Kwale',            lat: -4.173, lng: 39.449,  region: 'Coast' },
  { name: 'Laikipia',         lat: 0.085,  lng: 36.826,  region: 'Rift Valley' },
  { name: 'Lamu',             lat: -2.269, lng: 40.902,  region: 'Coast' },
  { name: 'Machakos',         lat: -1.517, lng: 37.267,  region: 'Eastern' },
  { name: 'Makueni',          lat: -1.804, lng: 37.620,  region: 'Eastern' },
  { name: 'Mandera',          lat: 3.937,  lng: 41.857,  region: 'North Eastern' },
  { name: 'Marsabit',         lat: 2.330,  lng: 37.994,  region: 'Eastern' },
  { name: 'Meru',             lat: -0.048, lng: 37.647,  region: 'Eastern' },
  { name: 'Migori',           lat: -1.063, lng: 34.473,  region: 'Nyanza' },
  { name: 'Mombasa',          lat: -4.043, lng: 39.668,  region: 'Coast' },
  { name: "Murang'a",         lat: -0.720, lng: 37.150,  region: 'Central' },
  { name: 'Nairobi',          lat: -1.286, lng: 36.817,  region: 'Nairobi' },
  { name: 'Nakuru',           lat: -0.302, lng: 36.080,  region: 'Rift Valley' },
  { name: 'Nandi',            lat: -0.020, lng: 35.010,  region: 'Rift Valley' },
  { name: 'Narok',            lat: -1.083, lng: 35.870,  region: 'Rift Valley' },
  { name: 'Nyamira',          lat: -0.563, lng: 34.936,  region: 'Nyanza' },
  { name: 'Nyandarua',        lat: -0.180, lng: 36.440,  region: 'Central' },
  { name: 'Nyeri',            lat: -0.416, lng: 36.952,  region: 'Central' },
  { name: 'Samburu',          lat: 1.215,  lng: 36.900,  region: 'Rift Valley' },
  { name: 'Siaya',            lat: -0.061, lng: 34.253,  region: 'Nyanza' },
  { name: 'Taita-Taveta',     lat: -3.317, lng: 38.377,  region: 'Coast' },
  { name: 'Tana River',       lat: -1.417, lng: 40.033,  region: 'Coast' },
  { name: 'Tharaka-Nithi',    lat: -0.297, lng: 37.850,  region: 'Eastern' },
  { name: 'Trans-Nzoia',      lat: 1.050,  lng: 34.950,  region: 'Rift Valley' },
  { name: 'Turkana',          lat: 3.150,  lng: 35.650,  region: 'Rift Valley' },
  { name: 'Uasin Gishu',      lat: 0.520,  lng: 35.270,  region: 'Rift Valley' },
  { name: 'Vihiga',           lat: -0.005, lng: 34.724,  region: 'Western' },
  { name: 'Wajir',            lat: 1.750,  lng: 40.060,  region: 'North Eastern' },
  { name: 'West Pokot',       lat: 1.500,  lng: 35.120,  region: 'Rift Valley' },
]

// ─── Demo Farmers ────────────────────────────────────────────────────────────
// Realistic Kenyan profiles — used for demo & Chama social collateral scoring

const DEMO_FARMERS = [
  {
    id:           'farmer-001',
    name:         'Wanjiku Muthoni',
    email:        'wanjiku@kilimo.demo',
    phone:        '0712345678',       // M-Pesa number for Masumi disbursement
    county:       'Nakuru',
    crop:         'maize',
    acreage:      9,
    creditScore:  72,
    chamaId:      'ch-mercy-corps',
    language:     'sw',              // Featherless AI will respond in Swahili
    verified:     false,             // agent verification pending
    loanAmount:   35000,
  },
  {
    id:           'farmer-002',
    name:         'Kipchoge Rotich',
    email:        'kipchoge@kilimo.demo',
    phone:        '0723456789',
    county:       'Kericho',
    crop:         'tea',
    acreage:      15,
    creditScore:  81,
    chamaId:      'ch-mercy-corps',
    language:     'en',
    verified:     true,              // agent has confirmed farm data
    loanAmount:   75000,
  },
  {
    id:           'farmer-003',
    name:         'Achieng Otieno',
    email:        'achieng@kilimo.demo',
    phone:        '0734567890',
    county:       'Kisumu',
    crop:         'rice',
    acreage:      5,
    creditScore:  58,
    chamaId:      null,              // no Chama — scores lower, shows contrast
    language:     'sw',
    verified:     false,
    loanAmount:   20000,
  },
]

// ─── Demo Agent ──────────────────────────────────────────────────────────────

const DEMO_AGENT = {
  id:      'agent-001',
  name:    'James Kariuki',
  email:   'james.agent@kilimo.demo',
  phone:   '0745678901',
  county:  'Nakuru',          // supervises farmers in Nakuru
}

// ─── Demo Lender ─────────────────────────────────────────────────────────────

const DEMO_LENDER = {
  id:    'lender-001',
  name:  'Equity Agri SACCO',
  email: 'agri@equity.demo',
  phone: '0756789012',
}

// ─── Demo Loans ──────────────────────────────────────────────────────────────
// Masumi triggers M-Pesa disbursement to farmer.phone on approval

const DEMO_LOANS = [
  {
    id:              'loan-001',
    farmerId:        'farmer-001',
    lenderId:        'lender-001',
    crop:            'maize',
    amount:          35000,
    status:          'pending_verification',  // waiting for agent sign-off
    riskScore:       72,
    disbursedVia:    'mpesa',                 // Masumi → M-Pesa
    recipientPhone:  '0712345678',
    masumiRef:       null,                    // populated after disbursement
    createdAt:       new Date().toISOString(),
  },
  {
    id:              'loan-002',
    farmerId:        'farmer-002',
    lenderId:        'lender-001',
    crop:            'tea',
    amount:          75000,
    status:          'approved',
    riskScore:       81,
    disbursedVia:    'mpesa',
    recipientPhone:  '0723456789',
    masumiRef:       'MSM-2026-00142',        // Masumi transaction reference stored in Neo4j
    createdAt:       new Date().toISOString(),
  },
]

// ─── Constraints & Indexes ───────────────────────────────────────────────────

async function createConstraints(session: any) {
  const constraints = [
    'CREATE CONSTRAINT IF NOT EXISTS FOR (r:Role)       REQUIRE r.name       IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (c:Crop)       REQUIRE c.name       IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (co:County)    REQUIRE co.name      IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (u:User)       REQUIRE u.email      IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (l:Loan)       REQUIRE l.id         IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (f:Feature)    REQUIRE f.name       IS UNIQUE',
    'CREATE INDEX IF NOT EXISTS FOR (u:User)            ON (u.phone)',
    'CREATE INDEX IF NOT EXISTS FOR (u:User)            ON (u.id)',
    'CREATE INDEX IF NOT EXISTS FOR (l:Loan)            ON (l.status)',
    'CREATE INDEX IF NOT EXISTS FOR (ps:PestScan)       ON (ps.createdAt)',
    'CREATE INDEX IF NOT EXISTS FOR (w:WeatherRecord)   ON (w.county)',
  ]
  for (const cypher of constraints) {
    try { await session.run(cypher) } catch { /* already exists */ }
  }
}

// ─── Main Seed Handler ───────────────────────────────────────────────────────

export async function GET() {
  const session = getSession()
  const results: string[] = []

  try {
    // 0. Constraints & indexes
    await createConstraints(session)
    results.push('Constraints and indexes created')

    // ── 1. Roles + Feature nodes + CAN_ACCESS relationships ─────────────────
    for (const name of ROLES) {
      await session.run('MERGE (:Role {name: $name})', { name })
    }
    const features = Array.from(new Set(Object.values(ROLE_PERMISSIONS).flat()))
    for (const feat of features) {
      await session.run('MERGE (:Feature {name: $feat})', { feat })
    }
    for (const [role, perms] of Object.entries(ROLE_PERMISSIONS)) {
      for (const perm of perms) {
        await session.run(
          `MATCH (r:Role {name: $role}), (f:Feature {name: $perm})
           MERGE (r)-[:CAN_ACCESS]->(f)`,
          { role, perm }
        )
      }
    }
    results.push(`Seeded ${ROLES.length} roles with ${features.length} features and CAN_ACCESS edges`)

    // ── 2. Crops ─────────────────────────────────────────────────────────────
    for (const c of CROPS) {
      await session.run(
        'MERGE (c:Crop {name: $name}) SET c.labelEn = $labelEn, c.labelSw = $labelSw',
        c
      )
    }
    results.push(`Seeded ${CROPS.length} crops`)

    // ── 3. Counties ──────────────────────────────────────────────────────────
    for (const c of COUNTIES) {
      await session.run(
        `MERGE (co:County {name: $name})
         SET co.lat = $lat, co.lng = $lng, co.region = $region`,
        c
      )
    }
    results.push(`Seeded ${COUNTIES.length} counties`)

    // ── 4. Mercy Corps ChamaGroup + LOCATED_IN County ────────────────────────
    await session.run(
      `MERGE (cg:ChamaGroup {id: 'ch-mercy-corps'})
       SET cg.name            = 'Mercy Corps Sustainable Agriculture Group',
           cg.description     = 'Official Mercy Corps AgriFin chama for tracking farmer lending journeys. Members access fair loans, group savings, and market linkages across Kenya.',
           cg.county          = 'Nairobi',
           cg.registrationFee = 0,
           cg.totalSavings    = 0,
           cg.repaymentRate   = 0.94,
           cg.createdAt       = datetime()
       WITH cg
       MATCH (co:County {name: 'Nairobi'})
       MERGE (cg)-[:LOCATED_IN]->(co)`
    )
    results.push('Seeded Mercy Corps ChamaGroup with LOCATED_IN → Nairobi')

    // ── 5. Pests & Diseases → AFFECTS → Crop ─────────────────────────────────
    let pestCount = 0
    for (const entry of PEST_DISEASES) {
      const label      = entry.type === 'pest' ? 'Pest' : 'Disease'
      const cropValue  = entry.crop.toLowerCase()
      await session.run(
        `MATCH (c:Crop {name: $cropValue})
         MERGE (p:${label} {name: $name})
         SET   p.type       = $type,
               p.symptoms   = $symptoms,
               p.treatment  = $treatment,
               p.prevention = $prevention,
               p.severity   = $severity
         MERGE (p)-[:AFFECTS]->(c)`,
        {
          cropValue,
          name:       entry.disease,
          type:       entry.type,
          symptoms:   entry.symptoms,
          treatment:  entry.treatment,
          prevention: entry.prevention,
          severity:   entry.severity,
        }
      )
      pestCount++
    }
    results.push(`Seeded ${pestCount} pests/diseases with AFFECTS → Crop edges`)

    // ── 6. Demo Farmers ───────────────────────────────────────────────────────
    for (const f of DEMO_FARMERS) {
      // Create User node with farmer role
      await session.run(
        `MERGE (u:User {id: $id})
         SET u.name        = $name,
             u.email       = $email,
             u.phone       = $phone,
             u.acreage     = $acreage,
             u.creditScore = $creditScore,
             u.language    = $language,
             u.verified    = $verified,
             u.emailVerified = true,
             u.createdAt   = datetime()
         WITH u
         MATCH (r:Role {name: 'farmer'})
         MERGE (u)-[:HAS_ROLE]->(r)`,
        {
          id:          f.id,
          name:        f.name,
          email:       f.email,
          phone:       f.phone,
          acreage:     f.acreage,
          creditScore: f.creditScore,
          language:    f.language,
          verified:    f.verified,
        }
      )

      // LOCATED_IN → County
      await session.run(
        `MATCH (u:User {id: $id}), (co:County {name: $county})
         MERGE (u)-[:LOCATED_IN]->(co)`,
        { id: f.id, county: f.county }
      )

      // GROWS → Crop
      await session.run(
        `MATCH (u:User {id: $id}), (c:Crop {name: $crop})
         MERGE (u)-[:GROWS]->(c)`,
        { id: f.id, crop: f.crop }
      )

      // MEMBER_OF → ChamaGroup (if applicable)
      if (f.chamaId) {
        await session.run(
          `MATCH (u:User {id: $id}), (cg:ChamaGroup {id: $chamaId})
           MERGE (u)-[:MEMBER_OF {joinedAt: datetime()}]->(cg)
           WITH cg
           SET cg.memberCount = cg.memberCount + 1`,
          { id: f.id, chamaId: f.chamaId }
        )
      }
    }
    results.push(`Seeded ${DEMO_FARMERS.length} demo farmers with LOCATED_IN, GROWS, MEMBER_OF edges`)

    // ── 7. Demo Agent ─────────────────────────────────────────────────────────
    await session.run(
      `MERGE (u:User {id: $id})
       SET u.name      = $name,
           u.email     = $email,
           u.phone     = $phone,
           u.createdAt = datetime()
       WITH u
       MATCH (r:Role {name: 'agent'})
       MERGE (u)-[:HAS_ROLE]->(r)`,
      DEMO_AGENT
    )
    // Agent LOCATED_IN + SUPERVISES farmers in same county
    await session.run(
      `MATCH (agent:User {id: $agentId}), (co:County {name: $county})
       MERGE (agent)-[:LOCATED_IN]->(co)
       WITH agent, co
       MATCH (farmer:User)-[:LOCATED_IN]->(co)
       WHERE farmer.id <> agent.id
         AND (farmer)-[:HAS_ROLE]->(:Role {name: 'farmer'})
       MERGE (agent)-[:SUPERVISES]->(farmer)`,
      { agentId: DEMO_AGENT.id, county: DEMO_AGENT.county }
    )
    results.push('Seeded demo agent with SUPERVISES edges to county farmers')

    // ── 8. Demo Lender ────────────────────────────────────────────────────────
    await session.run(
      `MERGE (u:User {id: $id})
       SET u.name      = $name,
           u.email     = $email,
           u.phone     = $phone,
           u.createdAt = datetime()
       WITH u
       MATCH (r:Role {name: 'lender'})
       MERGE (u)-[:HAS_ROLE]->(r)`,
      DEMO_LENDER
    )
    results.push('Seeded demo lender')

    // ── 9. Market Listings ──────────────────────────────────────────────────────
    const MARKET_LISTINGS = [
      { id: 'ml-1', crop: 'Maize',      quantity: 50,  unit: 'bags',   pricePerUnit: 3500, seller: 'Wanjiku Muthoni',  county: 'Nakuru',        date: '2026-05-20', status: 'active',   quality: 'Grade 1', available: 'Jun 2026' },
      { id: 'ml-2', crop: 'Beans',      quantity: 20,  unit: 'bags',   pricePerUnit: 8500, seller: 'Mary Wanjiku',     county: 'Nyeri',         date: '2026-05-18', status: 'active',   quality: 'Premium',  available: 'Jun 2026' },
      { id: 'ml-3', crop: 'Rice',       quantity: 30,  unit: 'bags',   pricePerUnit: 6500, seller: 'John Ochieng',     county: 'Kisumu',        date: '2026-05-15', status: 'sold',     quality: 'Grade 2', available: 'May 2026' },
      { id: 'ml-4', crop: 'Tea',        quantity: 100, unit: 'kg',     pricePerUnit: 280,  seller: 'Sarah Chebet',     county: 'Nandi',         date: '2026-05-22', status: 'active',   quality: 'Premium',  available: 'Jun 2026' },
      { id: 'ml-5', crop: 'Potatoes',   quantity: 40,  unit: 'bags',   pricePerUnit: 2800, seller: 'James Kibet',      county: 'Elgeyo-Marakwet', date: '2026-05-19', status: 'active', quality: 'Grade 1', available: 'Jul 2026' },
      { id: 'ml-6', crop: 'Tomatoes',   quantity: 15,  unit: 'crates', pricePerUnit: 4500, seller: 'Peter Mwangi',     county: "Murang'a",      date: '2026-05-21', status: 'active',   quality: 'Grade 1', available: 'Jun 2026' },
      { id: 'ml-7', crop: 'Sorghum',    quantity: 25,  unit: 'bags',   pricePerUnit: 4200, seller: 'Grace Akinyi',     county: 'Homa Bay',      date: '2026-05-25', status: 'active',   quality: 'Organic',  available: 'Jul 2026' },
      { id: 'ml-8', crop: 'Wheat',      quantity: 35,  unit: 'bags',   pricePerUnit: 3800, seller: 'David Kiprop',     county: 'Uasin Gishu',   date: '2026-05-23', status: 'active',   quality: 'Grade 1', available: 'Aug 2026' },
    ]
    for (const l of MARKET_LISTINGS) {
      await session.run(
        `MERGE (ml:MarketListing {id: $id})
         SET ml.crop = $crop, ml.quantity = $quantity, ml.unit = $unit,
             ml.pricePerUnit = $pricePerUnit, ml.seller = $seller,
             ml.county = $county, ml.date = $date, ml.status = $status,
             ml.quality = $quality, ml.available = $available`,
        l
      )
    }
    results.push(`Seeded ${MARKET_LISTINGS.length} market listings`)

    // ── 10. Orders ──────────────────────────────────────────────────────────────
    const ORDERS = [
      { id: 'ord-1', listingId: 'ml-3', buyerId: 'u-buyer', buyerName: 'Twiga Foods', seller: 'John Ochieng', crop: 'Rice', quantity: 30, price: 6500, total: 195000, county: 'Kisumu', status: 'DELIVERED', date: '2026-05-16T10:30:00Z' },
      { id: 'ord-2', listingId: 'ml-5', buyerId: 'u-buyer', buyerName: 'Twiga Foods', seller: 'James Kibet', crop: 'Potatoes', quantity: 10, price: 2800, total: 28000, county: 'Elgeyo-Marakwet', status: 'CONFIRMED', date: '2026-05-20T14:15:00Z' },
    ]
    for (const o of ORDERS) {
      await session.run(
        `MERGE (ord:Order {id: $id})
         SET ord.listingId = $listingId, ord.buyerId = $buyerId,
             ord.buyerName = $buyerName, ord.seller = $seller,
             ord.crop = $crop, ord.quantity = $quantity, ord.price = $price,
             ord.total = $total, ord.county = $county, ord.status = $status,
             ord.date = $date`,
        o
      )
    }
    results.push(`Seeded ${ORDERS.length} orders`)

    // ── 11. Demo Loans + Masumi M-Pesa disbursement metadata ──────────────────
    for (const loan of DEMO_LOANS) {
      await session.run(
        `MERGE (l:Loan {id: $id})
         SET l.amount         = $amount,
             l.status         = $status,
             l.riskScore      = $riskScore,
             l.disbursedVia   = $disbursedVia,
             l.recipientPhone = $recipientPhone,
             l.masumiRef      = $masumiRef,
             l.createdAt      = $createdAt
         WITH l
         MATCH (farmer:User {id: $farmerId})
         MERGE (farmer)-[:APPLIED_FOR]->(l)
         WITH l
         MATCH (lender:User {id: $lenderId})
         MERGE (lender)-[:ISSUED_LOAN]->(l)
         WITH l
         MATCH (c:Crop {name: $crop})
         MERGE (l)-[:FOR_CROP]->(c)`,
        {
          id:             loan.id,
          amount:         loan.amount,
          status:         loan.status,
          riskScore:      loan.riskScore,
          disbursedVia:   loan.disbursedVia,
          recipientPhone: loan.recipientPhone,
          masumiRef:      loan.masumiRef,
          createdAt:      loan.createdAt,
          farmerId:       loan.farmerId,
          lenderId:       loan.lenderId,
          crop:           loan.crop,
        }
      )
    }
    results.push(`Seeded ${DEMO_LOANS.length} loans with APPLIED_FOR, ISSUED_LOAN, FOR_CROP edges and Masumi M-Pesa refs`)

    await session.close()

    return NextResponse.json({
      success: true,
      message: 'KilimoAI database seeded successfully',
      results,
      summary: {
        roles:          ROLES.length,
        features:       features.length,
        crops:          CROPS.length,
        counties:       COUNTIES.length,
        pestsAndDiseases: pestCount,
        demoFarmers:    DEMO_FARMERS.length,
        demoLoans:      DEMO_LOANS.length,
        chamaGroups:    1,
        relationships: [
          'Role -[:CAN_ACCESS]-> Feature',
          'User -[:HAS_ROLE]-> Role',
          'User -[:LOCATED_IN]-> County',
          'User -[:GROWS]-> Crop',
          'User -[:MEMBER_OF]-> ChamaGroup',
          'ChamaGroup -[:LOCATED_IN]-> County',
          'Agent -[:SUPERVISES]-> Farmer',
          'User -[:APPLIED_FOR]-> Loan',
          'Lender -[:ISSUED_LOAN]-> Loan',
          'Loan -[:FOR_CROP]-> Crop',
          'Pest|Disease -[:AFFECTS]-> Crop',
        ],
      },
    })
  } catch (err: any) {
    await session.close()
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
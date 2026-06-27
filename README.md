# Kilimo AI

**Hackathon project** — built for the [Kenya AI Challenge 2026 / Mercy Corps AgriFin](https://kenyaaichallenge.com).

A decentralized farming fintech platform connecting Kenyan smallholder farmers with lenders, agents, buyers, and chama groups — powered by **Neo4j** for the knowledge graph and **M-Pesa** for payments and loan disbursements.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [User Roles](#user-roles)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Scripts](#scripts)
- [Seed Data](#seed-data)
- [Neo4j Verification Commands](#neo4j-verification-commands)
- [Project Structure](#project-structure)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + `cn` utility |
| **Database** | [Neo4j](https://neo4j.com) (AuraDB / graph database) |
| **Payments** | M-Pesa (Daraja API) |
| **USSD** | Africa's Talking API |
| **AI Agents** | LangChain agents for farm assessment & pest detection |
| **PWA** | Service worker with offline support |
| **Package Manager** | pnpm |

---

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Farmer    │     │    Agent     │     │    Buyer     │
│  (Mobile)   │     │  (Mobile)    │     │  (Mobile)    │
└──────┬──────┘     └──────┬───────┘     └──────┬───────┘
       │                   │                     │
       └───────────────────┼─────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Next.js 16 │
                    │ App Router  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼─────┐ ┌───▼────┐ ┌────▼─────┐
       │   Neo4j    │ │M-Pesa  │ │ Africa's │
       │  AuraDB    │ │Daraja  │ │ Talking  │
       └────────────┘ └────────┘ └──────────┘
```

---

## User Roles

| Role | Description | Key Pages |
|---|---|---|
| **Farmer** | Registers farm profile, applies for loans, views risk assessments, lists produce, joins chamas | `/chat`, `/loans`, `/marketplace/my-listings`, `/chama`, `/dashboard` |
| **Agent** | Verifies farmers in the field, schedules visits, verifies produce quality | `/agent/verify`, `/agent/schedule`, `/agent/listings` |
| **Lender** | Creates loan products, reviews applications, manages portfolio | `/lender/products`, `/lender`, `/lender/portfolio` |
| **Buyer** | Browses verified produce listings, places orders | `/buyer` |
| **Admin** | Manages users, views analytics, system settings | `/admin`, `/admin/analytics`, `/admin/users` |

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
pnpm build
pnpm start
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Description |
|---|---|
| `NEO4J_URI` | Neo4j AuraDB or local instance URI |
| `NEO4J_USERNAME` | Neo4j database username |
| `NEO4J_PASSWORD` | Neo4j database password |
| `MPESA_CONSUMER_KEY` | M-Pesa Daraja API consumer key |
| `MPESA_CONSUMER_SECRET` | M-Pesa Daraja API consumer secret |
| `MPESA_PASSKEY` | M-Pesa Daraja API passkey |
| `AT_API_KEY` | Africa's Talking API key (USSD) |
| `AT_USERNAME` | Africa's Talking username |
| `AT_SHORTCODE` | Africa's Talking shortcode (`*384*53298#`) |

---

## Database

The application uses **Neo4j** as its primary database. The graph model centers around `User` nodes connected to loans, crops, counties, chamas, and marketplace listings through typed relationships.

### Core Graph Schema

```
(User)-[:HAS_ROLE]->(Role)
(User)-[:LOCATED_IN]->(County)
(User)-[:GROWS]->(Crop)
(User)-[:APPLIED_FOR]->(LoanApplication)
(User)-[:RECEIVED_LOAN]->(ActiveLoan)
(User)-[:MEMBER_OF]->(ChamaGroup)
(User)-[:HAS_LISTING]->(MarketListing)
(User)-[:SUPERVISES]->(User)        // agent → farmer
(Lender)-[:DISBURSED]->(ActiveLoan)
(Agent)-[:VERIFIED]->(MarketListing)
(ActiveLoan)-[:HAS_PAYMENT]->(PaymentRecord)
```

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build with PWA precache generation |
| `pnpm start` | Start production server |
| `pnpm seed` | Seed the Neo4j database with demo data |
| `pnpm lint` | Run ESLint |

### USSD Testing

The USSD endpoint is at `/api/ussd` and supports both:

- **POST** — Africa's Talking form-encoded requests (production)
- **GET** — Query parameter testing for local development

Shortcode: `*384*53298#`

```
GET /api/ussd?phone=2547XXXXXXXX&sessionId=test123&text=1
```

---

## Seed Data

```bash
pnpm seed
```

Creates the following demo dataset in Neo4j:

- **5 users** — one per role (farmer, agent, lender, buyer, admin)
- **Loan products** — 6 products (e.g., M-Pesa Farm Boost, Equity Agro Loan)
- **Loan applications** — 6 applications with varying statuses
- **Active loans** — approved loans with repayment tracking
- **Chama groups** — 4 groups with members and savings
- **Market listings** — 8 produce listings (maize, beans, tea, etc.)
- **Orders** — 2 sample orders (delivered, confirmed)
- **Notifications** — sample notifications for testing
- **Visit schedules** — agent field visit records

---

## Neo4j Verification Commands

The following Cypher queries can be executed in **Neo4j Browser** or **Neo4j Workspace** to verify that the Kilimo AI graph database has been seeded correctly and that all major relationships are present. These queries were also used during the Neo4j Technical Proof Video submitted for the hackathon.

### 1. Verify Database Contents

Displays every node label and the total number of nodes for each type.

```cypher
MATCH (n)
RETURN labels(n) AS Label, count(n) AS Total
ORDER BY Total DESC;
```

Expected node types include:

- User
- Role
- County
- Crop
- LoanProduct
- LoanApplication
- ActiveLoan
- ChamaGroup
- MarketListing
- Order
- VisitSchedule
- Notification
- PaymentRecord

### 2. Visualize the Entire Graph

Displays the complete graph with nodes and relationships.

```cypher
MATCH (n)
OPTIONAL MATCH (n)-[r]->(m)
RETURN n,r,m
LIMIT 300;
```

Purpose:

- Verify graph connectivity.
- Demonstrate how farmers, crops, loans, counties, agents, lenders, and chamas are interconnected.

### 3. View Farmer Profiles

Shows each farmer together with their county, crops, and agent assignments.

```cypher
MATCH (u:User {role: 'farmer'})
OPTIONAL MATCH (u)-[:LOCATED_IN]->(co:County)
OPTIONAL MATCH (u)-[:GROWS]->(c:Crop)
OPTIONAL MATCH (a:User)-[:SUPERVISES]->(u)
RETURN u.name AS Farmer,
       co.name AS County,
       collect(DISTINCT c.name) AS Crops,
       a.name AS AssignedAgent
ORDER BY Farmer;
```

### 4. Loan Applications & Approvals

Shows all loan applications and approved loans with their current status.

```cypher
MATCH (u:User)-[:APPLIED_FOR]->(la:LoanApplication)
OPTIONAL MATCH (u)-[:RECEIVED_LOAN]->(al:ActiveLoan)
RETURN u.name AS Farmer,
       la.amount AS AppliedAmount,
       la.status AS ApplicationStatus,
       la.date AS ApplicationDate,
       al.amount AS ApprovedAmount,
       al.remainingBalance AS RemainingBalance,
       al.status AS LoanStatus
ORDER BY la.date DESC;
```

### 5. Agent Field Activity

Shows all scheduled field visits and their current status.

```cypher
MATCH (a:User {role: 'agent'})-[:SUPERVISES]->(f:User)
OPTIONAL MATCH (vs:VisitSchedule {agentId: a.id})
RETURN a.name AS Agent,
       f.name AS Farmer,
       vs.date AS VisitDate,
       vs.time AS VisitTime,
       vs.status AS VisitStatus
ORDER BY vs.date DESC;
```

### 6. Chama Groups with Members

Shows all chama groups and their members.

```cypher
MATCH (cg:ChamaGroup)
OPTIONAL MATCH (u:User)-[:MEMBER_OF]->(cg)
RETURN cg.name AS ChamaName,
       cg.totalSavings AS TotalSavings,
       collect(u.name) AS Members
ORDER BY cg.totalSavings DESC;
```

### 7. Marketplace Listings & Orders

Shows all produce listings and any orders placed.

```cypher
MATCH (ml:MarketListing)
OPTIONAL MATCH (o:Order {listingId: ml.id})
RETURN ml.crop AS Crop,
       ml.quantity AS Quantity,
       ml.pricePerUnit AS PricePerUnit,
       ml.verificationStatus AS VerificationStatus,
       ml.seller AS Seller,
       o.status AS OrderStatus,
       o.buyerName AS Buyer
ORDER BY ml.date DESC;
```

### 8. Payment Records

Shows all M-Pesa payment transactions against active loans.

```cypher
MATCH (al:ActiveLoan)-[:HAS_PAYMENT]->(pr:PaymentRecord)
RETURN pr.id AS PaymentID,
       pr.amount AS Amount,
       pr.mpesaRef AS MpesaRef,
       pr.date AS PaymentDate,
       al.remainingBalance AS RemainingBalance
ORDER BY pr.date DESC;
```

### 9. Relationship Summary

Counts every relationship type in the graph.

```cypher
MATCH ()-[r]->()
RETURN type(r) AS Relationship, count(r) AS Total
ORDER BY Total DESC;
```

### 10. Notifications

Shows all notifications sent to users.

```cypher
MATCH (n:Notification)
RETURN n.userId AS UserID,
       n.type AS Type,
       n.title AS Title,
       n.read AS Read
ORDER BY n.createdAt DESC
LIMIT 50;
```

---

## Project Structure

```
kilimo-ai/
├── app/
│   ├── (app)/              # Authenticated app routes
│   │   ├── admin/          # Admin dashboard, analytics, users, settings
│   │   ├── agent/          # Agent verify, schedule, flagged, listings
│   │   ├── buyer/          # Buyer marketplace
│   │   ├── lender/         # Lender dashboard, portfolio, products
│   │   ├── chat/           # AI assessment chat
│   │   ├── chatbot/        # AI assistant
│   │   ├── chama/          # Chama groups
│   │   ├── dashboard/      # Farmer dashboard
│   │   ├── loans/          # Loan products & applications
│   │   ├── marketplace/    # Farmer yield listings
│   │   └── profile/        # User profile
│   ├── (marketing)/        # Public marketing pages
│   ├── api/                # API routes (Neo4j queries, auth, payments)
│   └── auth/               # Login, signup, password reset, email verify
├── components/
│   ├── shared/             # Reusable UI components
│   ├── marketing/          # Landing page components
│   ├── chat/               # Chat interface components
│   └── ui/                 # Base UI primitives (shadcn-style)
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── constants.ts        # UI text, crop list, counties
│   ├── i18n.ts             # Internationalization
│   ├── neo4j.ts            # Neo4j driver singleton
│   ├── auth.ts             # Client-side auth helpers
│   └── utils.ts            # Utility functions
├── public/
│   ├── icons/              # PWA icons
│   ├── manifest.webmanifest
│   └── offline.html        # Offline fallback page
├── scripts/
│   ├── seed.cypher         # Neo4j seed data (Cypher)
│   ├── clear.cypher        # Database clear script
│   └── generate-precache.js # PWA precache manifest
├── proxy.ts                # Route protection middleware
└── sw.ts                   # Service worker
```

---

## Featherless AI Integration

Kilimo AI uses **Featherless AI** via its REST API (`api.featherless.ai/v1`) to power two core features: **Farm Risk Assessment** and **Pest Detection**.

### 1. Farm Risk Assessment Chat (`/api/chat`)

| Aspect | Details |
|---|---|
| **Model** | `deepseek-ai/DeepSeek-V4-Pro` (open-weight, served through Featherless) |
| **What it does** | Acts as a financial advisor for smallholder farmers. In "assessment" mode, it evaluates whether a farmer should take an agricultural loan and recommends a safe amount. In "general" mode, it answers any farming-related questions (crop management, weather, market prices). |
| **Input sent to Featherless** | A structured `POST /v1/chat/completions` request containing: a **system prompt** (bilingual English/Swahili instructions with the assessment rubric), a **farmer profile block** (name, county, crops, acreage, rental costs, phone), the **conversation history**, and a Neo4j-derived **context block** (pest/disease data for the farmer's crops + recent weather data for their county). |
| **Output from Featherless** | A standard OpenAI-compatible chat completion response (`{ choices: [{ message: { content: "..." } }] }`) containing a natural-language assessment in English or Swahili, or a farming advice answer. |
| **How it appears in the product** | The response is displayed in the chat interface at `/chat` (assessment mode) or `/chatbot` (general mode). Assessment responses include a risk level badge (`LOW`/`MEDIUM`/`HIGH`/`UNKNOWN`) rendered from the model's output, and the conversation is persisted in localStorage so farmers can revisit their assessment history on the dashboard. |

### 2. Pest Detection (`/api/pest-check`)

| Aspect | Details |
|---|---|
| **Model** | `meta-llama/Llama-3.2-11B-Vision-Instruct` (open-weight vision model, served through Featherless) |
| **What it does** | Identifies crop pests and diseases from farmer-submitted photos. Returns the pest name, confidence score, severity level, and localized treatment recommendations using solutions available in East Africa. |
| **Input sent to Featherless** | A structured `POST /v1/chat/completions` request containing: a **system prompt** instructing the model to act as a specialized agricultural pest expert and return structured JSON, and a **multimodal user message** with the text "Identify the pest or disease affecting this crop." plus the uploaded image as a base64 data URL (`image_url`). |
| **Output from Featherless** | A JSON object parsed from the model's response: `{ pest, confidence, recommendation, severity, isPest, commonName, scientificName, affectedCrops }`. |
| **How it appears in the product** | The parsed result renders a pest detection card on the `/pest-check` page: pest name with confidence percentage, severity badge (color-coded LOW/MEDIUM/HIGH), treatment recommendations, scientific name where available, and an icon indicating whether it is an insect pest or plant disease. The scan is also saved to Neo4j as a `PestScan` node linked to the matching `Pest`/`Disease` and `Crop` nodes for future reference. |

### Environment Variables

Both integrations are configured via environment variables:

| Variable | Default | Used By |
|---|---|---|
| `FEATHERLESS_API_KEY` | — | Chat + Pest Detection |
| `FEATHERLESS_BASE_URL` | `https://api.featherless.ai/v1` | Chat + Pest Detection |
| `FEATHERLESS_MODEL` | `deepseek-ai/DeepSeek-V4-Pro` | Chat |
| `FEATHERLESS_VISION_MODEL` | `meta-llama/Llama-3.2-11B-Vision-Instruct` | Pest Detection |

---

## License

This project was developed for hackathon purposes. License rights belong to the hackathon organizing body until updated otherwise!

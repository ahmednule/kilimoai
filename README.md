# Kilimo AI

**Hackathon project** — built for the [kenyaaihackathon / MercyCorps](https://kenyaaichallenge.com) ecosystem.

A decentralized farming fintech platform connecting Kenyan smallholder farmers with lenders, agents, buyers, and chama groups — powered by **M-Pesa** for payments and disbursements.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + `cn` utility |
| Database | [Neo4j](https://neo4j.com) (graph database) |
| Payments | M-Pesa (Daraja API) |
| AI Agents | Custom LangChain agents for farm assessment & pest detection |
| Package Manager | pnpm |

## User Roles

| Role | Description |
|---|---|
| **Farmer** | Registers farm profile, applies for loans, tracks assessments |
| **Agent** | Verifies farmers in the field, conducts farm assessments |
| **Lender** | Reviews applications, manages loan portfolio, disburses funds |
| **Buyer** | Browses marketplace listings, purchases produce |
| **Admin** | Manages users, views analytics, system settings |

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.example` to `.env.local` and configure:

- `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` — Neo4j Aura or local instance
- `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY` — M-Pesa Daraja API

## Seed Data

```bash
pnpm seed
```

Creates 5 users (one per role), 8 farmer profiles, 6 loan applications, 6 loan products, 3 chama groups, and 6 market listings.

## License

This project was developed for hackathon purposes. License rights belong to the hackathon organizing body until updated otherwise!

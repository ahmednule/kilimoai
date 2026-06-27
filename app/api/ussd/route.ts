//still in progress
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

function con(text: string) { return `CON ${text}` }
function end(text: string) { return `END ${text}` }

const CROPS: Record<string, string> = { '1': 'Maize', '2': 'Beans', '3': 'Wheat', '4': 'Other' }
const PERIODS: Record<string, string> = { '1': '1 month', '2': '3 months', '3': '6 months' }
const MONTHS: Record<string, number> = { '1': 1, '2': 3, '3': 6 }

function generateRef() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

function normalizePhone(phone: string) {
  return phone.replace(/^\+/, '').replace(/^0/, '254').replace(/\D/g, '')
}

async function computeRiskScore(acres: number, crop: string, amount: number) {
  let score = 50
  if (amount <= 10000) score += 20
  else if (amount <= 50000) score += 10
  else if (amount > 200000) score -= 20
  if (acres >= 2) score += 15
  if (acres >= 5) score += 10
  if (crop === 'Maize' || crop === 'Beans') score += 10
  return Math.min(100, Math.max(0, score))
}

// ── Shared handler: text is the USSD input string ──
async function handleUSSD(phoneNumber: string, text: string): Promise<string> {
  const parts = text.split('*')
  const level = text === '' ? 0 : parts.length
  const mainChoice = parts[0]
  const normalizedPhone = normalizePhone(phoneNumber)

  // Level 0: Main menu
  if (level === 0) {
    return con(
      'KilimoAI — Mkopo wa Kilimo\n' +
      '1. Omba Mkopo (Apply)\n' +
      '2. Angalia Hali (Status)\n' +
      '3. Lipa Mkopo (Repay)'
    )
  }

  // ═══════════ 1. APPLY FOR LOAN ═══════════
  if (mainChoice === '1') {
    if (level === 1) return con('Enter your full name:\nWeka jina lako kamili:')
    if (level === 2) return con('Enter farm size in acres:\nWeka ukubwa wa shamba (ekari):')
    if (level === 3) {
      return con(
        'Select main crop / Chagua zao:\n\n' +
        '1. Mahindi (Maize)\n2. Maharagwe (Beans)\n3. Ngano (Wheat)\n4. Nyingine (Other)'
      )
    }
    if (level === 4) {
      if (!CROPS[parts[3]]) return end('Invalid choice. Start again.\nChaguo si sahihi.')
      return con('Enter loan amount (KES 1,000–500,000):\nWeka kiasi cha mkopo:')
    }
    if (level === 5) {
      const amt = parseInt(parts[4])
      if (isNaN(amt) || amt < 1000 || amt > 500000) return end('Invalid amount.')
      return con('Select repayment period / Chagua muda:\n\n1. 1 month\n2. 3 months\n3. 6 months')
    }
    if (level === 6) {
      if (!PERIODS[parts[5]]) return end('Invalid choice.')
      return con(
        `Confirm / Thibitisha:\n\nName: ${parts[1]}\nFarm: ${parts[2]} ac | ${CROPS[parts[3]]}\n` +
        `Loan: KES ${parseInt(parts[4]).toLocaleString()}\nPeriod: ${PERIODS[parts[5]]}\n\n1. Confirm\n2. Cancel`
      )
    }
    if (level === 7) {
      if (parts[6] === '2') return end('Cancelled / Imeghairiwa.')
      if (parts[6] !== '1') return end('Invalid input.')

      const session = getSession()
      try {
        // Find or create farmer by phone
        let farmerResult = await session.run(
          `MATCH (u:User {phone: $phone}) RETURN u`,
          { phone: normalizedPhone }
        )

        let farmerId: string
        if (farmerResult.records.length > 0) {
          const u = farmerResult.records[0].get('u').properties
          farmerId = u.id
          if (u.name) {
            await session.run(
              `MATCH (u:User {id: $id}) SET u.name = $name`,
              { id: farmerId, name: parts[1] }
            )
          }
        } else {
          farmerId = `ussd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
          await session.run(
            `CREATE (u:User {
               id: $id, name: $name, phone: $phone,
               email: $email, password: '',
               verified: false, emailVerified: false,
               createdAt: datetime()
             })
             WITH u
             MATCH (r:Role {name: 'farmer'})
             CREATE (u)-[:HAS_ROLE]->(r)`,
            { id: farmerId, name: parts[1], phone: normalizedPhone, email: `${normalizedPhone}@ussd.kilimo` }
          )
        }

        const name = parts[1]
        const acres = parseFloat(parts[2])
        const crop = CROPS[parts[3]]
        const amount = parseInt(parts[4])
        const periodLabel = PERIODS[parts[5]]
        const periodMonths = MONTHS[parts[5]]
        const ref = generateRef()
        const riskScore = await computeRiskScore(acres, crop, amount)
        const approved = riskScore >= 55
        const laId = `ussd-la-${Date.now().toString(36)}`

        // Create loan application — linked to User node
        await session.run(
          `MATCH (u:User {id: $farmerId})
           CREATE (la:LoanApplication {
             id: $laId, productId: 'ussd', farmerId: $farmerId,
             farmerName: $name, amount: $amount, status: $status,
             date: $date, county: '', crop: $crop, acres: $acres,
             riskLevel: $riskLabel, ussdRef: $ref
           })
           CREATE (u)-[:APPLIED_FOR]->(la)`,
          {
            farmerId, laId, name, amount, acres, crop,
            ref, date: new Date().toISOString().split('T')[0],
            status: approved ? 'pending' : 'rejected',
            riskLabel: riskScore >= 70 ? 'LOW' : riskScore >= 55 ? 'MEDIUM' : 'HIGH',
          }
        )

        if (approved) {
          return end(
            `Application received! / Ombi limepokelewa!\n\nRef: ${ref}\nAmount: KES ${amount.toLocaleString()}\n` +
            `Period: ${periodLabel}\nRisk score: ${riskScore}/100\n\n` +
            `You will receive an SMS update. / Utapata SMS kwa taarifa.`
          )
        }

        return end(
          `Not approved / Haijakubaliwa.\nScore: ${riskScore}/100\n\n` +
          `Tips / Vidokezo:\n- Apply for a smaller amount\n- Increase farm size\n\nTry again in 30 days.`
        )
      } finally {
        await session.close()
      }
    }
  }

  // ═══════════ 2. CHECK STATUS ═══════════
  if (mainChoice === '2') {
    const session = getSession()
    try {
      const result = await session.run(
        `MATCH (u:User {phone: $phone})
         OPTIONAL MATCH (u)-[:APPLIED_FOR]->(la:LoanApplication)
         OPTIONAL MATCH (u)-[:RECEIVED_LOAN]->(al:ActiveLoan)
         RETURN u,
                la.id AS laId, la.amount AS laAmount, la.status AS laStatus, la.crop AS laCrop, la.date AS laDate,
                al.id AS alId, al.amount AS alAmount, al.remainingBalance AS alBalance, al.masumiRef AS alRef
         ORDER BY la.date DESC LIMIT 1`,
        { phone: normalizedPhone }
      )

      if (result.records.length === 0) {
        return end('No account found for this number / Hakuna akaunti.')
      }

      const r = result.records[0]
      const alId = r.get('alId')

      if (alId) {
        const balance = Number(r.get('alBalance') || 0)
        const done = balance <= 0
        return end(
          `Active Loan / Mkopo Hai:\n\nRef: ${r.get('alRef') || String(alId).slice(-6)}\n` +
          `Amount: KES ${Number(r.get('alAmount') || 0).toLocaleString()}\n` +
          `Balance: KES ${balance.toLocaleString()}\n` +
          `Status: ${done ? 'PAID OFF / IMELIPWA' : 'ACTIVE / INAENDELEA'}`
        )
      }

      const laId = r.get('laId')
      if (laId) {
        const statusMap: Record<string, string> = {
          pending: '⏳ Pending / Inasubiri',
          approved: '✓ Approved / Imekubaliwa',
          rejected: '✗ Declined / Imekataliwa',
          disbursed: '✓ Disbursed / Imetolewa',
        }
        return end(
          `Latest Application / Ombi:\n\nCrop: ${r.get('laCrop') || 'N/A'}\n` +
          `Amount: KES ${Number(r.get('laAmount') || 0).toLocaleString()}\n` +
          `Status: ${statusMap[r.get('laStatus') as string] || r.get('laStatus')}\n` +
          `Date: ${r.get('laDate') || 'N/A'}`
        )
      }

      return end('No loan found / Hakuna mkopo.')
    } finally {
      await session.close()
    }
  }

  // ═══════════ 3. REPAY LOAN ═══════════
  if (mainChoice === '3') {
    if (level === 1) {
      return con('Enter loan reference (6-digit code from SMS):\nWeka namba ya mkopo:')
    }
    if (level === 2) {
      const ref = parts[1].trim().toUpperCase()
      const session = getSession()
      try {
        const result = await session.run(
          `MATCH (al:ActiveLoan)
           WHERE al.masumiRef CONTAINS $ref OR al.id CONTAINS $ref
           RETURN al LIMIT 1`,
          { ref }
        )
        if (result.records.length === 0) return end('Reference not found / Haikupatikana.')
        const p = result.records[0].get('al').properties
        const balance = Number(p.remainingBalance || 0)
        if (balance <= 0) return end('Already fully paid.')
        return con(
          `Loan: KES ${balance.toLocaleString()}\nRef: ${p.masumiRef || ref}\n\n1. Pay via M-Pesa\n2. Cancel`
        )
      } finally {
        await session.close()
      }
    }
    if (level === 3) {
      if (parts[2] === '2') return end('Cancelled / Imeghairiwa.')
      if (parts[2] !== '1') return end('Invalid input.')

      const ref = parts[1].trim().toUpperCase()
      const session = getSession()
      try {
        const result = await session.run(
          `MATCH (al:ActiveLoan)
           WHERE al.masumiRef CONTAINS $ref OR al.id CONTAINS $ref
           WITH al
           MATCH (u:User)-[:RECEIVED_LOAN]->(al)
           RETURN al, u.phone AS farmerPhone`,
          { ref }
        )
        if (result.records.length === 0) return end('Loan not found.')
        const p = result.records[0].get('al').properties
        const balance = Number(p.remainingBalance || 0)
        const loanId = p.id
        if (balance <= 0) return end('Already paid.')

        const mpesaRef = `USSD-${generateRef()}`
        let stkSent = false
        try {
          const masumiUrl = process.env.MASUMI_API_URL
          const masumiKey = process.env.MASUMI_API_KEY
          if (masumiUrl && masumiKey) {
            const res = await fetch(`${masumiUrl}/payments/initiate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${masumiKey}` },
              body: JSON.stringify({
                phone: normalizePhone(result.records[0].get('farmerPhone') || phoneNumber),
                amount: balance,
                reference: mpesaRef,
                description: `KilimoAI USSD repayment ${ref}`,
              }),
            })
            stkSent = res.ok
          }
        } catch {}

        await session.run(
          `MATCH (al:ActiveLoan {id: $loanId})
           SET al.totalPaid = al.totalPaid + al.remainingBalance,
               al.remainingBalance = 0, al.status = 'paid_off'
           CREATE (al)-[:HAS_PAYMENT]->(p:PaymentRecord {
             id: $mpesaRef, date: $today,
             amount: $balance, method: 'MPESA', mpesaRef: $mpesaRef
           })`,
          { loanId, mpesaRef, balance, today: new Date().toISOString().split('T')[0] }
        )

        const msg = stkSent
          ? 'M-Pesa prompt sent! Check your phone and enter PIN.\nOmbi la M-Pesa limetumwa. Weka PIN.\n\nRef: ' + ref
          : 'Payment recorded. / Malipo yamehifadhiwa.\nRef: ' + ref
        return end(msg)
      } finally {
        await session.close()
      }
    }
  }

  return end('Invalid option. Start again.\nChaguo si sahihi.')
}


export async function POST(req: NextRequest) {
  const body = await req.formData()
  const phoneNumber = (body.get('phoneNumber') as string) || ''
  const text = ((body.get('text') as string) ?? '').trim()

  const response = await handleUSSD(phoneNumber, text)
  return new NextResponse(response, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  })
}


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const phoneNumber = searchParams.get('phone') || '0712345678'
  const text = (searchParams.get('text') ?? '').trim()

  const response = await handleUSSD(phoneNumber, text)
  return new NextResponse(response, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  })
}

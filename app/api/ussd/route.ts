import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

interface USSDRequest {
  sessionId: string
  phoneNumber: string
  serviceCode: string
  text: string
}

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

async function findOrCreateFarmer(phone: string) {
  const session = getSession()
  try {
    const result = await session.run(
      `MATCH (u:User {phone: $phone}) RETURN u`,
      { phone }
    )
    if (result.records.length > 0) {
      const u = result.records[0].get('u').properties
      return { id: u.id, name: u.name || '', phone: u.phone, exists: true }
    }
    // Create minimal farmer
    const id = `ussd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    await session.run(
      `CREATE (u:User {
        id: $id, name: '', phone: $phone,
        email: $email, password: '',
        verified: false, emailVerified: false,
        createdAt: datetime()
      })
      WITH u
      MATCH (r:Role {name: 'farmer'})
      CREATE (u)-[:HAS_ROLE]->(r)`,
      { id, phone, email: `${phone}@ussd.kilimo` }
    )
    return { id, name: '', phone, exists: false }
  } finally {
    await session.close()
  }
}

async function getLatestApplication(farmerId: string) {
  const session = getSession()
  try {
    const result = await session.run(
      `MATCH (u:User {id: $farmerId})-[:APPLIED_FOR]->(la:LoanApplication)
       RETURN la ORDER BY la.date DESC LIMIT 1`,
      { farmerId }
    )
    if (result.records.length === 0) return null
    const p = result.records[0].get('la').properties
    return {
      id: p.id, amount: Number(p.amount || 0), status: p.status || 'pending',
      crop: p.crop || '', date: p.date ? p.date.toString() : '',
    }
  } finally {
    await session.close()
  }
}

async function getActiveLoan(farmerId: string) {
  const session = getSession()
  try {
    const result = await session.run(
      `MATCH (u:User {id: $farmerId})-[:RECEIVED_LOAN]->(al:ActiveLoan)
       RETURN al ORDER BY al.disbursedAt DESC LIMIT 1`,
      { farmerId }
    )
    if (result.records.length === 0) return null
    const p = result.records[0].get('al').properties
    return {
      id: p.id, amount: Number(p.amount || 0), remainingBalance: Number(p.remainingBalance || 0),
      interestRate: Number(p.interestRate || 12), dailyInterest: Number(p.dailyInterest || 0),
      status: p.status || 'disbursed', masumiRef: p.masumiRef || '',
    }
  } finally {
    await session.close()
  }
}

async function computeRiskScore(name: string, acres: number, crop: string, amount: number) {
  let score = 50
  if (amount <= 10000) score += 20
  else if (amount <= 50000) score += 10
  else if (amount > 200000) score -= 20
  if (acres >= 2) score += 15
  if (acres >= 5) score += 10
  if (crop === 'Maize' || crop === 'Beans') score += 10
  return Math.min(100, Math.max(0, score))
}

async function sendSMS(phone: string, message: string) {
  try {
    const apiKey = process.env.AT_API_KEY
    const username = process.env.AT_USERNAME
    if (!apiKey || !username) { console.log('[SMS stub]', phone, message); return }
    await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'ApiKey': apiKey,
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        username, to: phone, message,
        from: process.env.AT_SHORTCODE || '38453298',
      }),
    })
  } catch (err) {
    console.error('[SMS error]', err)
  }
}

export async function POST(req: NextRequest) {
  const body = await req.formData()
  const params: USSDRequest = {
    sessionId:   body.get('sessionId')   as string || '',
    phoneNumber: body.get('phoneNumber') as string || '',
    serviceCode: body.get('serviceCode') as string || '',
    text:        (body.get('text')       as string) ?? '',
  }

  const { phoneNumber, text } = params
  const parts = text.split('*')
  const level = text === '' ? 0 : parts.length
  const mainChoice = parts[0]
  const normalizedPhone = normalizePhone(phoneNumber)

  async function handler(): Promise<string> {
    // ── Level 0: Main menu ──
    if (level === 0) {
      return con(
        'KilimoAI — Mkopo wa Kilimo\n' +
        '1. Omba Mkopo (Apply)\n' +
        '2. Angalia Hali (Status)\n' +
        '3. Lipa Mkopo (Repay)'
      )
    }

    // ═══════════════════ 1. APPLY FOR LOAN ═══════════════════
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
        if (isNaN(amt) || amt < 1000 || amt > 500000) return end('Invalid amount. Must be KES 1,000–500,000.')
        return con('Select repayment period / Chagua muda:\n\n1. 1 month\n2. 3 months\n3. 6 months')
      }
      if (level === 6) {
        if (!PERIODS[parts[5]]) return end('Invalid choice. Start again.')
        return con(
          `Confirm / Thibitisha:\n\nName: ${parts[1]}\nFarm: ${parts[2]} ac | ${CROPS[parts[3]]}\n` +
          `Loan: KES ${parseInt(parts[4]).toLocaleString()}\nPeriod: ${PERIODS[parts[5]]}\n\n1. Confirm\n2. Cancel`
        )
      }
      if (level === 7) {
        if (parts[6] === '2') return end('Cancelled / Imeghairiwa.')
        if (parts[6] !== '1') return end('Invalid input.')

        const farmer = await findOrCreateFarmer(normalizedPhone)
        const name = parts[1]
        const acres = parseFloat(parts[2])
        const crop = CROPS[parts[3]]
        const amount = parseInt(parts[4])
        const periodLabel = PERIODS[parts[5]]
        const periodMonths = MONTHS[parts[5]]
        const ref = generateRef()
        const riskScore = await computeRiskScore(name, acres, crop, amount)
        const approved = riskScore >= 55

        const laId = `ussd-la-${Date.now().toString(36)}`

        const session = getSession()
        try {
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
              farmerId: farmer.id, laId, name, amount, acres, crop,
              ref, date: new Date().toISOString().split('T')[0],
              status: approved ? 'pending' : 'rejected',
              riskLabel: riskScore >= 70 ? 'LOW' : riskScore >= 55 ? 'MEDIUM' : 'HIGH',
            }
          )
        } finally {
          await session.close()
        }

        if (farmer.exists && farmer.name) {
          await session.run(
            `MATCH (u:User {id: $farmerId}) SET u.name = $name`,
            { farmerId: farmer.id, name }
          )
        }

        if (approved) {
          await sendSMS(normalizedPhone,
            `KilimoAI: Loan application received! Ref: ${ref}. Amount: KES ${amount.toLocaleString()}. ` +
            `We will review and notify you. Thank you!`
          )
          return end(
            `Application received! / Ombi limepokelewa!\n\nRef: ${ref}\nAmount: KES ${amount.toLocaleString()}\n` +
            `Period: ${periodLabel}\nRisk score: ${riskScore}/100\n\n` +
            `You will receive an SMS update. / Utapata SMS kwa taarifa.`
          )
        }

        await sendSMS(normalizedPhone,
          `KilimoAI: Thank you for applying. Unfortunately, your loan was not approved at this time ` +
          `(score: ${riskScore}/100). Tips: try a smaller amount or larger farm size.`
        )
        return end(
          `Not approved / Haijakubaliwa.\nScore: ${riskScore}/100\n\n` +
          `Tips / Vidokezo:\n- Apply for a smaller amount\n- Increase farm size\n\n` +
          `Try again in 30 days. SMS sent with details.`
        )
      }
    }

    // ═══════════════════ 2. CHECK STATUS ═══════════════════
    if (mainChoice === '2') {
      const farmer = await findOrCreateFarmer(normalizedPhone)
      const application = await getLatestApplication(farmer.id)
      const activeLoan = await getActiveLoan(farmer.id)

      if (!application && !activeLoan) {
        return end(
          'No loan found / Hakuna mkopo.\n\n' +
          'Dial *384*53298# and choose 1 to apply.\nPiga *384*53298# chagua 1 kuomba.'
        )
      }

      if (activeLoan) {
        const overpaid = activeLoan.remainingBalance <= 0
        return end(
          `Active Loan / Mkopo Hai:\n\nRef: ${activeLoan.masumiRef || activeLoan.id.slice(-6)}\n` +
          `Amount: KES ${activeLoan.amount.toLocaleString()}\n` +
          `Balance: KES ${activeLoan.remainingBalance.toLocaleString()}\n` +
          `Status: ${overpaid ? 'PAID OFF / IMELIPWA' : 'ACTIVE / INAENDELEA'}\n\n` +
          `Dial 3 to repay. / Piga 3 kulipa.`
        )
      }

      if (!application) return end('No application found.')

      const statusMap: Record<string, string> = {
        pending: '⏳ Pending / Inasubiri',
        approved: '✓ Approved / Imekubaliwa',
        rejected: '✗ Declined / Imekataliwa',
        disbursed: '✓ Disbursed / Imetolewa',
      }

      return end(
        `Latest Application / Ombi:\n\n` +
        `Crop: ${application.crop || 'N/A'}\n` +
        `Amount: KES ${application.amount.toLocaleString()}\n` +
        `Status: ${statusMap[application.status] || application.status}\n` +
        `Date: ${application.date || 'N/A'}`
      )
    }

    // ═══════════════════ 3. REPAY LOAN ═══════════════════
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
          if (result.records.length === 0) {
            return end('Reference not found / Haikupatikana.')
          }
          const p = result.records[0].get('al').properties
          const balance = Number(p.remainingBalance || 0)
          if (balance <= 0) return end('This loan is already fully paid.')
          return con(
            `Loan: KES ${balance.toLocaleString()}\nRef: ${p.masumiRef || ref}\n\n` +
            `1. Pay via M-Pesa\n2. Cancel`
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
          const farmerPhone = result.records[0].get('farmerPhone') || ''
          const balance = Number(p.remainingBalance || 0)
          const loanId = p.id

          if (balance <= 0) return end('Loan is fully paid.')

          const mpesaRef = `USSD-${generateRef()}`

          // Attempt M-Pesa STK push
          let stkSent = false
          try {
            const masumiUrl = process.env.MASUMI_API_URL
            const masumiKey = process.env.MASUMI_API_KEY
            if (masumiUrl && masumiKey) {
              const res = await fetch(`${masumiUrl}/payments/initiate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${masumiKey}` },
                body: JSON.stringify({
                  phone: normalizePhone(farmerPhone || phoneNumber),
                  amount: balance,
                  reference: mpesaRef,
                  description: `KilimoAI USSD repayment ${ref}`,
                }),
              })
              stkSent = res.ok
            }
          } catch {}

          // Mark loan as repaid (webhook would confirm)
          await session.run(
            `MATCH (al:ActiveLoan {id: $loanId})
             SET al.totalPaid = al.totalPaid + al.remainingBalance,
                 al.remainingBalance = 0,
                 al.status = 'paid_off'
             CREATE (al)-[:HAS_PAYMENT]->(p:PaymentRecord {
               id: $mpesaRef, date: $today,
               amount: $balance, method: 'MPESA',
               mpesaRef: $mpesaRef
             })`,
            { loanId, mpesaRef, balance, today: new Date().toISOString().split('T')[0] }
          )

          const msg = stkSent
            ? 'M-Pesa prompt sent! Check your phone and enter PIN.\n' +
              `Ombi la M-Pesa limetumwa. Weka PIN.\n\nRef: ${ref}`
            : `Payment recorded. Ref: ${ref}\nMalipo yamehifadhiwa.`

          return end(msg)
        } finally {
          await session.close()
        }
      }
    }

    return end('Invalid option. Start again.\nChaguo si sahihi.')
  }

  const response = await handler()
  return new NextResponse(response, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'
import { sendVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, county, role, phone, crops } = await req.json()

    if (!name || !email || !password || !county || !role) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 })
    }

    const validRoles = ['farmer', 'agent', 'lender', 'buyer', 'admin']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 })
    }

    const session = getSession()
    const lowerEmail = email.toLowerCase()

    const existing = await session.run(
      'MATCH (u:User {email: $email}) RETURN u',
      { email: lowerEmail }
    )

    if (existing.records.length > 0) {
      await session.close()
      return NextResponse.json({ success: false, error: 'An account with this email already exists' }, { status: 409 })
    }

    const id = `u-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    const verificationToken = generateToken()

    // Create User node — verified=false means agent not verified, emailVerified=false means email not verified
    await session.run(
      `CREATE (u:User {
        id: $id, name: $name, email: $email,
        password: $password, verified: false,
        emailVerified: false,
        verificationToken: $verificationToken,
        createdAt: datetime()
      })
      WITH u
      MATCH (r:Role {name: $role})
      MATCH (co:County {name: $county})
      CREATE (u)-[:HAS_ROLE]->(r)
      CREATE (u)-[:LOCATED_IN]->(co)`,
      {
        id, name, email: lowerEmail, password, role, county, verificationToken,
      }
    )

    // Optional: link phone via Phone node
    if (phone) {
      await session.run(
        `MATCH (u:User {id: $id})
         MERGE (p:Phone {number: $phone})
         CREATE (u)-[:HAS_PHONE]->(p)`,
        { id, phone }
      )
    }

    // Optional: link crops via GROWS relationships
    if (crops && Array.isArray(crops) && crops.length > 0) {
      for (const crop of crops) {
        await session.run(
          `MATCH (u:User {id: $id})
           MATCH (c:Crop {name: $crop})
           MERGE (u)-[:GROWS]->(c)`,
          { id, crop }
        )
      }
    }

    // If farmer, auto-assign to agents in the same county
    if (role === 'farmer') {
      const agentResult = await session.run(
        `MATCH (agent:User)-[:HAS_ROLE]->(:Role {name: 'agent'})
         MATCH (agent)-[:LOCATED_IN]->(co:County {name: $county})
         RETURN agent
         ORDER BY agent.name`,
        { county }
      )

      for (const record of agentResult.records) {
        const agent = record.get('agent').properties
        await session.run(
          `MATCH (agent:User {id: $agentId}), (farmer:User {id: $farmerId})
           MERGE (agent)-[:SUPERVISES]->(farmer)`,
          { agentId: agent.id, farmerId: id }
        )
        // Notify each agent
        await session.run(
          `MATCH (agent:User {id: $agentId}), (farmer:User {id: $farmerId})
           CREATE (n:Notification {
             id: $notifId,
             userId: $agentId,
             type: 'new_farmer',
             title: 'New Farmer Registered',
             body: $notifBody,
             read: false,
             createdAt: datetime()
           })
           CREATE (agent)-[:HAS_NOTIFICATION]->(n)`,
          {
            agentId: agent.id,
            farmerId: id,
            notifId: `notif-signup-${id}-${agent.id}`,
            notifBody: `${name} has registered as a farmer in ${county}. Review and verify their information.`,
          }
        )
      }
    }

    await session.close()

    const emailSent = await sendVerificationEmail(lowerEmail, verificationToken)

    return NextResponse.json({
      success: true,
      message: emailSent
        ? 'Account created! Check your email to verify your account.'
        : 'Account created! Ask an admin to verify your account.',
      emailSent,
    })
  } catch (err: any) {
    console.error('[signup]', err.message || err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}

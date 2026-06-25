import { NextRequest, NextResponse } from 'next/server'
import { SYSTEM_PROMPT_EN, SYSTEM_PROMPT_SW, SYSTEM_PROMPT_GENERAL_EN, SYSTEM_PROMPT_GENERAL_SW } from '@/lib/prompts'
import { FarmerProfile, Language, ChatMode } from '@/lib/types'
import { getSession } from '@/lib/neo4j'
import { PEST_DISEASES } from '@/lib/pests'

interface ChatRequestBody {
  messages: { role: 'user' | 'assistant'; content: string }[]
  farmerProfile: FarmerProfile
  language: Language
  mode?: ChatMode
}

async function fetchNeo4jContext(crops: string[], county: string, language: Language): Promise<string> {
  const parts: string[] = []

  try {
    const session = getSession()

    // 1. Pest/disease data for farmer's crops
    const cropNames = crops.map(c => c.toLowerCase())
    const pestResult = await session.run(
      `MATCH (p)-[:AFFECTS]->(c:Crop)
       WHERE toLower(c.name) IN $crops
       RETURN p.name AS name, p.type AS type, p.symptoms AS symptoms,
              p.treatment AS treatment, p.prevention AS prevention, p.severity AS severity`,
      { crops: cropNames }
    )

    if (pestResult.records.length > 0) {
      const pestLines = pestResult.records.map(r => {
        const name = r.get('name')
        const type = r.get('type')
        const symptoms = r.get('symptoms')
        const treatment = r.get('treatment')
        const prevention = r.get('prevention')
        const severity = r.get('severity')
        return `- ${name} (${type}, severity: ${severity}): ${symptoms}. Treat: ${treatment}. Prevent: ${prevention}`
      })
      parts.push(`KNOWN PESTS & DISEASES FOR YOUR CROPS:\n${pestLines.join('\n')}`)
    }

    // 2. Weather data for the farmer's county
    const weatherResult = await session.run(
      `MATCH (w:WeatherRecord {county: $county})
       RETURN w ORDER BY w.fetchedAt DESC LIMIT 1`,
      { county }
    )

    if (weatherResult.records.length > 0) {
      const w = weatherResult.records[0].get('w').properties
      parts.push(
        `RECENT WEATHER DATA FOR ${county.toUpperCase()}:\n` +
        `- Rainfall: ${w.rainfallMm}mm over ${w.periodDays} days\n` +
        `- Season: ${w.season}\n` +
        `- Forecast: ${w.forecastLabel}\n` +
        `- Adequacy: ${w.adequacyPct}%`
      )
    }

    await session.close()
  } catch {
    // Neo4j unavailable — use static pest data as fallback
  }

  // Fallback: static pest data relevant to farmer's crops
  if (parts.length === 0) {
    const relevant = PEST_DISEASES.filter(d =>
      crops.some(c => c.toLowerCase() === d.crop.toLowerCase())
    )
    if (relevant.length > 0) {
      const lines = relevant.map(d =>
        `- ${d.disease} (${d.type}, severity: ${d.severity}): ${d.symptoms}. Treat: ${d.treatment}. Prevent: ${d.prevention}`
      )
      parts.push(`KNOWN PESTS & DISEASES FOR YOUR CROPS:\n${lines.join('\n')}`)
    }
  }

  return parts.join('\n\n')
}

export async function POST(req: NextRequest) {
  try {
    const { messages, farmerProfile, language, mode = 'assessment' } = (await req.json()) as ChatRequestBody

    const apiKey = process.env.FEATHERLESS_API_KEY

    if (!apiKey) {
      const offlineReply = language === 'sw'
        ? 'Samahani, bado siwezi kujibu kwa sababu nyonga ya API haijawekwa. Mwasiliane na timu ya Kilimo AI ili kuanzisha huduma hii.'
        : 'I\'m not fully configured yet. The AI assistant needs an API key to work. Please contact the Kilimo AI team to set this up.'
      return NextResponse.json({ message: offlineReply })
    }

    const baseUrl = process.env.FEATHERLESS_BASE_URL || 'https://api.featherless.ai/v1'
    const model = process.env.FEATHERLESS_MODEL || 'deepseek-ai/DeepSeek-V4-Pro'
    const url = `${baseUrl}/chat/completions`

    const isGeneral = mode === 'general'
    let systemPrompt = isGeneral
      ? (language === 'sw' ? SYSTEM_PROMPT_GENERAL_SW : SYSTEM_PROMPT_GENERAL_EN)
      : (language === 'sw' ? SYSTEM_PROMPT_SW : SYSTEM_PROMPT_EN)

    // Fetch context from Neo4j (pest data, weather) and append to system prompt
    const dbContext = await fetchNeo4jContext(
      farmerProfile.crops.map(c => c.crop),
      farmerProfile.county,
      language
    )
    if (dbContext) {
      systemPrompt += `\n\n${dbContext}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `FARMER PROFILE (use this context for all responses):
- Name: ${farmerProfile.name}
- County: ${farmerProfile.county}
- Crops: ${farmerProfile.crops.map(c => `${c.crop} ${c.acres} acres${c.isRented ? ` (rented, KES ${c.rentPerAcre || farmerProfile.rentCostPerAcre || 0}/acre)` : ''}`).join(', ')}
- Total acres: ${farmerProfile.crops.reduce((s, c) => s + c.acres, 0)}
- Rented acres: ${farmerProfile.rentedAcres || 0}
- Rent cost per acre: KES ${farmerProfile.rentCostPerAcre || 0}
- Phone: ${farmerProfile.phone || 'Not provided'}
- Language: ${language}

Use this profile to personalize your responses. You already know the farmer's details — do NOT ask them again unless something is genuinely missing.`,
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `API error ${response.status}: ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const assistantMessage = data.choices?.[0]?.message?.content

    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'No response from AI model' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: assistantMessage })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `API error: ${message}` }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

const SYSTEM_PROMPT = `You are KilimoPest, a specialized agricultural AI that identifies crop pests and diseases from images.

Analyze the uploaded crop photo carefully. Look for visible signs of pest damage, insect presence, fungal growth, discoloration, leaf holes, wilting, or any abnormal patterns.

Return a JSON object with these fields:
- "pest": The name of the identified pest or disease (e.g., "Fall Armyworm", "Leaf Rust", "Aphids")
- "confidence": A number 0-100 representing your confidence in the identification
- "recommendation": A practical treatment recommendation using locally available solutions in East Africa. Be specific about application rates.
- "severity": Either "LOW", "MEDIUM", or "HIGH" based on the visible damage level

If you cannot identify a pest or disease from the image, set:
- "pest": "Unknown"
- "confidence": 0
- "recommendation": "Unable to identify from this image. Please take a closer, well-lit photo of the affected area."
- "severity": "UNKNOWN"

Respond ONLY with the JSON object, no other text.`

export async function POST(req: NextRequest) {
  try {
    const { image } = (await req.json()) as { image: string }

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const apiKey = process.env.FEATHERLESS_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured. Set FEATHERLESS_API_KEY in .env' },
        { status: 500 }
      )
    }

    const baseUrl = process.env.FEATHERLESS_BASE_URL || 'https://api.featherless.ai/v1'
    const model = process.env.FEATHERLESS_VISION_MODEL || 'Qwen/Qwen3-VL-8B-Instruct'
    const url = `${baseUrl}/chat/completions`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Identify the pest or disease affecting this crop.' },
              { type: 'image_url', image_url: { url: image } },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 512,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()

      if (/does not support image/i.test(errorText)) {
        return NextResponse.json(
          { error: `Model "${model}" does not support image input. Set FEATHERLESS_VISION_MODEL to a vision-capable model (e.g. meta-llama/Llama-3.2-11B-Vision-Instruct).` },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: `API error ${response.status}: ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const raw = data.choices?.[0]?.message?.content

    if (!raw) {
      return NextResponse.json({ error: 'No response from vision model' }, { status: 500 })
    }

    // Extract JSON from response (model might wrap it in markdown code fences)
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse pest detection result' }, { status: 500 })
    }

    const result = JSON.parse(jsonMatch[0])

    const pest = result.pest || 'Unknown'
    const confidence = result.confidence ?? 0
    const recommendation = result.recommendation || 'No recommendation available.'
    const severity = (['LOW', 'MEDIUM', 'HIGH'].includes(result.severity) ? result.severity : 'UNKNOWN') as 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'

    // Save to Neo4j
    try {
      const neoSession = getSession()
      const id = `ps-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      const date = new Date().toISOString()
      await neoSession.run(
        `CREATE (s:PestScan {
          id: $id,
          pest: $pest,
          confidence: $confidence,
          recommendation: $recommendation,
          severity: $severity,
          date: $date,
          createdAt: datetime()
        })`,
        { id, pest, confidence, recommendation, severity, date }
      )
      await neoSession.close()
    } catch (neoErr: any) {
      console.error('[pest-check Neo4j save]', neoErr.message || neoErr)
    }

    return NextResponse.json({
      pest,
      confidence,
      recommendation,
      severity,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `API error: ${message}` }, { status: 500 })
  }
}

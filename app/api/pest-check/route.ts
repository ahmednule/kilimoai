import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

const SYSTEM_PROMPT = `You are KilimoPest, a specialized agricultural AI that identifies crop pests and diseases from images.

Analyze the uploaded crop photo carefully. Look for visible signs of pest damage, insect presence, fungal growth, discoloration, leaf holes, wilting, or any abnormal patterns.

Return a JSON object with these fields:
- "pest": The name of the identified pest or disease (e.g., "Fall Armyworm", "Leaf Rust", "Aphids")
- "confidence": A number 0-100 representing your confidence in the identification
- "recommendation": A practical treatment recommendation using locally available solutions in East Africa. Be specific about application rates.
- "severity": Either "LOW", "MEDIUM", or "HIGH" based on the visible damage level
- "isPest": true if this is an insect/animal pest, false if it is a disease/nutrient deficiency
- "commonName": The common local name if different from the pest name, or null
- "scientificName": The scientific/Latin name of the pest or disease if known, or null
- "affectedCrops": An array of crop names this pest commonly affects (e.g., ["maize", "sorghum"])

If you cannot identify a pest or disease from the image, set:
- "pest": "Unknown"
- "confidence": 0
- "recommendation": "Unable to identify from this image. Please take a closer, well-lit photo of the affected area."
- "severity": "UNKNOWN"
- "isPest": false
- "affectedCrops": []

Respond ONLY with the JSON object, no other text.`

export async function POST(req: NextRequest) {
  try {
    const { image, source } = (await req.json()) as { image: string; source?: string }

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const apiKey = process.env.FEATHERLESS_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        pest: 'Demo Mode',
        confidence: 0,
        recommendation: 'Pest scanning is not configured. To enable it, set the FEATHERLESS_API_KEY environment variable. In the meantime, describe the symptoms in the chat and I can help identify common pests.',
        severity: 'UNKNOWN',
        isPest: false,
        affectedCrops: [],
        source: 'anonymous',
      })
    }

    const baseUrl = process.env.FEATHERLESS_BASE_URL || 'https://api.featherless.ai/v1'
    const model = process.env.FEATHERLESS_VISION_MODEL || 'meta-llama/Llama-3.2-11B-Vision-Instruct'
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

      if (/does not support image|cannot read/i.test(errorText)) {
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

    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse pest detection result' }, { status: 500 })
    }

    const result = JSON.parse(jsonMatch[0])

    const pest = result.pest || 'Unknown'
    const confidence = result.confidence ?? 0
    const recommendation = result.recommendation || 'No recommendation available.'
    const severity = (['LOW', 'MEDIUM', 'HIGH'].includes(result.severity) ? result.severity : 'UNKNOWN') as 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'
    const isPest = result.isPest ?? (severity === 'HIGH' || severity === 'MEDIUM')
    const affectedCrops = Array.isArray(result.affectedCrops) ? result.affectedCrops : []
    const commonName = result.commonName || null
    const scientificName = result.scientificName || null

    const scanSource = source === 'authenticated' ? 'authenticated' : 'anonymous'

    try {
      const neoSession = getSession()
      const id = `ps-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      const date = new Date().toISOString()
      const cropName = affectedCrops.length > 0 ? affectedCrops[0].toLowerCase() : null

      // Link scan to matching Pest/Disease node and affected Crop
      await neoSession.run(
        `CREATE (s:PestScan {
          id: $id, pest: $pest, confidence: $confidence,
          recommendation: $recommendation, severity: $severity,
          isPest: $isPest, source: $source, date: $date,
          createdAt: datetime()
        })
        WITH s
        OPTIONAL MATCH (pd) WHERE pd.name = $pest AND (pd:Pest OR pd:Disease)
        FOREACH (_ IN CASE WHEN pd IS NOT NULL THEN [1] ELSE [] END |
          MERGE (s)-[:IDENTIFIED_AS]->(pd)
        )
        ${cropName ? `
        OPTIONAL MATCH (c:Crop {name: $cropName})
        FOREACH (_ IN CASE WHEN c IS NOT NULL THEN [1] ELSE [] END |
          MERGE (s)-[:ON_CROP]->(c)
        )` : ''}`,
        { id, pest, confidence, recommendation, severity, isPest, source: scanSource, date, cropName }
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
      isPest,
      affectedCrops,
      commonName,
      scientificName,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `API error: ${message}` }, { status: 500 })
  }
}

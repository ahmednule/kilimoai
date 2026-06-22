import { NextRequest, NextResponse } from 'next/server'
import { SYSTEM_PROMPT_EN, SYSTEM_PROMPT_SW, SYSTEM_PROMPT_GENERAL_EN, SYSTEM_PROMPT_GENERAL_SW } from '@/lib/prompts'
import { FarmerProfile, Language, ChatMode } from '@/lib/types'

interface ChatRequestBody {
  messages: { role: 'user' | 'assistant'; content: string }[]
  farmerProfile: FarmerProfile
  language: Language
  mode?: ChatMode
}

export async function POST(req: NextRequest) {
  try {
    const { messages, farmerProfile, language, mode = 'assessment' } = (await req.json()) as ChatRequestBody

    const apiKey = process.env.FEATHERLESS_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured. Set FEATHERLESS_API_KEY in .env' },
        { status: 500 }
      )
    }

    const baseUrl = process.env.FEATHERLESS_BASE_URL || 'https://api.featherless.ai/v1'
    const model = process.env.FEATHERLESS_MODEL || 'deepseek-ai/DeepSeek-V4-Pro'
    const url = `${baseUrl}/chat/completions`

    const isGeneral = mode === 'general'
    const systemPrompt = isGeneral
      ? (language === 'sw' ? SYSTEM_PROMPT_GENERAL_SW : SYSTEM_PROMPT_GENERAL_EN)
      : (language === 'sw' ? SYSTEM_PROMPT_SW : SYSTEM_PROMPT_EN)

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
- Crops: ${farmerProfile.crops.map(c => `${c.crop} ${c.acres} acres${c.isRented ? ' (rented)' : ''}`).join(', ')}
- Total acres: ${farmerProfile.crops.reduce((s, c) => s + c.acres, 0)}
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
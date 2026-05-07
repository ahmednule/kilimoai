import { NextRequest, NextResponse } from 'next/server'
import { SYSTEM_PROMPT_EN, SYSTEM_PROMPT_SW } from '@/lib/prompts'
import { FarmerProfile, Language, ScenarioResult } from '@/lib/types'

interface ChatRequestBody {
  messages: { role: 'user' | 'assistant'; content: string }[]
  farmerProfile: FarmerProfile
  language: Language
}

export async function POST(req: NextRequest) {
  try {
    const { messages, farmerProfile, language } = (await req.json()) as ChatRequestBody

    const apiKey = process.env.FEATHERLESS_API_KEY

    if (!apiKey) {
      // Return a mock response for development/demo without API key
      return NextResponse.json({
        reply: language === 'sw'
          ? `Asante ${farmerProfile.name}! Naona unapanga kulima ${farmerProfile.crop} kwenye ekari ${farmerProfile.acres} huko ${farmerProfile.county}. Tafadhali niambie kiasi unachohitaji kukopa ili nikusaidie kufanya tathmini kamili.`
          : `Thank you ${farmerProfile.name}! I see you're planning to grow ${farmerProfile.crop} on ${farmerProfile.acres} acres in ${farmerProfile.county}. Please tell me how much you need to borrow so I can help you with a complete assessment.`,
        scenarios: null
      })
    }

    const systemPrompt = language === 'sw' ? SYSTEM_PROMPT_SW : SYSTEM_PROMPT_EN

    const response = await fetch('https://api.featherless.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `My profile: Name: ${farmerProfile.name}, County: ${farmerProfile.county}, Crop: ${farmerProfile.crop}, Acres: ${farmerProfile.acres}`
          },
          {
            role: 'assistant',
            content: language === 'sw'
              ? `Asante ${farmerProfile.name}! Niko tayari kukusaidia kufanya uamuzi sahihi kuhusu mkopo wako wa kilimo.`
              : `Thank you ${farmerProfile.name}! I'm ready to help you make the right decision about your farm loan.`
          },
          ...messages
        ],
        max_tokens: 1024,
        temperature: 0.3,
        stream: false
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Featherless API error:', errorText)
      throw new Error(`Featherless API error: ${response.status}`)
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || ''

    // Try to parse scenario data if present in structured format
    let scenarios: ScenarioResult | null = null
    const jsonMatch = reply.match(/```json\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      try {
        scenarios = JSON.parse(jsonMatch[1]) as ScenarioResult
      } catch (e) {
        console.error('Failed to parse scenarios JSON:', e)
      }
    }

    // Remove JSON block from reply text
    const cleanReply = reply.replace(/```json\n[\s\S]*?\n```/g, '').trim()

    return NextResponse.json({
      reply: cleanReply,
      scenarios
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}

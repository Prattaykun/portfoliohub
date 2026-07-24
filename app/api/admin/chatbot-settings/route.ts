// app/api/admin/chatbot-settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  CHATBOT_MODEL_CATALOG,
  CHATBOT_PROVIDERS,
  isChatbotProvider,
  isValidChatbotModel,
} from '@/lib/chatbotModels'
import { getChatbotConfig, upsertChatbotConfig } from '@/lib/server/getChatbotConfig'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function requireAdmin(req: NextRequest): NextResponse | null {
  const token = req.cookies.get('portfoliohub_admin_token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function GET(req: NextRequest) {
  const authError = requireAdmin(req)
  if (authError) return authError

  try {
    const config = await getChatbotConfig(supabaseAdmin)

    const { data: row } = await supabaseAdmin
      .from('chatbot_config')
      .select('id, provider, model, updated_at')
      .eq('id', 1)
      .maybeSingle()

    return NextResponse.json({
      success: true,
      config,
      updated_at: row?.updated_at || null,
      providers: CHATBOT_PROVIDERS,
      models: CHATBOT_MODEL_CATALOG,
    })
  } catch (err: any) {
    console.error('Chatbot settings GET error:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to load chatbot settings' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const authError = requireAdmin(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const { provider, model } = body as { provider?: string; model?: string }

    if (!isChatbotProvider(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Use groq, gemini, or vertex-ai.' },
        { status: 400 }
      )
    }

    if (!model || typeof model !== 'string' || !isValidChatbotModel(provider, model)) {
      return NextResponse.json(
        { error: `Invalid model for provider "${provider}".` },
        { status: 400 }
      )
    }

    const { data, error } = await upsertChatbotConfig({ provider, model }, supabaseAdmin)

    if (error) {
      console.error('Chatbot settings upsert error:', error)
      return NextResponse.json(
        {
          error: 'Failed to save chatbot settings',
          details: error.message,
          hint: 'Run supabase/chatbot_config.sql in the Supabase SQL editor if the table is missing.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Chatbot AI settings saved',
      config: { provider: data.provider, model: data.model },
      updated_at: data.updated_at,
    })
  } catch (err: any) {
    console.error('Chatbot settings POST error:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to save chatbot settings' },
      { status: 500 }
    )
  }
}

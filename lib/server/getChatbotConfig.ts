import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  DEFAULT_CHATBOT_CONFIG,
  normalizeChatbotConfig,
  type ChatbotConfig,
} from '@/lib/chatbotModels'

function getServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getChatbotConfig(
  supabaseAdmin?: SupabaseClient
): Promise<ChatbotConfig> {
  const client = supabaseAdmin || getServiceClient()

  const { data, error } = await client
    .from('chatbot_config')
    .select('provider, model')
    .eq('id', 1)
    .maybeSingle()

  if (error) {
    console.warn('Failed to load chatbot_config, using default:', error.message)
    return DEFAULT_CHATBOT_CONFIG
  }

  if (!data) return DEFAULT_CHATBOT_CONFIG

  return normalizeChatbotConfig(data.provider, data.model)
}

export async function upsertChatbotConfig(
  config: ChatbotConfig,
  supabaseAdmin?: SupabaseClient
) {
  const client = supabaseAdmin || getServiceClient()
  const normalized = normalizeChatbotConfig(config.provider, config.model)

  return client
    .from('chatbot_config')
    .upsert(
      {
        id: 1,
        provider: normalized.provider,
        model: normalized.model,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select('id, provider, model, updated_at')
    .single()
}

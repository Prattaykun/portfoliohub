export type ChatbotProvider = 'groq' | 'gemini' | 'vertex-ai'

export type ChatbotConfig = {
  provider: ChatbotProvider
  model: string
}

export const DEFAULT_CHATBOT_CONFIG: ChatbotConfig = {
  provider: 'groq',
  model: 'llama-3.3-70b-versatile',
}

export const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
] as const

export const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash-lite',
  'gemini-2.0-pro-exp',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
] as const

export const VERTEX_AI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
] as const

export const CHATBOT_MODEL_CATALOG: Record<ChatbotProvider, readonly string[]> = {
  groq: GROQ_MODELS,
  gemini: GEMINI_MODELS,
  'vertex-ai': VERTEX_AI_MODELS,
}

export const CHATBOT_PROVIDERS: { id: ChatbotProvider; label: string }[] = [
  { id: 'groq', label: 'Groq' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'vertex-ai', label: 'Vertex AI' },
]

export function isChatbotProvider(value: unknown): value is ChatbotProvider {
  return value === 'groq' || value === 'gemini' || value === 'vertex-ai'
}

export function isValidChatbotModel(provider: ChatbotProvider, model: string): boolean {
  return (CHATBOT_MODEL_CATALOG[provider] as readonly string[]).includes(model)
}

export function normalizeChatbotConfig(
  provider?: string | null,
  model?: string | null
): ChatbotConfig {
  const nextProvider = isChatbotProvider(provider) ? provider : DEFAULT_CHATBOT_CONFIG.provider
  const catalog = CHATBOT_MODEL_CATALOG[nextProvider]
  const nextModel =
    model && (catalog as readonly string[]).includes(model)
      ? model
      : catalog[0] || DEFAULT_CHATBOT_CONFIG.model

  return { provider: nextProvider, model: nextModel }
}

/** Preferred provider first, then the others — for fallback chains. */
export function providerFallbackOrder(preferred: ChatbotProvider): ChatbotProvider[] {
  const rest = (['groq', 'gemini', 'vertex-ai'] as ChatbotProvider[]).filter((p) => p !== preferred)
  return [preferred, ...rest]
}

/** Preferred model first within a provider catalog. */
export function modelFallbackOrder(provider: ChatbotProvider, preferredModel: string): string[] {
  const catalog = [...CHATBOT_MODEL_CATALOG[provider]]
  if (!catalog.includes(preferredModel)) return catalog
  return [preferredModel, ...catalog.filter((m) => m !== preferredModel)]
}

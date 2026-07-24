import type { SupabaseClient } from '@supabase/supabase-js'

export type ActiveDocumentType = 'resume' | 'cv'

type UpsertParams = {
  userId: string
  resumeUrl?: string | null
  cvUrl?: string | null
  activeDocument?: ActiveDocumentType | null
}

function nonEmpty(value?: string | null): string | null {
  if (typeof value === 'string' && value.trim() !== '') return value.trim()
  return null
}

/**
 * Persist resume_url / cv_url (and optionally active_document) without wiping
 * the other URL. Retries without active_document if that column is missing.
 */
export async function upsertResumeDocument(
  supabaseAdmin: SupabaseClient,
  { userId, resumeUrl, cvUrl, activeDocument }: UpsertParams
) {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('resumes')
    .select('*')
    .eq('auth_user_id', userId)
    .maybeSingle()

  if (fetchError) {
    return { data: null, error: fetchError }
  }

  const nextResumeUrl = nonEmpty(resumeUrl) ?? existing?.resume_url ?? null
  const nextCvUrl = nonEmpty(cvUrl) ?? existing?.cv_url ?? null
  const nextActive =
    activeDocument === 'resume' || activeDocument === 'cv'
      ? activeDocument
      : existing?.active_document || 'resume'

  const basePayload = {
    auth_user_id: userId,
    resume_url: nextResumeUrl,
    cv_url: nextCvUrl,
    updated_at: new Date().toISOString(),
  }

  const withActive = {
    ...basePayload,
    active_document: nextActive,
  }

  let result = await supabaseAdmin
    .from('resumes')
    .upsert(withActive, { onConflict: 'auth_user_id' })
    .select()
    .single()

  // Schema may not have active_document yet — still persist both URLs.
  if (result.error && /active_document/i.test(result.error.message || '')) {
    console.warn(
      'active_document column missing on resumes; saving URLs only. Add: ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS active_document text DEFAULT \'resume\';'
    )
    result = await supabaseAdmin
      .from('resumes')
      .upsert(basePayload, { onConflict: 'auth_user_id' })
      .select()
      .single()
  }

  return result
}

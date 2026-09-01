import type { SupabaseClient } from '@supabase/supabase-js'

/** Resolve public portfolio username from auth user id. */
export async function resolveUsername(
  supabaseAdmin: SupabaseClient,
  userId: string | null | undefined
): Promise<string | null> {
  if (!userId) return null

  const { data, error } = await supabaseAdmin
    .from('users_usernames')
    .select('username')
    .eq('auth_user_id', userId)
    .maybeSingle()

  if (error) {
    console.warn('Failed to resolve username for portfolio link:', error.message)
    return null
  }

  return data?.username?.trim() || null
}

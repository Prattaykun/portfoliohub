// lib/supabaseServer.ts
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export function createServerSupabaseClient() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value
        },
        set() {
          // Next.js 'cookies()' is read-only in server components
          // No-op to satisfy Supabase SSR API
        },
        remove() {
          // Same as above — read-only context, so do nothing
        },
      },
    }
  )

  return supabase
}

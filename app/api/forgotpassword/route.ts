// app/api/forgotpassword/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(url, serviceKey)

export async function POST(req: Request) {
  const { identifier } = await req.json()
  if (!identifier) return NextResponse.json({ error: 'missing identifier' }, { status: 400 })

  try {
    let email = identifier
    if (!identifier.includes('@')) {
      // resolve username -> email
      const { data, error } = await supabaseAdmin
        .from('users_usernames')
        .select('email')
        .eq('username', identifier)
        .limit(1)
        .single()

      if (error || !data?.email) {
        return NextResponse.json({ error: 'Email not found for provided username' }, { status: 404 })
      }
      email = data.email
    }

    // trigger password reset email
    // Note: Supabase client method names may differ between versions; adjust if needed.
    const { data, error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/auth/reset-password`,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Password reset email sent (if account exists).' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'error' }, { status: 500 })
  }
}

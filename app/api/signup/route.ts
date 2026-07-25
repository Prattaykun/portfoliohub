// app/api/signup/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isReservedUsername, getUsernameValidationError } from '@/lib/reservedUsernames'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(url, serviceKey)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { uid, username = null, email = null } = body

    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 })
    }

    if (username) {
      const valErr = getUsernameValidationError(username)
      if (valErr) {
        return NextResponse.json({ error: valErr }, { status: 400 })
      }
    }

    // Build payload — never update username
    const payload: Record<string, any> = {
      auth_user_id: uid,
      updated_at: new Date().toISOString(),
    }

    if (email) payload.email = email

    // Insert username only if this is a new row
    if (username) payload.username = username

    const { data, error } = await supabaseAdmin
      .from('users_usernames')
      .upsert(payload, {
        onConflict: 'auth_user_id',
        ignoreDuplicates: true, // ensures username is not overwritten
      })
      .select()

    if (error) {
      return NextResponse.json({ error: 'Unexpected server error, If you already have an account through other providers, please log in or try reset password to set new password for the same email.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Unexpected server error, If you already have an account through other providers, please log in or try reset password to set new password for the same email.' },
      { status: 500 }
    )
  }
}

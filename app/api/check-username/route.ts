// app/api/check-username/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(url, serviceKey)

export async function POST(req: Request) {
  const { username } = await req.json()
  if (!username) return NextResponse.json({ error: 'missing username' }, { status: 400 })

  try {
    const { data, error } = await supabaseAdmin
      .from('users_usernames')
      .select('auth_user_id')
      .eq('username', username)
      .limit(1)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const available = !data || data.length === 0
    return NextResponse.json({ available })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'error' }, { status: 500 })
  }
}

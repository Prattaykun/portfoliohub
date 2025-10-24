// app/api/login/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(url, serviceKey)

export async function POST(req: Request) {
  try {
    const { identifier } = await req.json()

    if (!identifier) {
      return NextResponse.json({ error: 'Missing identifier' }, { status: 400 })
    }

    // ✅ If identifier contains '@', treat as email directly
    if (identifier.includes('@')) {
      return NextResponse.json({ email: identifier })
    }

    // ✅ Otherwise, treat as username and look up the corresponding email
    const { data, error } = await supabaseAdmin
      .from('users_usernames')
      .select('email')
      .eq('username', identifier)
      .maybeSingle() // ✅ more robust than single() — avoids throwing if not found

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Database query failed' },
        { status: 500 }
      )
    }

    if (!data || !data.email) {
      return NextResponse.json(
        { error: 'No account found for this username' },
        { status: 404 }
      )
    }

    return NextResponse.json({ email: data.email })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unexpected server error' },
      { status: 500 }
    )
  }
}

// ✅ Optional: mark for Edge runtime if deployed on Vercel
export const runtime = 'edge'

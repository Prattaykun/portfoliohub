// app/api/forgotpassword/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(url, serviceKey)

export async function POST(req: Request) {
  const { identifier } = await req.json()
  
  if (!identifier) {
    return NextResponse.json({ error: 'Email or username is required' }, { status: 400 })
  }

  try {
    let email = identifier
    
    // If identifier doesn't look like an email, treat it as username
    if (!identifier.includes('@')) {
      console.log('Looking up email for username:', identifier)
      
      const { data, error } = await supabaseAdmin
        .from('users_usernames')
        .select('email')
        .eq('username', identifier.toLowerCase().trim())
        .limit(1)
        .single()

      if (error || !data?.email) {
        console.log('Username not found:', identifier)
        // Don't reveal whether username exists for security
        return NextResponse.json({ 
          message: 'If an account exists with this email or username, a password reset email has been sent.' 
        })
      }
      
      email = data.email
      console.log('Found email for username:', email)
    }

    console.log('Sending password reset email to:', email)

    // Trigger password reset email
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    })

    if (error) {
      console.error('Error sending reset email:', error)
      // Still return success for security (don't reveal if email exists)
      return NextResponse.json({ 
        message: 'If an account exists with this email or username, a password reset email has been sent.' 
      })
    }

    console.log('Password reset email sent successfully to:', email)
    
    return NextResponse.json({ 
      message: 'If an account exists with this email or username, a password reset email has been sent.' 
    })
    
  } catch (err: any) {
    console.error('Unexpected error in forgot password:', err)
    return NextResponse.json({ 
      message: 'If an account exists with this email or username, a password reset email has been sent.' 
    })
  }
}
// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const ADMIN_EMAIL = 'admin@portfoliohub.eu.cc'
    const ADMIN_PASSWORD = 'jjk123'

    if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      // In production/local, generate a secret admin session token
      const token = Buffer.from(`admin_session_${Date.now()}_${Math.random()}`).toString('base64')
      
      const response = NextResponse.json({
        success: true,
        message: 'Admin authenticated successfully',
        user: {
          email: ADMIN_EMAIL,
          role: 'admin',
        },
        token,
      })

      // Set HTTP-only cookie for secure admin session
      response.cookies.set('portfoliohub_admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      })

      return response
    }

    return NextResponse.json(
      { error: 'Invalid admin credentials' },
      { status: 401 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Server error during admin authentication' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('portfoliohub_admin_token')?.value

  if (token) {
    return NextResponse.json({ authenticated: true, role: 'admin' })
  }

  return NextResponse.json({ authenticated: false }, { status: 401 })
}

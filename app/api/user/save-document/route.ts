// app/api/user/save-document/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { upsertResumeDocument } from '@/lib/server/upsertResumeDocument'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(url, serviceKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('resumes')
      .select('*')
      .eq('auth_user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching documents from database:', error)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data || { auth_user_id: userId, resume_url: null, cv_url: null, active_document: 'resume' },
    })
  } catch (err: any) {
    console.error('Fetch document API exception:', err)
    return NextResponse.json({ error: err?.message || 'Server error fetching document' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      resumeUrl,
      cvUrl,
      activeDocument,
    }: {
      userId: string
      resumeUrl?: string | null
      cvUrl?: string | null
      activeDocument?: 'resume' | 'cv'
    } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const { data, error } = await upsertResumeDocument(supabaseAdmin, {
      userId,
      resumeUrl,
      cvUrl,
      activeDocument,
    })

    if (error) {
      console.error('Error saving document to database:', error)
      return NextResponse.json(
        { error: 'Database save failed', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Document URLs saved successfully',
      data,
    })
  } catch (err: any) {
    console.error('Save document API exception:', err)
    return NextResponse.json(
      { error: err?.message || 'Server error saving document' },
      { status: 500 }
    )
  }
}

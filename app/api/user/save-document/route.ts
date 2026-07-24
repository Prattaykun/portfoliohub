// app/api/user/save-document/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(url, serviceKey)

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

    // Fetch existing record to avoid overwriting non-null fields
    const { data: existingRecord } = await supabaseAdmin
      .from('resumes')
      .select('*')
      .eq('auth_user_id', userId)
      .maybeSingle()

    const updatePayload: Record<string, any> = {
      auth_user_id: userId,
      updated_at: new Date().toISOString(),
    }

    // Set or preserve resume_url
    if (resumeUrl !== undefined) {
      updatePayload.resume_url = resumeUrl
    } else if (existingRecord?.resume_url) {
      updatePayload.resume_url = existingRecord.resume_url
    }

    // Set or preserve cv_url
    if (cvUrl !== undefined) {
      updatePayload.cv_url = cvUrl
    } else if (existingRecord?.cv_url) {
      updatePayload.cv_url = existingRecord.cv_url
    }

    // Set or preserve active_document
    if (activeDocument !== undefined) {
      updatePayload.active_document = activeDocument
    } else if (existingRecord?.active_document) {
      updatePayload.active_document = existingRecord.active_document
    } else {
      updatePayload.active_document = 'resume'
    }

    const { data, error } = await supabaseAdmin
      .from('resumes')
      .upsert(updatePayload)
      .select()
      .single()

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

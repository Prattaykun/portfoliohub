// app/api/user/active-document/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { ActiveDocumentType } from '@/lib/cvTemplates'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(url, serviceKey)

export async function POST(request: NextRequest) {
  try {
    const { userId, activeDocument }: { userId: string; activeDocument: ActiveDocumentType } = await request.json()

    if (!userId || !['resume', 'cv'].includes(activeDocument)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    // Fetch existing record to preserve urls
    const { data: existingRecord } = await supabaseAdmin
      .from('resumes')
      .select('*')
      .eq('auth_user_id', userId)
      .maybeSingle()

    const { error } = await supabaseAdmin
      .from('resumes')
      .upsert({
        auth_user_id: userId,
        resume_url: existingRecord?.resume_url || null,
        cv_url: existingRecord?.cv_url || null,
        active_document: activeDocument,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Active document update error:', error)
      return NextResponse.json({ error: 'Failed to update active document' }, { status: 500 })
    }

    return NextResponse.json({ success: true, activeDocument })
  } catch (error) {
    console.error('Active document API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

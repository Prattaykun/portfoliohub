// app/api/user/active-document/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { ActiveDocumentType } from '@/lib/cvTemplates'
import { upsertResumeDocument } from '@/lib/server/upsertResumeDocument'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(url, serviceKey)

export async function POST(request: NextRequest) {
  try {
    const { userId, activeDocument }: { userId: string; activeDocument: ActiveDocumentType } = await request.json()

    if (!userId || !['resume', 'cv'].includes(activeDocument)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const { error } = await upsertResumeDocument(supabaseAdmin, {
      userId,
      activeDocument,
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

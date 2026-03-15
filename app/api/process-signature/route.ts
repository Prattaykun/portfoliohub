// app/api/process-signature/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { processSignature as processSignatureAsset } from '@/lib/server/processSignature'

export async function POST(request: NextRequest) {
  try {
    const { signatureUrl } = await request.json()

    if (!signatureUrl) {
      return NextResponse.json(
        { error: 'Signature URL is required' },
        { status: 400 }
      )
    }

    // Upload and process signature with background removal
    const processedSignatureUrl = await processSignature(signatureUrl)

    return NextResponse.json({ 
      processedSignatureUrl,
      message: 'Signature processed successfully'
    })
  } catch (error) {
    console.error('Signature processing error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process signature',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function processSignature(signatureUrl: string): Promise<string> {
  return processSignatureAsset(signatureUrl)
}
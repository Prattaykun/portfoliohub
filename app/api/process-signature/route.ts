// app/api/process-signature/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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
  return new Promise((resolve, reject) => {
    // Upload the signature image with background removal
    cloudinary.uploader.upload(
      signatureUrl,
      {
        resource_type: 'image',
        folder: 'signatures',
        public_id: `signature_${Date.now()}`,
        transformation: [
          {
            effect: 'remove_background',
          },
          {
            width: 300,
            height: 100,
            crop: 'fit',
          },
          {
            format: 'png',
            quality: 'auto',
          }
        ]
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary signature upload error:', error)
          reject(error)
        } else {
          resolve(result?.secure_url || '')
        }
      }
    )
  })
}
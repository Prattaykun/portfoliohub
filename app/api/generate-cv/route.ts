// app/api/generate-cv/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { createClient } from '@supabase/supabase-js'
import { processSignature } from '@/lib/server/processSignature'
import { generateCVTemplateHTML } from '@/lib/server/cvTemplates'
import { filterResumeData } from '@/lib/server/filterResumeData'
import { upsertResumeDocument } from '@/lib/server/upsertResumeDocument'
import { defaultCVSectionToggles } from '@/lib/cvTemplates'
import type { CVTemplateId, CVSectionToggles } from '@/lib/cvTemplates'
import type { SelectedItems } from '@/lib/resumeTemplates'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Configure Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, serviceKey)

interface RequestPayload {
  userId?: string
  template?: CVTemplateId
  sections?: CVSectionToggles
  selectedItems?: SelectedItems
  profile: any
  about: any
  skills: any
  projects: any
  contact: any
  langint: any
  certificates?: any[]
}

async function generatePDFWithBrowserless(htmlContent: string): Promise<Buffer> {
  const BROWSERLESS_API_KEY = process.env.NEXT_PUBLIC_BROWSERLESS_API_KEY

  if (!BROWSERLESS_API_KEY) {
    throw new Error('Browserless API key is not configured. Please check your environment variables.')
  }

  const url = `https://production-sfo.browserless.io/pdf?token=${BROWSERLESS_API_KEY}`
  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json',
  }

  const data = {
    html: htmlContent,
    options: {
      displayHeaderFooter: false,
      printBackground: true,
      format: 'A4',
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm',
      },
    },
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Browserless API returned ${response.status}: ${errorText}`)
    }

    const pdfBuffer = await response.arrayBuffer()

    // Verify it's a PDF by checking the file signature
    const firstBytes = new Uint8Array(pdfBuffer.slice(0, 4))
    const signature = String.fromCharCode(...firstBytes)

    if (signature !== '%PDF') {
      throw new Error('Browserless did not return a valid PDF file')
    }

    console.log('CV PDF received! Size:', pdfBuffer.byteLength)
    return Buffer.from(pdfBuffer)
  } catch (error) {
    console.error('Browserless PDF generation failed:', error)
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function uploadToCloudinary(pdfBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        format: 'pdf',
        folder: 'portfoliohub_cvs',
        public_id: `cv_${Date.now()}`,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error)
          reject(error)
        } else {
          resolve(result?.secure_url || '')
        }
      }
    )

    uploadStream.end(pdfBuffer)
  })
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestPayload = await request.json()
    const {
      userId: explicitUserId,
      template = 'oliva-wilson',
      sections: rawSections,
      selectedItems,
      profile, about, skills, projects, contact, langint,
      certificates = []
    } = body

    if (!profile || !about || !contact) {
      return NextResponse.json(
        { error: 'Missing required profile data' },
        { status: 400 }
      )
    }

    const sections: CVSectionToggles = { ...defaultCVSectionToggles(), ...rawSections }

    // Process signature if available
    const processedProfile = { ...profile }
    if (profile.signature) {
      try {
        const processedSignatureUrl = await processSignature(profile.signature)
        if (processedSignatureUrl) {
          processedProfile.signature = processedSignatureUrl
        }
      } catch (error) {
        console.error('Signature processing failed, using original:', error)
      }
    }

    // Filter data based on selected items (if provided)
    let filteredAbout = about
    let filteredSkills = skills
    let filteredProjects = projects
    let filteredLangint = langint
    let filteredCertificates = certificates

    let filteredContact = contact

    if (selectedItems) {
      const filtered = filterResumeData(
        about, skills, projects, langint, certificates,
        sections as any, selectedItems, contact
      )
      filteredAbout = filtered.about
      filteredSkills = filtered.skills
      filteredProjects = filtered.projects
      filteredLangint = filtered.langint
      filteredCertificates = filtered.certificates
      filteredContact = filtered.contact
    }

    // Render CV HTML
    const htmlContent = generateCVTemplateHTML(
      template, processedProfile, filteredAbout, filteredSkills,
      filteredProjects, filteredContact, filteredLangint, filteredCertificates,
      sections
    )

    // Convert HTML to PDF via Browserless
    const pdfBuffer = await generatePDFWithBrowserless(htmlContent)

    // Upload to Cloudinary
    const cvUrl = await uploadToCloudinary(pdfBuffer)

    // Persist cvUrl (preserves resume_url). Client also saves via /api/user/save-document.
    const targetUserId = explicitUserId || profile?.uid || profile?.auth_user_id
    if (targetUserId && cvUrl) {
      const { error: dbError } = await upsertResumeDocument(supabaseAdmin, {
        userId: targetUserId,
        cvUrl,
      })
      if (dbError) {
        console.error('Error saving cvUrl to database:', dbError)
      } else {
        console.log('Successfully saved cvUrl to database for user:', targetUserId)
      }
    }

    return NextResponse.json({ cvUrl })
  } catch (error) {
    console.error('CV generation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate CV',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

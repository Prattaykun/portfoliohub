// app/api/admin/cloudinary/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { createClient } from '@supabase/supabase-js'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, serviceKey)

// Helper to list ALL resources for a given resource_type and optional prefix.
// Uses cursor-based pagination so nothing is silently dropped beyond 500.
async function fetchAllResources(resourceType: 'image' | 'raw' | 'video', prefix?: string) {
  const allResources: any[] = []
  let nextCursor: string | undefined

  try {
    do {
      const options: any = {
        resource_type: resourceType,
        max_results: 500,
      }
      if (prefix) {
        options.type = 'upload'
        options.prefix = prefix
      }
      if (nextCursor) {
        options.next_cursor = nextCursor
      }

      const result = await cloudinary.api.resources(options)
      const batch = result.resources || []
      allResources.push(...batch)
      nextCursor = result.next_cursor
    } while (nextCursor)
  } catch (err: any) {
    console.warn(`Fetch Cloudinary resources (${resourceType}, prefix: ${prefix || 'none'}) warning:`, err?.message || err)
  }

  return allResources
}

export async function GET(req: NextRequest) {
  try {
    // Fetch resources across ALL resource types (image, raw, video) and key folders.
    // Cursor pagination ensures we capture everything, not just the first 500.
    const [rawCVs, rawResumes, allRaw, allImages, allVideos] = await Promise.all([
      fetchAllResources('raw', 'portfoliohub_cvs/'),
      fetchAllResources('raw', 'resumes/'),
      fetchAllResources('raw'),
      fetchAllResources('image'),
      fetchAllResources('video'),
    ])

    // Combine and deduplicate by resource_type:public_id
    const resourceMap = new Map<string, any>()

    for (const r of [...rawCVs, ...rawResumes, ...allRaw, ...allImages, ...allVideos]) {
      resourceMap.set(`${r.resource_type}:${r.public_id}`, {
        public_id: r.public_id,
        format: r.format,
        resource_type: r.resource_type,
        created_at: r.created_at,
        bytes: r.bytes,
        url: r.secure_url || r.url,
        folder: r.folder || (r.public_id.includes('/') ? r.public_id.split('/')[0] : 'root'),
      })
    }

    const rawResources = Array.from(resourceMap.values())

    // Fetch user mappings from Supabase
    let resumesData: any[] = []
    let profilesData: any[] = []
    let usernamesData: any[] = []

    try {
      const [resumesRes, profilesRes, usernamesRes] = await Promise.all([
        supabaseAdmin.from('resumes').select('auth_user_id, resume_url, cv_url, active_document'),
        supabaseAdmin.from('user_profiles').select('uid, full_name, photo_url'),
        supabaseAdmin.from('users_usernames').select('auth_user_id, username'),
      ])
      resumesData = resumesRes.data || []
      profilesData = profilesRes.data || []
      usernamesData = usernamesRes.data || []
    } catch (dbErr) {
      console.warn('Database user mapping fetch warning:', dbErr)
    }

    // Build user mapping lookups
    const profileMap = new Map<string, any>()
    profilesData.forEach(p => profileMap.set(p.uid, p))

    const usernameMap = new Map<string, string>()
    usernamesData.forEach(u => usernameMap.set(u.auth_user_id, u.username))

    const urlToOwnerMap = new Map<string, any>()

    for (const res of resumesData) {
      const profile = profileMap.get(res.auth_user_id)
      const username = usernameMap.get(res.auth_user_id)
      const ownerInfo = {
        userId: res.auth_user_id,
        fullName: profile?.full_name || 'Registered User',
        username: username || 'user',
        avatarUrl: profile?.photo_url || null,
      }

      if (res.resume_url) urlToOwnerMap.set(res.resume_url, { ...ownerInfo, docType: 'Resume' })
      if (res.cv_url) urlToOwnerMap.set(res.cv_url, { ...ownerInfo, docType: 'CV' })
    }

    // Also map photo_urls for avatars
    for (const p of profilesData) {
      if (p.photo_url) {
        const username = usernameMap.get(p.uid)
        urlToOwnerMap.set(p.photo_url, {
          userId: p.uid,
          fullName: p.full_name || 'User Profile',
          username: username || 'user',
          avatarUrl: p.photo_url,
          docType: 'Profile Photo',
        })
      }
    }

    // Enrich Cloudinary resources with Owner info
    const enrichedResources = rawResources.map(r => {
      // Find matching owner by url substring or direct URL match
      let owner = urlToOwnerMap.get(r.url)

      if (!owner) {
        // Try substring search in case protocol or Cloudinary URL variant differs
        for (const [mappedUrl, mappedOwner] of urlToOwnerMap.entries()) {
          if (mappedUrl.includes(r.public_id) || r.url.includes(mappedUrl)) {
            owner = mappedOwner
            break
          }
        }
      }

      return {
        ...r,
        owner: owner || {
          fullName: r.folder === 'portfoliohub_cvs' ? 'Generated CV' : r.folder === 'resumes' ? 'Generated Resume' : 'System Media',
          username: r.folder !== 'root' ? r.folder : 'uploads',
          avatarUrl: null,
          docType: r.folder === 'portfoliohub_cvs' ? 'CV' : r.folder === 'resumes' ? 'Resume' : 'Media',
        },
      }
    })

    // Sort resources by created_at descending so the latest uploads appear at the top
    enrichedResources.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
      return timeB - timeA
    })

    const cvsCount = enrichedResources.filter(r => r.folder === 'portfoliohub_cvs' || r.public_id.startsWith('portfoliohub_cvs/')).length
    const resumesCount = enrichedResources.filter(r => r.folder === 'resumes' || r.public_id.startsWith('resumes/')).length

    return NextResponse.json({
      success: true,
      count: enrichedResources.length,
      stats: {
        total: enrichedResources.length,
        cvs: cvsCount,
        resumes: resumesCount,
        other: enrichedResources.length - cvsCount - resumesCount,
        totalBytes: enrichedResources.reduce((acc, curr) => acc + (curr.bytes || 0), 0),
      },
      resources: enrichedResources,
    })
  } catch (error: any) {
    console.error('Error listing Cloudinary media:', error)
    return NextResponse.json(
      { error: 'Failed to list Cloudinary media', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, publicIds } = await req.json()

    let deletedCount = 0
    let deletedDetails: any[] = []

    if (action === 'clear_cvs') {
      const resultRaw = await cloudinary.api.delete_resources_by_prefix('portfoliohub_cvs/', { resource_type: 'raw' }).catch(() => ({}))
      const resultImg = await cloudinary.api.delete_resources_by_prefix('portfoliohub_cvs/', { resource_type: 'image' }).catch(() => ({}))
      
      const countRaw = Object.keys(resultRaw.deleted || {}).length
      const countImg = Object.keys(resultImg.deleted || {}).length
      deletedCount = countRaw + countImg
      deletedDetails.push({ folder: 'portfoliohub_cvs', deleted: { ...resultRaw.deleted, ...resultImg.deleted } })
    } else if (action === 'clear_resumes') {
      const resultRaw = await cloudinary.api.delete_resources_by_prefix('resumes/', { resource_type: 'raw' }).catch(() => ({}))
      const resultImg = await cloudinary.api.delete_resources_by_prefix('resumes/', { resource_type: 'image' }).catch(() => ({}))
      
      const countRaw = Object.keys(resultRaw.deleted || {}).length
      const countImg = Object.keys(resultImg.deleted || {}).length
      deletedCount = countRaw + countImg
      deletedDetails.push({ folder: 'resumes', deleted: { ...resultRaw.deleted, ...resultImg.deleted } })
    } else if (action === 'clear_all') {
      const resultCVRaw = await cloudinary.api.delete_resources_by_prefix('portfoliohub_cvs/', { resource_type: 'raw' }).catch(() => ({}))
      const resultCVImg = await cloudinary.api.delete_resources_by_prefix('portfoliohub_cvs/', { resource_type: 'image' }).catch(() => ({}))
      const resultResRaw = await cloudinary.api.delete_resources_by_prefix('resumes/', { resource_type: 'raw' }).catch(() => ({}))
      const resultResImg = await cloudinary.api.delete_resources_by_prefix('resumes/', { resource_type: 'image' }).catch(() => ({}))

      deletedCount =
        Object.keys(resultCVRaw.deleted || {}).length +
        Object.keys(resultCVImg.deleted || {}).length +
        Object.keys(resultResRaw.deleted || {}).length +
        Object.keys(resultResImg.deleted || {}).length
    } else if (action === 'delete_selected' && Array.isArray(publicIds) && publicIds.length > 0) {
      const resultRaw = await cloudinary.api.delete_resources(publicIds, { resource_type: 'raw' }).catch(() => ({}))
      const resultImg = await cloudinary.api.delete_resources(publicIds, { resource_type: 'image' }).catch(() => ({}))
      const resultVid = await cloudinary.api.delete_resources(publicIds, { resource_type: 'video' }).catch(() => ({}))

      deletedCount =
        Object.keys(resultRaw.deleted || {}).length +
        Object.keys(resultImg.deleted || {}).length +
        Object.keys(resultVid.deleted || {}).length
      deletedDetails.push({ raw: resultRaw.deleted, image: resultImg.deleted, video: resultVid.deleted })
    } else {
      return NextResponse.json({ error: 'Invalid clear action specified' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully cleared media (${deletedCount} items deleted)`,
      deletedCount,
      deletedDetails,
    })
  } catch (error: any) {
    console.error('Error clearing Cloudinary media:', error)
    return NextResponse.json(
      { error: 'Failed to clear Cloudinary media', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

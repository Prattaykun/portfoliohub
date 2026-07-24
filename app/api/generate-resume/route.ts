// app/api/generate-resume/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { createClient } from '@supabase/supabase-js'
import { processSignature } from '@/lib/server/processSignature'
import { generateTemplateHTML } from '@/lib/server/templates'
import { filterResumeData } from '@/lib/server/filterResumeData'
import { defaultSectionToggles } from '@/lib/resumeTemplates'
import type { TemplateId, SectionToggles, SelectedItems } from '@/lib/resumeTemplates'

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


// Type definitions
interface Profile {
  uid: string
  full_name: string
  date_of_birth: string
  gender: string
  nationality: string
  photo_url: string
  pronouns: string
  locale: string
  updated_at: string
  created_at: string
  signature: string 
}

interface Education {
  id: string
  logo: string
  grade: string
  level: string
  degree: string
  domain: string
  endYear: string
  pursuing: boolean
  startYear: string
  gradeScale: string
  institution: string
}

interface Role {
  id: string
  start: string
  end: string
  title: string
  skills?: string[]
  present?: boolean
  attachments?: string[]
  description?: string
}

interface CompanyExperience {
  id: string
  logo?: string
  roles: Role[]
  company: string
  companyUrl?: string
}

interface About {
  auth_user_id: string
  bio: string
  education: Education[]
  // changed to CompanyExperience[]
  experience: CompanyExperience[]
  updated_at: string
  roles: string[]
}

interface TechnicalSkill {
  id: string
  name: string
  category: string
  logo_url: string
}

interface Skills {
  auth_user_id: string
  soft: string[] | null
  updated_at: string
  technical: TechnicalSkill[] | null
  // media column stored as array of objects; type relaxed to any here
  media?: any
}

interface ProjectMedia {
  id: string
  url: string
  type: string
}

interface ProjectTechStack {
  name: string
  logo_url: string | null
  category?: string
}

interface Project {
  id: string
  role: string
  media: ProjectMedia[]
  title: string
  process: string
  results: string
  overview: string
  repoLink: string
  techStack: ProjectTechStack[]
}

interface Projects {
  id: string
  created_at: string
  projects: Project[]
  updated_at: string
}

interface ContactLink {
  id: string
  url: string
  name: string
  logo_url?: string
}

interface Contact {
  auth_user_id: string
  email: string
  linkedin: string
  github: string
  other_links: ContactLink[]
  updated_at: string
  address: string
  phone: string
}

interface Language {
  id: string
  name: string
  proficiency: string
}

interface LangInt {
  auth_user_id: string
  language: Language[]
  interest: string[]
  updated_at: string
  created_at: string
}

interface CertificateSkill {
  name: string
  logo_url?: string
  category?: string
  source?: string
}

interface Certificate {
  name: string
  organization?: string
  issue_date?: string
  credential_id?: string
  credential_url?: string
  skills?: CertificateSkill[]
}

interface RequestPayload {
  userId?: string
  template?: TemplateId
  sections?: SectionToggles
  selectedItems?: SelectedItems
  profile: Profile
  about: About
  skills: Skills
  projects: Projects
  contact: Contact
  langint: LangInt
  certificates?: Certificate[]
}
//removed part in project rendering
//<strong>Process:</strong> ${escapeHtml(project.process)}<br/>
//${project.results ? `<strong>Results:</strong> ${escapeHtml(project.results)}<br/>` : ''}
export async function POST(request: NextRequest) {
  try {
    const body: RequestPayload = await request.json()
    const {
      userId: explicitUserId,
      template = 'classic',
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

    // Merge section toggles with defaults
    const sections: SectionToggles = { ...defaultSectionToggles(), ...rawSections }

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

    if (selectedItems) {
      const filtered = filterResumeData(
        about, skills, projects, langint, certificates,
        sections, selectedItems
      )
      filteredAbout = filtered.about
      filteredSkills = filtered.skills
      filteredProjects = filtered.projects
      filteredLangint = filtered.langint
      filteredCertificates = filtered.certificates
    }

    // Generate HTML — dispatch to correct template
    let htmlContent: string

    if (template === 'classic' || !template) {
      // Use the original classic generator (defined below in this file)
      htmlContent = generateResumeHTML(
        processedProfile, filteredAbout, filteredSkills,
        filteredProjects, contact, filteredLangint, filteredCertificates
      )
    } else {
      // Use one of the new template generators
      htmlContent = generateTemplateHTML(
        template, processedProfile, filteredAbout, filteredSkills,
        filteredProjects, contact, filteredLangint, filteredCertificates,
        sections
      )
    }

    // Generate PDF from HTML using Browserless API
    const pdfBuffer = await generatePDFWithBrowserless(htmlContent)

    // Upload PDF to Cloudinary
    const resumeUrl = await uploadToCloudinary(pdfBuffer)

    // Persist resumeUrl directly to database using Supabase Admin service key
    const targetUserId = explicitUserId || profile?.uid
    if (targetUserId && resumeUrl) {
      try {
        const { data: existingRecord } = await supabaseAdmin
          .from('resumes')
          .select('*')
          .eq('auth_user_id', targetUserId)
          .maybeSingle()

        await supabaseAdmin.from('resumes').upsert({
          auth_user_id: targetUserId,
          resume_url: resumeUrl,
          cv_url: existingRecord?.cv_url || null,
          active_document: existingRecord?.active_document || 'resume',
          updated_at: new Date().toISOString(),
        })
        console.log('Successfully saved resumeUrl to database for user:', targetUserId)
      } catch (dbErr) {
        console.error('Error saving resumeUrl to database:', dbErr)
      }
    }

    return NextResponse.json({ resumeUrl })

  } catch (error) {
    console.error('Resume generation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate resume',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function generateResumeHTML(
  profile: Profile, 
  about: About, 
  skills: Skills, 
  projects: Projects, 
  contact: Contact,
  langint: LangInt,
  certificates: Certificate[] = []
): string {
  const proficiencyLevels = ["Beginner", "Elementary", "Intermediate", "Advanced", "Fluent", "Native"]
  
  function getCurrentDate(): string {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Extract achievements from skills.media if present
  const achievements: { title: string; description?: string }[] = []
  try {
    if (skills?.media && Array.isArray(skills.media)) {
      // find any media block where name equals 'Achievements' (case-insensitive)
      const achBlocks = skills.media.filter((m: any) => (m?.name || '').toLowerCase() === 'achievements')
      for (const block of achBlocks) {
        const items = Array.isArray(block.items) ? block.items : []
        for (const it of items) {
          // Per instruction: if type === 'text' -> use url as title, else use title
          const title = it?.type === 'text' ? (it?.url || it?.title || '') : (it?.title || it?.url || '')
          const description = it?.description || ''
          if (title) achievements.push({ title, description })
        }
      }
    }
  } catch (e) {
    // ignore parse errors; achievements remain empty
    console.warn('Error parsing achievements from skills.media', e)
  }

  // Helper to safely check arrays
  function hasTechnicalSkills(): boolean {
    return !!(skills && Array.isArray(skills.technical) && skills.technical.length > 0)
  }
  function hasSoftSkills(): boolean {
    return !!(skills && Array.isArray(skills.soft) && skills.soft.length > 0)
  }


  function renderExperienceByCompany(companies?: CompanyExperience[]): string {
    if (!companies || companies.length === 0) return ''
    return `
    <div class="section">
      <div class="section-title">EXPERIENCE</div>
      <div class="companies">
        ${companies.map((company) => {
          // defensive defaults
          const roles = Array.isArray(company.roles) ? company.roles.slice() : []
          // sort: present first, then by start desc (newest first)
          roles.sort((a: Role, b: Role) => {
            if ((a.present ? 1 : 0) !== (b.present ? 1 : 0)) {
              return (b.present ? 1 : 0) - (a.present ? 1 : 0) // present first
            }
            const aStart = a.start ? new Date(a.start).getTime() : 0
            const bStart = b.start ? new Date(b.start).getTime() : 0
            return bStart - aStart
          })

          return `
            <div class="company-block">
              <div class="company-header">
                ${company.logo ? `<img src="${escapeHtml(company.logo)}" alt="${escapeHtml(company.company)}" class="company-logo-large" />` : `<div class="company-logo-placeholder"></div>`}
                <div class="company-header-text">
                  <div class="company-name">${escapeHtml(company.company)}</div>
                </div>
              </div>

              <div class="company-roles">
                ${roles.map(role => {
                  const startText = formatDate(role.start)
                  const endText = role.present ? 'Present' : formatDate(role.end)
                  const dateLine = `${startText} - ${endText}`
                  return `
                    <div class="role-row">
                      <div class="role-timeline-dot"></div>
                      <div class="role-content">
                        <div class="role-title">${escapeHtml(role.title)}</div>
                        <div class="role-date">${escapeHtml(dateLine)}</div>
                        ${role.description ? `<div class="role-desc">${escapeHtml(role.description)}</div>` : ''}
                      </div>
                    </div>
                  `
                }).join('')}
              </div>
            </div>
          `
        }).join('')}
      </div>
    </div>
    `
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(profile.full_name)} - Resume</title>
    <style>
        /* Made-with badge at the end of the document */
.made-with {
  margin-top: 30px;
  text-align: center;
  font-size: 13px;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  opacity: 0.95;
}
.made-with-img {
  width: 120px;
  height: auto;
  display: block;
}

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          max-width: 210mm;
          margin: 0 auto;
          padding: 25px;
          background: #fff;
          line-height: 1.5;
        }
        .header { display:flex; align-items:center; margin-bottom:25px; border-bottom:2px solid #2c5aa0; padding-bottom:20px; }
        .profile-photo { width:120px; height:120px; border-radius:50%; object-fit:cover; border:3px solid #2c5aa0; margin-right:25px; }
        .header-content { flex:1; }
        .name { font-size:28px; font-weight:700; color:#2c5aa0; margin-bottom:5px; }
        .roles { font-size:18px; color:#666; margin-bottom:15px; font-style:italic; }
        .contact-info { display:flex; flex-wrap:wrap; gap:15px; font-size:14px; color:#555; }
        .contact-item { display:flex; align-items:center; gap:6px; }
        .contact-icon { width:16px; height:16px; border-radius:2px; }

        .section { margin-bottom:20px; }
        .section-title { font-size:18px; font-weight:700; color:#2c5aa0; border-bottom:1px solid #ddd; padding-bottom:8px; margin-bottom:12px; }

        .summary { text-align:justify; line-height:1.7; }

        /* Education / item styles: ensure date sits on the right and doesn't overlap */
        .education-item { margin-bottom:18px; }
        .item-header { display:flex; align-items:flex-start; gap:12px; margin-bottom:8px; }
        .item-logo { width:40px; height:40px; border-radius:4px; object-fit:contain; flex:0 0 40px; }
        .item-content { flex:1 1 auto; min-width:0; } /* min-width:0 allows children to truncate instead of overflowing */
        .item-title-row { display:grid; grid-template-columns: 1fr auto; align-items:center; column-gap:12px; }
        .item-title { font-weight:700; font-size:16px; color:#333; overflow-wrap:break-word; word-break:break-word; }
        .item-date { color:#888; font-size:14px; white-space:nowrap; justify-self:end; }
        .item-subtitle { color:#666; font-size:14px; margin-bottom:4px; }
        .item-description { margin-top:6px; text-align:justify; font-size:14px; line-height:1.5; }

        /* Company block */
        .company-block { margin-bottom:18px; padding-left:6px; border-left: none; }
        .company-header { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
        .company-logo-large { width:56px; height:56px; object-fit:contain; border-radius:6px; }
        .company-logo-placeholder { width:56px; height:56px; border-radius:6px; background:#f0f0f0; }
        .company-name { font-weight:700; font-size:16px; color:#111; }

        
        .company-roles { padding-left:8px; }
        .role-row { position:relative; padding-left:28px; margin-bottom:14px; }
        .role-timeline-dot {
          position:absolute;
          left:6px;
          top:6px;
          width:12px;
          height:12px;
          background:#bdbdbd;
          border-radius:50%;
        }
        .role-content { }
        .role-title { font-weight:700; font-size:15px; color:#222; margin-bottom:4px; }
        .role-date { color:#777; font-size:13px; margin-bottom:6px; }
        .role-desc { color:#444; font-size:14px; text-align:justify; }

        /* Skills grid */
        .skills-container { display:grid; grid-template-columns: 1fr 1fr; gap:20px; }
        .skills-category-title { font-weight:700; margin-bottom:8px; color:#555; }
        .skills-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:8px; }
        .skill-item, .soft-skill-item { background:#f8f9fa; padding:8px 12px; border-radius:6px; display:flex; align-items:center; gap:8px; font-size:14px; border:1px solid #e9ecef; }
        .skill-logo { width:16px; height:16px; }

        .languages-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:15px; margin-top:10px; }
        .language-item { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #f0f0f0; }
        .language-name { font-weight:500; flex:1; }
        .language-proficiency { display:flex; align-items:center; gap:10px; }
        .stars { display:flex; gap:2px; }
        .star { color:#ffc107; font-size:16px; }
        .empty-star { color:#e0e0e0; font-size:16px; }
        .proficiency-text { font-size:14px; color:#666; min-width:80px; text-align:right; }

        .interests-list { list-style:none; padding-left:0; }
        .interest-item { padding:4px 0; position:relative; padding-left:20px; }
        .interest-item:before { content:"•"; color:#2c5aa0; font-weight:bold; position:absolute; left:8px; }

        .declaration-section { margin-top:30px; padding-top:20px; border-top:1px solid #ddd; }
        .signature-area { display:flex; justify-content:space-between; align-items:flex-end; margin-top:40px; }
        .signature-image { max-width:200px; max-height:80px; margin-bottom:10px; border-bottom:1px solid #333; }
        .signature-line { width:200px; border-bottom:1px solid #333; margin-bottom:10px; }
        .signature-name { font-weight:700; color:#333; }
        .date-line { width:150px; border-bottom:1px solid #333; margin-bottom:10px; }

        @media print {
          body { padding:15px; }
        }
    </style>
</head>
<body>
    <!-- Header Section with Photo -->
    <div class="header">
        ${profile.photo_url ? `<img src="${escapeHtml(profile.photo_url)}" alt="Profile Photo" class="profile-photo" />` : ''}
        <div class="header-content">
            <div class="name">${escapeHtml(profile.full_name)}</div>
            <div class="roles">${about.roles?.map(role => escapeHtml(role)).join(' • ') || 'B.Tech Student, Electronics & Communication Engineering'}</div>
            <div class="contact-info">
                ${contact.phone ? `
                <div class="contact-item">
                    <img src="https://img.icons8.com/?size=100&id=9730&format=png&color=000000" class="contact-icon" />
                    <span>${escapeHtml(contact.phone)}</span>
                </div>` : ''}
                ${contact.email ? `
                <div class="contact-item">
                    <img src="https://img.icons8.com/?size=100&id=12623&format=png&color=000000" class="contact-icon" />
                    <span>${escapeHtml(contact.email)}</span>
                </div>` : ''}
                ${contact.linkedin ? `
                <div class="contact-item">
                    <img src="https://www.google.com/s2/favicons?domain=linkedin.com&sz=128" class="contact-icon" />
                    <span>${escapeHtml(contact.linkedin.replace('https://', '').replace('www.', ''))}</span>
                </div>` : ''}
                ${contact.github ? `
                <div class="contact-item">
                    <img src="https://www.google.com/s2/favicons?domain=github.com&sz=128" class="contact-icon" />
                    <span>${escapeHtml(contact.github.replace('https://', '').replace('www.', ''))}</span>
                </div>` : ''}
                ${contact.address ? `
                <div class="contact-item">
                    <img src="https://img.icons8.com/?size=100&id=7880&format=png&color=000000" class="contact-icon" />
                    <span>${escapeHtml(contact.address)}</span>
                </div>` : ''}
            </div>
        </div>
    </div>

    <!-- Summary Section -->
    <div class="section">
        <div class="section-title">OBJECTIVE</div>
        <div class="summary">${escapeHtml(about.bio)}</div>
    </div>

    <!-- Education Section -->
    <div class="section">
        <div class="section-title">EDUCATION</div>
        ${about.education?.map(edu => `
            <div class="education-item">
                <div class="item-header">
                    ${edu.logo ? `<img src="${escapeHtml(edu.logo)}" alt="${escapeHtml(edu.institution)}" class="item-logo" />` : '<div class="item-logo"></div>'}
                    <div class="item-content">
                        <div class="item-title-row">
                            <div class="item-title">${escapeHtml(edu.degree)}</div>
                            <div class="item-date">${formatDate(edu.startYear)} - ${edu.pursuing ? 'Present' : formatDate(edu.endYear)}</div>
                        </div>
                        <div class="item-subtitle">${escapeHtml(edu.institution)}</div>
                        <div class="item-description">
                            Grade: ${escapeHtml(edu.grade)}${edu.gradeScale ? `/${escapeHtml(edu.gradeScale)}` : ''} • ${escapeHtml(edu.level)}
                        </div>
                    </div>
                </div>
            </div>
        `).join('')}
    </div>

    <!-- Experience Section (companies with roles) -->
    ${renderExperienceByCompany(about.experience)}

    <!-- Skills Section (conditionally rendered) -->
    ${(hasTechnicalSkills() || hasSoftSkills()) ? `
    <div class="section">
      <div class="section-title">SKILLS</div>
      <div class="skills-container">
        ${hasTechnicalSkills() ? `
          <div class="skills-category">
            <div class="skills-category-title">Technical Skills</div>
            <div class="skills-grid">
              ${skills.technical!.map(skill => `
                <div class="skill-item">
                  ${skill.logo_url ? `<img src="${escapeHtml(skill.logo_url)}" alt="${escapeHtml(skill.name)}" class="skill-logo" />` : ''}
                  <span>${escapeHtml(skill.name)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        ${hasSoftSkills() ? `
          <div class="skills-category">
            <div class="skills-category-title">Soft Skills</div>
            <div class="skills-grid">
              ${skills.soft!.map((s: string) => `<div class="soft-skill-item">${escapeHtml(s)}</div>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
    ` : ''}

    <!-- Certificates Section -->
    ${certificates && certificates.length > 0 ? `
    <div class="section">
        <div class="section-title">CERTIFICATIONS</div>
        ${certificates.map(cert => `
            <div style="margin-bottom: 12px;">
                <div style="font-weight: bold; font-size: 15px; color: #333;">
                    ${escapeHtml(cert.name)}
                </div>
                
                ${cert.organization ? `
                    <div style="font-size: 14px; color: #666;">
                        Issued by: ${escapeHtml(cert.organization)}
                    </div>
                ` : ''}

                ${cert.issue_date ? `
                    <div style="font-size: 13px; color: #888;">
                        Date: ${formatDate(cert.issue_date)}
                    </div>
                ` : ''}

                ${cert.credential_id ? `
                    <div style="font-size: 13px; color: #444;">
                        Credential ID: ${escapeHtml(cert.credential_id)}
                    </div>
                ` : ''}

                ${cert.skills && cert.skills.length > 0 ? `
                    <div style="margin-top: 6px; display: flex; flex-wrap: wrap; gap: 6px;">
                        ${cert.skills.map(s => `
                            <div style="display: inline-flex; align-items: center; gap: 4px; background: #f4f4f4; border: 1px solid #e0e0e0; padding: 4px 8px; border-radius: 4px; font-size: 13px;">
                                ${s.logo_url ? `<img src="${escapeHtml(s.logo_url)}" style="width:14px;height:14px;object-fit:contain;" />` : ''}
                                <span>${escapeHtml(s.name)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

    <!-- Projects Section -->
    <div class="section">
        <div class="section-title">PROJECTS</div>
        ${projects.projects?.map(project => `
            <div class="project-item">
                <div class="item-header">
                    <div class="item-content">
                        <div class="item-title-row">
                            <div class="item-title">${escapeHtml(project.title)}</div>
                        </div>
                        <div class="item-subtitle">Role: ${escapeHtml(project.role)}</div>
                        <div class="item-description">
                            <strong>Overview:</strong> ${escapeHtml(project.overview)}<br/>
                            <strong>Tech Stack:</strong> ${project.techStack?.map(tech => escapeHtml(tech.name)).join(', ')}
                        </div>
                    </div>
                </div>
            </div>
        `).join('')}
    </div>

    <!-- Achievements: render before Languages & Interests -->
    ${achievements.length > 0 ? `
      <div class="section">
        <div class="section-title">ACHIEVEMENTS</div>
        ${achievements.map(a => `
          <div style="margin-bottom:10px;">
            <div style="font-weight:700; font-size:15px; color:#222;">${escapeHtml(a.title)}</div>
            ${a.description ? `<div style="font-size:14px;color:#444;margin-top:6px;">${escapeHtml(a.description)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    ` : ''}

    <!-- Languages Section -->
    ${langint?.language && langint.language.length > 0 ? `
    <div class="section">
        <div class="section-title">LANGUAGES</div>
        <div class="languages-grid">
            ${langint.language.map(lang => {
                const proficiencyIndex = proficiencyLevels.indexOf(lang.proficiency);
                const starCount = proficiencyIndex >= 0 ? proficiencyIndex + 1 : 1;
                return `
                <div class="language-item">
                    <div class="language-name">${escapeHtml(lang.name)}</div>
                    <div class="language-proficiency">
                        <div class="stars">
                            ${Array.from({ length: 6 }, (_, i) => 
                                i < starCount 
                                    ? '<span class="star">★</span>' 
                                    : '<span class="empty-star">★</span>'
                            ).join('')}
                        </div>
                        <span class="proficiency-text">${escapeHtml(lang.proficiency)}</span>
                    </div>
                </div>
                `
            }).join('')}
        </div>
    </div>
    ` : ''}

    <!-- Interests Section -->
    ${langint?.interest && langint.interest.length > 0 ? `
    <div class="section">
        <div class="section-title">INTERESTS</div>
        <ul class="interests-list">
            ${langint.interest.map(interest => `
                <li class="interest-item">${escapeHtml(interest)}</li>
            `).join('')}
        </ul>
    </div>
    ` : ''}

    <!-- Declaration + Signature -->
    <div class="section declaration-section">
        <div class="section-title">DECLARATION</div>
        <div class="declaration-content">
            I hereby declare that all the information provided above is true and correct to the best of my knowledge. 
            I understand that any misrepresentation may lead to disqualification or termination of employment.
        </div>
        
        <div class="signature-area">
            <div class="signature-container">
                ${profile.signature ? 
                  `<img src="${escapeHtml(profile.signature)}" alt="Signature" class="signature-image" />` : 
                  '<div class="signature-line"></div>'
                }
                <div class="signature-name">${escapeHtml(profile.full_name)}</div>
            </div>
            
            <div class="date-container">
                <div>${getCurrentDate()}</div>
                <div class="date-line"></div>
                <div class="signature-name">Date</div>
            </div>
        </div>
    </div>
        <!-- Made with badge (end of PDF) -->
    <div class="section">
      <div class="made-with">
        <div>Made with 💙</div>
        <img src="https://portfoliohub-pi.vercel.app/logo1.png" alt="Made with PortfolioHub" class="made-with-img" />
      </div>
    </div>

</body>
</html>
  `
}

function escapeHtml(unsafe: string): string {
  if (!unsafe) return ''
  return unsafe
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function formatDate(dateString: string): string {
  if (!dateString) return 'Present'
  try {
    // Handle year-only dates
    if (/^\d{4}$/.test(dateString)) {
      return dateString
    }
    
    // Handle "Present" case
    if (dateString === 'Present') return dateString
    
    // Many inputs may be YYYY-MM or full ISO; Date constructor handles YYYY-MM as start of month
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return dateString
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  } catch {
    return dateString
  }
}

async function generatePDFWithBrowserless(htmlContent: string): Promise<Buffer> {
  const BROWSERLESS_API_KEY = process.env.NEXT_PUBLIC_BROWSERLESS_API_KEY
  
  if (!BROWSERLESS_API_KEY) {
    throw new Error('Browserless API key is not configured. Please check your environment variables.')
  }

  const url = `https://production-sfo.browserless.io/pdf?token=${BROWSERLESS_API_KEY}`;
  const headers = {
    "Cache-Control": "no-cache",
    "Content-Type": "application/json"
  };

  const data = {
    html: htmlContent,
    options: {
      displayHeaderFooter: false,
      printBackground: true,
      format: "A4",
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      }
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Browserless API returned ${response.status}: ${errorText}`);
    }

    const pdfBuffer = await response.arrayBuffer();
    
    // Verify it's a PDF by checking the file signature
    const firstBytes = new Uint8Array(pdfBuffer.slice(0, 4));
    const signature = String.fromCharCode(...firstBytes);
    
    if (signature !== '%PDF') {
      throw new Error('Browserless did not return a valid PDF file');
    }

    console.log("PDF received! Size:", pdfBuffer.byteLength);
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Browserless PDF generation failed:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function uploadToCloudinary(pdfBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        format: 'pdf',
        folder: 'resumes',
        public_id: `resume_${Date.now()}`,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result?.secure_url || '');
        }
      }
    );
    
    uploadStream.end(pdfBuffer);
  });
}

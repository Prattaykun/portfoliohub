// app/api/generate-resume/route.ts
import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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
  signature: string
  updated_at: string
  created_at: string
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

interface Experience {
  id: string
  end: string
  logo: string
  start: string
  title: string
  skills: string[]
  company: string
  present: boolean
  companyUrl: string
  description: string
  offerLetter: string
}

interface About {
  auth_user_id: string
  bio: string
  education: Education[]
  experience: Experience[]
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
  soft: string[]
  updated_at: string
  technical: TechnicalSkill[]
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
  profile: Profile
  about: About
  skills: Skills
  projects: Projects
  contact: Contact
  langint: LangInt
  certificates?: Certificate[]
}

export async function POST(request: NextRequest) {
  try {
    const { profile, about, skills, projects, contact, langint, certificates = [] }: RequestPayload = await request.json()

    if (!profile || !about || !contact) {
      return NextResponse.json(
        { error: 'Missing required profile data' },
        { status: 400 }
      )
    }

    // Process signature if available
    let processedProfile = { ...profile }
    if (profile.signature) {
      try {
        // Call the signature processing API
        const processResponse = await fetch(`${getBaseUrl()}/api/process-signature`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            signatureUrl: profile.signature
          })
        })

        if (processResponse.ok) {
          const { processedSignatureUrl } = await processResponse.json()
          processedProfile.signature = processedSignatureUrl
        }
      } catch (error) {
        console.error('Signature processing failed, using original:', error)
        // Continue with original signature if processing fails
      }
    }

    // Generate HTML content for the resume
    const htmlContent = generateResumeHTML(processedProfile, about, skills, projects, contact, langint, certificates)

    // Generate PDF from HTML
    const pdfBuffer = await generatePDF(htmlContent)

    // Upload PDF to Cloudinary
    const resumeUrl = await uploadToCloudinary(pdfBuffer)

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

// Helper function to get base URL
function getBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return `http://localhost:${process.env.PORT || 3000}`
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

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${profile.full_name} - Resume</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 25px;
            background: #fff;
        }
        
        .header {
            display: flex;
            align-items: center;
            margin-bottom: 25px;
            border-bottom: 2px solid #2c5aa0;
            padding-bottom: 20px;
        }
        
        .profile-photo {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #2c5aa0;
            margin-right: 25px;
        }
        
        .header-content {
            flex: 1;
        }
        
        .name {
            font-size: 28px;
            font-weight: bold;
            color: #2c5aa0;
            margin-bottom: 5px;
        }
        
        .roles {
            font-size: 18px;
            color: #666;
            margin-bottom: 15px;
            font-style: italic;
        }
        
        .contact-info {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            font-size: 14px;
            color: #555;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .contact-icon {
            width: 16px;
            height: 16px;
            border-radius: 2px;
        }
        
        .section {
            margin-bottom: 20px;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2c5aa0;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        
        .summary {
            text-align: justify;
            line-height: 1.7;
        }
        
        .education-item, .experience-item, .project-item {
            margin-bottom: 18px;
            padding-left: 10px;
        }
        
        .item-header {
            display: flex;
            align-items: flex-start;
            margin-bottom: 8px;
        }
        
        .item-logo {
            width: 40px;
            height: 40px;
            border-radius: 4px;
            margin-right: 12px;
            object-fit: contain;
        }
        
        .item-content {
            flex: 1;
        }
        
        .item-title-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
        }
        
        .item-title {
            font-weight: bold;
            font-size: 16px;
            color: #333;
        }
        
        .item-date {
            color: #888;
            font-size: 14px;
            white-space: nowrap;
        }
        
        .item-subtitle {
            color: #666;
            font-size: 14px;
            margin-bottom: 4px;
        }
        
        .item-description {
            margin-top: 6px;
            text-align: justify;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .skills-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .skills-category {
            margin-bottom: 15px;
        }
        
        .skills-category-title {
            font-weight: bold;
            margin-bottom: 8px;
            color: #555;
        }
        
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 8px;
        }
        
        .skill-item {
            background: #f8f9fa;
            padding: 8px 12px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            border: 1px solid #e9ecef;
        }
        
        .skill-logo {
            width: 16px;
            height: 16px;
        }
        
        .soft-skill-item {
            background: #f8f9fa;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
            border: 1px solid #e9ecef;
        }
        
        .languages-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 10px;
        }
        
        .language-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .language-name {
            font-weight: 500;
            flex: 1;
        }
        
        .language-proficiency {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .stars {
            display: flex;
            gap: 2px;
        }
        
        .star {
            color: #ffc107;
            font-size: 16px;
        }
        
        .empty-star {
            color: #e0e0e0;
            font-size: 16px;
        }
        
        .proficiency-text {
            font-size: 14px;
            color: #666;
            min-width: 80px;
            text-align: right;
        }
        
        .interests-list {
            list-style: none;
            padding-left: 0;
        }
        
        .interest-item {
            padding: 4px 0;
            position: relative;
            padding-left: 20px;
        }
        
        .interest-item:before {
            content: "•";
            color: #2c5aa0;
            font-weight: bold;
            position: absolute;
            left: 8px;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .declaration-section {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
        
        .declaration-content {
            margin-bottom: 20px;
            line-height: 1.6;
        }
        
        .signature-area {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 40px;
        }
        
        .signature-container {
            text-align: center;
        }
        
        .signature-image {
            max-width: 200px;
            max-height: 80px;
            margin-bottom: 10px;
            border-bottom: 1px solid #333;
        }
        
        .signature-line {
            width: 200px;
            border-bottom: 1px solid #333;
            margin-bottom: 10px;
        }
        
        .signature-name {
            font-weight: bold;
            color: #333;
        }
        
        .date-container {
            text-align: center;
        }
        
        .date-line {
            width: 150px;
            border-bottom: 1px solid #333;
            margin-bottom: 10px;
        }
        
        @media print {
            body {
                padding: 15px;
            }
            .page-break {
                page-break-before: always;
            }
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
                <div class="contact-item">
                    <img src="https://img.icons8.com/?size=100&id=9730&format=png&color=000000" class="contact-icon" />
                    <span>${escapeHtml(contact.phone)}</span>
                </div>
                <div class="contact-item">
                    <img src="https://img.icons8.com/?size=100&id=12623&format=png&color=000000" class="contact-icon" />
                    <span>${escapeHtml(contact.email)}</span>
                </div>
                <div class="contact-item">
                    <img src="https://www.google.com/s2/favicons?domain=linkedin.com&sz=128" class="contact-icon" />
                    <span>${escapeHtml(contact.linkedin.replace('https://', '').replace('www.', ''))}</span>
                </div>
                <div class="contact-item">
                    <img src="https://www.google.com/s2/favicons?domain=github.com&sz=128" class="contact-icon" />
                    <span>${escapeHtml(contact.github.replace('https://', '').replace('www.', ''))}</span>
                </div>
                <div class="contact-item">
                    <img src="https://img.icons8.com/?size=100&id=7880&format=png&color=000000" class="contact-icon" />
                    <span>${escapeHtml(contact.address)}</span>
                </div>
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

    <!-- Experience Section -->
    ${about.experience && about.experience.length > 0 ? `
    <div class="section">
        <div class="section-title">EXPERIENCE</div>
        ${about.experience.map(exp => `
            <div class="experience-item">
                <div class="item-header">
                    ${exp.logo ? `<img src="${escapeHtml(exp.logo)}" alt="${escapeHtml(exp.company)}" class="item-logo" />` : '<div class="item-logo"></div>'}
                    <div class="item-content">
                        <div class="item-title-row">
                            <div class="item-title">${escapeHtml(exp.title)}</div>
                            <div class="item-date">${formatDate(exp.start)} - ${exp.present ? 'Present' : formatDate(exp.end)}</div>
                        </div>
                        <div class="item-subtitle">${escapeHtml(exp.company)}</div>
                        <div class="item-description">${escapeHtml(exp.description)}</div>
                        ${exp.skills?.length > 0 ? `
                            <div class="item-description">
                                <strong>Technologies:</strong> ${exp.skills.map(skill => escapeHtml(skill)).join(', ')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('')}
    </div>
    ` : ''}

    <!-- Skills Section -->
    <div class="section">
        <div class="section-title">SKILLS</div>
        <div class="skills-container">
            <!-- Technical Skills -->
            <div class="skills-category">
                <div class="skills-category-title">Technical Skills</div>
                <div class="skills-grid">
                    ${skills.technical?.map(skill => `
                        <div class="skill-item">
                            ${skill.logo_url ? `<img src="${escapeHtml(skill.logo_url)}" alt="${escapeHtml(skill.name)}" class="skill-logo" />` : ''}
                            <span>${escapeHtml(skill.name)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Soft Skills -->
            <div class="skills-category">
                <div class="skills-category-title">Soft Skills</div>
                <div class="skills-grid">
                    ${skills.soft?.map(skill => `
                        <div class="soft-skill-item">${escapeHtml(skill)}</div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>

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
                            <strong>Process:</strong> ${escapeHtml(project.process)}<br/>
                            ${project.results ? `<strong>Results:</strong> ${escapeHtml(project.results)}<br/>` : ''}
                            <strong>Tech Stack:</strong> ${project.techStack?.map(tech => escapeHtml(tech.name)).join(', ')}
                        </div>
                    </div>
                </div>
            </div>
        `).join('')}
    </div>

    <!-- Languages Section -->
    ${langint?.language && langint.language.length > 0 ? `
    <div class="section">
        <div class="section-title">LANGUAGES</div>
        <div class="languages-grid">
            ${langint.language.map(lang => {
                const proficiencyIndex = proficiencyLevels.indexOf(lang.proficiency);
                const starCount = proficiencyIndex + 1; // 1-6 stars
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

    <!-- Declaration Section -->
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
</body>
</html>
  `
}

function escapeHtml(unsafe: string): string {
  if (!unsafe) return ''
  return unsafe
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
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return dateString
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  } catch {
    return dateString
  }
}

async function generatePDF(htmlContent: string): Promise<Buffer> {
  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    
    // Set the HTML content
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      }
    })
    
    return Buffer.from(pdfBuffer)
  } finally {
    if (browser) {
      await browser.close()
    }
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
        if (error) reject(error)
        else resolve(result?.secure_url || '')
      }
    )
    
    uploadStream.end(pdfBuffer)
  })
}
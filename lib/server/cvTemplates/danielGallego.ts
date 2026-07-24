// lib/server/cvTemplates/danielGallego.ts
// CV Template 2: Daniel Gallego Pill Header CV
// Features: Single-column layout with light gray rounded pill badges for section titles & 3-column skills grid

import { escapeHtml, formatDate, extractAchievements, renderDeclaration, MADE_WITH_BADGE } from '../cvHelpers'
import type { CVSectionToggles } from '@/lib/cvTemplates'

export function generateDanielGallegoCVHTML(
  profile: any, about: any, skills: any, projects: any,
  contact: any, langint: any, certificates: any[],
  sections: CVSectionToggles
): string {
  const achievements = extractAchievements(skills)
  const hasTech = !!(skills?.technical?.length)
  const hasSoft = !!(skills?.soft?.length)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(profile.full_name)} - CV</title>
<link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&family=Roboto:ital,wght@0,500;0,700;1,400;1,700&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Lato', sans-serif; color:#2d3748; background:#fff; line-height:1.5; }
.page { width:210mm; min-height:297mm; padding:35px 45px; margin:0 auto; background:#fff; }

/* Header Section */
.header { margin-bottom:24px; text-align:left; }
.header-name { font-family:'Roboto', sans-serif; font-size:30px; font-weight:700; text-transform:uppercase; color:#1a202c; letter-spacing:1px; line-height:1.1; }
.header-role { font-family:'Roboto', sans-serif; font-size:18px; font-weight:700; text-transform:uppercase; color:#2d3748; margin-top:6px; letter-spacing:0.5px; }
.header-contact { font-size:12px; color:#4a5568; margin-top:8px; display:flex; flex-wrap:wrap; gap:12px; }
.header-contact span { display:inline-flex; align-items:center; gap:4px; }
.header-contact .sep { color:#cbd5e0; }

/* Gray Pill Section Header Badge */
.pill-sec-title { background:#e2e8f0; color:#2d3748; border-radius:9999px; padding:6px 20px; font-family:'Roboto', sans-serif; font-size:13px; font-weight:700; font-style:italic; text-transform:uppercase; letter-spacing:1.5px; margin-top:20px; margin-bottom:14px; display:inline-block; width:100%; }

/* Content Text & Lists */
.summary-text { font-size:12.5px; color:#4a5568; line-height:1.6; text-align:justify; }

/* 3-Column Skills Grid */
.skills-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:8px 16px; font-size:12px; color:#2d3748; }
.skill-item { font-weight:500; }

/* Experience & Education Item */
.item-entry { margin-bottom:14px; }
.item-title-bar { display:flex; justify-content:space-between; align-items:baseline; font-size:13.5px; font-weight:700; color:#1a202c; }
.item-company { font-weight:700; color:#2d3748; }
.item-date { font-weight:700; color:#1a202c; font-size:12.5px; }
.item-sub { font-size:12px; color:#4a5568; margin-top:2px; }

.item-bullets { margin-top:6px; padding-left:18px; font-size:12px; color:#4a5568; }
.item-bullets li { margin-bottom:4px; line-height:1.5; }

/* Key-Value additional info */
.info-row { font-size:12px; color:#2d3748; margin-bottom:6px; }
.info-row strong { font-weight:700; color:#1a202c; }

@media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style>
</head>
<body>
<div class="page">
  <!-- HEADER -->
  <div class="header">
    <div class="header-name">${escapeHtml(profile.full_name)}</div>
    <div class="header-role">${about.roles?.length ? escapeHtml(about.roles.join(' • ')) : ''}</div>
    ${sections.contacts !== false ? `
    <div class="header-contact">
      ${[
        contact.address ? `<span>${escapeHtml(contact.address)}</span>` : '',
        contact.email ? `<span>${escapeHtml(contact.email)}</span>` : '',
        contact.phone ? `<span>${escapeHtml(contact.phone)}</span>` : '',
        contact.linkedin ? `<span>${escapeHtml(contact.linkedin.replace(/^https?:\/\//,'').replace(/^www\./,''))}</span>` : '',
        contact.github ? `<span>${escapeHtml(contact.github.replace(/^https?:\/\//,'').replace(/^www\./,''))}</span>` : '',
        ...(Array.isArray(contact.other_links) ? contact.other_links.map((link: any) => {
          if (!link?.url) return ''
          const label = link.name ? `${link.name}: ${link.url.replace(/^https?:\/\//,'').replace(/^www\./,'')}` : link.url.replace(/^https?:\/\//,'').replace(/^www\./,'')
          return `<span>${escapeHtml(label)}</span>`
        }) : [])
      ].filter(Boolean).join(' <span class="sep">|</span> ')}
    </div>` : ''}
  </div>

  <!-- SUMMARY -->
  ${sections.objective && about.bio ? `
  <div>
    <div class="pill-sec-title">SUMMARY</div>
    <div class="summary-text">${escapeHtml(about.bio)}</div>
  </div>` : ''}

  <!-- TECHNICAL SKILLS -->
  ${sections.skills && (hasTech || hasSoft) ? `
  <div>
    <div class="pill-sec-title">TECHNICAL & PROFESSIONAL SKILLS</div>
    <div class="skills-grid">
      ${hasTech ? skills.technical.map((s: any) => `<div class="skill-item">• ${escapeHtml(s.name)}</div>`).join('') : ''}
      ${hasSoft ? skills.soft.map((s: string) => `<div class="skill-item">• ${escapeHtml(s)}</div>`).join('') : ''}
    </div>
  </div>` : ''}

  <!-- PROFESSIONAL EXPERIENCE -->
  ${sections.experience && about.experience?.length ? `
  <div>
    <div class="pill-sec-title">PROFESSIONAL EXPERIENCE</div>
    ${about.experience.map((comp: any) => {
      const roles = Array.isArray(comp.roles) ? comp.roles : []
      return roles.map((role: any) => `
      <div class="item-entry">
        <div class="item-title-bar">
          <span><span class="item-company">${escapeHtml(comp.company)}</span> — ${escapeHtml(role.title)}</span>
          <span class="item-date">${formatDate(role.start)} - ${role.present ? 'Present' : formatDate(role.end)}</span>
        </div>
        ${role.description ? `
        <ul class="item-bullets">
          ${role.description.split('. ').filter(Boolean).map((d: string) => `<li>${escapeHtml(d.replace(/\.$/, ''))}.</li>`).join('')}
        </ul>` : ''}
      </div>`).join('')
    }).join('')}
  </div>` : ''}

  <!-- EDUCATION -->
  ${sections.education && about.education?.length ? `
  <div>
    <div class="pill-sec-title">EDUCATION</div>
    ${about.education.map((edu: any) => `
    <div class="item-entry">
      <div class="item-title-bar">
        <span>${escapeHtml(edu.degree)}</span>
        <span class="item-date">${formatDate(edu.startYear)} - ${edu.pursuing ? 'Present' : formatDate(edu.endYear)}</span>
      </div>
      <div class="item-sub">${escapeHtml(edu.institution)}</div>
      <ul class="item-bullets">
        ${edu.grade ? `<li>Grade: ${escapeHtml(edu.grade)}${edu.gradeScale ? ` / ${escapeHtml(edu.gradeScale)}` : ''}</li>` : ''}
        ${edu.level ? `<li>Program Level: ${escapeHtml(edu.level)}</li>` : ''}
      </ul>
    </div>`).join('')}
  </div>` : ''}

  <!-- PROJECTS -->
  ${sections.projects && projects?.projects?.length ? `
  <div>
    <div class="pill-sec-title">PROJECTS</div>
    ${projects.projects.map((p: any) => `
    <div class="item-entry">
      <div class="item-title-bar">
        <span>${escapeHtml(p.title)}</span>
        ${p.role ? `<span style="font-weight:normal; font-size:12px; color:#718096;">${escapeHtml(p.role)}</span>` : ''}
      </div>
      <div class="summary-text" style="margin-top:4px;">${escapeHtml(p.overview)}</div>
      ${p.techStack?.length ? `<div style="font-size:11.5px; color:#4a5568; margin-top:3px; font-style:italic;">Technologies: ${p.techStack.map((t: any) => escapeHtml(t.name)).join(', ')}</div>` : ''}
    </div>`).join('')}
  </div>` : ''}

  <!-- ADDITIONAL INFORMATION (Languages, Certificates, Achievements) -->
  ${(sections.certificates && certificates?.length) || (sections.languages && langint?.language?.length) || (sections.achievements && achievements.length) ? `
  <div>
    <div class="pill-sec-title">ADDITIONAL INFORMATION</div>
    ${sections.languages && langint?.language?.length ? `
    <div class="info-row">
      <strong>Languages:</strong> ${langint.language.map((l: any) => `${escapeHtml(l.name)} (${escapeHtml(l.proficiency)})`).join(', ')}
    </div>` : ''}
    ${sections.certificates && certificates?.length ? `
    <div class="info-row">
      <strong>Certifications:</strong> ${certificates.map(c => `${escapeHtml(c.name)}${c.organization ? ` (${escapeHtml(c.organization)})` : ''}`).join(', ')}
    </div>` : ''}
    ${sections.achievements && achievements.length ? `
    <div class="info-row">
      <strong>Awards / Activities:</strong> ${achievements.map(a => escapeHtml(a.title)).join('; ')}
    </div>` : ''}
  </div>` : ''}

  ${renderDeclaration(profile, sections.declaration)}
  ${MADE_WITH_BADGE}
</div>
</body>
</html>`
}

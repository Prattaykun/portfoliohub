// lib/server/cvTemplates/academicExecutive.ts
// CV Template 3: Academic Executive CV — Formal serif styling with double accent line headers

import { escapeHtml, formatDate, extractAchievements, renderDeclaration, MADE_WITH_BADGE } from '../cvHelpers'
import { renderProjectTitleHtml } from '../withPortfolioContactLink'
import type { CVSectionToggles } from '@/lib/cvTemplates'

export function generateAcademicExecutiveCVHTML(
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
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Open Sans', sans-serif; color:#222; background:#fff; line-height:1.6; }
.page { width:210mm; min-height:297mm; padding:40px 45px; margin:0 auto; background:#fff; }

/* Header */
.header { text-align:center; padding-bottom:18px; border-bottom:3px double #2b6cb0; margin-bottom:24px; }
.header-name { font-family:'Cinzel', serif; font-size:28px; font-weight:700; color:#1a365d; letter-spacing:2px; text-transform:uppercase; }
.header-role { font-size:13px; font-weight:600; color:#4a5568; letter-spacing:2px; text-transform:uppercase; margin-top:4px; }
.header-contact { margin-top:10px; font-size:12px; color:#4a5568; display:flex; justify-content:center; flex-wrap:wrap; gap:16px; }

/* Section Title */
.sec-title { font-family:'Cinzel', serif; font-size:15px; font-weight:700; color:#1a365d; text-transform:uppercase; letter-spacing:1px; border-bottom:1.5px solid #2b6cb0; padding-bottom:4px; margin-top:22px; margin-bottom:12px; }

.text-block { font-size:12.5px; color:#333; text-align:justify; }

/* Entry item */
.entry { margin-bottom:14px; }
.entry-head { display:flex; justify-content:space-between; font-size:13.5px; font-weight:700; color:#1a365d; }
.entry-sub { font-size:12.5px; font-weight:600; color:#4a5568; }
.entry-date { font-size:12px; color:#2b6cb0; font-weight:600; }
.entry-bullets { margin-top:4px; padding-left:18px; font-size:12px; color:#333; }
.entry-bullets li { margin-bottom:3px; }

/* Badges */
.badge-list { display:flex; flex-wrap:wrap; gap:6px; margin-top:4px; }
.badge { font-size:11.5px; padding:3px 10px; background:#ebf8ff; border:1px solid #bee3f8; color:#2b6cb0; border-radius:4px; font-weight:600; }

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
      ${contact.phone ? `<span>Phone: ${escapeHtml(contact.phone)}</span>` : ''}
      ${contact.email ? `<span>Email: ${escapeHtml(contact.email)}</span>` : ''}
      ${contact.address ? `<span>Address: ${escapeHtml(contact.address)}</span>` : ''}
      ${contact.linkedin ? `<span>LinkedIn: ${escapeHtml(contact.linkedin.replace(/^https?:\/\//,'').replace(/^www\./,''))}</span>` : ''}
      ${contact.github ? `<span>GitHub: ${escapeHtml(contact.github.replace(/^https?:\/\//,'').replace(/^www\./,''))}</span>` : ''}
      ${Array.isArray(contact.other_links) ? contact.other_links.map((link: any) => {
        if (!link?.url) return ''
        const name = link.name || 'Link'
        const displayUrl = link.url.replace(/^https?:\/\//,'').replace(/^www\./,'')
        return `<span>${escapeHtml(name)}: ${escapeHtml(displayUrl)}</span>`
      }).join('') : ''}
    </div>` : ''}
  </div>

  <!-- SUMMARY -->
  ${sections.objective && about.bio ? `
  <div>
    <div class="sec-title">Executive Summary</div>
    <div class="text-block">${escapeHtml(about.bio)}</div>
  </div>` : ''}

  <!-- EXPERIENCE -->
  ${sections.experience && about.experience?.length ? `
  <div>
    <div class="sec-title">Professional Experience</div>
    ${about.experience.map((comp: any) => {
      const roles = Array.isArray(comp.roles) ? comp.roles : []
      return roles.map((role: any) => `
      <div class="entry">
        <div class="entry-head">
          <span>${escapeHtml(role.title)}</span>
          <span class="entry-date">${formatDate(role.start)} - ${role.present ? 'Present' : formatDate(role.end)}</span>
        </div>
        <div class="entry-sub">${escapeHtml(comp.company)}</div>
        ${role.description ? `
        <ul class="entry-bullets">
          ${role.description.split('. ').filter(Boolean).map((d: string) => `<li>${escapeHtml(d.replace(/\.$/, ''))}.</li>`).join('')}
        </ul>` : ''}
      </div>`).join('')
    }).join('')}
  </div>` : ''}

  <!-- EDUCATION -->
  ${sections.education && about.education?.length ? `
  <div>
    <div class="sec-title">Education & Academic Qualifications</div>
    ${about.education.map((edu: any) => `
    <div class="entry">
      <div class="entry-head">
        <span>${escapeHtml(edu.degree)}</span>
        <span class="entry-date">${formatDate(edu.startYear)} - ${edu.pursuing ? 'Present' : formatDate(edu.endYear)}</span>
      </div>
      <div class="entry-sub">${escapeHtml(edu.institution)}</div>
      <ul class="entry-bullets">
        ${edu.grade ? `<li>Grade: ${escapeHtml(edu.grade)}${edu.gradeScale ? ` / ${escapeHtml(edu.gradeScale)}` : ''}</li>` : ''}
        ${edu.level ? `<li>Level: ${escapeHtml(edu.level)}</li>` : ''}
      </ul>
    </div>`).join('')}
  </div>` : ''}

  <!-- SKILLS -->
  ${sections.skills && (hasTech || hasSoft) ? `
  <div>
    <div class="sec-title">Areas of Expertise</div>
    <div class="badge-list">
      ${hasTech ? skills.technical.map((s: any) => `<span class="badge">${escapeHtml(s.name)}</span>`).join('') : ''}
      ${hasSoft ? skills.soft.map((s: string) => `<span class="badge">${escapeHtml(s)}</span>`).join('') : ''}
    </div>
  </div>` : ''}

  <!-- PROJECTS -->
  ${sections.projects && projects?.projects?.length ? `
  <div>
    <div class="sec-title">Key Projects & Publications</div>
    ${projects.projects.map((p: any) => `
    <div class="entry">
      <div class="entry-head">
        <span>${renderProjectTitleHtml(p, escapeHtml)}</span>
        ${p.role ? `<span style="font-weight:normal; font-size:12px; color:#4a5568;">${escapeHtml(p.role)}</span>` : ''}
      </div>
      <div class="text-block" style="margin-top:2px;">${escapeHtml(p.overview)}</div>
    </div>`).join('')}
  </div>` : ''}

  <!-- CERTIFICATES & ACHIEVEMENTS -->
  ${(sections.certificates && certificates?.length) || (sections.achievements && achievements.length) ? `
  <div>
    <div class="sec-title">Certifications & Honors</div>
    ${sections.certificates && certificates?.length ? `
    <div style="font-size:12px; margin-bottom:6px;">
      <strong>Certifications:</strong> ${certificates.map(c => `${escapeHtml(c.name)}${c.organization ? ` (${escapeHtml(c.organization)})` : ''}`).join(', ')}
    </div>` : ''}
    ${sections.achievements && achievements.length ? `
    <div style="font-size:12px;">
      <strong>Honors & Awards:</strong> ${achievements.map(a => escapeHtml(a.title)).join('; ')}
    </div>` : ''}
  </div>` : ''}

  <!-- LANGUAGES -->
  ${sections.languages && langint?.language?.length ? `
  <div>
    <div class="sec-title">Languages</div>
    <div class="badge-list">
      ${langint.language.map((l: any) => `<span class="badge">${escapeHtml(l.name)} — ${escapeHtml(l.proficiency)}</span>`).join('')}
    </div>
  </div>` : ''}

  ${renderDeclaration(profile, sections.declaration)}
  ${MADE_WITH_BADGE}
</div>
</body>
</html>`
}

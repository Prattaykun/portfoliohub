// lib/server/templates/slateProfessional.ts
// Template 3: Slate Professional — slate blue header banner, Playfair Display + Lato
// Two-column body: left contact/edu/skills, right about/experience

import { escapeHtml, formatDate, renderStars, extractAchievements, renderDeclaration, MADE_WITH_BADGE } from '../templateHelpers'
import { renderProjectTitleHtml } from '../withPortfolioContactLink'
import type { SectionToggles } from '@/lib/resumeTemplates'

export function generateSlateProfessionalHTML(
  profile: any, about: any, skills: any, projects: any,
  contact: any, langint: any, certificates: any[],
  sections: SectionToggles
): string {
  const achievements = extractAchievements(skills)
  const hasTech = !!(skills?.technical?.length)
  const hasSoft = !!(skills?.soft?.length)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(profile.full_name)} - Resume</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@400;700&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Lato',sans-serif; color:#333; background:#fff; width:210mm; margin:0 auto; }

.header { background:#b8c5cc; display:flex; align-items:center; padding:30px 35px; gap:25px; }
.header-photo { width:110px; height:110px; border-radius:50%; object-fit:cover; border:4px solid #fff; }
.header-text { }
.header-name { font-family:'Playfair Display',serif; font-size:28px; color:#333; letter-spacing:3px; }
.header-role { font-size:14px; color:#555; font-style:italic; margin-top:4px; }

.contact-bar { background:#d6dfe3; display:flex; flex-wrap:wrap; gap:20px; padding:12px 35px; font-size:12px; color:#444; }
.cb-item { display:flex; align-items:center; gap:6px; }
.cb-item img { width:14px; height:14px; }

.body-wrap { display:flex; padding:0; min-height:calc(297mm - 200px); }
.left-col { width:35%; background:#f4f6f7; padding:25px 20px; }
.right-col { width:65%; padding:25px 28px; }

.sec { margin-bottom:20px; }
.sec-title { font-family:'Playfair Display',serif; font-size:16px; color:#546e7a; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid #b8c5cc; }

/* Left column items */
.l-item { margin-bottom:14px; }
.l-title { font-weight:700; font-size:13px; color:#333; }
.l-sub { font-size:12px; color:#546e7a; font-weight:700; }
.l-date { font-size:11.5px; color:#888; }
.l-desc { font-size:12px; color:#555; margin-top:2px; }
.l-skill { display:inline-block; font-size:12px; padding:4px 10px; background:#fff; border:1px solid #ccc; border-radius:4px; margin:3px 4px 3px 0; }
.l-lang { display:flex; justify-content:space-between; align-items:center; padding:5px 0; border-bottom:1px solid #e0e0e0; font-size:12px; }

/* Right column items */
.r-about { font-size:13px; line-height:1.7; text-align:justify; color:#444; }
.exp-block { margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid #eee; }
.exp-dates { font-size:12px; color:#546e7a; font-weight:700; }
.exp-company { font-size:11.5px; color:#888; }
.exp-title { font-size:14px; font-weight:700; color:#333; margin-top:2px; }
.exp-desc { font-size:12.5px; color:#444; margin-top:6px; line-height:1.6; }
.exp-desc ul { padding-left:18px; margin-top:4px; }
.exp-desc li { margin-bottom:3px; }

.proj-block { margin-bottom:14px; }
.proj-title { font-weight:700; font-size:13px; color:#333; }
.proj-desc { font-size:12px; color:#444; margin-top:3px; line-height:1.5; }
.proj-tech { font-size:11.5px; color:#546e7a; margin-top:4px; font-style:italic; }

.ach-item { font-size:12px; color:#444; margin-bottom:6px; padding-left:14px; position:relative; }
.ach-item:before { content:"▹"; position:absolute; left:0; color:#546e7a; }

@media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style>
</head>
<body>
  <!-- HEADER -->
  <div class="header">
    ${profile.photo_url ? `<img src="${escapeHtml(profile.photo_url)}" class="header-photo" alt="Photo" />` : ''}
    <div class="header-text">
      <div class="header-name">${escapeHtml(profile.full_name.toUpperCase())}</div>
      <div class="header-role">${about.roles?.map((r: string) => escapeHtml(r)).join(' • ') || ''}</div>
    </div>
  </div>

  <!-- CONTACT BAR -->
  ${sections.contacts !== false ? `
  <div class="contact-bar">
    ${contact.phone ? `<div class="cb-item"><img src="https://img.icons8.com/?size=100&id=9730&format=png&color=000000" />${escapeHtml(contact.phone)}</div>` : ''}
    ${contact.email ? `<div class="cb-item"><img src="https://img.icons8.com/?size=100&id=12623&format=png&color=000000" />${escapeHtml(contact.email)}</div>` : ''}
    ${contact.address ? `<div class="cb-item"><img src="https://img.icons8.com/?size=100&id=7880&format=png&color=000000" />${escapeHtml(contact.address)}</div>` : ''}
    ${contact.linkedin ? `<div class="cb-item"><img src="https://www.google.com/s2/favicons?domain=linkedin.com&sz=128" />${escapeHtml(contact.linkedin.replace(/^https?:\/\//,'').replace(/^www\./,''))}</div>` : ''}
    ${contact.github ? `<div class="cb-item"><img src="https://www.google.com/s2/favicons?domain=github.com&sz=128" />${escapeHtml(contact.github.replace(/^https?:\/\//,'').replace(/^www\./,''))}</div>` : ''}
    ${Array.isArray(contact.other_links) ? contact.other_links.map((link: any) => {
      if (!link?.url) return ''
      const label = link.name ? `${link.name}: ${link.url.replace(/^https?:\/\//,'').replace(/^www\./,'')}` : link.url.replace(/^https?:\/\//,'').replace(/^www\./,'')
      const iconUrl = link.logo_url || `https://www.google.com/s2/favicons?domain=${encodeURIComponent(link.url)}&sz=128`
      return `<div class="cb-item"><img src="${escapeHtml(iconUrl)}" />${escapeHtml(label)}</div>`
    }).join('') : ''}
  </div>` : ''}

  <!-- BODY -->
  <div class="body-wrap">
    <!-- LEFT COLUMN -->
    <div class="left-col">
      ${sections.education && about.education?.length ? `
      <div class="sec">
        <div class="sec-title">EDUCATION</div>
        ${about.education.map((edu: any) => `
        <div class="l-item">
          <div class="l-title">${escapeHtml(edu.degree)}</div>
          <div class="l-sub">${escapeHtml(edu.institution)}</div>
          <div class="l-date">${formatDate(edu.startYear)} - ${edu.pursuing ? 'Present' : formatDate(edu.endYear)}</div>
          <div class="l-desc">Grade: ${escapeHtml(edu.grade)}${edu.gradeScale ? `/${escapeHtml(edu.gradeScale)}` : ''}</div>
        </div>`).join('')}
      </div>` : ''}

      ${sections.skills && (hasTech || hasSoft) ? `
      <div class="sec">
        <div class="sec-title">SKILLS</div>
        ${hasTech ? skills.technical.map((s: any) => `<span class="l-skill">${escapeHtml(s.name)}</span>`).join('') : ''}
        ${hasSoft ? `<div style="margin-top:8px;">${skills.soft.map((s: string) => `<span class="l-skill">${escapeHtml(s)}</span>`).join('')}</div>` : ''}
      </div>` : ''}

      ${sections.languages && langint?.language?.length ? `
      <div class="sec">
        <div class="sec-title">LANGUAGE</div>
        ${langint.language.map((l: any) => `
        <div class="l-lang">
          <span>${escapeHtml(l.name)}</span>
          <span style="color:#888;">${escapeHtml(l.proficiency)}</span>
        </div>`).join('')}
      </div>` : ''}

      ${sections.certificates && certificates?.length ? `
      <div class="sec">
        <div class="sec-title">CERTIFICATIONS</div>
        ${certificates.map(c => `
        <div class="l-item">
          <div class="l-title">${escapeHtml(c.name)}</div>
          ${c.organization ? `<div class="l-sub">${escapeHtml(c.organization)}</div>` : ''}
          ${c.issue_date ? `<div class="l-date">${formatDate(c.issue_date)}</div>` : ''}
        </div>`).join('')}
      </div>` : ''}

      ${sections.interests && langint?.interest?.length ? `
      <div class="sec">
        <div class="sec-title">INTERESTS</div>
        ${langint.interest.map((i: string) => `<span class="l-skill">${escapeHtml(i)}</span>`).join('')}
      </div>` : ''}
    </div>

    <!-- RIGHT COLUMN -->
    <div class="right-col">
      ${sections.objective && about.bio ? `
      <div class="sec">
        <div class="sec-title">About Me</div>
        <div class="r-about">${escapeHtml(about.bio)}</div>
      </div>` : ''}

      ${sections.experience && about.experience?.length ? `
      <div class="sec">
        <div class="sec-title">WORK EXPERIENCE</div>
        ${about.experience.map((comp: any) => {
          const roles = Array.isArray(comp.roles) ? comp.roles : []
          return roles.map((role: any) => `
          <div class="exp-block">
            <div class="exp-dates">${formatDate(role.start)} - ${role.present ? 'Present' : formatDate(role.end)}</div>
            <div class="exp-company">${escapeHtml(comp.company)}</div>
            <div class="exp-title">${escapeHtml(role.title)}</div>
            ${role.description ? `<div class="exp-desc">${escapeHtml(role.description)}</div>` : ''}
          </div>`).join('')
        }).join('')}
      </div>` : ''}

      ${sections.projects && projects?.projects?.length ? `
      <div class="sec">
        <div class="sec-title">PROJECTS</div>
        ${projects.projects.map((p: any) => `
        <div class="proj-block">
          <div class="proj-title">${renderProjectTitleHtml(p, escapeHtml)}</div>
          <div class="proj-desc">${escapeHtml(p.overview)}</div>
          ${p.techStack?.length ? `<div class="proj-tech">Tech: ${p.techStack.map((t: any) => escapeHtml(t.name)).join(', ')}</div>` : ''}
        </div>`).join('')}
      </div>` : ''}

      ${sections.achievements && achievements.length ? `
      <div class="sec">
        <div class="sec-title">ACHIEVEMENTS</div>
        ${achievements.map(a => `<div class="ach-item">${escapeHtml(a.title)}${a.description ? ` — ${escapeHtml(a.description)}` : ''}</div>`).join('')}
      </div>` : ''}

      ${renderDeclaration(profile, sections.declaration)}
      ${MADE_WITH_BADGE}
    </div>
  </div>
</body>
</html>`
}

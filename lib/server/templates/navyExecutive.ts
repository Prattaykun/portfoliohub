// lib/server/templates/navyExecutive.ts
// Template 4: Navy Executive — dark navy header, timeline dots, Playfair Display + Open Sans

import { escapeHtml, formatDate, extractAchievements, renderDeclaration, MADE_WITH_BADGE } from '../templateHelpers'
import type { SectionToggles } from '@/lib/resumeTemplates'

export function generateNavyExecutiveHTML(
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
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Open Sans',sans-serif; color:#333; background:#fff; width:210mm; margin:0 auto; }

.header { background:#1a2332; color:#fff; padding:30px 35px; display:flex; align-items:center; gap:25px; }
.header-photo { width:110px; height:110px; border-radius:50%; object-fit:cover; border:4px solid rgba(255,255,255,0.3); }
.header-info { flex:1; }
.header-name { font-family:'Playfair Display',serif; font-size:28px; letter-spacing:3px; font-weight:400; }
.header-role { font-size:13px; letter-spacing:4px; color:#8899aa; margin-top:4px; }
.header-summary { font-size:12px; color:#aabbcc; margin-top:12px; line-height:1.6; }

.body-wrap { display:flex; min-height:calc(297mm - 180px); }
.left-col { width:35%; padding:25px 20px; border-right:1px solid #e8e8e8; }
.right-col { width:65%; padding:25px 28px; }

.sec { margin-bottom:22px; }
.sec-title { font-family:'Playfair Display',serif; font-size:18px; color:#1a2332; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid #1a2332; }
.sec-title-light { font-family:'Playfair Display',serif; font-size:15px; color:#1a2332; margin-bottom:10px; }

.contact-row { display:flex; align-items:flex-start; gap:10px; margin-bottom:10px; font-size:12px; color:#555; }
.contact-row img { width:14px; height:14px; margin-top:2px; }
.contact-label { font-size:11px; color:#888; }

.l-item { margin-bottom:14px; }
.l-dates { font-size:11.5px; color:#1a2332; font-weight:700; }
.l-title { font-weight:700; font-size:13px; color:#1a2332; }
.l-sub { font-size:12px; color:#666; }
.l-desc { font-size:11.5px; color:#555; margin-top:2px; }

.expertise-item { font-size:12px; color:#444; padding:4px 0; padding-left:16px; position:relative; }
.expertise-item:before { content:"•"; position:absolute; left:4px; color:#1a2332; font-weight:700; }

.lang-item { font-size:12px; color:#444; padding:4px 0; }

/* Timeline experience */
.timeline-entry { position:relative; padding-left:28px; margin-bottom:20px; }
.timeline-dot { position:absolute; left:0; top:4px; width:14px; height:14px; border:3px solid #1a2332; border-radius:50%; background:#fff; }
.timeline-line { position:absolute; left:6px; top:18px; bottom:-8px; width:2px; background:#ddd; }
.tl-dates { font-size:12px; color:#1a2332; font-weight:700; }
.tl-company { font-size:11.5px; color:#888; }
.tl-title { font-weight:700; font-size:14px; color:#333; margin-top:2px; }
.tl-desc { font-size:12.5px; color:#444; margin-top:6px; line-height:1.6; text-align:justify; }

.proj-block { margin-bottom:14px; }
.proj-title { font-weight:700; font-size:13px; color:#1a2332; }
.proj-desc { font-size:12px; color:#444; margin-top:3px; line-height:1.5; }
.proj-tech { font-size:11.5px; color:#1a2332; margin-top:4px; font-style:italic; }

.ach-item { font-size:12px; color:#444; margin-bottom:6px; padding-left:14px; position:relative; }
.ach-item:before { content:"▸"; position:absolute; left:0; color:#1a2332; }

.skill-pill { display:inline-block; font-size:11.5px; padding:3px 10px; background:#f0f2f5; border:1px solid #d0d5dd; border-radius:4px; margin:3px 4px 3px 0; }

@media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style>
</head>
<body>
  <!-- HEADER -->
  <div class="header">
    ${profile.photo_url ? `<img src="${escapeHtml(profile.photo_url)}" class="header-photo" alt="Photo" />` : ''}
    <div class="header-info">
      <div class="header-name">${escapeHtml(profile.full_name)}</div>
      <div class="header-role">${about.roles?.map((r: string) => escapeHtml(r)).join('  •  ') || ''}</div>
      ${sections.objective && about.bio ? `<div class="header-summary">${escapeHtml(about.bio)}</div>` : ''}
    </div>
  </div>

  <div class="body-wrap">
    <!-- LEFT COLUMN -->
    <div class="left-col">
      ${sections.contacts !== false ? `
      <div class="sec">
        <div class="sec-title">Contact</div>
        ${contact.phone ? `<div class="contact-row"><img src="https://img.icons8.com/?size=100&id=9730&format=png&color=000000" /><div><div class="contact-label">Phone</div>${escapeHtml(contact.phone)}</div></div>` : ''}
        ${contact.email ? `<div class="contact-row"><img src="https://img.icons8.com/?size=100&id=12623&format=png&color=000000" /><div><div class="contact-label">Email</div>${escapeHtml(contact.email)}</div></div>` : ''}
        ${contact.address ? `<div class="contact-row"><img src="https://img.icons8.com/?size=100&id=7880&format=png&color=000000" /><div><div class="contact-label">Address</div>${escapeHtml(contact.address)}</div></div>` : ''}
        ${contact.linkedin ? `<div class="contact-row"><img src="https://www.google.com/s2/favicons?domain=linkedin.com&sz=128" /><div><div class="contact-label">LinkedIn</div>${escapeHtml(contact.linkedin.replace(/^https?:\/\//,'').replace(/^www\./,''))}</div></div>` : ''}
        ${contact.github ? `<div class="contact-row"><img src="https://www.google.com/s2/favicons?domain=github.com&sz=128" /><div><div class="contact-label">GitHub</div>${escapeHtml(contact.github.replace(/^https?:\/\//,'').replace(/^www\./,''))}</div></div>` : ''}
        ${Array.isArray(contact.other_links) ? contact.other_links.map((link: any) => {
          if (!link?.url) return ''
          const name = link.name || 'Link'
          const displayUrl = link.url.replace(/^https?:\/\//,'').replace(/^www\./,'')
          const iconUrl = link.logo_url || `https://www.google.com/s2/favicons?domain=${encodeURIComponent(link.url)}&sz=128`
          return `<div class="contact-row"><img src="${escapeHtml(iconUrl)}" /><div><div class="contact-label">${escapeHtml(name)}</div>${escapeHtml(displayUrl)}</div></div>`
        }).join('') : ''}
      </div>` : ''}

      ${sections.education && about.education?.length ? `
      <div class="sec">
        <div class="sec-title">Education</div>
        ${about.education.map((edu: any) => `
        <div class="l-item">
          <div class="l-dates">${formatDate(edu.startYear)} - ${edu.pursuing ? 'Present' : formatDate(edu.endYear)}</div>
          <div class="l-title">${escapeHtml(edu.degree)}</div>
          <div class="l-sub">${escapeHtml(edu.institution)}</div>
        </div>`).join('')}
      </div>` : ''}

      ${sections.skills && (hasTech || hasSoft) ? `
      <div class="sec">
        <div class="sec-title">Expertise</div>
        ${hasTech ? skills.technical.map((s: any) => `<div class="expertise-item">${escapeHtml(s.name)}</div>`).join('') : ''}
        ${hasSoft ? skills.soft.map((s: string) => `<div class="expertise-item">${escapeHtml(s)}</div>`).join('') : ''}
      </div>` : ''}

      ${sections.languages && langint?.language?.length ? `
      <div class="sec">
        <div class="sec-title">Language</div>
        ${langint.language.map((l: any) => `<div class="lang-item"><strong>${escapeHtml(l.name)}</strong> — ${escapeHtml(l.proficiency)}</div>`).join('')}
      </div>` : ''}

      ${sections.certificates && certificates?.length ? `
      <div class="sec">
        <div class="sec-title">Certifications</div>
        ${certificates.map(c => `
        <div class="l-item">
          <div class="l-title">${escapeHtml(c.name)}</div>
          ${c.organization ? `<div class="l-sub">${escapeHtml(c.organization)}</div>` : ''}
        </div>`).join('')}
      </div>` : ''}
    </div>

    <!-- RIGHT COLUMN -->
    <div class="right-col">
      ${sections.experience && about.experience?.length ? `
      <div class="sec">
        <div class="sec-title">Experience</div>
        ${about.experience.map((comp: any) => {
          const roles = Array.isArray(comp.roles) ? comp.roles : []
          return roles.map((role: any, idx: number) => `
          <div class="timeline-entry">
            <div class="timeline-dot"></div>
            ${idx < roles.length - 1 ? '<div class="timeline-line"></div>' : ''}
            <div class="tl-dates">${formatDate(role.start)} - ${role.present ? 'Present' : formatDate(role.end)}</div>
            <div class="tl-company">${escapeHtml(comp.company)}</div>
            <div class="tl-title">${escapeHtml(role.title)}</div>
            ${role.description ? `<div class="tl-desc">${escapeHtml(role.description)}</div>` : ''}
          </div>`).join('')
        }).join('')}
      </div>` : ''}

      ${sections.projects && projects?.projects?.length ? `
      <div class="sec">
        <div class="sec-title">Projects</div>
        ${projects.projects.map((p: any) => `
        <div class="proj-block">
          <div class="proj-title">${escapeHtml(p.title)}</div>
          <div class="proj-desc">${escapeHtml(p.overview)}</div>
          ${p.techStack?.length ? `<div class="proj-tech">Tech: ${p.techStack.map((t: any) => escapeHtml(t.name)).join(', ')}</div>` : ''}
        </div>`).join('')}
      </div>` : ''}

      ${sections.achievements && achievements.length ? `
      <div class="sec">
        <div class="sec-title">Achievements</div>
        ${achievements.map(a => `<div class="ach-item">${escapeHtml(a.title)}${a.description ? ` — ${escapeHtml(a.description)}` : ''}</div>`).join('')}
      </div>` : ''}

      ${sections.interests && langint?.interest?.length ? `
      <div class="sec">
        <div class="sec-title">Interests</div>
        <div>${langint.interest.map((i: string) => `<span class="skill-pill">${escapeHtml(i)}</span>`).join('')}</div>
      </div>` : ''}

      ${renderDeclaration(profile, sections.declaration)}
      ${MADE_WITH_BADGE}
    </div>
  </div>
</body>
</html>`
}

// lib/server/templates/tealSidebar.ts
// Template 1: Teal Sidebar — two-column with teal left sidebar + peach header accent
// Font: Raleway

import { escapeHtml, formatDate, renderStars, extractAchievements, renderDeclaration, MADE_WITH_BADGE } from '../templateHelpers'
import type { SectionToggles } from '@/lib/resumeTemplates'

export function generateTealSidebarHTML(
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
<link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Raleway',sans-serif; color:#333; background:#fff; }
.page { display:flex; min-height:297mm; width:210mm; margin:0 auto; }

/* Left Sidebar */
.sidebar { width:35%; background:#2a7a7a; color:#fff; padding:0; display:flex; flex-direction:column; }
.sidebar-top { background:#f0c8b0; padding:30px 20px 20px; text-align:center; }
.sidebar-top img { width:130px; height:130px; border-radius:50%; object-fit:cover; border:4px solid #fff; }
.sidebar-body { padding:25px 20px; flex:1; }
.sidebar-section { margin-bottom:22px; }
.sidebar-title { font-size:13px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:10px; color:#fff; }
.sidebar-text { font-size:12.5px; line-height:1.6; color:#e0f0f0; }
.contact-row { display:flex; align-items:flex-start; gap:8px; margin-bottom:8px; font-size:12px; color:#e0f0f0; }
.contact-row img { width:14px; height:14px; filter:brightness(0) invert(1); margin-top:2px; flex-shrink:0; }

/* Right Content */
.content { width:65%; padding:30px 28px; }
.header-area { margin-bottom:20px; padding-bottom:15px; border-bottom:2px solid #2a7a7a; }
.name { font-size:28px; font-weight:700; color:#2a7a7a; line-height:1.2; }
.role { font-size:15px; color:#888; font-style:italic; margin-top:4px; }
.section { margin-bottom:18px; }
.section-title { font-size:13px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#333; margin-bottom:10px; display:flex; align-items:center; gap:8px; }
.section-title .chevron { color:#2a7a7a; font-size:14px; font-weight:900; }
.edu-item, .exp-item, .proj-item, .cert-item { margin-bottom:14px; }
.item-name { font-weight:700; font-size:13px; color:#222; text-transform:uppercase; letter-spacing:0.5px; }
.item-sub { font-size:12.5px; color:#555; font-style:italic; }
.item-date { font-size:12px; color:#888; }
.item-desc { font-size:12.5px; color:#444; margin-top:4px; line-height:1.5; }
.skill-pill { display:inline-block; background:#f0f7f7; border:1px solid #cde5e5; padding:4px 10px; border-radius:4px; font-size:12px; margin:3px 4px 3px 0; }
.ach-item { margin-bottom:8px; padding-left:16px; position:relative; font-size:12.5px; }
.ach-item:before { content:"▸"; position:absolute; left:0; color:#2a7a7a; font-weight:700; }
.lang-row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #f0f0f0; font-size:12.5px; }

@media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style>
</head>
<body>
<div class="page">
  <!-- LEFT SIDEBAR -->
  <div class="sidebar">
    <div class="sidebar-top">
      ${profile.photo_url ? `<img src="${escapeHtml(profile.photo_url)}" alt="Photo" />` : ''}
    </div>
    <div class="sidebar-body">
      ${sections.objective && about.bio ? `
      <div class="sidebar-section">
        <div class="sidebar-title">PROFILE</div>
        <div class="sidebar-text">${escapeHtml(about.bio)}</div>
      </div>` : ''}

      ${sections.contacts !== false ? `
      <div class="sidebar-section">
        <div class="sidebar-title">CONTACT ME</div>
        ${contact.phone ? `<div class="contact-row"><img src="https://img.icons8.com/?size=100&id=9730&format=png&color=000000" /><span>${escapeHtml(contact.phone)}</span></div>` : ''}
        ${contact.email ? `<div class="contact-row"><img src="https://img.icons8.com/?size=100&id=12623&format=png&color=000000" /><span>${escapeHtml(contact.email)}</span></div>` : ''}
        ${contact.address ? `<div class="contact-row"><img src="https://img.icons8.com/?size=100&id=7880&format=png&color=000000" /><span>${escapeHtml(contact.address)}</span></div>` : ''}
        ${contact.linkedin ? `<div class="contact-row"><img src="https://www.google.com/s2/favicons?domain=linkedin.com&sz=128" /><span>${escapeHtml(contact.linkedin.replace(/^https?:\/\//,'').replace(/^www\./,''))}</span></div>` : ''}
        ${contact.github ? `<div class="contact-row"><img src="https://www.google.com/s2/favicons?domain=github.com&sz=128" /><span>${escapeHtml(contact.github.replace(/^https?:\/\//,'').replace(/^www\./,''))}</span></div>` : ''}
        ${Array.isArray(contact.other_links) ? contact.other_links.map((link: any) => {
          if (!link?.url) return ''
          const label = link.name ? `${link.name}: ${link.url.replace(/^https?:\/\//,'').replace(/^www\./,'')}` : link.url.replace(/^https?:\/\//,'').replace(/^www\./,'')
          const iconUrl = link.logo_url || `https://www.google.com/s2/favicons?domain=${encodeURIComponent(link.url)}&sz=128`
          return `<div class="contact-row"><img src="${escapeHtml(iconUrl)}" /><span>${escapeHtml(label)}</span></div>`
        }).join('') : ''}
      </div>` : ''}

      ${sections.languages && langint?.language?.length ? `
      <div class="sidebar-section">
        <div class="sidebar-title">LANGUAGE</div>
        ${langint.language.map((l: any) => `<div style="margin-bottom:4px;font-size:12.5px;color:#e0f0f0;">${escapeHtml(l.name)} — <em>${escapeHtml(l.proficiency)}</em></div>`).join('')}
      </div>` : ''}
    </div>
  </div>

  <!-- RIGHT CONTENT -->
  <div class="content">
    <div class="header-area">
      <div class="name">${escapeHtml(profile.full_name)}</div>
      <div class="role">${about.roles?.map((r: string) => escapeHtml(r)).join(' • ') || ''}</div>
    </div>

    ${sections.education && about.education?.length ? `
    <div class="section">
      <div class="section-title"><span class="chevron">»</span> EDUCATION</div>
      ${about.education.map((edu: any) => `
      <div class="edu-item">
        <div class="item-name">${escapeHtml(edu.institution)}</div>
        <div class="item-sub">${escapeHtml(edu.degree)}${edu.domain ? `, ${escapeHtml(edu.domain)}` : ''}${edu.pursuing ? ' (in progress)' : ''}</div>
        <div class="item-date">${formatDate(edu.startYear)} - ${edu.pursuing ? 'Present' : formatDate(edu.endYear)}</div>
      </div>`).join('')}
    </div>` : ''}

    ${sections.skills && (hasTech || hasSoft) ? `
    <div class="section">
      <div class="section-title"><span class="chevron">»</span> SKILLS</div>
      ${hasTech ? `<div style="margin-bottom:8px;">${skills.technical.map((s: any) => `<span class="skill-pill">${escapeHtml(s.name)}</span>`).join('')}</div>` : ''}
      ${hasSoft ? `<div>${skills.soft.map((s: string) => `<span class="skill-pill">${escapeHtml(s)}</span>`).join('')}</div>` : ''}
    </div>` : ''}

    ${sections.experience && about.experience?.length ? `
    <div class="section">
      <div class="section-title"><span class="chevron">»</span> EXPERIENCE</div>
      ${about.experience.map((comp: any) => {
        const roles = Array.isArray(comp.roles) ? comp.roles : []
        return `
        <div class="exp-item">
          <div class="item-name">${escapeHtml(comp.company)}</div>
          ${roles.map((role: any) => `
            <div style="margin-top:6px;padding-left:10px;border-left:2px solid #cde5e5;">
              <div class="item-sub">${escapeHtml(role.title)}</div>
              <div class="item-date">${formatDate(role.start)} - ${role.present ? 'Present' : formatDate(role.end)}</div>
              ${role.description ? `<div class="item-desc">${escapeHtml(role.description)}</div>` : ''}
            </div>`).join('')}
        </div>`
      }).join('')}
    </div>` : ''}

    ${sections.projects && projects?.projects?.length ? `
    <div class="section">
      <div class="section-title"><span class="chevron">»</span> PROJECTS</div>
      ${projects.projects.map((p: any) => `
      <div class="proj-item">
        <div class="item-name">${escapeHtml(p.title)}</div>
        <div class="item-sub">Role: ${escapeHtml(p.role)}</div>
        <div class="item-desc">${escapeHtml(p.overview)}</div>
        ${p.techStack?.length ? `<div style="margin-top:4px;">${p.techStack.map((t: any) => `<span class="skill-pill">${escapeHtml(t.name)}</span>`).join('')}</div>` : ''}
      </div>`).join('')}
    </div>` : ''}

    ${sections.achievements && achievements.length ? `
    <div class="section">
      <div class="section-title"><span class="chevron">»</span> ACHIEVEMENTS</div>
      ${achievements.map(a => `<div class="ach-item"><strong>${escapeHtml(a.title)}</strong>${a.description ? ` — ${escapeHtml(a.description)}` : ''}</div>`).join('')}
    </div>` : ''}

    ${sections.certificates && certificates?.length ? `
    <div class="section">
      <div class="section-title"><span class="chevron">»</span> CERTIFICATIONS</div>
      ${certificates.map(c => `
      <div class="cert-item">
        <div class="item-name">${escapeHtml(c.name)}</div>
        ${c.organization ? `<div class="item-sub">${escapeHtml(c.organization)}</div>` : ''}
        ${c.issue_date ? `<div class="item-date">${formatDate(c.issue_date)}</div>` : ''}
      </div>`).join('')}
    </div>` : ''}

    ${sections.interests && langint?.interest?.length ? `
    <div class="section">
      <div class="section-title"><span class="chevron">»</span> INTERESTS</div>
      <div>${langint.interest.map((i: string) => `<span class="skill-pill">${escapeHtml(i)}</span>`).join('')}</div>
    </div>` : ''}

    ${renderDeclaration(profile, sections.declaration)}
    ${MADE_WITH_BADGE}
  </div>
</div>
</body>
</html>`
}

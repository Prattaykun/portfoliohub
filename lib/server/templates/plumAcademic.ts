// lib/server/templates/plumAcademic.ts
// Template 2: Plum Academic — dark plum sidebar, ■ square bullets, Montserrat font
// Great for students with projects & achievements

import { escapeHtml, formatDate, extractAchievements, renderDeclaration, MADE_WITH_BADGE } from '../templateHelpers'
import type { SectionToggles } from '@/lib/resumeTemplates'

export function generatePlumAcademicHTML(
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
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Montserrat',sans-serif; color:#333; background:#fff; }
.page { display:flex; min-height:297mm; width:210mm; margin:0 auto; }

.sidebar { width:33%; background:#4a1942; color:#fff; display:flex; flex-direction:column; }
.sidebar-photo { text-align:center; padding:30px 20px 15px; }
.sidebar-photo img { width:120px; height:120px; border-radius:50%; object-fit:cover; border:4px solid #fff; }
.sidebar-body { padding:10px 20px 25px; flex:1; }
.sb-section { margin-bottom:20px; }
.sb-title { font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:10px; color:#e8c8e0; border-bottom:1px solid rgba(255,255,255,0.2); padding-bottom:6px; }
.sb-row { display:flex; align-items:flex-start; gap:8px; margin-bottom:7px; font-size:11.5px; color:#f0e0f0; }
.sb-row img { width:14px; height:14px; filter:brightness(0) invert(1); margin-top:2px; flex-shrink:0; }
.sb-item { font-size:12px; color:#f0e0f0; margin-bottom:5px; display:flex; align-items:center; gap:6px; }
.sb-item .bullet { color:#e8c8e0; font-size:10px; }
.sb-skill-item { display:flex; align-items:center; gap:6px; font-size:12px; color:#f0e0f0; margin-bottom:5px; }
.sb-skill-item img { width:14px; height:14px; border-radius:2px; }

.content { width:67%; padding:0; }
.header-banner { background:linear-gradient(135deg,#4a1942 0%,#6b2d63 100%); color:#fff; padding:28px 28px 20px; }
.header-name { font-size:26px; font-weight:700; letter-spacing:1px; }
.header-role { font-size:13px; font-weight:500; letter-spacing:3px; text-transform:uppercase; margin-top:4px; color:#e8c8e0; }
.content-body { padding:22px 28px; }
.section { margin-bottom:18px; }
.section-title { font-size:13px; font-weight:700; letter-spacing:2.5px; text-transform:uppercase; color:#4a1942; margin-bottom:10px; display:flex; align-items:center; gap:8px; }
.section-title .icon { width:18px; height:18px; background:#4a1942; border-radius:3px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:10px; }
.prof-text { font-size:12.5px; line-height:1.7; text-align:justify; color:#444; }

.entry { margin-bottom:14px; display:flex; gap:10px; }
.entry-bullet { color:#4a1942; font-size:11px; margin-top:3px; flex-shrink:0; }
.entry-body { flex:1; }
.entry-title { font-weight:700; font-size:13px; color:#222; }
.entry-sub { font-size:12px; color:#666; }
.entry-date { font-size:11.5px; color:#4a1942; font-weight:600; float:right; }
.entry-desc { font-size:12px; color:#444; margin-top:4px; line-height:1.5; }
.tech-used { font-size:11.5px; color:#4a1942; font-style:italic; margin-top:4px; }

.lang-row { font-size:12px; color:#f0e0f0; margin-bottom:5px; }

@media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style>
</head>
<body>
<div class="page">
  <!-- LEFT SIDEBAR -->
  <div class="sidebar">
    <div class="sidebar-photo">
      ${profile.photo_url ? `<img src="${escapeHtml(profile.photo_url)}" alt="Photo" />` : ''}
    </div>
    <div class="sidebar-body">
      <div class="sb-section">
        <div class="sb-title">CONTACT</div>
        ${contact.phone ? `<div class="sb-row"><img src="https://img.icons8.com/?size=100&id=9730&format=png&color=000000" /><span>Phone:<br/>${escapeHtml(contact.phone)}</span></div>` : ''}
        ${contact.email ? `<div class="sb-row"><img src="https://img.icons8.com/?size=100&id=12623&format=png&color=000000" /><span>Email:<br/>${escapeHtml(contact.email)}</span></div>` : ''}
        ${contact.address ? `<div class="sb-row"><img src="https://img.icons8.com/?size=100&id=7880&format=png&color=000000" /><span>Address:<br/>${escapeHtml(contact.address)}</span></div>` : ''}
        ${contact.linkedin ? `<div class="sb-row"><img src="https://www.google.com/s2/favicons?domain=linkedin.com&sz=128" /><span>LinkedIn<br/>${escapeHtml(contact.linkedin.replace('https://','').replace('www.',''))}</span></div>` : ''}
        ${contact.github ? `<div class="sb-row"><img src="https://www.google.com/s2/favicons?domain=github.com&sz=128" /><span>GitHub<br/>${escapeHtml(contact.github.replace('https://','').replace('www.',''))}</span></div>` : ''}
      </div>

      ${sections.skills && hasSoft ? `
      <div class="sb-section">
        <div class="sb-title">SOFT SKILLS</div>
        ${skills.soft.map((s: string) => `<div class="sb-item"><span class="bullet">•</span> ${escapeHtml(s)}</div>`).join('')}
      </div>` : ''}

      ${sections.skills && hasTech ? `
      <div class="sb-section">
        <div class="sb-title">TECH SKILLS</div>
        ${skills.technical.map((s: any) => `
        <div class="sb-skill-item">
          ${s.logo_url ? `<img src="${escapeHtml(s.logo_url)}" />` : '<span class="bullet">•</span>'}
          <span>${escapeHtml(s.name)}</span>
        </div>`).join('')}
      </div>` : ''}

      ${sections.languages && langint?.language?.length ? `
      <div class="sb-section">
        <div class="sb-title">LANGUAGES</div>
        ${langint.language.map((l: any) => `<div class="lang-row">• ${escapeHtml(l.name)} (${escapeHtml(l.proficiency)})</div>`).join('')}
      </div>` : ''}
    </div>
  </div>

  <!-- RIGHT CONTENT -->
  <div class="content">
    <div class="header-banner">
      <div class="header-name">${escapeHtml(profile.full_name.toUpperCase())}</div>
      <div class="header-role">${about.roles?.map((r: string) => escapeHtml(r)).join(' | ') || ''}</div>
    </div>
    <div class="content-body">

      ${sections.objective && about.bio ? `
      <div class="section">
        <div class="section-title"><span class="icon">👤</span> PROFILE</div>
        <div class="prof-text">${escapeHtml(about.bio)}</div>
      </div>` : ''}

      ${sections.education && about.education?.length ? `
      <div class="section">
        <div class="section-title"><span class="icon">🎓</span> EDUCATION</div>
        ${about.education.map((edu: any) => `
        <div class="entry">
          <div class="entry-bullet">■</div>
          <div class="entry-body">
            <span class="entry-date">${formatDate(edu.startYear)} - ${edu.pursuing ? 'Present' : formatDate(edu.endYear)}</span>
            <div class="entry-title">${escapeHtml(edu.degree)}</div>
            <div class="entry-sub">${escapeHtml(edu.institution)}</div>
            <div class="entry-desc">GPA: ${escapeHtml(edu.grade)}${edu.gradeScale ? `/${escapeHtml(edu.gradeScale)}` : ''}</div>
          </div>
        </div>`).join('')}
      </div>` : ''}

      ${sections.projects && projects?.projects?.length ? `
      <div class="section">
        <div class="section-title"><span class="icon">💻</span> PROJECTS</div>
        ${projects.projects.map((p: any) => `
        <div class="entry">
          <div class="entry-bullet">■</div>
          <div class="entry-body">
            <div class="entry-title">${escapeHtml(p.title)}</div>
            <div class="entry-desc">${escapeHtml(p.overview)}</div>
            ${p.techStack?.length ? `<div class="tech-used">Technologies Used: ${p.techStack.map((t: any) => escapeHtml(t.name)).join(', ')}</div>` : ''}
          </div>
        </div>`).join('')}
      </div>` : ''}

      ${sections.experience && about.experience?.length ? `
      <div class="section">
        <div class="section-title"><span class="icon">💼</span> EXPERIENCE</div>
        ${about.experience.map((comp: any) => {
          const roles = Array.isArray(comp.roles) ? comp.roles : []
          return roles.map((role: any) => `
          <div class="entry">
            <div class="entry-bullet">■</div>
            <div class="entry-body">
              <span class="entry-date">${formatDate(role.start)} - ${role.present ? 'Present' : formatDate(role.end)}</span>
              <div class="entry-title">${escapeHtml(role.title)}</div>
              <div class="entry-sub">${escapeHtml(comp.company)}</div>
              ${role.description ? `<div class="entry-desc">${escapeHtml(role.description)}</div>` : ''}
            </div>
          </div>`).join('')
        }).join('')}
      </div>` : ''}

      ${sections.achievements && achievements.length ? `
      <div class="section">
        <div class="section-title"><span class="icon">🏆</span> ACHIEVEMENTS & HACKATHONS</div>
        ${achievements.map(a => `
        <div class="entry">
          <div class="entry-bullet">■</div>
          <div class="entry-body">
            <div class="entry-desc">${escapeHtml(a.title)}${a.description ? ` — ${escapeHtml(a.description)}` : ''}</div>
          </div>
        </div>`).join('')}
      </div>` : ''}

      ${sections.certificates && certificates?.length ? `
      <div class="section">
        <div class="section-title"><span class="icon">📜</span> CERTIFICATIONS</div>
        ${certificates.map(c => `
        <div class="entry">
          <div class="entry-bullet">■</div>
          <div class="entry-body">
            <div class="entry-title">${escapeHtml(c.name)}</div>
            ${c.organization ? `<div class="entry-sub">${escapeHtml(c.organization)}</div>` : ''}
          </div>
        </div>`).join('')}
      </div>` : ''}

      ${sections.interests && langint?.interest?.length ? `
      <div class="section">
        <div class="section-title"><span class="icon">⭐</span> INTERESTS</div>
        <div>${langint.interest.map((i: string) => `<span style="display:inline-block;background:#f5f0f5;border:1px solid #d8c0d8;padding:4px 10px;border-radius:4px;font-size:12px;margin:3px 4px 3px 0;">${escapeHtml(i)}</span>`).join('')}</div>
      </div>` : ''}

      ${renderDeclaration(profile, sections.declaration)}
      ${MADE_WITH_BADGE}
    </div>
  </div>
</div>
</body>
</html>`
}

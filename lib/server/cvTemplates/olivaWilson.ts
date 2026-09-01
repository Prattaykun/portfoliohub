// lib/server/cvTemplates/olivaWilson.ts
// CV Template: Oliva Wilson Editorial
// Layout matched to reference: stacked name, contact icons right, 2-col edu+skills, 2-col experience

import { escapeHtml, formatDate, extractAchievements, renderDeclaration, MADE_WITH_BADGE, CV_FONTS_LINK, CV_FONT_CSS } from '../cvHelpers'
import { renderProjectTitleHtml } from '../withPortfolioContactLink'
import {
  renderEmailLink,
  renderGitHubLink,
  renderLinkedInLink,
  renderOtherLinkIconImg,
  renderOtherLinkText,
  renderPhoneLink,
} from '../contactLinkHelpers'
import type { CVSectionToggles } from '@/lib/cvTemplates'

export function generateOlivaWilsonCVHTML(
  profile: any, about: any, skills: any, projects: any,
  contact: any, langint: any, certificates: any[],
  sections: CVSectionToggles
): string {
  const achievements = extractAchievements(skills)
  const hasTech = !!(skills?.technical?.length)
  const hasSoft = !!(skills?.soft?.length)

  // Split full name into first + rest for stacked display
  const nameParts = (profile.full_name || '').trim().split(/\s+/)
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  // Build experience cards for 2-col grid
  const expCards: string[] = []
  if (about?.experience?.length) {
    for (const comp of about.experience) {
      const roles = Array.isArray(comp.roles) ? comp.roles : []
      for (const role of roles) {
        const dateRange = `${formatDate(role.start)} - ${role.present ? 'Now' : formatDate(role.end)}`
        const descLines = role.description
          ? role.description.split('. ').filter(Boolean).map((d: string) => escapeHtml(d.replace(/\.$/, ''))).join('. ') + '.'
          : ''
        expCards.push(`
          <div class="exp-card">
            <div class="exp-title">${escapeHtml(role.title)}</div>
            <div class="exp-meta">${escapeHtml(comp.company)}, ${dateRange}</div>
            ${descLines ? `<div class="exp-desc">${descLines}</div>` : ''}
          </div>`)
      }
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(profile.full_name)} - CV</title>
${CV_FONTS_LINK}
<style>
${CV_FONT_CSS}

* { margin:0; padding:0; box-sizing:border-box; }
body {
  font-family: var(--font-body);
  color: #1a1a1a;
  background: #fff;
  line-height: 1.55;
  font-size: 12px;
  font-weight: 400;
}
.page {
  width: 210mm;
  min-height: 297mm;
  padding: 0;
  margin: 0 auto;
  background: #fff;
}

/* ===== HEADER ===== */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 20px;
  border-bottom: 1.5px solid #1a1a1a;
  margin-bottom: 12px;
}
.header-left {
  flex: 1;
}
.header-name {
  font-family: var(--font-heading);
  font-size: 52px;
  font-weight: 400;
  color: #000;
  line-height: 1.05;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.header-role {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-top: 8px;
}
.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  padding-top: 8px;
  min-width: 200px;
}
.contact-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11.5px;
  color: #222;
}
.contact-row .c-icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.contact-row .c-icon svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: #1a1a1a;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ===== BIO ===== */
.bio-section {
  padding: 16px 0;
  border-bottom: 1px solid #1a1a1a;
  font-size: 11.5px;
  line-height: 1.65;
  color: #333;
  text-align: justify;
}

/* ===== SECTION DIVIDER ===== */
.cv-section {
  padding: 18px 0;
  border-bottom: 1px solid #1a1a1a;
}
.cv-section:last-of-type {
  border-bottom: none;
}

/* ===== SECTION HEADING ===== */
.section-heading {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 400;
  text-transform: uppercase;
  color: #000;
  letter-spacing: 2px;
  margin-bottom: 14px;
  line-height: 1.2;
}

/* ===== 2-COLUMN LAYOUT (Education + Skills) ===== */
.two-col {
  display: flex;
  gap: 40px;
}
.two-col .col {
  flex: 1;
  min-width: 0;
}

/* ===== EDUCATION ENTRIES ===== */
.edu-entry {
  margin-bottom: 14px;
}
.edu-entry:last-child { margin-bottom: 0; }
.edu-dates {
  font-size: 11px;
  color: #555;
  margin-bottom: 2px;
}
.edu-school {
  font-size: 12.5px;
  font-weight: 700;
  color: #000;
}
.edu-degree {
  font-size: 11.5px;
  color: #444;
}
.edu-extra {
  font-size: 11px;
  color: #666;
  margin-top: 2px;
}

/* ===== SKILLS LIST ===== */
.skills-list {
  list-style: disc;
  padding-left: 18px;
  font-size: 12px;
  color: #333;
}
.skills-list li {
  margin-bottom: 5px;
  line-height: 1.5;
}

/* ===== EXPERIENCE 2-COL GRID ===== */
.exp-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 30px;
}
.exp-card {}
.exp-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #000;
}
.exp-meta {
  font-size: 11px;
  color: #555;
  margin-bottom: 4px;
}
.exp-desc {
  font-size: 11px;
  line-height: 1.55;
  color: #444;
  text-align: justify;
}

/* ===== PROJECTS ===== */
.project-block {
  margin-bottom: 14px;
}
.project-block:last-child { margin-bottom: 0; }
.project-title {
  font-weight: 700;
  font-size: 12.5px;
  color: #000;
}
.project-role {
  font-size: 11px;
  color: #555;
  font-style: italic;
}
.project-overview {
  font-size: 11.5px;
  color: #444;
  margin-top: 3px;
  text-align: justify;
}
.project-tech {
  font-size: 11px;
  color: #555;
  font-style: italic;
  margin-top: 3px;
}

/* ===== CERTIFICATES ===== */
.cert-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 30px;
}
.cert-name {
  font-weight: 700;
  font-size: 12px;
  color: #000;
}
.cert-org {
  font-size: 11px;
  color: #666;
}

/* ===== ACHIEVEMENTS ===== */
.ach-list {
  list-style: disc;
  padding-left: 18px;
  font-size: 12px;
  color: #333;
}
.ach-list li {
  margin-bottom: 5px;
  line-height: 1.5;
}

/* ===== LANGUAGES ===== */
.lang-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.lang-pill {
  font-size: 11px;
  padding: 4px 12px;
  border: 1px solid #ccc;
  border-radius: 3px;
  color: #333;
  background: #fafafa;
}

@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
</style>
</head>
<body>
<div class="page">

  <!-- HEADER: Stacked Name (left) + Contact Icons (right) -->
  <div class="header">
    <div class="header-left">
      <div class="header-name">${escapeHtml(firstName)}${lastName ? `<br>${escapeHtml(lastName)}` : ''}</div>
      ${about?.roles?.length ? `<div class="header-role">${escapeHtml(about.roles[0])}</div>` : ''}
    </div>
    ${sections.contacts !== false ? `
    <div class="header-right">
      ${contact.phone ? `
      <div class="contact-row">
        <span class="c-icon"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg></span>
        <span>${renderPhoneLink(contact.phone, escapeHtml)}</span>
      </div>` : ''}
      ${contact.email ? `
      <div class="contact-row">
        <span class="c-icon"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
        <span>${renderEmailLink(contact.email, escapeHtml)}</span>
      </div>` : ''}
      ${contact.address ? `
      <div class="contact-row">
        <span class="c-icon"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
        <span>${escapeHtml(contact.address)}</span>
      </div>` : ''}
      ${contact.linkedin ? `
      <div class="contact-row">
        <span class="c-icon"><svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></span>
        <span>${renderLinkedInLink(contact.linkedin, escapeHtml)}</span>
      </div>` : ''}
      ${contact.github ? `
      <div class="contact-row">
        <span class="c-icon"><svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg></span>
        <span>${renderGitHubLink(contact.github, escapeHtml)}</span>
      </div>` : ''}
      ${Array.isArray(contact.other_links) ? contact.other_links.map((link: any) => {
        if (!link?.url) return ''
        return `
        <div class="contact-row">
          <span class="c-icon">${renderOtherLinkIconImg(link, escapeHtml, 14)}</span>
          <span>${renderOtherLinkText(link, escapeHtml)}</span>
        </div>`
      }).join('') : ''}
    </div>` : ''}
  </div>

  <!-- BIO / SUMMARY -->
  ${sections.objective && about?.bio ? `
  <div class="bio-section">${escapeHtml(about.bio)}</div>` : ''}

  <!-- EDUCATION + SKILLS (side-by-side 2 columns) -->
  ${(sections.education && about?.education?.length) || (sections.skills && (hasTech || hasSoft)) ? `
  <div class="cv-section">
    <div class="two-col">
      ${sections.education && about?.education?.length ? `
      <div class="col">
        <div class="section-heading">Education</div>
        ${about.education.map((edu: any) => `
        <div class="edu-entry">
          <div class="edu-dates">${formatDate(edu.startYear)} - ${edu.pursuing ? 'Present' : formatDate(edu.endYear)}</div>
          <div class="edu-school">${escapeHtml(edu.institution)}</div>
          <div class="edu-degree">${escapeHtml(edu.degree)}</div>
          ${edu.grade ? `<div class="edu-extra">Grade: ${escapeHtml(edu.grade)}${edu.gradeScale ? ` / ${escapeHtml(edu.gradeScale)}` : ''}</div>` : ''}
        </div>`).join('')}
      </div>` : ''}

      ${sections.skills && (hasTech || hasSoft) ? `
      <div class="col">
        <div class="section-heading">Skills</div>
        <ul class="skills-list">
          ${hasTech ? skills.technical.map((s: any) => `<li>${escapeHtml(s.name)}</li>`).join('') : ''}
          ${hasSoft ? skills.soft.map((s: string) => `<li>${escapeHtml(s)}</li>`).join('') : ''}
        </ul>
      </div>` : ''}
    </div>
  </div>` : ''}

  <!-- WORK EXPERIENCE (2-column grid) -->
  ${sections.experience && expCards.length ? `
  <div class="cv-section">
    <div class="section-heading">Work Experience</div>
    <div class="exp-grid">
      ${expCards.join('')}
    </div>
  </div>` : ''}

  <!-- PROJECTS -->
  ${sections.projects && projects?.projects?.length ? `
  <div class="cv-section">
    <div class="section-heading">Projects</div>
    ${projects.projects.map((p: any) => `
    <div class="project-block">
      <div class="project-title">${renderProjectTitleHtml(p, escapeHtml)}</div>
      ${p.role ? `<div class="project-role">${escapeHtml(p.role)}</div>` : ''}
      ${p.overview ? `<div class="project-overview">${escapeHtml(p.overview)}</div>` : ''}
      ${p.techStack?.length ? `<div class="project-tech">Tech: ${p.techStack.map((t: any) => escapeHtml(t.name)).join(', ')}</div>` : ''}
    </div>`).join('')}
  </div>` : ''}

  <!-- CERTIFICATES -->
  ${sections.certificates && certificates?.length ? `
  <div class="cv-section">
    <div class="section-heading">Certificates</div>
    <div class="cert-grid">
      ${certificates.map((c: any) => `
      <div>
        <div class="cert-name">${escapeHtml(c.name)}${c.issue_date ? ` | ${formatDate(c.issue_date)}` : ''}</div>
        ${c.organization ? `<div class="cert-org">${escapeHtml(c.organization)}</div>` : ''}
      </div>`).join('')}
    </div>
  </div>` : ''}

  <!-- ACHIEVEMENTS -->
  ${sections.achievements && achievements.length ? `
  <div class="cv-section">
    <div class="section-heading">Achievements</div>
    <ul class="ach-list">
      ${achievements.map(a => `<li><strong>${escapeHtml(a.title)}</strong>${a.description ? ` -- ${escapeHtml(a.description)}` : ''}</li>`).join('')}
    </ul>
  </div>` : ''}

  <!-- LANGUAGES -->
  ${sections.languages && langint?.language?.length ? `
  <div class="cv-section">
    <div class="section-heading">Languages</div>
    <div class="lang-pills">
      ${langint.language.map((l: any) => `<span class="lang-pill">${escapeHtml(l.name)} (${escapeHtml(l.proficiency)})</span>`).join('')}
    </div>
  </div>` : ''}

  ${renderDeclaration(profile, sections.declaration)}
  ${MADE_WITH_BADGE}
</div>
</body>
</html>`
}

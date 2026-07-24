// lib/server/templates/index.ts
// Template dispatcher — routes template ID to the correct generator

import type { TemplateId, SectionToggles } from '@/lib/resumeTemplates'
import { generateTealSidebarHTML } from './tealSidebar'
import { generatePlumAcademicHTML } from './plumAcademic'
import { generateSlateProfessionalHTML } from './slateProfessional'
import { generateNavyExecutiveHTML } from './navyExecutive'

export function generateTemplateHTML(
  templateId: TemplateId,
  profile: any,
  about: any,
  skills: any,
  projects: any,
  contact: any,
  langint: any,
  certificates: any[],
  sections: SectionToggles
): string {
  switch (templateId) {
    case 'teal-sidebar':
      return generateTealSidebarHTML(profile, about, skills, projects, contact, langint, certificates, sections)
    case 'plum-academic':
      return generatePlumAcademicHTML(profile, about, skills, projects, contact, langint, certificates, sections)
    case 'slate-professional':
      return generateSlateProfessionalHTML(profile, about, skills, projects, contact, langint, certificates, sections)
    case 'navy-executive':
      return generateNavyExecutiveHTML(profile, about, skills, projects, contact, langint, certificates, sections)
    case 'classic':
    default:
      // 'classic' uses the original generateResumeHTML in route.ts — handled there
      throw new Error(`Template "${templateId}" is handled by the classic generator`)
  }
}

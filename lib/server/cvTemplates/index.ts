// lib/server/cvTemplates/index.ts
// Dispatcher for CV templates

import type { CVTemplateId, CVSectionToggles } from '@/lib/cvTemplates'
import { generateOlivaWilsonCVHTML } from './olivaWilson'
import { generateDanielGallegoCVHTML } from './danielGallego'
import { generateAcademicExecutiveCVHTML } from './academicExecutive'

export function generateCVTemplateHTML(
  templateId: CVTemplateId,
  profile: any,
  about: any,
  skills: any,
  projects: any,
  contact: any,
  langint: any,
  certificates: any[],
  sections: CVSectionToggles
): string {
  switch (templateId) {
    case 'oliva-wilson':
      return generateOlivaWilsonCVHTML(profile, about, skills, projects, contact, langint, certificates, sections)
    case 'daniel-gallego':
      return generateDanielGallegoCVHTML(profile, about, skills, projects, contact, langint, certificates, sections)
    case 'academic-executive':
    default:
      return generateAcademicExecutiveCVHTML(profile, about, skills, projects, contact, langint, certificates, sections)
  }
}

// lib/server/filterResumeData.ts
// Filters full user data down to only the items selected in the wizard

import type { SectionToggles, SelectedItems } from '@/lib/resumeTemplates'

/**
 * Filter resume data based on wizard selections.
 * Returns cloned objects with only the selected items included.
 */
export function filterResumeData(
  about: any,
  skills: any,
  projects: any,
  langint: any,
  certificates: any[],
  sections: SectionToggles,
  selectedItems: SelectedItems,
  contact?: any
) {
  // Clone to avoid mutation
  const filteredAbout = { ...about }
  const filteredSkills = skills ? { ...skills } : null
  const filteredProjects = projects ? { ...projects } : null
  const filteredLangint = langint ? { ...langint } : null
  let filteredCertificates = certificates ? [...certificates] : []
  let filteredContact = contact ? { ...contact } : {}

  // Filter contact info
  if (sections.contacts === false) {
    filteredContact = { auth_user_id: contact?.auth_user_id }
  } else if (contact && Array.isArray(selectedItems?.contactItemIds)) {
    const selected = selectedItems.contactItemIds
    if (!selected.includes('email')) filteredContact.email = ''
    if (!selected.includes('phone')) filteredContact.phone = ''
    if (!selected.includes('address')) filteredContact.address = ''
    if (!selected.includes('linkedin')) filteredContact.linkedin = ''
    if (!selected.includes('github')) filteredContact.github = ''
    if (Array.isArray(filteredContact.other_links)) {
      filteredContact.other_links = filteredContact.other_links.filter(
        (link: any, idx: number) => {
          const linkId = link.id || `other_${idx}`
          return selected.includes(linkId) || selected.includes(`other_${idx}`)
        }
      )
    }
  }

  // Filter education
  if (sections.education && filteredAbout.education) {
    filteredAbout.education = filteredAbout.education.filter(
      (edu: any) => selectedItems.educationIds.includes(edu.id)
    )
  } else if (!sections.education) {
    filteredAbout.education = []
  }

  // Filter experience (company-level and role-level)
  if (sections.experience && filteredAbout.experience) {
    filteredAbout.experience = filteredAbout.experience
      .filter((comp: any) => selectedItems.experienceCompanyIds.includes(comp.id))
      .map((comp: any) => ({
        ...comp,
        roles: Array.isArray(comp.roles)
          ? comp.roles.filter((role: any) => selectedItems.experienceRoleIds.includes(role.id))
          : comp.roles,
      }))
      // Remove companies that ended up with 0 roles after filtering
      .filter((comp: any) => !Array.isArray(comp.roles) || comp.roles.length > 0)
  } else if (!sections.experience) {
    filteredAbout.experience = []
  }

  // Filter technical skills
  if (sections.skills && filteredSkills) {
    if (Array.isArray(filteredSkills.technical)) {
      filteredSkills.technical = filteredSkills.technical.filter(
        (s: any) => selectedItems.technicalSkillIds.includes(s.id)
      )
    }
    if (Array.isArray(filteredSkills.soft)) {
      filteredSkills.soft = filteredSkills.soft.filter(
        (s: string) => selectedItems.softSkills.includes(s)
      )
    }
  } else if (!sections.skills) {
    if (filteredSkills) {
      filteredSkills.technical = []
      filteredSkills.soft = []
    }
  }

  // Filter projects
  if (sections.projects && filteredProjects?.projects) {
    filteredProjects.projects = filteredProjects.projects.filter(
      (p: any) => selectedItems.projectIds.includes(p.id)
    )
  } else if (!sections.projects) {
    if (filteredProjects) filteredProjects.projects = []
  }

  // Filter languages
  if (sections.languages && filteredLangint?.language) {
    filteredLangint.language = filteredLangint.language.filter(
      (l: any) => selectedItems.languageIds.includes(l.id)
    )
  } else if (!sections.languages) {
    if (filteredLangint) filteredLangint.language = []
  }

  // Filter interests
  if (!sections.interests && filteredLangint) {
    filteredLangint.interest = []
  }

  // Filter certificates
  if (sections.certificates && filteredCertificates.length > 0) {
    filteredCertificates = filteredCertificates.filter(
      (_: any, i: number) => selectedItems.certificateIndices.includes(i)
    )
  } else if (!sections.certificates) {
    filteredCertificates = []
  }

  return {
    about: filteredAbout,
    skills: filteredSkills,
    projects: filteredProjects,
    langint: filteredLangint,
    certificates: filteredCertificates,
    contact: filteredContact,
  }
}

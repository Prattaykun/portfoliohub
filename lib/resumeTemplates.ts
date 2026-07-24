// lib/resumeTemplates.ts
// Shared template metadata & types for resume wizard

export type TemplateId = 'classic' | 'teal-sidebar' | 'plum-academic' | 'slate-professional' | 'navy-executive'

export interface TemplateInfo {
  id: TemplateId
  name: string
  description: string
  previewImage: string // path relative to /public
  accentColor: string  // for UI card border/highlight
}

export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Clean single-column layout with blue accent. The original PortfolioHub template.',
    previewImage: '/templates/classic.webp',
    accentColor: '#2c5aa0',
  },
  {
    id: 'teal-sidebar',
    name: 'Teal Sidebar',
    description: 'Modern two-column layout with a teal sidebar for photo & contact, peach header accent.',
    previewImage: '/templates/teal-sidebar.webp',
    accentColor: '#2a7a7a',
  },
  {
    id: 'plum-academic',
    name: 'Plum Academic',
    description: 'Academic-focused with dark plum sidebar. Great for students with projects & achievements.',
    previewImage: '/templates/plum-academic.webp',
    accentColor: '#4a1942',
  },
  {
    id: 'slate-professional',
    name: 'Slate Professional',
    description: 'Elegant slate header with serif headings. Ideal for experienced professionals.',
    previewImage: '/templates/slate-professional.webp',
    accentColor: '#546e7a',
  },
  {
    id: 'navy-executive',
    name: 'Navy Executive',
    description: 'Sophisticated dark navy header with timeline-style experience section.',
    previewImage: '/templates/navy-executive.webp',
    accentColor: '#1a2332',
  },
]

// Sections that can be toggled on/off in the wizard
export const WIZARD_SECTIONS = [
  { key: 'objective', label: 'Profile / Objective', description: 'Your bio summary' },
  { key: 'education', label: 'Education', description: 'Schools & degrees' },
  { key: 'experience', label: 'Work Experience', description: 'Companies & roles' },
  { key: 'skills', label: 'Skills', description: 'Technical & soft skills' },
  { key: 'projects', label: 'Projects', description: 'Personal & professional projects' },
  { key: 'achievements', label: 'Achievements', description: 'Awards & accomplishments' },
  { key: 'certificates', label: 'Certifications', description: 'Professional certifications' },
  { key: 'languages', label: 'Languages', description: 'Language proficiencies' },
  { key: 'interests', label: 'Interests', description: 'Personal interests' },
  { key: 'declaration', label: 'Declaration', description: 'Declaration with signature' },
] as const

export type SectionKey = (typeof WIZARD_SECTIONS)[number]['key']

// What the frontend sends to the API for selective generation
export interface SelectedItems {
  educationIds: string[]
  experienceCompanyIds: string[]
  experienceRoleIds: string[]
  technicalSkillIds: string[]
  softSkills: string[]
  projectIds: string[]
  achievementIndices: number[]
  languageIds: string[]
  certificateIndices: number[]
}

export interface SectionToggles {
  objective: boolean
  education: boolean
  experience: boolean
  skills: boolean
  projects: boolean
  achievements: boolean
  certificates: boolean
  languages: boolean
  interests: boolean
  declaration: boolean
}

// Default: everything on
export function defaultSectionToggles(): SectionToggles {
  return {
    objective: true,
    education: true,
    experience: true,
    skills: true,
    projects: true,
    achievements: true,
    certificates: true,
    languages: true,
    interests: true,
    declaration: true,
  }
}

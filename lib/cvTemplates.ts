// lib/cvTemplates.ts
// Shared CV template metadata, section toggles, and document types

export type CVTemplateId = 'oliva-wilson' | 'daniel-gallego' | 'academic-executive'
export type ActiveDocumentType = 'resume' | 'cv'

export interface CVTemplateInfo {
  id: CVTemplateId
  name: string
  description: string
  previewImage: string
  accentColor: string
  fontName: string
}

export const CV_TEMPLATES: CVTemplateInfo[] = [
  {
    id: 'oliva-wilson',
    name: 'Oliva Wilson Editorial',
    description: 'Editorial CV with Bodoni Moda serif headings, stacked name, contact icons, and 2-column layouts',
    previewImage: '/templates/cv/oliva-wilson.png',
    accentColor: '#1a1a1a',
    fontName: 'Bodoni Moda + Montserrat',
  },
  {
    id: 'daniel-gallego',
    name: 'Daniel Gallego Pill',
    description: 'Modern single-column CV with gray rounded pill section header badges',
    previewImage: '/templates/cv/daniel-gallego.webp',
    accentColor: '#4a5568',
    fontName: 'Roboto Bold + Lato',
  },
  {
    id: 'academic-executive',
    name: 'Academic Executive',
    description: 'Classic formal serif layout with extended section breakdown for academic work',
    previewImage: '/templates/cv/academic-executive.webp',
    accentColor: '#2b6cb0',
    fontName: 'Cinzel + Open Sans',
  },
]

export interface CVSectionToggles {
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

export const defaultCVSectionToggles = (): CVSectionToggles => ({
  objective: true,
  education: true,
  experience: true,
  skills: true,
  projects: true,
  achievements: true,
  certificates: true,
  languages: true,
  interests: true,
  declaration: false,
})

export const WIZARD_CV_SECTIONS = [
  { key: 'objective', label: 'Summary / Bio', description: 'Brief introduction or career objective' },
  { key: 'education', label: 'Education', description: 'Degrees, universities, and academic accomplishments' },
  { key: 'experience', label: 'Professional Experience', description: 'Work history, roles, and key responsibilities' },
  { key: 'skills', label: 'Skills & Expertise', description: 'Technical & soft skills' },
  { key: 'projects', label: 'Projects & Publications', description: 'Key projects, research, and portfolio work' },
  { key: 'achievements', label: 'Achievements & Awards', description: 'Honors, awards, and hackathons' },
  { key: 'certificates', label: 'Certifications', description: 'Licenses and professional certifications' },
  { key: 'languages', label: 'Languages', description: 'Languages spoken and proficiency' },
  { key: 'interests', label: 'Interests', description: 'Personal interests and activities' },
  { key: 'declaration', label: 'Declaration', description: 'Signature and authenticity statement' },
] as const

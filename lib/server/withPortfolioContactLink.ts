// lib/server/withPortfolioContactLink.ts

export const PORTFOLIO_PUBLIC_ORIGIN =
  (process.env.NEXT_PUBLIC_PORTFOLIO_PUBLIC_URL || 'https://portfoliohub.eu.cc').replace(/\/$/, '')

export const PORTFOLIO_LINK_ID = '__portfoliohub_portfolio__'

export function buildPortfolioUrl(username: string): string {
  const slug = username.trim()
  if (!slug) return PORTFOLIO_PUBLIC_ORIGIN
  return `${PORTFOLIO_PUBLIC_ORIGIN}/${encodeURIComponent(slug)}`
}

function normalizeUrlForCompare(url: string): string {
  return url
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '')
    .toLowerCase()
}

/** Auto-attach PortfolioHub public portfolio link into contact.other_links for PDF templates. */
export function withPortfolioContactLink(contact: any, username: string | null | undefined) {
  if (!contact || !username?.trim()) return contact

  const portfolioUrl = buildPortfolioUrl(username)
  const portfolioCompare = normalizeUrlForCompare(portfolioUrl)
  const usernameCompare = username.trim().toLowerCase()

  const existingLinks = Array.isArray(contact.other_links) ? [...contact.other_links] : []

  const alreadyHas = existingLinks.some((link: any) => {
    if (!link?.url) return false
    const normalized = normalizeUrlForCompare(String(link.url))
    return (
      normalized === portfolioCompare ||
      normalized.endsWith(`/${usernameCompare}`) ||
      (normalized.includes('portfoliohub') && normalized.endsWith(usernameCompare))
    )
  })

  if (alreadyHas) return contact

  const portfolioLink = {
    id: PORTFOLIO_LINK_ID,
    name: 'Portfolio',
    url: portfolioUrl,
    logo_url: 'https://www.google.com/s2/favicons?domain=portfoliohub.eu.cc&sz=128',
  }

  return {
    ...contact,
    other_links: [portfolioLink, ...existingLinks],
  }
}

export function buildProjectPortfolioUrl(username: string, projectId: string): string {
  const slug = username.trim()
  const id = String(projectId || '').trim()
  if (!slug || !id) return ''
  return `${PORTFOLIO_PUBLIC_ORIGIN}/${encodeURIComponent(slug)}/project/${encodeURIComponent(id)}`
}

/** Attach portfoliohub.eu.cc/[username]/project/[projectId] to each project for templates. */
export function withPortfolioProjectLinks(projects: any, username: string | null | undefined) {
  if (!projects?.projects || !username?.trim()) return projects

  return {
    ...projects,
    projects: projects.projects.map((project: any) => ({
      ...project,
      portfolio_page_url: project?.id ? buildProjectPortfolioUrl(username, project.id) : null,
    })),
  }
}

export function renderProjectTitleHtml(
  project: any,
  escapeFn: (value: string) => string,
  options?: { className?: string; style?: string }
): string {
  const title = escapeFn(project?.title || '')
  const url = project?.portfolio_page_url
  if (!url || !title) return title

  const classAttr = options?.className ? ` class="${escapeFn(options.className)}"` : ''
  const style = options?.style || 'color:inherit;text-decoration:underline;'
  return `<a href="${escapeFn(url)}"${classAttr} style="${style}">${title}</a>`
}

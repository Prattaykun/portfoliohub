// lib/server/contactLinkHelpers.ts
import { PORTFOLIO_FAVICON_URL, PORTFOLIO_LINK_ID } from './withPortfolioContactLink'

const LINK_STYLE = 'color:inherit;text-decoration:underline;'

export function stripUrlDisplay(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '')
}

export function toExternalHref(url: string): string {
  if (!url) return ''
  const trimmed = url.trim()
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export function toEmailHref(email: string): string {
  return email?.trim() ? `mailto:${email.trim()}` : ''
}

export function toPhoneHref(phone: string): string {
  if (!phone) return ''
  const digits = phone.replace(/[^\d+]/g, '')
  return digits ? `tel:${digits}` : ''
}

export function renderAnchor(
  href: string,
  label: string,
  escapeFn: (value: string) => string,
  style = LINK_STYLE
): string {
  if (!href || !label) return escapeFn(label || '')
  return `<a href="${escapeFn(href)}" style="${style}">${escapeFn(label)}</a>`
}

export function renderEmailLink(email: string, escapeFn: (value: string) => string): string {
  return renderAnchor(toEmailHref(email), email, escapeFn)
}

export function renderPhoneLink(phone: string, escapeFn: (value: string) => string): string {
  return renderAnchor(toPhoneHref(phone), phone, escapeFn)
}

export function renderWebLink(url: string, display: string, escapeFn: (value: string) => string): string {
  return renderAnchor(toExternalHref(url), display, escapeFn)
}

export function renderLinkedInLink(url: string, escapeFn: (value: string) => string): string {
  return renderWebLink(url, stripUrlDisplay(url), escapeFn)
}

export function renderGitHubLink(url: string, escapeFn: (value: string) => string): string {
  return renderWebLink(url, stripUrlDisplay(url), escapeFn)
}

export function getOtherLinkDisplay(link: any): string {
  if (!link?.url) return ''
  const displayUrl = stripUrlDisplay(link.url)
  return link.name ? `${link.name}: ${displayUrl}` : displayUrl
}

export function getOtherLinkIconUrl(link: any): string {
  if (link?.id === PORTFOLIO_LINK_ID) return PORTFOLIO_FAVICON_URL
  if (link?.logo_url) return link.logo_url
  if (link?.url) {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(link.url)}&sz=128`
  }
  return PORTFOLIO_FAVICON_URL
}

export function renderOtherLinkText(link: any, escapeFn: (value: string) => string): string {
  if (!link?.url) return ''
  return renderWebLink(link.url, getOtherLinkDisplay(link), escapeFn)
}

export function renderOtherLinkIconImg(
  link: any,
  escapeFn: (value: string) => string,
  sizePx = 14,
  className = ''
): string {
  const iconUrl = getOtherLinkIconUrl(link)
  const classAttr = className ? ` class="${escapeFn(className)}"` : ''
  return `<img src="${escapeFn(iconUrl)}"${classAttr} alt="" style="width:${sizePx}px;height:${sizePx}px;object-fit:contain;" />`
}

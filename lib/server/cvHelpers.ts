// lib/server/cvHelpers.ts
// Common HTML escape, formatting, and font style helpers for CV generators

export function escapeHtml(str: string | null | undefined): string {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  // If it's just a year like "2023"
  if (/^\d{4}$/.test(dateStr.trim())) return dateStr.trim()
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export function extractAchievements(skills: any): { title: string; description?: string }[] {
  const achs: { title: string; description?: string }[] = []
  try {
    if (skills?.media && Array.isArray(skills.media)) {
      const blocks = skills.media.filter((m: any) => (m?.name || '').toLowerCase() === 'achievements')
      for (const block of blocks) {
        const items = Array.isArray(block.items) ? block.items : []
        for (const it of items) {
          const title = it?.type === 'text' ? (it?.url || it?.title || '') : (it?.title || it?.url || '')
          if (title) achs.push({ title, description: it?.description || '' })
        }
      }
    }
  } catch {
    /* ignore */
  }
  return achs
}

/**
 * Google Fonts <link> tag for CV templates.
 * Bodoni Moda = editorial serif for headings (closest free match to Tan Pamela aesthetic).
 * Montserrat = clean sans-serif for body text.
 * Loaded via <link> in <head> so Browserless (headless Chrome) picks them up reliably.
 */
export const CV_FONTS_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">`

/**
 * CSS variables and base classes for the editorial heading font.
 * Use .editorial-heading class or font-family directly.
 */
export const CV_FONT_CSS = `
  :root {
    --font-heading: 'Bodoni Moda', Georgia, 'Times New Roman', serif;
    --font-body: 'Montserrat', 'Segoe UI', Tahoma, sans-serif;
  }
  .editorial-heading {
    font-family: var(--font-heading);
  }
`

// Keep backward compat export name so existing templates don't break at import level,
// but the content is now the correct Google Fonts CSS (not the fake @font-face).
export const TAN_PAMELA_FONT_CSS = CV_FONT_CSS

export function renderDeclaration(profile: any, enabled: boolean): string {
  if (!enabled) return ''
  return `
  <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 11px; color: #555;">
    <div style="font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Declaration</div>
    <p>I hereby declare that all the information mentioned above is true and correct to the best of my knowledge and belief.</p>
    <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        <div>Date: ${new Date().toLocaleDateString()}</div>
        <div>Place: ${escapeHtml(profile?.address || '')}</div>
      </div>
      ${profile?.signature ? `
      <div style="text-align: center;">
        <img src="${escapeHtml(profile.signature)}" style="max-height: 40px; max-width: 150px; display: block; margin: 0 auto 4px;" alt="Signature" />
        <div style="border-top: 1px solid #333; padding-top: 2px; font-weight: bold;">(${escapeHtml(profile.full_name)})</div>
      </div>` : `
      <div style="text-align: right; font-weight: bold;">
        (${escapeHtml(profile.full_name)})
      </div>`}
    </div>
  </div>`
}

export const MADE_WITH_BADGE = `
<div style="margin-top: 25px; text-align: center; font-size: 10px; color: #999; letter-spacing: 1px;">
  Generated with PortfolioHub CV Engine
</div>`

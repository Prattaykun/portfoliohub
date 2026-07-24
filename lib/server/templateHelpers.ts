// lib/server/templateHelpers.ts
// Shared helpers used by all resume template generators

export function escapeHtml(unsafe: string): string {
  if (!unsafe) return ''
  return unsafe
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'Present'
  try {
    if (/^\d{4}$/.test(dateString)) return dateString
    if (dateString === 'Present') return dateString
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  } catch {
    return dateString
  }
}

export function getCurrentDate(): string {
  const d = new Date()
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

export function getStarCount(proficiency: string): number {
  const levels = ["Beginner", "Elementary", "Intermediate", "Advanced", "Fluent", "Native"]
  const idx = levels.indexOf(proficiency)
  return idx >= 0 ? idx + 1 : 1
}

export function renderStars(proficiency: string, filledColor = '#ffc107', emptyColor = '#e0e0e0'): string {
  const count = getStarCount(proficiency)
  return Array.from({ length: 6 }, (_, i) =>
    i < count
      ? `<span style="color:${filledColor};font-size:14px;">★</span>`
      : `<span style="color:${emptyColor};font-size:14px;">★</span>`
  ).join('')
}

// Extract achievements from skills.media
export function extractAchievements(skills: any): { title: string; description?: string }[] {
  const achievements: { title: string; description?: string }[] = []
  try {
    if (skills?.media && Array.isArray(skills.media)) {
      const achBlocks = skills.media.filter((m: any) => (m?.name || '').toLowerCase() === 'achievements')
      for (const block of achBlocks) {
        const items = Array.isArray(block.items) ? block.items : []
        for (const it of items) {
          const title = it?.type === 'text' ? (it?.url || it?.title || '') : (it?.title || it?.url || '')
          const description = it?.description || ''
          if (title) achievements.push({ title, description })
        }
      }
    }
  } catch (e) {
    console.warn('Error parsing achievements from skills.media', e)
  }
  return achievements
}

export const MADE_WITH_BADGE = `
<div style="margin-top:30px;text-align:center;font-size:13px;color:#666;display:flex;flex-direction:column;align-items:center;gap:6px;opacity:0.95;">
  <div>Made with 💙</div>
  <img src="https://portfoliohub-pi.vercel.app/logo1.png" alt="Made with PortfolioHub" style="width:120px;height:auto;display:block;" />
</div>`

// Declaration section generator
export function renderDeclaration(profile: any, showDeclaration: boolean): string {
  if (!showDeclaration) return ''
  return `
  <div style="margin-top:30px;padding-top:20px;border-top:1px solid #ddd;">
    <div style="font-size:16px;font-weight:700;margin-bottom:12px;">DECLARATION</div>
    <div style="margin-bottom:20px;line-height:1.6;font-size:14px;">
      I hereby declare that all the information provided above is true and correct to the best of my knowledge.
      I understand that any misrepresentation may lead to disqualification or termination of employment.
    </div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:40px;">
      <div style="text-align:center;">
        ${profile.signature
          ? `<img src="${escapeHtml(profile.signature)}" alt="Signature" style="max-width:200px;max-height:80px;margin-bottom:10px;border-bottom:1px solid #333;" />`
          : '<div style="width:200px;border-bottom:1px solid #333;margin-bottom:10px;"></div>'
        }
        <div style="font-weight:700;color:#333;">${escapeHtml(profile.full_name)}</div>
      </div>
      <div style="text-align:center;">
        <div>${getCurrentDate()}</div>
        <div style="width:150px;border-bottom:1px solid #333;margin-bottom:10px;"></div>
        <div style="font-weight:700;color:#333;">Date</div>
      </div>
    </div>
  </div>`
}

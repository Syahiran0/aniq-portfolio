/**
 * Resolves an image/file path stored in content.json.
 * - absolute URLs and data: URIs are used as-is
 * - relative paths (e.g. "uploads/photo.webp") are resolved against the site's base,
 *   so they work on GitHub Pages sub-paths as well as on a root domain.
 */
export function asset(path) {
  if (!path) return ''
  if (/^(https?:|data:|blob:|\/\/)/i.test(path)) return path
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

export const whatsappLink = (phone) => {
  const digits = (phone || '').replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : ''
}

export const mailto = (email, subject = '') =>
  `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`

export const pad2 = (n) => String(n).padStart(2, '0')

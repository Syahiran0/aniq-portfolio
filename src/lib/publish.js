import { commitFiles } from './github'
import { parseDataUrl } from './image'

const CONTENT_PATH = 'src/content/content.json'

const quickHash = (str) => {
  let h = 5381
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0
  return (h >>> 0).toString(36) + str.length.toString(36)
}

/**
 * Images added in the dashboard are stored inside the draft as data: URLs.
 * Before publishing they are swapped for real files ("uploads/<hash>.webp") that get
 * committed to /public/uploads next to content.json.
 */
export function extractUploads(content) {
  const files = new Map()

  const walk = (value) => {
    if (typeof value === 'string' && value.startsWith('data:')) {
      const parsed = parseDataUrl(value)
      if (!parsed) return value
      const path = `uploads/${quickHash(value)}.${parsed.ext}`
      files.set(path, parsed.base64)
      return path
    }
    if (Array.isArray(value)) return value.map(walk)
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v)]))
    }
    return value
  }

  const next = walk(content)
  return { content: next, uploads: [...files].map(([path, base64]) => ({ path, base64 })) }
}

/** How many new files would be uploaded: used for the pre-publish summary. */
export const countUploads = (content) => extractUploads(content).uploads.length

export async function publishContent(content, settings) {
  const { content: finalContent, uploads } = extractUploads(content)

  const files = [
    { path: CONTENT_PATH, content: `${JSON.stringify(finalContent, null, 2)}\n`, encoding: 'utf-8' },
    ...uploads.map((u) => ({ path: `public/${u.path}`, content: u.base64, encoding: 'base64' })),
  ]

  const result = await commitFiles({
    owner: settings.owner.trim(),
    repo: settings.repo.trim(),
    branch: (settings.branch || 'main').trim(),
    token: settings.token.trim(),
    files,
    message: 'content: update portfolio from dashboard',
  })

  return { ...result, uploaded: uploads.length }
}

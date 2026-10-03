import { useContent } from '../content/store'
import { asset } from './assets'

const MIME_EXT = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
}

/** "uploads/ab12.pdf" or "data:application/pdf;base64,…" -> "pdf" */
function extensionOf(file) {
  if (file.startsWith('data:')) return MIME_EXT[/^data:([^;,]+)/.exec(file)?.[1]] || 'pdf'
  return /\.([a-z0-9]{2,5})(?:[?#]|$)/i.exec(file)?.[1].toLowerCase() || 'pdf'
}

const isCrossOrigin = (href) => {
  if (/^(data|blob):/i.test(href)) return false // an unpublished draft file: `download` works on these
  try {
    return new URL(href, window.location.href).origin !== window.location.origin
  } catch {
    return false
  }
}

/**
 * The CV attached in the dashboard, ready to link to, or null when none is attached
 * (so every download button hides itself).
 * Uploads are stored under hash names ("uploads/3k9x.pdf"), so visitors are given a proper
 * file name instead: "Aniq-Ihtisyam-Syahiran-CV.pdf".
 */
export function useResume() {
  const { resume, profile } = useContent()
  const file = resume?.file?.trim()
  if (!file) return null

  const href = asset(file)
  // browsers ignore `download` on other origins, so those links just open in a new tab
  const external = isCrossOrigin(href)
  const person = (profile.name || '').trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')

  return {
    href,
    external,
    label: resume.label?.trim() || 'Download CV',
    filename: `${person ? `${person}-` : ''}CV.${extensionOf(file)}`,
  }
}

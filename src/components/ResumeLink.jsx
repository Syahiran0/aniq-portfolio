import { Download } from 'lucide-react'
import { useResume } from '../lib/resume'

/** "Download CV" button. Renders nothing until a CV is attached in the dashboard. */
export default function ResumeLink({ className = 'btn btn--ghost', iconSize = 18, children }) {
  const resume = useResume()
  if (!resume) return null

  return (
    <a
      className={className}
      href={resume.href}
      download={resume.external ? undefined : resume.filename}
      target={resume.external ? '_blank' : undefined}
      rel={resume.external ? 'noreferrer' : undefined}
    >
      <Download size={iconSize} /> {children ?? resume.label}
    </a>
  )
}

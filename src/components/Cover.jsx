import { asset } from '../lib/assets'
import './Cover.css'

/** Picks a short, poster-style label from a title: "Smart Wrist System" -> "Smart Wrist". */
export function shortLabel(title = '') {
  const words = title.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return ''
  const two = words.slice(0, 2).join(' ')
  if (words.length > 1 && two.length <= 12) return two
  if (words[0].length <= 12) return words[0]
  return words.map((w) => w[0]).join('').slice(0, 4).toUpperCase()
}

/**
 * Shows the uploaded image when there is one; otherwise a generated gradient poster
 * in the item's accent colour, so every card looks designed even before photos exist.
 */
export default function Cover({ image, accent = '#ff6a1f', label = '', alt = '', className = '' }) {
  if (image) {
    return <img className={`cover cover--img ${className}`} src={asset(image)} alt={alt} loading="lazy" />
  }
  return (
    <div className={`cover cover--art ${className}`} style={{ '--c': accent }} role="img" aria-label={alt || label}>
      <span className="cover__label">{label}</span>
    </div>
  )
}

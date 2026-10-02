export function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/**
 * Shrinks a photo in the browser before it is stored or uploaded:
 * max 1600px on the long edge, re-encoded as WebP. Typically 80-90% smaller than the original,
 * which keeps the draft small and the site fast. SVG / GIF are kept untouched.
 */
export async function compressImage(file, { maxSize = 1600, quality = 0.82 } = {}) {
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return readAsDataURL(file)

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()
  return canvas.toDataURL('image/webp', quality)
}

const EXT = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
}

/** "data:image/webp;base64,AAAA" -> { mime, ext, base64 }. Browsers always produce base64 data URLs. */
export function parseDataUrl(dataUrl) {
  const match = /^data:([^;,]+);base64,(.*)$/s.exec(dataUrl)
  if (!match) return null
  const [, mime, base64] = match
  return { mime, ext: EXT[mime] || 'bin', base64 }
}

export const approxKB = (dataUrl) => Math.round((dataUrl.length * 3) / 4 / 1024)

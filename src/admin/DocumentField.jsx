import { useRef, useState } from 'react'
import { Eye, FilePlus, FileText, RotateCcw } from 'lucide-react'
import { asset } from '../lib/assets'
import { approxKB, dataUrlToBlob, readAsDataURL } from '../lib/image'

const MAX_FILE_KB = 2500

// Browsers often report an empty type for .doc / .docx, so the extension decides first.
const MIME_BY_EXT = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

function mimeOf(file) {
  const byExt = MIME_BY_EXT[file.name.split('.').pop().toLowerCase()]
  if (byExt) return byExt
  return Object.values(MIME_BY_EXT).includes(file.type) ? file.type : null
}

/**
 * Attach / replace / remove a document (the CV). The file is kept in the draft as a data: URL and
 * turned into a real file under /public/uploads when published. A path or URL can also be typed in.
 */
export default function DocumentField({ field, value, onChange }) {
  const input = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [picked, setPicked] = useState(null) // a data: URL has no file name, so remember it for this session
  const [previous, setPrevious] = useState(null) // { value, name } attached before the last Replace / Remove
  const isUpload = value.startsWith('data:')

  const pick = async (file) => {
    if (!file) return
    setError('')
    setBusy(true)
    try {
      const mime = mimeOf(file)
      if (!mime) throw new Error('Please choose a PDF (or Word) file.')
      if (file.size / 1024 > MAX_FILE_KB) throw new Error(`That file is too large (max ${MAX_FILE_KB / 1000} MB).`)
      const dataUrl = (await readAsDataURL(file)).replace(/^data:[^;,]*/, `data:${mime}`)
      if (value) setPrevious({ value, name: picked?.name })
      setPicked({ name: file.name })
      onChange(dataUrl)
    } catch (err) {
      setError(err.message || 'Could not read that file.')
    } finally {
      setBusy(false)
    }
  }

  const remove = () => {
    setPrevious({ value, name: picked?.name })
    setPicked(null)
    onChange('')
  }

  const putBack = () => {
    setPicked(previous.name ? { name: previous.name } : null)
    setPrevious(null)
    onChange(previous.value)
  }

  const view = () => {
    if (!isUpload) {
      window.open(asset(value), '_blank', 'noopener')
      return
    }
    // browsers refuse to open data: URLs in a tab, so hand them a blob URL instead
    const blob = dataUrlToBlob(value)
    if (!blob) return
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  const status = isUpload
    ? `Ready to publish · ${picked?.name ?? 'document'} · ${approxKB(value)} KB`
    : /^https?:/i.test(value)
      ? `Linked: ${value}`
      : value
        ? `Attached: ${value}`
        : 'Nothing attached yet. Drop a PDF here or choose one.'

  return (
    <div className="adm-field">
      <span className="adm-field__label">{field.label}</span>
      <div
        className="adm-media"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          pick(e.dataTransfer.files?.[0])
        }}
      >
        <div className={`adm-media__preview ${value ? 'is-filled' : ''}`}>{value ? <FileText size={30} /> : <FilePlus size={28} />}</div>

        <div className="adm-media__body">
          <div className="adm-media__buttons">
            <button type="button" className="adm-btn adm-btn--sm" onClick={() => input.current?.click()} disabled={busy}>
              {busy ? 'Processing…' : value ? 'Replace file' : 'Upload file'}
            </button>
            {value && (
              <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={view}>
                <Eye size={15} /> View
              </button>
            )}
            {value && (
              <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={remove}>
                Remove
              </button>
            )}
            {previous && previous.value !== value && (
              <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={putBack}>
                <RotateCcw size={15} /> Put previous file back
              </button>
            )}
          </div>
          <input
            className="adm-input adm-input--sm"
            placeholder="…or type a path / URL, e.g. uploads/cv.pdf"
            value={isUpload ? '' : value}
            onChange={(e) => onChange(e.target.value)}
          />
          <span className="adm-field__help adm-media__status">{status}</span>
          {error && <span className="adm-field__error">{error}</span>}
        </div>

        <input
          ref={input}
          hidden
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => {
            pick(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>
      {field.help && <span className="adm-field__help">{field.help}</span>}
    </div>
  )
}

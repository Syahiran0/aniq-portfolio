import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Copy, ImagePlus, Plus, Trash2, X } from 'lucide-react'
import { asset } from '../lib/assets'
import { approxKB, compressImage } from '../lib/image'
import DocumentField from './DocumentField'
import { blankItem } from './schema'

/* ------------------------------------------------------------------ */
/* Generic field renderer: one switch over the field types in schema.js */
/* ------------------------------------------------------------------ */

export function FieldRenderer({ field, value, onChange }) {
  switch (field.type) {
    case 'text':
    case 'url':
      return (
        <Field field={field}>
          <input
            className="adm-input"
            type={field.type === 'url' ? 'url' : 'text'}
            value={value ?? ''}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      )
    case 'textarea':
      return (
        <Field field={field}>
          <textarea className="adm-input" rows={field.rows || 4} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
        </Field>
      )
    case 'color':
      return (
        <Field field={field}>
          <div className="adm-color">
            <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#ff6a1f'} onChange={(e) => onChange(e.target.value)} />
            <input className="adm-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
          </div>
        </Field>
      )
    case 'toggle':
      return <Toggle field={field} value={!!value} onChange={onChange} />
    case 'tags':
      return <TagsField field={field} value={value || []} onChange={onChange} />
    case 'strings':
      return <StringsField field={field} value={value || []} onChange={onChange} />
    case 'image':
      return <MediaField field={field} value={value || ''} onChange={onChange} />
    case 'file':
      return <DocumentField field={field} value={value || ''} onChange={onChange} />
    case 'group':
      return (
        <fieldset className={`adm-group ${field.inline ? 'adm-group--inline' : ''}`}>
          <legend>{field.label}</legend>
          <ObjectFields fields={field.fields} value={value || {}} onChange={onChange} />
        </fieldset>
      )
    case 'list':
      return <ListEditor field={field} value={value || []} onChange={onChange} nested />
    default:
      return null
  }
}

export function ObjectFields({ fields, value, onChange }) {
  return fields.map((f) => (
    <FieldRenderer key={f.key} field={f} value={value[f.key]} onChange={(v) => onChange({ ...value, [f.key]: v })} />
  ))
}

function Field({ field, children }) {
  return (
    <label className="adm-field">
      <span className="adm-field__label">{field.label}</span>
      {children}
      {field.help && <span className="adm-field__help">{field.help}</span>}
    </label>
  )
}

/* ------------------------------ simple fields ------------------------------ */

function Toggle({ field, value, onChange }) {
  return (
    <div className="adm-field adm-field--row">
      <span className="adm-field__label">{field.label}</span>
      <button type="button" role="switch" aria-checked={value} className={`adm-switch ${value ? 'is-on' : ''}`} onClick={() => onChange(!value)}>
        <i />
      </button>
    </div>
  )
}

const parseTags = (raw) =>
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

/** Comma-separated input. Keeps the raw text locally so typing a comma never feels "eaten". */
function TagsField({ field, value, onChange }) {
  const [raw, setRaw] = useState(value.join(', '))

  useEffect(() => {
    // external change (import, discard, reorder): resync, but never fight the user's typing
    if (JSON.stringify(parseTags(raw)) !== JSON.stringify(value)) setRaw(value.join(', '))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <Field field={field}>
      <textarea
        className="adm-input"
        rows={2}
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value)
          onChange(parseTags(e.target.value))
        }}
      />
      {value.length > 0 && (
        <span className="adm-tags">
          {value.map((t, i) => (
            <span key={`${t}-${i}`} className="chip">
              {t}
            </span>
          ))}
        </span>
      )}
    </Field>
  )
}

/** A list of text rows (bullets / paragraphs). */
function StringsField({ field, value, onChange }) {
  const set = (i, v) => onChange(value.map((x, j) => (j === i ? v : x)))
  return (
    <div className="adm-field">
      <span className="adm-field__label">{field.label}</span>
      <div className="adm-strings">
        {value.map((s, i) => (
          <div key={i} className="adm-strings__row">
            <textarea className="adm-input" rows={field.multiline ? 4 : 2} value={s} onChange={(e) => set(i, e.target.value)} />
            <button type="button" className="adm-icon" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove line">
              <X size={16} />
            </button>
          </div>
        ))}
        <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => onChange([...value, ''])}>
          <Plus size={15} /> {field.multiline ? 'Add paragraph' : 'Add line'}
        </button>
      </div>
      {field.help && <span className="adm-field__help">{field.help}</span>}
    </div>
  )
}

/* ------------------------------ image upload (documents: see DocumentField) ------------------------------ */

function MediaField({ field, value, onChange }) {
  const input = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const isUpload = value.startsWith('data:')

  const pick = async (file) => {
    if (!file) return
    setError('')
    setBusy(true)
    try {
      if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.')
      onChange(await compressImage(file))
    } catch (err) {
      setError(err.message || 'Could not read that file.')
    } finally {
      setBusy(false)
    }
  }

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
        <div className="adm-media__preview">
          {value ? <img src={asset(value)} alt="" /> : <ImagePlus size={26} />}
        </div>

        <div className="adm-media__body">
          <div className="adm-media__buttons">
            <button type="button" className="adm-btn adm-btn--sm" onClick={() => input.current?.click()} disabled={busy}>
              {busy ? 'Processing…' : value ? 'Replace' : 'Upload image'}
            </button>
            {value && (
              <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => onChange('')}>
                Remove
              </button>
            )}
          </div>
          <input
            className="adm-input adm-input--sm"
            placeholder="…or paste an image URL"
            value={isUpload ? '' : value}
            onChange={(e) => onChange(e.target.value)}
          />
          <span className="adm-field__help">
            {isUpload ? `Ready to publish · ${approxKB(value)} KB` : value ? `Published: ${value}` : 'You can also drop a file here.'}
          </span>
          {error && <span className="adm-field__error">{error}</span>}
        </div>

        <input
          ref={input}
          hidden
          type="file"
          accept="image/*"
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

/* ------------------------------ list editor ------------------------------ */

/**
 * Editor for an array of objects: add, remove, duplicate, reorder, expand/collapse.
 * Used for top-level sections (projects, achievements, ...) and nested lists (links, facts).
 */
export function ListEditor({ field, value, onChange, nested = false }) {
  const [open, setOpen] = useState(() => new Set())
  const [confirm, setConfirm] = useState(null)
  const keyOf = (item, i) => item.id ?? `#${i}`

  const toggleOpen = (key) =>
    setOpen((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  const update = (i, item) => onChange(value.map((x, j) => (j === i ? item : x)))

  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= value.length) return
    const next = [...value]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  const add = () => {
    const item = blankItem(field.fields, field.defaults, field.hasId)
    onChange([...value, item])
    setOpen((prev) => new Set(prev).add(keyOf(item, value.length)))
  }

  const duplicate = (i) => {
    const copy = JSON.parse(JSON.stringify(value[i]))
    if (field.hasId) copy.id = `item-${Math.random().toString(36).slice(2, 8)}`
    const next = [...value]
    next.splice(i + 1, 0, copy)
    onChange(next)
  }

  const remove = (i) => {
    const key = keyOf(value[i], i)
    if (confirm !== key) {
      setConfirm(key)
      setTimeout(() => setConfirm((c) => (c === key ? null : c)), 3000)
      return
    }
    setConfirm(null)
    onChange(value.filter((_, j) => j !== i))
  }

  return (
    <div className={`adm-list ${nested ? 'adm-list--nested' : ''}`}>
      {nested && <span className="adm-field__label">{field.label}</span>}

      {value.map((item, i) => {
        const key = keyOf(item, i)
        const isOpen = open.has(key)
        const title = field.itemTitle?.(item) || `Item ${i + 1}`
        const subtitle = field.itemSubtitle?.(item)
        return (
          <div key={key} className={`adm-item ${isOpen ? 'is-open' : ''}`}>
            <div className="adm-item__head" onClick={() => toggleOpen(key)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleOpen(key)}>
              <span className="adm-item__no">{String(i + 1).padStart(2, '0')}</span>
              <span className="adm-item__title">
                <strong>{title}</strong>
                {subtitle && <small>{subtitle}</small>}
              </span>
              <span className="adm-item__actions" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="adm-icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                  <ChevronUp size={16} />
                </button>
                <button type="button" className="adm-icon" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move down">
                  <ChevronDown size={16} />
                </button>
                <button type="button" className="adm-icon" onClick={() => duplicate(i)} aria-label="Duplicate">
                  <Copy size={15} />
                </button>
                <button
                  type="button"
                  className={`adm-icon adm-icon--danger ${confirm === key ? 'is-armed' : ''}`}
                  onClick={() => remove(i)}
                  aria-label={confirm === key ? 'Click again to delete' : 'Delete'}
                  title={confirm === key ? 'Click again to delete' : 'Delete'}
                >
                  {confirm === key ? 'Sure?' : <Trash2 size={15} />}
                </button>
              </span>
            </div>
            {isOpen && (
              <div className="adm-item__body">
                <ObjectFields fields={field.fields} value={item} onChange={(v) => update(i, v)} />
              </div>
            )}
          </div>
        )
      })}

      {value.length === 0 && <p className="adm-empty">Nothing here yet.</p>}

      <button type="button" className="adm-btn adm-btn--ghost" onClick={add}>
        <Plus size={16} /> {field.addLabel || 'Add item'}
      </button>
    </div>
  )
}

import { useSyncExternalStore } from 'react'
import published from './content.json'

/**
 * Content store.
 *
 * - `published` is the content.json that was bundled at build time (what visitors see).
 * - A *draft* is an unpublished copy saved in THIS browser's localStorage by the dashboard.
 *   Only the person editing ever has one, so visitors always see the published content.
 * - A draft remembers the hash of the published content it was based on. When a new build
 *   ships (the hash changes) the stale draft is dropped automatically.
 */

const DRAFT_KEY = 'aniq-portfolio:draft:v1'
const PERSIST_DELAY = 350

const hash = (str) => {
  let h = 5381
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

export const publishedContent = published
export const publishedHash = hash(JSON.stringify(published))

const listeners = new Set()
let draft = readDraft()
let saveError = false
let persistTimer = null

function readDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw)
    if (saved.base !== publishedHash) {
      localStorage.removeItem(DRAFT_KEY)
      return null
    }
    return saved.content
  } catch {
    return null
  }
}

const emit = () => listeners.forEach((fn) => fn())

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export const getContent = () => draft ?? published
export const hasSaveError = () => saveError

function persist() {
  clearTimeout(persistTimer)
  persistTimer = null
  try {
    if (draft === null) localStorage.removeItem(DRAFT_KEY)
    else localStorage.setItem(DRAFT_KEY, JSON.stringify({ base: publishedHash, content: draft }))
    if (saveError) {
      saveError = false
      emit()
    }
  } catch {
    // Most likely the browser's ~5 MB localStorage quota (large uploaded images).
    saveError = true
    emit()
  }
}

/** Updates the draft immediately; writing to localStorage is debounced. */
export function saveDraft(next) {
  draft = next
  emit()
  clearTimeout(persistTimer)
  persistTimer = setTimeout(persist, PERSIST_DELAY)
}

export function discardDraft() {
  draft = null
  persist()
  emit()
}

export const isDirty = (content) => JSON.stringify(content) !== JSON.stringify(published)

if (typeof window !== 'undefined') {
  // Don't lose the last keystrokes if the tab closes inside the debounce window.
  window.addEventListener('pagehide', () => persistTimer && persist())
  // Keep other open tabs (e.g. the live preview) in sync with the dashboard.
  window.addEventListener('storage', (e) => {
    if (e.key === DRAFT_KEY) {
      draft = readDraft()
      emit()
    }
  })
}

/** React hook: the content to render (draft if present, otherwise published). */
export function useContent() {
  return useSyncExternalStore(subscribe, getContent)
}

export function useSaveError() {
  return useSyncExternalStore(subscribe, hasSaveError)
}

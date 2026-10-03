import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Briefcase,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Image,
  Layers,
  Mail,
  RotateCcw,
  Rocket,
  Settings2,
  Smile,
  Sparkles,
  Trophy,
  Upload,
  User,
  Users,
  Wrench,
} from 'lucide-react'
import { discardDraft, isDirty, saveDraft, useContent, useSaveError } from '../content/store'
import { ListEditor, ObjectFields } from './editors'
import PublishPanel from './PublishPanel'
import { SECTIONS } from './schema'
import './admin.css'

const ICONS = { User, FileText, Sparkles, BarChart3, Layers, Trophy, BookOpen, Smile, Briefcase, GraduationCap, BadgeCheck, Wrench, Users, Image, Mail, Settings2, Rocket }

const PUBLISH = { id: 'publish', label: 'Publish', icon: 'Rocket' }

export default function AdminPage() {
  const content = useContent()
  const saveError = useSaveError()
  const [activeId, setActiveId] = useState(SECTIONS[0].id)
  const [toast, setToast] = useState('')
  const importRef = useRef(null)
  const dirty = isDirty(content)

  const section = SECTIONS.find((s) => s.id === activeId)
  const setSection = (id, value) => saveDraft({ ...content, [id]: value })

  const say = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 3200)
  }

  const exportJson = () => {
    const blob = new Blob([`${JSON.stringify(content, null, 2)}\n`], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'portfolio-content.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importJson = async (file) => {
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      if (!data.profile || !data.hero || !Array.isArray(data.projects)) throw new Error('shape')
      saveDraft(data)
      say('Imported. Review the changes, then publish.')
    } catch {
      say("That file doesn't look like a portfolio content export.")
    }
  }

  const discard = () => {
    if (window.confirm('Discard all unpublished changes in this browser? This cannot be undone.')) {
      discardDraft()
      say('Back to the published version.')
    }
  }

  const navItem = (item) => {
    const Icon = ICONS[item.icon]
    return (
      <button key={item.id} className={`adm-nav__item ${activeId === item.id ? 'is-active' : ''}`} onClick={() => setActiveId(item.id)}>
        <Icon size={17} />
        <span>{item.label}</span>
      </button>
    )
  }

  return (
    <div className="adm">
      <aside className="adm-side">
        <Link to="/" className="adm-brand">
          <ArrowLeft size={16} /> Back to site
        </Link>
        <p className="adm-side__title">Content dashboard</p>
        <nav className="adm-nav" aria-label="Sections">
          {SECTIONS.map(navItem)}
          {navItem(PUBLISH)}
        </nav>
      </aside>

      <div className="adm-main">
        <header className="adm-bar">
          <div className="adm-bar__status">
            <span className={`adm-dot ${dirty ? 'is-dirty' : ''}`} />
            {dirty ? 'Unpublished changes' : 'Up to date'}
          </div>
          <div className="adm-bar__actions">
            <a className="adm-btn adm-btn--ghost adm-btn--sm" href={`${window.location.pathname}#/`} target="_blank" rel="noreferrer">
              <ExternalLink size={15} /> Preview
            </a>
            <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={exportJson}>
              <Download size={15} /> Export
            </button>
            <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => importRef.current?.click()}>
              <Upload size={15} /> Import
            </button>
            <input
              ref={importRef}
              hidden
              type="file"
              accept="application/json"
              onChange={(e) => {
                importJson(e.target.files?.[0])
                e.target.value = ''
              }}
            />
            {dirty && (
              <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={discard}>
                <RotateCcw size={15} /> Discard
              </button>
            )}
            <button className="adm-btn adm-btn--primary adm-btn--sm" onClick={() => setActiveId('publish')}>
              <Rocket size={15} /> Publish
            </button>
          </div>
        </header>

        {saveError && (
          <p className="adm-banner">
            Your browser's storage is full, so the latest edits are not saved locally. Publish now, or remove some large images.
          </p>
        )}

        <main className="adm-body">
          <div className="adm-body__inner">
            <h1 className="adm-h1">{activeId === 'publish' ? 'Publish' : section.label}</h1>
            {section?.description && <p className="adm-muted adm-lead">{section.description}</p>}

            {activeId === 'publish' && <PublishPanel content={content} dirty={dirty} />}

            {section?.kind === 'object' && (
              <div className="adm-form">
                <ObjectFields fields={section.fields} value={content[section.id] || {}} onChange={(v) => setSection(section.id, v)} />
              </div>
            )}

            {section?.kind === 'list' && (
              <ListEditor field={section} value={content[section.id] || []} onChange={(v) => setSection(section.id, v)} />
            )}
          </div>
        </main>
      </div>

      {toast && (
        <div className="adm-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}

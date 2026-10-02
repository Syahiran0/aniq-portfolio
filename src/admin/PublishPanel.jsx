import { useMemo, useState } from 'react'
import { CheckCircle2, ExternalLink, Eye, EyeOff, Loader2, Rocket, ShieldCheck, TriangleAlert } from 'lucide-react'
import { testConnection } from '../lib/github'
import { countUploads, publishContent } from '../lib/publish'
import { clearSettings, loadSettings, saveSettings } from './settings'

/**
 * Publishing = committing content.json (+ any new images) to the GitHub repo.
 * GitHub Actions / Vercel then rebuilds the site automatically (about a minute).
 */
export default function PublishPanel({ content, dirty }) {
  const [settings, setSettings] = useState(loadSettings)
  const [showToken, setShowToken] = useState(false)
  const [check, setCheck] = useState(null) // { ok, message }
  const [run, setRun] = useState({ state: 'idle' }) // idle | testing | publishing | done | error

  const uploads = useMemo(() => countUploads(content), [content])
  const ready = settings.owner.trim() && settings.repo.trim() && settings.token.trim()

  const change = (key, value) => {
    const next = { ...settings, [key]: value }
    setSettings(next)
    saveSettings(next)
    setCheck(null)
  }

  const test = async () => {
    setRun({ state: 'testing' })
    try {
      const info = await testConnection({ owner: settings.owner.trim(), repo: settings.repo.trim(), token: settings.token.trim() })
      setCheck(
        info.canPush
          ? { ok: true, message: `Connected to ${info.fullName}${info.isPrivate ? ' (private)' : ''}. The token can write to it.` }
          : { ok: false, message: `Connected to ${info.fullName}, but this token cannot write. Give it "Contents: Read and write".` },
      )
    } catch (err) {
      setCheck({ ok: false, message: err.message })
    }
    setRun({ state: 'idle' })
  }

  const publish = async () => {
    setRun({ state: 'publishing' })
    try {
      const result = await publishContent(content, settings)
      setRun({ state: 'done', result })
    } catch (err) {
      setRun({ state: 'error', message: err.message })
    }
  }

  const forget = () => {
    clearSettings()
    setSettings(loadSettings())
    setCheck(null)
  }

  return (
    <div className="adm-publish">
      <section className="adm-card">
        <h3>
          <Rocket size={18} /> Publish your changes
        </h3>
        <p className="adm-muted">
          {dirty
            ? `You have unpublished changes${uploads ? ` and ${uploads} new file${uploads > 1 ? 's' : ''} to upload` : ''}.`
            : 'Everything is published. Edit something and come back here.'}
        </p>

        <button className="adm-btn adm-btn--primary" disabled={!dirty || !ready || run.state === 'publishing'} onClick={publish}>
          {run.state === 'publishing' ? (
            <>
              <Loader2 size={16} className="spin" /> Publishing…
            </>
          ) : (
            <>
              <Rocket size={16} /> Publish to GitHub
            </>
          )}
        </button>
        {!ready && <p className="adm-note adm-note--warn">Connect GitHub below first (one-time setup).</p>}

        {run.state === 'done' && (
          <p className="adm-note adm-note--ok">
            <CheckCircle2 size={16} /> Published! GitHub is rebuilding the site. It goes live in about a minute.{' '}
            <a href={run.result.url} target="_blank" rel="noreferrer">
              View commit <ExternalLink size={13} />
            </a>
          </p>
        )}
        {run.state === 'error' && (
          <p className="adm-note adm-note--error">
            <TriangleAlert size={16} /> {run.message}
          </p>
        )}
      </section>

      <section className="adm-card">
        <h3>
          <ShieldCheck size={18} /> Connect GitHub <small>(one-time setup)</small>
        </h3>
        <ol className="adm-steps">
          <li>
            Open{' '}
            <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">
              GitHub → New fine-grained token <ExternalLink size={13} />
            </a>
            .
          </li>
          <li>
            Name it <em>Portfolio dashboard</em>. Under <em>Repository access</em> choose <em>Only select repositories</em> and pick this portfolio repo.
          </li>
          <li>
            Under <em>Permissions → Repository permissions</em> set <em>Contents</em> to <em>Read and write</em>, then generate the token.
          </li>
          <li>Paste it below. It is stored only in this browser and only ever sent to GitHub.</li>
        </ol>

        <div className="adm-grid-2">
          <label className="adm-field">
            <span className="adm-field__label">GitHub username</span>
            <input className="adm-input" value={settings.owner} onChange={(e) => change('owner', e.target.value)} placeholder="your-username" autoComplete="off" />
          </label>
          <label className="adm-field">
            <span className="adm-field__label">Repository name</span>
            <input className="adm-input" value={settings.repo} onChange={(e) => change('repo', e.target.value)} autoComplete="off" />
          </label>
          <label className="adm-field">
            <span className="adm-field__label">Branch</span>
            <input className="adm-input" value={settings.branch} onChange={(e) => change('branch', e.target.value)} autoComplete="off" />
          </label>
          <label className="adm-field">
            <span className="adm-field__label">Access token</span>
            <span className="adm-secret">
              <input
                className="adm-input"
                type={showToken ? 'text' : 'password'}
                value={settings.token}
                onChange={(e) => change('token', e.target.value)}
                placeholder="github_pat_…"
                autoComplete="off"
                spellCheck={false}
              />
              <button type="button" className="adm-icon" onClick={() => setShowToken((v) => !v)} aria-label={showToken ? 'Hide token' : 'Show token'}>
                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </span>
          </label>
        </div>

        <div className="adm-row">
          <button className="adm-btn" onClick={test} disabled={!ready || run.state === 'testing'}>
            {run.state === 'testing' ? <Loader2 size={16} className="spin" /> : <ShieldCheck size={16} />} Test connection
          </button>
          <button className="adm-btn adm-btn--ghost" onClick={forget}>
            Forget token on this device
          </button>
        </div>

        {check && (
          <p className={`adm-note ${check.ok ? 'adm-note--ok' : 'adm-note--error'}`}>
            {check.ok ? <CheckCircle2 size={16} /> : <TriangleAlert size={16} />} {check.message}
          </p>
        )}
      </section>
    </div>
  )
}

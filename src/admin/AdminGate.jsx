import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, TriangleAlert } from 'lucide-react'
import './admin.css'

// The dashboard code is only requested once the server has said you are signed in.
const AdminPage = lazy(() => import('./AdminPage'))

const json = { 'Content-Type': 'application/json' }
const opts = { credentials: 'same-origin', cache: 'no-store' }

/**
 * Sits in front of the dashboard. The password is checked by the server (api/login.js), never in the browser.
 * Fails closed: if the login service can't be reached (for example on a host without /api) the dashboard stays shut.
 */
export default function AdminGate() {
  const [state, setState] = useState('checking') // checking | locked | open | unavailable

  /** Asks the server who we are. `quiet` re-checks never close an open dashboard over a network blip. */
  const verify = useCallback(async (quiet = false) => {
    try {
      const res = await fetch('/api/session', opts)
      const data = res.ok ? await res.json() : null
      if (data) {
        setState(data.authenticated ? 'open' : 'locked')
        return !!data.authenticated
      }
    } catch {
      /* handled below */
    }
    if (!quiet) setState('unavailable')
    return false
  }, [])

  useEffect(() => {
    verify()
    // coming back to the tab after the session expired locks it again
    const onVisible = () => document.visibilityState === 'visible' && verify(true)
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [verify])

  const logout = async () => {
    try {
      await fetch('/api/logout', { ...opts, method: 'POST' })
    } finally {
      setState('locked')
    }
  }

  if (state === 'open') {
    return (
      <Suspense fallback={null}>
        <AdminPage onLogout={logout} />
      </Suspense>
    )
  }

  return (
    <div className="adm-login">
      <div className="adm-login__card">
        <span className="adm-login__icon">
          <Lock size={22} />
        </span>
        <h1>Dashboard</h1>

        {state === 'checking' && (
          <p className="adm-muted adm-login__status">
            <Loader2 size={16} className="spin" /> Checking…
          </p>
        )}

        {state === 'unavailable' && (
          <p className="adm-note adm-note--warn">
            <TriangleAlert size={16} /> The login service isn't reachable from here, so the dashboard stays closed. Open it from the main site address instead.
          </p>
        )}

        {state === 'locked' && <LoginForm onSignedIn={() => verify()} />}

        <Link to="/" className="adm-login__back">
          <ArrowLeft size={15} /> Back to site
        </Link>
      </div>
    </div>
  )
}

function LoginForm({ onSignedIn }) {
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!password || busy) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/login', { ...opts, method: 'POST', headers: json, body: JSON.stringify({ password }) })
      if (res.ok) {
        setPassword('')
        if (!(await onSignedIn())) setError('Signed in, but your browser did not keep the session. Check that cookies are allowed for this site.')
        return
      }
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Could not sign in.')
      if (res.status === 401) setPassword('')
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="adm-login__form" onSubmit={submit}>
      <label className="adm-field">
        <span className="adm-field__label">Password</span>
        <span className="adm-secret">
          <input
            className="adm-input"
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            autoFocus
            spellCheck={false}
            aria-invalid={!!error}
          />
          <button type="button" className="adm-icon" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </span>
      </label>

      {error && (
        <p className="adm-note adm-note--error" role="alert">
          <TriangleAlert size={16} /> {error}
        </p>
      )}

      <button className="adm-btn adm-btn--primary" disabled={!password || busy}>
        {busy ? <Loader2 size={16} className="spin" /> : <Lock size={16} />} {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}

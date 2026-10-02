const KEY = 'aniq-portfolio:admin-settings'

/** On GitHub Pages the owner/repo can be read from the URL (owner.github.io/repo). */
function guessFromUrl() {
  const { hostname, pathname } = window.location
  if (!hostname.endsWith('.github.io')) return {}
  return { owner: hostname.split('.')[0], repo: pathname.split('/').filter(Boolean)[0] || hostname }
}

export function loadSettings() {
  const defaults = { owner: '', repo: 'aniq-portfolio', branch: 'main', token: '', ...guessFromUrl() }
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return defaults
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings))
    return true
  } catch {
    return false
  }
}

export function clearSettings() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

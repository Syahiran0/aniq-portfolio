import { sendJson, setSessionCookie } from './_lib/auth.js'

/** POST -> clears the session cookie. */
export default function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed.' }, { Allow: 'POST' })

  setSessionCookie(req, res, '', 0)
  return sendJson(res, 200, { authenticated: false })
}

import { COOKIE_NAME, readConfig, readCookie, sendJson, tokenIsValid } from './_lib/auth.js'

/** GET -> { authenticated } for the current cookie. The dashboard asks this before it loads. */
export default function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed.' }, { Allow: 'GET' })

  const config = readConfig()
  if (!config) return sendJson(res, 500, { error: 'Login is not set up on the server yet.' })

  return sendJson(res, 200, { authenticated: tokenIsValid(readCookie(req, COOKIE_NAME), config.key) })
}

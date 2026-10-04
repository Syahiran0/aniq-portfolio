import {
  clearFailures,
  clientIp,
  issueToken,
  loginBlocked,
  passwordMatches,
  readConfig,
  readJson,
  recordFailure,
  sendJson,
  setSessionCookie,
  sleep,
} from './_lib/auth.js'

/** POST { password } -> sets the session cookie when the password matches ADMIN_PASSWORD. */
export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed.' }, { Allow: 'POST' })

  const config = readConfig()
  if (!config) return sendJson(res, 500, { error: 'Login is not set up on the server yet.' })

  const ip = clientIp(req)
  const wait = loginBlocked(ip)
  if (wait) return sendJson(res, 429, { error: 'Too many wrong attempts. Try again later.' }, { 'Retry-After': String(wait) })

  const body = await readJson(req)
  if (!body || typeof body.password !== 'string' || !body.password) return sendJson(res, 400, { error: 'Enter the password.' })

  if (!passwordMatches(body.password, config.password)) {
    recordFailure(ip)
    await sleep(800) // slows down guessing
    return sendJson(res, 401, { error: 'Wrong password.' })
  }

  clearFailures(ip)
  setSessionCookie(req, res, issueToken(config.key))
  return sendJson(res, 200, { authenticated: true })
}

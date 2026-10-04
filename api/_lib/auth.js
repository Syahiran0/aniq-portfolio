import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Shared helpers for the dashboard login (the files in /api).
 * Files starting with "_" are not exposed as endpoints by Vercel.
 *
 * Session = a cookie holding "<expiry>.<signature>". The signature covers the expiry and is keyed with
 * SESSION_SECRET + ADMIN_PASSWORD, so nothing can be forged without the secret, and changing the
 * password signs everyone out.
 */

export const COOKIE_NAME = 'admin_session'
export const SESSION_SECONDS = 12 * 60 * 60

const MAX_FAILURES = 5
const FAILURE_WINDOW_MS = 15 * 60 * 1000

const sha256 = (value) => createHash('sha256').update(value).digest()

/** The two secrets, from the environment. null means the server isn't set up (fail closed). */
export function readConfig(env = process.env) {
  const password = env.ADMIN_PASSWORD
  const secret = env.SESSION_SECRET
  if (!password || !secret || secret.length < 32) return null
  return { key: `${secret}\0${password}`, password }
}

/** Constant-time comparison (hashing first makes both sides the same length). */
export const passwordMatches = (input, expected) => timingSafeEqual(sha256(String(input ?? '')), sha256(expected))

const sign = (value, key) => createHmac('sha256', key).update(value).digest('base64url')

export function issueToken(key, now = Date.now()) {
  const expires = String(now + SESSION_SECONDS * 1000)
  return `${expires}.${sign(expires, key)}`
}

export function tokenIsValid(token, key, now = Date.now()) {
  if (typeof token !== 'string') return false
  const [expires, signature, ...extra] = token.split('.')
  if (!expires || !signature || extra.length) return false
  const given = Buffer.from(signature)
  const expected = Buffer.from(sign(expires, key))
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false
  return Number(expires) > now
}

export function readCookie(req, name) {
  for (const part of (req.headers.cookie || '').split(';')) {
    const at = part.indexOf('=')
    if (at > -1 && part.slice(0, at).trim() === name) {
      try {
        return decodeURIComponent(part.slice(at + 1).trim())
      } catch {
        return ''
      }
    }
  }
  return ''
}

/** HttpOnly (scripts can't read it), SameSite=Strict (other sites can't trigger it), only sent to /api. */
export function setSessionCookie(req, res, value, maxAge = SESSION_SECONDS) {
  const secure = String(req.headers['x-forwarded-proto'] || '').split(',')[0] === 'https'
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${value}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? '; Secure' : ''}`)
}

export function sendJson(res, status, body, headers = {}) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value)
  res.end(JSON.stringify(body))
}

/** Small JSON body, or null if it is missing, malformed or too big. Works on Vercel and in the Vite dev server. */
export async function readJson(req, limit = 4096) {
  try {
    const parsed = req.body
    if (parsed && typeof parsed === 'object' && !Buffer.isBuffer(parsed)) return parsed
    if (typeof parsed === 'string') return JSON.parse(parsed)

    const chunks = []
    let size = 0
    for await (const chunk of req) {
      size += chunk.length
      if (size > limit) return null
      chunks.push(chunk)
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return null
  }
}

export const clientIp = (req) => String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown'

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Failed-login counter per IP. It lives in memory, so on serverless it only covers one warm instance:
 * a speed bump on top of the delay after each wrong guess, not a hard limit.
 */
const failures = new Map()

export function loginBlocked(ip, now = Date.now()) {
  const entry = failures.get(ip)
  if (!entry || entry.resetAt <= now) return 0
  return entry.count >= MAX_FAILURES ? Math.ceil((entry.resetAt - now) / 1000) : 0 // seconds to wait
}

export function recordFailure(ip, now = Date.now()) {
  if (failures.size > 500) for (const [key, entry] of failures) if (entry.resetAt <= now) failures.delete(key)
  const entry = failures.get(ip)
  if (!entry || entry.resetAt <= now) failures.set(ip, { count: 1, resetAt: now + FAILURE_WINDOW_MS })
  else entry.count += 1
}

export const clearFailures = (ip) => failures.delete(ip)

// Copies the login secrets from your local .env to the linked Vercel project (Production).
//   npm run env:push
// Values go to the Vercel CLI over stdin, so they never appear on a command line.
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const NAMES = ['ADMIN_PASSWORD', 'SESSION_SECRET']

let text
try {
  text = readFileSync(new URL('../.env', import.meta.url), 'utf8')
} catch {
  console.error('No .env file found. Copy .env.example to .env and fill it in first.')
  process.exit(1)
}

const env = Object.fromEntries(
  text
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.trim().startsWith('#') && line.includes('='))
    .map((line) => [line.slice(0, line.indexOf('=')).trim(), line.slice(line.indexOf('=') + 1).trim()]),
)

for (const name of NAMES) {
  if (!env[name]) {
    console.error(`${name} is missing in .env`)
    process.exit(1)
  }
}
if (env.SESSION_SECRET.length < 32) {
  console.error('SESSION_SECRET in .env must be at least 32 characters.')
  process.exit(1)
}

for (const name of NAMES) {
  // --sensitive --yes answer the CLI's "Secret or Config?" questions up front, so nothing is left to prompt for
  const run = spawnSync(`npx vercel env add ${name} production --force --sensitive --yes --non-interactive`, {
    input: env[name],
    encoding: 'utf8',
    shell: true,
  })
  const output = `${run.stdout || ''}${run.stderr || ''}`
  // the CLI can print an error and still exit 0, so the exit code alone isn't trusted
  if (run.status !== 0 || /\berror\b/i.test(output) || !/(Overrode|Added)/.test(output)) {
    console.error(output.trim())
    console.error(`\nCould not set ${name} on Vercel. Run "npx vercel login" and "npx vercel link" first, then try again.`)
    process.exit(run.status || 1)
  }
  console.log(`✓ ${name} saved to Vercel (Production)`)
}

console.log('\nDone. Redeploy for the change to apply:  npx vercel deploy --prod   (or push a commit)')

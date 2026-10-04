import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Serves the /api functions (the dashboard login) from `npm run dev`, reading secrets from .env,
 * so login works locally without the Vercel CLI. In production Vercel runs the same files itself.
 */
function devApi() {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      for (const [key, value] of Object.entries(loadEnv('development', process.cwd(), ''))) {
        if (process.env[key] === undefined) process.env[key] = value
      }

      server.middlewares.use(async (req, res, next) => {
        const route = /^\/api\/([a-z-]+)(?:\?.*)?$/.exec(req.url || '')
        if (!route) return next()
        try {
          const handler = (await server.ssrLoadModule(`/api/${route[1]}.js`)).default
          await handler(req, res)
        } catch (error) {
          const missing = /Failed to load url|Cannot find module/.test(String(error?.message))
          res.statusCode = missing ? 404 : 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: missing ? 'Not found.' : 'Server error.' }))
          if (!missing) server.config.logger.error(String(error?.stack || error))
        }
      })
    },
  }
}

// base './' keeps asset paths relative, so the same build works on
// GitHub Pages (/repo-name/), Vercel (/) and a custom domain.
export default defineConfig({
  base: './',
  plugins: [react(), devApi()],
  server: { port: 5173, open: false },
})

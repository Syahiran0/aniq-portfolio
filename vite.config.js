import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' keeps asset paths relative, so the same build works on
// GitHub Pages (/repo-name/), Vercel (/) and a custom domain.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173, open: false },
})

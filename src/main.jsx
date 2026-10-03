import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'

import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import '@fontsource-variable/pixelify-sans'
import '@fontsource-variable/caveat'
import './styles/tokens.css'
import './styles/base.css'

import App from './App.jsx'
import './styles/touch.css' // after App so its touch overrides win the cascade

// HashRouter keeps routing client-side only (/#/ and /#/admin),
// so the site works on GitHub Pages and Vercel with no server config.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)

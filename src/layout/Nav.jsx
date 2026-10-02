import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { useContent } from '../content/store'
import { asset, initials } from '../lib/assets'
import { scrollToId, useActiveSection, useTheme } from '../lib/hooks'
import './Nav.css'

const LINKS = [
  { id: 'work', label: 'Work' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'about', label: 'About' },
  { id: 'stories', label: 'Stories' },
  { id: 'journey', label: 'Journey' },
  { id: 'connect', label: 'Contact' },
]

/** Floating pill navigation, inspired by both reference designs. */
export default function Nav({ onConnect }) {
  const { profile, site } = useContent()
  const [theme, toggleTheme] = useTheme()
  const [open, setOpen] = useState(false)
  const links = LINKS.filter((l) => site.sections[l.id] !== false)
  // observe every section (not just the nav ones) so the highlight clears on sections without a link
  const active = useActiveSection(['top', 'work', 'achievements', 'about', 'stories', 'journey', 'certifications', 'skills', 'leadership', 'gallery', 'connect'])

  const go = (id) => {
    setOpen(false)
    scrollToId(id)
  }

  return (
    <header className="nav">
      <nav className="nav__pill" aria-label="Primary">
        <button className="nav__logo" onClick={() => go('top')} aria-label="Back to top">
          {profile.photo ? <img src={asset(profile.photo)} alt="" /> : <span>{initials(profile.name)}</span>}
        </button>

        <ul className="nav__links">
          {links.map((l) => (
            <li key={l.id}>
              <button className={active === l.id ? 'is-active' : ''} onClick={() => go(l.id)}>
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <button className="icon-btn nav__theme" onClick={toggleTheme} aria-label="Toggle light / dark theme">
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button className="btn btn--light btn--sm nav__cta" onClick={onConnect}>
          Get in touch
        </button>

        <button
          className="icon-btn nav__burger"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            className="nav__sheet"
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.25 }}
          >
            {links.map((l) => (
              <li key={l.id}>
                <button onClick={() => go(l.id)}>{l.label}</button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  )
}

import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent, isDirty, discardDraft } from '../content/store'
import Nav from '../layout/Nav'
import Footer from '../layout/Footer'
import ConnectModal from '../layout/ConnectModal'
import Hero from '../sections/Hero'
import Stats from '../sections/Stats'
import Work from '../sections/Work'
import Achievements from '../sections/Achievements'
import About from '../sections/About'
import Stories from '../sections/Stories'
import Journey from '../sections/Journey'
import Certifications from '../sections/Certifications'
import Skills from '../sections/Skills'
import Leadership from '../sections/Leadership'
import Gallery from '../sections/Gallery'
import Connect from '../sections/Connect'

/** Shown only to the person editing: their browser holds changes that aren't published yet. */
function DraftBanner() {
  const content = useContent()
  if (!isDirty(content)) return null
  return (
    <div className="draft-banner" role="status">
      <span className="draft-banner__dot" />
      Previewing unpublished changes
      <Link className="btn btn--light btn--sm" to="/admin">
        Dashboard
      </Link>
      <button className="btn btn--ghost btn--sm" onClick={discardDraft}>
        Discard
      </button>
    </div>
  )
}

/**
 * The public portfolio. To add, remove or reorder a section, edit the list below.
 * Each section reads its own data from src/content/content.json via useContent().
 */
export default function Home() {
  const { site } = useContent()
  const [connectOpen, setConnectOpen] = useState(false)
  const openConnect = useCallback(() => setConnectOpen(true), [])
  const closeConnect = useCallback(() => setConnectOpen(false), [])
  const on = (key) => site.sections[key] !== false

  return (
    <>
      <Nav onConnect={openConnect} />
      <main>
        <Hero onConnect={openConnect} />
        {on('stats') && <Stats />}
        {on('work') && <Work />}
        {on('achievements') && <Achievements />}
        {on('about') && <About onConnect={openConnect} />}
        {on('stories') && <Stories />}
        {on('journey') && <Journey />}
        {on('certifications') && <Certifications />}
        {on('skills') && <Skills />}
        {on('leadership') && <Leadership />}
        {on('gallery') && <Gallery />}
        {on('connect') && <Connect />}
      </main>
      <Footer />
      <ConnectModal open={connectOpen} onClose={closeConnect} />
      <DraftBanner />
    </>
  )
}

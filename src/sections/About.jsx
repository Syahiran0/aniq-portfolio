import { ArrowRight, Download } from 'lucide-react'
import Reveal from '../components/Reveal'
import { Silhouette } from '../components/Icons'
import { useContent } from '../content/store'
import { asset } from '../lib/assets'
import './About.css'

/** Hand-drawn arrow that points from the sticker to the photo. */
const ScribbleArrow = () => (
  <svg className="about__arrow" viewBox="0 0 80 70" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 8c26-6 52 4 56 30 1 8-2 15-8 21" />
    <path d="M44 56l10 5 4-12" />
  </svg>
)

export default function About({ onConnect }) {
  const { about, profile } = useContent()

  return (
    <section className="section about" id="about">
      <div className="container about__grid">
        <Reveal className="about__photo">
          <div className="about__frame">
            {profile.photo ? (
              <img src={asset(profile.photo)} alt={profile.name} />
            ) : (
              <div className="about__placeholder">
                <Silhouette />
              </div>
            )}
            <span className="about__zig" aria-hidden="true" />
          </div>

          <div className="about__sticker" aria-hidden="true">
            <span className="about__burst" />
            <span className="about__sticker-text">{about.stickerText}</span>
            <ScribbleArrow />
          </div>
        </Reveal>

        <div className="about__copy">
          <Reveal className="section__head about__head">
            <span className="kicker">{about.kicker}</span>
            <h2 className="section__title">{about.title}</h2>
          </Reveal>

          <Reveal className="about__text" delay={0.1}>
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </Reveal>

          <Reveal as="dl" className="about__facts" delay={0.15}>
            {about.facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </Reveal>

          <Reveal className="about__actions" delay={0.2}>
            <button className="btn btn--light" onClick={onConnect}>
              Let's talk <ArrowRight size={18} />
            </button>
            {profile.resumeUrl && (
              <a className="btn btn--ghost" href={asset(profile.resumeUrl)} download>
                <Download size={18} /> Resume
              </a>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  )
}

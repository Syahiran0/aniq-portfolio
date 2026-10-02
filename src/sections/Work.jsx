import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import Cover, { shortLabel } from '../components/Cover'
import DetailModal from '../components/DetailModal'
import Reveal from '../components/Reveal'
import { useContent } from '../content/store'
import { pad2 } from '../lib/assets'
import { useInView } from '../lib/hooks'
import './Work.css'

const toDetail = (p) => ({
  title: p.title,
  subtitle: p.subtitle,
  kicker: p.role,
  meta: [p.period],
  cover: p.cover,
  accent: p.accent,
  paragraphs: [p.summary],
  bullets: p.bullets,
  stack: p.stack,
  links: p.links,
})

/** A hand of project cards that spreads out when it scrolls into view. */
function Fan({ projects, onOpen }) {
  const [ref, inView] = useInView({ threshold: 0.35 })
  const n = projects.length

  return (
    <div ref={ref} className={`fan ${inView ? 'is-open' : ''}`}>
      {projects.map((p, i) => {
        const o = i - (n - 1) / 2
        return (
          <button
            key={p.id}
            className={`fan__card ${o > 0 ? 'fan__card--right' : ''}`}
            style={{ '--o': o, '--o2': o * o, '--z': 100 - Math.round(Math.abs(o) * 10), '--d': `${i * 55}ms` }}
            onClick={() => onOpen(p)}
            aria-label={`Open ${p.title}`}
          >
            <Cover image={p.cover} accent={p.accent} label={shortLabel(p.title)} alt={p.title} />
            <span className="fan__tag">
              {p.title}
              <ArrowUpRight size={13} />
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default function Work() {
  const { projects } = useContent()
  const [active, setActive] = useState(null)
  if (!projects.length) return null

  return (
    <section className="section work" id="work">
      <div className="container">
        <Reveal className="section__head">
          <span className="kicker">Selected work</span>
          <h2 className="section__title">
            Things I've built, <em>shipped</em> and demoed.
          </h2>
          <p className="section__lead">From edge-AI infrastructure inspection to IoT wearables. Tap a card to open the full story.</p>
        </Reveal>
      </div>

      <Fan projects={projects} onOpen={setActive} />

      <div className="container">
        <Reveal as="ul" className="plist">
          {projects.map((p, i) => (
            <li key={p.id}>
              <button className="plist__row" style={{ '--c': p.accent }} onClick={() => setActive(p)}>
                <span className="plist__no">{pad2(i + 1)}</span>
                <span className="plist__title">
                  {p.title}
                  <small>{p.subtitle}</small>
                </span>
                <span className="plist__stack">{p.stack.slice(0, 3).join(' · ')}</span>
                <span className="plist__role">{p.role}</span>
                <ArrowUpRight className="plist__arrow" size={22} />
              </button>
            </li>
          ))}
        </Reveal>
      </div>

      <DetailModal item={active && toDetail(active)} onClose={() => setActive(null)} />
    </section>
  )
}

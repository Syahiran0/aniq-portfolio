import Reveal from '../components/Reveal'
import { useContent } from '../content/store'
import './Leadership.css'

export default function Leadership() {
  const { leadership } = useContent()
  if (!leadership.length) return null

  return (
    <section className="section leadership" id="leadership">
      <div className="container">
        <Reveal className="section__head">
          <span className="kicker">Leadership & activities</span>
          <h2 className="section__title">
            Beyond the code: <em>leading, organising, volunteering.</em>
          </h2>
        </Reveal>

        <ul className="lead-list">
          {leadership.map((l, i) => (
            <Reveal as="li" key={l.id} className="lead" delay={Math.min(i, 4) * 0.04}>
              <span className="lead__period">{l.period || '·'}</span>
              <span className="lead__main">
                <strong>{l.role}</strong>
                <span>{l.org}</span>
              </span>
              <span className="lead__detail">{l.detail}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

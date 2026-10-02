import Reveal from '../components/Reveal'
import { useContent } from '../content/store'
import './Skills.css'

function Marquee({ items, reverse }) {
  // the list is rendered twice so the -50% translate loops seamlessly
  const doubled = [...items, ...items]
  return (
    <div className={`marquee ${reverse ? 'marquee--reverse' : ''}`} aria-hidden="true">
      <div className="marquee__track">
        {doubled.map((item, i) => (
          <span key={i} className="marquee__item">
            {item}
            <i />
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Skills() {
  const { skills } = useContent()
  if (!skills.length) return null

  const all = skills.flatMap((g) => g.items)
  const half = Math.ceil(all.length / 2)

  return (
    <section className="section skills" id="skills">
      <div className="container">
        <Reveal className="section__head">
          <span className="kicker">Toolbox</span>
          <h2 className="section__title">
            Skills across the <em>whole stack.</em>
          </h2>
        </Reveal>

        <div className="skills__grid">
          {skills.map((g, i) => (
            <Reveal key={g.group} delay={(i % 3) * 0.07} className="skill-card">
              <h3>{g.group}</h3>
              <ul>
                {g.items.map((s) => (
                  <li key={s} className="chip">
                    {s}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="skills__marquees">
        <Marquee items={all.slice(0, half)} />
        <Marquee items={all.slice(half)} reverse />
      </div>
    </section>
  )
}

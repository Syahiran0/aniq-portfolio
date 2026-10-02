import { Briefcase, GraduationCap } from 'lucide-react'
import Reveal from '../components/Reveal'
import { useContent } from '../content/store'
import './Journey.css'

function Timeline({ icon, title, items }) {
  if (!items.length) return null
  return (
    <div className="tl">
      <h3 className="tl__heading">
        <span className="tl__icon">{icon}</span>
        {title}
      </h3>
      <ol className="tl__list">
        {items.map((it, i) => (
          <Reveal as="li" key={it.id} className="tl__item" delay={i * 0.1}>
            <span className="tl__dot" aria-hidden="true" />
            <span className="tl__period">{it.period}</span>
            <h4 className="tl__role">{it.role || it.degree}</h4>
            <p className="tl__org">{[it.org || it.school, it.location].filter(Boolean).join(' · ')}</p>
            {(it.bullets || it.details)?.length > 0 && (
              <ul className="tl__bullets">
                {(it.bullets || it.details).map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            )}
          </Reveal>
        ))}
      </ol>
    </div>
  )
}

export default function Journey() {
  const { experience, education } = useContent()
  if (!experience.length && !education.length) return null

  return (
    <section className="section journey" id="journey">
      <div className="container">
        <Reveal className="section__head">
          <span className="kicker">Journey</span>
          <h2 className="section__title">
            Where I've <em>learned</em> and worked.
          </h2>
        </Reveal>
        <div className="journey__cols">
          <Timeline icon={<Briefcase size={18} />} title="Experience" items={experience} />
          <Timeline icon={<GraduationCap size={18} />} title="Education" items={education} />
        </div>
      </div>
    </section>
  )
}

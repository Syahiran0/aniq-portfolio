import Reveal from '../components/Reveal'
import { useContent } from '../content/store'
import './Stats.css'

export default function Stats() {
  const { stats } = useContent()
  if (!stats.length) return null

  return (
    <section className="stats" aria-label="Highlights">
      <div className="container stats__grid">
        {stats.map((s, i) => (
          <Reveal key={`${s.label}-${i}`} delay={i * 0.08} className="stats__item">
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

import { ArrowUpRight, BadgeCheck } from 'lucide-react'
import Reveal from '../components/Reveal'
import { useContent } from '../content/store'
import { asset } from '../lib/assets'
import './Certifications.css'

export default function Certifications() {
  const { certifications } = useContent()
  if (!certifications.length) return null

  return (
    <section className="section certs" id="certifications">
      <div className="container">
        <Reveal className="section__head">
          <span className="kicker">Certifications</span>
          <h2 className="section__title">
            Always <em>learning</em>, always certified.
          </h2>
          <p className="section__lead">Computer vision, IoT and applied AI, straight from the people building the tools.</p>
        </Reveal>

        <div className="certs__grid">
          {certifications.map((c, i) => {
            const Tag = c.url ? 'a' : 'div'
            const linkProps = c.url ? { href: c.url, target: '_blank', rel: 'noreferrer' } : {}
            return (
              <Reveal key={c.id} delay={(i % 3) * 0.08}>
                <Tag className="cert" style={{ '--c': c.accent }} {...linkProps}>
                  {c.image && <img className="cert__img" src={asset(c.image)} alt={`${c.title} certificate`} loading="lazy" />}
                  <span className="cert__top">
                    <span className="cert__badge">
                      <BadgeCheck size={20} />
                    </span>
                    <span className="cert__date">{c.date}</span>
                  </span>
                  <span className="cert__issuer">{c.issuer}</span>
                  <span className="cert__title">{c.title}</span>
                  {c.description && <span className="cert__desc">{c.description}</span>}
                  {c.url && <ArrowUpRight className="cert__link" size={20} />}
                </Tag>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

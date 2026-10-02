import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Trophy } from 'lucide-react'
import Reveal from '../components/Reveal'
import { useContent } from '../content/store'
import { asset, pad2 } from '../lib/assets'
import './Achievements.css'

/**
 * One card of the deck. As later cards slide over it, it shrinks and dims slightly,
 * the "stacked cards" scroll effect from the Pinterest reference.
 */
function StackCard({ item, index, total, progress, reduce }) {
  const target = 1 - (total - 1 - index) * 0.04
  const scale = useTransform(progress, [index / total, 1], [1, reduce ? 1 : target])
  const hasImage = !!item.image

  return (
    <motion.article
      className={`stack__card ${hasImage ? 'has-image' : ''}`}
      style={{ '--c': item.accent, '--i': index, scale }}
    >
      <div className="stack__main">
        <div className="stack__top">
          <span className="stack__rank">{item.rank}</span>
          <span className="stack__date">{item.date}</span>
        </div>
        <div>
          <h3 className="stack__title" data-long={item.title.length > 60}>
            {item.title}
          </h3>
          {item.description && <p className="stack__desc">{item.description}</p>}
        </div>
        <span className="stack__no">
          {pad2(index + 1)} <i>/ {pad2(total)}</i>
        </span>
      </div>

      <div className="stack__visual" aria-hidden={!hasImage}>
        {hasImage ? (
          <img src={asset(item.image)} alt={item.title} loading="lazy" />
        ) : (
          <>
            <span className="stack__rings" />
            <Trophy className="stack__icon" strokeWidth={1.2} />
            <span className="stack__giant">{item.rank}</span>
          </>
        )}
      </div>
    </motion.article>
  )
}

export default function Achievements() {
  const { achievements } = useContent()
  const reduce = useReducedMotion()
  const deckRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: deckRef, offset: ['start start', 'end end'] })

  const featured = achievements.filter((a) => a.highlight)
  const others = achievements.filter((a) => !a.highlight)
  if (!achievements.length) return null

  return (
    <section className="section achievements" id="achievements">
      <div className="container">
        <Reveal className="section__head">
          <span className="kicker">Achievements</span>
          <h2 className="section__title">
            Podiums, golds and <em>national stages.</em>
          </h2>
          <p className="section__lead">
            Competitions are where I test ideas against real judges, real deadlines and real hardware.
          </p>
        </Reveal>

        {featured.length > 0 && (
          <div className="stack" ref={deckRef}>
            {featured.map((item, i) => (
              <StackCard key={item.id} item={item} index={i} total={featured.length} progress={scrollYProgress} reduce={reduce} />
            ))}
          </div>
        )}

        {others.length > 0 && (
          <Reveal className="more">
            <h3 className="more__title">More recognition</h3>
            <ul className="more__list">
              {others.map((a) => (
                <li key={a.id} className="more__row" style={{ '--c': a.accent }}>
                  <span className="more__rank">{a.rank}</span>
                  <span className="more__name">
                    {a.title}
                    {a.description && <small>{a.description}</small>}
                  </span>
                  <span className="more__date">{a.date}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
    </section>
  )
}

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import Cover from '../components/Cover'
import { Silhouette } from '../components/Icons'
import ResumeLink from '../components/ResumeLink'
import { useContent } from '../content/store'
import { asset } from '../lib/assets'
import { scrollToId } from '../lib/hooks'
import './Hero.css'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }
const line = {
  hidden: { opacity: 0, y: 40, filter: 'blur(12px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
}
const pop = {
  hidden: { opacity: 0, scale: 0.2, rotate: -25 },
  show: { opacity: 1, scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 220, damping: 14 } },
}

export default function Hero({ onConnect }) {
  const { profile, hero, projects } = useContent()
  const reduce = useReducedMotion()
  const first = projects[0]
  const chipImage = hero.chipImage || first?.cover

  // spotlight that follows the pointer
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <section className="hero" id="top" onPointerMove={onMove}>
      <div className="hero__bg" aria-hidden="true" />

      <div className="hero__inner container">
        <motion.span
          className="tag-label hero__label"
          initial={reduce ? false : { opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.05 }}
        >
          {hero.label}
        </motion.span>

        <motion.h1 className="hero__title" variants={container} initial={reduce ? 'show' : 'hidden'} animate="show">
          <span className="hero__orb" aria-hidden="true" />

          <motion.span className="hero__line" variants={line}>
            <span>{hero.greeting}</span>
            <motion.span className="hero__avatar" variants={pop} aria-hidden="true">
              {profile.photo ? <img src={asset(profile.photo)} alt="" /> : <Silhouette />}
            </motion.span>
            <span>{hero.name}</span>
          </motion.span>

          <motion.span className="hero__line" variants={line}>
            <span>{hero.lead}</span>
            <motion.span className="hero__blob" variants={pop} aria-hidden="true" />
            <span className="hero__hl">{hero.highlight}</span>
          </motion.span>

          <motion.span className="hero__line" variants={line}>
            <motion.button className="hero__chip" variants={pop} onClick={() => scrollToId('work')} aria-label={`View ${hero.chipLabel}`}>
              <Cover image={chipImage} accent={first?.accent} label="" alt="" />
              <span className="hero__chip-tag">
                <ArrowUpRight size={11} strokeWidth={2.5} />
                {hero.chipLabel}
              </span>
            </motion.button>
            <span>{hero.tail}</span>
          </motion.span>
        </motion.h1>

        <motion.p
          className="hero__sub"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
        >
          {hero.sub}
        </motion.p>

        <motion.div
          className="hero__actions"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          <button className="btn btn--light hero__connect" onClick={onConnect}>
            {hero.connectLabel}
            <ArrowRight size={18} />
          </button>
          <ResumeLink className="btn btn--ghost hero__cv" />
        </motion.div>
      </div>

      <button className="hero__scroll" onClick={() => scrollToId('work')}>
        <span className="hero__mouse" aria-hidden="true">
          <i />
        </span>
        {hero.scrollHint}
      </button>
    </section>
  )
}

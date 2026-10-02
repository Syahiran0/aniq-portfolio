import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Cover, { shortLabel } from '../components/Cover'
import DetailModal from '../components/DetailModal'
import Reveal from '../components/Reveal'
import { useContent } from '../content/store'
import './Stories.css'

const toDetail = (s) => ({
  title: s.title,
  kicker: s.kicker,
  meta: [s.date],
  cover: s.cover,
  accent: s.accent,
  paragraphs: s.body,
})

export default function Stories() {
  const { stories } = useContent()
  const track = useRef(null)
  const [active, setActive] = useState(null)
  if (!stories.length) return null

  const slide = (dir) => {
    const el = track.current
    if (!el) return
    const card = el.querySelector('.story')
    el.scrollBy({ left: dir * ((card?.offsetWidth || 360) + 20), behavior: 'smooth' })
  }

  return (
    <section className="section stories" id="stories">
      <div className="container stories__head">
        <Reveal className="section__head">
          <span className="kicker">Stories</span>
          <h2 className="section__title">
            The <em>behind-the-scenes</em> of the wins.
          </h2>
          <p className="section__lead">The people, hardware and late nights behind the trophies.</p>
        </Reveal>
        <div className="stories__arrows">
          <button className="icon-btn" onClick={() => slide(-1)} aria-label="Previous story">
            <ArrowLeft size={18} />
          </button>
          <button className="icon-btn" onClick={() => slide(1)} aria-label="Next story">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className="stories__track" ref={track}>
        {stories.map((s, i) => (
          <Reveal key={s.id} delay={Math.min(i, 3) * 0.08} className="story-wrap">
            <button className="story" style={{ '--c': s.accent }} onClick={() => setActive(s)}>
              <span className="story__cover">
                <Cover image={s.cover} accent={s.accent} label={shortLabel(s.kicker?.split('·')[0] || s.title)} alt="" />
                <span className="story__date">{s.date}</span>
              </span>
              <span className="story__body">
                <span className="story__kicker">{s.kicker}</span>
                <span className="story__title">{s.title}</span>
                <span className="story__excerpt">{s.excerpt}</span>
                <span className="story__more">
                  Read story <ArrowRight size={16} />
                </span>
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      <DetailModal item={active && toDetail(active)} onClose={() => setActive(null)} />
    </section>
  )
}

import { useState } from 'react'
import Modal from '../components/Modal'
import Reveal from '../components/Reveal'
import { useContent } from '../content/store'
import { asset } from '../lib/assets'
import './Gallery.css'

/** Photo wall. Hidden until at least one photo is added in the dashboard. */
export default function Gallery() {
  const { gallery } = useContent()
  const [open, setOpen] = useState(null)
  const photos = gallery.filter((g) => g.image)
  if (!photos.length) return null

  return (
    <section className="section gallery" id="gallery">
      <div className="container">
        <Reveal className="section__head">
          <span className="kicker">Moments</span>
          <h2 className="section__title">
            Snapshots from the <em>stage, lab and field.</em>
          </h2>
        </Reveal>

        <div className="gallery__wall">
          {photos.map((g, i) => (
            <Reveal key={g.id} delay={(i % 4) * 0.06} className="gallery__item">
              <button onClick={() => setOpen(g)} aria-label={`Open photo: ${g.caption || 'photo'}`}>
                <img src={asset(g.image)} alt={g.caption || ''} loading="lazy" />
                {g.caption && <span>{g.caption}</span>}
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <Modal open={!!open} onClose={() => setOpen(null)} label={open?.caption || 'Photo'} size="lg">
        {open && (
          <figure className="lightbox">
            <img src={asset(open.image)} alt={open.caption || ''} />
            {open.caption && <figcaption>{open.caption}</figcaption>}
          </figure>
        )}
      </Modal>
    </section>
  )
}

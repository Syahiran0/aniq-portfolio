import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import Modal from './Modal'
import Cover, { shortLabel } from './Cover'

/**
 * One modal layout for projects and stories.
 * item: { title, subtitle, kicker, meta[], cover, accent, paragraphs[], bullets[], stack[], links[{label,url}] }
 */
export default function DetailModal({ item: current, onClose }) {
  // keep rendering the last item while the close animation plays
  const last = useRef(current)
  if (current) last.current = current
  const item = current || last.current

  return (
    <Modal open={!!current} onClose={onClose} label={item?.title} size="lg">
      {item && (
        <article style={{ '--c': item.accent }}>
          <div className="detail__cover">
            <Cover image={item.cover} accent={item.accent} label={item.label || shortLabel(item.title)} alt={item.title} />
          </div>
          <div className="detail__body">
            <div>
              {item.kicker && <span className="kicker">{item.kicker}</span>}
              <h3 className="detail__title" style={{ marginTop: item.kicker ? 14 : 0 }}>
                {item.title}
              </h3>
              {item.subtitle && <p className="detail__subtitle">{item.subtitle}</p>}
            </div>

            {item.meta?.filter(Boolean).length > 0 && (
              <div className="detail__meta">
                {item.meta.filter(Boolean).map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            )}

            {item.paragraphs?.length > 0 && (
              <div className="detail__text">
                {item.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}

            {item.bullets?.length > 0 && (
              <ul className="detail__bullets">
                {item.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}

            {item.stack?.length > 0 && (
              <div className="detail__stack">
                {item.stack.map((s) => (
                  <span className="chip" key={s}>
                    {s}
                  </span>
                ))}
              </div>
            )}

            {item.links?.filter((l) => l.url).length > 0 && (
              <div className="detail__links">
                {item.links
                  .filter((l) => l.url)
                  .map((l) => (
                    <a key={l.url} className="btn btn--light btn--sm" href={l.url} target="_blank" rel="noreferrer">
                      {l.label || 'Open'} <ArrowUpRight size={16} />
                    </a>
                  ))}
              </div>
            )}
          </div>
        </article>
      )}
    </Modal>
  )
}

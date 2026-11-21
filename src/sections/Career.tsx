import { career, type CareerEntry } from '../content/career'
import { formatMonth } from './career/date'
import { Section } from './Section'
import './career/career.css'

/** Career as loading-screen cards, one per role: our own art and the company's initial, never third-party art.
 *  Renders nothing (and the CAREER tab stays hidden) until career.ts has entries. */
export function Career({ entries = career }: { entries?: readonly CareerEntry[] }) {
  if (!entries.length) return null
  return (
    <Section id="career" title="Career" eyebrow="Experience">
      <ol className="cr">
        {entries.map((e) => (
          <li key={`${e.company}-${e.start}`} className="cr-card" data-now={e.end ? undefined : ''}>
            <div className="cr-card__frame">
              <span className="cr-card__mono hx-gold-text" aria-hidden="true">
                {e.company.charAt(0)}
              </span>
              <div className="cr-card__plate">
                <p className="cr-card__role">{e.role}</p>
                <h3 className="cr-card__company">{e.company}</h3>
                <p className="cr-card__when">
                  <time dateTime={e.start}>{formatMonth(e.start)}</time> – {e.end ? <time dateTime={e.end}>{formatMonth(e.end)}</time> : 'Now'}
                </p>
              </div>
            </div>
            <span className="cr-card__bar" aria-hidden="true" />
            {e.points.length > 0 && (
              <ul className="cr-card__points">
                {e.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </Section>
  )
}

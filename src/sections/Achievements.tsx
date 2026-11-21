import { Icon } from '../components/ui/Icon'
import { achievements, type Achievement } from '../content/career'
import { formatMonth } from './career/date'
import { Section } from './Section'
import './career/career.css'

/** Achievements as the post-game screen: a VICTORY banner over one reward card per entry.
 *  Renders nothing until career.ts lists achievements. */
export function Achievements({ items = achievements }: { items?: readonly Achievement[] }) {
  if (!items.length) return null
  return (
    <Section id="achievements" title="Achievements" eyebrow="Post-game">
      <p className="ac-victory" aria-hidden="true">
        <span className="hx-gold-text">Victory</span>
      </p>
      <ul className="ac">
        {items.map((a) => (
          <li key={a.title} className="ac-card">
            <span className="ac-card__medal" aria-hidden="true">
              <Icon name="trophy" />
            </span>
            <h3 className="ac-card__title">{a.title}</h3>
            {a.detail && <p className="ac-card__detail">{a.detail}</p>}
            {a.date && (
              <p className="ac-card__date">
                <time dateTime={a.date}>{formatMonth(a.date)}</time>
              </p>
            )}
            {a.url && (
              <a className="hx-link ac-card__link" href={a.url} target="_blank" rel="noopener noreferrer">
                View proof<span className="sr-only">: {a.title} (opens in a new tab)</span> <Icon name="external" className="size-4" />
              </a>
            )}
          </li>
        ))}
      </ul>
    </Section>
  )
}

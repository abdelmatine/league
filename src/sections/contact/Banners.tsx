import type { HTMLAttributes, ReactNode } from 'react'
import { Crest } from '../../components/ui/Crest'
import { Icon } from '../../components/ui/Icon'
import { profile } from '../../content/profile'
import { lanes, lanesCovered, shownProjects, techCount } from '../../lib/content'

export type VisitorStatus = 'idle' | 'ready' | 'queue' | 'found' | 'sent'
const STATUS: Record<VisitorStatus, string> = { idle: 'Not ready', ready: 'Ready', queue: 'In queue', found: 'Match found', sent: 'Message sent' }

const TOKENS = [
  { value: shownProjects().length, label: 'Projects' },
  { value: techCount(), label: 'Tech' },
  { value: lanesCovered(), label: 'Lanes' },
]
/** Same XP ring as the header crest: share of lanes the shown projects cover. */
const XP = lanesCovered() / lanes().length

// Our own glyphs on a 24 px grid. The owner's lanes come from the profile title ("Web & Mobile").
const GLYPHS: Record<string, ReactNode> = {
  Web: <path d="M3.75 5.5h16.5v13H3.75ZM3.75 9h16.5M9.75 12 7.75 14l2 2m4.5-4 2 2-2 2" />,
  Mobile: <path d="M7.75 2.75h8.5v18.5h-8.5ZM10.5 5.5h3M12 17.25v.5" />,
  mail: <path d="M3.75 6.5h16.5v11H3.75ZM3.75 6.5 12 13l8.25-6.5" />,
  message: <path d="M4 5h16v11h-9.5L6 19.5V16H4ZM7.5 9h9M7.5 12h6" />,
}
const LANES = (profile.title[2] ?? '').split(' & ').filter(Boolean)

const Glyph = ({ name }: { name: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" aria-hidden="true" focusable="false">
    {GLYPHS[name] ?? <path d="M12 7.5 16.5 12 12 16.5 7.5 12Z" />}
  </svg>
)

/** Lobby banner: rod, flag with a chevron foot, cloth sheen. */
function Banner({ children, className, ...rest }: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return (
    <article className={`bn ${className}`} data-reveal="" {...rest}>
      <span className="bn__rod" aria-hidden="true" />
      <div className="bn__flag">
        <div className="bn__body">
          {children}
          <span className="bn__flash" aria-hidden="true" />
        </div>
      </div>
    </article>
  )
}

/** The owner, ready, and the visitor's slot, which fills as the form fields pass. */
export function Banners({ name, checks, status }: { name: string; checks: { name: boolean; mail: boolean; message: boolean }; status: VisitorStatus }) {
  const visitor = name.trim()
  const passed = Object.values(checks).filter(Boolean).length
  return (
    <div className="cx-banners">
      <Banner className="bn--owner" aria-labelledby="contact-owner">
        <Crest className="bn__crest" src={profile.photo} focus={profile.photoFocus} zoom={profile.photoZoom} xp={XP} />
        <div className="bn__id">
          <h3 id="contact-owner" className="bn__name">
            {profile.name}
          </h3>
          <p className="bn__role">{profile.title[0]}</p>
          <p className="bn__status">
            <i className="bn__dot" data-tone="ready" aria-hidden="true" />
            Ready
          </p>
        </div>
        <ul className="bn__pos" aria-label="Builds for">
          {LANES.map((lane) => (
            <li key={lane}>
              <Glyph name={lane} />
              <span className="sr-only">{lane}</span>
            </li>
          ))}
        </ul>
        <ul className="bn__tokens">
          {TOKENS.map((t) => (
            <li key={t.label}>
              <b className="bn__tok">{t.value}</b>
              <small>{t.label}</small>
            </li>
          ))}
        </ul>
      </Banner>

      {/* A mirror of the form for sighted visitors; the fields carry the real state. */}
      <Banner className="bn--you" aria-hidden="true" data-status={status}>
        <Crest className={`bn__crest bn__slot${visitor ? '' : ' is-empty'}`} initials={visitor ? visitor[0].toUpperCase() : '+'} xp={passed / 3} />
        <div className="bn__id">
          <p className="bn__name">{visitor || 'You'}</p>
          <p className="bn__role">Visitor</p>
          <p className="bn__status">
            <i className="bn__dot" data-tone={status === 'idle' ? undefined : status === 'ready' || status === 'sent' ? 'ready' : 'queue'} />
            {STATUS[status]}
          </p>
        </div>
        <ul className="bn__pos">
          <li className={checks.mail ? 'is-lit' : undefined}>
            <Glyph name="mail" />
          </li>
          <li className={checks.message ? 'is-lit' : undefined}>
            <Glyph name="message" />
          </li>
        </ul>
        <div className="bn__ready" data-on={passed === 3 || status === 'sent' ? '' : undefined}>
          <span className="bn__tok bn__tok--lg">
            <Icon name="check" />
          </span>
          <small>All set</small>
        </div>
      </Banner>
    </div>
  )
}

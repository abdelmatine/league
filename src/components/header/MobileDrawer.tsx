import { useRef } from 'react'
import { profile } from '../../content/profile'
import { scrollToId } from '../../lib/scroll'
import { Counter } from '../ui/Counter'
import { Crest } from '../ui/Crest'
import { Dialog } from '../ui/Dialog'
import { Icon } from '../ui/Icon'
import { MusicRow } from './MusicToggle'
import { NAV } from './nav'
import { SoundRow } from './SoundToggle'

/** Below 768 px: the tabs, counters, socials, sound and music, in a side sheet (native modal dialog). */
export function MobileDrawer({ open, onClose, active, counts }: { open: boolean; onClose: () => void; active: string; counts: { projects: number; tech: number } }) {
  const target = useRef<string | null>(null)
  // A tab scrolls once the sheet has closed, when scrolling is unlocked and focus is back on the page.
  const closed = () => {
    onClose()
    const id = target.current
    target.current = null
    if (id) scrollToId(id, { onComplete: () => document.getElementById(id)?.focus({ preventScroll: true }) })
  }
  return (
    <Dialog open={open} onClose={closed} title="Menu" className="hx-drawer">
      <div className="hx-drawer__me">
        <Crest src={profile.photo} focus={profile.photoFocus} zoom={profile.photoZoom} />
        <div>
          <p className="hx-me__name">{profile.name}</p>
          <p className="hx-me__title">{profile.title[0]}</p>
        </div>
      </div>
      <nav aria-label="Sections">
        <ul>
          {NAV.map((t) => (
            <li key={t.id}>
              <a
                href={`#${t.id}`}
                className="hx-row"
                aria-current={active === t.id ? 'true' : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  target.current = t.id
                  onClose()
                }}
              >
                <span className="hx-row__icon">
                  <Icon name={t.icon} />
                </span>
                {t.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="hx-drawer__counters">
        <Counter icon="hex" value={counts.projects} label="Projects shipped" />
        <Counter icon="crystal" value={counts.tech} label="Technologies" className="text-teal-300" />
      </div>
      <ul aria-label="Social profiles">
        {profile.socials.map((s) => (
          <li key={s.id}>
            <a href={s.url} className="hx-row" target="_blank" rel="noopener noreferrer">
              <span className="hx-row__icon">
                <Icon name={s.id} />
              </span>
              {s.label}
              <Icon name="external" className="hx-row__hint size-4" />
            </a>
          </li>
        ))}
      </ul>
      <div>
        <SoundRow />
        <MusicRow />
      </div>
    </Dialog>
  )
}

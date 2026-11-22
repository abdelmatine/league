import { useEffect, useState } from 'react'
import { profile } from '../../content/profile'
import { lanes, lanesCovered, shownProjects, techCount } from '../../lib/content'
import { usePlayState } from '../../lib/playStore'
import { onAnchorClick } from '../../lib/scroll'
import { Counter } from '../ui/Counter'
import { Crest } from '../ui/Crest'
import { Icon } from '../ui/Icon'
import { MobileDrawer } from './MobileDrawer'
import { MusicToggle } from './MusicToggle'
import { NAV, SPY } from './nav'
import { PlayButton } from './PlayButton'
import { QueueCard } from './QueueCard'
import { SoundToggle } from './SoundToggle'

const counts = { projects: shownProjects().length, tech: techCount() }
/** XP ring: share of lanes the shown projects cover. */
const xp = lanesCovered() / lanes().length

/** Scroll-spy: the tab of the section with the most visible height. Reads only; never writes the hash. */
function useActiveTab() {
  const [active, setActive] = useState('home')
  useEffect(() => {
    const seen = new Map<string, number>()
    const hdr = getComputedStyle(document.documentElement).getPropertyValue('--hdr').trim() || '72px'
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting ? e.intersectionRect.height : 0)
        const [best] = [...seen].sort((a, b) => b[1] - a[1])
        if (best && best[1] > 0) setActive(SPY[best[0]])
      },
      { rootMargin: `-${hdr} 0px 0px 0px`, threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
    )
    for (const id of Object.keys(SPY)) {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [])
  return active
}

/** Ticks once a second while `on`, for the queue clock (a stale first value reads as 0:00). */
function useNow(on: boolean) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    if (!on) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [on])
  return now
}

export function Header() {
  const play = usePlayState()
  const active = useActiveTab()
  const now = useNow(play.name === 'queue')
  const [menu, setMenu] = useState(false)
  return (
    <header className="hx-header">
      <div className="hx-header__bar">
        <div className="hx-header__left">
          <PlayButton state={play} now={now} />
        </div>
        <nav className="hx-nav" aria-label="Sections">
          <ul>
            {NAV.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`} aria-current={active === t.id ? 'true' : undefined} onClick={(e) => onAnchorClick(e, t.id)}>
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hx-header__right">
          <div className="hx-header__counters">
            <Counter icon="hex" value={counts.projects} label="Projects shipped" />
            <Counter icon="crystal" value={counts.tech} label="Technologies" className="text-teal-300" />
          </div>
          <SoundToggle />
          <MusicToggle />
          <a className="hx-me" href="#about" aria-label={`${profile.name}, ${profile.title[0]}: about`} onClick={(e) => onAnchorClick(e, 'about')}>
            <Crest size="sm" src={profile.photo} focus={profile.photoFocus} zoom={profile.photoZoom} xp={xp} />
            <span className="hx-me__text">
              <span className="hx-me__name">{profile.name}</span>
              <span className="hx-me__title">{profile.title[0]}</span>
            </span>
          </a>
          <button type="button" className="hx-iconbtn hx-menu-btn" aria-label="Open menu" aria-haspopup="dialog" aria-expanded={menu} onClick={() => setMenu(true)}>
            <Icon name="menu" />
          </button>
        </div>
      </div>
      {play.name === 'queue' && <QueueCard elapsed={now - play.since} />}
      <p className="sr-only" aria-live="polite">
        {play.name === 'queue' ? 'In queue' : ''}
      </p>
      <MobileDrawer open={menu} onClose={() => setMenu(false)} active={active} counts={counts} />
    </header>
  )
}

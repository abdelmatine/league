import { useSyncExternalStore } from 'react'
import { music } from '../../lib/music'
import { Icon } from '../ui/Icon'
import { Tooltip } from '../ui/Tooltip'

const useMusic = () => useSyncExternalStore(music.subscribe, music.get, () => false)

/** Header icon button that loops the in-queue music (off on every visit; the file loads on first play). */
export function MusicToggle() {
  const on = useMusic()
  return (
    <Tooltip side="bottom" content={on ? 'Music on' : 'Music off'}>
      <button type="button" className="hx-iconbtn" aria-pressed={on} aria-label="Music" onClick={() => music.set(!on)}>
        <Icon name={on ? 'music-on' : 'music-off'} />
      </button>
    </Tooltip>
  )
}

/** Drawer row version, with a visible label. */
export function MusicRow() {
  const on = useMusic()
  return (
    <button type="button" className="hx-row" aria-pressed={on} onClick={() => music.set(!on)}>
      <span className="hx-row__icon">
        <Icon name={on ? 'music-on' : 'music-off'} />
      </span>
      Music
      <span className="hx-row__hint">{on ? 'On' : 'Off'}</span>
    </button>
  )
}

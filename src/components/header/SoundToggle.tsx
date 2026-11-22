import { useSyncExternalStore } from 'react'
import { sfx } from '../../lib/sfx'
import { Icon } from '../ui/Icon'
import { Tooltip } from '../ui/Tooltip'

const useSound = () => useSyncExternalStore(sfx.subscribe, sfx.isEnabled, () => false)

function toggle(on: boolean) {
  sfx.setEnabled(!on)
  if (!on) sfx.play('click') // audible confirmation
}

/** Header icon button (off by default; the choice is remembered). */
export function SoundToggle() {
  const on = useSound()
  return (
    <Tooltip side="bottom" content={on ? 'Sound on' : 'Sound off'}>
      <button type="button" className="hx-iconbtn" data-sfx="none" aria-pressed={on} aria-label="Sound" onClick={() => toggle(on)}>
        <Icon name={on ? 'sound-on' : 'sound-off'} />
      </button>
    </Tooltip>
  )
}

/** Drawer row version, with a visible label. */
export function SoundRow() {
  const on = useSound()
  return (
    <button type="button" className="hx-row" data-sfx="none" aria-pressed={on} onClick={() => toggle(on)}>
      <span className="hx-row__icon">
        <Icon name={on ? 'sound-on' : 'sound-off'} />
      </span>
      Sound
      <span className="hx-row__hint">{on ? 'On' : 'Off'}</span>
    </button>
  )
}

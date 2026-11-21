import { useState, type CSSProperties } from 'react'
import { formatClock, PLAY_LABEL, type PlayState } from '../../lib/playState'
import { scrollToId } from '../../lib/scroll'

const ARIA: Record<PlayState['name'], string> = {
  patching: 'Play (loading)',
  play: 'Play: go to the contact form',
  queue: 'In queue: go to the contact form',
  found: 'Match found: go to the contact form',
  accepted: 'Accepted: go to the contact form',
}

const focusFirstField = () => document.querySelector<HTMLElement>('#contact :is(input, textarea, select, button, a[href])')?.focus({ preventScroll: true })

/** Our own monogram crest: gold rim, inner ring, an A whose crossbar is a teal gem. */
function BrandCrest() {
  return (
    <svg className="hx-play__crest" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hx-crest-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3ead6" />
          <stop offset=".35" stopColor="#d1b47c" />
          <stop offset=".75" stopColor="#87672f" />
          <stop offset="1" stopColor="#c9a45a" />
        </linearGradient>
        <radialGradient id="hx-crest-face" cx=".5" cy=".38" r=".65">
          <stop offset="0" stopColor="#08313f" />
          <stop offset="1" stopColor="#01080f" />
        </radialGradient>
      </defs>
      <circle className="hx-play__spin" cx="24" cy="24" r="23.25" fill="none" stroke="#2fd0c4" strokeWidth="1" strokeDasharray="2 5" />
      <circle cx="24" cy="24" r="21" fill="url(#hx-crest-face)" stroke="url(#hx-crest-gold)" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="18" fill="none" stroke="#4a3918" />
      <path d="M15.5 33.5 24 13.5l8.5 20M13 33.5h5.5m11 0H35" fill="none" stroke="url(#hx-crest-gold)" strokeWidth="2" />
      <path className="hx-play__gem" d="M24 23.25 27 27l-3 3.75L21 27Z" fill="#2fd0c4" />
      <path d="m24 9.5 1.5 2-1.5 2-1.5-2Z" fill="url(#hx-crest-gold)" />
    </svg>
  )
}

/** Hexagon PLAY plate (45 degree sides). States come from the play store; `now` drives the queue clock. */
export function PlayButton({ state, now }: { state: PlayState; now: number }) {
  const [burst, setBurst] = useState(0)
  const patching = state.name === 'patching'
  return (
    <button
      type="button"
      className="hx-play"
      data-state={state.name}
      aria-disabled={patching || undefined}
      aria-label={ARIA[state.name]}
      style={{ '--p': patching ? state.progress : 1 } as CSSProperties}
      onClick={() => {
        if (patching) return
        setBurst((n) => n + 1)
        scrollToId('contact', { onComplete: focusFirstField })
      }}
    >
      <BrandCrest />
      <span className="hx-play__plate">
        <span className="hx-play__fill" aria-hidden="true">
          <span className="hx-play__progress" />
        </span>
        {PLAY_LABEL[state.name]}
        {state.name === 'queue' && <span className="hx-play__clock">{formatClock(now - state.since)}</span>}
        {burst > 0 && <span key={burst} className="hx-play__burst" aria-hidden="true" />}
      </span>
    </button>
  )
}

// In-queue music: one looping <audio>, created on the first enable, so nothing loads before that.
// Off on every visit (not stored). Paused while the tab is hidden.

export interface Track {
  play(): Promise<void>
  pause(): void
}

export function createMusic(make: () => Track) {
  let on = false
  let hidden = false
  let track: Track | null = null
  let attempt = 0 // a play() failure counts only if no later play or pause has replaced that call
  const subs = new Set<() => void>()
  const set = (v: boolean) => {
    if (v === on) return
    on = v
    subs.forEach((fn) => fn())
  }
  const sync = () => {
    const n = ++attempt
    if (!on || hidden) return void track?.pause()
    track ??= make()
    track.play().catch(() => n === attempt && set(false)) // autoplay policy or a failed load: show it as off
  }
  return {
    get: () => on,
    subscribe(fn: () => void) {
      subs.add(fn)
      return () => void subs.delete(fn)
    },
    set(v: boolean) {
      set(v)
      sync()
    },
    /** Hidden tab: pause. Visible again: resume if still on. */
    setHidden(h: boolean) {
      hidden = h
      sync()
    },
  }
}

// shortcut: iOS Safari ignores `volume` and plays at full level; route it through a GainNode if that matters.
export const music = createMusic(() => Object.assign(new Audio(), { preload: 'none', loop: true, volume: 0.35, src: '/sounds/inqueue.mp3' }))

if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => music.setHidden(document.visibilityState === 'hidden'))

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
  const show = (v: boolean) => {
    if (v === on) return
    on = v
    subs.forEach((fn) => fn())
  }
  const sync = () => {
    const n = ++attempt
    if (!on || hidden) return void track?.pause()
    track ??= make()
    // Autoplay policy or a failed load: show it as off.
    track.play().catch(() => {
      if (n !== attempt) return
      track = null // a failed element never retries its load, so the next press makes a new one
      show(false)
    })
  }
  return {
    get: () => on,
    subscribe(fn: () => void) {
      subs.add(fn)
      return () => void subs.delete(fn)
    },
    set(v: boolean) {
      show(v)
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
// Media keys, the lock screen and the browser's media controls go through the store, not straight to the element,
// so the toggle stays right and a hidden-then-visible tab never restarts music the visitor paused there.
if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('play', () => music.set(true))
  navigator.mediaSession.setActionHandler('pause', () => music.set(false))
}

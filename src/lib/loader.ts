import { playStore } from './playStore'

/* Inline loader (spec §6.1). index.html paints the overlay (#ld) before any JS; this module fills its ring on real
   milestones, shows MATCH ACCEPTED, holds, and lets it go while the header PLAY plate goes patching -> play.
   The pure state machine is unit tested; the driver below only touches the DOM. */

export type Milestone = 'html' | 'fonts' | 'app' | 'stage' | 'frame'
/** Ring share per milestone: in their usual order they read 10, 35, 60, 90 and 100 %. */
export const WEIGHT: Record<Milestone, number> = { html: 0.1, fonts: 0.25, app: 0.25, stage: 0.3, frame: 0.1 }
const ALL = Object.keys(WEIGHT).length

/** ms. hold: MATCH ACCEPTED on screen; out: the overlay's exit; quick: exit after a skip, the failsafe or under
 *  reduced motion; returning: a same-session visit leaves by then and fades as fast (the 600 ms version). */
export const TIMING = { hold: 400, out: 600, quick: 200, failsafe: 10_000, returning: 300 } as const

export type Phase = 'loading' | 'accepted' | 'leaving' | 'gone'
export interface LoaderState {
  phase: Phase
  reached: readonly Milestone[]
  /** Left early (skip or failsafe): no entrance choreography, everything shows at once. */
  fast: boolean
}
export type LoaderEvent =
  | { type: 'reach'; milestone: Milestone }
  | { type: 'held' } // accepted -> leaving
  | { type: 'cap' } // returning visit's time is up: leave, entrance kept
  | { type: 'skip' } // visitor interaction
  | { type: 'timeout' } // 10 s failsafe
  | { type: 'left' } // exit animation done

export const initialLoader: LoaderState = { phase: 'loading', reached: [], fast: false }

export const progressOf = (reached: readonly Milestone[]) => Math.min(1, Math.round(reached.reduce((p, m) => p + WEIGHT[m], 0) * 100) / 100)

/** Pure transition. Events that don't apply return the same object. Milestones still count after the exit started. */
export function loaderReducer(s: LoaderState, e: LoaderEvent): LoaderState {
  const up = s.phase === 'loading' || s.phase === 'accepted'
  switch (e.type) {
    case 'reach': {
      if (s.reached.includes(e.milestone)) return s
      const reached = [...s.reached, e.milestone]
      return { ...s, reached, phase: s.phase === 'loading' && reached.length === ALL ? 'accepted' : s.phase }
    }
    case 'held':
      return s.phase === 'accepted' ? { ...s, phase: 'leaving' } : s
    case 'cap':
      return up ? { ...s, phase: 'leaving' } : s
    case 'skip':
    case 'timeout':
      return up ? { ...s, phase: 'leaving', fast: true } : s
    case 'left':
      return s.phase === 'leaving' ? { ...s, phase: 'gone' } : s
  }
}

/* ---------- driver ---------- */

let state = initialLoader
let el: HTMLElement | null = null
let returning = false
/** null until the overlay starts leaving; then whether the hero should play its entrance. */
let reveal: boolean | null = null
const input = new AbortController() // the skip listeners
const watchers = new Set<(intro: boolean) => void>()
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

function dispatch(e: LoaderEvent) {
  const prev = state
  state = loaderReducer(state, e)
  if (state === prev) return
  const p = progressOf(state.reached)
  el?.style.setProperty('--p', String(returning ? 1 : p))
  playStore.dispatch({ type: 'progress', value: p })
  if (state.phase === prev.phase) return
  if (state.phase === 'accepted') {
    el?.classList.add('ok')
    setTimeout(() => dispatch({ type: 'held' }), returning ? 0 : TIMING.hold)
  } else if (state.phase === 'leaving') leave()
}

function leave() {
  input.abort()
  playStore.holdReady(false)
  playStore.dispatch({ type: 'ready' })
  try {
    sessionStorage.setItem('ld', '1')
  } catch {
    // storage blocked: every visit is a first visit
  }
  reveal = !state.fast
  watchers.forEach((fn) => fn(!state.fast))
  watchers.clear()
  const overlay = el
  if (!overlay) return dispatch({ type: 'left' })
  const quick = state.fast || reduced()
  const duration = quick ? TIMING.quick : returning ? TIMING.returning : TIMING.out
  overlay.style.pointerEvents = 'none'
  overlay.style.animation = 'none' // the CSS failsafe stands down
  // Web Animations, not CSS transitions: base.css cuts every transition to 1 ms under reduced motion, and the
  // spec still wants a plain fade there.
  if (!quick) overlay.firstElementChild?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }], { duration, easing: 'cubic-bezier(.6,0,.9,.5)', fill: 'forwards' })
  const fade = overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration, easing: 'cubic-bezier(.3,.1,.3,1)', fill: 'forwards' })
  void fade.finished.then(() => {
    overlay.remove()
    dispatch({ type: 'left' })
  })
}

/** A milestone happened (idempotent). */
export const reach = (milestone: Milestone) => dispatch({ type: 'reach', milestone })

/** Leave now, without the entrance (dev kit page, visitor input). */
export const skipLoader = () => dispatch({ type: 'skip' })

/** Calls `fn(intro)` once, when the overlay starts to leave (at once if it already has, or if there is no overlay).
 *  intro is false after a skip or the failsafe: show everything in place. Returns an unsubscribe function. */
export function onReveal(fn: (intro: boolean) => void) {
  if (reveal !== null) {
    fn(reveal)
    return () => {}
  }
  watchers.add(fn)
  return () => void watchers.delete(fn)
}

/** Takes over the inline overlay. No overlay (or one the CSS failsafe already hid): nothing to hold. */
export function initLoader() {
  el = document.getElementById('ld')
  if (!el || performance.now() > TIMING.failsafe) {
    reveal = false
    el?.remove()
    el = null
    return
  }
  returning = document.documentElement.classList.contains('ld-r')
  playStore.holdReady(true) // App dispatches `ready` on mount; the PLAY plate waits for the overlay instead
  reach('html') // this module runs after parsing (module scripts are deferred)
  const fonts = document.fonts
  void Promise.all([fonts?.load('700 1em "Literata Caps"'), fonts?.load('1em "Source Sans 3"')])
    .catch(() => undefined)
    .then(() => reach('fonts'))
  const skip = () => dispatch({ type: 'skip' })
  for (const type of ['pointerdown', 'keydown', 'wheel', 'touchstart']) addEventListener(type, skip, { passive: true, capture: true, signal: input.signal })
  setTimeout(() => dispatch(returning ? { type: 'cap' } : { type: 'timeout' }), returning ? TIMING.returning : TIMING.failsafe - performance.now())
}

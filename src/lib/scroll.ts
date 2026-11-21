import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap, prefersReducedMotion, ScrollTrigger } from './motion'

/** The one Lenis instance; null before initScroll() and under reduced motion (native scrolling). */
export let lenis: Lenis | null = null

/** One clock: gsap.ticker drives lenis.raf first, then everything else on the ticker (the 3D stage). */
export function initScroll() {
  if (lenis || prefersReducedMotion()) return lenis
  lenis = new Lenis() // Dialog stops it while a modal is open
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis?.raf(time * 1000), false, true)
  gsap.ticker.lagSmoothing(0)
  return lenis
}

/** Scrolls to an element by id. The sticky header is offset by html's scroll-padding-top (Lenis reads it too). */
export function scrollToId(id: string, { onComplete }: { onComplete?: () => void } = {}) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { onComplete: () => onComplete?.() })
  else {
    el.scrollIntoView({ block: 'start' })
    onComplete?.()
  }
}

interface ClickLike {
  button: number
  metaKey: boolean
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
  preventDefault(): void
}

/** In-page link click: scroll there, then move focus to the section so Tab continues from it.
 *  Modified clicks (new tab, etc.) keep their default. The URL hash is left alone. */
export function onAnchorClick(e: ClickLike, id: string) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  e.preventDefault()
  scrollToId(id, { onComplete: () => document.getElementById(id)?.focus({ preventScroll: true }) })
}

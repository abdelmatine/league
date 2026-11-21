import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

// The one place GSAP plugins are registered. Import gsap and friends from here.
gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, useGSAP)

/** Spec §4 easing table, mirrored from tokens.css (motion.test.ts keeps the two in step). */
export const EASES = {
  settle: '0.12,0.8,0.16,1',
  show: '0.22,1,0.36,1',
  glow: '0.3,0.1,0.3,1',
  snap: '0.95,0,0.8,0.4',
  in: '0.6,0,0.9,0.5',
} as const
export type EaseId = keyof typeof EASES
for (const [id, curve] of Object.entries(EASES)) CustomEase.create(id, curve)

/** Spec §4 durations, in seconds for GSAP. */
export const DUR = { fast: 0.12, base: 0.2, slow: 0.32, slower: 0.48, glow: 0.64 } as const

const reduced = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null
export const prefersReducedMotion = () => reduced?.matches ?? false

/** Caps title reveal: characters rise and sharpen, 40 ms apart. Reduced motion: plain fade. */
export function splitReveal(el: HTMLElement, { delay = 0, stagger = 0.04 } = {}) {
  if (prefersReducedMotion()) return gsap.timeline({ delay }).fromTo(el, { opacity: 0 }, { opacity: 1, duration: DUR.base, ease: 'glow' })
  const split = SplitText.create(el, { type: 'chars,words', aria: 'auto' })
  return gsap
    .timeline({ delay, onComplete: () => split.revert() })
    .from(split.chars, { yPercent: 45, opacity: 0, filter: 'blur(6px)', duration: DUR.glow, ease: 'settle', stagger })
}

const NS = 'http://www.w3.org/2000/svg'

/** Frame build-in (750 ms): the corners light first, gold lines run from each corner to meet at the
 *  edge centres, the real border takes over, then the content fades up. Reduced motion: plain fade. */
export function frameBuildIn(frame: HTMLElement, { delay = 0 } = {}) {
  frame.dataset.reveal = 'done'
  if (prefersReducedMotion()) return gsap.timeline({ delay }).fromTo(frame, { opacity: 0 }, { opacity: 1, duration: DUR.base, ease: 'glow' })
  const kids = [...frame.children]
  const w = frame.offsetWidth
  const h = frame.offsetHeight
  const x = w / 2
  const y = h / 2
  const [l, t, r, b] = [0.5, 0.5, w - 0.5, h - 0.5]
  const segs = [
    [l, t, x, t], [l, t, l, y], [r, t, x, t], [r, t, r, y],
    [l, b, x, b], [l, b, l, y], [r, b, x, b], [r, b, r, y],
  ]
  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('class', 'hx-build')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
  const lines = segs.map(([x1, y1, x2, y2]) => {
    const line = document.createElementNS(NS, 'line')
    const len = Math.hypot(x2 - x1, y2 - y1)
    Object.entries({ x1, y1, x2, y2, 'stroke-dasharray': len, 'stroke-dashoffset': len }).forEach(([k, v]) => line.setAttribute(k, String(v)))
    svg.append(line)
    return line
  })
  frame.append(svg)
  frame.classList.add('is-building')
  return gsap
    .timeline({ delay, onComplete: () => { svg.remove(); gsap.set(frame, { clearProps: '--hx-orn' }) } })
    .set(frame, { '--hx-orn': 0 })
    .to(lines, { attr: { 'stroke-dashoffset': 0 }, duration: 0.55, ease: 'show' }, 0)
    .add(() => frame.classList.remove('is-building'), 0.55)
    .to(svg, { opacity: 0, duration: DUR.base, ease: 'glow' }, 0.55)
    .to(frame, { '--hx-orn': 1, duration: DUR.base, ease: 'settle' }, 0.55)
    .from(kids, { opacity: 0, y: 8, duration: DUR.slower, ease: 'settle', stagger: 0.05 }, 0.3)
}

/** Number roll-up for counters. Reduced motion: the final value at once. */
export function counterUp(el: HTMLElement, to: number, { from = 0, duration = 1.2, delay = 0 } = {}) {
  if (prefersReducedMotion()) {
    el.textContent = String(to)
    return gsap.timeline()
  }
  const o = { v: from }
  return gsap.timeline({ delay }).to(o, { v: to, duration, ease: 'settle', onUpdate: () => void (el.textContent = String(Math.round(o.v))) })
}

export { gsap, ScrollTrigger, SplitText, useGSAP }

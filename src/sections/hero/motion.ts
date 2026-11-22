import { heroRig } from '../../components/stage/rig'
import { DUR, gsap, prefersReducedMotion, splitReveal } from '../../lib/motion'

/** Hero entrance: the core powers up (scale, rune write-on, an energy flash at 0.85 s), the name rises and sharpens
 *  char by char (40 ms apart), then the rule opens from its gem and the title and CTAs settle in.
 *  The rest states both ends (fromTo) and clears its props: the buttons transition transform in CSS, so a from()
 *  on them could read its end value mid-transition. Reduced motion: no entrance at all; everything is in place. */
export function heroIntro(root: HTMLElement) {
  const tl = gsap.timeline()
  if (prefersReducedMotion()) return tl
  const q = gsap.utils.selector(root)
  const rise = (y: number, dur: number, stagger: number) =>
    [
      { opacity: 0, y, immediateRender: true },
      { opacity: 1, y: 0, duration: dur, ease: 'settle', stagger, clearProps: 'opacity,transform' },
    ] as const
  return tl
    .fromTo(heroRig, { intro: 0 }, { intro: 1, duration: 1.6, ease: 'settle' }, 0)
    .fromTo(heroRig, { flash: 0 }, { keyframes: [{ flash: 1, duration: 0.3, ease: 'expo.out' }, { flash: 0, duration: 0.9, ease: 'glow' }] }, 0.85)
    .add(splitReveal(q('h1')[0]), 0.2)
    .fromTo(q('.hx-divider'), { clipPath: 'inset(-8px 50%)', immediateRender: true }, { clipPath: 'inset(-8px 0%)', duration: 0.9, ease: 'settle', clearProps: 'clipPath' }, 0.5)
    .fromTo(q('.hx-hero-section__title > span'), ...rise(8, DUR.slower, 0.06), 0.6)
    .fromTo(q('.hx-hero-section__ctas'), ...rise(12, 0.55, 0), 0.8)
}

/** Scroll: the core pulls back and dims as About comes up, and the copy fades and lifts out before it would cross
 *  the core. Opacity only (never visibility), so the CTAs stay focusable. None of it under reduced motion. */
export function heroScroll(root: HTMLElement, copy: HTMLElement) {
  const mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.to(heroRig, { pull: 1, ease: 'none', scrollTrigger: { trigger: root, start: 0, end: 'bottom top', scrub: true } })
    gsap.to(copy, { opacity: 0, yPercent: -14, ease: 'none', scrollTrigger: { trigger: root, start: 0, end: '45% top', scrub: true } })
    gsap.to(root.querySelector('.hx-cue'), { opacity: 0, ease: 'none', scrollTrigger: { trigger: root, start: 0, end: '15% top', scrub: true } })
  })
  return mm
}

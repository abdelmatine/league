import { DUR, gsap, prefersReducedMotion } from '../../lib/motion'
import { sfx } from '../../lib/sfx'

const HOT = '0 0 0 1px rgb(47 208 196 / 0.9), 0 0 28px rgb(47 208 196 / 0.45)'
const COLD = '0 0 0 1px rgb(47 208 196 / 0), 0 0 28px rgb(47 208 196 / 0)'
const STRIKE = 0.28 // lands on the lockIn cue's hit

/** LOCK IN, about 1.2 s: the flash holds then strikes, a ring bursts from the splash, the tile locks,
 *  the grid gives way to the build sheet (`open`, within 0.5 s of the click), then the projects
 *  column lights up. The 3D stage hears the strike as a `cs:lockin` event on its anchor.
 *  Reduced motion: no flash, burst or stagger; the sheet opens at once. */
export function playLockIn(root: HTMLElement, id: string, open: () => void) {
  const q = (s: string) => root.querySelector<HTMLElement>(s)
  const strike = () => q('.cs-stage')?.dispatchEvent(new Event('cs:lockin'))
  sfx.play('lockIn')
  if (prefersReducedMotion()) {
    strike()
    open()
    return
  }
  const flash = q('.cs-flash')
  const skins = root.querySelectorAll('.cs-skin') // empty for a tech with no listed projects
  const t = gsap
    .timeline()
    .fromTo(flash, { opacity: 0 }, { opacity: 0.55, duration: STRIKE, ease: 'snap' })
    .call(strike, undefined, STRIKE)
    .to(flash, { opacity: 0, duration: DUR.slower, ease: 'glow' }, STRIKE)
    .fromTo(q('.cs-burst'), { opacity: 1, scale: 0.3 }, { opacity: 0, scale: 1.5, duration: DUR.glow, ease: 'settle' }, STRIKE)
    .fromTo(q(`#cs-t-${id} .cs-tile__pic`), { scale: 1.2 }, { scale: 1, duration: DUR.slow, ease: 'settle', clearProps: 'transform' }, STRIKE)
    .call(open, undefined, 0.5)
    .fromTo(q('.cs-skins'), { boxShadow: HOT }, { boxShadow: COLD, duration: DUR.glow, ease: 'glow', clearProps: 'boxShadow' }, 0.6)
  if (skins.length) t.fromTo(skins, { opacity: 0.2, x: 10 }, { opacity: 1, x: 0, duration: DUR.slower, ease: 'settle', stagger: 0.06, clearProps: 'opacity,transform' }, 0.6)
}

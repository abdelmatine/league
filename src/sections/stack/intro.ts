import { DUR, gsap, ScrollTrigger } from '../../lib/motion'
import { lenis } from '../../lib/scroll'
import { sfx } from '../../lib/sfx'

interface Hooks {
  /** Mains in pick order, 1-2-2 beats. */
  beats: string[][]
  onBeat: (id: string) => void
  onMessage: (text: string) => void
  /** `played`: the draft actually ran (it is also called when the first interaction pre-empts it). */
  onDone: (played: boolean) => void
}

const glowOn = '0 0 10px rgb(243 234 214 / 0.95), 0 0 2px rgb(243 234 214 / 0.9)'
const glowOff = '0 0 10px rgb(243 234 214 / 0), 0 0 2px rgb(243 234 214 / 0)'

/** The intro draft (gap:4): starts once the screen is in its zone and scrolling has stopped; a
 *  pointerdown or focus inside, or leaving the zone, ends it at once. The caller skips it for a
 *  deep link or reduced motion. Content stays visible throughout: the draft only adds emphasis. */
export function armIntro(root: HTMLElement, hooks: Hooks) {
  const q = (s: string) => root.querySelector<HTMLElement>(s)!
  const qa = (s: string) => [...root.querySelectorAll<HTMLElement>(s)]
  let tl: gsap.core.Timeline | null = null
  let idle = 0
  let over = false

  const off = () => {
    over = true
    clearTimeout(idle)
    zone.kill()
    root.removeEventListener('pointerdown', finish)
    root.removeEventListener('focusin', finish)
    tl?.kill()
  }
  function finish() {
    if (over) return
    tl?.progress(1, true) // jump to the end without replaying its callbacks (sounds, beats)
    off()
    gsap.set(qa('.cs-tile, .cs-team .cs-card *, .cs-banner'), { clearProps: 'opacity,transform,text-shadow' })
    gsap.set(qa('.cs-bar i'), { scaleX: 0 })
    for (const c of qa('.cs-team .cs-card')) delete c.dataset.state
    delete q('.cs-timer').dataset.counting
    delete root.dataset.turn
    hooks.onDone(tl !== null)
  }

  function build() {
    const T = { pick: 1.6, end: 3.9 }
    const banner = q('.cs-banner')
    const [bannerText, bannerGlow] = qa('.cs-banner__txt b')
    const timer = q('.cs-timer')
    const count = q('.cs-num__v')
    const [barL, barR] = qa('.cs-bar')
    const cards = qa('.cs-team .cs-card')
    const card = (id: string) => q(`.cs-team .cs-card[data-tech="${id}"]`)
    const left = { v: Math.ceil(T.end + 0.6) }

    const say = (text: string) =>
      gsap
        .timeline()
        .call(() => void (bannerText.textContent = bannerGlow.textContent = text))
        .fromTo(banner, { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: DUR.base, ease: 'snap', immediateRender: false })
        .fromTo(bannerGlow, { opacity: 1 }, { opacity: 0, duration: DUR.glow, ease: 'glow', immediateRender: false }, DUR.base)
        .to(banner, { opacity: 0, scale: 0.92, duration: DUR.base, ease: 'in' }, 1)
    const drain = (bar: HTMLElement, duration: number) => gsap.fromTo(bar.querySelectorAll('i'), { scaleX: 1 }, { scaleX: 0, duration, ease: 'none', immediateRender: false })
    const cardIn = (c: HTMLElement) =>
      gsap
        .timeline()
        .fromTo(c.querySelector('.cs-card__flash'), { opacity: 1 }, { opacity: 0, duration: DUR.glow, ease: 'glow', immediateRender: false })
        .fromTo(c.querySelector('.cs-card__pt'), { scale: 1.2 }, { scale: 1, duration: DUR.base, ease: 'snap', immediateRender: false }, 0)
        .fromTo(c.querySelector('.cs-card__txt'), { x: -8, opacity: 0 }, { x: 0, opacity: 1, duration: DUR.slower, ease: 'settle' }, 0.08)
    const cardLock = (c: HTMLElement) =>
      gsap
        .timeline()
        .call(() => void (c.dataset.state = 'locked'))
        .fromTo(c.querySelector('.cs-card__pop'), { opacity: 1, scale: 1.4 }, { opacity: 0, scale: 1, duration: DUR.slower, ease: 'settle', immediateRender: false })
        .fromTo(c.querySelector('.cs-card__mark'), { opacity: 0.4, scale: 1.3 }, { opacity: 1, scale: 1, duration: DUR.base, ease: 'snap', immediateRender: false }, 0)
        .fromTo(c.querySelector('.cs-card__name'), { textShadow: glowOn }, { textShadow: glowOff, duration: DUR.glow, ease: 'glow', immediateRender: false }, 0)

    const t = gsap.timeline({ paused: true, onComplete: finish })
    // Planning: the board powers on, the mains declare
    t.call(() => {
      hooks.onMessage('Declaring my mains')
      for (const c of cards) c.dataset.state = 'declaring'
      timer.dataset.counting = ''
    })
      .add(say('Planning'), 0)
      .add(drain(barR, T.pick), 0)
      .to(left, { v: 0, duration: T.end + 0.6, ease: 'none', onUpdate: () => void (count.textContent = String(Math.ceil(left.v))) }, 0)
      .fromTo(qa('.cs-grid > li:not([hidden]) .cs-tile'), { opacity: 0.2, scale: 0.9 }, { opacity: 1, scale: 1, duration: DUR.slower, ease: 'settle', stagger: { each: 0.025, from: 'center', grid: 'auto' } }, 0.15)
    cards.forEach((c, i) => t.add(cardIn(c), 0.25 + i * 0.18))
    // Pick: the mains lock in, 1-2-2
    t.add(say('Pick phase'), T.pick)
      .call(() => {
        hooks.onMessage('Locking in my mains')
        root.dataset.turn = 'pick'
      }, undefined, T.pick)
      .add(drain(barL, T.end - T.pick), T.pick)
    hooks.beats.forEach((ids, b) => {
      const at = T.pick + 0.3 + b * 0.7
      t.call(() => {
        hooks.onBeat(ids[0])
        sfx.play('lockIn')
      }, undefined, at)
      ids.forEach((id, j) => t.add(cardLock(card(id)), at + 0.12 + j * 0.1))
    })
    // Your turn: the bars give way to the open timer
    t.add(say('Your turn'), T.end).call(() => {
      delete root.dataset.turn
      delete timer.dataset.counting
      hooks.onMessage('Pick a technology to inspect')
    }, undefined, T.end)
    return t
  }

  const start = () => {
    if (tl || over) return
    tl = build()
    tl.play()
  }
  // "Stopped" = no scroll update for 400 ms and Lenis idle; Lenis clears a native scroll on its own
  // 400 ms timer, so check again rather than miss it.
  const arm = () => {
    clearTimeout(idle)
    idle = window.setTimeout(() => zone.isActive && (lenis?.isScrolling ? arm() : start()), 400)
  }
  const zone = ScrollTrigger.create({ trigger: root, start: 'top 60%', end: 'bottom 40%', onUpdate: arm, onToggle: (s) => (s.isActive ? arm() : tl && finish()) })
  root.addEventListener('pointerdown', finish)
  root.addEventListener('focusin', finish)
  if (zone.isActive) arm()
  return { skip: finish, dispose: off }
}

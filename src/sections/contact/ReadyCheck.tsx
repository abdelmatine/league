import { useEffect, useRef, useState } from 'react'
import { MagicButton } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { profile } from '../../content/profile'
import { DUR, gsap, prefersReducedMotion, useGSAP } from '../../lib/motion'

export type Result = 'accepted' | 'declined' | 'timeout'

// Our own geometry, in a 480 box: ring centre, band radius, and a 310 degree lit arc whose gap sits under ACCEPT.
// Angles are clock degrees (0 = 12 o'clock, clockwise).
const CX = 240
const CY = 226
const R = 176
const START = 205
const SPAN = 310
/** Seconds the match stays open (C04). */
const WINDOW = 12
const DRAIN_AT = 0.8

const n2 = (v: number) => Math.round(v * 100) / 100
const pt = (deg: number, r: number) => [CX + r * Math.sin((deg * Math.PI) / 180), CY - r * Math.cos((deg * Math.PI) / 180)]
const P = (deg: number, r: number) => pt(deg, r).map(n2).join(' ')
const arc = (a0: number, a1: number, r: number) => `M${P(a0, r)}A${r} ${r} 0 ${(a1 - a0 + 360) % 360 > 180 ? 1 : 0} 1 ${P(a1, r)}`
const gem = (x: number, y: number, s: number) => `M${n2(x)} ${n2(y - s)}L${n2(x + s)} ${n2(y)}L${n2(x)} ${n2(y + s)}L${n2(x - s)} ${n2(y)}Z`
const len = (deg: number, r: number) => n2((2 * Math.PI * r * deg) / 360)
const LEN = len(SPAN, R)
const BAND = arc(START, START + SPAN, R)
const hex = (r: number) => [0, 60, 120, 180, 240, 300].map((a) => `${n2(36 + r * Math.sin((a * Math.PI) / 180))},${n2(36 - r * Math.cos((a * Math.PI) / 180))}`).join(' ')
// Spark directions along the arc, with a fixed jitter (no Math.random in render).
const SPARKS = Array.from({ length: 24 }, (_, i) => ({ a: START + ((i + 0.5) / 24) * SPAN + Math.sin(i * 12.9898) * 4, u: (Math.sin(i * 78.233) + 1) / 2 }))

/** The outer rings draw from 12 o'clock both ways at open: two half circles per radius. */
function Rim({ r, color, width }: { r: number; color: string; width: number }) {
  const l = len(180, r)
  const line = { className: 'rc-draw', 'data-len': l, strokeDasharray: `${l} ${l}`, strokeWidth: width, style: { stroke: color } }
  return (
    <>
      <path {...line} d={`M${P(0, r)}A${r} ${r} 0 0 1 ${P(180, r)}`} />
      <path {...line} d={`M${P(0, r)}A${r} ${r} 0 0 0 ${P(180, r)}`} />
    </>
  )
}

/** The lit band: two halo strokes, the core and a filament, all on one path (no filters). */
const Band = ({ className }: { className: string }) => (
  <g className={className}>
    <path d={BAND} strokeWidth="26" strokeOpacity=".1" style={{ stroke: 'var(--rc-halo)' }} />
    <path d={BAND} strokeWidth="16" strokeOpacity=".24" style={{ stroke: 'var(--rc-halo)' }} />
    <path d={BAND} strokeWidth="10" style={{ stroke: 'var(--rc-core)' }} />
    <path d={BAND} strokeWidth="2.5" strokeOpacity=".9" style={{ stroke: 'var(--rc-rim)' }} />
  </g>
)

/** MATCH FOUND: shown once the message has been sent. ACCEPT and DECLINE only close it; the ring empties in
 *  12 s (paused while hovered or keyboard-focused) and then counts as accepted. Reduced motion: a still,
 *  full ring and no countdown. `onResult` fires at the decision, `onClosed` once focus is back on the page. */
export function ReadyCheck({ open, onResult, onClosed }: { open: boolean; onResult: (r: Result) => void; onClosed: (r: Result) => void }) {
  const box = useRef<HTMLDivElement>(null)
  const [closing, setClosing] = useState(false)
  const [decided, setDecided] = useState<Result | null>(null)
  if (!open && (closing || decided)) {
    setClosing(false) // ready for the next match
    setDecided(null)
  }
  const shown = open && !closing
  const accepted = decided === 'accepted' || decided === 'timeout'

  const live = useRef({ phase: 'idle' as 'idle' | 'countdown' | 'done', result: null as Result | null, hover: false, key: false, opening: false })
  const intro = useRef<gsap.core.Timeline | null>(null)
  const drain = useRef<gsap.core.Tween | null>(null)

  const el = () => {
    const root = box.current!
    const dialog = root.closest('dialog')!
    const q = (s: string) => gsap.utils.toArray<HTMLElement>(s, dialog)
    return { root, dialog, q, title: q('.hx-dialog__title')[0], accept: q('.rc-accept')[0], decline: q('.rc-decline')[0], pal: (name: string) => (q('.rc-ring')[0].dataset.pal = name) }
  }
  const syncPause = () => {
    const s = live.current
    if (s.phase === 'countdown') drain.current?.paused(s.hover || s.key)
  }
  const finish = () => {
    intro.current?.progress(1).kill() // a click during the intro jumps it to its end state first
    intro.current = null
    drain.current?.kill()
    drain.current = null
  }
  const burst = (d0: number, d1: number, life: number) => {
    const at = (i: number, d: number) => pt(SPARKS[i].a, R + d)
    gsap.fromTo(
      el().q('.rc-spark'),
      { attr: { cx: (i: number) => at(i, 0)[0], cy: (i: number) => at(i, 0)[1] }, opacity: 1 },
      { attr: { cx: (i: number) => at(i, d0 + SPARKS[i].u * (d1 - d0))[0], cy: (i: number) => at(i, d0 + SPARKS[i].u * (d1 - d0))[1] }, opacity: 0, duration: life, ease: 'power2.out' },
    )
  }
  const wave = (r1: number, life: number, w: number, a: number) =>
    gsap.fromTo(el().q('.rc-wave'), { attr: { r: R, 'stroke-width': w }, opacity: a }, { attr: { r: r1, 'stroke-width': w / 3 }, opacity: 0, duration: life, ease: 'power3.out' })

  // The visitor's choices animate through this context, so their tweens die with the component.
  const { contextSafe } = useGSAP({ scope: box })

  /** Open choreography. Runs once the dialog is shown: GSAP must not measure the closed (display: none)
   *  dialog, because it then parks the parts on <html> to read them, which scrolls the page. */
  const start = () => {
    const { q, title, accept, decline, pal } = el()
    const s = live.current
    Object.assign(s, { phase: 'countdown', result: null, hover: false, key: false })
    // Undo the last match's motion, property by property: 'all' would also wipe the colours set in style.
    const motion = { clearProps: 'opacity,transform,transformOrigin,filter,textShadow' }
    gsap.set(q('.rc-backdrop, .rc-glow, .rc-stage, .rc-line, .rc-art, .rc-energy, .rc-lit, .rc-full, .rc-head, .rc-orn, .rc-icon, .rc-icon *, .rc-details, .rc-grey'), motion)
    gsap.set([title, accept, decline], motion)
    title.classList.remove('is-pulse')
    // Countdown: the lit band empties from its start while the head rides the edge.
    const lit = q('.rc-lit')[0]
    const head = q('.rc-head')[0]
    const e = { v: 0 }
    const draw = () => {
      const done = (LEN * e.v) / SPAN
      lit.style.strokeDasharray = `${n2(LEN - done)} ${n2(LEN + 20)}`
      lit.style.strokeDashoffset = `${n2(-done)}`
      head.setAttribute('transform', `rotate(${n2(START + e.v)} ${CX} ${CY})`)
    }
    draw()

    if (prefersReducedMotion()) {
      pal('count')
      gsap.set(head, { opacity: 0 })
      gsap.fromTo(q('.rc-backdrop, .rc-glow, .rc-stage, .rc-details').concat(title, accept, decline), { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'none' })
      return // no countdown: the dialog waits for the visitor
    }

    pal('ignite')
    const t = (intro.current = gsap.timeline())
    t.fromTo(q('.rc-backdrop'), { opacity: 0 }, { opacity: 1, duration: DUR.base, ease: 'none' }, 0)
      .fromTo(q('.rc-glow'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.1, ease: 'settle' }, 0.1)
      .fromTo(q('.rc-stage'), { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: DUR.slow, ease: 'show' }, 0)
      .fromTo(q('.rc-line'), { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.8, ease: 'settle' }, 0.12)
    for (const [i, r] of [214, 184, 167].entries()) {
      const l = len(180, r)
      t.fromTo(q(`.rc-draw[data-len="${l}"]`), { strokeDashoffset: l }, { strokeDashoffset: 0, duration: 0.36, ease: 'show' }, i * 0.04)
    }
    t.fromTo(q('.rc-orn'), { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'glow', stagger: 0.05 }, 0.2)
      .fromTo(q('.rc-icon'), { scale: 2.2, filter: 'blur(3px)' }, { scale: 1, filter: 'blur(0px)', duration: 0.3, ease: 'snap', clearProps: 'filter' }, 0)
      .fromTo(q('.rc-icon__hot'), { opacity: 1 }, { opacity: 0, duration: 0.28, ease: 'glow' }, 0.3)
      .fromTo(q('.rc-icon__fill'), { opacity: 1 }, { opacity: 0, duration: 0.26, ease: 'in' }, 0.34)
      .fromTo(title, { scale: 1.3, y: 16, filter: 'blur(1.4px)', textShadow: '0 0 24px rgb(243 234 214 / 1)' }, { scale: 1, y: 0, filter: 'blur(0px)', textShadow: '0 0 24px rgb(243 234 214 / 0)', duration: 0.24, ease: 'snap', clearProps: 'filter,textShadow' }, 0)
      .call(() => title.classList.add('is-pulse'), [], 0.24)
      .fromTo(q('.rc-details'), { scale: 1.3, y: 16, opacity: 0.6, filter: 'blur(1px)' }, { scale: 1, y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.46, ease: 'snap', clearProps: 'filter' }, 0)
      .fromTo(accept, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.24, ease: 'settle' }, 0)
      .fromTo(decline, { opacity: 0 }, { opacity: 1, duration: 0.24, ease: 'glow' }, 0.1)
      // the ring ignites hot, settles, then drains from +0.8 s
      .fromTo(q('.rc-track'), { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.08)
      .fromTo(lit, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' }, 0.18)
      .call(() => (burst(14, 34, 0.45), wave(R + 64, 0.7, 4, 0.55)), [], 0.2)
      .fromTo(q('.rc-bloom'), { opacity: 0 }, { opacity: 0.7, duration: 0.12, ease: 'power2.out' }, 0.18)
      .to(q('.rc-bloom'), { opacity: 0, duration: 0.6, ease: 'power1.out' }, 0.3)
      .call(() => pal('count'), [], 0.3)
      .fromTo(head, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' }, DRAIN_AT)
      .call(
        () => {
          pal('drain')
          drain.current = gsap.to(e, { v: SPAN, duration: WINDOW - DRAIN_AT, ease: 'none', onUpdate: draw, onComplete: () => choose('timeout') })
          syncPause()
        },
        [],
        DRAIN_AT,
      )
      .call(() => void (intro.current = null), [], 1.5)
  }

  // Text swap after ACCEPT (React changes the words, GSAP plays them in).
  useGSAP(
    () => {
      if (!accepted) return
      const { q, title } = el()
      const words = [title, ...q('.rc-details')]
      if (prefersReducedMotion()) return void gsap.fromTo(words, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'none' })
      gsap.fromTo(words, { scale: 1.3, y: 16, opacity: 0.75, filter: 'blur(1.4px)' }, { scale: 1, y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.24, ease: 'snap', stagger: 0.1, clearProps: 'filter' })
    },
    { dependencies: [accepted] },
  )

  const outro = (fade: Element[]) => {
    const { q, title } = el()
    const o = gsap.timeline({ onComplete: () => setClosing(true) })
    o.call(() => el().pal('burst'), [], 0)
      .call(() => (burst(90, 200, 0.62), wave(R + 112, 0.7, 7, 0.9)), [], 0.16)
      .to(q('.rc-energy'), { scale: 1.16, opacity: 0, duration: 0.52, ease: 'expo.in', svgOrigin: `${CX} ${CY}` }, 0.16)
      .to([title, ...q('.rc-details')], { scale: 1.2, y: 16, filter: 'blur(2px)', opacity: 0, duration: 0.25, ease: 'snap' }, 0.24)
      .to(q('.rc-art'), { scale: 0.85, opacity: 0, duration: 0.2, ease: 'snap', svgOrigin: `${CX} ${CY}` }, 0.3)
      .to(fade, { scale: 0.85, opacity: 0, duration: 0.2, ease: 'snap' }, 0.3)
      .to(q('.rc-line'), { scaleX: 0, opacity: 0, duration: 0.4, ease: 'in' }, 0.3)
      .to(q('.rc-backdrop, .rc-glow'), { opacity: 0, duration: 0.5, ease: 'glow' }, 0.35)
    return o
  }

  const choose = contextSafe((r: Result) => {
    const s = live.current
    if (s.phase !== 'countdown') return
    s.phase = 'done'
    s.result = r
    finish()
    onResult(r)
    setDecided(r)
    const { q, title, accept, decline, pal } = el()
    title.classList.remove('is-pulse')
    const close = () => setClosing(true)
    const quiet = q('.rc-backdrop, .rc-glow, .rc-stage, .rc-details').concat(title, accept, decline)

    if (r === 'declined') {
      if (prefersReducedMotion()) return void gsap.to(quiet, { opacity: 0, duration: 0.15, ease: 'none', onComplete: close })
      pal('grey')
      gsap
        .timeline({ onComplete: close })
        .to(title, { scale: 0.65, y: -30, opacity: 0, duration: 0.2, ease: 'snap' }, 0)
        .to(q('.rc-details'), { scale: 0.65, y: -30, opacity: 0, duration: 0.2, ease: 'snap' }, 0.05)
        .to(q('.rc-head'), { opacity: 0, duration: 0.3, ease: 'glow' }, 0)
        .to(q('.rc-grey'), { opacity: 1, duration: 0.25, ease: 'none' }, 0)
        .to(q('.rc-icon'), { opacity: 0.45, duration: 0.2, ease: 'none' }, 0)
        .to(decline, { opacity: 0, duration: 0.1, ease: 'none' }, 0)
        .to(accept, { y: -20, scaleY: 0.5, opacity: 0, duration: 0.2, ease: 'in', transformOrigin: '50% 0%' }, 0.05)
        .to(q('.rc-art, .rc-energy'), { scale: 0.85, opacity: 0, duration: 0.2, ease: 'snap', svgOrigin: `${CX} ${CY}` }, 0.32)
        .to(q('.rc-icon'), { scale: 0.85, opacity: 0, duration: 0.2, ease: 'snap' }, 0.32)
        .to(q('.rc-line'), { scaleX: 0, opacity: 0, duration: 0.3, ease: 'in' }, 0.25)
        .to(q('.rc-backdrop, .rc-glow'), { opacity: 0, duration: 0.3, ease: 'glow' }, 0.38)
      return
    }

    // Accepted (or the ring ran out): the countdown fades while the full ring refills, hot then idle.
    gsap.set(q('.rc-icon__fill, .rc-icon__lit'), { opacity: 1 })
    if (prefersReducedMotion()) {
      pal('idle')
      gsap.set(q('.rc-lit, .rc-head'), { opacity: 0 })
      gsap.set(q('.rc-full'), { opacity: 1 })
      gsap.set(decline, { opacity: 0 })
      return void gsap.to(quiet, { opacity: 0, duration: 0.15, ease: 'none', delay: 1.2, onComplete: close })
    }
    const a = gsap.timeline()
    if (r === 'accepted') {
      a.to(accept, { scale: 0.96, duration: 0.1, ease: 'power2.out' }, 0)
        .to(accept, { scale: 1, duration: 0.2, ease: 'power2.out' }, 0.1)
        .fromTo(q('.rc-accept__flash'), { opacity: 0 }, { opacity: 0.9, duration: 0.13, ease: 'power2.out' }, 0)
        .to(q('.rc-accept__flash'), { opacity: 0, duration: 0.35, ease: 'power2.out' }, 0.3)
    }
    pal('flash')
    a.to(decline, { opacity: 0, duration: 0.1, ease: 'none' }, 0)
      .to(q('.rc-lit, .rc-head'), { opacity: 0, duration: 0.18, ease: 'power2.out' }, 0)
      .fromTo(q('.rc-full'), { opacity: 0 }, { opacity: 1, duration: 0.18, ease: 'power2.out' }, 0)
      .call(() => (burst(60, 120, 0.5), wave(R + 80, 0.75, 5, 0.75)), [], 0)
      .fromTo(q('.rc-bloom'), { opacity: 0 }, { opacity: 1, duration: 0.13, ease: 'power2.out' }, 0)
      .to(q('.rc-bloom'), { opacity: 0, duration: 0.9, ease: 'power1.out' }, 0.13)
      .call(() => pal('idle'), [], 0.26)
      .fromTo(q('.rc-icon__hot'), { opacity: 0.85 }, { opacity: 0, duration: 0.5, ease: 'power2.out' }, 0)
      .fromTo(q('.rc-icon'), { scale: 1.12 }, { scale: 1, duration: 0.4, ease: 'settle' }, 0)
      .add(outro([...q('.rc-icon'), accept, decline]), 1.4)
  })

  // After the Dialog's own effect has called showModal (child effects run first): play the open, focus ACCEPT,
  // then Esc declines (ignored once a choice plays out) and hover or keyboard focus pause the countdown.
  useEffect(() => {
    if (!shown) return
    start()
    const { dialog, accept } = el()
    const s = live.current
    const cancel = (ev: Event) => {
      ev.preventDefault()
      choose('declined')
    }
    const move = (ev: PointerEvent) => {
      const r = dialog.getBoundingClientRect()
      const inside = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom
      if (inside !== s.hover) {
        s.hover = inside
        syncPause()
      }
    }
    const leave = () => {
      s.hover = false
      syncPause()
    }
    const focusIn = (ev: FocusEvent) => {
      if (s.opening) return // our own focus on ACCEPT at open must not pause the ring
      s.key = (ev.target as Element).matches(':focus-visible')
      syncPause()
    }
    const focusOut = () => {
      s.key = false
      syncPause()
    }
    s.opening = true
    accept.focus({ preventScroll: true }) // a scroll here would move the page behind the fixed dialog
    s.opening = false
    dialog.addEventListener('cancel', cancel)
    dialog.addEventListener('pointermove', move)
    dialog.addEventListener('pointerleave', leave)
    dialog.addEventListener('focusin', focusIn)
    dialog.addEventListener('focusout', focusOut)
    return () => {
      dialog.removeEventListener('cancel', cancel)
      dialog.removeEventListener('pointermove', move)
      dialog.removeEventListener('pointerleave', leave)
      dialog.removeEventListener('focusin', focusIn)
      dialog.removeEventListener('focusout', focusOut)
      intro.current?.kill()
      drain.current?.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start/choose/el only read refs
  }, [shown])

  const first = profile.name.split(' ')[0]
  return (
    <Dialog
      open={shown}
      role="alertdialog"
      describedBy="rc-desc"
      className="rc"
      title={accepted ? 'Match accepted' : 'Match found'}
      onClose={() => {
        const s = live.current
        if (!s.result) {
          s.result = 'declined' // closed some other way: the message is still sent
          onResult(s.result)
        }
        s.phase = 'idle'
        onClosed(s.result)
      }}
      actions={
        <>
          <MagicButton size="lg" className="rc-accept" aria-disabled={decided ? true : undefined} onClick={() => choose('accepted')}>
            <span className="rc-accept__flash" aria-hidden="true" />
            Accept
          </MagicButton>
          <button type="button" className="rc-decline" aria-disabled={decided ? true : undefined} onClick={() => choose('declined')}>
            Decline
          </button>
        </>
      }
    >
      <div ref={box} className="rc-box">
        <div className="rc-backdrop" aria-hidden="true" />
        <div className="rc-glow" aria-hidden="true" />
        <div className="rc-stage" aria-hidden="true">
          <span className="rc-line rc-line--l" />
          <span className="rc-line rc-line--r" />
          <svg className="rc-ring" viewBox="0 0 480 480" fill="none" data-pal="count">
            <defs>
              <radialGradient id="rc-disc" cx="50%" cy="40%" r="60%">
                <stop offset="0" style={{ stopColor: 'var(--color-teal-900)' }} />
                <stop offset=".45" style={{ stopColor: 'var(--color-ink-900)' }} />
                <stop offset="1" style={{ stopColor: 'var(--color-ink-950)' }} />
              </radialGradient>
              <radialGradient id="rc-core">
                <stop offset="0" stopOpacity=".28" style={{ stopColor: 'var(--color-teal-300)' }} />
                <stop offset=".5" stopOpacity=".07" style={{ stopColor: 'var(--color-teal-300)' }} />
                <stop offset="1" stopOpacity="0" style={{ stopColor: 'var(--color-teal-300)' }} />
              </radialGradient>
              <radialGradient id="rc-grey" cx="50%" cy="40%" r="60%">
                <stop offset="0" style={{ stopColor: 'var(--color-stone-600)' }} />
                <stop offset=".55" style={{ stopColor: 'var(--color-ink-800)' }} />
                <stop offset="1" style={{ stopColor: 'var(--color-ink-950)' }} />
              </radialGradient>
              <radialGradient id="rc-spark">
                <stop offset="0" stopColor="#fff" />
                <stop offset=".25" stopOpacity=".7" style={{ stopColor: 'var(--color-teal-100)' }} />
                <stop offset="1" stopOpacity="0" style={{ stopColor: 'var(--color-teal-300)' }} />
              </radialGradient>
              <radialGradient id="rc-bloom">
                <stop offset=".55" stopOpacity="0" style={{ stopColor: 'var(--rc-core)' }} />
                <stop offset=".74" stopOpacity=".3" style={{ stopColor: 'var(--rc-core)' }} />
                <stop offset="1" stopOpacity="0" style={{ stopColor: 'var(--rc-halo)' }} />
              </radialGradient>
              <linearGradient id="rc-gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={{ stopColor: 'var(--color-gold-50)' }} />
                <stop offset=".4" style={{ stopColor: 'var(--color-gold-200)' }} />
                <stop offset="1" style={{ stopColor: 'var(--color-gold-500)' }} />
              </linearGradient>
              <linearGradient id="rc-rail" x1="0" x2="1">
                <stop offset="0" style={{ stopColor: 'var(--color-gold-700)' }} />
                <stop offset=".5" style={{ stopColor: 'var(--color-gold-50)' }} />
                <stop offset="1" style={{ stopColor: 'var(--color-gold-700)' }} />
              </linearGradient>
              <pattern id="rc-hex" width="24" height="41.6" patternUnits="userSpaceOnUse">
                <path d="M12 0 24 6.9v13.9L12 27.7 0 20.8V6.9ZM12 27.7v13.9" strokeWidth=".8" style={{ stroke: 'var(--color-gold-200)' }} />
              </pattern>
            </defs>
            <g className="rc-art">
              <circle cx={CX} cy={CY} r="164" fill="url(#rc-disc)" />
              <circle cx={CX} cy={CY} r="164" fill="url(#rc-hex)" opacity=".06" />
              <circle cx={CX} cy={CY - 46} r="104" fill="url(#rc-core)" />
              <circle className="rc-grey" cx={CX} cy={CY} r="164.5" fill="url(#rc-grey)" opacity="0" />
              <g className="rc-dial">
                <circle cx={CX} cy={CY} r="148" strokeOpacity=".13" strokeWidth="4" strokeDasharray={`1 ${len(3, 148) - 1}`} style={{ stroke: 'var(--color-gold-200)' }} />
                <circle cx={CX} cy={CY} r="155" strokeOpacity=".08" style={{ stroke: 'var(--color-gold-200)' }} />
                <circle cx={CX} cy={CY} r="134" strokeOpacity=".08" strokeDasharray="3 9" style={{ stroke: 'var(--color-teal-300)' }} />
              </g>
              <path className="rc-track" d={BAND} strokeOpacity=".75" strokeWidth="10" style={{ stroke: 'var(--color-gold-700)' }} />
              <g className="rc-orn">
                <path d={arc(START, START + SPAN, 196)} strokeWidth="5" strokeDasharray={`1 ${len(3, 196) - 1}`} opacity=".7" style={{ stroke: 'var(--color-gold-500)' }} />
                <path d={arc(START, START + SPAN, 196)} strokeWidth="9" strokeDasharray={`1.6 ${len(SPAN / 10, 196) - 1.6}`} opacity=".8" style={{ stroke: 'var(--color-gold-200)' }} />
                <path d={arc(START, START + SPAN, 203)} style={{ stroke: 'var(--color-gold-700)' }} />
              </g>
              <g className="rc-orn">
                <path d={arc(-12, 12, 214)} strokeWidth="1.6" style={{ stroke: 'var(--color-gold-200)' }} />
                <path d={`M${CX - 16} ${CY - 214}h-9m50 0h-9`} style={{ stroke: 'var(--color-gold-200)' }} />
                <path d={gem(CX, CY - 214, 9)} strokeWidth="1.3" style={{ fill: 'var(--color-ink-950)', stroke: 'var(--color-gold-200)' }} />
                <path d={gem(CX, CY - 214, 4.5)} style={{ fill: 'var(--color-teal-300)' }} />
                <path d={`${gem(pt(-16, 214)[0], pt(-16, 214)[1], 2.5)}${gem(pt(16, 214)[0], pt(16, 214)[1], 2.5)}`} style={{ fill: 'var(--color-gold-200)' }} />
                <path d={`M${P(START, 168)}L${P(START, 190)}M${P(START + SPAN, 168)}L${P(START + SPAN, 190)}`} stroke="url(#rc-gold)" strokeWidth="2.6" />
                <path d={`${gem(pt(START, 190)[0], pt(START, 190)[1], 3)}${gem(pt(START + SPAN, 190)[0], pt(START + SPAN, 190)[1], 3)}`} style={{ fill: 'var(--color-gold-200)' }} />
                <path d={`${gem(pt(90, 184)[0], pt(90, 184)[1], 3.5)}${gem(pt(270, 184)[0], pt(270, 184)[1], 3.5)}`} style={{ fill: 'var(--color-ink-950)', stroke: 'var(--color-gold-200)' }} />
                <path d={`M134 ${CY + R + 2}H346`} stroke="url(#rc-rail)" strokeWidth="2.5" />
                <path d={`${gem(134, CY + R + 2, 5)}${gem(346, CY + R + 2, 5)}`} style={{ fill: 'var(--color-ink-950)', stroke: 'var(--color-gold-200)' }} />
                <path d={`${gem(134, CY + R + 2, 2)}${gem(346, CY + R + 2, 2)}`} style={{ fill: 'var(--color-teal-300)' }} />
              </g>
              <Rim r={214} color="var(--color-gold-700)" width={1.5} />
              <Rim r={184} color="var(--color-gold-500)" width={1.5} />
              <Rim r={167} color="url(#rc-gold)" width={2.5} />
            </g>
            <g className="rc-energy">
              <circle className="rc-bloom" cx={CX} cy={CY} r={R + 80} fill="url(#rc-bloom)" opacity="0" />
              <Band className="rc-lit" />
              <g className="rc-full" opacity="0">
                <Band className="rc-full__band" />
              </g>
              <g className="rc-head">
                <circle cx={CX} cy={CY - R} r="18" fill="url(#rc-spark)" opacity=".6" />
                <circle cx={CX} cy={CY - R} r="6.5" opacity=".85" style={{ fill: 'var(--rc-rim)' }} />
                <circle cx={CX} cy={CY - R} r="2.6" fill="#fff" />
                {[2, 4, 6].map((d, i) => (
                  <circle key={d} cx={n2(pt(-d, R)[0])} cy={n2(pt(-d, R)[1])} r={3 - i * 0.5} opacity={[0.6, 0.35, 0.15][i]} style={{ fill: 'var(--rc-rim)' }} />
                ))}
                <path d={`M${CX - 23} ${CY - R}H${CX + 23}M${CX} ${CY - R - 11}V${CY - R + 11}`} stroke="#fff" strokeOpacity=".7" strokeWidth="1.2" strokeLinecap="round" />
              </g>
              <circle className="rc-wave" cx={CX} cy={CY} r={R} opacity="0" style={{ stroke: 'var(--rc-rim)' }} />
              {SPARKS.map((_, i) => (
                <circle key={i} className="rc-spark" cx={CX} cy={CY - R} r={4 + (i % 3) * 1.5} fill="url(#rc-spark)" opacity="0" />
              ))}
            </g>
          </svg>
          <svg className="rc-icon" viewBox="0 0 72 72" fill="none">
            <polygon points={hex(33)} stroke="url(#rc-gold)" strokeWidth="2.6" style={{ fill: 'var(--color-ink-950)' }} />
            <polygon className="rc-icon__fill" points={hex(30.4)} opacity="0" style={{ fill: 'var(--color-teal-700)' }} />
            <polygon className="rc-icon__hot" points={hex(30.4)} opacity="0" style={{ fill: 'var(--color-teal-100)' }} />
            <polygon points={hex(27)} style={{ stroke: 'var(--color-gold-700)' }} />
            <path d="M20 26h32v22H20ZM20 26l16 13 16-13" stroke="url(#rc-gold)" strokeWidth="2" />
            <path className="rc-icon__lit" d="M20 26h32v22H20ZM20 26l16 13 16-13" strokeWidth="2" opacity="0" style={{ stroke: 'var(--color-teal-100)' }} />
            <path d="m36 33.5 5 5-5 5-5-5Z" strokeWidth=".8" style={{ fill: 'var(--color-teal-300)', stroke: 'var(--color-teal-100)' }} />
          </svg>
        </div>
        <p className="rc-details">{accepted ? 'Thanks for reaching out' : `Delivered to ${first}'s inbox`}</p>
        <p id="rc-desc" className="sr-only">
          Your message was delivered to {profile.name}'s inbox. Accept to finish, or decline to close.
        </p>
      </div>
    </Dialog>
  )
}

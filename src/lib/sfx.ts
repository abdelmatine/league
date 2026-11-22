// UI sounds synthesised with Web Audio: no files. Off by default; the choice persists in localStorage.
// Audio starts only after the first pointerdown/keydown (autoplay policy). navigator.audioSession is never touched.

export type Cue = 'hover' | 'click' | 'queue' | 'matchFound' | 'accept' | 'decline' | 'lockIn'

interface Env {
  at?: number // start offset, s
  dur: number // envelope length, s
  gain: number // peak
  attack?: number // s
}
export type Voice =
  | (Env & { kind: 'tone'; wave: OscillatorType; f: number; to?: number })
  | (Env & { kind: 'noise'; filter: BiquadFilterType; f: number; to?: number; q?: number })

const tone = (wave: OscillatorType, f: number, env: Env & { to?: number }): Voice => ({ kind: 'tone', wave, f, ...env })
const noise = (filter: BiquadFilterType, f: number, env: Env & { to?: number; q?: number }): Voice => ({ kind: 'noise', filter, f, ...env })
const bell = (f: number, at: number, gain: number) =>
  ([[1, 1.2, 1], [1.5, 1, 0.7], [2, 0.75, 0.38], [2.76, 0.5, 0.22], [4.07, 0.3, 0.12]] as const).map(([ratio, dur, g]) =>
    tone('sine', f * ratio, { at, dur, gain: gain * g, attack: 0.002 }),
  )

/** Our own envelopes. Each cue stays under 1.5 s and under the gain cap (sfx.test.ts). */
export const CUES: Record<Cue, Voice[]> = {
  hover: [noise('bandpass', 6400, { dur: 0.035, gain: 0.05, q: 8 }), tone('sine', 3200, { dur: 0.06, gain: 0.02 })],
  click: [
    noise('highpass', 3200, { dur: 0.02, gain: 0.1, q: 0.7 }),
    tone('triangle', 1480, { dur: 0.42, gain: 0.06 }),
    tone('sine', 2220, { at: 0.005, dur: 0.3, gain: 0.03 }),
    tone('sine', 3700, { dur: 0.16, gain: 0.012 }),
  ],
  queue: [
    tone('triangle', 880, { dur: 0.18, gain: 0.05 }),
    tone('triangle', 1320, { at: 0.09, dur: 0.36, gain: 0.05 }),
    noise('bandpass', 1800, { dur: 0.3, gain: 0.03, to: 5200, q: 2, attack: 0.2 }),
  ],
  matchFound: [
    noise('bandpass', 2200, { dur: 0.3, gain: 0.045, to: 6800, q: 2.4, attack: 0.26 }),
    ...bell(1175, 0.26, 0.1),
    tone('triangle', 587, { at: 0.26, dur: 0.85, gain: 0.04 }),
  ],
  accept: [
    noise('highpass', 2800, { dur: 0.07, gain: 0.07, q: 0.7 }),
    ...[988, 1245, 1480, 1976].map((f, i) => tone('sine', f, { at: 0.03 + i * 0.05, dur: 0.42, gain: 0.045 })),
    noise('highpass', 2400, { at: 0.05, dur: 0.42, gain: 0.022, to: 8000, attack: 0.18 }),
  ],
  decline: [
    tone('triangle', 740, { dur: 0.3, gain: 0.06, to: 494 }),
    tone('sine', 247, { at: 0.04, dur: 0.26, gain: 0.04 }),
    noise('lowpass', 900, { dur: 0.12, gain: 0.05, q: 0.5 }),
  ],
  lockIn: [
    noise('bandpass', 320, { dur: 0.32, gain: 0.11, to: 3200, q: 1.3, attack: 0.28 }),
    tone('sine', 98, { at: 0.3, dur: 0.45, gain: 0.3, to: 40 }),
    tone('triangle', 49, { at: 0.3, dur: 0.3, gain: 0.15 }),
    noise('lowpass', 1200, { at: 0.3, dur: 0.14, gain: 0.14, q: 0.5, attack: 0.002 }),
    ...[466, 1130, 1760].map((f, i) => tone('triangle', f, { at: 0.3, dur: 0.6 - i * 0.15, gain: 0.04 - i * 0.01, attack: 0.002 })),
  ],
}

const KEY = 'hx:sound'
/** Elements that tick on hover and click (see the delegated layer at the bottom). */
export const UI_SELECTOR = 'button:not(:disabled), a[href], [role="tab"], [role="radio"], label:has(> input[type="radio"])'
/** Stored value to on/off. Anything but 'on' (missing, blocked, garbage) means off. */
export const parsePref = (v: string | null | undefined) => v === 'on'

let enabled = false
let unlocked = false
let lastHover = 0
let ctx: AudioContext | null = null
let master: GainNode | null = null
let room: ConvolverNode | null = null
let noiseBuf: AudioBuffer | null = null
const subs = new Set<() => void>()

function boot() {
  if (ctx || typeof AudioContext === 'undefined') return ctx
  ctx = new AudioContext()
  master = ctx.createGain()
  master.gain.value = 0.5
  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -18
  comp.ratio.value = 4
  master.connect(comp).connect(ctx.destination)
  const rate = ctx.sampleRate
  noiseBuf = ctx.createBuffer(1, rate, rate)
  const n = noiseBuf.getChannelData(0)
  for (let i = 0; i < n.length; i++) n[i] = Math.random() * 2 - 1
  // small synthetic room: decaying stereo noise impulse
  const ir = ctx.createBuffer(2, Math.floor(rate * 1.2), rate)
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c)
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 3
  }
  room = ctx.createConvolver()
  room.buffer = ir
  const wet = ctx.createGain()
  wet.gain.value = 0.22
  room.connect(wet).connect(master)
  return ctx
}

function schedule(c: AudioContext, v: Voice) {
  const t0 = c.currentTime + (v.at ?? 0)
  const end = t0 + v.dur
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(v.gain, t0 + (v.attack ?? 0.004))
  g.gain.exponentialRampToValueAtTime(0.0001, end)
  g.connect(master!)
  g.connect(room!)
  let src: AudioScheduledSourceNode
  let freq: AudioParam
  if (v.kind === 'tone') {
    const o = c.createOscillator()
    o.type = v.wave
    freq = o.frequency
    o.connect(g)
    src = o
  } else {
    const b = c.createBufferSource()
    const f = c.createBiquadFilter()
    b.buffer = noiseBuf
    b.loop = true
    f.type = v.filter
    f.Q.value = v.q ?? 1
    freq = f.frequency
    b.connect(f).connect(g)
    src = b
  }
  freq.setValueAtTime(v.f, t0)
  if (v.to) freq.exponentialRampToValueAtTime(v.to, end)
  src.start(t0)
  src.stop(end + 0.05)
}

export const sfx = {
  isEnabled: () => enabled,
  subscribe(fn: () => void) {
    subs.add(fn)
    return () => void subs.delete(fn)
  },
  setEnabled(on: boolean) {
    enabled = on
    try {
      localStorage.setItem(KEY, on ? 'on' : 'off')
    } catch {
      /* storage blocked: the choice lasts for this visit */
    }
    if (on && unlocked) void boot()?.resume()
    subs.forEach((fn) => fn())
  },
  play(cue: Cue) {
    if (!enabled || !unlocked) return
    if (cue === 'hover') {
      const now = performance.now()
      if (now - lastHover < 45) return
      lastHover = now
    }
    const c = boot()
    if (!c) return
    if (c.state !== 'running') void c.resume()
    CUES[cue].forEach((v) => schedule(c, v))
  },
}

if (typeof window !== 'undefined') {
  try {
    enabled = parsePref(localStorage.getItem(KEY))
  } catch {
    /* storage blocked: stay off */
  }
  const unlock = () => {
    unlocked = true
    if (enabled) void boot()?.resume()
    removeEventListener('pointerdown', unlock, true)
    removeEventListener('keydown', unlock, true)
  }
  addEventListener('pointerdown', unlock, true)
  addEventListener('keydown', unlock, true)

  // One delegated layer gives every control its hover tick and click. Controls that play their
  // own cue (SEND, ACCEPT, DECLINE, LOCK IN, the sound toggle) opt out with data-sfx="none".
  const target = (e: Event) => {
    const el = (e.target as Element | null)?.closest?.(UI_SELECTOR)
    return el && !el.closest('[data-sfx="none"]') && el.getAttribute('aria-disabled') !== 'true' ? el : null
  }
  addEventListener('pointerover', (e) => {
    const el = target(e)
    if (el && (e as PointerEvent).pointerType !== 'touch' && !el.contains((e as PointerEvent).relatedTarget as Node | null)) sfx.play('hover')
  })
  addEventListener('click', (e) => {
    if (target(e)) sfx.play('click')
  })
}

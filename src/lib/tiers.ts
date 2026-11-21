/** 3D quality tiers (spec §7, gap-results gap:3). The pure parts are unit tested; stagePlan() probes the
 *  browser once, before the 3D chunk is requested. No three.js here: this module ships in the main chunk. */
export type Tier = 'low' | 'mid' | 'high'
export const ORDER: readonly Tier[] = ['low', 'mid', 'high']

export interface TierSpec {
  /** Pixel budget: the canvas never renders more device pixels than this. */
  maxPx: number
  /** Real transmission glass, or our cheap facet shader. */
  glass: 'transmission' | 'fake'
  /** Bloom mip levels; 0 = no composer (the renderer tone maps instead). */
  bloom: number
  particles: number
  octaves: number
  warp: 1 | 3
  /** Header backdrop blur while the canvas is live (G07 table in DECISIONS). */
  hdrBlur: string
}

export const TIERS: Record<Tier, TierSpec> = {
  high: { maxPx: 2.4e6, glass: 'transmission', bloom: 7, particles: 3000, octaves: 5, warp: 3, hdrBlur: '12px' },
  mid: { maxPx: 1.2e6, glass: 'fake', bloom: 5, particles: 2000, octaves: 4, warp: 1, hdrBlur: '12px' },
  low: { maxPx: 0.6e6, glass: 'fake', bloom: 0, particles: 900, octaves: 3, warp: 1, hdrBlur: '0px' },
}

export interface StagePlan {
  start: Tier
  /** Highest tier the monitor may climb to. */
  ceiling: Tier
  /** Half-float or float colour buffers: without them there is no composer. */
  floatRT: boolean
  /** Set by ?tier=: fixed tier, no monitor. */
  pinned?: boolean
}

export interface GpuInfo {
  renderer: string
  ua: string
  touchPoints: number
  floatRT: boolean
  astc: boolean
}

// shortcut: GPU-name allowlist, not a benchmark; the monitor demotes a wrong HIGH within ~3 s. Extend it when real GPUs are missed.
const HIGH_GPU = /rtx|gtx (9[6-8]0|10[5-8]0|16[56]0)|rx ?(4[78]0|5[789]0|[5-9]\d{3})|arc\(tm\) [ab][57]\d{2}|apple m\d/i
const STRONG_MOBILE = /adreno \(tm\) (7[3-9]\d|8\d\d)|mali-g(7[1-9]\d|9\d\d)|immortalis|xclipse 9/i
const SOFTWARE = /swiftshader|llvmpipe|softpipe|basic render/i

/** Start tier and ceiling for a GPU; null means the CSS poster only. Phones never go above MID. */
export function tierPlan({ renderer, ua, touchPoints, floatRT, astc }: GpuInfo): StagePlan | null {
  if (SOFTWARE.test(renderer)) return null
  const webkit = renderer === 'Apple GPU' // every iOS browser and macOS Safari mask the GPU name
  const mobile = /Android|iPhone|iPad|iPod/.test(ua) || (webkit && touchPoints > 1) // iPadOS sends a Mac UA
  if (mobile) return { start: webkit || STRONG_MOBILE.test(renderer) ? 'mid' : 'low', ceiling: 'mid', floatRT }
  const high = HIGH_GPU.test(renderer) || (webkit && astc) // ASTC on macOS means an Apple-family GPU
  return { start: high ? 'high' : 'mid', ceiling: high ? 'high' : 'mid', floatRT }
}

/** Device pixel ratio that keeps a w x h canvas within `maxPx` device pixels. */
export const dprFor = (maxPx: number, w: number, h: number, device: number) => Math.min(device, Math.sqrt(maxPx / Math.max(1, w * h)))

const WIN = 500 // ms per fps window
const GAP = 250 // a longer frame gap restarts the window: pauses are never scored
const N = 6 // windows per decision (~3 s)
const VOTES = 5 // windows that must agree

/** [decline below, incline at or above] in true fps, from the highest rate seen (gap:3 §2). */
export const boundsFor = (cap: number): [number, number] => (cap >= 90 ? [55, 0.9 * cap] : [50, 57])

/** Frame-rate monitor for a gated render loop. Feed it every clock tick with `unbroken` = this tick and the
 *  previous one both rendered continuously; it calls `step(-1 | 1)` at most once per ~3 s and never climbs
 *  back after a decline. */
export function createMonitor(step: (dir: -1 | 1) => void) {
  let t0 = -1
  let prev = -1
  let n = 0
  let cap = 0
  let wins: number[] = []
  let declined = false
  return (now: number, unbroken: boolean) => {
    if (!unbroken || prev < 0 || now - prev > GAP) {
      t0 = prev = now
      n = 0
      return
    }
    prev = now
    n++
    if (now - t0 < WIN) return
    const fps = (1000 * n) / (now - t0) // intervals over elapsed time: no fencepost bias
    t0 = now
    n = 0
    cap = Math.max(cap, fps)
    if (wins.push(fps) < N) return
    const [lo, hi] = boundsFor(cap)
    const dir = wins.filter((f) => f < lo).length >= VOTES ? -1 : wins.filter((f) => f >= hi).length >= VOTES ? 1 : 0
    wins = []
    if (dir < 0) declined = true
    if (dir > 0 && declined) return
    if (dir) step(dir)
  }
}

let plan: StagePlan | null | undefined

/** The browser's plan, probed once: null on Save-Data, without WebGL2 or on a software GPU.
 *  `?tier=high|mid|low` pins a tier on any GPU, for reviews and frame-time checks. */
export function stagePlan(): StagePlan | null {
  if (plan !== undefined) return plan
  plan = null
  const pin = new URLSearchParams(location.search).get('tier')
  const pinned = ORDER.find((t) => t === pin)
  if (!pinned && (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return plan
  try {
    const c = document.createElement('canvas').getContext('webgl2', { powerPreference: 'high-performance' })
    if (!c) return plan
    const ext = c.getExtension('WEBGL_debug_renderer_info')
    const info: GpuInfo = {
      renderer: String(c.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : c.RENDERER)),
      ua: navigator.userAgent,
      touchPoints: navigator.maxTouchPoints,
      floatRT: !!(c.getExtension('EXT_color_buffer_half_float') || c.getExtension('EXT_color_buffer_float')),
      astc: !!c.getExtension('WEBGL_compressed_texture_astc'),
    }
    c.getExtension('WEBGL_lose_context')?.loseContext()
    plan = pinned ? { start: pinned, ceiling: pinned, floatRT: info.floatRT, pinned: true } : tierPlan(info)
  } catch {
    // no WebGL at all: poster only
  }
  return plan
}

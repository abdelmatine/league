import { describe, expect, it } from 'vitest'
import { createMonitor, dprFor, tierPlan, type GpuInfo } from './tiers'

const WIN_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0 Safari/537.36'
const MAC_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15'
const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1'
const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0 Mobile Safari/537.36'
const gpu = (renderer: string, more: Partial<GpuInfo> = {}): GpuInfo => ({ renderer, ua: WIN_UA, touchPoints: 0, floatRT: true, astc: false, ...more })

describe('tierPlan', () => {
  it('keeps software rasterizers on the poster', () => {
    expect(tierPlan(gpu('ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)'))).toBeNull()
    expect(tierPlan(gpu('ANGLE (Microsoft, Microsoft Basic Render Driver Direct3D11 vs_5_0 ps_5_0, D3D11)'))).toBeNull()
    expect(tierPlan(gpu('llvmpipe (LLVM 17.0.6, 256 bits)'))).toBeNull()
  })

  it('starts desktops on MID and allows HIGH only on listed GPUs', () => {
    expect(tierPlan(gpu('ANGLE (Intel, Intel(R) UHD Graphics (0x00009B41) Direct3D11 vs_5_0 ps_5_0, D3D11)'))).toEqual({ start: 'mid', ceiling: 'mid', floatRT: true })
    expect(tierPlan(gpu('ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)'))).toMatchObject({ start: 'high', ceiling: 'high' })
    expect(tierPlan(gpu('ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 6GB Direct3D11 vs_5_0 ps_5_0, D3D11)'))?.start).toBe('high')
    expect(tierPlan(gpu('ANGLE (NVIDIA, NVIDIA GeForce GT 1030 Direct3D11 vs_5_0 ps_5_0, D3D11)'))?.start).toBe('mid')
    expect(tierPlan(gpu('ANGLE (AMD, AMD Radeon RX 6700 XT Direct3D11 vs_5_0 ps_5_0, D3D11)'))?.start).toBe('high')
    expect(tierPlan(gpu('ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)', { ua: MAC_UA }))?.start).toBe('high')
  })

  it('reads masked Safari GPUs from touch points and ASTC', () => {
    expect(tierPlan(gpu('Apple GPU', { ua: MAC_UA, astc: true }))).toMatchObject({ start: 'high', ceiling: 'high' })
    expect(tierPlan(gpu('Apple GPU', { ua: MAC_UA }))).toMatchObject({ start: 'mid', ceiling: 'mid' })
    expect(tierPlan(gpu('Apple GPU', { ua: MAC_UA, astc: true, touchPoints: 5 }))).toMatchObject({ start: 'mid', ceiling: 'mid' }) // iPad
    expect(tierPlan(gpu('Apple GPU', { ua: IPHONE_UA, astc: true, touchPoints: 5 }))).toMatchObject({ start: 'mid', ceiling: 'mid' })
  })

  it('caps phones at MID and starts weak Android GPUs on LOW', () => {
    expect(tierPlan(gpu('Mali-G57 MC2', { ua: ANDROID_UA }))).toMatchObject({ start: 'low', ceiling: 'mid' })
    expect(tierPlan(gpu('Adreno (TM) 740', { ua: ANDROID_UA }))).toMatchObject({ start: 'mid', ceiling: 'mid' })
    expect(tierPlan(gpu('ANGLE (NVIDIA, NVIDIA GeForce RTX 4090)', { ua: ANDROID_UA }))?.ceiling).toBe('mid')
  })

  it('passes the float buffer flag through', () => {
    expect(tierPlan(gpu('Mali-G52 MC2', { ua: ANDROID_UA, floatRT: false }))?.floatRT).toBe(false)
  })
})

describe('dprFor', () => {
  it('fits the pixel budget and never exceeds the device ratio', () => {
    expect(dprFor(1.2e6, 1920, 1080, 1)).toBeCloseTo(0.7607, 3)
    expect(dprFor(0.6e6, 393, 852, 3)).toBeCloseTo(1.3386, 3)
    expect(dprFor(2.4e6, 800, 600, 2)).toBe(2)
  })
})

/** Feeds the monitor `seconds` of frames `ms` apart, starting at `from` (ms); returns the next frame time. */
function run(monitor: ReturnType<typeof createMonitor>, ms: number, seconds: number, from = 0, unbroken = true) {
  let t = from
  while (t < from + seconds * 1000) {
    monitor(t, unbroken)
    t += ms
  }
  return t
}

describe('createMonitor', () => {
  const setup = () => {
    const steps: [number, number][] = []
    let now = 0
    const monitor = createMonitor((d) => steps.push([d, now]))
    const feed = (t: number, unbroken: boolean) => {
      now = t
      monitor(t, unbroken)
    }
    return { steps, feed }
  }

  it('never steps a steady 60 Hz loop down (its up votes stop at the ceiling in Stage)', () => {
    const { steps, feed } = setup()
    run(feed, 1000 / 60, 30)
    expect(steps.length).toBeGreaterThan(0)
    expect(steps.every(([d]) => d === 1)).toBe(true)
  })

  it('steps down at 30 fps within about 3 s', () => {
    const { steps, feed } = setup()
    run(feed, 1000 / 30, 4)
    expect(steps.length).toBe(1)
    expect(steps[0][0]).toBe(-1)
    expect(steps[0][1]).toBeGreaterThan(2900)
    expect(steps[0][1]).toBeLessThan(3600)
  })

  it('climbs on a fast high-refresh loop, but never after a decline', () => {
    const fast = setup()
    run(fast.feed, 1000 / 144, 4)
    expect(fast.steps.map(([d]) => d)).toEqual([1])

    const slowThenFast = setup()
    const t = run(slowThenFast.feed, 1000 / 30, 4)
    run(slowThenFast.feed, 1000 / 144, 10, t)
    expect(slowThenFast.steps.map(([d]) => d)).toEqual([-1])
  })

  it('never scores pauses or frames that were not continuous', () => {
    const gaps = setup()
    let t = 0
    for (let i = 0; i < 40; i++) t = run(gaps.feed, 1000 / 20, 0.4, t) + 1000 // short bursts at 20 fps, 1 s apart
    expect(gaps.steps).toEqual([])

    const dirtyOnly = setup()
    run(dirtyOnly.feed, 1000 / 10, 20, 0, false)
    expect(dirtyOnly.steps).toEqual([])
  })
})

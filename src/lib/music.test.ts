import { describe, expect, it, vi } from 'vitest'
import { createMusic, music, type Track } from './music'

/** A fake <audio> that records calls; each play() settles the way the test says. */
function setup(play: () => Promise<void> = () => Promise.resolve()) {
  const calls: string[] = []
  const make = vi.fn<() => Track>(() => ({
    play: () => {
      calls.push('play')
      return play()
    },
    pause: () => void calls.push('pause'),
  }))
  return { m: createMusic(make), make, calls }
}
const settle = () => new Promise((r) => setTimeout(r))
const plays = (calls: string[]) => calls.filter((c) => c === 'play').length

describe('music', () => {
  it('starts off and creates no audio until the first enable, then reuses one element', () => {
    expect(music.get()).toBe(false)
    const { m, make, calls } = setup()
    expect(m.get()).toBe(false)
    m.set(false)
    expect(make).not.toHaveBeenCalled()
    m.set(true)
    m.set(false)
    m.set(true)
    expect(m.get()).toBe(true)
    expect(make).toHaveBeenCalledTimes(1)
    expect(calls).toEqual(['play', 'pause', 'play'])
  })

  it('turns back off when play() is refused (autoplay policy, failed load)', async () => {
    const { m } = setup(() => Promise.reject(new DOMException('blocked', 'NotAllowedError')))
    const fn = vi.fn<() => void>()
    m.subscribe(fn)
    m.set(true)
    expect(m.get()).toBe(true)
    await settle()
    expect(m.get()).toBe(false)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('ignores the failure of a play() that a later pause replaced (off, then on again)', async () => {
    let fail: (e: Error) => void = () => {}
    const { m } = setup(() => new Promise<void>((_, reject) => (fail = reject)))
    m.set(true)
    const first = fail
    m.set(false)
    m.set(true)
    first(new DOMException('interrupted by pause()', 'AbortError'))
    await settle()
    expect(m.get()).toBe(true)
  })

  it('pauses while the tab is hidden and resumes only if still on', () => {
    const { m, make, calls } = setup()
    m.setHidden(true)
    m.setHidden(false)
    expect(make).not.toHaveBeenCalled()
    m.set(true)
    m.setHidden(true)
    expect(calls).toEqual(['play', 'pause'])
    m.setHidden(false)
    expect(calls).toEqual(['play', 'pause', 'play'])
    m.setHidden(true)
    m.set(false)
    m.setHidden(false)
    expect(plays(calls)).toBe(2)
    expect(calls.at(-1)).toBe('pause')
    expect(m.get()).toBe(false)
  })

  it('notifies subscribers on changes only, until they unsubscribe', () => {
    const { m } = setup()
    const fn = vi.fn<() => void>()
    const off = m.subscribe(fn)
    m.set(false)
    m.set(true)
    m.set(true)
    off()
    m.set(false)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})

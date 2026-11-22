import { describe, expect, it } from 'vitest'
import { formatClock, initialPlayState, playReducer, type PlayEvent, type PlayState } from './playState'

const run = (events: PlayEvent[], from: PlayState = initialPlayState) => events.reduce(playReducer, from)

describe('playReducer', () => {
  it('walks the happy path', () => {
    expect(run([{ type: 'ready' }])).toEqual({ name: 'play' })
    expect(run([{ type: 'ready' }, { type: 'queue', at: 5 }])).toEqual({ name: 'queue', since: 5 })
    expect(run([{ type: 'ready' }, { type: 'queue', at: 5 }, { type: 'found', at: 9 }])).toEqual({ name: 'found', since: 9 })
    expect(run([{ type: 'ready' }, { type: 'queue', at: 5 }, { type: 'found', at: 9 }, { type: 'accept' }])).toEqual({ name: 'accepted' })
    expect(run([{ type: 'reset' }], { name: 'accepted' })).toEqual({ name: 'play' })
  })

  it('goes back to play on cancel, decline and timeout', () => {
    expect(run([{ type: 'cancel' }], { name: 'queue', since: 1 })).toEqual({ name: 'play' })
    expect(run([{ type: 'decline' }], { name: 'found', since: 1 })).toEqual({ name: 'play' })
    expect(run([{ type: 'timeout' }], { name: 'found', since: 1 })).toEqual({ name: 'play' })
  })

  it('ignores events that do not apply, returning the same object', () => {
    const cases: [PlayState, PlayEvent][] = [
      [initialPlayState, { type: 'queue', at: 1 }],
      [{ name: 'play' }, { type: 'accept' }],
      [{ name: 'play' }, { type: 'progress', value: 0.5 }],
      [{ name: 'queue', since: 1 }, { type: 'accept' }],
      [{ name: 'found', since: 1 }, { type: 'cancel' }],
      [{ name: 'accepted' }, { type: 'queue', at: 1 }],
    ]
    for (const [s, e] of cases) expect(playReducer(s, e)).toBe(s)
  })

  it('keeps patch progress clamped and monotonic', () => {
    const half = playReducer(initialPlayState, { type: 'progress', value: 0.5 })
    expect(half).toEqual({ name: 'patching', progress: 0.5 })
    expect(playReducer(half, { type: 'progress', value: 0.3 })).toBe(half)
    expect(playReducer(half, { type: 'progress', value: 7 })).toEqual({ name: 'patching', progress: 1 })
  })
})

describe('formatClock', () => {
  it('formats m:ss', () => {
    expect(formatClock(0)).toBe('0:00')
    expect(formatClock(9_999)).toBe('0:09')
    expect(formatClock(61_000)).toBe('1:01')
    expect(formatClock(-5)).toBe('0:00')
  })
})

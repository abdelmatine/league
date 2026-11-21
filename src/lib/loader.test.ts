import { describe, expect, it } from 'vitest'
import { initialLoader, loaderReducer, progressOf, type LoaderEvent, type LoaderState, type Milestone } from './loader'

const ORDER: Milestone[] = ['html', 'fonts', 'app', 'stage', 'frame']
const reach = (milestone: Milestone): LoaderEvent => ({ type: 'reach', milestone })
const run = (events: LoaderEvent[], from: LoaderState = initialLoader) => events.reduce(loaderReducer, from)

describe('progressOf', () => {
  it('reads 10, 35, 60, 90 and 100 % in the usual order', () => {
    expect(ORDER.map((_, i) => Math.round(progressOf(ORDER.slice(0, i + 1)) * 100))).toEqual([10, 35, 60, 90, 100])
  })

  it('does not depend on the order milestones land in', () => {
    expect(progressOf(['frame', 'fonts'])).toBeCloseTo(0.35)
    expect(progressOf([...ORDER].reverse())).toBe(1)
  })
})

describe('loaderReducer', () => {
  it('accepts once every milestone is in, then leaves with the entrance after the hold', () => {
    const accepted = run(ORDER.map(reach))
    expect(accepted).toMatchObject({ phase: 'accepted', fast: false })
    const leaving = loaderReducer(accepted, { type: 'held' })
    expect(leaving).toMatchObject({ phase: 'leaving', fast: false })
    expect(loaderReducer(leaving, { type: 'left' }).phase).toBe('gone')
  })

  it('keeps loading until the last milestone, in any order', () => {
    expect(run(['frame', 'html', 'stage', 'fonts'].map((m) => reach(m as Milestone))).phase).toBe('loading')
  })

  it('leaves fast on a skip or the failsafe, from loading or during the hold', () => {
    expect(run([reach('html'), { type: 'skip' }])).toMatchObject({ phase: 'leaving', fast: true })
    expect(run([reach('html'), { type: 'timeout' }])).toMatchObject({ phase: 'leaving', fast: true })
    expect(run([...ORDER.map(reach), { type: 'skip' }])).toMatchObject({ phase: 'leaving', fast: true })
  })

  it("lets a returning visit's cap leave with the entrance kept", () => {
    expect(run([reach('html'), { type: 'cap' }])).toMatchObject({ phase: 'leaving', fast: false })
  })

  it('still counts milestones after the exit started, without changing phase', () => {
    const left = run([reach('html'), { type: 'skip' }, reach('fonts')])
    expect(left).toMatchObject({ phase: 'leaving', reached: ['html', 'fonts'] })
  })

  it('ignores events that do not apply, returning the same object', () => {
    const loading = run([reach('html')])
    const leaving = run([reach('html'), { type: 'skip' }])
    const gone = loaderReducer(leaving, { type: 'left' })
    const cases: [LoaderState, LoaderEvent][] = [
      [loading, reach('html')],
      [loading, { type: 'held' }],
      [loading, { type: 'left' }],
      [leaving, { type: 'skip' }],
      [leaving, { type: 'timeout' }],
      [leaving, { type: 'cap' }],
      [gone, { type: 'left' }],
      [gone, { type: 'held' }],
    ]
    for (const [s, e] of cases) expect(loaderReducer(s, e)).toBe(s)
  })
})

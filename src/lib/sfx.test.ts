import { describe, expect, it } from 'vitest'
import { CUES, parsePref, sfx, type Voice } from './sfx'

const problems = (v: Voice) =>
  [
    (v.at ?? 0) + v.dur > 1.5 && 'longer than 1.5 s',
    !(v.dur > 0) && 'no duration',
    !(v.gain > 0 && v.gain <= 0.35) && 'gain outside (0, 0.35]',
    (v.attack ?? 0.004) >= v.dur && 'attack longer than the envelope',
    [v.f, v.to ?? v.f].some((f) => f < 20 || f > 16000) && 'frequency outside 20 Hz-16 kHz',
  ].filter(Boolean)

describe('sfx', () => {
  it('is off unless the stored choice is exactly "on"', () => {
    expect(parsePref('on')).toBe(true)
    for (const v of ['off', '', 'true', null, undefined]) expect(parsePref(v)).toBe(false)
    expect(sfx.isEnabled()).toBe(false)
  })

  it('has every cue, each short, audible and under the gain cap', () => {
    expect(Object.keys(CUES).sort()).toEqual(['accept', 'click', 'decline', 'hover', 'lockIn', 'matchFound', 'queue'])
    for (const [cue, voices] of Object.entries(CUES)) {
      expect({ cue, empty: voices.length === 0, problems: voices.flatMap(problems) }).toEqual({ cue, empty: false, problems: [] })
    }
  })

  it('plays nothing while off (and never throws without Web Audio)', () => {
    expect(() => sfx.play('click')).not.toThrow()
  })
})

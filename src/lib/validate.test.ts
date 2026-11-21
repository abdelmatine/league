import { describe, expect, it } from 'vitest'
import { checkEmail, checkMessage, checkName, COOLDOWN_MS, cooldownLeft } from './validate'

describe('contact rules', () => {
  it('needs a name of 2 to 40 characters, ignoring outer spaces', () => {
    expect(checkName('')).toMatch(/add your name/i)
    expect(checkName('   ')).toMatch(/add your name/i)
    expect(checkName(' A ')).toMatch(/at least 2/)
    expect(checkName('Al')).toBe('')
    expect(checkName('x'.repeat(40))).toBe('')
    expect(checkName('x'.repeat(41))).toMatch(/40 characters or fewer/)
  })

  it('needs a full email address', () => {
    expect(checkEmail('')).toMatch(/add your email/i)
    for (const bad of ['name', 'name@', 'name@mail', 'name@mail.c', 'na me@mail.com', `${'x'.repeat(250)}@mail.com`]) expect(checkEmail(bad)).toMatch(/full address/)
    expect(checkEmail(' lena@moreau.studio ')).toBe('')
  })

  it('needs a message of 10 to 1000 characters and counts what is left', () => {
    expect(checkMessage('')).toMatch(/short message/)
    expect(checkMessage('Hi there')).toMatch(/2 to go/)
    expect(checkMessage('Hello there')).toBe('')
    expect(checkMessage('x'.repeat(1000))).toBe('')
    expect(checkMessage('x'.repeat(1001))).toMatch(/under 1000/)
  })
})

describe('cooldownLeft', () => {
  it('is free when nothing was sent', () => {
    expect(cooldownLeft(0, 5_000)).toBe(0)
  })
  it('counts down for 2 minutes after a send', () => {
    expect(cooldownLeft(10_000, 10_000)).toBe(COOLDOWN_MS)
    expect(cooldownLeft(10_000, 70_000)).toBe(60_000)
    expect(cooldownLeft(10_000, 10_000 + COOLDOWN_MS)).toBe(0)
    expect(cooldownLeft(10_000, 10_000 + COOLDOWN_MS * 5)).toBe(0)
  })
  it('never exceeds the window when the stored time is in the future', () => {
    expect(cooldownLeft(1_000_000, 0)).toBe(COOLDOWN_MS)
  })
})

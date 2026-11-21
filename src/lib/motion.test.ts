import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { DUR, EASES } from './motion'

const css = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8')
const token = (name: string) => css.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].replace(/\s/g, '')

describe('motion tokens', () => {
  it('uses the same easing curves as tokens.css', () => {
    for (const [id, curve] of Object.entries(EASES)) expect({ id, css: token(`ease-${id}`) }).toEqual({ id, css: `cubic-bezier(${curve})` })
  })

  it('uses the same durations as tokens.css', () => {
    for (const [id, s] of Object.entries(DUR)) expect({ id, css: token(`duration-${id}`) }).toEqual({ id, css: `${Math.round(s * 1000)}ms` })
  })
})

import { describe, expect, it } from 'vitest'
import { formatHash, parseHash } from './hash'

describe('hash routes', () => {
  it('parses sections and items', () => {
    expect(parseHash('#projects')).toEqual({ section: 'projects' })
    expect(parseHash('#projects/planify')).toEqual({ section: 'projects', item: 'planify' })
    expect(parseHash('#stack/spring-boot')).toEqual({ section: 'stack', item: 'spring-boot' })
    expect(parseHash('stack/cpp')).toEqual({ section: 'stack', item: 'cpp' })
    expect(parseHash('#projects/')).toEqual({ section: 'projects' })
  })

  it('rejects anything else', () => {
    for (const h of ['', '#', '#/x', '#Projects', '#projects/a/b', '#projects/Mondas%20%C3%96l', '#stack/-x', '#stack/x--y', '#a b', '#stack/über']) {
      expect({ h, route: parseHash(h) }).toEqual({ h, route: null })
    }
  })

  it('formats back to the same hash', () => {
    for (const h of ['#home', '#projects/sam-medicale', '#stack/nextjs']) expect(formatHash(parseHash(h)!)).toBe(h)
  })
})

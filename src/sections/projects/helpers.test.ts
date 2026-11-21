import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { profile } from '../../content/profile'
import { shownProjects } from '../../lib/content'
import { centreOut, EMBLEM_SIZES, emblemSrc, hostOf, lobbies, monogram } from './helpers'

describe('lobby helpers', () => {
  it('splits the projects into lobbies of the visible count', () => {
    const list = [1, 2, 3, 4, 5, 6, 7, 8]
    expect(lobbies(list, 5)).toEqual([[1, 2, 3, 4, 5], [6, 7, 8]])
    expect(lobbies(list, 3)).toEqual([[1, 2, 3], [4, 5, 6], [7, 8]])
    expect(lobbies(list, 1)).toHaveLength(8)
  })

  it('fills a lobby centre-out, first project in the middle', () => {
    expect(centreOut([1, 2, 3, 4, 5])).toEqual([4, 2, 1, 3, 5])
    expect(centreOut([1, 2, 3])).toEqual([2, 1, 3])
    expect(centreOut([1])).toEqual([1])
  })

  it('makes monograms and display hosts', () => {
    expect(['React', 'Spring Boot', 'React Native', 'PostgreSQL', 'C++', 'Qt'].map(monogram)).toEqual(['R', 'SB', 'RN', 'P', 'C++', 'Qt'])
    expect(hostOf('https://www.example.com/path')).toBe('example.com')
    expect(hostOf('https://monoo.lovable.app')).toBe('monoo.lovable.app')
  })
})

describe('optimised images', () => {
  const pub = fileURLToPath(new URL('../../../public', import.meta.url))
  it('ships every shown project emblem and the profile photo (else run scripts/optimise-images.mjs)', () => {
    const files = shownProjects().flatMap((p) => EMBLEM_SIZES.flatMap((s) => [emblemSrc(p.slug, s, 'avif'), emblemSrc(p.slug, s, 'webp')]))
    expect(files.concat(profile.photo).filter((f) => !existsSync(join(pub, f)))).toEqual([])
  })
})

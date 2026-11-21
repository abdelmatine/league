import { describe, expect, it } from 'vitest'
import { tech } from '../../content/tech'
import { creditLines, techById } from '../../lib/content'
import { parseHash } from '../../lib/hash'
import { draftBeats, matches, monogram, pairedWith, techFromRoute, usageLabel } from './data'
import { LOGOS3D } from './logos3d'

const t = (id: string) => techById(id)!

describe('stack data', () => {
  it('labels usage with real counts only', () => {
    expect(usageLabel(0)).toBe('No listed projects yet')
    expect(usageLabel(1)).toBe('1 project')
    expect(usageLabel(5)).toBe('5 projects')
  })

  it('builds monograms from the name', () => {
    expect(['react', 'spring-boot', 'postgresql', 'react-native', 'java', 'c', 'cpp', 'qt'].map((id) => monogram(t(id)))).toEqual(['R', 'SB', 'PG', 'RN', 'J', 'C', 'C++', 'Qt'])
  })

  it('filters by lane and searches name, id and lane', () => {
    const ids = (f: Parameters<typeof matches>[1], q: string) => tech.filter((x) => matches(x, f, q)).map((x) => x.id)
    expect(ids('all', '')).toHaveLength(tech.length)
    expect(ids('mobile', '')).toEqual(['react-native', 'flutter'])
    expect(ids('all', '  NEXT ')).toEqual(['nextjs'])
    expect(ids('core', 'react')).toEqual([])
    expect(ids('all', 'data')).toEqual(['postgresql', 'redis', 'supabase', 'minio'])
  })

  it('pairs a tech with the techs it shipped alongside, most shared first', () => {
    const p = [
      { slug: 'a', name: 'A', tag: '', description: '', image: '', link: '', stack: ['nextjs', 'nestjs', 'postgresql'] },
      { slug: 'b', name: 'B', tag: '', description: '', image: '', link: '', stack: ['nextjs', 'postgresql'] },
      { slug: 'c', name: 'C', tag: '', description: '', image: '', link: '', stack: ['react'], draft: true },
    ]
    expect(pairedWith('nextjs', p).map((x) => [x.tech.id, x.n])).toEqual([
      ['postgresql', 2],
      ['nestjs', 1],
    ])
    expect(pairedWith('typescript', p)).toEqual([])
  })

  it('drafts the five mains in 1-2-2 beats', () => {
    const beats = draftBeats()
    expect(beats.map((b) => b.length)).toEqual([1, 2, 2])
    expect(new Set(beats.flat()).size).toBe(5)
  })

  it('reads #stack/<id> deep links for known techs only', () => {
    expect(techFromRoute(parseHash('#stack/spring-boot'))).toBe('spring-boot')
    expect(techFromRoute(parseHash('#stack/kotlin'))).toBeNull()
    expect(techFromRoute(parseHash('#projects/planify'))).toBeNull()
    expect(techFromRoute(parseHash('#stack'))).toBeNull()
  })
})

describe('logo policy', () => {
  it('extrudes exactly the marks whose policy allows it', () => {
    expect(Object.keys(LOGOS3D).sort()).toEqual(tech.filter((x) => x.policy === 'extrude').map((x) => x.id).sort())
  })

  it('credits every extruded mark', () => {
    for (const id of Object.keys(LOGOS3D)) expect(creditLines()).toContain(t(id).credit)
  })

  it('gives flat marks a logo file and name marks none', () => {
    for (const x of tech) expect(Boolean(x.logo)).toBe(x.policy !== 'name')
  })
})

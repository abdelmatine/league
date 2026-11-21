import { describe, expect, it } from 'vitest'
import { profile } from '../content/profile'
import { projects } from '../content/projects'
import { LANES, tech } from '../content/tech'
import { creditLines, lanes, lanesCovered, mainsByUsage, projectsUsing, shownProjects, techById, techCount } from './content'

describe('content data', () => {
  it('has unique slugs and tech ids, and every stack id is a known tech', () => {
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length)
    expect(new Set(tech.map((t) => t.id)).size).toBe(tech.length)
    expect(projects.flatMap((p) => p.stack).filter((id) => !techById(id))).toEqual([])
  })

  it('follows the logo policy: 3D only for Angular and JS, no logo file for name-only marks', () => {
    expect(tech.filter((t) => t.policy === 'extrude').map((t) => t.id)).toEqual(['angular', 'javascript'])
    expect(tech.filter((t) => t.policy === 'name' && t.logo).map((t) => t.id)).toEqual([])
    expect(tech.filter((t) => t.policy === 'name').map((t) => t.id).sort()).toEqual(['c', 'cpp', 'java', 'postgresql', 'qt', 'react', 'react-native', 'spring-boot'])
  })

  it('points each main at a tech of its own lane', () => {
    for (const [lane, id] of Object.entries(profile.mains)) expect({ lane, techLane: techById(id)?.lane }).toEqual({ lane, techLane: lane })
  })
})

describe('content helpers', () => {
  it('hides drafts', () => {
    const shown = shownProjects()
    expect(shown).toHaveLength(8)
    expect(shown.map((p) => p.slug)).not.toEqual(expect.arrayContaining(['fixed-app', 'e-commerce', 'e-books']))
  })

  it('counts shown projects per tech and technologies', () => {
    expect(projectsUsing('nextjs')).toHaveLength(5)
    expect(projectsUsing('angular')).toHaveLength(0)
    expect(techCount()).toBe(18)
  })

  it('orders mains by usage', () => {
    expect(mainsByUsage().map((m) => [m.tech.id, m.count])).toEqual([
      ['nextjs', 5],
      ['spring-boot', 3],
      ['postgresql', 2],
      ['react-native', 1],
      ['typescript', 0],
    ])
  })

  it('groups every tech into exactly one lane, in lane order', () => {
    const groups = lanes()
    expect(groups.map((g) => g.lane)).toEqual(Object.keys(LANES))
    expect(groups.flatMap((g) => g.techs)).toHaveLength(tech.length)
  })

  it('counts covered lanes and dedupes credit lines', () => {
    expect(lanesCovered()).toBe(4)
    const lines = creditLines()
    expect(new Set(lines).size).toBe(lines.length)
    expect(lines.filter((l) => l.includes('Meta Platforms'))).toHaveLength(1)
  })
})

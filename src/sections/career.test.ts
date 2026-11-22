import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { NAV, SPY } from '../components/header/nav'
import type { Achievement, CareerEntry } from '../content/career'
import { Achievements } from './Achievements'
import { Career } from './Career'
import { formatMonth } from './career/date'

// A small fixture, so both sections are ready the day real content lands in career.ts.
const ROLES: CareerEntry[] = [
  { company: 'Acme Studio', role: 'Full-stack engineer', start: '2023-04', points: ['Built the store front', 'Ran the order API'] },
  { company: 'Beta Labs', role: 'Intern', start: '2021', end: '2022-02', points: [] },
]
const WINS: Achievement[] = [{ title: 'Cloud certificate', detail: 'Issued by Example', date: '2024-06', url: 'https://example.com/cert' }, { title: 'Hackathon finalist' }]
const html = (el: ReturnType<typeof createElement>) => renderToStaticMarkup(el)

describe('content-gated Career and Achievements', () => {
  it('render nothing, and no CAREER tab exists, while career.ts is empty (today)', () => {
    expect(html(createElement(Career))).toBe('')
    expect(html(createElement(Achievements))).toBe('')
    expect(NAV.map((t) => t.id)).toEqual(['home', 'projects', 'stack', 'contact'])
    expect(Object.keys(SPY)).not.toContain('career')
  })

  it('show each role as a loading-screen card', () => {
    const out = html(createElement(Career, { entries: ROLES }))
    expect(out).toContain('id="career"')
    expect(out.match(/class="cr-card"/g)).toHaveLength(2)
    for (const text of ['Acme Studio', 'Full-stack engineer', 'Apr 2023', 'Now', 'Built the store front', 'Beta Labs', '2021', 'Feb 2022']) expect(out).toContain(text)
    expect(out).toContain('data-now=""') // only the current role breathes
    expect(out.match(/data-now/g)).toHaveLength(1)
  })

  it('show each achievement as a post-game reward card', () => {
    const out = html(createElement(Achievements, { items: WINS }))
    expect(out).toContain('id="achievements"')
    expect(out.match(/class="ac-card"/g)).toHaveLength(2)
    for (const text of ['Cloud certificate', 'Issued by Example', 'Jun 2024', 'https://example.com/cert', 'Hackathon finalist']) expect(out).toContain(text)
    expect(out.match(/<a /g)).toHaveLength(1) // a link only where there is proof
  })

  it('formats content dates', () => {
    expect(formatMonth('2023-04')).toBe('Apr 2023')
    expect(formatMonth('2021')).toBe('2021')
  })
})

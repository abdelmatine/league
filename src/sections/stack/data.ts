import { LANES, tech, type Lane, type Tech } from '../../content/tech'
import { mainsByUsage, projectsUsing, shownProjects, techById } from '../../lib/content'

export type LaneFilter = Lane | 'all'

/** Usage line for a tech: real counts only, never a rating. */
export const usageLabel = (n: number) => (n ? `${n} project${n === 1 ? '' : 's'}` : 'No listed projects yet')

export { monogram } from '../../lib/content'

/** Lane filter plus a case-insensitive search over name, id and lane. */
export function matches(t: Tech, filter: LaneFilter, query: string) {
  const q = query.trim().toLowerCase()
  return (filter === 'all' || t.lane === filter) && (!q || `${t.name} ${t.id} ${LANES[t.lane]}`.toLowerCase().includes(q))
}

/** Techs that share a shown project with `id`, with how many they share, most shared first (ties keep tech.ts order). */
export function pairedWith(id: string, list = shownProjects(), techs: readonly Tech[] = tech) {
  const n = new Map<string, number>()
  for (const p of projectsUsing(id, list)) for (const o of p.stack) if (o !== id) n.set(o, (n.get(o) ?? 0) + 1)
  return techs.filter((t) => n.has(t.id)).map((t) => ({ tech: t, n: n.get(t.id)! })).sort((a, b) => b.n - a.n)
}

/** The intro picks the mains in 1-2-2 beats, most used first. */
export function draftBeats(mains = mainsByUsage()) {
  const ids = mains.map((m) => m.tech.id)
  return [ids.slice(0, 1), ids.slice(1, 3), ids.slice(3, 5)].filter((b) => b.length)
}

/** `#stack/<id>` → the tech id, when it names a tech. */
export const techFromRoute = (route: { section: string; item?: string } | null) => (route?.section === 'stack' && route.item && techById(route.item) ? route.item : null)

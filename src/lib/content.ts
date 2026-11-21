import { profile } from '../content/profile'
import { projects, type Project } from '../content/projects'
import { LANES, tech, type Lane, type Tech } from '../content/tech'

const laneOrder = Object.keys(LANES) as Lane[]

/** Projects the page shows: drafts stay hidden. */
export const shownProjects = (list: readonly Project[] = projects) => list.filter((p) => !p.draft)

export const projectsUsing = (techId: string, list: readonly Project[] = shownProjects()) => list.filter((p) => p.stack.includes(techId))

export const techCount = (list: readonly Tech[] = tech) => list.length

export const techById = (id: string, list: readonly Tech[] = tech) => list.find((t) => t.id === id)

/** Our monogram for marks shown by name only: short names whole, otherwise word initials.
 *  Names whose initials read badly get a fixed one. One helper for every section. */
const MONO: Record<string, string> = { postgresql: 'PG' }
export const monogram = (t: Pick<Tech, 'id' | 'name'>) =>
  MONO[t.id] ?? (t.name.length <= 3 ? t.name : (t.name.match(/\b\w/g) ?? []).join('').toUpperCase())

/** The five lane mains with their shown-project counts, most used first (ties keep lane order). */
export function mainsByUsage(mains: Record<Lane, string> = profile.mains, list: readonly Project[] = shownProjects(), techs: readonly Tech[] = tech) {
  return laneOrder
    .map((lane) => ({ lane, tech: techById(mains[lane], techs)!, count: projectsUsing(mains[lane], list).length }))
    .sort((a, b) => b.count - a.count)
}

/** Techs grouped by lane, in lane order. */
export const lanes = (techs: readonly Tech[] = tech) => laneOrder.map((lane) => ({ lane, label: LANES[lane], techs: techs.filter((t) => t.lane === lane) }))

/** How many lanes at least one shown project uses. */
export function lanesCovered(list: readonly Project[] = shownProjects(), techs: readonly Tech[] = tech) {
  const used = new Set(list.flatMap((p) => p.stack))
  return new Set(techs.filter((t) => used.has(t.id)).map((t) => t.lane)).size
}

/** Credit lines for the given (shown) marks, each line once. */
export const creditLines = (techs: readonly Tech[] = tech) => [...new Set(techs.flatMap((t) => (t.credit ? [t.credit] : [])))]

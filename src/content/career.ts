export interface CareerEntry {
  company: string
  role: string
  /** e.g. '2023-04' */
  start: string
  end?: string
  points: string[]
}

/** Empty until the owner supplies roles: the Career section and tab stay hidden while it is. */
export const career: CareerEntry[] = []

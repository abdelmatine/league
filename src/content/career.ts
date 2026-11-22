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

export interface Achievement {
  /** e.g. a certification, award or diploma. */
  title: string
  /** Who issued it, or one line of context. */
  detail?: string
  /** e.g. '2024' or '2024-06' */
  date?: string
  /** Proof: a credential or announcement page. */
  url?: string
}

/** Empty until the owner supplies some: the Achievements section stays hidden while it is. */
export const achievements: Achievement[] = []

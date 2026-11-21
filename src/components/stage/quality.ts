import { createContext, use } from 'react'
import { prefersReducedMotion } from '../../lib/motion'
import { TIERS, type Tier, type TierSpec } from '../../lib/tiers'

export interface Quality {
  tier: Tier
  spec: TierSpec
  /** Composer on (bloom, vignette, NEUTRAL tone mapping); off = the renderer tone maps (LOW, or no float buffers). */
  post: boolean
}

/** The current tier, for scenes that change with it. */
export const QualityContext = createContext<Quality>({ tier: 'mid', spec: TIERS.mid, post: true })
export const useQuality = () => use(QualityContext)

/** Render flags shared by the clock and the scenes: plain fields, read every tick, never React state. */
export const frame = {
  /** Shaders are compiled, so the clock may draw. */
  ready: false,
  /** Draw on the next tick even if nothing is on screen (warm-up, reduced-motion stills, resizes). */
  dirty: false,
  /** Reduced motion: one still frame, redrawn only when dirty. */
  still: prefersReducedMotion(),
}

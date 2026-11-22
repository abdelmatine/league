import { career } from '../../content/career'
import type { IconName } from '../ui/glyphs'

// C07: the CAREER tab appears only once career.ts has entries.
const hasCareer = career.length > 0

/** Main tabs. HOME covers #home and #about. */
export const NAV: { id: string; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Home', icon: 'shield' },
  { id: 'projects', label: 'Projects', icon: 'trophy' },
  { id: 'stack', label: 'Stack', icon: 'star' },
  ...(hasCareer ? [{ id: 'career', label: 'Career', icon: 'hex' as const }] : []),
  { id: 'contact', label: 'Contact', icon: 'mail' },
]

/** Sections the scroll-spy watches, and the tab each one lights. */
export const SPY: Record<string, string> = {
  home: 'home',
  about: 'home',
  projects: 'projects',
  stack: 'stack',
  ...(hasCareer ? { career: 'career', achievements: 'career' } : {}),
  contact: 'contact',
}

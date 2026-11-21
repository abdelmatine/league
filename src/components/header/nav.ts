import type { IconName } from '../ui/glyphs'

/** Main tabs. HOME covers #home and #about. */
export const NAV: { id: string; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Home', icon: 'shield' },
  { id: 'projects', label: 'Projects', icon: 'trophy' },
  { id: 'stack', label: 'Stack', icon: 'star' },
  { id: 'contact', label: 'Contact', icon: 'mail' },
]

/** Sections the scroll-spy watches, and the tab each one lights. */
export const SPY: Record<string, string> = { home: 'home', about: 'home', projects: 'projects', stack: 'stack', contact: 'contact' }

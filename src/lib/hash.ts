/** Deep links: #<section> or #<section>/<item>, e.g. #projects/planify, #stack/nextjs. */
export interface HashRoute {
  section: string
  item?: string
}

const SEG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Parses location.hash. Anything that isn't a clean lowercase slug path gives null. */
export function parseHash(hash: string): HashRoute | null {
  const [section = '', item, ...rest] = hash.replace(/^#/, '').split('/')
  if (!SEG.test(section) || rest.length > 0) return null
  if (!item) return { section }
  return SEG.test(item) ? { section, item } : null
}

export const formatHash = ({ section, item }: HashRoute) => `#${section}${item ? `/${item}` : ''}`

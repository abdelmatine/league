/** Emblem files made by scripts/optimise-images.mjs (square, AVIF + WebP, 2x their display sizes). */
export const EMBLEM_SIZES = [256, 640] as const
export const emblemSrc = (slug: string, size: number, ext: 'avif' | 'webp') => `/assets/projects/${slug}-${size}.${ext}`

/** Splits `list` into lobbies of `size`; the last one may be short. */
export const lobbies = <T>(list: readonly T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, (i + 1) * size))

/** Left-to-right order of one lobby, filled centre-out: the first item in the middle,
 *  then alternately left and right of it (5 items show as 4-2-1-3-5). */
export function centreOut<T>(items: readonly T[]): T[] {
  const row: T[] = []
  items.forEach((item, i) => (i % 2 ? row.unshift(item) : row.push(item)))
  return row
}

/** Host name for display: https://www.example.com/ -> example.com. */
export const hostOf = (url: string) => new URL(url).hostname.replace(/^www\./, '')

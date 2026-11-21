import { EMBLEM_SIZES, emblemSrc } from './helpers'

const set = (slug: string, ext: 'avif' | 'webp') => EMBLEM_SIZES.map((s) => `${emblemSrc(slug, s, ext)} ${s}w`).join(', ')

/** A project's framed square emblem: AVIF with a WebP fallback, lazy. `sizes` is its CSS width. */
export function Emblem({ slug, sizes, alt = '', className = '' }: { slug: string; sizes: string; alt?: string; className?: string }) {
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={set(slug, 'avif')} sizes={sizes} />
      <img
        src={emblemSrc(slug, EMBLEM_SIZES[0], 'webp')}
        srcSet={set(slug, 'webp')}
        sizes={sizes}
        width={EMBLEM_SIZES[0]}
        height={EMBLEM_SIZES[0]}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </picture>
  )
}

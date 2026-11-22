import type { CSSProperties, ReactNode } from 'react'

export interface CrestProps {
  /** Photo; without it the crest shows `initials`. */
  src?: string
  alt?: string
  initials?: string
  size?: 'sm' | 'md' | 'lg'
  /** XP ring fill, 0 to 1. */
  xp?: number
  /** Level pill content; give `levelLabel` so it reads as words. */
  level?: ReactNode
  levelLabel?: string
  /** Crop: object-position of the face and how far to zoom in on it. */
  focus?: string
  zoom?: number
  className?: string
}

/** Round avatar with a gold rim, an XP ring and an optional level pill. */
export function Crest({ src, alt = '', initials, size = 'md', xp = 0, level, levelLabel, focus, zoom, className = '' }: CrestProps) {
  const style = { '--xp': xp, '--crest-focus': focus, '--crest-zoom': zoom } as CSSProperties
  return (
    <span className={`hx-crest ${className}`} data-size={size === 'md' ? undefined : size} style={style}>
      <span className="hx-crest__face">
        {src ? (
          <img src={src} alt={alt} decoding="async" draggable={false} />
        ) : (
          <span className="hx-crest__mono" {...(alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true })}>
            {initials}
          </span>
        )}
      </span>
      {level !== undefined && (
        <span className="hx-crest__lvl" aria-label={levelLabel}>
          {level}
        </span>
      )}
    </span>
  )
}

import type { SVGProps } from 'react'
import { glyphs, type IconName } from './glyphs'

/** Decorative glyph: always aria-hidden. Label the control that holds it instead. */
export function Icon({ name, className = '', ...rest }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className={`hx-icon ${className}`} {...rest}>
      {glyphs[name]}
    </svg>
  )
}

import type { HTMLAttributes } from 'react'

export interface FrameProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article' | 'aside' | 'form'
  /** gold: bright border (default); dim: quieter border for nested panels. */
  tone?: 'gold' | 'dim'
  /** Corner gems. */
  corners?: boolean
  /** Edge the border gradient brightens towards. */
  anchor?: 'top' | 'bottom' | 'left' | 'right'
}

export function Frame({ as: Tag = 'div', tone = 'gold', corners = false, anchor = 'top', className = '', ...rest }: FrameProps) {
  return (
    <Tag
      className={`hx-frame ${className}`}
      data-tone={tone === 'dim' ? 'dim' : undefined}
      data-anchor={anchor === 'top' ? undefined : anchor}
      data-corners={corners ? '' : undefined}
      {...rest}
    />
  )
}

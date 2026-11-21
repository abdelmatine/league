import { useRef, type HTMLAttributes } from 'react'
import { frameBuildIn, ScrollTrigger, useGSAP } from '../../lib/motion'

export interface FrameProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article' | 'aside'
  /** gold: bright border (default); dim: quieter border for nested panels. */
  tone?: 'gold' | 'dim'
  /** Corner gems. */
  corners?: boolean
  /** Edge the border gradient brightens towards. */
  anchor?: 'top' | 'bottom' | 'left' | 'right'
  /** Build the frame in (border draw + content fade) once, when it is 20% into view. */
  buildIn?: boolean
}

export function Frame({ as: Tag = 'div', tone = 'gold', corners = false, anchor = 'top', buildIn = false, className = '', ...rest }: FrameProps) {
  const ref = useRef<HTMLElement | null>(null)
  useGSAP(
    (_, contextSafe) => {
      const el = ref.current
      if (!buildIn || !el || !contextSafe) return
      el.dataset.reveal = 'armed'
      ScrollTrigger.create({ trigger: el, start: 'top 80%', once: true, onEnter: contextSafe(() => frameBuildIn(el)) })
    },
    { dependencies: [buildIn] },
  )
  return (
    <Tag
      ref={(el: HTMLElement | null) => void (ref.current = el)}
      className={`hx-frame ${className}`}
      data-tone={tone === 'dim' ? 'dim' : undefined}
      data-anchor={anchor === 'top' ? undefined : anchor}
      data-corners={corners ? '' : undefined}
      data-reveal={buildIn ? '' : undefined}
      {...rest}
    />
  )
}

import type { ReactNode } from 'react'
import { Frame } from '../components/ui/Frame'

/** A page section: stable id (deep links, scroll-spy), labelled by its h2, content in a Frame.
 *  tabIndex -1 lets in-page links move focus here after scrolling. */
export function Section({ id, title, eyebrow, children }: { id: string; title: string; eyebrow?: string; children: ReactNode }) {
  return (
    <section id={id} tabIndex={-1} aria-labelledby={`${id}-title`} className="hx-section">
      <Frame corners className="hx-section__frame">
        {eyebrow && <p className="hx-eyebrow">{eyebrow}</p>}
        <h2 id={`${id}-title`} className="hx-h2">
          {title}
        </h2>
        {children}
      </Frame>
    </section>
  )
}

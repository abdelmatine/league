import { useId } from 'react'
import type { Tech } from '../../content/tech'
import { monogram } from './data'
import { LOGOS3D } from './logos3d'

/** A tech's 2D mark, by its logo policy (tech.ts): 'extrude' marks are drawn from their path in brand
 *  colours, 'flat' marks are the unaltered official file, 'name' marks are our monogram. Decorative:
 *  the name is always written next to it. */
export function TechMark({ tech: t, className = '' }: { tech: Tech; className?: string }) {
  const gid = `cs-g${useId().replace(/[^\w-]/g, '')}` // unique per instance: a gradient inside a hidden tile must not be the one others reference
  const l = t.policy === 'extrude' ? LOGOS3D[t.id] : undefined
  if (l) {
    const g = l.gradient
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={`cs-mark ${className}`} data-policy="extrude">
        {g && (
          <defs>
            <linearGradient id={gid} x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2}>
              {g.stops.map(([o, c]) => (
                <stop key={o} offset={o} stopColor={c} />
              ))}
            </linearGradient>
          </defs>
        )}
        {l.inlay && <rect x="1" y="1" width="22" height="22" fill={l.inlay} />}
        <path d={l.path} fill={g ? `url(#${gid})` : l.face} />
      </svg>
    )
  }
  if (t.policy === 'flat' && t.logo) return <img src={t.logo} alt="" decoding="async" draggable={false} className={`cs-mark ${className}`} data-policy="flat" />
  return (
    <span aria-hidden="true" className={`cs-mark cs-mono ${className}`} data-policy="name">
      {monogram(t)}
    </span>
  )
}

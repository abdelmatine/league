import { techById } from '../../lib/content'
import { monogram } from './helpers'
import './techchip.css'

/** A tech as a small gold diamond, following its logo policy: the official logo, flat and unaltered,
 *  or our own monogram for marks shown by name only. `named`: the name is read out (off when it is visible next to it). */
export function TechChip({ id, named = true, className = '' }: { id: string; named?: boolean; className?: string }) {
  const t = techById(id)
  if (!t) return null
  return (
    <span className={`tc ${className}`}>
      <span className="tc__face" aria-hidden="true">
        {t.logo ? <img src={t.logo} alt="" loading="lazy" decoding="async" draggable={false} /> : <span className="tc__mono">{monogram(t.name)}</span>}
      </span>
      {named && <span className="sr-only">{t.name}</span>}
    </span>
  )
}

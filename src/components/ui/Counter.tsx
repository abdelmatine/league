import type { IconName } from './glyphs'
import { Icon } from './Icon'

/** Icon + tabular number + label (small counters use the body face). */
export function Counter({ icon, value, label, className = '' }: { icon: IconName; value: number; label: string; className?: string }) {
  return (
    <span className={`hx-counter ${className}`}>
      <Icon name={icon} />
      <span className="hx-counter__value">{value}</span>
      <span className="hx-counter__label">{label}</span>
    </span>
  )
}

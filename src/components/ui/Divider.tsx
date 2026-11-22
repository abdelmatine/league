/** Ornamental gold hairline with a centre gem (hidden from assistive tech). */
export function Divider({ short = false, className = '' }: { short?: boolean; className?: string }) {
  return <hr aria-hidden="true" className={`hx-divider${short ? ' hx-divider--short' : ''} ${className}`} />
}

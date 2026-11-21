import { cloneElement, useEffect, useId, useState, type ReactElement, type ReactNode } from 'react'

type Trigger = ReactElement<{ 'aria-describedby'?: string; onBlur?: () => void; onPointerLeave?: () => void }>

/** CSS tooltip: shows on hover and keyboard focus after 150 ms and stays while hovered; Esc hides it.
 *  The child must be one focusable element. It gets aria-describedby (its own onBlur/onPointerLeave are replaced). */
export function Tooltip({ content, side = 'top', children }: { content: ReactNode; side?: 'top' | 'bottom'; children: Trigger }) {
  const id = useId()
  const [dismissed, setDismissed] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDismissed(true)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
  const reset = () => setDismissed(false)
  return (
    <span className="hx-tip" data-dismissed={dismissed ? '' : undefined}>
      {cloneElement(children, { 'aria-describedby': id, onBlur: reset, onPointerLeave: reset })}
      <span role="tooltip" id={id} className="hx-tooltip" data-side={side === 'bottom' ? 'bottom' : undefined}>
        {content}
      </span>
    </span>
  )
}

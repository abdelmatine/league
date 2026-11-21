import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Icon } from './Icon'

export interface DialogProps {
  open: boolean
  /** Called for every close: Esc, the close button, a backdrop click or `open` going false. */
  onClose: () => void
  title: ReactNode
  children: ReactNode
  /** Buttons along the bottom edge. */
  actions?: ReactNode
  /** 'alertdialog' for decisions such as MATCH FOUND: no close button, backdrop clicks ignored. */
  role?: 'dialog' | 'alertdialog'
  /** Id of the element that describes the dialog (required for alertdialog). */
  describedBy?: string
  className?: string
}

/** Native modal <dialog>: focus trap, Esc and top layer from the platform. Focus returns to the opener.
 *  Below 768 px it becomes a full-screen sheet. */
export function Dialog({ open, onClose, title, children, actions, role = 'dialog', describedBy, className = '' }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const opener = useRef<Element | null>(null)
  const titleId = useId()
  const alert = role === 'alertdialog'

  useEffect(() => {
    const d = ref.current
    if (!d || open === d.open) return
    if (open) {
      opener.current = document.activeElement
      d.showModal()
    } else d.close()
  }, [open])

  useEffect(() => {
    const d = ref.current
    if (!d || alert) return
    const onClick = (e: MouseEvent) => e.target === d && d.close() // the ::backdrop targets the dialog itself
    d.addEventListener('click', onClick)
    return () => d.removeEventListener('click', onClick)
  }, [alert])

  return (
    <dialog
      ref={ref}
      role={alert ? 'alertdialog' : undefined}
      aria-labelledby={titleId}
      aria-describedby={describedBy}
      className={`hx-frame hx-dialog ${className}`}
      data-corners=""
      onClose={() => {
        if (opener.current instanceof HTMLElement) opener.current.focus({ preventScroll: true })
        onClose()
      }}
    >
      {!alert && (
        <button type="button" className="hx-dialog__close" aria-label="Close" onClick={() => ref.current?.close()}>
          <Icon name="close" />
        </button>
      )}
      <h2 id={titleId} className="hx-h3 hx-dialog__title">
        {title}
      </h2>
      <div className="hx-dialog__body">{children}</div>
      {actions && <div className="hx-dialog__actions">{actions}</div>}
    </dialog>
  )
}

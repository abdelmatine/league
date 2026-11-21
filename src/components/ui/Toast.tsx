import { useSyncExternalStore } from 'react'
import { dismiss, hold, release, toastStore, type Toast as ToastData } from '../../lib/toast'
import { Icon } from './Icon'

function Toast({ toast }: { toast: ToastData }) {
  const timed = !toast.persistent
  return (
    <div
      className="hx-toast"
      data-tone={toast.tone === 'error' ? 'error' : undefined}
      data-leaving={toast.leaving ? '' : undefined}
      onPointerEnter={timed ? () => hold(toast.id) : undefined}
      onPointerLeave={timed ? () => release(toast.id) : undefined}
      onFocus={timed ? () => hold(toast.id) : undefined}
      onBlur={timed ? () => release(toast.id) : undefined}
    >
      <span className="hx-toast__medal" aria-hidden="true">
        <Icon name={toast.icon ?? (toast.tone === 'error' ? 'close' : 'check')} />
      </span>
      <div className="grid gap-0.5">
        <p className="hx-toast__title">{toast.title}</p>
        {toast.text && <p className="hx-toast__text">{toast.text}</p>}
      </div>
      <button type="button" className="hx-toast__close" aria-label="Dismiss" onClick={() => dismiss(toast.id)}>
        <Icon name="close" className="size-4" />
      </button>
    </div>
  )
}

/** The one live region for toasts: bottom right, bottom centre on phones. Mount it once. */
export function ToastRegion() {
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.get, toastStore.get)
  return (
    <output className="hx-toasts" aria-live="polite">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} />
      ))}
    </output>
  )
}

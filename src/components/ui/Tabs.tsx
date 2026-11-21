import { useRef, type KeyboardEvent, type ReactNode } from 'react'

export interface TabItem {
  id: string
  label: ReactNode
}

const tabId = (base: string, id: string) => `${base}-tab-${id}`
const panelId = (base: string, id: string) => `${base}-panel-${id}`

/** In-section tabs (project dialog, stack filters). Roving tabindex; arrows, Home and End move and select. */
export function Tabs({ label, items, value, onChange, idBase, className = '' }: {
  label: string
  items: TabItem[]
  value: string
  onChange: (id: string) => void
  /** Shared with the TabPanels, for the aria wiring. */
  idBase: string
  className?: string
}) {
  const list = useRef<HTMLDivElement>(null)
  const onKeyDown = (e: KeyboardEvent) => {
    const i = items.findIndex((t) => t.id === value)
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : step === undefined ? -1 : (i + step + items.length) % items.length
    if (next === -1) return
    e.preventDefault()
    onChange(items[next].id)
    list.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus()
  }
  return (
    <div ref={list} role="tablist" aria-label={label} className={`hx-tabs ${className}`}>
      {items.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          id={tabId(idBase, t.id)}
          aria-selected={t.id === value}
          aria-controls={panelId(idBase, t.id)}
          tabIndex={t.id === value ? 0 : -1}
          className="hx-tab"
          onClick={() => onChange(t.id)}
          onKeyDown={onKeyDown}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function TabPanel({ idBase, id, value, children, className = '' }: { idBase: string; id: string; value: string; children: ReactNode; className?: string }) {
  return (
    <div role="tabpanel" id={panelId(idBase, id)} aria-labelledby={tabId(idBase, id)} hidden={id !== value} tabIndex={0} className={className}>
      {children}
    </div>
  )
}

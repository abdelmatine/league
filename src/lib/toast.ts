import type { IconName } from '../components/ui/glyphs'

export interface ToastInput {
  title: string
  text?: string
  icon?: IconName
  tone?: 'info' | 'error'
  /** Stays until closed (the contact result). Others close after TOAST_TTL. */
  persistent?: boolean
}
export interface Toast extends ToastInput {
  id: number
  leaving?: boolean
}

export const TOAST_MAX = 3
export const TOAST_TTL = 5000
export const TOAST_EXIT = 320

let list: readonly Toast[] = []
let nextId = 1
const timers = new Map<number, ReturnType<typeof setTimeout>>()
const subs = new Set<() => void>()

function set(next: readonly Toast[]) {
  list = next
  subs.forEach((fn) => fn())
}
function clear(id: number) {
  clearTimeout(timers.get(id))
  timers.delete(id)
}
function arm(id: number) {
  clear(id)
  timers.set(id, setTimeout(() => dismiss(id), TOAST_TTL))
}

/** Keeps at most `max` visible toasts, dropping the oldest non-persistent one first. */
export function cap(toasts: readonly Toast[], max = TOAST_MAX): Toast[] {
  const out = [...toasts]
  while (out.filter((t) => !t.leaving).length > max) {
    const i = out.findIndex((t) => !t.leaving && !t.persistent)
    out.splice(i === -1 ? out.findIndex((t) => !t.leaving) : i, 1)
  }
  return out
}

export function push(input: ToastInput): number {
  const id = nextId++
  const next = cap([...list, { ...input, id }])
  for (const t of list) if (!next.includes(t)) clear(t.id)
  if (!input.persistent) arm(id)
  set(next)
  return id
}

/** Starts the exit; the toast is removed TOAST_EXIT ms later. */
export function dismiss(id: number) {
  if (!list.some((t) => t.id === id && !t.leaving)) return
  clear(id)
  set(list.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
  timers.set(id, setTimeout(() => {
    timers.delete(id)
    set(list.filter((t) => t.id !== id))
  }, TOAST_EXIT))
}

/** Hover or focus holds a timed toast open; leaving restarts its full timer. */
export function hold(id: number) {
  if (list.some((t) => t.id === id && !t.leaving && !t.persistent)) clear(id)
}
export function release(id: number) {
  if (list.some((t) => t.id === id && !t.leaving && !t.persistent)) arm(id)
}

export const toastStore = {
  get: () => list,
  subscribe(fn: () => void) {
    subs.add(fn)
    return () => void subs.delete(fn)
  },
}

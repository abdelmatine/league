import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cap, dismiss, hold, push, release, TOAST_EXIT, TOAST_TTL, toastStore, type Toast } from './toast'

const visible = () => toastStore.get().filter((t) => !t.leaving)

describe('toast store', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    toastStore.get().forEach((t) => dismiss(t.id))
    vi.runAllTimers()
    vi.useRealTimers()
  })

  it('auto-dismisses after 5 s, then removes after the exit', () => {
    const id = push({ title: 'Saved' })
    vi.advanceTimersByTime(TOAST_TTL - 1)
    expect(visible().map((t) => t.id)).toEqual([id])
    vi.advanceTimersByTime(1)
    expect(toastStore.get()[0]).toMatchObject({ id, leaving: true })
    vi.advanceTimersByTime(TOAST_EXIT)
    expect(toastStore.get()).toEqual([])
  })

  it('keeps a persistent toast until it is closed', () => {
    const id = push({ title: 'Message delivered', persistent: true })
    vi.advanceTimersByTime(TOAST_TTL * 10)
    expect(visible().map((t) => t.id)).toEqual([id])
    dismiss(id)
    vi.advanceTimersByTime(TOAST_EXIT)
    expect(toastStore.get()).toEqual([])
  })

  it('shows at most 3, dropping the oldest timed toast before a persistent one', () => {
    const keep = push({ title: 'a', persistent: true })
    const drop = push({ title: 'b' })
    push({ title: 'c' })
    push({ title: 'd' })
    const ids = visible().map((t) => t.id)
    expect(ids).toHaveLength(3)
    expect(ids).toContain(keep)
    expect(ids).not.toContain(drop)
  })

  it('holds a timed toast while hovered and restarts the timer on release', () => {
    const id = push({ title: 'x' })
    hold(id)
    vi.advanceTimersByTime(TOAST_TTL * 2)
    expect(visible()).toHaveLength(1)
    release(id)
    vi.advanceTimersByTime(TOAST_TTL)
    expect(visible()).toHaveLength(0)
  })

  it('notifies subscribers', () => {
    const fn = vi.fn<() => void>()
    const off = toastStore.subscribe(fn)
    push({ title: 'y' })
    off()
    push({ title: 'z' })
    expect(fn).toHaveBeenCalledTimes(1)
  })
})

describe('cap', () => {
  const t = (id: number, extra: Partial<Toast> = {}): Toast => ({ id, title: String(id), ...extra })
  it('drops the oldest when every toast is persistent', () => {
    expect(cap([t(1, { persistent: true }), t(2, { persistent: true }), t(3, { persistent: true }), t(4, { persistent: true })]).map((x) => x.id)).toEqual([2, 3, 4])
  })
  it('ignores toasts that are already leaving', () => {
    expect(cap([t(1, { leaving: true }), t(2), t(3), t(4)]).map((x) => x.id)).toEqual([1, 2, 3, 4])
  })
})

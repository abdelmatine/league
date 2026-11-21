import { useEffect, type RefObject } from 'react'

/** A 3D scene drawn on the shared canvas, anchored to a DOM element. Its component lives in the
 *  lazy stage chunk (components/stage/scenes.ts) under the same id, so sections never import three. */
export interface StageScene {
  id: string
  anchor: HTMLElement
  visible: boolean
}

interface StageState {
  scenes: readonly StageScene[]
  /** Tech picked on the stack screen (L13/L14). */
  selectedTech: string | null
}

let state: StageState = { scenes: [], selectedTech: null }
const subs = new Set<() => void>()
let io: IntersectionObserver | null = null

function set(next: Partial<StageState>) {
  state = { ...state, ...next }
  subs.forEach((fn) => fn())
}

function observer() {
  io ??= new IntersectionObserver((entries) =>
    set({
      scenes: state.scenes.map((s) => {
        const e = entries.findLast((x) => x.target === s.anchor)
        return e && e.isIntersecting !== s.visible ? { ...s, visible: e.isIntersecting } : s
      }),
    }),
  )
  return io
}

export const stageStore = {
  get: () => state,
  subscribe(fn: () => void) {
    subs.add(fn)
    return () => void subs.delete(fn)
  },
  /** Anchors scene `id` to `anchor`; returns the unregister function. */
  register(id: string, anchor: HTMLElement) {
    set({ scenes: [...state.scenes.filter((s) => s.id !== id), { id, anchor, visible: false }] })
    observer().observe(anchor)
    return () => {
      io?.unobserve(anchor)
      set({ scenes: state.scenes.filter((s) => s.anchor !== anchor) })
    }
  },
  selectTech: (id: string | null) => set({ selectedTech: id }),
  /** The stage renders only while this is true. */
  anyVisible: () => state.scenes.some((s) => s.visible),
}

/** Section side: keep scene `id` anchored to `ref` while the section is mounted. */
export function useStageScene(id: string, ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    return el ? stageStore.register(id, el) : undefined
  }, [id, ref])
}

/** The 3D chunk loads only with WebGL2 and without Save-Data (L09 adds GPU tiers). */
export function stageSupported() {
  if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return false
  try {
    const gl = document.createElement('canvas').getContext('webgl2')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return gl !== null
  } catch {
    return false
  }
}

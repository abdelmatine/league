import { useSyncExternalStore } from 'react'
import { initialPlayState, playReducer, type PlayEvent, type PlayState } from './playState'

let state: PlayState = initialPlayState
const subs = new Set<() => void>()

/** The one PLAY state. The loader (patching -> play) and the contact flow (queue -> found -> accepted) dispatch here. */
export const playStore = {
  get: () => state,
  dispatch(e: PlayEvent) {
    const next = playReducer(state, e)
    if (next === state) return
    state = next
    subs.forEach((fn) => fn())
  },
  subscribe(fn: () => void) {
    subs.add(fn)
    return () => void subs.delete(fn)
  },
}

export const usePlayState = () => useSyncExternalStore(playStore.subscribe, playStore.get, playStore.get)

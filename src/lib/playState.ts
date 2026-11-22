/** Header PLAY plate: patching -> play -> queue -> found -> accepted; cancel, decline and timeout go back to play. */
export type PlayState =
  | { name: 'patching'; progress: number }
  | { name: 'play' }
  | { name: 'queue'; since: number }
  | { name: 'found'; since: number }
  | { name: 'accepted' }

export type PlayEvent =
  | { type: 'progress'; value: number } // patching only, 0..1, never goes back
  | { type: 'ready' } // patching -> play
  | { type: 'queue'; at: number } // play -> queue (timestamp, ms)
  | { type: 'cancel' } // queue -> play
  | { type: 'found'; at: number } // queue -> found
  | { type: 'accept' } // found -> accepted
  | { type: 'decline' } // found -> play
  | { type: 'timeout' } // found -> play
  | { type: 'reset' } // accepted -> play

export const initialPlayState: PlayState = { name: 'patching', progress: 0 }

/** Pure transition. Events that don't apply return the same state object. */
export function playReducer(s: PlayState, e: PlayEvent): PlayState {
  switch (s.name) {
    case 'patching': {
      if (e.type === 'ready') return { name: 'play' }
      if (e.type !== 'progress') return s
      const progress = Math.min(1, Math.max(0, e.value))
      return progress > s.progress ? { name: 'patching', progress } : s
    }
    case 'play':
      return e.type === 'queue' ? { name: 'queue', since: e.at } : s
    case 'queue':
      if (e.type === 'found') return { name: 'found', since: e.at }
      return e.type === 'cancel' ? { name: 'play' } : s
    case 'found':
      if (e.type === 'accept') return { name: 'accepted' }
      return e.type === 'decline' || e.type === 'timeout' ? { name: 'play' } : s
    case 'accepted':
      return e.type === 'reset' ? { name: 'play' } : s
  }
}

export const PLAY_LABEL: Record<PlayState['name'], string> = {
  patching: 'Play',
  play: 'Play',
  queue: 'In queue',
  found: 'Match found',
  accepted: 'Accepted',
}

/** Elapsed time as m:ss. */
export function formatClock(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

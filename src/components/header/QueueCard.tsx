import { formatClock } from '../../lib/playState'
import { playStore } from '../../lib/playStore'
import { Icon } from '../ui/Icon'

/** Shown under the header profile while the PLAY state is `queue`. */
export function QueueCard({ elapsed }: { elapsed: number }) {
  return (
    <div className="hx-queue">
      <span className="hx-queue__label">In queue</span>
      <span className="hx-queue__clock">{formatClock(elapsed)}</span>
      <button type="button" className="hx-iconbtn" aria-label="Leave the queue" onClick={() => playStore.dispatch({ type: 'cancel' })}>
        <Icon name="close" className="size-4" />
      </button>
    </div>
  )
}

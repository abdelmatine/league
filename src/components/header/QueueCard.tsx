import { formatClock } from '../../lib/playState'
import './QueueCard.css'

/** Shown under the header profile while a contact message is on its way (PLAY state `queue`).
 *  It has no leave button: a message already sent to EmailJS cannot be called back. */
export function QueueCard({ elapsed }: { elapsed: number }) {
  return (
    <div className="hx-qc">
      <svg className="hx-qc__icon" viewBox="0 0 72 72" aria-hidden="true" focusable="false">
        <polygon points="36 3 64.6 19.5 64.6 52.5 36 69 7.4 52.5 7.4 19.5" className="hx-qc__hex" />
        <path d="M20 26h32v22H20ZM20 26l16 13 16-13" className="hx-qc__mail" />
      </svg>
      <p className="hx-qc__head">Finding match</p>
      <p className="hx-qc__time">{formatClock(elapsed)}</p>
    </div>
  )
}

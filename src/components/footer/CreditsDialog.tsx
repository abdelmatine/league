import { creditLines } from '../../lib/content'
import { GoldButton } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { NOTICE_FULL } from './notice'

// Every mark in tech.ts is shown on the stack screen, so all of their credit lines apply.
const credits = creditLines()

export function CreditsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="Credits and legal" actions={<GoldButton onClick={onClose}>Close</GoldButton>}>
      <div className="hx-credits">
        {NOTICE_FULL.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <h3 className="hx-eyebrow">Technology marks</h3>
        <ul>
          {credits.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <h3 className="hx-eyebrow">Fonts and icons</h3>
        <ul>
          <li>
            Literata and Source Sans 3, under the{' '}
            <a href="https://openfontlicense.org/" target="_blank" rel="noopener noreferrer">
              SIL Open Font License 1.1
            </a>
            .
          </li>
          <li>Social icons from Simple Icons (CC0 1.0). Every other ornament and icon is drawn for this site.</li>
        </ul>
      </div>
    </Dialog>
  )
}

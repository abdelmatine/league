import { useState } from 'react'
import { profile } from '../../content/profile'
import { Divider } from '../ui/Divider'
import { Icon } from '../ui/Icon'
import { CreditsDialog } from './CreditsDialog'
import { NOTICE_SHORT } from './notice'

const year = new Date().getFullYear()

export function Footer() {
  const [credits, setCredits] = useState(false)
  return (
    <footer className="hx-footer">
      <Divider short />
      <ul className="hx-footer__socials" aria-label="Social profiles">
        {profile.socials.map((s) => (
          <li key={s.id}>
            <a href={s.url} className="hx-iconbtn" aria-label={s.label} target="_blank" rel="noopener noreferrer">
              <Icon name={s.id} />
            </a>
          </li>
        ))}
      </ul>
      <p className="hx-footer__notice">{NOTICE_SHORT}</p>
      <p className="hx-footer__meta">
        © {year} {profile.name}
        <span aria-hidden="true"> · </span>
        <button type="button" className="hx-link" onClick={() => setCredits(true)}>
          Credits and legal
        </button>
      </p>
      <CreditsDialog open={credits} onClose={() => setCredits(false)} />
    </footer>
  )
}

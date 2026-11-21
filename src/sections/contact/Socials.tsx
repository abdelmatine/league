import { Icon } from '../../components/ui/Icon'
import { profile } from '../../content/profile'

/** "github.com/abdelmatine": host and path, without www or the trailing slash. */
const handle = (url: string) => {
  const u = new URL(url)
  return `${u.hostname.replace(/^www\./, '')}${u.pathname.replace(/\/$/, '')}`
}

/** The social column: one row per profile in profile.ts. */
export function Socials() {
  return (
    <aside className="cx-social" aria-labelledby="contact-social" data-reveal="">
      <h3 id="contact-social" className="cx-social__bar">
        Social
      </h3>
      <p className="cx-social__group">
        Profiles <span>({profile.socials.length})</span>
      </p>
      <ul className="cx-social__list">
        {profile.socials.map((s) => (
          <li key={s.id}>
            <a className="cx-row" href={s.url} target="_blank" rel="noopener noreferrer">
              <span className="cx-row__icon">
                <Icon name={s.id} />
              </span>
              <span className="cx-row__txt">
                <span className="cx-row__name">{s.label}</span>
                <span className="cx-row__status">{handle(s.url)}</span>
              </span>
              <Icon name="external" className="cx-row__go" />
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}

import { useRef } from 'react'
import { GoldButton } from '../components/ui/Button'
import { Crest } from '../components/ui/Crest'
import { profile } from '../content/profile'
import { LANES } from '../content/tech'
import { lanes, lanesCovered, mainsByUsage, shownProjects, techCount } from '../lib/content'
import { counterUp, prefersReducedMotion, ScrollTrigger, useGSAP } from '../lib/motion'
import { TechChip } from './projects/TechChip'
import { Section } from './Section'
import './projects/projects.css' // the banner rod and cloth
import './about/about.css'

const STATS = [
  { value: shownProjects().length, label: 'Projects shipped' },
  { value: techCount(), label: 'Technologies' },
  { value: lanesCovered(), label: 'Lanes covered' },
]
const usage = (n: number) => (n ? `${n} project${n === 1 ? '' : 's'}` : 'No listed projects yet')

/** HOME's profile screen: the player card (crest, name, title), the bio, the five lane mains and three counters. */
export function About() {
  const stats = useRef<HTMLUListElement>(null)

  // Counters roll up once, when they come into view. The real values stay in the text for assistive tech.
  useGSAP((_, contextSafe) => {
    const el = stats.current
    if (!el || !contextSafe || prefersReducedMotion()) return
    const nums = [...el.querySelectorAll<HTMLElement>('[data-to]')]
    for (const n of nums) n.textContent = '0'
    const roll = contextSafe(() => nums.forEach((n, i) => counterUp(n, Number(n.dataset.to), { delay: i * 0.12 })))
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: roll })
  })

  return (
    <Section id="about" title="About" eyebrow="Profile">
      <div className="ab">
        <div className="ab-card">
          <span className="pb__rod" aria-hidden="true" />
          <span className="pb__cloth" aria-hidden="true" />
          <Crest src={profile.photo} alt={`Portrait of ${profile.name}`} focus={profile.photoFocus} zoom={profile.photoZoom} xp={lanesCovered() / lanes().length} />
          <p className="ab-card__name">{profile.name}</p>
          <p className="ab-card__title">{profile.title[0]}</p>
          <p className="ab-card__sub">{profile.title.slice(1).join(' · ')}</p>
          {profile.cvUrl && (
            <GoldButton href={profile.cvUrl} className="ab-card__cv" target="_blank" rel="noopener noreferrer">
              Download CV<span className="sr-only"> (opens in a new tab)</span>
            </GoldButton>
          )}
        </div>

        <div className="ab-main">
          <div className="ab-bio">
            {profile.about.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {import.meta.env.DEV && profile.aboutIsPlaceholder && <p className="hx-eyebrow text-ruby-400">Placeholder text (dev only)</p>}
          </div>

          <section aria-labelledby="mains-title">
            <h3 id="mains-title" className="hx-eyebrow ab-rule">
              Mains
            </h3>
            <ul className="ab-mains">
              {mainsByUsage().map((m) => (
                <li key={m.lane}>
                  <TechChip id={m.tech.id} named={false} />
                  <span className="ab-mains__name">{m.tech.name}</span>
                  <span className="ab-mains__meta">
                    {LANES[m.lane]} · {usage(m.count)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <ul ref={stats} className="ab-stats">
            {STATS.map((s) => (
              <li key={s.label}>
                <b className="ab-stats__n hx-num hx-gold-text" data-to={s.value} aria-hidden="true">
                  {s.value}
                </b>
                <span className="ab-stats__label">
                  <span className="sr-only">{s.value} </span>
                  {s.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}

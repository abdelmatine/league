import { LANES } from '../content/tech'
import { lanes, mainsByUsage, projectsUsing, techCount } from '../lib/content'
import { Section } from './Section'

const usage = (id: string) => {
  const n = projectsUsing(id).length
  return n ? `${n} project${n === 1 ? '' : 's'}` : 'No listed projects yet'
}

// STUB (L08): L13/L14 replace this file with the columns, filters, tiles, splash and LOCK IN.
export function Stack() {
  return (
    <Section id="stack" title="Stack" eyebrow={`${techCount()} technologies`}>
      <h3 className="hx-eyebrow mt-6">Mains</h3>
      <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
        {mainsByUsage().map((m) => (
          <li key={m.lane} className="text-small">
            <span className="text-gold-50">{m.tech.name}</span> <span className="text-stone-400">· {LANES[m.lane]}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {lanes().map((l) => (
          <div key={l.lane}>
            <dt className="hx-eyebrow">{l.label}</dt>
            {l.techs.map((t) => (
              <dd key={t.id} className="mt-2 text-small">
                {t.name} <span className="text-stone-400">· {usage(t.id)}</span>
              </dd>
            ))}
          </div>
        ))}
      </dl>
    </Section>
  )
}

import { Counter } from '../components/ui/Counter'
import { Crest } from '../components/ui/Crest'
import { profile } from '../content/profile'
import { lanes, lanesCovered, shownProjects, techCount } from '../lib/content'
import { Section } from './Section'

// STUB (L08): L16 replaces this file with the profile card, mains row and counters.
export function About() {
  return (
    <Section id="about" title="About">
      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
        <Crest size="lg" src={profile.photo} alt={profile.name} focus={profile.photoFocus} zoom={profile.photoZoom} xp={lanesCovered() / lanes().length} />
        <div className="grid gap-4">
          {profile.about.map((p) => (
            <p key={p} className="max-w-[68ch]">
              {p}
            </p>
          ))}
          {import.meta.env.DEV && profile.aboutIsPlaceholder && <p className="hx-eyebrow text-ruby-400">Placeholder text (dev only)</p>}
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <Counter icon="hex" value={shownProjects().length} label="Projects shipped" />
            <Counter icon="crystal" value={techCount()} label="Technologies" className="text-teal-300" />
            <Counter icon="star" value={lanesCovered()} label="Lanes covered" />
          </div>
        </div>
      </div>
    </Section>
  )
}

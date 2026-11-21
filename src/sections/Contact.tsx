import { GoldButton } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { profile } from '../content/profile'
import { Section } from './Section'

// STUB (L08): L15 replaces this file with the lobby banners, the form and the queue flow.
export function Contact() {
  return (
    <Section id="contact" title="Contact">
      <p className="mt-4 max-w-[68ch]">The quickest way to reach me is LinkedIn or GitHub.</p>
      <ul className="mt-6 flex flex-wrap gap-4">
        {profile.socials.map((s) => (
          <li key={s.id}>
            <GoldButton href={s.url} target="_blank" rel="noopener noreferrer">
              <Icon name={s.id} className="size-4" /> {s.label}
            </GoldButton>
          </li>
        ))}
      </ul>
    </Section>
  )
}

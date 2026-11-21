import { Frame } from '../components/ui/Frame'
import { Icon } from '../components/ui/Icon'
import { shownProjects, techById } from '../lib/content'
import { Section } from './Section'

// STUB (L08): L12 replaces this file with the lobby banners, pager and detail dialog.
export function Projects() {
  return (
    <Section id="projects" title="Projects" eyebrow={`${shownProjects().length} shipped`}>
      <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {shownProjects().map((p) => (
          <li key={p.slug}>
            <Frame tone="dim" className="grid h-full content-start gap-3 p-5">
              <img src={p.image} alt="" width={48} height={48} loading="lazy" decoding="async" className="size-12 object-contain" />
              <h3 className="hx-h3">{p.name}</h3>
              <p className="text-small">{p.tag}</p>
              <p className="text-small text-stone-400">{p.stack.map((id) => techById(id)?.name).join(' · ')}</p>
              <a href={p.link} target="_blank" rel="noopener noreferrer" className="hx-link inline-flex items-center gap-1.5 justify-self-start">
                Visit site <Icon name="external" className="size-4" />
                <span className="sr-only">: {p.name}</span>
              </a>
            </Frame>
          </li>
        ))}
      </ul>
    </Section>
  )
}

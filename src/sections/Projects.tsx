import { useEffect, useRef, useState } from 'react'
import { shownProjects } from '../lib/content'
import { parseHash } from '../lib/hash'
import { usePlayState } from '../lib/playStore'
import { Lobby } from './projects/Lobby'
import { ProjectDialog } from './projects/ProjectDialog'
import './projects/projects.css'

const shown = shownProjects()

/** Projects lobby + detail panel. Deep link #projects/<slug> opens the panel at load and on any hash change
 *  (banner links, other sections, Back/Forward); closing it restores the hash. Lenis can't resolve these
 *  hashes, so this hashchange listener owns them. */
export function Projects() {
  const [slug, setSlug] = useState<string | null>(null)
  const pushed = useRef(false) // opened by a hash change, so the panel has its own history entry
  const ready = usePlayState().name !== 'patching' // a cold deep link waits for the loader to finish

  useEffect(() => {
    const route = (cold: boolean) => {
      const r = parseHash(location.hash)
      const p = r?.section === 'projects' && r.item ? shown.find((x) => x.slug === r.item) : undefined
      if (r?.section === 'projects' && r.item && !p) history.replaceState(null, '', '#projects') // unknown or draft slug
      if (p) {
        pushed.current = !cold
        if (cold) document.getElementById('projects')?.scrollIntoView() // the lobby behind the panel
      }
      setSlug(p?.slug ?? null)
    }
    const onHash = () => route(false)
    route(true)
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])

  const close = () => {
    if (location.hash.startsWith('#projects/')) {
      if (pushed.current) history.back()
      else history.replaceState(null, '', '#projects')
    }
    // Opened at load there is no opener to return to: focus the project's banner.
    if (document.activeElement === document.body) document.querySelector<HTMLElement>(`#projects [data-slug="${slug}"]`)?.focus({ preventScroll: true })
    setSlug(null)
  }

  const project = shown.find((p) => p.slug === slug) ?? null
  return (
    <section id="projects" tabIndex={-1} aria-labelledby="projects-title" className="hx-section pj">
      <div className="pj__in">
        <header className="pj__head">
          <p className="hx-eyebrow">{shown.length} shipped</p>
          <h2 id="projects-title" className="hx-h2">
            Projects
          </h2>
        </header>
        <Lobby projects={shown} current={slug} />
      </div>
      <ProjectDialog project={project} open={!!project && ready} onClose={close} />
    </section>
  )
}

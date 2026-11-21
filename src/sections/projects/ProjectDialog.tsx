import { useState, type CSSProperties } from 'react'
import { GoldButton } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { Icon } from '../../components/ui/Icon'
import { TabPanel, Tabs } from '../../components/ui/Tabs'
import type { Project } from '../../content/projects'
import { LANES } from '../../content/tech'
import { techById } from '../../lib/content'
import { Emblem } from './Emblem'
import { hostOf } from './helpers'
import { TechChip } from './TechChip'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'stack', label: 'Stack' },
  { id: 'gallery', label: 'Gallery' },
]

/** Project detail: one native dialog under the header (a full-screen sheet below 768 px), tabs OVERVIEW, STACK, GALLERY. */
export function ProjectDialog({ project, open, onClose }: { project: Project | null; open: boolean; onClose: () => void }) {
  // The last project stays on screen while the panel closes.
  const [shown, setShown] = useState(project)
  if (project && project !== shown) setShown(project)
  return (
    <Dialog open={open} onClose={onClose} title={shown?.name ?? ''} className="pd">
      {shown && <Detail key={shown.slug} p={shown} />}
    </Dialog>
  )
}

function Detail({ p }: { p: Project }) {
  const [tab, setTab] = useState('overview')
  const accent = { '--accent': p.accent } as CSSProperties
  return (
    <>
      <span className="pj-crest pd__crest">
        <Emblem slug={p.slug} sizes="5rem" />
      </span>
      <p className="pd__tag">{p.tag}</p>
      <Tabs label={`${p.name} details`} items={TABS} value={tab} onChange={setTab} idBase="pd" className="pd__tabs" />
      {/* data-lenis-prevent: Lenis is stopped while a modal is open and would swallow wheel and touch scrolling here. */}
      <div className="pd__main" data-lenis-prevent="">
        <TabPanel idBase="pd" id="overview" value={tab} className="pd__panel">
          <p className="pd__desc">{p.description}</p>
          <h3 className="hx-eyebrow pd__label">Stack</h3>
          <ul className="pd__chips">
            {p.stack.map((id) => (
              <li key={id}>
                <TechChip id={id} named={false} />
                {techById(id)?.name}
              </li>
            ))}
          </ul>
          <div className="pd__live">
            <GoldButton href={p.link} target="_blank" rel="noopener noreferrer">
              Visit live site <Icon name="external" className="size-4" />
              <span className="sr-only"> (opens in a new tab)</span>
            </GoldButton>
            <span className="pd__host">{hostOf(p.link)}</span>
          </div>
        </TabPanel>
        <TabPanel idBase="pd" id="stack" value={tab} className="pd__panel">
          <ul className="pd__techs">
            {p.stack.map((id) => {
              const t = techById(id)
              return (
                t && (
                  <li key={id}>
                    <TechChip id={id} named={false} />
                    <div>
                      <p className="pd__tech">{t.name}</p>
                      <p className="pd__lane">{LANES[t.lane]}</p>
                      <p className="pd__blurb">{t.blurb}</p>
                    </div>
                  </li>
                )
              )
            })}
          </ul>
        </TabPanel>
        <TabPanel idBase="pd" id="gallery" value={tab} className="pd__panel">
          <figure className="pd__figure">
            <Emblem slug={p.slug} sizes="(min-width: 48rem) 22rem, 80vw" alt={`${p.name} logo`} className="pd__figure-art" />
            <figcaption>{p.name} logo</figcaption>
          </figure>
        </TabPanel>
      </div>
      {tab !== 'gallery' && (
        <div className="pd__splash" style={accent} aria-hidden="true">
          <Emblem slug={p.slug} sizes="20rem" className="pj-crest pd__splash-art" />
        </div>
      )}
    </>
  )
}

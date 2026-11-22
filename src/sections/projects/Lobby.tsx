import { useEffect, useEffectEvent, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent } from 'react'
import { Icon } from '../../components/ui/Icon'
import type { Project } from '../../content/projects'
import { DUR, gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '../../lib/motion'
import { Emblem } from './Emblem'
import { centreOut, lobbies } from './helpers'
import { TechChip } from './TechChip'

// Banners per lobby: 5 from 1280 px, 3 from 768 px, 1 on phones.
const QUERIES = [
  ['(min-width: 80rem)', 5],
  ['(min-width: 48rem)', 3],
] as const
const visibleNow = () => QUERIES.find(([q]) => matchMedia(q).matches)?.[1] ?? 1
function onVisibleChange(cb: () => void) {
  const lists = QUERIES.map(([q]) => matchMedia(q))
  lists.forEach((l) => l.addEventListener('change', cb))
  return () => lists.forEach((l) => l.removeEventListener('change', cb))
}

/** The new banners unroll from their rods one at a time, left to right as they stand on screen. `overwrite` kills a
 *  reveal still running on the same banners (a lobby change before the scroll reveal fired), so none is left half shown. */
function dropIn(row: HTMLElement) {
  const banners = [...row.querySelectorAll<HTMLElement>('.pb')].sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left)
  gsap.fromTo(
    banners,
    { opacity: 0, scaleY: 0.2 },
    { opacity: 1, scaleY: 1, duration: DUR.slower, ease: 'settle', stagger: 0.25, overwrite: true, clearProps: 'opacity,transform' },
  )
}

const step = (key: string) => (key === 'ArrowLeft' ? -1 : key === 'ArrowRight' ? 1 : 0)

/** The projects as lobbies of short banners, filled centre-out. Pager: arrows, dots, arrow keys, swipe on touch.
 *  `current` (the open project) brings its lobby up, so a deep link has its banner behind the panel. */
export function Lobby({ projects, current }: { projects: readonly Project[]; current: string | null }) {
  const visible = useSyncExternalStore(onVisibleChange, visibleNow)
  const [first, setFirst] = useState(0) // index of the shown lobby's first project; survives a change of `visible`
  const [synced, setSynced] = useState<string | null>(null)
  const [said, setSaid] = useState('')
  const row = useRef<HTMLUListElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const changed = useRef<'' | 'pager' | 'banner'>('') // why the lobby changed: animate it, refocus after a banner key press

  if (current !== synced) {
    setSynced(current)
    const i = projects.findIndex((p) => p.slug === current)
    if (i >= 0) setFirst(i - (i % visible))
  }

  const pages = lobbies(projects, visible)
  const page = Math.min(Math.floor(first / visible), pages.length - 1)
  const lobby = pages[page] ?? []

  const go = (to: number, from: 'pager' | 'banner' = 'pager') => {
    const next = (to + pages.length) % pages.length
    if (next === page) return
    changed.current = from
    setFirst(next * visible)
    setSaid(`Lobby ${next + 1} of ${pages.length}`)
  }
  const onKeys = (e: KeyboardEvent<HTMLElement>) => {
    const d = step(e.key)
    if (!d || pages.length < 2) return
    e.preventDefault()
    go(page + d, e.currentTarget.classList.contains('pb__link') ? 'banner' : 'pager')
  }
  const swipe = useEffectEvent((d: number) => go(page + d))

  // Reveal once at 20% in view. The row is hidden only while JS has armed it (base.css reveal gate).
  useGSAP((_, contextSafe) => {
    const el = row.current
    if (!el || !contextSafe) return
    if (prefersReducedMotion()) {
      el.dataset.reveal = 'done'
      return
    }
    el.dataset.reveal = 'armed'
    const reveal = contextSafe(() => {
      el.dataset.reveal = 'done'
      dropIn(el)
    })
    ScrollTrigger.create({ trigger: el, start: 'top 80%', once: true, onEnter: reveal })
  })

  useGSAP(
    () => {
      const from = changed.current
      if (!from || !row.current) return
      changed.current = ''
      if (!prefersReducedMotion()) dropIn(row.current)
      // The focused banner left with its lobby: carry focus to the new lobby's first project.
      if (from === 'banner') row.current.querySelector<HTMLElement>('[data-order="0"] .pb__link')?.focus()
    },
    { dependencies: [first, visible] },
  )

  // Swipe (touch and pen; mouse users have the arrows). The row follows the finger a little.
  useEffect(() => {
    const el = stage.current
    if (!el) return
    let id = -1
    let x0 = 0
    let y0 = 0
    let swiped = false
    const down = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return
      id = e.pointerId
      x0 = e.clientX
      y0 = e.clientY
      swiped = false
    }
    const move = (e: PointerEvent) => {
      const dx = e.clientX - x0
      if (e.pointerId !== id || Math.abs(dx) < Math.abs(e.clientY - y0)) return
      el.dataset.drag = ''
      el.style.setProperty('--drag', `${dx / 3}px`)
    }
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      id = -1
      delete el.dataset.drag
      el.style.removeProperty('--drag')
      const dx = e.clientX - x0
      if (e.type !== 'pointerup' || Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(e.clientY - y0)) return
      swiped = true
      swipe(dx < 0 ? 1 : -1)
    }
    // A swipe that ends on a banner must not open it.
    const click = (e: MouseEvent) => {
      if (!swiped) return
      swiped = false
      e.preventDefault()
      e.stopPropagation()
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('click', click, true)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('click', click, true)
    }
  }, [])

  const paged = pages.length > 1
  return (
    <>
      <div ref={stage} className="pj__stage">
        {paged && (
          <button type="button" className="pj__arrow" aria-label="Previous lobby" onClick={() => go(page - 1)} onKeyDown={onKeys}>
            <Icon name="chevron-left" />
          </button>
        )}
        <ul ref={row} className="pj__row" data-reveal="" aria-label={paged ? `Lobby ${page + 1} of ${pages.length}` : 'Lobby'}>
          {centreOut(lobby).map((p) => (
            <Banner key={p.slug} p={p} order={lobby.indexOf(p)} onKeyDown={onKeys} />
          ))}
        </ul>
        {paged && (
          <button type="button" className="pj__arrow" aria-label="Next lobby" onClick={() => go(page + 1)} onKeyDown={onKeys}>
            <Icon name="chevron-right" />
          </button>
        )}
      </div>
      {paged && (
        <div className="pj__pager">
          <span className="pj__count" aria-hidden="true">
            Lobby <b>{page + 1}</b> / {pages.length}
          </span>
          <div className="pj__dots">
            {pages.map((_, i) => (
              <button
                key={i}
                type="button"
                className="pj__dot"
                aria-label={`Lobby ${i + 1} of ${pages.length}`}
                aria-current={i === page ? 'true' : undefined}
                onClick={() => go(i)}
                onKeyDown={onKeys}
              />
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            {said}
          </p>
        </div>
      )}
    </>
  )
}

/** One short banner. The name is the link; its hit area covers the banner, and VIEW is its visible face. */
function Banner({ p, order, onKeyDown }: { p: Project; order: number; onKeyDown: (e: KeyboardEvent<HTMLElement>) => void }) {
  const chips = p.stack.slice(0, 3)
  const more = p.stack.length - chips.length
  return (
    <li className="pb" data-order={order} style={{ '--accent': p.accent } as CSSProperties}>
      <span className="pb__rod" aria-hidden="true" />
      <span className="pb__cloth" aria-hidden="true" />
      <div className="pb__body">
        <span className="pj-crest pb__crest">
          <Emblem slug={p.slug} sizes="(min-width: 48rem) 8rem, 10rem" />
        </span>
        <h3 className="pb__name">
          <a className="pb__link" href={`#projects/${p.slug}`} data-slug={p.slug} onKeyDown={onKeyDown}>
            {p.name}
          </a>
        </h3>
        <p className="pb__tag">{p.tag}</p>
        <ul className="pb__stack" aria-label="Stack">
          {chips.map((id) => (
            <li key={id}>
              <TechChip id={id} />
            </li>
          ))}
          {more > 0 && (
            <li className="pb__more">
              <span aria-hidden="true">+{more}</span>
              <span className="sr-only">{more} more</span>
            </li>
          )}
        </ul>
        <span className="hx-btn hx-btn--gold pb__view" aria-hidden="true">
          <span className="hx-btn__fx" />
          View
        </span>
      </div>
    </li>
  )
}

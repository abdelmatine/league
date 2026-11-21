import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { GoldButton, MagicButton } from '../components/ui/Button'
import { Frame } from '../components/ui/Frame'
import { Icon } from '../components/ui/Icon'
import { LANES, tech, type Lane } from '../content/tech'
import { mainsByUsage, projectsUsing, techById, techCount } from '../lib/content'
import { formatHash, parseHash } from '../lib/hash'
import { prefersReducedMotion } from '../lib/motion'
import { scrollToId } from '../lib/scroll'
import { stageStore, useStageScene } from '../lib/stageStore'
import { draftBeats, matches, pairedWith, techFromRoute, usageLabel, type LaneFilter } from './stack/data'
import { RoleGlyph } from './stack/glyphs'
import { armIntro } from './stack/intro'
import { playLockIn } from './stack/lockin'
import { TechMark } from './stack/TechMark'
import './stack/stack.css'

const LANE_IDS = Object.keys(LANES) as Lane[]
const FILTERS: LaneFilter[] = ['all', ...LANE_IDS]
const filterLabel = (f: LaneFilter) => (f === 'all' ? 'All lanes' : LANES[f])
const MAINS = mainsByUsage()
const isMain = new Set(MAINS.map((m) => m.tech.id))
/** Shown when nothing else is: the most used main. */
const FEATURED = MAINS[0].tech.id
const DEFAULT_MSG = 'Pick a technology to inspect'
const tile = (id: string) => document.getElementById(`cs-t-${id}`)

/** The stack screen, drafted like a game's pick screen: mains on the left, the selected technology on
 *  the splash (the shared 3D stage draws it on `view`), lane filters, search and the tile grid below,
 *  the projects that use it on the right. Deep link: #stack/<tech id>. */
export function Stack() {
  const root = useRef<HTMLElement>(null)
  const stageBox = useRef<HTMLDivElement>(null)
  const intro = useRef<{ skip: () => void } | null>(null)
  /** Selector to focus once the next render is in the DOM (the box it lives in may still be inert now). */
  const focusNext = useRef('')
  /** Bumped by every pick: a lock-in whose sheet is still on its way checks it before opening. */
  const run = useRef(0)
  const pending = useRef(false)
  useStageScene('stack', stageBox)

  const [selected, setSelected] = useState(() => techFromRoute(parseHash(location.hash)) ?? FEATURED)
  const [focusId, setFocusId] = useState(selected)
  const [filter, setFilter] = useState<LaneFilter>('all')
  const [query, setQuery] = useState('')
  const [locked, setLocked] = useState<string | null>(null)
  const [sheet, setSheet] = useState(false)
  const [message, setMessage] = useState(DEFAULT_MSG)
  const [live, setLive] = useState('')

  const sel = techById(selected)!
  const used = projectsUsing(selected)
  const visible = tech.filter((t) => matches(t, filter, query))
  const tabStop = visible.some((t) => t.id === focusId) ? focusId : visible[0]?.id
  const lockedTech = locked ? techById(locked) : undefined
  const pairs = pairedWith(selected)

  useEffect(() => stageStore.selectTech(selected), [selected])
  useLayoutEffect(() => {
    const target = focusNext.current
    if (!target) return
    focusNext.current = ''
    // Retry a few frames: under reduced motion base.css gives every element a 1 ms transition, so an
    // inherited visibility can still read hidden right after the box is shown.
    let tries = 6
    const go = () => {
      const el = root.current?.querySelector<HTMLElement>(target)
      el?.focus()
      if (el && document.activeElement !== el && tries--) requestAnimationFrame(go)
    }
    go()
  })

  /** `quiet`: the intro's own picks (no hash, no announcement, the draft keeps its header line). */
  function select(id: string, { quiet = false } = {}) {
    run.current++
    pending.current = false
    setSelected(id)
    setFocusId(id)
    setSheet(false)
    if (quiet) return
    setMessage(DEFAULT_MSG)
    history.replaceState(null, '', formatHash({ section: 'stack', item: id }))
    const t = techById(id)!
    setLive(`${t.name} selected. ${LANES[t.lane]}, ${usageLabel(projectsUsing(id).length)}.`)
  }

  function lockIn(id = selected) {
    if (sheet || pending.current || !root.current) return
    const t = techById(id)!
    const inGrid = root.current.querySelector('.cs-pick')?.contains(document.activeElement)
    const mine = ++run.current
    pending.current = true
    setSelected(id)
    setFocusId(id)
    setLocked(id)
    setMessage(`${t.name} locked in`)
    setLive(`${t.name} locked in. ${usageLabel(projectsUsing(id).length)}.`)
    history.replaceState(null, '', formatHash({ section: 'stack', item: id }))
    playLockIn(root.current, id, () => {
      if (run.current !== mine) return
      pending.current = false
      setSheet(true)
      if (inGrid) focusNext.current = '.cs-sheet__title'
    })
  }

  function pickAnother() {
    setSheet(false)
    setMessage(DEFAULT_MSG)
    focusNext.current = '.cs-grid [tabindex="0"]'
  }

  // Intro draft: skipped for a deep link and under reduced motion.
  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion() || techFromRoute(parseHash(location.hash))) return
    const run = armIntro(el, {
      beats: draftBeats(MAINS),
      onBeat: (id) => select(id, { quiet: true }),
      onMessage: setMessage,
      onDone: (played) => {
        intro.current = null
        select(FEATURED, { quiet: true })
        setMessage(DEFAULT_MSG)
        if (played) setLive('My five mains are locked in. Pick a technology to inspect.')
      },
    })
    intro.current = run
    return () => {
      run.dispose()
      intro.current = null
    }
  }, [])

  // Deep links: #stack/<id> at load, on any link to one, and on back/forward or a typed hash.
  useEffect(() => {
    const go = (id: string | null, scroll: boolean) => {
      if (!id) return
      intro.current?.skip()
      select(id)
      if (scroll) scrollToId('stack')
    }
    const onClick = (e: MouseEvent) => {
      const a = e.target instanceof Element ? e.target.closest('a[href^="#stack/"]') : null
      const id = a && techFromRoute(parseHash(a.getAttribute('href') ?? ''))
      if (!id || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      history.pushState(null, '', formatHash({ section: 'stack', item: id }))
      go(id, !root.current?.contains(a))
    }
    const onHash = () => go(techFromRoute(parseHash(location.hash)), true)
    document.addEventListener('click', onClick)
    addEventListener('hashchange', onHash)
    const first = techFromRoute(parseHash(location.hash))
    const raf = first ? requestAnimationFrame(() => scrollToId('stack')) : 0
    return () => {
      document.removeEventListener('click', onClick)
      removeEventListener('hashchange', onHash)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Grid: one tab stop, arrows move, Enter or Space selects (native button), Ctrl+Enter locks in.
  function onGridKey(e: KeyboardEvent<HTMLButtonElement>) {
    const id = e.currentTarget.dataset.id!
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      lockIn(id)
      return
    }
    const i = visible.findIndex((t) => t.id === id)
    const cols = getComputedStyle(e.currentTarget.closest('ul')!).gridTemplateColumns.split(' ').length
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols, Home: -Infinity, End: Infinity }[e.key]
    if (step === undefined || i < 0) return
    e.preventDefault()
    const next = visible[Math.max(0, Math.min(visible.length - 1, i + step))]
    setFocusId(next.id)
    tile(next.id)?.focus()
  }

  return (
    <section id="stack" ref={root} tabIndex={-1} aria-labelledby="stack-title" className="cs">
      <div className="cs-fx cs-glow" aria-hidden="true" />
      <div className="cs-fx cs-edge" aria-hidden="true" />

      {/* LEFT: the five mains, then the selected technology's details */}
      <div className="cs-left">
        <section className="cs-team" aria-labelledby="cs-team-h">
          <h3 id="cs-team-h" className="cs-colhead">
            My mains
          </h3>
          <ol className="cs-cards">
            {LANE_IDS.map((lane) => {
              const m = MAINS.find((x) => x.lane === lane)!
              return (
                <li key={lane} className="cs-card" data-tech={m.tech.id}>
                  <button
                    type="button"
                    className="cs-card__btn"
                    aria-label={`${m.tech.name}, ${LANES[lane]}, ${usageLabel(m.count)}`}
                    aria-pressed={selected === m.tech.id}
                    onClick={() => select(m.tech.id)}
                  >
                    <span className="cs-card__bar" aria-hidden="true" />
                    <span className="cs-card__pt" aria-hidden="true">
                      <span className="cs-card__well">
                        <TechMark tech={m.tech} className="cs-card__mark" />
                      </span>
                      <span className="cs-card__ring" />
                      <span className="cs-card__pop" />
                      <span className="cs-card__flash" />
                    </span>
                    <span className="cs-card__txt">
                      <b className="cs-card__name">{m.tech.name}</b>
                      <span className="cs-card__sub">
                        <RoleGlyph role={lane} />
                        <span className="cs-card__lane">{LANES[lane]}</span>
                        <span className="cs-card__count">· {usageLabel(m.count)}</span>
                        <span className="cs-card__declare">Declaring…</span>
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </section>

        <Frame as="section" tone="dim" corners className="cs-details" aria-labelledby="cs-details-h">
          <div className="cs-det__head">
            <span className="cs-det__crest" aria-hidden="true">
              <TechMark tech={sel} />
            </span>
            <div className="cs-det__id">
              <p className="cs-det__lane">
                <RoleGlyph role={sel.lane} />
                {LANES[sel.lane]}
              </p>
              <h3 id="cs-details-h" className="cs-det__name">
                {sel.name}
              </h3>
            </div>
          </div>
          <dl className="cs-det__stats">
            <div>
              <dt>Projects</dt>
              <dd className="hx-num">{used.length}</dd>
            </div>
            <div>
              <dt>Paired with</dt>
              <dd className="hx-num">{pairs.length}</dd>
            </div>
          </dl>
          <p className="cs-det__blurb">{sel.blurb}</p>
          <a className="hx-link cs-det__link" href={sel.url} target="_blank" rel="noopener noreferrer">
            Official site <Icon name="external" className="size-4" />
            <span className="sr-only">: {sel.name} (opens in a new tab)</span>
          </a>
        </Frame>
      </div>

      {/* CENTRE: timer, splash (3D anchor), filters + search + grid / build sheet, LOCK IN */}
      <div className="cs-centre">
        <header className="cs-timer">
          <p className="cs-msg">{message}</p>
          <div className="cs-timer__row" aria-hidden="true">
            <Wire />
            <span className="cs-bar cs-bar--l">
              <i className="cs-bar__glow" />
              <i className="cs-bar__fill" />
            </span>
            <span className="cs-num">
              <span className="cs-num__v" />
              <svg className="cs-num__inf" viewBox="0 0 40 20">
                <path d="M20 10c5.5-6.5 15-6.5 15 0s-9.5 6.5-15 0S10.5 3.5 5 10s9.5 6.5 15 0Z" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
            <span className="cs-bar cs-bar--r">
              <i className="cs-bar__glow" />
              <i className="cs-bar__fill" />
            </span>
            <Wire flip />
          </div>
        </header>

        <div className="cs-view">
          <div ref={stageBox} className="cs-stage" aria-hidden="true">
            <div className="cs-poster">
              <TechMark tech={sel} />
            </div>
            <div className="cs-flash" />
            <div className="cs-burst" />
          </div>
          <p className="cs-plate">
            <span className="cs-plate__lane">
              <RoleGlyph role={sel.lane} />
              {LANES[sel.lane]}
            </span>
            <b className="cs-plate__name">{sel.name}</b>
            <span className="cs-plate__count">{usageLabel(used.length)}</span>
          </p>
        </div>

        <div className="cs-box">
          <div className="cs-pick" inert={sheet}>
            <div className="cs-gridhead">
              <fieldset className="cs-filters">
                <legend className="sr-only">Filter by lane</legend>
                {FILTERS.map((f) => (
                  <label key={f} className="cs-filter hx-tip">
                    <input type="radio" name="cs-lane" value={f} checked={filter === f} onChange={() => setFilter(f)} className="sr-only" />
                    <RoleGlyph role={f} />
                    <span className="sr-only">{filterLabel(f)}</span>
                    <span className="hx-tooltip" data-side="bottom" aria-hidden="true">
                      {filterLabel(f)}
                    </span>
                  </label>
                ))}
              </fieldset>
              <p className="cs-count" aria-live="polite">
                {filterLabel(filter)} · {visible.length}
              </p>
              <label className="cs-search">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  <path d="m11 11 3.6 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
                </svg>
                <span className="sr-only">Search technologies</span>
                <input type="search" placeholder="Search" autoComplete="off" spellCheck={false} value={query} onChange={(e) => setQuery(e.target.value)} />
              </label>
            </div>
            <ul className="cs-grid" aria-label="Technologies" aria-describedby="cs-grid-help" style={{ '--n': tech.length } as CSSProperties}>
              {tech.map((t) => {
                const n = projectsUsing(t.id).length
                return (
                  <li key={t.id} hidden={!visible.includes(t)}>
                    <button
                      type="button"
                      id={`cs-t-${t.id}`}
                      aria-pressed={t.id === selected}
                      tabIndex={t.id === tabStop ? 0 : -1}
                      data-id={t.id}
                      data-main={isMain.has(t.id) ? '' : undefined}
                      data-locked={t.id === locked ? '' : undefined}
                      className="cs-tile"
                      onClick={() => select(t.id)}
                      onKeyDown={onGridKey}
                    >
                      <span className="cs-tile__pic">
                        <TechMark tech={t} />
                        {n > 0 && (
                          <span className="cs-tile__n" aria-hidden="true">
                            {n}
                          </span>
                        )}
                      </span>
                      <span className="cs-tile__ret" aria-hidden="true" />
                      <span className="cs-tile__name">{t.name}</span>
                      <span className="sr-only">
                        {isMain.has(t.id) ? ', main' : ''}, {usageLabel(n)}
                        {t.id === locked ? ', locked in' : ''}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
            {visible.length === 0 && (
              <p className="cs-empty">
                Nothing matches “{query.trim()}”.{' '}
                <button type="button" className="hx-link" onClick={() => setQuery('')}>
                  Clear the search
                </button>
              </p>
            )}
            <p id="cs-grid-help" className="sr-only">
              Arrow keys move between technologies. Enter selects. Control plus Enter locks in.
            </p>
          </div>

          <div className="cs-sheet" inert={!sheet} data-lenis-prevent>
            {lockedTech && (
              <>
                <div className="cs-sheet__head">
                  <h3 className="cs-sheet__title" tabIndex={-1}>
                    Built with {lockedTech.name}
                  </h3>
                  <GoldButton onClick={pickAnother}>Pick another</GoldButton>
                </div>
                {projectsUsing(lockedTech.id).length ? (
                  <ul className="cs-builds">
                    {projectsUsing(lockedTech.id).map((p) => (
                      <li key={p.slug} className="cs-build">
                        <a className="cs-build__name" href={`#projects/${p.slug}`}>
                          {p.name}
                        </a>
                        <ul className="cs-chips" aria-label={`${p.name} stack`}>
                          {p.stack.map((id) => (
                            <li key={id}>
                              <a href={`#stack/${id}`} className="cs-chip" aria-current={id === lockedTech.id ? 'true' : undefined}>
                                {techById(id)?.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="cs-empty">No listed projects yet.</p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="cs-lock">
          <svg className="cs-lock__wire" viewBox="0 0 480 48" aria-hidden="true">
            <path d="M8 24h120l12-10h20M332 24h-12l-12-10h-20M472 24H352l-12 10h-20" fill="none" stroke="currentColor" />
            <path d="M4 24l4-4 4 4-4 4Zm464 0 4-4 4 4-4 4Z" fill="currentColor" />
          </svg>
          <MagicButton size="lg" className="cs-lockbtn" aria-disabled={sheet || undefined} onClick={() => lockIn()}>
            {sheet ? 'Locked in' : 'Lock in'}
          </MagicButton>
        </div>
      </div>

      {/* RIGHT: the title, what it shipped alongside, then the projects that use it */}
      <div className="cs-right">
        <div className="cs-title">
          <h2 id="stack-title">Stack</h2>
          <p>
            Draft · {LANE_IDS.length} lanes · {techCount()} picks
          </p>
        </div>
        <section className="cs-pairs" aria-labelledby="cs-pairs-h">
          <h3 id="cs-pairs-h" className="cs-colhead">
            Paired with
          </h3>
          {pairs.length ? (
            <ol className="cs-cards">
              {pairs.slice(0, 4).map(({ tech: t, n }) => (
                <li key={t.id} className="cs-card cs-card--pair">
                  <button type="button" className="cs-card__btn" aria-label={`${t.name}, shipped together in ${usageLabel(n)}`} onClick={() => select(t.id)}>
                    <span className="cs-card__pt" aria-hidden="true">
                      <span className="cs-card__well">
                        <TechMark tech={t} className="cs-card__mark" />
                      </span>
                      <span className="cs-card__ring" />
                    </span>
                    <span className="cs-card__txt">
                      <b className="cs-card__name">{t.name}</b>
                      <span className="cs-card__sub">
                        <span className="cs-card__lane">{LANES[t.lane]}</span>
                        <span className="cs-card__count">· together in {n}</span>
                        <RoleGlyph role={t.lane} />
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p className="cs-empty cs-pairs__none">Not shipped with another listed technology yet.</p>
          )}
        </section>
        <Frame as="section" tone="dim" corners className="cs-skins" aria-labelledby="cs-skins-h">
          <header className="cs-skins__head">
            <h3 id="cs-skins-h">Projects with {sel.name}</h3>
            <span>{used.length || ''}</span>
          </header>
          {used.length ? (
            <ul className="cs-skins__list" data-lenis-prevent>
              {used.map((p) => (
                <li key={p.slug}>
                  <a className="cs-skin" href={`#projects/${p.slug}`}>
                    <span className="cs-skin__pic">
                      <img src={p.image} alt="" width={44} height={44} loading="lazy" decoding="async" />
                    </span>
                    <span className="cs-skin__txt">
                      <b>{p.name}</b>
                      <small>{p.tag}</small>
                    </span>
                    <Icon name="chevron-right" className="cs-skin__go" />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="cs-empty">No listed projects yet.</p>
          )}
        </Frame>
      </div>

      <div className="cs-banner" aria-hidden="true">
        <span className="cs-banner__rule" />
        <span className="cs-banner__txt">
          <b />
          <b className="cs-banner__glow" />
        </span>
        <span className="cs-banner__rule" />
      </div>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
    </section>
  )
}

function Wire({ flip = false }: { flip?: boolean }) {
  return (
    <svg className={`cs-wire${flip ? ' cs-wire--r' : ''}`} viewBox="0 0 56 24">
      <path d="M56 12H22l-6-6H6" fill="none" stroke="currentColor" />
      <path d="M50 15H26" fill="none" stroke="currentColor" opacity=".45" />
      <path d="m2 6 4-4 4 4-4 4Z" fill="currentColor" />
    </svg>
  )
}

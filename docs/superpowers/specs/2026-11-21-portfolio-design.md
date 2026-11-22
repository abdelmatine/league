# Portfolio rebuild: design spec

Task T20, written 2026-11-21. This spec turns `docs/DECISIONS.md`, the owner-question defaults (`docs/OWNER-QUESTIONS.md`) and the four hi-fi mockups (`.superpowers/hifi/`, local) into one build target for lots L05–L18.

**Status:** self-approved by Claude under the owner's instruction of 2026-11-21 to finish the whole backlog without stopping. The owner's review is still open. Every taste or content call below is a default the owner can change; most live in `src/content/`.

## 1. Goal and principles

A one-page portfolio for Abdelmatine Sfar that feels like a game client: dark navy, gold frames, teal energy, a 3D core, a PLAY button that reacts, a loader that "accepts a match", a stack screen that drafts technologies, and a contact flow that queues a message.

1. **Evoke, don't copy.** Every shape, ornament, value table and string is our own (DECISIONS → Legal). No Riot assets, names or fonts. No measured client geometry or value tables shipped as a set.
2. **Real content only.** Show only facts from the repo or the owner. Unknowns are hidden, never invented.
3. **Content first, effects second.** All text is in the HTML and readable without JS, WebGL or motion. 3D and animation are layered on top and degrade by tier.
4. **One of everything:** one canvas, one clock, one toast region, one easing table, one content folder.

## 2. Defaults applied (owner may change)

| Topic | Default |
|---|---|
| Fonts (C06) | Literata caps-only subset (display, 500–800) + Source Sans 3 Variable (body), self-hosted, versioned files |
| PLAY and tabs (C05) | Our own hexagon PLAY plate with teal text; main tabs: small pointer above + soft glow; secondary tabs: fading underline |
| Tabs (C07) | 4: HOME, PROJECTS, STACK, CONTACT. CAREER appears only when `career.ts` has entries |
| Contact flow (C04) | SEND starts it; message is sent first; queue card under the header profile; MATCH FOUND dialog (12 s) → ACCEPT → persistent toast; DECLINE/timeout just closes; header PLAY scrolls to the form |
| 3D logos (C08, C09) | 3D extrusion only for Angular and the JS shield. Others: flat, unaltered logo on our gold token, or a name monogram (React, React Native, Spring Boot, Java, Docker, PostgreSQL, Qt, C, C++) |
| Tiles (C11) | Brand-colour logos where allowed; gold monograms otherwise |
| Banner (C17) | Short lobby banner |
| Identity | "Abdelmatine Sfar", "Software Engineer · Full stack · Web & Mobile". No location, availability, years or CV until supplied |
| Projects | 8 shown; Fixed APP, E Commerce, E Books are `draft: true`. Ratings and ranks dropped |
| Counters | Projects shipped and technologies, both computed |
| Chat dock | Removed |
| Socials | GitHub, LinkedIn, Facebook, Instagram (status quo) |

## 3. Architecture

- Vite 8, React 19.3.1, TypeScript 7, Tailwind 4, oxlint. No router: one page plus `public/404.html`.
- three 0.187 + @react-three/fiber 9 + drei 10 + postprocessing, in one lazy chunk.
- GSAP 3.15 (core, ScrollTrigger, SplitText, CustomEase, `useGSAP`) + Lenis 1.3.
- `@emailjs/browser` for the contact form.
- Removed: react-router-dom, framer-motion, aos, swiper, react-simple-typewriter, react-toastify, emailjs-com, react-icons, lucide-react (own SVG icons instead).

```
index.html            inline loader (≤ 2 KB CSS+JS), <noscript> fallback, font preloads
public/fonts/         literata-caps-v1.woff2, source-sans-3-v1.woff2 (immutable)
public/404.html       static, styled, links home
src/main.tsx          mounts <App>, reports loader milestones
src/App.tsx           Header, <Stage> (lazy), sections, Footer, ToastRegion, dialogs
src/content/          profile.ts, projects.ts, tech.ts, career.ts: the only files the owner edits
src/styles/           tokens.css (@theme), base.css, components.css
src/lib/              motion.ts, scroll.ts, sfx.ts, playState.ts, tiers.ts, validate.ts,
                      loader.ts, hash.ts, stageStore.ts (+ *.test.ts next to each)
src/components/ui/    Frame, GoldButton, MagicButton, Divider, Tabs, Field, Toast, Crest,
                      Tooltip, Dialog, Counter, Icon
src/components/header/  Header, PlayButton, NavTabs, MobileDrawer, QueueCard, SoundToggle
src/components/footer/  Footer, CreditsDialog
src/components/stage/   Stage (Canvas), HeroCore, Particles, LogoMesh, Pedestal, quality
src/sections/         Hero, About, Projects/*, Stack/*, Contact/*, Career, Achievements
e2e/                  Playwright smoke + screenshots
```

Data flow: content files → pure helpers (counts, mains, lanes) → sections. Section 3D content talks to the shared canvas through `stageStore` (a tiny external store: active scene ids, DOM anchors, selected tech), never by mounting its own canvas.

## 4. Design tokens (our own values)

Values evoke the client's mood but form our own ramps. Tailwind `@theme` exposes them as utilities and CSS variables.

**Colour**

| Token | Value | Use |
|---|---|---|
| `ink-950` | `#01080F` | page |
| `ink-900` | `#03111C` | panels |
| `ink-800` | `#0A1B27` | raised panels, inputs |
| `ink-700` | `#13242F` | hover fills |
| `gold-50` | `#F3EAD6` | headings, active labels |
| `gold-200` | `#D1B47C` | primary gold, links |
| `gold-300` | `#C9A45A` | button borders |
| `gold-500` | `#87672F` | frame borders |
| `gold-700` | `#4A3918` | dim frame, dividers |
| `teal-100` | `#D3FAF6` | hot energy |
| `teal-300` | `#2FD0C4` | game actions |
| `teal-500` | `#0E98AE` | XP, progress |
| `teal-700` | `#0A5F7E` | deep energy |
| `teal-900` | `#08313F` | tracks |
| `stone-200` | `#ABA592` | body text |
| `stone-400` | `#7F7A6C` | muted text |
| `stone-600` | `#45443F` | disabled |
| `ruby-400` | `#DE4B60` | errors, decline |
| `jade-400` | `#3CCB86` | online / success |

Contrast: body `stone-200` on `ink-950` ≈ 8:1; muted `stone-400` ≈ 4.6:1 (AA for 14 px+ only); gold-200 on ink-950 ≈ 9.6:1.

**Type**

| Role | Font | Size / line | Notes |
|---|---|---|---|
| hero name | display 700 | clamp(44px, 8vw, 112px) / 0.95 | uppercase, tracking .02em |
| h2 section | display 700 | clamp(30px, 4vw, 44px) / 1.05 | uppercase |
| h3 | display 600 | 20–22 / 1.2 | uppercase |
| eyebrow / label | body 600 | 12 / 16 | uppercase, tracking .14em |
| body | body 400 | 16 / 26 | max 68ch |
| small | body 400 | 14 / 20 | |
| numbers (big) | display 700 | tabular-nums | timers, counters |

**Motion**

| Id | Curve | Use |
|---|---|---|
| `settle` | `cubic-bezier(.12,.8,.16,1)` | most entrances, hover-in glows |
| `show` | `cubic-bezier(.22,1,.36,1)` | dialogs, slot moves |
| `glow` | `cubic-bezier(.3,.1,.3,1)` | fades, hover-out |
| `snap` | `cubic-bezier(.95,0,.8,.4)` | hold-then-strike (lock-in flash) |
| `in` | `cubic-bezier(.6,0,.9,.5)` | exits |

Durations: `fast` 120 ms, `base` 200 ms, `slow` 320 ms, `slower` 480 ms, `glow` 640 ms. The same table feeds `@theme` (`--ease-*`, `--duration-*`) and `CustomEase.create` in `motion.ts`.

**Shape:** square UI, no radius except avatars and pills. Frames use a 1 px gold gradient border, a 1 px inner hairline and our own corner gem. Chamfers are 10 px. Spacing scale is Tailwind's default (4 px base).

## 5. Components

| Component | Spec |
|---|---|
| `Frame` | Section/panel container. Props: `tone` (gold, dim), `corners` (gems), `anchor` (which edge the gradient brightens). Content visible without JS; optional `buildIn` reveal (border draw + fade, 750 ms) via `frameBuildIn`. |
| `GoldButton` | Secondary actions. Dark fill, gold gradient border, hover brightens border and adds a sheen sweep; press scales .97. |
| `MagicButton` | Game actions only (PLAY plate, ACCEPT, LOCK IN, SEND, VIEW PROJECTS). Teal energy fill, gold rim, glow on hover, disabled = grey. |
| `Divider` | Gold hairline with a centre gem. |
| `Tabs` | `role=tablist` for in-section tabs (project dialog, stack filters); arrow keys move focus. Main nav uses links, not tabs. |
| `Field` | Label above, input/textarea, error line below (reserved height, no layout jump). Blur-first validation, instant clear on fix. |
| `Toast` | One `role=status` `aria-live=polite` region, bottom-right (bottom-centre on phones). Entrance grows vertically (scaleY .5 → 1, 480 ms settle). Contact result persists until closed; others close after 5 s. Max 3 stacked. |
| `Crest` | Round avatar, gold rim, XP ring (`--xp` 0–1), level pill. |
| `Tooltip` | CSS-only, shows on hover and focus after 150 ms. |
| `Dialog` | Native `<dialog>` + `showModal()`; `dialog { margin: auto }`. Focus returns to the opener. Esc closes. Full-screen sheet below 768 px. |
| `Counter` | Icon + tabular number + label. |
| `Icon` | Inline SVG sprite of our own glyphs (shield, star, trophy, gift, mail, link, github, linkedin, facebook, instagram, sound on/off, menu, close, arrows). Brand glyphs for socials are simple-icons paths (CC0), monochrome. |

## 6. Screens

### 6.1 Loader (L11)

Inline in `index.html` so it paints before any JS. A ring (our own SVG) fills on real milestones: HTML parsed 10%, fonts ready 35%, app mounted 60%, 3D chunk ready or skipped 90%, first frame 100%. Then the status text switches to "MATCH ACCEPTED" over "Waiting for other players", holds 400 ms, and the overlay scales/fades out (600 ms) while the header PLAY state goes patching → play. Failsafe: reveal at 10 s whatever happened. Returning visitors in the same session get a 600 ms version. Reduced motion: no ring animation, plain fade. `<noscript>` hides the loader. No sound.

### 6.2 Header (L08)

72 px bar (56 px below 768), `ink-950` at 88% with a blur that the G07 table can switch off per tier. Left: crest + PLAY plate. Centre: tabs HOME, PROJECTS, STACK, CONTACT (scroll-spy sets the active tab; it never writes the hash). Right: counters (projects shipped, technologies), sound toggle, profile crest with name and title. Below 768: crest, PLAY, menu button → drawer with the tabs, counters and socials. PLAY states: `patching` (loader progress), `play`, `queue` (m:ss), `found` (pulse), `accepted`. State machine in `lib/playState.ts`, unit tested.

### 6.3 Hero (L09, L10)

Full viewport. The shared canvas renders the core behind: hexagonal bipyramid crystal, fbm energy sphere, additive fresnel halo, two hex rings, rune ring, drifting particles, bloom; NEUTRAL tone mapping (G02 constants at MID). Name reveal by SplitText (chars rise and sharpen, 40 ms stagger), title line, CTAs VIEW PROJECTS (magic) and CONTACT (gold), scroll cue. Scroll pulls the camera back and dims the core as About enters. Without WebGL: a CSS poster (radial teal glow + gold ring drawn in CSS/SVG).

### 6.4 About (L16)

Part of the HOME tab. Profile card: crest with photo, name, title. One paragraph from `profile.ts` (placeholder flag shown only in dev). "Mains" row: the five lane mains with their project counts. Counters: projects shipped, technologies, lanes covered.

### 6.5 Projects (L12)

Lobby: short banners filled centre-out (the first project in the centre), 5 visible ≥ 1280, 3 ≥ 768, 1 on phones with swipe. Pager: arrows + dots, keyboard arrows. Banner: emblem (project image in a gold crest, or a monogram), name, one-line tag, up to 3 stack chips (+N), VIEW. Detail: one `<dialog>` under the header, tabs OVERVIEW (description, stack, live link), STACK (each tech with its lane), GALLERY (images we have). Deep link `#projects/<slug>` opens it at load and on click; closing restores `#projects`. Images: AVIF/WebP at display size with width/height set.

### 6.6 Stack (L13, L14)

Height `max(640px, calc(100svh - var(--hdr)))`, no pinning. Left column: MAINS (5 lanes). Centre: splash with the selected tech: 3D mesh on a pedestal for Angular and JS, our gold token with the flat logo or monogram for the rest; name, lane, "N projects". Below: lane filters (All, Frontend, Backend, Data, Mobile, Core), search, grid of tiles. Right column: projects that use the selected tech (the "skins"). LOCK IN: a 1.2 s timeline (snap flash, ring burst, tile locks, sfx), then the right column highlights. Intro draft: starts when the section is active and scrolling has stopped; skip on pointerdown/focus inside, a `#stack/<id>` hash, or reduced motion. Deep link `#stack/<id>` selects a tech.

### 6.7 Contact (L15)

Two lobby banners (owner ready, visitor slot that fills as fields validate) beside a framed form: name, email, message (10–1000 chars), honeypot. SEND → validate → send via EmailJS → header shows queue card (m:ss) → MATCH FOUND dialog with a 12 s ring and ACCEPT/DECLINE → ACCEPT shows the persistent toast "Message delivered". Send failure: inline error + toast, form keeps its text. Missing env vars: the button says sending is not set up and links LinkedIn/GitHub. Local rate limit: one message per 2 minutes. Social list below the form.

### 6.8 Career and Achievements (L16)

Career: loading-screen cards (one per role). Achievements: post-game screen. Both render only when their content arrays have entries; today they are empty, so neither shows and the CAREER tab is absent.

### 6.9 Footer and credits (L08)

Short non-affiliation notice, © year + name, socials, "Credits and legal" button → dialog with the full notice and the credit lines for marks actually shown (DECISIONS → Legal → Credits list).

### 6.10 404

Static `public/404.html` in the same palette, inline CSS, a link home. No JS.

## 7. 3D stage (L09, L14)

- One fixed `<Canvas>` behind the DOM, `frameloop="never"`. `gsap.ticker` calls `lenis.raf()` then `advance()`. Render only while a 3D zone is on screen (IntersectionObserver on hero and stack splash).
- Tiers by pixel budget: HIGH 2.4 MP, MID 1.2 MP, LOW 0.6 MP. Start tier from `tierPlan` (phones ≤ MID, desktop HIGH only on an allowlisted GPU). Custom monitor scores continuous frames only and never climbs back.
- Post: Bloom (mipmap, threshold 1) → Vignette → ToneMapping NEUTRAL, `multisampling 0`. No float buffers → no post, `gl.toneMapping = NeutralToneMapping`.
- Lazy chunk behind the CSS poster. Never load on Save-Data, no WebGL2, or a software GPU.
- Reduced motion: one still frame, no drift, no scroll camera, no parallax.
- Logos: Simple Icons path → SVGLoader → ExtrudeGeometry with an inward bevel, `toCreasedNormals`, cached; enamel face + gold sides; RoomEnvironment via PMREM on logo materials only; blob shadow. Built lazily (idle callback).

## 8. Motion rules

- Section reveals: `frameBuildIn` (border draw + content fade) once, at 20% in view. Content is visible without JS (`html.js` gates the hidden start state, plus a 3 s CSS failsafe).
- Hover: in `fast` + `settle`, out `slower` + `glow`. Hover glows only under `(hover: hover)`.
- Never animate layout properties; transform/opacity/filter only.
- Reduced motion: opacity-only, ≤ 200 ms; intro draft and camera moves skipped.

## 9. Sound (L17)

Raw Web Audio synthesis, about 2 KB, no files. Off by default; the header toggle turns it on and remembers the choice in `localStorage`. Cues: hover (tick), click, queue start, match found, accept, lock-in, decline. Unlock on the first gesture. Never set `navigator.audioSession.type`.

**2026-11-22:** superseded in part. The owner restored `public/sounds/inqueue.mp3` as optional looping music behind its own toggle (off on every visit, not stored), under the fan policy; see DECISIONS → Legal. The cues above stay synthesized.

## 10. Content model

```ts
type Lane = 'frontend' | 'backend' | 'data' | 'mobile' | 'core'
type LogoPolicy = 'extrude' | 'flat' | 'name'   // legal table
interface Tech { id: string; name: string; lane: Lane; logo?: string; policy: LogoPolicy; url: string; blurb: string; credit?: string }
interface Project { slug: string; name: string; tag: string; description: string; image: string; link: string; stack: string[]; draft?: boolean }
interface Profile { name: string; title: string[]; about: string[]; aboutIsPlaceholder: boolean; photo: string; socials: Social[]; cvUrl?: string; mains: Record<Lane, string> }
interface CareerEntry { company: string; role: string; start: string; end?: string; points: string[] }
```

Helpers (unit tested): `shownProjects`, `projectsUsing(techId)`, `techCount`, `mainsByUsage`, `lanes`.

## 11. Accessibility

- Landmarks: header, main, footer; one h1 (the hero name); sections labelled by their h2.
- Keyboard: every control reachable; visible gold focus ring; skip link to main; dialog focus trap via native modal; Esc closes.
- Live regions: the toast region; the queue state announced once; the match-found dialog is `role=alertdialog` with a description.
- Colour contrast ≥ 4.5:1 for text under 18 px.
- `prefers-reduced-motion` honoured everywhere (§8). Sound off by default.
- Images have alt text; decorative SVG is `aria-hidden`.

## 12. Performance budgets

| Budget | Value |
|---|---|
| Eager JS | ≤ 170 kB gz |
| Lazy 3D chunk | ≤ 310 kB gz |
| CSS | ≤ 20 kB gz |
| Fonts | ≈ 50 KB |
| LCP (first visit, loader included) | ≤ 2.5 s |
| CLS | ≤ 0.1 |
| Lighthouse accessibility | ≥ 0.95 |

## 13. Legal rules in code

- `tech.ts` carries the logo policy per mark; components never extrude a mark whose policy is not `extrude`.
- The credits dialog lists only the marks shown.
- No "League of Legends", "LoL", "Riot" or "Hextech" outside the footer notice and credits. A Vitest test greps `index.html`, `src/` and `public/404.html` for them (footer and credits files excepted).
- Copy uses generic game verbs only (PLAY, ACCEPT, DECLINE, LOCK IN, MATCH FOUND, IN QUEUE).

## 14. Testing (L05)

- Vitest (node env): playState, tiers, validate + rate limit, hash parsing, content helpers, loader milestones, banned-words test.
- Playwright: boots clean (no console errors), all sections attached, hero screenshot with the canvas masked, contact flow with EmailJS stubbed by `page.route`, keyboard path through the header, 404 status. Runs against `vite preview` locally and against Vercel previews in CI (`deployment_status`, bypass secret).
- `vercel-build`: `oxlint && tsc -b && vitest run && vite build`.

## 15. Lot map

| Lot | Delivers |
|---|---|
| L05 | Vitest, Playwright config + smoke, CI workflow, gated `vercel-build` |
| L06 | tokens.css, fonts, base.css, Frame, GoldButton, MagicButton, Divider, Icon, dev kit page (`?kit`) |
| L07 | Tabs, Field, Toast, Crest, Tooltip, Dialog, Counter, motion.ts, sfx.ts |
| L08 | Header (+PLAY machine, scroll-spy, drawer, queue card), Footer, credits dialog, content files, App shell; old Navbar/Sidebar/ChatBox removed |
| L09 | Stage, tiers, monitor, HeroCore, particles, poster, lazy chunk |
| L10 | Hero content, SplitText reveal, camera pull-back, section reveals; old Hero removed |
| L11 | Inline loader + milestones + failsafe; LCP/CLS measured |
| L12 | Projects lobby + detail dialog + deep links + image optimisation; old MainSection removed |
| L13 | Stack 2D: columns, filters, search, tiles, intro draft, deep link; old Stack removed |
| L14 | Stack 3D: logo meshes, pedestal, LOCK IN timeline, credits |
| L15 | Contact flow + EmailJS; old Contact removed |
| L16 | About, Career, Achievements (content-gated) |
| L17 | Sound cues wired |
| L18 | a11y, reduced motion, budgets, mobile QA, meta/OG, 404 |

## 16. Open for the owner

Everything in `docs/OWNER-QUESTIONS.md` marked "Default (Claude, 2026-11-21)"; the strict-logo vs accept-risk legal call; T03 (skills); L19 (history purge); push and merge of every lot.

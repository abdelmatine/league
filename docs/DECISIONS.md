# Decisions

Written 2026-11-16 by task T01. This is the single decision log for the rebuild.

It has one row for each of the 18 contradictions and 10 gaps found by the critic (`docs/checkpoints/critic-result.json`). No new research was done. Each row points to the report section that supports it.

Status values:

- **decided**: settled by a report. Build to it.
- **owner**: a taste or content call. The question is in `docs/OWNER-QUESTIONS.md`.
- **spike in lot LNN**: needs a measurement in real code. Do it first in that lot.
- **T04**: waits for the legal check.

**2026-11-21:** every row marked **owner** now has a working default, taken from `docs/OWNER-QUESTIONS.md` ("Default (Claude, 2026-11-21)") and applied in the design spec `docs/superpowers/specs/2026-11-21-portfolio-design.md` §2. The owner can still change any of them. Two later rules override older rows: the easing table in C13 is replaced by our own curves (spec §4), because the legal section says not to ship the client's easing and timing values as a set; C12 is settled by the legal section (no measured client outlines in production).

Report names are short for `docs/research/2026-11-09-<name>.md`. "gap-results" is `docs/checkpoints/gap-results.json`.

## Fonts, copy and naming

T09 can apply this section without reading the tables.

**Fonts: owner pick pending** (row C06).

- Option A, the report pick: Literata 600–700 for display, Source Sans 3 Variable for body.
- Option B, the mockup: Marcellus SC for display, Barlow for body.
- T09 should show both in the kit so the owner can compare.

These font rules are decided whatever the pick (type-sound-legal §0.1–0.4):

- Display text is always uppercase.
- Never set numbers in Marcellus or Marcellus SC. Its figures hang and are not tabular. This covers counters, timers and the Match Found title.
- Timers and big counters use the display face with `font-variant-numeric: tabular-nums`.
- Small counters use the body face.
- Fonts are self-hosted. No Google Fonts request. No Beaufort, no Spiegel.
- The Literata subset is capitals only and upright. Italic and mixed-case roles cannot use it. Where they go is open until the font pick (row C06).

**Banned nouns in UI copy** (type-sound-legal §C.3–C.4, BACKLOG rule 6):

- Summoner, Honor, RP / Riot Points, LP, Clash, Hextech, Rift, Runeterra, Arcane, TFT, LoL, Blue / Orange Essence, and champion names from the game.
- Known offenders to remove:
  - the mockup form label "Summoner name"
  - "honor ceremony" cards and the "Honor" emblem
  - the "LP-style card"
  - the RP/LP counters in the current header

**Banned words in headings and metadata** (type-sound-legal §0.6):

- "League of Legends", "LoL", "Riot" and "Hextech".
- This covers the page title, meta tags, OG tags, headings, the repo description and repo topics.

**Other copy rules:**

- No Riot assets of any kind: art, icons, logos, client images, videos, sounds, fonts.
- No Riot-API features (type-sound-legal §0.6).
- The footer carries the non-affiliation line from type-sound-legal §C.6. It does not use Riot's "Legal Jibber Jabber" notice.
- Client strings such as "MATCH FOUND" and "WAITING FOR OTHER PLAYERS" are not cleared yet. They wait for T04 (row G09). Mockups may use them for now.

## Contradictions

| ID | Question | Decision | Source | Status |
|---|---|---|---|---|
| C01 | Loader: which sequence, milestones, caps, minimum show time, skip threshold and exit? | Not settled. Fixed so far: drop the "textures", "audio" and "data" gates, because they can never resolve. Loader sound cues are dropped (C15). The status text follows the client order: "MATCH ACCEPTED" over "WAITING FOR OTHER PLAYERS". Whether those exact strings may ship waits for T04 (G09). All timings wait for the G01 measurement. | critic-result contradiction 1; ready-check §0.2 | spike in lot L11 |
| C02 | React 18 with fiber 8, or React 19 with fiber 9? | React 19 set, exact pins: react and react-dom 19.3.1, three 0.187.0, fiber 9.8.2, drei 10.7.9, @react-three/postprocessing 3.2.2, postprocessing 6.39.6, gsap 3.15.1, @gsap/react 2.1.2, lenis 1.3.27. Remove champ-select's React 18 pins. Re-test LogoChampion on fiber 9 under StrictMode in L14. | webgl-magic §0.1; stack-modernization §0.3; threejs-skill §Decision | decided |
| C03 | Tone mapping: AgX or NEUTRAL on the shared canvas? | NEUTRAL everywhere. No per-section switch. The core constants are re-tuned (see G02). | gap-results gap:1; 3d-logos §0.5 | decided |
| C04 | Contact flow: what triggers it, where the queue timer lives, is ACCEPT a required click, which success screen, what the header PLAY button does? | Not settled. One storyboard, signed off by the owner at the mockup review (T12, T14). Known fact: the client ring shows no number (ready-check §0.1), so the mockup's "8" is our own idea. | critic-result contradiction 4; ready-check §0, §16; shell-lobby §3.3, §4.3 | owner |
| C05 | PLAY button and main tabs: client-accurate (arrow plate, pointer and glow) or the mockup (hexagon, fading underline)? | Not settled. Fact: the client uses both tab styles. Main tabs get the pointer and glow. Secondary tabs get the fading underline. The exact arrow outline also waits for T04 (C12). | shell-lobby §0; gap-results gap:5 §0 | owner |
| C06 | Fonts: Literata + Source Sans 3, or Marcellus SC + Barlow? Where do italic roles go? | Report pick is Literata + Source Sans 3. The owner approves after an A/B in the mockups. The number rules in the summary above hold either way. Italic and mixed-case roles are settled in T20 after the pick. | type-sound-legal §0.1–0.4; critic-result contradiction 6 | owner |
| C07 | Sections, nav labels (4 or 5 tabs), chat dock, and what each counter means? | Not settled. Facts: about, experience, education, CV and counter content does not exist yet. `projects.ts` has 11 entries, not 12. | codebase-audit §12; shell-lobby §0; critic-result contradiction 7 | owner |
| C08 | 3D logos: which build pipeline, material, lighting and shadow? | Pipeline, lighting and shadow follow 3d-logos. Simple Icons paths copied into `src/data/logos3d.ts`. Sanitize, extrude with an inward bevel, `toCreasedNormals`, `mergeGroups`, flip and scale on the mesh. Build at runtime and cache. `RoomEnvironment` through PMREM on logo materials only. Blob shadow, no `ContactShadows`, no drei presets. Look: 3d-logos picks enamel face with gold sides. The owner confirms that against all-gold with a brand halo. | 3d-logos §0.1, §0.3, §0.4, §0.6, §0.9 | owner |
| C09 | React, React Native, C and C++ logos: which shapes? | React and React Native use the extruded Simple Icons outline. Never a scaled torus. C and C++: hexagon mark or letter-only mark is the owner's call. | 3d-logos §0.1; critic-result contradiction 9 | owner |
| C10 | Frame loop and DPR: which model? | One clock: `gsap.ticker` → `lenis.raf()` → `advance()`, with `frameloop="never"`. Budget pixels, not DPR: 2.4, 1.2 and 0.6 MP. Delete the demand and `invalidate()` advice. Reduced motion renders one still frame, with no drag to rotate. Tier changes use the custom monitor from G04, not drei `PerformanceMonitor`. | webgl-magic §0.3, §0.7, §0.9; gap-results gap:3 | decided |
| C11 | Champions: how many, which are "mains", which 2D tile style? | Not settled. The owner fixes the list and the mains. Then L14 extends `LOGOS3D` to every listed technology and re-budgets the build. The 154 ms budget covers 11 logos only. | 3d-logos §0.1, §0.3; codebase-audit §12.7; critic-result contradiction 11 | owner |
| C12 | May measured client outlines ship as they are (PLAY arrow path, LOCK IN polygon)? Is the UI copy clean? | Copy part is decided: apply the banned-noun list in the summary above. Geometry part waits for the legal check. Until then, mockups may use the measured shapes. Production code may not. | type-sound-legal §0.6, §C.3–C.4; critic-result contradiction 12 | T04 |
| C13 | Easing names: "settle" and "slam" mean different curves in four reports. | One easing table feeds both Tailwind `@theme` and `CustomEase.create`. Base ids: `snap` 1,0,1,1; `settle` 0,0,0,1; `show` .2,.9,0,1; `glow` 0,0,.33,1. Champ-select's special curves get their own ids. The full table is written in T20 and built in L06. | critic-result contradiction 13 | decided |
| C14 | Toast: entrance, lifetime, size, position? | One `aria-live` `role=status` region. Entrance grows vertically (scaleY .5 → 1, 500 ms), bottom-right, 422×135. The contact result stays until the visitor closes it (WCAG 2.2.1). Other toasts dismiss after 5 s. Stacking is written in T20. | stack-modernization §0.5; shell-lobby §9.2; ready-check §17; critic-result contradiction 14 | decided |
| C15 | Sound: recorded clips or synthesis? Which cues? | Synthesize every cue with raw Web Audio. No audio files. Sound is off by default and unlocks on the first click or keydown. Remove `use-sound`, `howler` and `inqueue.mp3`. Loader cues are dropped, because no gesture has happened yet. Base cues: hover, click, matchFound, lockIn, hum. The phase stinger and slash are added to the synth in L17 only if the champion-select design keeps them. | type-sound-legal §0.5, §B | decided |
| C16 | Cache headers: is `/assets/(.*)` safe to mark immutable? | No. Set `build.assetsDir` to `_app`. Only `/_app/(.*)` and versioned `/fonts/*-vN.woff2` are immutable. Never ship the `/assets/(.*)` rule. | stack-modernization §0.9, §9 | decided |
| C17 | Project banner: mockup 150×260 or client 196×592? How much content per banner? | Not settled. It depends on the project data the owner supplies. No project metrics exist today. Choose at the mockup review (T13, T14). | shell-lobby §5.1–5.2; codebase-audit §4.1 | owner |
| C18 | Linter: keep ESLint or move to oxlint? | oxlint 1.93.0. Drop ESLint, because typescript-eslint cannot run on TypeScript 7. In L03, confirm oxlint has `react/jsx-no-target-blank` and enable it. | stack-modernization §0.2 | decided |

## Gaps

The critic lists gaps in order. G01 is the first. The labels in gap-results count from zero, so `gap:1` there is G02 here.

| ID | Question | Decision | Source | Status |
|---|---|---|---|---|
| G01 | Loader: real first-visit timeline, valid milestones, Core Web Vitals? | Not measured. L11 measures a scratch build first and then fixes the milestone list, timeouts, minimum show time, skip threshold, cap and exit. Target: LCP at or below 2,500 ms. | critic-result gap 1; stack-modernization §10.4 | spike in lot L11 |
| G02 | One tone-mapping operator for the HDR core and the brand-colour logos? | NEUTRAL. Composer: `ToneMapping` mode NEUTRAL, last. LOW tier: `gl.toneMapping = NeutralToneMapping` on the Canvas. Core constants at MID: energy 0.63, veins ×5.5, halo 2.7, fake glass opacity 0.50. LOW has its own constants and a CSS vignette. Pre-warm the LOW programs during the loader. Not checked: one GPU only, HIGH tier not re-tuned. Verify both in L09. L09 builds the core with our own shaders (custom facet glass and gold, no environment map), so these constants were re-tuned by eye against the home mockup: `LOOK` in `src/components/stage/core.ts`. Instead of pre-warming LOW during the loader, a tier change compiles its programs with `compileAsync` while the last frame stays on screen, then draws. | gap-results gap:1 | decided |
| G03 | Gold-frame section reveal: timeline, technique and cost? | Not specified. Fixed so far: content is visible without JS, and there is a reduced-motion variant. L06 prototypes the border draw-on and measures it over the canvas. | critic-result gap 3; codebase-audit §0.7 | spike in lot L06 |
| G04 | Adaptive quality: tier sampling under gated rendering, mobile and Safari limits? | Delete drei `PerformanceMonitor`. Use the custom monitor that scores only continuous frames. Never climb back after a decline. Starting tiers come from `tierPlan`: phones cap at MID, desktops reach HIGH only on the GPU allowlist. Use HalfFloat targets only. With no float buffers, skip post-processing. That fallback uses NEUTRAL too (G02 overrides the AgX note in the answer). Not checked on real hardware: the answer used a simulated loop, and only the Intel iGPU was ever measured. Test on real phones and a Mac in L18. | gap-results gap:3 | decided |
| G05 | Champion Select inside a Lenis page: intro start and skip, pinning, heights, layout shift, deep links? | Start the intro when the zone is active and Lenis has stopped scrolling. Skip only on pointerdown or focus inside the section, a `#stack/<id>` hash at load, or reduced motion. No pinning. Height: `max(640px, calc(100svh - var(--hdr)))`. The grid and build sheet share one reserved box, so there is no layout shift. Read the splash rect every frame. Deep links use a small router. The scroll-spy never writes the hash. Not checked: Safari, Firefox, real phones. | gap-results gap:4 | decided |
| G06 | Project detail view and full project grid: which client screen, what sizes? | Follow the client's champion details panel. One native `<dialog>`, full width under the header, full-screen sheet below 768 px. Tabs: OVERVIEW, FEATURES, GALLERY. The "ALL" grid follows the Collection grid. Deep link: `#projects/<slug>`, handled by our own click handler, because Lenis cannot resolve it. Sizes and data fields are in the answer, §2 and §4. | gap-results gap:5 | decided |
| G07 | Cost of DOM effects over the live canvas (header blur, PLAY swirl, conic border, text-shadow pulse)? | Measured in L09 on the Intel UHD iGPU (0x9B41), Chromium headed and GPU-enabled headless, tier pinned with `?tier=`, 5 s of rAF intervals per case. MID: the 12 px header blur and the PLAY effects (patching spin, found glow) cost nothing measurable, 59.2–60 fps in every combination at 1440×900 and 1920×1080. LOW: 60 fps the same way. HIGH: 43–50 fps on this iGPU with or without the blur (GPU-bound at 8–16 ms per frame), which is why only allowlisted GPUs start there. Table, applied by the stage through `--hdr-blur` (`TIERS[tier].hdrBlur` in `src/lib/tiers.ts`): HIGH 12 px, MID 12 px, LOW 0 px (phones and demoted devices; the bar keeps its 88 % ink fill); no canvas (poster only): the CSS default, 12 px. PLAY effects stay on at every tier; reduced motion already stops them. Not measured: Safari, Firefox, real phones (L18). | L09 measurement | decided |
| G08 | Original ornament and glyph kit: inventory and construction rules? | Not written. All ornaments are our own SVGs. L06 writes the construction rules before drawing any. How close they may sit to the client's shapes waits for T04. | critic-result gap 8; shell-lobby §12 | spike in lot L06 |
| G09 | Legal limits on copying the client GUI and on 3D framework marks? | Not answered. T04 runs one research pass and fills the Legal section below. The owner's country is needed first. | critic-result gap 9; type-sound-legal §C | T04 |
| G10 | Project evidence: do links resolve, which stack does each site run, screenshots, image pipeline? | Not done. The owner confirms links, stacks and permissions in the form. L12 checks the links, takes the screenshots and picks the image tool for Vite 8. | critic-result gap 10; codebase-audit §4.1, §12.6 | spike in lot L12 |

## Legal

Not legal advice.

Research pass of 2026-11-16. "Unconfirmed" means the claim was not read on a primary source in this pass. "[inf]" means our own inference, not a quoted rule.

Second pass, same day: a checker re-fetched the primary pages for Riot, Angular, Simple Icons (licence and disclaimer), Python, Flutter, TypeScript, Spring, Meta, Docker, Qt, isocpp and logo.js. The quotes in this file match those pages, except where a row now says otherwise. Oracle and the OpenJDK Duke pages returned 403 again. They stay unconfirmed.

### Where we stand

- The publisher's fan policy ("Legal Jibber Jabber", last updated August 2018) licenses the use of Riot IP for non-commercial community projects. It says nothing about copying the look, layout or style of the client UI.
- The policy forbids Riot logos and trademarks anywhere in a project (§5), forbids commercial projects (§2), and requires a notice that says the project uses "assets owned by Riot Games" (§6).
- §5 reads: "Unless you have a written license agreement with us, you may not use any of our logos or trademarks anywhere in your Project". §5 also bars domain names and social accounts that use Riot's names.
- §3 asks people not to take "any part of our IP (e.g., character appearance, character abilities, maps, icons, items, etc.)" for games or apps. Icons and items are named. UI layout and style are not.
- Silence is not permission. The policy does not say that copying the UI look is allowed. It only does not address it [inf].
- We ship zero Riot assets, so we do not rely on that licence. Its notice would be false for us, so we do not print it [inf].
- Our footer names "League of Legends" and "Riot Games" in plain text. The policy does not cover that (§5). It rests on plain descriptive use of a name to say what the site is not, which is our reading, not a rule we read [inf] (unconfirmed). The owner must accept this or drop the names from the footer.
- Copyright risk comes from copying specific expression: artwork, sprites, ornament paths, icons, sounds, fonts, exact strings in bulk. Style, colour palettes, generic frames and layout ideas are generally not protected on their own (unconfirmed; case law not opened, see "Not confirmed").
- Trade dress and passing-off risk comes from confusion: a visitor thinking the site is official or endorsed. The answer is clear own branding plus the non-affiliation notice [inf] (unconfirmed).

### Do

- Draw every shape ourselves. Evoke the mood: dark navy, gold rules, angular frames, serif caps.
- Change proportions and geometry on purpose. Do not reuse the client's measured values (arrow arc radius, clip-path polygons, the 215/840/225 grid, easing and timing tables) as a set [inf].
- Use generic game verbs: PLAY, ACCEPT, DECLINE, LOCK IN, MATCH FOUND.
- Put the owner's name and "portfolio" first in the header, title and meta tags.
- Show the non-affiliation notice in every page footer, in plain text, not behind a toggle.
- Use each tech logo unaltered, from the owner's official files, in its official colours, with clear space, smaller than our own branding. Link each logo to the project's home page.
- Build gold or 3D extruded versions only for marks whose terms allow changes: Angular (CC BY 4.0), the community JS logo (MIT). Do not build Duke until its licence is confirmed (see the Duke row). For every other tech, extrude our own neutral token (a plain gold plinth or a text monogram in our own font) and show the unaltered official logo flat on it, or the name as text [inf].
- Keep a "Credits and legal" page, linked from the footer, with the full credits list below.
- Keep the repo description and topics free of the game's and publisher's names.

### Don't

- No Riot art, icons, logos, client images, videos, sounds, or Beaufort/Spiegel fonts. No traced ornament paths.
- No "League of Legends", "LoL", "Riot" or "Hextech" in titles, meta tags, headings, domain, repo name or handles. One plain-text mention in the footer notice only.
- No Riot nouns in UI copy: Summoner, Honor, RP/LP, Clash, champion names. No gem that reads as the Arcane Hextech crystal [inf].
- No pixel-faithful rebuild of a full client screen. No copying of Riot's CSS or JS values wholesale [inf].
- No live rank or match widgets from the Riot API.
- No recoloured, gold-plated, bevelled, distorted or animated-into-new-shapes versions of: React, React Native, Spring, Flutter, Qt, TypeScript, Python, C++, Node.js, Docker, Kubernetes, PostgreSQL, MongoDB, Java.
  - Two of these are stricter than the page text. TypeScript's page only forbids changing the shape; it does not mention colour. Python's page says colour-only changes need PSF permission and "are likely to be approved" when the shape is unaltered. A bevel or 3D extrusion changes the shape in our reading [inf], so both stay on this list. A flat gold recolour of Python is possible only after asking the PSF.
- No Java coffee-cup logo at all. No Spring leaf logo and no Docker whale without written permission.
- No tech logo in the masthead, favicon or OG image. No tech logo combined with our own logo.
- Do not use Simple Icons' single-colour redraws as a way around a brand's "do not alter" rule. The CC0 licence covers the collection, not the brands' trademark rights.
- Do not state or imply that any brand endorses the site.

### Per-mark table

Marks in `src/data/stacks.ts` first, then the extra marks planned for the stack screen.

| Mark | Owner | Licence or guideline | May we show the logo? | May we alter / extrude? | Credit line needed |
|---|---|---|---|---|---|
| Angular | Google LLC | https://angular.dev/press-kit (logo files CC BY 4.0) | Yes | Yes. Page: "When adapting the logo, you are free to change and adapt the colors and shape to make it your own." Avoid the former logo and the AngularJS logo (page advises against both). CC BY 4.0 is a copyright licence; it does not license the trademark, so do not imply endorsement [inf] | Yes. The page gives no credit wording. The duty comes from CC BY 4.0 itself: credit, licence link, note of changes |
| React | Meta Platforms, Inc. | https://opensource.fb.com/legal/trademark/ | Name: yes. Logo: policy allows the name "but not the stylized wording or the logo" without written permission. Common practice differs; risk is ours | No | None required by the page. Add notice anyway |
| React Native | Meta Platforms, Inc. | Same as React | Same as React (uses the same atom logo) | No | Same as React |
| Spring Boot | Broadcom Inc. and/or its subsidiaries | https://spring.io/trademarks | Name: yes. Logo: no. "Use of any Spring Marks logo is reserved solely for use by Broadcom" | No | "Spring is a trademark of Broadcom Inc. and/or its subsidiaries." Use ® on first use |
| Flutter | Google LLC | https://docs.flutter.dev/brand | Yes, on a personal site, not as the primary element | No. "Don't alter, distort, or modify"; no colour variations | Yes, exact sentence (see credits). Use ™, never ® |
| Qt | The Qt Company Ltd | https://www.qt.io/trademark/ | Only the unmodified logo for a product built with Qt (§1.3, §1.4). A skills list is not clearly covered: use the name, or ask | No (§2.10) | "Qt is a registered trademark of The Qt Company Ltd. and its subsidiaries." ® on first use |
| JavaScript (JS shield) | Logo: JSConf community logo. Word "JavaScript": Oracle (unconfirmed) | https://github.com/voodootikigod/logo.js (MIT) | Yes | Yes (MIT) | MIT notice on the credits page. Word-mark credit to Oracle (unconfirmed wording) |
| TypeScript | Microsoft | https://www.typescriptlang.org/branding/ | Yes. Page allows "general marketing for yourself" | No shape change: don't "Modify the shape of the logos when used". Colour change is not addressed by the page; we keep white TS on blue as a cautious reading [inf] | None stated. Add notice anyway |
| Java (cup logo) | Oracle | https://www.oracle.com/legal/logos/ and https://www.oracle.com/legal/trademarks/ (both returned 403; unconfirmed) | No. Oracle logos need a licence (unconfirmed, search snippet only). Use the word "Java" | No | "Oracle, Java, MySQL, and NetSuite are registered trademarks of Oracle and/or its affiliates. Other names may be trademarks of their respective owners." (unconfirmed, search snippet) |
| Duke (Java stand-in) | Oracle / OpenJDK | https://wiki.openjdk.org/display/duke/Main (403 twice; BSD licence unconfirmed). The GitHub mirror https://github.com/openjdk/duke shows no LICENSE file in its top-level listing | Not until confirmed | Not until confirmed. Treat as "avoid" for now | BSD copyright notice on the credits page (unconfirmed whether required for web images) |
| C | No owner; no official logo (unconfirmed) | None found | The common blue hexagon "C" is of unknown origin. Use our own "C" monogram | Own monogram: yes | None |
| C++ | Standard C++ Foundation | https://isocpp.org/home/terms-of-use | Yes, unaltered. Grant is "to use the unaltered logo in conjunction with any product" related to standard C++, with no implied endorsement. Whether a skills list is a "product" is our reading [inf] | No. "We do not normally approve modified versions" | None stated. Courtesy link to isocpp.org |
| Python | Python Software Foundation | https://www.python.org/psf/trademarks/ | Yes, unaltered, non-commercial, to promote Python | No. Colour or font changes need PSF permission; shape changes "will not be approved" | ™ with the logo. "Python and the Python logos are trademarks or registered trademarks of the Python Software Foundation." on the legal page |
| Node.js | OpenJS Foundation | https://trademark-policy.openjsf.org/ (PDF, adopted 2021-01-12) | Yes as a link to nodejs.org, official file. Logo use on websites "to promote your ... products or services" needs written permission | No. No colour variations, nothing superimposed | Trademark notice on first use. Wording not fixed by the policy |
| Docker | Docker, Inc. | https://www.docker.com/legal/trademark-guidelines/ | Name: yes. Logo: no without written permission. Informational use covers word marks "but not logo marks" | No. May not be "modified, recombined or displayed in modified scenes" | "Docker and the Docker logo are trademarks or registered trademarks of Docker, Inc. in the United States and/or other countries. Docker, Inc. and other parties may also have trademark rights in other terms used herein." |
| Kubernetes | The Linux Foundation (CNCF) | https://www.linuxfoundation.org/legal/trademark-usage and https://github.com/cncf/artwork | Yes as a link to kubernetes.io, official file. Marketing use on websites needs written permission | No. No colour variations, no overlays, no scale distortion | Trademark notice. Wording not fixed by the policy |
| PostgreSQL (Slonik) | PostgreSQL Community Association of Canada | https://www.postgresql.org/about/policies/trademarks/ | Name: yes. Logo: only in the published forms, and "should not be presented with other trademarks or logos". A logo grid conflicts with that: use the name, or ask | No without prior approval | "Postgres, PostgreSQL and the Slonik Logo are trademarks or registered trademarks of the PostgreSQL Community Association of Canada, and used with their permission." Only if permission is obtained; otherwise drop the last five words |
| MongoDB | MongoDB, Inc. | https://www.mongodb.com/legal/trademark-usage-guidelines | Yes within the standards, less prominent than our own name | No. May not "edit, change, distort, recolor, or reconfigure" | ® or ™ with the mark. No fixed sentence |
| Simple Icons (source, not a brand) | Simple Icons contributors | https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md (CC0 1.0) and DISCLAIMER.md | The set is CC0. Each icon may carry its own licence; trademark rights are not waived; the user must get any permission needed | The CC0 file may be changed. The brand's own rules still apply to the mark | None for CC0 |

Result for the 3D stack screen: gold extrusion is clear for Angular and the JS shield only. Duke is out until its licence is read on a primary page. All others get our own token plus the flat, unaltered official logo, or the name only (Spring, Docker, Java, and PostgreSQL and Qt unless we ask).

### Footer text

Non-affiliation notice, short (every page footer):

> Unofficial fan design inspired by League of Legends. Not affiliated with or endorsed by Riot Games. All product names and logos belong to their owners and are shown for identification only.

Non-affiliation notice, full (credits page and README):

> Unofficial fan design inspired by the League of Legends client. Not affiliated with, endorsed or sponsored by Riot Games. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. All artwork, fonts, sounds and code on this site are original or openly licensed; no Riot Games assets are used.
>
> Technology names and logos on this site identify tools the author has worked with. They are trademarks of their respective owners. No owner sponsors or endorses this site.

Credits list (credits page; keep only the lines for marks actually shown):

- Angular logo by Google, licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Modified: recoloured and extruded in 3D.
- JS logo from the logo.js project, MIT licence. Modified: recoloured and extruded in 3D.
- Duke, the Java mascot, from the OpenJDK Duke project, BSD licence. (unconfirmed; do not show Duke or print this line until the licence is read)
- Flutter and the related logo are trademarks of Google LLC. We are not endorsed by or affiliated with Google LLC.
- Python and the Python logos are trademarks or registered trademarks of the Python Software Foundation.
- Spring is a trademark of Broadcom Inc. and/or its subsidiaries.
- Qt is a registered trademark of The Qt Company Ltd. and its subsidiaries.
- Oracle, Java, MySQL, and NetSuite are registered trademarks of Oracle and/or its affiliates. Other names may be trademarks of their respective owners. (unconfirmed wording)
- Docker and the Docker logo are trademarks or registered trademarks of Docker, Inc. in the United States and/or other countries. Docker, Inc. and other parties may also have trademark rights in other terms used herein.
- Postgres, PostgreSQL and the Slonik Logo are trademarks or registered trademarks of the PostgreSQL Community Association of Canada.
- React and React Native are trademarks of Meta Platforms, Inc. [inf wording]
- TypeScript is a trademark of Microsoft Corporation. [inf wording]
- Node.js is a trademark of the OpenJS Foundation. [inf wording]
- Kubernetes is a registered trademark of The Linux Foundation. [inf wording]
- MongoDB is a registered trademark of MongoDB, Inc. [inf wording]
- The C++ logo is a trademark of the Standard C++ Foundation. [inf wording]

### Not confirmed in this pass

- Case law. None of these was opened on a primary source (EUR-Lex returned an empty page; Justia and CourtListener returned 403): CJEU C-393/09 (BSA: a GUI is not a form of expression of a program, but may be a protected work if it is the author's own intellectual creation; parts dictated by technical function are not), CJEU C-406/10 (SAS Institute), Lotus v. Borland (1st Cir. 1995), Apple v. Microsoft (9th Cir. 1994). All unconfirmed.
- French and Tunisian law were not researched. The owner's country is unknown.
- US trade dress rules (Lanham Act §43(a)) were not read on a primary source. Unconfirmed.
- Oracle logo and trademark pages returned 403. The Java rows rest on a search snippet. Unconfirmed.
- The OpenJDK Duke wiki and openjdk.org/projects/duke returned 403 in both passes. The BSD licence rests on a search snippet. The GitHub mirror shows no LICENSE file at top level. Unconfirmed; do not use Duke yet.
- The logo.js README says MIT but does not include the licence text or a copyright holder. The credit line is our wording [inf].
- Whether "JavaScript" is an Oracle trademark was not read on Oracle's page. Unconfirmed.
- Whether a flat, unaltered logo placed on a 3D token counts as "altering" is our reading, not a quoted rule. Brands that forbid logos in "new scenes" or "with other logos" (Docker, PostgreSQL) may object.
- Whether a job-hunting portfolio is "marketing your services" under the OpenJS and Linux Foundation policies is a judgement call. If in doubt, ask the foundation or use the name only.
- The Angular press kit's do/don't guide is an image and was not read.
- React: the policy text bars logo use without written permission, though the logo is shown on countless portfolios. No React-specific brand page was found.

### Sources (all accessed 2026-11-16)

- Riot Games, "Legal Jibber Jabber": https://www.riotgames.com/en/legal
- Angular press kit: https://angular.dev/press-kit
- Meta Open Source trademark policy: https://opensource.fb.com/legal/trademark/
- React licence (MIT): https://github.com/facebook/react/blob/main/LICENSE
- Spring trademarks (Broadcom): https://spring.io/trademarks
- Flutter brand guidelines: https://docs.flutter.dev/brand and https://flutter.dev/brand
- Qt trademark policy: https://www.qt.io/trademark/
- logo.js (JS community logo): https://github.com/voodootikigod/logo.js
- TypeScript branding: https://www.typescriptlang.org/branding/
- Oracle trademark and logo guidelines (403, not read): https://www.oracle.com/legal/trademarks/ and https://www.oracle.com/legal/logos/
- OpenJDK Duke (403, not read): https://wiki.openjdk.org/display/duke/Main
- Standard C++ Foundation terms of use: https://isocpp.org/home/terms-of-use
- PSF trademark usage policy: https://www.python.org/psf/trademarks/
- OpenJS Foundation trademark policy: https://trademark-policy.openjsf.org/
- Docker trademark guidelines: https://www.docker.com/legal/trademark-guidelines/
- Linux Foundation trademark usage: https://www.linuxfoundation.org/legal/trademark-usage
- CNCF artwork: https://github.com/cncf/artwork/blob/main/README.md and https://github.com/cncf/artwork/blob/main/LICENSE.md
- PostgreSQL trademark policy: https://www.postgresql.org/about/policies/trademarks/
- MongoDB trademark standards: https://www.mongodb.com/legal/trademark-usage-guidelines
- Simple Icons licence and disclaimer: https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md and https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md
- CC BY 4.0: https://creativecommons.org/licenses/by/4.0/

## Mockup feedback

### Claude's self-review, 2026-11-21 (T10–T14)

The owner has not reviewed the mockups yet. These notes come from Claude's own pass; the owner's reactions still go here.

- **All four screens are complete.** The builders of 2026-11-10 had finished more than the checkpoint said; the pages only looked stuck because the browser pane pauses animations while it is hidden. Fresh captures at 1440×900 and 390×844 (`.superpowers/hifi/shots/t14/`) show 0 console errors, 0 page errors and 0 failed requests. The gallery is `.superpowers/hifi/index.html`.
- **Home (T10):** loader, header, 3D core and About band read well on both sizes. "Open to work", "5 years" and the mastery numbers are placeholders; the build uses real data only.
- **Stack (T11):** strongest screen. Lane labels mix game terms (Top, Jungle, Mid, Bot, Support) with roles; the build uses roles only. Several marks are extruded in 3D (Next.js, React, Spring Boot); the build follows the legal table (3D for Angular and JS only).
- **Contact (T12):** the full storyboard works: blur validation, IN QUEUE card, MATCH FOUND dialog with a 12 s ring, ACCEPT → persistent toast, DECLINE → back to the form. It answers C04 as the spec's default.
- **Projects (T13):** lobby banners, career cards and the post-game screen look finished. Ratings and ranks ("DIAMOND · 4.5") come from made-up data and are dropped in the build; the career cards are sample content and stay hidden until real entries exist.
- **Fonts:** the mockups use Marcellus SC + Barlow from Google Fonts. The build self-hosts the report pick, Literata + Source Sans 3 (C06 default).


# Stack modernisation: toolchain for the Hextech rebuild

Date: 2026-11-10 (task dated 2026-11-09). Registry data comes from `npm view` on 2026-11-10.

Every install, upgrade and build below ran on a scratch copy of the repo, never in the project. Environment: Windows 11, Node 24.18.1, npm 11.16.0.

Tags:
- [npm]: registry metadata.
- [measured]: I ran it.
- [src]: I read the tool's source.
- [doc]: official docs or release notes.
- UNVERIFIED: could not be confirmed.

This report builds on four others and does not repeat them:
- `2026-11-09-lol-client-ui.md`: palette and component CSS.
- `2026-11-09-webgl-magic.md` §1: the 3D/motion version pins. I re-checked them today and they are unchanged.
- `2026-11-09-codebase-audit.md`: dead code and the state of the live site.
- `2026-11-09-type-sound-legal.md`: fonts and Web Audio.

## 0. Decisions

1. **Toolchain:** Vite 8.3.7, @vitejs/plugin-react 6.3.0 (Oxc, no Babel), Tailwind 4.3.5 through `@tailwindcss/vite`, TypeScript 7.0.2 and oxlint 1.93.0.
   - This matches what `create-vite@9.3.4` scaffolds for `react-ts` today [src].
   - Oxlint has been the default linter there since Oct 2026. TS 7 is the default when ESLint is not chosen (PR #23910, merged 2026-10-27) [src].
2. **Drop ESLint.**
   - The current `eslint.config.js` only matches `**/*.{js,jsx}`, so it lints 6 files: 4 configs plus `App.jsx` and `main.jsx`. None of the 29 `.ts`/`.tsx` files are linted [measured].
   - `eslint-plugin-react@7.37.5` has no ESLint 10 peer [npm].
   - `typescript-eslint@8.72.2` requires `typescript >=4.8.4 <6.1.0`, so it cannot run on TS 7 [npm].
   - Oxlint 1.93.0 covers the same ground: `rules-of-hooks`, `exhaustive-deps`, `only-export-components`, the compiler-style hook rules (`purity`, `refs`, `immutability`, `set-state-in-effect`…) and 36 jsx-a11y rules [measured].
3. **React 19.3.1 with @react-three/fiber 9.8.2, drei 10.7.9 and three 0.187.0** (the webgl pins).
   - The current site, unmodified, bundles and renders on this stack. All 4 sections mount and the IconScene canvas draws. The only console output is `THREE.Clock … deprecated` [measured].
4. **GSAP 3.15.1, @gsap/react 2.1.2 and lenis 1.3.27.**
   - GSAP is free, including every plugin, under the "Standard No-Charge" licence. That licence is not OSI.
   - Plugins: ScrollTrigger, SplitText, DrawSVG and CustomEase.
   - Not ScrollSmoother, and not the 4.0 beta.
5. **No shadcn and no headless library in v1.** The four primitives this site needs (accept/match dialog, mobile nav, tooltip, toast) are a native `<dialog>`, CSS tooltips and one `aria-live` region.
   - These cost 0 kB.
   - Base UI would cost 51.2 kB gz for Dialog + Tooltip + Toast, or 66.3 kB gz with Drawer added. The same three from Radix cost 33.6 kB gz [measured].
   - Add a primitive library only per component, and only if a native one runs out.
6. **`phh235/hextech-ui`: use it as a reference only.** It is 4 days of commits by one author, with no releases, an unpublished npm package and an open upstream-notice question (§4.4).
7. **Delete 16 of the 22 runtime dependencies** now or as their sections are rebuilt (§8).
   - Removing 14 of them (all except react-icons and react-router-dom) drops **463 of 878** installed packages.
   - `react-spring` alone accounts for 436, because it drags in react-native 0.76.3, konva and zdog [measured].
8. **Drop react-router.**
   - Use one page plus a static `public/404.html`, which gives a real 404 with no rewrite.
   - If routing is ever needed: `react-router@8.5.1` (v8 removed `react-router-dom`) plus a `vercel.json` rewrite.
9. **Vercel:**
   - Add `vercel.json` with immutable caching for hashed assets. Hashed JS is currently served `max-age=0, must-revalidate` [measured].
   - Add `engines.node: "24.x"`.
   - Add a `vercel-build` script so every preview and production deploy is gated by oxlint, tsc and vitest at zero CI cost [src].
10. **Tests:**
    - Vitest 5.1.0 for pure logic.
    - Playwright 1.65.0 smoke tests and masked screenshots run against each Vercel preview from a `deployment_status` workflow.
    - Lighthouse CI is optional and runs through `npx`.
11. **Migration order:** Lot A cleanup → Lot B Tailwind 4 → Lot C Vite 8, TS 7 and oxlint → Lot D React 19 and the 3D stack → Lot E test gates. The feature lots then delete the libraries their sections replaced.
    - The order matters. I hit three ERESOLVE traps and recorded the fix for each (§6.2).

## 1. Target version matrix (exact pins; all checked with `npm view` on 2026-11-10)

Pin exactly (`npm i -E`). Two ranges are capped, so a floating `^` could silently break:
- @react-three/fiber 9.8.2 peers `react >=19 <19.4`.
- postprocessing 6.39.6 peers `three >=0.168.0 <0.188.0`.

| Package | Installed now | **Target** | Published | Notes |
|---|---|---|---|---|
| react, react-dom | 18.3.1 | **19.3.1** | 2026-10-14 | 19.3.0 (2026-09-09) added `<ViewTransition>`; 19.3.1 is an RSC transport fix only [doc] |
| three | 0.171.0 | **0.187.0** | 2026-10-30 | capped `<0.188` by postprocessing; WebGL 1 was removed in r163 [doc] |
| @react-three/fiber | 8.17.10 | **9.8.2** | 2026-10-14 | peer `react >=19 <19.4`, `three >=0.156` |
| @react-three/drei | 9.118.0 | **10.7.9** | 2026-09-25 | peer `react ^19`, fiber `^9.0.0`; 11.0.0-alpha.7 excludes React 19.3 (webgl §1) |
| @react-three/postprocessing / postprocessing | – | **3.2.2 / 6.39.6** | 2026-10-21 / 2026-11-01 | from webgl §1, unchanged |
| gsap | – | **3.15.1** | 2026-11-04 | dist-tag `beta` = 4.0.0-beta.3: do not use |
| @gsap/react | – | **2.1.2** | 2025-01-15 | peer `gsap ^3.12.5`, `react >=17` |
| lenis | – | **1.3.27** | 2026-10-15 | `dev` tag 2.0.0-dev.6: do not use |
| lucide-react | 0.462.0 | **1.70.0** | 2026-11-06 | v1 **removed brand icons**: `Github`, `Linkedin`, `Instagram`, `Facebook` and `Twitter` no longer exist, and `Sidebar.tsx` imports four of them [measured]. Last 0.x is 0.577.0 |
| @emailjs/browser | (emailjs-com 3.2.0, deprecated) | **5.0.3** | 2026-10-10 | BSD-3-Clause; `send(service, template, params, { publicKey })`; built-in `limitRate`/`blockHeadless` [doc] |
| vite | 6.0.1 | **8.3.7** | 2026-11-09 | Node `^20.19 \|\| >=22.12`; fallback if a regression appears: 8.3.6 (2026-11-05) |
| @vitejs/plugin-react | 4.3.4 | **6.3.0** | 2026-11-09 | peer `vite ^8`; no Babel; fallback 6.2.1 |
| tailwindcss + @tailwindcss/vite | 3.4.15 (+postcss, autoprefixer) | **4.3.5 + 4.3.5** | 2026-11-06 | `@tailwindcss/vite` peer `vite ^5.2 \|\| ^6 \|\| ^7 \|\| ^8` |
| typescript | none | **7.0.2** | 2026-07-08 | native (Go) `tsc`; ships **no JS API** in 7.0 [doc] |
| @types/react, @types/react-dom | 18.3.12 / 18.3.1 | **19.3.0 / 19.3.0** | 2026-09-09 | |
| @types/three | – | **0.187.0** | 2026-10-30 | three ships no types |
| @types/node | – | **24.19.2** | – | matches Node 24, as create-vite does |
| oxlint | – (ESLint 9.15) | **1.93.0** | 2026-11-09 | 872 rules; type-aware rules need the optional `oxlint-tsgolint` |
| vitest | – | **5.1.0** | 2026-11-02 | Node `^22.12 \|\| ^24 \|\| >=26`; `clearMocks` now defaults to `true` [doc] |
| @playwright/test | – | **1.65.0** | 2026-11-05 | adds `--enable-unsafe-swiftshader` by default, so headless WebGL works [src] |
| **Optional, only when needed** | | | | |
| jsdom + @testing-library/react + @testing-library/dom | – | 31.0.0 + 16.3.3 + 10.4.2 | – | only for component tests. jsdom 31 needs Node `^22.22.2 \|\| ^24.15 \|\| >=26` |
| @lhci/cli (via `npx`, not a dep) | – | 0.16.0 | 2026-11-02 | Lighthouse 13.6.0; Node ≥22.19 |
| radix-ui / @base-ui/react | – | 1.8.1 / 1.9.0 | 2026-10-12 / 2026-10-09 | only if a native primitive runs out (§4) |
| shadcn CLI (via `npx`) | – | 4.23.0 | 2026-10-27 | only if the owner insists (§4.3) |
| react-router | (react-router-dom 7.0.1) | 8.5.1, or **remove** | 2026-10-27 | v8 needs React ≥19.2.7 and Node ≥22.22.0 [doc] |
| Node (local + Vercel) | 24.18.1 / project setting UNVERIFIED | **24.x** via `engines` | – | Vercel offers 26.x (default for new projects), 24.x and 22.x; 20.x was deprecated 2026-10-01 [doc] |

End state is 12 runtime and 12 dev dependencies, down from 22 and 13. Fonts are extra, per the type report.

```json
"dependencies": {
  "@emailjs/browser": "5.0.3", "@gsap/react": "2.1.2", "@react-three/drei": "10.7.9",
  "@react-three/fiber": "9.8.2", "@react-three/postprocessing": "3.2.2", "gsap": "3.15.1",
  "lenis": "1.3.27", "lucide-react": "1.70.0", "postprocessing": "6.39.6",
  "react": "19.3.1", "react-dom": "19.3.1", "three": "0.187.0"
},
"devDependencies": {
  "@playwright/test": "1.65.0", "@tailwindcss/vite": "4.3.5", "@types/node": "24.19.2",
  "@types/react": "19.3.0", "@types/react-dom": "19.3.0", "@types/three": "0.187.0",
  "@vitejs/plugin-react": "6.3.0", "oxlint": "1.93.0", "tailwindcss": "4.3.5",
  "typescript": "7.0.2", "vite": "8.3.7", "vitest": "5.1.0"
}
```

## 2. Baseline today [measured]

**Install footprint**
- `npm ci` installs 878 packages and took 11 min on this machine.
- `react-spring@9.7.4` is the `react-spring` meta package, which pulls in every renderer: react-native 0.76.3, konva, react-konva and zdog. Uninstalling it alone removes **436 packages**.

**Unused dependencies**
- grep over `src/` and `knip@6.44.2` agree on 7 unused dependencies: `classnames`, `react-modal`, `react-scroll`, `react-spring`, `react-three-fiber` (deprecated 2021), `react-tooltip` and `typewriter-effect`.
- They also agree on 7 dead files: `components/projects/*` (4 files, one of which imports `@headlessui/react`, which is not installed), `MainSection/MatchControls.tsx`, `hooks/scrollToTop.ts` and `hooks/smoothScroll.ts`.

**TypeScript is never checked.** There is no tsconfig and no `typescript` dependency. I added the create-vite tsconfig in scratch:

| Check | Errors |
|---|---|
| TS 6.0.3 or 7.0.2, `strict` (the TS 6/7 default) | 60 (identical lists) |
| `strict: false` | 47 |
| with @types/react 19 on fiber 8 and framer-motion 11 | 74 (+10 r3f intrinsic elements, because fiber 8 augments the removed global `JSX`; +4 framer-motion prop types) |
| after Lot D (fiber 9 + framer-motion 14) | back to 60 |
| after deleting `projects/*` and the 2 dead hooks | **35** (deleting `MatchControls.tsx` removes 1 more unused import) |

Of those 35:
- 28 are unused imports or variables. 17 of them are `import React`.
- 2 are `swiper/css` side-effect imports. TS 6+ turns on `noUncheckedSideEffectImports` by default.
- 1 is untyped `aos`.
- 3 are implicit `any` (in `Hero.tsx` and `SoundPlayer.tsx`).
- 1 is real: `FloatingIcon.tsx:33` reads `material.opacity` on `Material | Material[]`.

**Bundle**

| Build | JS (raw / gz) | CSS (raw / gz) | Time |
|---|---|---|---|
| Vite 6.0.1, today | one chunk 1,307 kB / 377 kB, plus a howler chunk 37 / 10 kB | 74 kB / 12.8 kB | 3 min 43 s cold, 58 s warm |
| Vite 8.3.7, same code + Tailwind 4 | 1,277 / 359 kB (−4%, Oxc minifier) | 81.3 / 14.1 kB | **4.0 s** |

The CSS includes about 8 kB gz from the aos, swiper and toastify stylesheets.

**Live site**
- `/projects`, `/404` and `/does-not-exist` all return Vercel's plain-text 404 (79 B).
- `/assets/index-*.js` is served `Cache-Control: public, max-age=0, must-revalidate` with `X-Vercel-Cache: HIT` (Paris edge).

**GitHub and Vercel**
- `gh api repos/abdelmatine/league/deployments`: 14 deployments, all environment `Production`, all created by `vercel[bot]`. The latest is 2026-06-26 for `64d17b4`.
- `gh pr list --state all` returns nothing, and `main` is the only branch.
- **No preview deployment has ever been built**, because no branch or PR has ever existed. The Vercel GitHub app is active, since it posts the deployment statuses.

## 3. Tailwind 3.4.15 → 4.3.5

### 3.1 What the upgrade tool does to this repo [measured]

**Run 1, current config.** The tool **cannot convert** `tailwind.config.js` to CSS.
- Cause: `theme.extend` contains two invalid keys, `overflow: {'x-hidden': 'hidden'}` and `scrollBehavior: ['smooth']`. Both are no-ops, since `overflow-x-hidden` and `scroll-smooth` are core utilities.
- Result: the tool falls back to `@config '../tailwind.config.js'`.

**Run 2, config first cut to `content` only.** Full CSS-first migration.
- Deletes `tailwind.config.js`.
- Replaces `@tailwind base/components/utilities` with `@import 'tailwindcss'`.
- Adds a compatibility layer: `border-color: var(--color-gray-200, currentcolor)`.
- Installs `@tailwindcss/postcss` and removes `autoprefixer`.
- Makes **26 class edits in 12 files:**

| Change | Count |
|---|---|
| `rounded` → `rounded-sm` | 10 |
| `border-[1px]` → `border` | 5 |
| `focus:outline-none` → `focus:outline-hidden` | 4 |
| `bg-gradient-to-{t,br,b}` → `bg-linear-to-*` | 4 |
| `backdrop-blur-sm` → `backdrop-blur-xs` | 2 |
| `max-w-screen-lg` → `max-w-(--breakpoint-lg)` | 1 |

**Result.** The build passes. CSS goes from 74.3 to 81.3 kB raw (12.8 → 14.1 kB gz), because v4 emits `@property` and theme variables.

**A run needs a v3 config to exist.** Deleting the config first makes the tool stop with "No configuration file found". Trim the config, don't delete it.

**Then switch to the Vite plugin by hand.** This is Tailwind's recommended path for Vite, and the build ran on it:
1. Delete `postcss.config.js`.
2. `npm rm @tailwindcss/postcss postcss`.
3. `npm i -D -E @tailwindcss/vite@4.3.5`.
4. Add `tailwindcss()` to the Vite plugins.

`postcss` itself stays available through Vite's own dependency.

**Source detection gotcha [measured].** v4 scans every file that isn't gitignored, including `docs/research/*.md`. With `docs/` present, the CSS grew from 81,297 to 85,542 B (+0.5 kB gz) from class-like tokens in these reports. Make the sources explicit:

```css
/* src/index.css */
@import "tailwindcss" source(none);
@source "../index.html";
@source "../src";
```

**After the migration:**
- Remove the border compatibility layer once components set explicit Hextech border colours.
- Watch these v4 default changes when comparing previews [doc]:
  - `ring` is 1px with `currentColor`.
  - Placeholders use 50% of the text colour.
  - Buttons get `cursor: default`.
  - `hover:` only applies under `@media (hover: hover)`, so taps on phones show no hover glow, which is what we want.
  - `space-*` uses `:not(:last-child)`.
  - **Preflight resets `<dialog>` margins.** Add `dialog { margin: auto }` or `m-auto`. This matters for §4.2.

### 3.2 Browser floor

| Source | Chrome / Edge | Safari | Firefox |
|---|---|---|---|
| Tailwind v4 [doc] | 111 | 16.4 | 128 |
| Vite 8 default `build.target` (`baseline-widely-available`) [doc] | 111 | 16.4 | 114 |

- Tailwind's Firefox 128 is the binding minimum.
- three r163+ needs WebGL2 anyway.
- No v3 fallback is planned. `tailwindcss@3.4.19` exists under the `v3-lts` tag if it is ever needed.

### 3.3 v4 features that map to Hextech

| Need | Feature |
|---|---|
| Tokens | `@theme` tokens become utilities and CSS variables. Use them for the gold, blue and grey scales and the client easings |
| Chamfered frames, gradient borders | `@utility` (replaces `@layer utilities`) |
| Gold text glow, glowing crests | `text-shadow-*` with `/alpha`, and `drop-shadow-<color>` (4.1) |
| Chamfer and vignette masks | `mask-*` (4.1) |
| Hover glows on mouse only | `pointer-fine:` / `pointer-coarse:` (4.1) |
| The client's 6 px gold scrollbar | `scrollbar-thin scrollbar-thumb-[#785A28] scrollbar-track-[#1E2328]` (4.3) instead of a ScrollArea component. Full Safari support for `scrollbar-color` only arrives in Safari 26.2 [caniuse]; older Safari keeps overlay scrollbars, which is acceptable |
| Enter animations | `starting:` variant (`@starting-style`) |

Minimal token pattern. Take the values from `lol-client-ui.md` and don't duplicate the palette here:

```css
@theme {
  --color-gold-100: #F0E6D2;  /* …gold-700, blue-100…700, grey-* from lol-client-ui.md */
  --color-hextech-black: #010A13;
  --ease-hx-settle: cubic-bezier(0, 0, 0.33, 1);   /* hover glow, 600 ms */
  --ease-hx-slam: cubic-bezier(1, 0, 1, 1);        /* champ-select slam */
  --radius-*: initial;                              /* client UI is square */
}
@utility hx-frame {
  border: 2px solid transparent;
  background: linear-gradient(#010A13, #010A13) padding-box,
              linear-gradient(to top, #614A1F 0, #463714 5px, #463714 100%) border-box;
}
```

## 4. shadcn/ui: does it fit?

### 4.1 Status today [doc]

**CLI.** `shadcn@4.23.0`; v4 of the CLI shipped 2026-03-06. New in v4:
- `init -t vite` scaffolds a project.
- `--base radix|base`.
- `--preset`.
- `add --dry-run/--diff/--view`.
- `info` and `docs`.

**Base UI is the default library since 2026-07-02.** Opt out with `init -b radix`. Radix is "not being deprecated", and both bases get every new component.
- Base UI 1.9.0 (2026-10-09) has 37 components.
- That includes Drawer, stable since 1.3.0 (2026-03-12), plus Dialog, Tooltip, Toast, Tabs, Toggle Group and Scroll Area.

**Other changes**
- 2026-07-23: a Toast component built on Base UI. Sonner remains the Radix-side toast.
- 2026-09-03: components import `cn` from the new `cn@0.5.2` package, a drop-in for `twMerge(clsx())`. `npx shadcn migrate cn` removes clsx and tailwind-merge.

**Requirements.** React 19 and Tailwind v4 are both supported, so it becomes possible after Lot D. It also needs `components.json` and an `@/` alias.

**Alias trap [measured]**
- shadcn's Vite guide still tells you to add `"baseUrl": "."`.
- On TS 6.0.3 that gives **error TS5101** ("deprecated… will stop functioning in 7.0"; silence with `"ignoreDeprecations": "6.0"`).
- On TS 7.0.2 it gives **error TS5102** ("has been removed").
- `paths` without `baseUrl` compiles on TS 7.
- Vite 8 resolves aliases with `resolve: { tsconfigPaths: true }` [doc], so neither `path` nor `@types/node` is needed for that.
- The CLI resolves aliases through `tsconfig-paths` (`loadConfig` → `absoluteBaseUrl`) [src]. Whether it works with no `baseUrl` is **UNVERIFIED**. Check with `npx shadcn@latest info` before relying on it.

### 4.2 Need by need, with measured cost

Sizes are esbuild minify + gzip -9, with React external.

| Need | v1 choice (0 kB) | Library alternative |
|---|---|---|
| Match Found / ACCEPT modal; contact queue → found → accept flow | `<dialog>` + `showModal()`: top layer, inert page behind it, Esc closes, focus moves to the first focusable element [MDN]. Put `autofocus` on ACCEPT. Call `lenis.stop()` / `start()` around it. GSAP runs the 1.1 → 1 pop. Add `m-auto` (§3.1). The *loader* variant ("waiting for other players") should be a `role="status"` overlay, not a modal, because nothing is interactive | Base UI Dialog 23.8 kB; Radix Dialog 14.2 kB |
| Mobile nav sheet | The same `<dialog>`, styled as a side sheet | Base UI Drawer (part of the 66.3 kB set) |
| Tooltip (champion and counter hover) | CSS on `:hover` / `:focus-visible` plus `aria-describedby`. Grid positions are fixed, so no collision logic is needed | Base UI Tooltip 34.0 kB |
| Toast (contact result) | One `role="status"` live region in a framed panel | Base UI Toast 26.3 kB; Sonner 2.0.8 9.6 kB |
| Tabs | The header is anchor links with scroll-spy, not tabs. The role filter is a `<fieldset>` of radio inputs styled as tabs | Base UI Tabs / Toggle Group |
| ScrollArea | Tailwind 4.3 scrollbar utilities | Base UI Scroll Area |
| Command (champion search) | `<input type="search">` filtering about 20 items | cmdk 1.1.1 (last release 2025-03-14) |
| `cn` / clsx | Template strings; add `clsx@2.1.1` (~0.3 kB) if they get messy | `cn` 10.8 kB gz (contains a Tailwind class-merge table) |

Totals: Base UI Dialog + Tooltip + Toast **51.2 kB gz**, **66.3 kB** with Drawer. Radix Dialog + Tooltip + Toast **33.6 kB gz** [measured].

Verdict:
- Every shadcn style gets replaced by Hextech CSS anyway.
- The site has four primitives, and native ones cover them.
- The eager-JS budget (§10.4) has no room for a 34–66 kB layer.
- **Skip shadcn.** If one primitive later outgrows native, add that single Radix or Base UI component.

### 4.3 If the owner still wants shadcn

Commands:

```bash
npx shadcn@4.23.0 init -b radix   # Radix: 35% smaller than Base UI for this set
npx shadcn@4.23.0 add dialog tooltip --dry-run   # review, then without --dry-run
```

Restyle through its variables. Map them once and every later `add` comes out Hextech:

| shadcn var | Hextech value |
|---|---|
| `--background` | `#010A13` |
| `--foreground` | `#A09B8C` |
| `--card`, `--popover` | `#1E2328` |
| `--card-foreground`, `--popover-foreground` | `#F0E6D2` |
| `--primary` | `#C8AA6E` |
| `--primary-foreground` | `#010A13` |
| `--accent` | `#0AC8B9` (magic actions only) |
| `--muted` | `#1E282D` |
| `--muted-foreground` | `#5B5A56` |
| `--border` | `#463714` |
| `--input` | `#785A28` |
| `--ring` | `#C89B3C` |
| `--destructive` | `#C75A6D` |
| `--radius` | `0rem` |

Then:
- Add a `magic` button variant.
- Replace plain borders with the `hx-frame` utility.
- Fonts come from the type report.

### 4.4 phh235/hextech-ui [gh api, files read 2026-11-10]

**Licence.** MIT for its own additions. Upstream code from LoL Math UI keeps the **ISC** licence. Its own `THIRD_PARTY_NOTICES.md` says the upstream copyright notice "must be confirmed before publishing copied source". It also states it is not affiliated with Riot and that "Hextech" is Riot IP.

**Maturity**

| Metric | Value |
|---|---|
| Stars / forks | 6 / 1 |
| Commits | **38, all by one author, 2026-10-17 → 2026-10-20** |
| Tags / releases | none |
| npm | `@hextech-ui/*` is **not published** |
| Install path | shadcn registry served from the author's site (`hextech-ui.vercel.app` / `hextech.phh235.site`), unversioned |
| Repo signals | `AGENTS.md` and `CLAUDE.md` are present, so it is likely heavily AI-assisted |

**Stack.** React 19, Tailwind v4 and Base UI. Fonts are Cinzel 500/700/900 and Barlow 400–700 from @fontsource 5.3.0.

**Tokens.**
- Tokens live under `--hextech-ui-*`, exposed as `hx-*` utilities.
- It includes a light mode, which we don't need.
- `[data-hextech-ui-theme]` redefines `--spacing` to its own 4 px unit.

**Verdict: reference only.**
- Its dark palette is identical to `lol-client-ui.md`.
- The useful extras are its named gradient tokens (`gradient-gold`, `-hover`, `-press`, `gradient-hextech`, `-hover`, `-press`) and the input border and focus gradients. Copy the values, not the files.
- If CSS is ever copied verbatim, keep both the MIT and the ISC notices.
- Don't depend on its registry.

## 5. TypeScript

**Decision: TypeScript 7.0.2 + oxlint.**

TS 7 facts [doc]:
- It is the native compiler. `npm i -D typescript` installs a `tsc` binary through platform packages.
- The package's main export is a version stub; the API sits under `typescript/unstable/*` [npm].
- 7.0 has **no stable API**. A different API is planned for 7.1.
- typescript-eslint therefore cannot run on it.
- The official side-by-side setup is an alias pair:
  - `"typescript": "npm:@typescript/typescript6@^6.0.2"`, which gives `tsc6` and the 6.0 API.
  - `"@typescript/native": "npm:typescript@^7.0.2"`.

**Alternative (only if ESLint is kept):** `typescript ~6.0.3` with eslint 10.14.0, @eslint/js 10.0.1, typescript-eslint 8.72.2, eslint-plugin-react-hooks 7.1.1, eslint-plugin-react-refresh 0.5.7 and globals 17.14.0. That is exactly what `create-vite --eslint` writes [src]. Don't add `eslint-plugin-react` or `eslint-plugin-jsx-a11y`: neither has an ESLint 10 peer.

**Defaults that changed in TS 6/7** [doc]:
- `strict: true`
- `module: esnext`
- `types: []`
- `rootDir: ./`
- `noUncheckedSideEffectImports: true`

Options now removed: `baseUrl`, `moduleResolution: node10/classic`, `target: es5`, `esModuleInterop: false`.

**Config.** Copy the three files from `create-vite@9.3.4`'s `template-react-ts` unchanged, with no alias:

```jsonc
// tsconfig.json
{ "files": [], "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }] }
// tsconfig.app.json
{ "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023", "lib": ["ES2023", "DOM"], "module": "esnext", "types": ["vite/client"],
    "allowArbitraryExtensions": true, "skipLibCheck": true,
    "moduleResolution": "bundler", "allowImportingTsExtensions": true, "verbatimModuleSyntax": true,
    "moduleDetection": "force", "noEmit": true, "jsx": "react-jsx",
    "noUnusedLocals": true, "noUnusedParameters": true, "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true },
  "include": ["src"] }
// tsconfig.node.json: same, but "lib": ["ES2023"], "types": ["node"], "module": "nodenext", "include": ["vite.config.ts"]
```

**Strictness.** Keep the default `strict` plus the template's lint flags. Skip `noUncheckedIndexedAccess`; it is noise for a data-literal portfolio.

**Cost of strict mode.** After Lot A it comes to about 7 real fixes plus deleting about 27 unused imports (§2). Two of the 7 (`swiper/css`, untyped `aos`) disappear when those libraries go.

**Conversion.** There are only two JS files:
- Rename `main.jsx` → `main.tsx`, using `document.getElementById('root')!`.
- Rename `App.jsx` → `App.tsx`.
- Update the `<script src>` in `index.html`.

**Build and editor**
- Build script: `tsc -b && vite build`. Vite (Oxc) strips types without checking them.
- VS Code needs the "TypeScript 7" extension (`TypeScriptTeam.native-preview`) until built-in support ships [doc].
- Speed is not a factor at 1.9k LOC: TS 7 took 8.3 s and TS 6 took 11.6 s warm, wall-clock including Node and npx start-up [measured].

## 6. React 19.3.1, router, R3F 9 / drei 10

### 6.1 Pins

The pins are the webgl report's set, re-verified [npm]. That report's compatibility run, shader compile and bundle numbers still apply.

- Pin `react` exactly, because fiber 9.8.2 caps it at `<19.4`.
- React 19.3's `<ViewTransition>` is not needed, since GSAP owns motion.
- Leave the React Compiler off. The template doesn't enable it for build-time reasons. plugin-react 6 offers it as an experimental `compiler: true` (Rust) or through `@rolldown/plugin-babel` + `reactCompilerPreset` [doc].

### 6.2 Upgrade traps [measured]

1. **React 19 next to fiber 8 fails.** `npm i react@19.3.1 react-dom@19.3.1 @types/react@19.3.0 …` with fiber 8 installed gives **ERESOLVE**: `peer react ">=18 <19" from @react-three/fiber@8.18.0`.
   - Hard React ≤18 peers are also present in react-spring 9.7.4, react-modal 3.16.1, react-scroll 1.9.0 and typewriter-effect 2.21.0. All four are unused, so Lot A deletes them.
   - framer-motion 11.12 has `peerOptional react ^18`.
2. **Vite 8 before Lot A fails.** `npm i -D vite@8.3.7 @vitejs/plugin-react@6.3.0` gives **ERESOLVE** on `@babel/core` 8.1.0 vs 7.26.0.
   - The 7.26.0 is pinned under react-native, which react-spring pulls in. plugin-react 6 has an optional `@rolldown/plugin-babel` peer that wants `^7.29 || ^8`.
   - The same command succeeded right after removing the 7 unused dependencies.
3. **React 19 and the 3D stack in one command still fail after Lot A.**
   - `npm i react@19.3.1 react-dom@19.3.1 @react-three/fiber@9.8.2 @react-three/drei@10.7.9 …` gives ERESOLVE, because `react-reconciler@0.27` under fiber 8 still pins React 18.
   - **Fix:** `npm rm @react-three/fiber @react-three/drei framer-motion` first, then install. That leaves 3 "overriding peer dependency" warnings and a passing build.

**Runtime check, no code changes.** Vite 8 build plus preview of the current site on React 19.3.1, fiber 9.8.2, drei 10.7.9, three 0.187.0 and framer-motion 14.11.1:
- `#home`, `#projects`, `#stack` and `#contact` mount.
- 1 canvas renders.
- The only console output is `THREE.Clock … use THREE.Timer`.

Eager JS rises from 359 to **425 kB gz** until the 3D chunk is lazy-loaded (webgl §7) and framer-motion is deleted. Expect that dip in Lot D.

### 6.3 React Router: drop it

**v8 facts [doc]:**
- v8.0.0 shipped 2026-06-17; latest is 8.5.1.
- Requires React ≥19.2.7, Node ≥22.22.0 and Vite 7+ (framework mode).
- ESM-only.
- **`react-router-dom` is gone.** Its last version stays 7.18.5, so imports move to `react-router` / `react-router/dom`.

**How the router is used here**
- `BrowserRouter` with routes `/`, `/404` and `*`.
- One `NavLink to="#projects"`, which is really a hash link.
- `useNavigate` in `NotFoundPage` and in dead files.

The approved design is one scrolling page. Remove the router: about 14 kB gz (v7 subset 13.9 kB, v8 subset 14.7 kB) [measured]. Then:
- Turn the hash links into `<a href="#projects">` plus `lenis.scrollTo`, or Lenis `anchors: true`.
- Make the 404 a static, Hextech-styled `public/404.html`. Vite copies it to `dist/404.html`, and Vercel serves it for unmatched paths [doc]. HTTP status 404 is UNVERIFIED; check it with `curl -I` on the first preview.
- If a React-rendered 404 is preferred: add the rewrite in §9 and branch on `location.pathname !== '/'` in `App`. That is one line, still needs no router, and returns a soft 200.

## 7. GSAP 3.15.1 + @gsap/react 2.1.2 + Lenis 1.3.27

### 7.1 Licence [doc]

**Free since 3.13**
- The 3.13 post (2025-04-29) states "100% FREE including ALL of the bonus plugins", for commercial use too, "thanks to Webflow". The plugins went into the public npm package.
- The public `gsap@3.15.1` tarball (179 files) contains ScrollTrigger, SplitText, DrawSVG, MorphSVG, CustomEase, Observer, ScrollSmoother, Flip, MotionPath, ScrambleText, Inertia, GSDevTools and more [measured].

**Licence terms.** The "Standard 'No Charge' GSAP License" (effective 2025-04-30) is **not MIT or OSI**.
- It grants use on "any website, web application, or digital interface".
- It bars use in no-code visual animation builders that compete with Webflow.
- It bars removing GSAP's notices.
- It requires no attribution.
- A personal portfolio, open source on GitHub, is a permitted use.
- Whether the licence allows **redistributing** GSAP's source inside a repo is unaddressed. We don't vendor it: npm installs it. So UNVERIFIED, and irrelevant here.

**Releases**
- 3.14 (2025-12-08): MorphSVG `smooth`.
- 3.15 (2026-04-13): `easeReverse`.
- 3.15.1 (2026-11-04) is current.
- `gsap@4.0.0-beta.3` and `@gsap/react@4.0.0-beta.3` sit on the npm `beta` tag, but gsap.com/blog does not mention a v4. **Don't use them.**

### 7.2 Plugins [measured size, esbuild minify + gzip]

| Module | gz | Use here |
|---|---|---|
| core | 27.7 kB | everything |
| + ScrollTrigger | +17.6 kB (45.3 total) | section reveals, scrubbed hero camera, scroll-spy for the header tabs |
| + SplitText | +3.2 kB | "MATCH FOUND", hero title, section titles. Since 3.13 it adds `aria-label` and `aria-hidden` and has `autoSplit` and masking [doc] |
| + DrawSVG + CustomEase | +4.8 kB | ring drain and frame strokes. CustomEase holds the client curves (`0,0,.33,1`; `1,0,1,1`) |
| core + ST + SplitText + DrawSVG + CustomEase + `useGSAP` | **53.7 kB** | the recommended set |
| MorphSVG + Observer | 13.3 kB standalone | skip; add MorphSVG only if a hex-shape morph is designed |

`useGSAP`:
- Register it once: `gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase, useGSAP)`.
- Pass `{ scope: ref }`.
- Wrap event handlers in `contextSafe`.
- It reverts on unmount, which is the safe pattern under React 19 StrictMode's double effects. Since fiber 9, StrictMode also applies inside `<Canvas>` (webgl §1).

### 7.3 Lenis vs ScrollSmoother: keep Lenis

| | Lenis 1.3.27 | ScrollSmoother (3.15.1) |
|---|---|---|
| Size on top of core + ScrollTrigger | +5.0 kB gz | +4.7 kB gz [measured] |
| DOM | none; native document scroll | needs `#smooth-wrapper > #smooth-content`. Content is moved with `matrix3d()`, so **`position: fixed` children stop being fixed** [doc] |
| Fixed canvas, header and social panel | work anywhere in the tree | must sit outside the wrapper |
| Touch | native by default | not smoothed by default (`smoothTouch: false`) [doc] |
| Integration | `gsap.ticker` → `lenis.raf()` → r3f (webgl §2.3) | built-in |

Notes:
- Lenis writes scroll with `behavior: "instant"` [src], so the `scroll-smooth` class on `<html>` doesn't fight it.
- `Hero.tsx`'s `scrollIntoView({ behavior: 'smooth' })` *does* fight it. Replace it with `lenis.scrollTo`, use `anchors: true`, and drop `scroll-smooth`.
- Use `data-lenis-prevent` on any nested scroller, such as the champion grid.

## 8. Dependencies to remove (grep of `src/` on 2026-11-10)

| Dependency | Used? | Replace with | Saves (gz, measured) | Lot |
|---|---|---|---|---|
| react-spring 9.7.4 | no | – | 436 installed packages | A |
| react-three-fiber 6.0.13 (deprecated duplicate) | no | – | 1 package | A |
| react-modal 3.16.1 / react-tooltip 5.28 / react-scroll 1.9.0 / classnames 2.5.1 / typewriter-effect 2.21.0 | no | – | 4 + 4 + 1 + 0 + 3 packages | A |
| use-sound 4.0.3 (+ howler) | `hooks/SoundPlayer.tsx` | delete it together with `public/sounds/inqueue.mp3`, which is likely ripped and 1,160,402 B per visit (audit §5); new cues use Web Audio (type report) | 10.8 kB + the mp3 | A |
| framer-motion 11.12.0 | `Stack.tsx`, `GridItem.tsx` | GSAP; bump to 14.11.1 temporarily in Lot D | 36.9 kB | Stack lot |
| aos 2.3.4 | `Stack.tsx` | ScrollTrigger | 5.4 kB + 2.2 kB CSS | Stack lot |
| react-simple-typewriter 5.0.1 | `Hero.tsx`, `Stack.tsx` | SplitText / TextPlugin | 1.9 kB | Hero lot |
| swiper 11.1.15 | `MainSection.tsx` (+ dead files) | CSS scroll-snap | 28.9 kB + 3.2 kB CSS | Projects lot |
| react-toastify 10.0.6 | `Contact.tsx` | `role="status"` region | 6.4 kB + 2.7 kB CSS | Contact lot |
| emailjs-com 3.2.0 (deprecated) | `Contact.tsx` | `@emailjs/browser@5.0.3`. Use `limitRate` instead of the hand-rolled 1 h cooldown. Keys go in `VITE_EMAILJS_*` | net +0.4 kB | Contact lot |
| react-icons 5.3.0 | 4 files, 7 icons | lucide 1.70 (`Star`, `StarHalf`, `ArrowLeft/Right`, `Mic`, `MicOff`) | 2.0 kB | Header/social lot |
| lucide-react 0.462 → 1.70 | 9 files | keep. Brand icons are gone in v1: copy the 4–6 brand paths from `simple-icons@16.37.0` (CC0) into one TS file, with no runtime dependency | – | Header/social lot |
| react-router-dom 7.0.1 | `App.jsx`, `Hero`, `NotFoundPage` (+ dead) | §6.3 | 13.9 kB | 404 lot |
| eslint + 5 plugins, autoprefixer, postcss | dev | oxlint, Tailwind v4 | – | B / C |

The 9 libraries with "Replace with" entries above total about **107 kB gz of JS and 8 kB gz of CSS** in the eager path. The recommended GSAP set plus Lenis adds 59 kB gz.

## 9. Vercel

**Deep links**
- Vercel serves files before rewrites [doc], and today unknown paths fall through to its plain 404.
- With the router dropped, `public/404.html` is all that's needed.
- If a router is kept, add the documented SPA rewrite: `{ "source": "/(.*)", "destination": "/index.html" }` [doc].

**Caching**
- Vercel gives automatic `immutable` caching only to `/_next/static/immutable/` and `/_vercel/immutable/` [doc]. Vite's `/assets/*` is not covered.
- But `public/assets/*`, unhashed images such as `foto.jpg`, also lands in `/assets/`. A naive `/assets/(.*)` immutable rule would freeze them for a year.
- **Smallest fix:** move Vite's *hashed* output instead: `build: { assetsDir: '_app' }`. That is one line, and it avoids editing 12 image paths in 3 files.

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { assetsDir: '_app' }, // hashed files only; public/assets keeps normal revalidation
})
```

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "headers": [
    { "source": "/_app/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
  ]
}
```

**Node.** Add `"engines": { "node": "24.x" }`.
- It overrides Project Settings, and Vercel deploys the latest 24.x [doc].
- It matches local 24.18.1.
- It satisfies every pinned tool: Vite 8, Vitest 5, jsdom 31 at ≥24.15, React Router 8 at ≥22.22, and Lighthouse 13 at ≥22.19.
- The project's current Node setting is UNVERIFIED. Node 20 was deprecated 2026-10-01, and no deploy has happened since June.

**Build gate at zero CI cost [src].** When no Build Command override is set, Vercel's static builder runs the first existing script from `vercel-build`, `now-build`, `build`. Whether this project has an override is UNVERIFIED.

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "oxlint",
  "test": "vitest run --passWithNoTests",
  "check": "oxlint && tsc -b && vitest run --passWithNoTests",
  "vercel-build": "npm run check && vite build",
  "e2e": "playwright test",
  "preview": "vite preview"
}
```

**Preview deployments [doc]**
- Vercel creates a preview for every push to a non-production branch and for every PR, and comments on the PR. Each preview gets a branch URL and a commit URL.
- New projects get **Standard Protection with Vercel Authentication**: previews need a Vercel login, while production stays public. This project dates from 2024-11, so its protection setting is UNVERIFIED.
- For automation, send `x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET`, plus `x-vercel-set-bypass-cookie: true` for browsers. This is available on all plans.
- Previews get `X-Robots-Tag: noindex`.

**Environment variables.** Set `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID` and `VITE_EMAILJS_PUBLIC_KEY` for both Production and Preview. They are public by design, because the browser calls EmailJS. Tests must stub the request with `page.route`, since `blockHeadless` would reject Playwright.

## 10. Quality gates

### 10.1 Lint and types

`.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc", "jsx-a11y", "vitest"],
  "categories": { "correctness": "error" },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/exhaustive-deps": "warn",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  },
  "ignorePatterns": ["dist"]
}
```

On today's `src/` this config raises [measured]:

| Finding | Count |
|---|---|
| `no-unused-vars` | 22 |
| `exhaustive-effect-dependencies` | 3 |
| jsx-a11y (`no-static-element-interactions`, `click-events-have-key-events`) | 6 |
| `immutability` | 1 |

It runs in about 9 s including npx start-up. ESLint 9.15 took 96 s on the same machine for 6 files.

Type checking is `tsc -b` (§5).

### 10.2 Unit tests

Vitest 5.1.0 needs no config file; it reuses `vite.config.ts`. Put tests in `src/**/*.test.ts` and keep the default `node` environment.

Test pure logic only:
- the loader's 5-milestone state machine (ready-check report),
- the champion → role mapping,
- contact validation,
- the reduced-motion and tier decisions.

Add jsdom 31 and Testing Library only when a component test earns it.

### 10.3 Playwright

Visual smoke tests run against every preview.

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
export default defineConfig({
  testDir: 'e2e',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:4173',
    extraHTTPHeaders: bypass ? { 'x-vercel-protection-bypass': bypass, 'x-vercel-set-bypass-cookie': 'true' } : {},
    contextOptions: { reducedMotion: 'reduce' },
  },
  webServer: process.env.BASE_URL ? undefined
    : { command: 'npm run build && npx vite preview --port 4173 --strictPort', url: 'http://localhost:4173' },
  projects: [
    { name: 'desktop', use: devices['Desktop Chrome'] },
    { name: 'mobile', use: devices['Pixel 7'] },
  ],
})
```

```ts
// e2e/smoke.spec.ts
import { test, expect } from '@playwright/test'
test('page boots clean', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto('/')
  for (const id of ['home', 'projects', 'stack', 'contact']) await expect(page.locator(`#${id}`)).toBeAttached()
  expect(errors).toEqual([])
})
test('hero looks right', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot('hero.png', { mask: [page.locator('canvas')], maxDiffPixelRatio: 0.01 })
})
test('unknown path is a real 404', async ({ page }) => {
  expect((await page.goto('/no-such-page'))?.status()).toBe(404)
})
```

Notes:
- WebGL works headless because Playwright 1.65 passes `--enable-unsafe-swiftshader` [src]. Chrome removed the automatic SwiftShader fallback in 137 [doc].
- Mask the canvas anyway. SwiftShader output is not pixel-stable.
- Screenshot baselines are platform-suffixed, so generate them on Linux (CI or `mcr.microsoft.com/playwright:v1.65.0-noble`), not on the Windows dev box.

Workflow:

```yaml
# .github/workflows/e2e-preview.yml
name: e2e on Vercel preview
on: deployment_status
jobs:
  e2e:
    if: github.event.deployment_status.state == 'success' && github.event.deployment.environment == 'Preview'
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with: { node-version: 24, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
        env:
          BASE_URL: ${{ github.event.deployment_status.environment_url }}
          VERCEL_AUTOMATION_BYPASS_SECRET: ${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}
```

The environment name `Preview` is UNVERIFIED until the first preview exists. Today only `Production` has ever appeared.

### 10.4 Budgets

| Budget | Value | Basis |
|---|---|---|
| Eager JS | **≤ 170 kB gz** | floor measured: React 19.3.1 + the GSAP set + Lenis = 127.6 kB gz, plus about 40 kB for app code and icons. Today it is 377 kB |
| Lazy 3D chunk | ≤ 310 kB gz | webgl §7 measured 301 kB |
| CSS | ≤ 20 kB gz | |
| Fonts | ≈ 50 KB | type report |

Enforcement:
- Vite prints gzip sizes on every build. Set `build.chunkSizeWarningLimit` and read the preview build log.
- Optional Lighthouse CI: `npx -y @lhci/cli@0.16.0 autorun` against `staticDistDir: ./dist`, with assertions such as:
  - `categories:accessibility ≥ 0.95`
  - `cumulative-layout-shift ≤ 0.1`
  - `largest-contentful-paint ≤ 2500` (warn)
  - `resource-summary:script:size` (bytes)
- Use `resource-summary`, not `budget.json`. Lighthouse 13.6.0 still ships `resource-summary` and `total-byte-weight`, but no `performance-budget` or `timing-budget` audits [measured, package file list].

## 11. Migration sequence (one branch → PR → preview → merge per lot)

Every lot ends with `npm run build`, a look at the Vercel preview, and then a merge.

**Lot A: `chore/cleanup`.** No visual change except the in-queue music, which goes for legal reasons.

```bash
git switch -c chore/cleanup
npm rm react-spring react-three-fiber react-modal react-tooltip react-scroll classnames typewriter-effect use-sound
git rm -r src/components/projects src/components/MainSection/MatchControls.tsx \
  src/hooks/scrollToTop.ts src/hooks/smoothScroll.ts src/hooks/SoundPlayer.tsx public/sounds/inqueue.mp3
# edit Sidebar/FloatingGrid.tsx: remove the SoundPlayer import and <SoundPlayer/>
# add vercel.json (§9), "engines": {"node": "24.x"}, build.assetsDir '_app' in vite.config.js
npm run build
```

Risks:
- None for the bundle: these dependencies were unused.
- This lot is the prerequisite for the clean installs in Lots C and D (§6.2).

**Lot B: `chore/tailwind-4`**

```bash
git switch -c chore/tailwind-4
# trim tailwind.config.js to: export default { content: ['./index.html','./src/**/*.{js,ts,jsx,tsx}'] }
npx @tailwindcss/upgrade@4.3.5          # needs a clean git tree; deletes the config, rewrites 12 files
npm rm @tailwindcss/postcss postcss && git rm postcss.config.js
npm i -D -E tailwindcss@4.3.5 @tailwindcss/vite@4.3.5
# vite.config: plugins: [react(), tailwindcss()]; index.css: source(none) + @source lines (§3.1)
npm run build
```

Risk: small visual drift from the v4 defaults (§3.1). Compare the preview against production at 375 px and 1440 px.

**Lot C: `chore/vite-8-ts-7`**

```bash
git switch -c chore/vite-8-ts-7
npm rm eslint @eslint/js eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh globals
git rm eslint.config.js
npm i -D -E vite@8.3.7 @vitejs/plugin-react@6.3.0 typescript@7.0.2 oxlint@1.93.0 @types/node@24.19.2
git mv vite.config.js vite.config.ts && git mv src/main.jsx src/main.tsx && git mv src/App.jsx src/App.tsx
# add tsconfig.json / tsconfig.app.json / tsconfig.node.json (§5), .oxlintrc.json (§10.1), scripts (§9);
# index.html: /src/main.tsx
npx tsc -b      # fix the ~7 real errors, delete unused imports
npx oxlint && npm run build
```

Risks:
- Vite 8 changed CommonJS default-import interop [doc]. Here `aos`, `emailjs-com` and `use-sound` were affected; `use-sound` is already gone.
- The build passed in scratch. Click-test the contact form and the AOS reveals on the preview.
- Escape hatch: `legacy: { inconsistentCjsInterop: true }`.

**Lot D: `chore/react-19-r3f-9`**

```bash
git switch -c chore/react-19-r3f-9
npm rm @react-three/fiber @react-three/drei framer-motion          # avoids the ERESOLVE (§6.2)
npm i -E react@19.3.1 react-dom@19.3.1 @react-three/fiber@9.8.2 @react-three/drei@10.7.9 three@0.187.0 framer-motion@14.11.1
npm i -D -E @types/react@19.3.0 @types/react-dom@19.3.0 @types/three@0.187.0
npx tsc -b && npm run build
```

Risks:
- Eager JS goes from 359 to 425 kB gz until the 3D section is lazy-loaded (webgl §2) and framer-motion is deleted in the Stack lot.
- Expect the `THREE.Clock` warning.
- framer-motion 14 is temporary.

**Lot E: `chore/test-gates`**

```bash
git switch -c chore/test-gates
npm i -D -E vitest@5.1.0 @playwright/test@1.65.0 && npx playwright install chromium
# add playwright.config.ts, e2e/smoke.spec.ts, .github/workflows/e2e-preview.yml,
# repo secret VERCEL_AUTOMATION_BYPASS_SECRET (Vercel → Settings → Deployment Protection)
```

The first PR here also proves that previews, protection and the bypass work. Do this before the feature lots.

**Feature lots.** Each section rebuild deletes what it replaced:
- Clock/hero lot: `npm i -E gsap@3.15.1 @gsap/react@2.1.2 lenis@1.3.27 @react-three/postprocessing@3.2.2 postprocessing@6.39.6`. Remove `react-simple-typewriter` and the `scroll-smooth` class.
- Projects lot: remove `swiper`.
- Champion-select lot: remove `aos` and `framer-motion`.
- Contact lot: `npm rm react-toastify emailjs-com && npm i -E @emailjs/browser@5.0.3`.
- Header/social lot: `npm rm react-icons && npm i -E lucide-react@1.70.0`, plus the brand SVG paths.
- 404 lot: `npm rm react-router-dom`, add `public/404.html`, delete `NotFoundPage`.

Rollback for any lot: revert the merge commit. Vercel redeploys `main`, and "Instant Rollback" in the dashboard is available too.

## 12. Uncertainties

- `vite@8.3.7` and `@vitejs/plugin-react@6.3.0` were published on 2026-11-09, one day old. I built this codebase with them. Fallbacks: 8.3.6 and 6.2.1.
- Vercel project settings could not be read without a Vercel login:
  - Node version.
  - Any Build Command override, which would bypass `vercel-build`.
  - Deployment Protection on previews.
  - Whether Git previews are enabled.
- The status code Vercel returns for `404.html` is not stated in the docs. The Playwright 404 test checks it.
- Whether the shadcn CLI works with `paths` and no `baseUrl` (only relevant if shadcn is adopted).
- Whether GSAP's licence allows redistributing its source in a repo is unaddressed; we don't vendor it.
- Whether the GitHub deployment environment name for previews is `Preview`.
- Lighthouse CI on a WebGL page with a loader overlay (SwiftShader timings) may be noisy. Keep Lighthouse advisory (warn) except for accessibility and CLS.
- Timings come from a Windows `%TEMP%` scratch copy where Defender scanning likely inflates cold times. Compare them as ratios only.

## Sources

npm registry, via `npm view <pkg> version dist-tags time peerDependencies engines --json` on 2026-11-10: react, react-dom, @types/react, @types/react-dom, three, @types/three, @react-three/fiber, @react-three/drei, @react-three/postprocessing, postprocessing, gsap, @gsap/react, lenis, vite, @vitejs/plugin-react, @vitejs/plugin-react-swc, typescript, @typescript/typescript6, @typescript/native-preview, tailwindcss, @tailwindcss/vite, @tailwindcss/postcss, @tailwindcss/upgrade, autoprefixer, postcss, shadcn, cn, radix-ui, @radix-ui/react-dialog, @base-ui/react, @base-ui-components/react, sonner, cmdk, vaul, clsx, tailwind-merge, class-variance-authority, tw-animate-css, lucide-react, react-icons, react-router, react-router-dom, eslint, @eslint/js, typescript-eslint, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-react-refresh, eslint-plugin-jsx-a11y, globals, oxlint, vitest, @vitest/browser-playwright, @testing-library/react, @testing-library/dom, @testing-library/jest-dom, jsdom, happy-dom, @playwright/test, @lhci/cli, lighthouse, knip, @emailjs/browser, emailjs-com, framer-motion, motion, swiper, aos, react-toastify, react-simple-typewriter, typewriter-effect, react-modal, react-tooltip, react-scroll, use-sound, react-spring, react-three-fiber, simple-icons, create-vite.

Docs and release notes:
- TypeScript 7.0: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
- TypeScript 6.0: https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/
- Vite 8 announcement: https://vite.dev/blog/announcing-vite8
- Vite 7→8 migration: https://vite.dev/guide/migration
- plugin-react changelog: https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/CHANGELOG.md
- plugin-react README: https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react
- create-vite react-ts template: https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts
- create-vite `setupEslint`: https://github.com/vitejs/vite/blob/main/packages/create-vite/src/index.ts
- create-vite TS 7 PRs: https://github.com/vitejs/vite/pull/23794, https://github.com/vitejs/vite/pull/23841, https://github.com/vitejs/vite/pull/23910
- Tailwind compatibility: https://tailwindcss.com/docs/compatibility
- Tailwind upgrade guide: https://tailwindcss.com/docs/upgrade-guide
- Tailwind source detection: https://tailwindcss.com/docs/detecting-classes-in-source-files
- Tailwind v4.1–4.3 releases: https://github.com/tailwindlabs/tailwindcss/releases
- shadcn Vite installation: https://ui.shadcn.com/docs/installation/vite
- shadcn changelog: https://ui.shadcn.com/docs/changelog
- shadcn CLI v4 entry: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/changelog/2026-03-cli-v4.mdx
- shadcn "Base UI as the default": https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
- shadcn Toast entry: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/changelog/2026-07-toast.mdx
- shadcn `cn` entry: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/changelog/2026-09-cn.mdx
- shadcn alias resolution source: https://github.com/shadcn-ui/ui/blob/main/packages/registry/src/get-config.ts
- Base UI releases: https://base-ui.com/react/overview/releases
- hextech-ui repo: https://github.com/phh235/hextech-ui
- hextech-ui third-party notices: https://github.com/phh235/hextech-ui/blob/main/THIRD_PARTY_NOTICES.md
- hextech-ui theme CSS: https://github.com/phh235/hextech-ui/blob/main/packages/themes/src/hextech.css
- React releases (19.3.0, 19.3.1): https://github.com/facebook/react/releases
- React Router v8 changelog: https://github.com/remix-run/react-router/blob/main/CHANGELOG.md#v800
- three.js r163 (WebGL 1 removed): https://github.com/mrdoob/three.js/releases/tag/r163
- GSAP licence: https://gsap.com/standard-license
- GSAP 3.13 announcement: https://gsap.com/blog/3-13/
- GSAP blog (3.14, 3.15): https://gsap.com/blog/
- ScrollSmoother docs: https://gsap.com/docs/v3/Plugins/ScrollSmoother/
- Lenis README: https://github.com/darkroomengineering/lenis
- lucide v1 release notes: https://github.com/lucide-icons/lucide/releases/tag/1.0.1 and https://lucide.dev/guide/version-1
- EmailJS browser SDK: https://www.npmjs.com/package/@emailjs/browser
- MDN `<dialog>`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog
- caniuse scrollbar styling: https://caniuse.com/css-scrollbar
- Vercel Vite page: https://vercel.com/docs/frameworks/frontend/vite
- Vercel `vercel.json` reference: https://vercel.com/docs/project-configuration/vercel-json
- Vercel CDN cache: https://vercel.com/docs/caching/cdn-cache
- Vercel Node versions: https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
- Vercel Node 20 deprecation: https://vercel.com/changelog/node-js-20-is-being-deprecated
- Vercel environments: https://vercel.com/docs/deployments/environments
- Vercel Deployment Protection: https://vercel.com/docs/deployment-protection
- Vercel automation bypass: https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation
- Vercel custom 404: https://vercel.com/kb/guide/custom-404-page
- Vercel Vite framework preset: https://github.com/vercel/vercel/blob/main/packages/frameworks/src/frameworks.ts
- Vercel static-build script order: https://github.com/vercel/vercel/blob/main/packages/static-build/src/index.ts
- Vitest 5: https://vitest.dev/blog/vitest-5
- Lighthouse CI configuration: https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md
- Lighthouse 13: https://developer.chrome.com/blog/lighthouse-13-0
- Chromium "Intent to Remove: SwiftShader Fallback": https://groups.google.com/a/chromium.org/g/blink-dev/c/yhFguWS_3pM
- Playwright 1.65.0 Chromium switches (package source): https://www.npmjs.com/package/playwright-core

Repo and live checks:
- `gh api repos/abdelmatine/league`, `…/deployments` and `…/deployments/5207088858/statuses`; `gh pr list --state all`.
- `curl` against https://abdelmatine.vercel.app (`/`, `/projects`, `/404`, `/does-not-exist`, `/assets/index-*.js`).

Measurements were made in the scratch copy (`scratchpad/base`, `scratchpad/sizes`):
- Vite 6/8 builds, the Tailwind upgrade tool (3 runs) and TS 6.0.3/7.0.2 checks.
- The `tsconfig` `baseUrl` probe, `npm rm --dry-run` package counts and the ERESOLVE reproductions.
- A Vite 8 preview of React 19 + fiber 9, checked in the browser pane.
- oxlint 1.93.0 and ESLint 9.15.0 runs, and knip 6.44.2.
- esbuild 0.24.0 size measurements, and the playwright-core 1.65.0 and lighthouse 13.6.0 package file lists.

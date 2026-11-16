# Codebase audit: current portfolio (`league`), before the Hextech rebuild

Date: 2026-11-09 (commands run 2026-11-10, local night). Scope: every file in `src/`, `index.html`, configs, `public/`, git history, lint, build, live site. Read-only: no product file was changed (`dist/` was rebuilt; it is gitignored).

Evidence tags: **[code]** read in source (`file:line`), **[measured]** headless Chrome 1440×900 (+8 other sizes) driven over CDP against `npm run dev`, **[build]** `vite build` output, **[npm]** registry query, **[live]** request to https://abdelmatine.vercel.app. Anything not verified is marked **UNVERIFIED**.

---

## 0. TL;DR

1. **Live = HEAD `64d17b4`.** Live CSS hash `index-DxCWZ4gI.css` is identical to the local build. The live JS is 1,307,007 B against 1,307,093 B locally; the 86 B gap comes from CRLF line endings in multi-line `className` strings (`core.autocrlf=true`, so the files are CRLF on this Windows machine). [live][build]
2. **32 source files, 1,852 LOC.** 335 LOC (18%) are dead: `src/components/projects/*` (4 files), `MatchControls.tsx`, `hooks/scrollToTop.ts`, `hooks/smoothScroll.ts`. All 11 custom classes in `index.css` are unused, and two of them (`.transition-transform`, `.translate-y-0`) silently override Tailwind's utilities of the same name. [code]
3. **Lint fails, and TypeScript is never checked.** `npm run lint` exits 1 with 2 errors, and ESLint only matches `**/*.{js,jsx}`, so **29 of 31 code files (every `.ts`/`.tsx`) are never linted**. There is no `typescript` dependency and no `tsconfig`; esbuild strips the types unchecked. [build][code]
4. **One 1,307 kB JS chunk (377 kB gzip).** The three.js family is about 820 KiB minified, 64.2% of the chunk, all loaded eagerly to draw one 664×400 canvas two screens down. That canvas renders with `frameloop="always"` from page load. [build][measured]
5. **About 3.5 MiB of media on every first visit:** 2.38 MiB of images (`electrocute.png` is 2048² and 1.15 MB, displayed at 112 px) plus a 1.11 MiB mp3. [measured]
6. **Hero name "overflow".** A fixed 288 px social sidebar (`z-50`, shown at every breakpoint) covers content that is centred on the full viewport. The 792 px single-line `h1` (72 px) slides under it whenever the viewport is narrower than **1,383 px**: 52 px are hidden at 1280 and 180 px at 1024. On phones the sidebar covers 74–77% of the width. [measured]
7. **Stack "blank at 1440×900".**
   - Reproduced whenever `requestAnimationFrame` does not tick (background tab, hidden preview pane, headless capture). Every visible element of the section is a framer-motion `initial={{opacity:0}}` and stays at 0.
   - In a foreground tab the section does render, with these defects: the 3D panel is 97% empty pixels, 263 px of the canvas sit under the sidebar, and tiles C++ and Python sit under the chat box.
   - Every tile click destroys and recreates the WebGL context, and leaves the canvas at 90% size. [measured]
8. **Audio.**
   - `inqueue.mp3` very probably comes from the League client: ID3 title `InQueue`, ffmpeg `Lavf59.27.100`, `major_brand=dash`, which is the usual signature of a stream rip.
   - It is preloaded on every visit, and the loop **starts on the visitor's first click anywhere on the page**. [measured]
9. **The contact form cannot send.** The EmailJS IDs are literal placeholders (`'YOUR_SERVICE_ID'`…). No key or `.env` was ever committed in any revision. `emailjs-com` is deprecated. [code][npm]
10. **Content is not portfolio-grade.**
    - Two `example.com` links, one third-party link (`bookbub.com`) and one Lorem Ipsum description.
    - Framework links go to a parked domain (`nestjs.org`) and to `react.org`, which is not React.
    - Descriptions are client marketing copy, not engineering content.
    - There is no about, experience, education, CV or meta description anywhere.
11. **Riot IP in the public git history.** A Poro render (`src/assets/poro.png`) and a League "L" logo wallpaper (`src/assets/bg-primary.jpg`) were deleted from HEAD in `e38429b` but remain in history. [code]

---

## 1. Method and environment

- Windows 11, Node 24.18.1, npm 11.16.0, Chrome (`--headless=new`, WebGL2 available), Vite 6.0.1 dev server.
- Throwaway drivers live in the scratchpad: `cdp-audit.mjs`, `cdp-noraf.mjs` (rAF stubbed) and `map-breakdown.mjs` (sourcemap byte attribution). No dependency was installed into the project.
- The audit blocked EmailJS requests with `Network.setBlockedURLs`, so no mail was sent.
- Viewports: 1920×1080, 1536×864, 1440×900, 1366×768, 1280×800, 1024×768, 768×1024, 390×844, 375×812, all with `deviceScaleFactor` 1. The classic scrollbar is 15 px, so `clientWidth` = viewport − 15 on desktop.
- Raw artefacts, under `C:/Users/abdel/AppData/Local/Temp/claude/8d57b08e2422bb31/1bd66213-b433-46ef-8926-dbe5a9999d6c/scratchpad/`:
  - screenshots in `shots/` (`01-hero-1440`, `02-stack-1440-navclick`, `03-stack-1440-react`, `04-projects-1440`, `05-contact-1440`, `06-hero-{1024,1280,1366,375}`, `07-*-375`, `08-404-1440`, `09-stack-direct-hash`, `10-stack-1440-no-raf`)
  - `cdp-results.json`, `cdp-noraf.json`, `breakdown.txt`, `lint.txt`, `build.txt`
  - `hist/` (historical assets)

---

## 2. Repository facts

| Item | Value |
|---|---|
| Stack | React 18.3.1, react-dom 18.3.1, react-router-dom 7.0.1 (BrowserRouter), Vite 6.0.1 + @vitejs/plugin-react 4.3.4 (Babel), Tailwind 3.4.15 + PostCSS/autoprefixer, three 0.171.0, @react-three/fiber 8.17.10, drei 9.118.0 |
| Files | 25 `.tsx`, 4 `.ts`, 2 `.jsx`, 1 `.css`; no `tsconfig.json`, no `typescript` |
| LOC | 1,852 total; largest files are the dead `projects/MainSection.tsx` (138) and `data/projects.ts` (137) |
| Git | 19 commits, 2024-11-28 (`5339de8`) to 2026-06-26 (`64d17b4`); `.git` is 4.8 MB; messages include `sqfkdlhzfjpd`, `f`, `ch`, `1line` (public repo, so recruiters can see them) |
| Deploy | Vercel builds `main` and serves `/` (index 200). There is no `vercel.json`, so `GET /no-such-page` returns **Vercel's own 404 (HTTP 404, 79 B)** and the app's `NotFoundPage` is never served for deep links [live] |
| README | Unmodified Vite template |
| Working tree | Uncommitted: `.gitignore` (+`.superpowers/`); untracked: `.claude/`, `.impeccable/`, `docs/` |

---

## 3. Component inventory

Status values: **live** means rendered on `/`; **dead** means never imported.

| File | Renders | Purpose | Props (declared → actually used) | State | Libs | Status |
|---|---|---|---|---|---|---|
| `src/main.jsx` | root | `createRoot` + `StrictMode` | – | – | react-dom | live |
| `src/App.jsx` | everything | One route `/` stacks `#home` Hero, `#projects` MainSection, `#stack` Stack, `#contact` (`pt-16` wrapper) Contact, and ChatBox. Navbar and Sidebar sit **outside** `<Routes>`, so they also render on 404. Routes `/404` and `*` go to NotFoundPage | passes `onMenuClick` (Navbar ignores it, `:35`) and `timeRemaining={120}` (Stack ignores it, `:59`) | `isSidebarOpen` (Sidebar never reads it), `isSidebarMinimized`, `isPlaying` (only flips two identical PLAY class branches) | react-router-dom | live |
| `Navbar/Navbar.tsx` | fixed header, z-40, 64 px | Logo + 4 anchor tabs (`md:flex`, so there is **no nav at all below 768 px**) + 4 icon buttons + RP/LP + separator; `pr-72` reserves room for the sidebar (`:54`) | `isSidebarMinimized`, `isPlaying`, `toggleSound` | `activeLink`, set on click only, with no scroll-spy (`:36`) | lucide-react | live; Shield/Star/Trophy/Gift buttons are dead (`:57-64`) |
| `Navbar/Logo.tsx` | header left | Hamburger (`lg:hidden`, **no onClick**, `:13`), gold-ring "L" crest (hover `#ad3c07`, off-palette), PLAY pill | `isPlaying`, `toggleSound` | – | lucide-react | live; PLAY has no audible effect |
| `Navbar/UserStats.tsx` | header right | Hard-coded RP `999` / LP `9999`; labels are **8 px** text inside lucide Hexagons | – | – | lucide-react (`Crown`, `Coins` unused) | live, fake |
| `ui/Separator.tsx` | header | 1×40 px gradient rule | `className` | – | – | live |
| `Hero/Hero.tsx` | `#home` | `h1` "Hi, I'm Abdelmatine Sfar" (`text-5xl md:text-7xl`), typewriter quote (189 chars at 50 ms/char, about 9.5 s), CTAs "See My Work" / "Contact Me" (NavLink `#…` + `scrollIntoView`) | – | – (`useState` imported unused) | react-router-dom, react-simple-typewriter | live |
| `MainSection/MainSection.tsx` | `#projects` (`w-screen h-screen`) | Swiper: loop, autoplay 3,000 ms, `disableOnInteraction:false`, 25 px gap, centred; 1 / 3 / 5 slides per view at 640 / 1024 / 1280 px; prev/next + FindMatch; a document click listener restarts autoplay | `projects` | `selectedProject`, `clickedIndex` (never read) | swiper (Navigation, Autoplay; `Pagination` imported but not registered, so the `pagination` prop is ignored), react-icons/fi | live |
| `MainSection/GameCard.tsx` | project card (full slide height, 666 px at 900 px viewport) | 112 px round logo, name, description, framework icons | `name`, `role`, `avatar`, `rating` (never rendered, `:54-56`), `frameworks`, `backgroundImage` (always `""`), `onSelect`, `isClicked` | – | react-icons/fa (`FaStar*` unused) | live |
| `MainSection/FindMatch.tsx` | `#projects` | Opens the selected link with `window.open(…,'noopener,noreferrer')`; with nothing selected it shows **native `alert()`** (`:9`) | `projectLink` | – | – | live |
| `MainSection/MatchControls.tsx` | – | Fixed "FIND MATCH" bar | – | – | lucide-react | **dead** |
| `projects/MainSection.tsx` | – | Fork of MainSection with popup state that never renders the popup | `projects` | 3 states | swiper | **dead** |
| `projects/ProjectCard.tsx` | – | Fork of GameCard | same | – | – | **dead** |
| `projects/FindMatch.tsx` | – | Fork without hover fill (`useNavigate` unused) | `projectLink` | – | react-router-dom | **dead** |
| `projects/ProjectDescription.tsx` | – | Modal: frameworks list + image Swiper; reads `project.images`, which no data has | untyped | – | **`@headlessui/react` (not installed)**, swiper, lucide | **dead**; importing it would break the build |
| `Stack/Stack.tsx` | `#stack` (`h-screen w-screen`) | Title, 12-tile grid (`grid-cols-2…lg:grid-cols-5`), detail panel (3D icon 400 px + title + typewriter). `AOS.init({duration:800, once:false, easing:'ease-in-out'})` (`:22-29`) | `stacks` | `selectedItem` | framer-motion, aos, react-simple-typewriter | live |
| `Stack/GridItem.tsx` | stack tile | `motion.div` spring drop-in (stiffness 260, damping 20, delay `index×0.1`), `img`; `border-gold` is not defined anywhere | `icon`, `title`, `index`, `onClick` | – | framer-motion | live; **not focusable** |
| `Stack/IconScene.tsx` | stack 3D | `<Canvas>` with defaults (frameloop `always`, dpr [1,2], ACES, sRGB); camera [0,2,4]; OrbitControls (zoom off); ambient 0.7; point 1.5 @[10,10,10]; spot 2 @[0,5,0] `castShadow` (shadows not enabled, so a no-op) | `iconUrl` | – | @react-three/fiber 8, drei 9 | live |
| `Stack/FloatingIcon.tsx` | stack 3D | `useTexture(svg)` on `Box 1×1×0.1`; bobs ±0.2, spins 0.01 rad/frame; fake shadow plane | `iconUrl` | refs | three, drei | live |
| `Contact/Contact.tsx` | `#contact` (has its own `id="contact"`, so the id is **duplicated** with App's wrapper) | Name, email, message, Send (`type="button"`) → `emailjs.send` with placeholders (`:26`); 1-hour cooldown kept in React state; `<ToastContainer/>` (light theme) | – | `name`, `email`, `message`, `lastSent` | emailjs-com, react-toastify | live; **cannot send** |
| `Chat/ChatBox.tsx` | fixed bottom-left, 256×278 px, z-50, ≥640 px only | Fake lobby chat: 4 hard-coded messages ("gg ez!", "go next", "support diff"); uncontrolled unlabeled input; Send does nothing | – | `isMinimized` | lucide-react | live, fake |
| `Sidebar/Sidebar.tsx` | fixed right, **288 px × 100 vh, z-50, every breakpoint** | Profile, "SOCIAL" with 4 dead icon buttons (`:47-58`), "GENERAL (2/66)", 4 social links shown as friends (`<ul>` > `<a target=_blank>` with no `<li>` and no `rel`), footer controls | `isOpen` (**ignored**), `onClose` (never called), `onMinimize`, `isMinimized` | – | lucide-react | live |
| `Sidebar/UserProfile.tsx` | sidebar top | `foto.jpg`, "Arch Efferalgon", "Creating Ranked..."; minimize; ExternalLink (no handler); **X calls minimize** | `onClose` (unused), `onMinimize` | – | lucide-react | live |
| `Sidebar/Friend.tsx` | sidebar rows | Avatar + name + status; the dot tests `'In Game'` (`:19`) but data and label use `'InGame'` (`:28`), so GitHub shows a grey dot under a blue "In Game" label | `name`, `status`, `avatarUrl`, `url` (unused) | – | – | live |
| `Sidebar/FloatingGrid.tsx` | sidebar footer | Mic toggle (icon only), **Headphones = queue music, default ON** (`:8`), "V1.0", Settings (dead); mounts SoundPlayer | – | `isMuted`, `isPlaying=true` | lucide-react, react-icons/fi (`Mic` unused) | live |
| `hooks/SoundPlayer.tsx` | – (returns null) | `useSound('/sounds/inqueue.mp3', {loop:true, volume:0.2})` | `isPlaying` (untyped) | – | use-sound → howler (lazy chunk) | live |
| `hooks/scrollToTop.ts` | – | `ScrollToTop` component | – | – | react-router-dom | **dead** |
| `hooks/smoothScroll.ts` | – | `useSmoothScroll(offset)` | – | – | – | **dead** |
| `notFound/NotFoundPage.tsx` | `/404`, `*` | "404" plus project-specific copy and a teal button | – | – | react-router-dom | live in the SPA, **unreachable from deep links on Vercel** |
| `index.css` | global | Tailwind layers; an autofill override that is worth keeping (`#091428` fill / `#C8AA6E` text); 9 unused classes (`.vault-container`, `.top-bar`, `.card-grid`, `.card`, `.glow-effect`, `.translate-y-negative`, `.my-swiper-container`, `.stack-item`, `.selected-icon`) and 2 utility shadows (`.transition-transform` → 0.5 s, `.translate-y-0` → also sets `opacity:1` and breaks `--tw-*` composition) | – | – | – | partly dead |

Hard-coded colours: there are **141 arbitrary `[#hex]` values**, using 19 distinct colours. The top five are `#C8AA6E`×33, `#A09B8C`×31, `#1E2328`×18, `#252931`×11 and `#0AC8B9`×11. Most already match the palette in `2026-11-09-lol-client-ui.md`; `#252931`, `#111111`, `#044E48`, `#AD3C07`, `#2E2E2E`, `#0DDECF`, `#0A0A0A`, `#088F81` and `#010E18` are off-palette. `tailwind.config.js` defines no tokens, and its `theme.extend.overflow` and `scrollBehavior` are not Tailwind theme keys, so they do nothing. No web font is loaded: the `h1` renders in system-ui (Segoe UI on Windows). [code][measured]

---

## 4. Data model

### 4.1 `src/data/projects.ts`: 11 untyped objects

| Field | Meaning in practice | Problem |
|---|---|---|
| `id` | 1–11 | ok |
| `name` | Display name | Inconsistent casing: "PlanIfy" vs "PlaniFy" in its own text, "ELECTROCUTE", "MONO" |
| `role` | Actually the **description** | Misnamed; holds customer-facing marketing copy ("Shop smarter at SmartShop…"), not what the owner built |
| `avatar` | Logo shown at 112×112 | Oversized or undersized files (see §9.2) |
| `rating` | 3.8–4.5 fake "ranked" score | Never rendered |
| `link` | Live URL | 2 placeholders and 1 third-party link (below) |
| `frameworks[]` | `{asset: '/icons/x.svg', url}` | Icon `alt` = URL; wrong homepages |

Missing fields: year, my role, team size, problem, what I built, outcome or metrics, repo link, status (live/client/archived), screenshots.

Per project (link checks: [live] `curl -L`, 2026-11-10):

| # | Name | Description | Link → result | Notes |
|---|---|---|---|---|
| 1 | Fixed APP | **Lorem Ipsum** ("There are many variations of passages of Lorem Ipsum…") | `https://fixedapp.example.com` → **DNS fail (placeholder)** | `ord.jpg` 1600² for a 112 px slot |
| 2 | ELECTROCUTE | Shop copy | `electrocuute.vercel.app` → 200 "Electrocute" | `electrocute.png` 2048², 1.15 MB; React URL `https://react.org/` is **not React** (react.dev) |
| 3 | PlanIfy | Product copy | `planify.vercel.app` → 200, title **"React App"** | Ownership and stack UNVERIFIED: the CRA-default title conflicts with the claimed Next.js + React Native |
| 4 | Mondas Öl | Shop copy | `mondas-ol.vercel.app` → 200 | Avatar is the **32×32 `.ico` upscaled to 112 px**, while `mondas.png` (1024², 1.1 MB) sits unused; NestJS URL `https://nestjs.org/` → **parked domain** (redirects to `ww547.nestjs.org/?tkn=…`); real site is nestjs.com |
| 5 | Zinine Gym | Gym copy | `zininegym.netlify.app` → 200 | `gym.jpg` is really **WebP** 600² with a `.jpg` name |
| 6 | E Books | Generic ebook-store copy | **`https://www.bookbub.com/`, a third-party commercial site, not a project** | Generic `book.png` icon |
| 7 | E Commerce | Copy says "SmartShop" (name mismatch) | `https://ecommerce.example.com` → **DNS fail (placeholder)** | `eco.jpg` 1639×1159 |
| 8 | Glimmer & Grace | Shop copy | `glimmergrace.vercel.app` → 200 | `glimmer.png` 1024² RGB, 542 kB |
| 9 | VEHICOOL | Marketplace copy | `vehicool.vercel.app` → 200 | `vehicool.svg` is `fill="#000000"`, so black on a dark grey circle |
| 10 | Sam Médicale | Store copy | `sammedicale.com.tn` → 200 ("SAM Medicale — CPAP, BiPAP et oxygène…") | Client project: confirm permission to showcase; 5 framework icons incl. the nestjs.org link |
| 11 | MONO | Fashion copy | `monoo.lovable.app` → 200 | Hosted on Lovable but claims Spring Boot + Next.js: UNVERIFIED; `mono.svg` is an EmojiOne emoji (`class="iconify--emojione"`), whose licence may require attribution (UNVERIFIED) |

### 4.2 `src/data/stacks.ts`: 12 objects `{id: string, icon, count, title, description}`

- `id`s run '1','2','3','5','6','4','8',…,'13': no '7', out of order. Harmless, but shows hand editing.
- **`count` is never read anywhere.** Its values (C++ 13, React Native 12, JavaScript 11, Angular 10, SpringBoot 8, Flutter 7, TypeScript 6, React 5, Java 4, Qt 3, C 2, Python 1) have no stated meaning and contradict `projects.ts`: React appears in 3 projects and gets 5, Python appears in 0 and gets 1.
- Descriptions are encyclopedia one-liners with typos ("devoloped", "A Framework" capitalised mid-sentence).
- **Missing techs that the projects use:** Next.js (5 projects), PostgreSQL (4), NestJS (2), Supabase, Redis, MinIO. Icons exist but go unused for `kotlin.svg` and `nodejs.svg`.
- **Listed but used by no project:** Flutter, Qt, C, C++, Python.
- For the champion-select mapping (roles TOP/JG/MID/BOT/SUP and main vs learning, per `2026-11-09-champ-select.md` §5) the data needs `role`, `tier`, `since` (or years) and `projectIds[]`, plus a vector logo source. See §12.

---

## 5. Behaviours

### 5.1 Social sidebar [code][measured]

- Always mounted at `fixed right-0 bottom-0 w-72 h-screen z-50`. **No breakpoint hides it, and `isOpen` is ignored.** It covers 15% of the width at 1920, 20% at 1440, 28% at 1024, 38% at 768, 74% at 390 and 77% at 375.
- Minimize only collapses the height to `h-16`; the 288 px width stays. The navbar hamburger has no handler, so phones cannot dismiss it.
- Content is fake: the "GENERAL (2/66)" count, "Arch Efferalgon / Creating Ranked…", and statuses GitHub "In Game", Facebook "Online", LinkedIn and Instagram "Offline".
- The 4 header social buttons, ExternalLink and Settings are dead. Only the 4 friend rows are real links (to the GitHub, Facebook, LinkedIn and Instagram profiles).

### 5.2 Chat box [code]

- Fully fake, with no network code: 4 hard-coded messages. The input's value goes nowhere and Send has no handler.
- Hidden below 640 px. Above that it permanently covers 256×278 px at the bottom-left: at 1440×900 it hides the first project card and the C++ and Python tiles. [measured]
- Tone risk on a recruiter-facing page: "gg ez!", "support diff".

### 5.3 Sound player [code][measured]

- `FloatingGrid` mounts `SoundPlayer` with `isPlaying=true`.
- use-sound lazy-imports howler (36.9 kB chunk) and creates a `Howl` with Howler's defaults `preload: true` and `autoUnlock: true`, so the **1,160,402 B mp3 downloads on every visit**.
- Before any gesture: `AudioContext` is `suspended` and the Howl is `loaded` but not playing. Chrome logs "The AudioContext was not allowed to start…" on every load.
- After **one click on an inert spot of the hero**, the context is `running`, `playing: true`, `seek 1.28 s`. **The 72.5 s queue loop starts on the first click anywhere**, at 20% volume.
- The only stop control is an unlabeled headphones icon whose red tint means "muted".
- The navbar PLAY button toggles `App.isPlaying`, which drives no audio at all.
- File: 128 kbps, 48 kHz, joint stereo, ID3 `TIT2=InQueue`, `TSSE=Lavf59.27.100`, `TXXX major_brand=dash`. The DASH brand plus the title strongly suggest a rip of the client's in-queue music. **Origin UNVERIFIED, but treat it as Riot audio and delete it.**

### 5.4 Contact form and EmailJS [code][measured]

- **Keys:** `emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_USER_ID')` at `Contact.tsx:26`. There is no `import.meta.env` anywhere in `src/` and no `.env*` file has ever existed in history.
  - `git log --all -p` and `git grep` across every revision find only these placeholders. **No secret was ever committed.**
- **Result:** every send fails, so users always get the "Failed to send email." toast and `console.log('FAILED...', err)` runs. Measured with the request blocked; EmailJS's actual 4xx body for placeholder IDs is UNVERIFIED.
- **Validation:** none. Empty fields still call EmailJS, and `type="email"` is never enforced because the button is `type="button"` and the form has no `onSubmit`. Enter does not submit, because a form with two text inputs and no submit button gets no implicit submission.
- The "1 per hour" rate limit lives in React state and resets on reload.
- **EmailJS model:** the public key is designed to be public. EmailJS argues that a copied key can only send *your* templates. Protection lives in the dashboard (origin allowlist on the request's source header, IP rate limits, opt-in reCAPTCHA) and in SDK options (`limitRate {id, throttle}` → 429, `blockHeadless` → 451, `blockList` → 403).
- **Package:** `emailjs-com` 3.2.0 is deprecated ("The SDK name changed to @emailjs/browser"); latest `@emailjs/browser` is 5.0.3. [npm]

### 5.5 Navigation, scroll hooks, deep links [code][measured]

- Navbar uses plain `<a href="#id">` and `html.scroll-smooth`. Hero CTAs use `NavLink to="#projects"` with `preventDefault` + `scrollIntoView({behavior:'smooth'})`.
- The active tab changes only on click, with no scroll-spy: it stays "HOME" while the user reads the stack.
- **Deep links fail:** loading `/#stack` leaves `scrollY = 0`, because the target does not exist when the browser processes the fragment and nothing re-scrolls after mount.
- `hooks/scrollToTop.ts` and `hooks/smoothScroll.ts` are never used, and `react-scroll` is installed but unused.
- AOS uses `once:false`, so items fade out and back in on every pass. framer-motion entrance animations run at mount, off-screen, so users never see them; that duplicates AOS on the same nodes.

### 5.6 404 [code][live]

- `NotFoundPage` is reachable only through client-side navigation, and the page contains no internal links to unknown routes.
- On Vercel there are no SPA rewrites, so `/anything` returns the platform 404 (HTTP 404, 79 B). Vercel's docs say SPA deep links need a `vercel.json` rewrite; a static site can instead emit `404.html` into the output directory.
- When the page does render (dev), the header and sidebar sit on top of it. The copy ("The project link you're looking for…") dates from an abandoned per-project routing idea (commit `4d935a7` "projects routing").

---

## 6. Bugs, ranked

| # | Bug | Root cause | Evidence | Fix direction |
|---|---|---|---|---|
| B1 | **Hero name hidden at desktop widths** | (a) fixed 288 px sidebar overlays content at every breakpoint, and the content is not offset; (b) the `h1` is 72 px from `md` (768 px) up and measures 792 px on one line; its `max-w-screen-lg` wrapper is a shrink-to-fit flex item capped at 1,024 px, so the line never wraps once ≥ 792 px is free (viewport ≳ 855 px); (c) `w-screen` (100vw) on `#main-section` and Stack makes the document 15 px wider than `clientWidth` (1440 vs 1425), masked by `body{overflow-x:hidden}` | Glyphs hidden: 1366 → 8.5 px, 1280 → 51.5 px ("r" of Sfar), 1024 → 179.5 px ("e Sfar"); 768: 2 lines, roughly half hidden. Fully visible only for viewport ≥ **1,383 px** (Windows scrollbar). Fully typed quote (976 px box): 16 px hidden at 1536 (measured), 63 px at 1440 (computed), 144 px at 1280 (measured) [`06-hero-*.png`] | Make the social panel a closed drawer (or a real grid column ≥1440 px); `font-size: clamp()` on the h1 plus `text-wrap: balance`; drop every `w-screen` |
| B2 | **Stack blank at 1440×900** | Every visible element is framer-motion `initial={{opacity:0}}` animated by rAF; AOS wrappers start at `opacity:0` too. When rAF does not tick (background tab at load, hidden preview pane, headless or crawler capture), framer never advances | With rAF stubbed, AOS reaches 13/13 animated yet **15 motion elements stay at inline `opacity:0`**: title, 12 tiles and detail are invisible, and the canvas never draws (`10-stack-1440-no-raf.png`) | Never gate content visibility on JS animation: render visible by default and animate *from* hidden only when JS is running, motion is allowed and the element is in view (GSAP `from` + ScrollTrigger + `gsap.matchMedia`) |
| B3 | Stack 3D panel effectively empty in a foreground tab | Logo texture on an opaque box (transparent SVG pixels render black, the texture repeats on all 6 faces); legacy light values under three ≥ r155 physically-correct lighting (point 1.5 cd at about 16.5 units ≈ 0.5% contribution; the spot sits straight above, so it grazes the front face); ACES tone mapping | Lit pixels **3.11%** (Angular), mean luma 1.8/255; React: **0.99%**, max luma 85 [measured] | Replace with extruded real logos (3d-logos topic), lit for the target renderer; or the 2D tile art |
| B4 | 263 px of the stack canvas (40%) and the detail title or description sit under the sidebar | Same as B1 | Canvas spans x 736–1400; sidebar starts at 1137 | Same as B1 |
| B5 | Every tile click recreates the WebGL context and the canvas shrinks to 90% | `motion.div key={selectedItem.id}` (`Stack.tsx:73-81`) remounts `<Canvas>`. R3F measures with `getBoundingClientRect` while framer's `initial scale:0.9` applies, and a ResizeObserver does not fire on transform changes | Console logs "THREE.WebGLRenderer: Context Lost." per switch; canvas becomes 599×361 instead of 664×400 until the next scroll or resize; `/#stack` load gives 597×360 [measured] | One persistent canvas; swap models inside it; never scale the canvas container |
| B6 | Tiles C++ and Python are hidden at 1440×900 | Fixed ChatBox (z-50, 256×278 px) over the 3rd grid row | Elements at (63,653) and (198,653) are covered by the chat panel [measured] | Delete ChatBox |
| B7 | Queue music starts on the first click anywhere | Default `isPlaying=true` plus Howler `autoUnlock` | §5.3 [measured] | Muted by default; load audio only after an explicit unmute |
| B8 | Mobile unusable | Sidebar covers 77% at 375 px; no nav below 768 px; dead hamburger | `06-hero-375.png`, `07-*-375.png` [measured] | Drawer plus mobile nav |
| B9 | Stack overflows its section on mobile | `h-screen` section with 1,292 px of content in an 812 px viewport; patched by Contact `pt-[560px] md:pt-0` (commit `f06d880` "provisional") | [measured] | `min-h` instead of `h-screen`; remove the hack |
| B10 | Duplicate `id="contact"` | `App.jsx:61` wrapper and `Contact.tsx:38` | `[id]` duplicates: `["contact"]` [measured] | One id |
| B11 | Deep links `/#section` land at the top | Fragment resolved before React mounts | `scrollY 0` after loading `/#stack` [measured] | After mount (and after the loader), `scrollIntoView` the `location.hash` target |
| B12 | Client 404 never served in production | No `vercel.json` rewrite or `404.html` | `GET /no-such-page` → Vercel 404 [live] | Emit `404.html` (one-page site) or add the rewrite |
| B13 | "Find Project" with nothing selected shows a blocking `alert()`; card selection is mouse-only | `FindMatch.tsx:9`; `div onClick` | Dialog text captured: "Please select a project to find its match!" [measured] | Real buttons or links per card |
| B14 | Friend status dot wrong for GitHub | `'In Game'` vs `'InGame'` (`Friend.tsx:19/28`) | Grey dot under the "In Game" label [measured] | Typed enum |
| B15 | Wrong outbound links | `nestjs.org` (parked), `react.org` (not React), `bookbub.com`, 2× `example.com` | §4.1 [live] | Fix data |
| B16 | Touch scroll trap over the 3D canvas | drei OrbitControls (three-stdlib) sets `touch-action: none` on the canvas (`three-stdlib/controls/OrbitControls.js:299`) | [code]; not tested on a device | No OrbitControls on scroll pages |
| B17 | Dead controls | Navbar Shield, Star, Trophy, Gift; hamburger; PLAY; sidebar socials ×4, ExternalLink, Settings, Mic (visual only); Chat Send | [code] | Remove or wire up |
| B18 | Type errors invisible | No tsc. By inspection: `onMenuClick` not in `NavbarProps`, `material.opacity` on `Material \| Material[]` (`FloatingIcon.tsx:33`), several implicit-`any` params (`SoundPlayer`, `Hero.handleSmoothScroll`, `projects/*`), `@headlessui/react` missing | [code]; error count UNVERIFIED | Add TS + `tsc --noEmit` in CI |

### Console and build output

| Source | Message | When |
|---|---|---|
| Chrome | "The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture…" | Every page load (14 of 14 loads) |
| three | "THREE.WebGLRenderer: Context Lost." | Every stack tile switch (B5) |
| App | `FAILED... EmailJSResponseStatus` | Every Send |
| React | No warnings captured: keys are present, `validateDOMNesting` silent | – |
| `npm run lint` | `App.jsx:1:8 'React' is defined but never used`; `docs/checkpoints/research-resume.workflow.js:178:1 Parsing error: 'return' outside of function` (untracked file; ESLint ignores only `dist`) | exit 1 |
| `vite build` | Chunk > 500 kB; "Use of eval in node_modules/three-stdlib/libs/lottie.js" (transform-time warning; lottie is not in the bundle, since three-stdlib's share is 13.7 KiB); "caniuse-lite is 24 months old" | exit 0, 1 m 43 s to 2 m 24 s for 2,609 modules |
| `npm audit` | 34 issues (2 critical, 19 high, 10 moderate, 3 low). **Shipped to users:** `swiper` critical prototype pollution (GHSA-hmx5-qpq5-p643, fixed in ≥12.1.2) and `react-router` open-redirect XSS (GHSA-2w69-qvjg-hvjx, ≤7.11.0). The rest is dev or build tooling (e.g. vite dev server GHSA-vg6x-rcgg-rjx6, esbuild GHSA-67mh-4wv8-2f99) | – |

---

## 7. Accessibility [measured unless marked]

| WCAG 2.2 SC | Finding |
|---|---|
| 4.1.2 Name, Role, Value (A) | **20 of 23 `<button>`s have no accessible name** (icon-only lucide buttons); the chat input has no label (placeholder only) |
| 2.1.1 Keyboard (A) | Project cards and stack tiles are `div onClick`, not focusable, so keyboard users cannot select a project or a tech |
| 2.4.1 Bypass Blocks / 2.4.3 Focus Order (A) | **24 Tab stops** (header plus sidebar) before the first hero CTA; no skip link. Tab then walks into **off-screen Swiper slides** (focused link at x = −666 px) |
| 2.4.7 Focus Visible (AA) | Only the browser default outline (`auto 1px`) exists; no styled `:focus-visible`. Inputs have a 2 px gold ring (ok) |
| 1.1.1 Non-text Content (A) | Framework icon `alt` = URL on all 27 project framework icons; decorative avatars repeat the visible names |
| 1.3.1 Info and Relationships (A) | `<ul>` whose children are `<a>`; DOM heading order is h2 "SOCIAL", h6 "GENERAL", then the h1; **no `<main>`, `<header>`, `<footer>`** landmarks |
| 1.4.2 Audio Control (A) | 72.5 s looping audio starts on the first unrelated click; the stop control is an unlabeled icon (§5.3) |
| 2.2.2 Pause, Stop, Hide (A) | Carousel autoplays every 3 s with no pause control; selected card image uses `animate-pulse` (infinite); typewriter runs about 9.5 s |
| 2.3.3 / `prefers-reduced-motion` | **Zero reduced-motion rules** in the CSS. framer's `MotionConfig.reducedMotion` defaults to `"never"`. Under emulated `reduce`, the typewriter kept typing (131 → 189 chars over 3.5 s) and Swiper advanced (PlanIfy → Zinine Gym) |
| 1.4.10 Reflow (AA) | At 320–390 px the sidebar covers 74–77% of the viewport |
| 1.4.3 Contrast (AA) | Chat timestamp `#5B5A56` on `#1E2328` = **2.29:1 (fail)**. Passing pairs: `#A09B8C` on `#111111` 6.80, on `#010A13` 7.17, on `#1E2328` 5.70; `#0AC8B9` on `#010A13` 9.46; gray-400 statuses 7.68; blue-500 "In Game" 5.30; input text `#C8AA6E` on `#091428` 8.26 |
| 1.4.11 Non-text Contrast (AA) | CTA borders `#044E48` on `#010A13` 2.08:1 and `gray-600` on `#062033` 2.20:1 (label text carries the meaning, so this is low impact) |
| Legibility | 8 px "RP"/"LP" labels; 12 px statuses |
| Meta | `lang="en"` ok; title "Abdelmatine" only; no meta description, OG tags, `theme-color` or `apple-touch-icon`. The favicon is a black single-colour potrace SVG (474 pt), nearly invisible on dark tab strips |

---

## 8. Performance

### 8.1 JS: one eager chunk [build][sourcemap attribution]

`index-DI3NHAzR.js` is **1,307.08 kB minified / 376.99 kB gzip**; `howler-*.js` is 36.91 kB / 10.13 kB gzip (lazy); CSS is 74.32 kB / 13.01 kB gzip.

| Package (from the sourcemap) | KiB min | % of chunk | ≈ KiB gzip (standalone) |
|---|---|---|---|
| three | 670.4 | 52.5 | 173.1 |
| react-dom | 128.9 | 10.1 | 41.5 |
| framer-motion (Stack only) | 108.5 | 8.5 | 35.8 |
| react-reconciler (R3F) | 93.6 | 7.3 | 29.3 |
| swiper | 86.2 | 6.8 | 26.4 |
| @react-three/fiber | 34.7 | 2.7 | 13.0 |
| react-router | 29.3 | 2.3 | 11.0 |
| react-toastify | 15.3 | 1.2 | 6.3 |
| aos | 14.2 | 1.1 | 5.1 |
| three-stdlib | 13.7 | 1.1 | 4.0 |
| lucide-react | 8.8 | 0.7 | 2.3 |
| app `src/**` (all) | 32.5 | 2.5 | – |

- The three family (three, reconciler, R3F, three-stdlib, drei, zustand, its-fine, suspend-react) totals **≈ 820 KiB, 64.2% of the chunk**. It is parsed before first paint, for a canvas that starts 1,800 px down.
- The `<Canvas>` uses the default `frameloop: 'always'`, so it renders every frame from load even while the user reads the hero (R3F docs). The target, per `2026-11-09-webgl-magic.md`, is a lazy 3D chunk with render gating.

### 8.2 CSS

74.3 kB in total:

| Part | Size |
|---|---|
| AOS attribute selectors | 26.1 kB (35%) |
| react-toastify | 11.9 kB |
| swiper | 8.0 kB |
| Tailwind plus custom | 28.4 kB |

### 8.3 Media on first load: 2.38 MiB images + 1.11 MiB audio, all eager

| File | Dimensions / format | Bytes | Displayed at | Note |
|---|---|---|---|---|
| `assets/electrocute.png` | 2048² RGBA | 1,208,742 | 112 px | Re-encode to 224², about 99% smaller (estimate) |
| `sounds/inqueue.mp3` | 72.5 s, 128 kbps | 1,160,402 | – | Delete (Riot) |
| `assets/mondas.png` | 1024² RGBA | 1,138,104 | **unreferenced** | Use it, downsized, instead of the 32² `.ico` |
| `assets/glimmer.png` | 1024² RGB | 555,266 | 112 px | |
| `assets/git.png` | 1280² RGB | 138,312 | 48 px | Use an SVG brand icon |
| `assets/insta.png` | 1280² RGBA | 122,217 | 48 px | |
| `assets/eco.jpg` | 1639×1159 | 109,837 | 112 px (cropped) | |
| `assets/foto.jpg` | 900×905 | 107,260 | 48 px | Keep the source, ship 96² and 160² |
| `assets/azemmur.jpg` | 1472×832 | 61,853 | unreferenced | Ask the owner |
| `assets/ord.jpg` | 1600² | 55,634 | 112 px | |
| `assets/fb.png`, `linkedin.png` | 1280² | 41,223 / 31,817 | 48 px | |
| `assets/veh.png`, `uber.png`, `mono.png` | 2000×612 / 512² / 107×38 | 26,692 / 10,858 / 1,861 | unreferenced | |
| `assets/book.png`, `cal.png` | 512² | 17,655 / 16,291 | 112 px | |
| `assets/gym.jpg` | **WebP** 600² | 5,640 | 112 px | Rename to `.webp` |
| `icons/*.svg` (24 files) | – | 0.5–18.6 kB | 24–80 px | `nestjs.svg` 18.6 kB, `postgresql.svg` 13.3 kB; `kotlin.svg` and `nodejs.svg` unreferenced |

- **Unreferenced files in `public/`:** `assets/azemmur.jpg`, `mondas.png`, `mono.png`, `uber.png`, `veh.png`, `icons/kotlin.svg`, `icons/nodejs.svg` (1,244,870 B deployed for nothing).
- `public/assets/` is copied verbatim into `dist/assets/`, next to the hashed bundles. Files in `public/` are never processed, so there is no hashing and no optimisation. [code][Vite docs]
- Estimated achievable first-load media after re-encoding at 2× display size (AVIF/WebP) plus SVG brand icons: **≈100 kB instead of 3.5 MiB**. This is an estimate, not measured.

### 8.4 Runtime

- WebGL context churn on every stack click (B5).
- framer-motion and AOS animate the same nodes.
- The typewriter re-renders the hero `<p>` about 189 times over 9.5 s.
- Swiper autoplay runs forever, plus a document-level click listener.
- AOS adds throttled scroll and resize listeners and a MutationObserver.
- None of this is costly on its own, but all of it goes away in the rebuild.

---

## 9. Security, privacy, IP

- **Secrets:** none, in HEAD or in any revision (§5.4).
- **Links:** sidebar `target="_blank"` links have no `rel`. Modern browsers imply `noopener`, but the referrer is still sent, and the ESLint rule `react/jsx-no-target-blank` is explicitly turned off.
- **Parked domain:** `nestjs.org` redirects through a parking host. Remove this link, since parked domains can serve ads or malware.
- **Riot IP:**
  - `public/sounds/inqueue.mp3` is live today (served 200 from production). Remove it.
  - Git history holds `src/assets/poro.png` (a Poro render) and `src/assets/bg-primary.jpg`, a black-and-white League "L" logo wallpaper carrying a besthdwallpapers.com watermark. Both were added in `83430c8`/`e0c29fc` and deleted in `e38429b`. Purging them needs a history rewrite (`git filter-repo`) and a force-push to a public repo: the owner's call.
  - The header crest is a gold-ring "L", which echoes the LoL mark. Replace it with the owner's monogram.
  - "RP"/"LP" are Riot currency names (terms, not assets).
- **Third-party marks:** GitHub, Facebook, LinkedIn and Instagram logos (PNG) and framework logos are fine for nominative use. `mono.svg` is an EmojiOne glyph (attribution licence; version UNVERIFIED).

---

## 10. Keep / rework / delete per file

Target: client header, Hextech one-page landing, Match-Found loader, champion-select stack, contact that plays the queue flow. Module names are proposals.

| File | Verdict | Becomes / why |
|---|---|---|
| `index.html` | **rework** | Meta description, OG and Twitter tags, `theme-color`, light/dark favicon set + `apple-touch-icon`, font preloads; drop `class="scroll-smooth"` (Lenis/GSAP will own scrolling); keep `lang="en"` |
| `vite.config.js` | **rework** | Lazy 3D chunk (`import()` of the stage), manual chunks, asset handling for `.glb`/`.svg` |
| `tailwind.config.js` | **rework / replace** | Palette, fonts and easing tokens from the research docs; Tailwind 3 vs 4 is decided in the stack-modernization report |
| `postcss.config.js` | **keep** (TW3) / **delete** (TW4 + `@tailwindcss/vite`) | – |
| `eslint.config.js` | **rework** | Add `**/*.{ts,tsx}` + typescript-eslint + jsx-a11y; ignore `docs/`, `.superpowers/`; re-enable `jsx-no-target-blank` |
| `package.json` | **rework** | Remove 8 unused packages; replace `emailjs-com`; add TS and GSAP/Lenis per the WebGL report pins (§11) |
| `README.md` | **rework** | Real project README (the public repo is part of the portfolio) |
| `src/main.jsx` | **rework** | → `main.tsx`, keep `StrictMode` |
| `src/App.jsx` | **rework** | → `Shell`: Loader gate → Header → sections; delete the fake states; drop react-router if the site stays one page (+ static `404.html`) |
| `src/index.css` | **rework** | Keep the autofill override (re-tokenised); delete the 11 custom classes; add tokens, `@font-face`, a reduced-motion base |
| `Navbar/Navbar.tsx` | **rework** | → `ClientHeader` (79 px grid, serif-caps tabs with the fading gold underline, scroll-spy via ScrollTrigger); reuse the link list |
| `Navbar/Logo.tsx` | **rework** | → `PlayButton` (state machine patching → PLAY → IN QUEUE → MATCH FOUND) + monogram crest; delete the hamburger stub |
| `Navbar/UserStats.tsx` | **rework** | → `Counters` with real meaning (owner input) |
| `ui/Separator.tsx` | **rework** | Gold `#463714 → #785A28` divider; trivial |
| `Hero/Hero.tsx` | **rework** | Keep the copy and CTA intent; remove the typewriter; `clamp()` type; hextech core canvas behind |
| `MainSection/MainSection.tsx` | **rework** | → `Projects` section (framed cards or lobby banners); drop Swiper; keyboard-accessible grid; reuse the `projects` prop flow |
| `MainSection/GameCard.tsx` | **rework** | → `ProjectCard` (real `<a>`/`<button>`, logo, tagline, stack chips, links) |
| `MainSection/FindMatch.tsx` | **rework** | Blue "magic" button; drop `alert()` |
| `MainSection/MatchControls.tsx` | **delete** | Dead |
| `projects/MainSection.tsx`, `ProjectCard.tsx`, `FindMatch.tsx` | **delete** | Dead duplicates |
| `projects/ProjectDescription.tsx` | **delete** | Dead, missing dependency; keep only the *idea* (project detail dialog with screenshots) for a later lot |
| `Stack/Stack.tsx` | **rework** | → `ChampSelect` section (phase header, tile grid, centre stage, LOCK IN) |
| `Stack/GridItem.tsx` | **rework** | → `ChampionTile` (`<button aria-pressed>`, hover and selected states) |
| `Stack/IconScene.tsx` | **delete** | Replaced by the single shared stage canvas |
| `Stack/FloatingIcon.tsx` | **delete** | Texture-on-box replaced by extruded logos |
| `Contact/Contact.tsx` | **rework** | Keep the fields, labels and `autoComplete`; `<form onSubmit>`, validation, `@emailjs/browser` with `VITE_*` env and `limitRate`/`blockHeadless`; submit plays queue → Match Found |
| `Chat/ChatBox.tsx` | **delete** | Fake, covers content, tone risk |
| `Sidebar/Sidebar.tsx` | **rework** (optional) | → `SocialDrawer` closed by default, or fold the links into header and footer |
| `Sidebar/UserProfile.tsx` | **rework** | → header `ProfileIcon` with level ring; real name |
| `Sidebar/Friend.tsx` | **rework** | → `SocialRow` with typed status |
| `Sidebar/FloatingGrid.tsx` | **rework** | Keep only a labelled mute toggle (default muted); delete mic, settings and "V1.0" |
| `hooks/SoundPlayer.tsx` | **rework** | → `useSfx` (lazy-load on first unmute, original clips) |
| `hooks/scrollToTop.ts`, `hooks/smoothScroll.ts` | **delete** | Dead; Lenis/GSAP ScrollTo replace them |
| `notFound/NotFoundPage.tsx` | **rework** | Hextech 404, generic copy; ship as `404.html` or behind a rewrite |
| `data/projects.ts` | **rework** | Typed schema (§12), real content |
| `data/stacks.ts` | **rework** | → `tech.ts` with role, tier, years, projects, logo source |
| `public/sounds/inqueue.mp3` | **delete** | Riot audio (probable) |
| `public/assets/*` used | **rework** | Re-encode to 2× display size (AVIF/WebP); move to `src/assets` for hashing |
| `public/assets/{azemmur.jpg,mondas.png,mono.png,uber.png,veh.png}` | **delete or ask** | Unreferenced; `mondas.png` can replace the `.ico` |
| `public/icons/*.svg` | **rework** | Normalise to single-colour vector marks for both 2D tiles and 3D extrusion (3d-logos topic). The current files mix sources: 13 have the `width="800px"` pattern typical of SVG Repo exports (UNVERIFIED), `js.svg`/`ts.svg` have no intrinsic size, `minio.svg` is a 2600×446 wordmark |
| `public/icons/{kotlin,nodejs}.svg` | **keep if used** | Currently unreferenced |
| `public/icons/mondas.ico` | **delete** | 32² upscaled |
| `public/as.svg` | **rework** | Favicon set for light and dark |

---

## 11. Dependencies (installed → latest from `npm outdated` / `npm view`)

| Package | Installed | Latest | Used | Verdict |
|---|---|---|---|---|
| react, react-dom | 18.3.1 | 19.3.1 | yes | Upgrade (R3F 9 needs 19) |
| three | 0.171.0 | 0.187.0 | yes | Upgrade (pin per the WebGL report) |
| @react-three/fiber | 8.17.10 | 9.8.2 | yes | Upgrade |
| @react-three/drei | 9.118.0 | 10.7.9 | yes | Upgrade |
| framer-motion | 11.12.0 | 14.11.1 | Stack only | **Remove** (GSAP) |
| aos | 2.3.4 (published 2018-10-03) | 2.3.4 | Stack only | **Remove** |
| swiper | 11.1.15 (critical advisory) | 14.4.0 | Projects | **Remove** (no carousel), or ≥12.1.2 |
| react-router-dom | 7.0.1 (high advisory) | 7.18.5 | yes | Remove for a one-page site, or upgrade |
| react-simple-typewriter | 5.0.1 (last publish 2022) | – | yes | **Remove** |
| react-toastify | 10.0.6 | 11.2.0 | Contact | Replace with a Hextech toast (own or shadcn/sonner) |
| emailjs-com | 3.2.0 (deprecated) | → @emailjs/browser 5.0.3 | Contact | **Replace** |
| use-sound | 4.0.3 | 5.0.0 | yes | Rework (lazy, muted) |
| lucide-react | 0.462.0 | 1.70.0 | yes | Keep for utility icons (shadcn default) |
| react-icons | 5.3.0 | 5.7.0 | 4 icons | **Remove** (duplicates lucide) |
| classnames, react-modal, react-scroll, react-spring, react-tooltip, typewriter-effect | – | – | **unused** | **Remove** |
| react-three-fiber | 6.0.13 (deprecated legacy name) | – | **unused** | **Remove** |
| vite | 6.0.1 (dev-server advisories) | 8.3.7 | dev | Upgrade |
| @vitejs/plugin-react | 4.3.4 | 6.3.0 | dev | Upgrade |
| tailwindcss | 3.4.15 | 4.3.5 | dev | Per the modernization report |
| eslint / plugin-react-hooks | 9.15.0 / 5.0.0 | 10.14.0 / 7.1.1 | dev | Upgrade + TS config |
| typescript | **absent** | – | – | **Add** + `tsc --noEmit` |
| @types/react(-dom) | 18.3.x | 19.3.0 | editor only | Upgrade with React |

Additions (gsap 3.15.1, @gsap/react 2.1.2, lenis 1.3.27, @react-three/postprocessing 3.2.2, postprocessing 6.39.6) are already pinned in `2026-11-09-webgl-magic.md` §1, so they are not repeated here.

---

## 12. Content to request from the owner

Nothing below exists in the repo today.

1. **Identity:** which name goes in the header ("Arch Efferalgon" gamer tag or "Abdelmatine Sfar"); title line and specialisation; location and time zone; availability (open to work, freelance, relocation); languages. Is the site English only, or English + French?
2. **About:** 2–3 short paragraphs. Confirm the photo (`foto.jpg` 900×905) and supply a higher-quality square original.
3. **Experience** (for the loading-screen cards in `2026-11-09-shell-lobby-screens.md` §6): company, role, dates, 2–3 achievements each, and logos you have the right to use.
4. **Education and certifications.**
5. **CV:** a PDF (with a date) to link from the header and contact; there is no CV link anywhere today.
6. **Projects**, for each one:
   - real description: problem, what *you* built, your role, team size, year, outcome or metrics
   - verified stack
   - 2+ screenshots (16:10)
   - repo link (public?) and a correct live link
   - Specific questions:
     - Is `planify.vercel.app` yours? Its title is "React App" while the data claims Next.js + React Native.
     - Is MONO (`monoo.lovable.app`) really Spring Boot + Next.js?
     - Real links for Fixed APP and E Commerce (both `example.com`), and for E Books (currently bookbub.com).
     - Permission to show Sam Médicale (client).
     - Should `azemmur.jpg`, `uber.png` and `veh.png` become projects?
7. **Tech (champion select):**
   - main stack vs learning
   - role lane for each tech
   - years or proficiency
   - the meaning of `count` (drop it if none)
   - add Next.js, NestJS, PostgreSQL, Redis, MinIO, Supabase, Node.js, Kotlin, Docker/cloud?
   - keep Qt, C, C++, Python, Flutter without projects?
8. **Counters** that replace RP/LP: years, projects shipped, client sites live, …
9. **Contact:** destination address; EmailJS service, template and public key (Vercel env vars), or a switch to a server-side sender; decide the anti-spam options (dashboard domain allowlist, `limitRate`, reCAPTCHA).
10. **Social:** keep Facebook and Instagram (personal) on a professional site? Add email, and Malt/Upwork if relevant.
11. **Audio:** budget and source for original SFX (muted by default either way).
12. **Legal and git:** approve rewriting git history to purge `poro.png`, `bg-primary.jpg` and `inqueue.mp3`; agree to a fan-content disclaimer (type-sound-legal topic).
13. **Domain and analytics:** stay on `abdelmatine.vercel.app` or use a custom domain? Analytics wanted?

---

## 13. UNVERIFIED

- `inqueue.mp3` provenance: strong metadata evidence (title, DASH brand, ffmpeg), no proof.
- Original "stack blank" observation: reproduced only with rAF not ticking. On a real foreground tab and GPU the section renders, though the 3D panel is about 97% empty. If the owner saw it blank in a normal foreground tab, a second cause may exist.
- Number and exact list of TypeScript errors (no `tsc` run; listed by inspection).
- EmailJS's response body for placeholder IDs (the request was blocked during the audit).
- Ownership and stack of `planify.vercel.app` and `monoo.lovable.app`; licence of `mono.svg` (EmojiOne version) and SVG Repo provenance of the icons.
- Behaviour in Safari and Firefox (only Chrome tested); OrbitControls touch trap not tested on a device.
- Media savings (≈100 kB target) are estimates.
- Glyph widths are for Segoe UI (Windows system-ui). On macOS (SF Pro, overlay scrollbars) the B1 threshold moves by a few px.

---

## Sources

- EmailJS: [is it okay to expose my public key](https://www.emailjs.com/docs/faq/is-it-okay-to-expose-my-public-key/), [does EmailJS expose my account to spam](https://www.emailjs.com/docs/faq/does-emailjs-expose-my-account-to-spam/), [domain allowlist](https://www.emailjs.com/docs/faq/can-i-add-my-domain-to-allowlist/), [SDK installation](https://www.emailjs.com/docs/sdk/installation/), [SDK options](https://www.emailjs.com/docs/sdk/options/)
- npm: [emailjs-com (deprecated)](https://www.npmjs.com/package/emailjs-com), [@emailjs/browser](https://www.npmjs.com/package/@emailjs/browser), [react-three-fiber (deprecated)](https://www.npmjs.com/package/react-three-fiber), [aos](https://www.npmjs.com/package/aos); versions from `npm outdated` / `npm view` run during this audit
- Advisories: [GHSA-hmx5-qpq5-p643 swiper](https://github.com/advisories/GHSA-hmx5-qpq5-p643), [GHSA-2w69-qvjg-hvjx react-router](https://github.com/advisories/GHSA-2w69-qvjg-hvjx), [GHSA-vg6x-rcgg-rjx6 vite](https://github.com/advisories/GHSA-vg6x-rcgg-rjx6), [GHSA-67mh-4wv8-2f99 esbuild](https://github.com/advisories/GHSA-67mh-4wv8-2f99)
- Vercel: [Vite on Vercel: SPA deep linking rewrites](https://vercel.com/docs/frameworks/frontend/vite), [Custom 404 page](https://vercel.com/kb/guide/custom-404-page)
- R3F: [Canvas props: frameloop, resize (react-use-measure), dpr, ACES/sRGB defaults](https://r3f.docs.pmnd.rs/api/canvas)
- three.js: [Updates to lighting in r155](https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733); three-stdlib OrbitControls `touchAction='none'`: [source](https://github.com/pmndrs/three-stdlib/blob/main/src/controls/OrbitControls.ts) (local `node_modules/three-stdlib/controls/OrbitControls.js:299`)
- Motion: [MotionConfig reducedMotion (default "never")](https://motion.dev/docs/react-motion-config)
- howler.js: [options preload / autoUnlock / html5](https://github.com/goldfire/howler.js); Chrome: [autoplay policy, Web Audio](https://developer.chrome.com/blog/autoplay/#web_audio)
- Vite: [the public directory](https://vite.dev/guide/assets#the-public-directory); Tailwind: [width (`w-screen` = 100vw)](https://tailwindcss.com/docs/width)
- MDN: [`rel=noopener` implied by `target=_blank`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/noopener); WCAG: [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- Project context: `docs/research/2026-11-09-lol-client-ui.md`, `2026-11-09-shell-lobby-screens.md`, `2026-11-09-champ-select.md`, `2026-11-09-ready-check.md`, `2026-11-09-webgl-magic.md`, `docs/CHECKPOINT.md`
- Live checks: `https://abdelmatine.vercel.app/` (bundle hashes), `/no-such-page` (404), `/sounds/inqueue.mp3` (200, 1,160,402 B), plus each project and framework URL in §4.1

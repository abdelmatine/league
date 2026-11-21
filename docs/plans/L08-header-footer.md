# L08 · Header, drawer, footer, app shell

Spec: §6.2, §6.9, §10, §13.

**Goal:** the new page shell. Header with the PLAY state machine, scroll-spy tabs, counters, sound toggle and profile crest; drawer below 768 px; footer with the notice and credits; content files; old Navbar, Sidebar and ChatBox removed.

**Files:** `src/content/{profile,projects,tech,career}.ts`, `src/lib/{playState,hash,scroll,content}.ts` (+ tests), `src/components/header/*`, `src/components/footer/*`, `src/App.tsx`, `src/main.tsx`, section stubs in `src/sections/`.

**Steps**
1. Content: migrate `src/data/*` into typed content with `draft`, slugs, lanes, logo policies (DECISIONS → Legal table).
2. `scroll.ts`: one Lenis instance, `gsap.ticker` drives `lenis.raf`, `scrollToId` with header offset, anchors.
3. `playState.ts`: pure reducer for patching → play → queue → found → accepted (+ cancel/decline paths) with tests.
4. Header + drawer + queue card; scroll-spy via IntersectionObserver; it never writes the hash.
5. Footer + credits dialog (credits filtered to shown marks).
6. App shell: skip link, header, main with section stubs (`#home`, `#about`, `#projects`, `#stack`, `#contact`), footer, toast region. Remove react-router and the old components; `public/404.html`.
7. Spike G07: measure the header blur over the live canvas in L09/L10 and record the per-tier downgrade table in DECISIONS.

**Done when:** the shell renders at 1440 and 390, keyboard path works through the header and drawer, unit tests pass, no console errors.

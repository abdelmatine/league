# Rules for lots built in parallel (L09–L16)

Four agents build L09–L16 at the same time, each in its own git worktree, branched from `docs/lot-plans` (which sits on top of L08). Claude merges their branches afterwards. These rules keep the merges clean.

**Ownership.** Each lot group owns its files (listed in its plan). Edit shared files only where your plan says so, and keep those edits small and additive:
- `src/App.tsx`: only P (L16) adds the content-gated Career and Achievements sections; nobody else touches it.
- `src/components/stage/scenes.ts`: S registers `home`, K registers `stack`. One line each.
- `src/styles/*.css`: do not edit. Put section styles in your own CSS file next to your components and import it from your section.
- `src/lib/*`, `src/components/ui/*`, `src/content/*`: additive changes only (a new export, a new optional field). Never rename or remove an existing export. List every shared-file edit in your final report.
- `package.json` / `package-lock.json`: only C (L15) adds a dependency (`@emailjs/browser`). Others add none. A tool you need once (an image converter, say) is installed temporarily and removed again, restoring both files with `git checkout -- package.json package-lock.json`.

**Section files.** Keep each section's entry file and export name (`src/sections/Hero.tsx` → `Hero`, `Stack.tsx` → `Stack`, `Projects.tsx` → `Projects`, `About.tsx` → `About`, `Contact.tsx` → `Contact`). Put the parts in a folder (`src/sections/stack/…`) and import them from the entry file.

**Worktree setup.** Run `npm ci` first (the worktree has no `node_modules`). Use your own ports: S 4181/5181, K 4182/5182, P 4183/5183, C 4184/5184. Run Playwright with `PW_PORT=418N npx playwright test`; run a dev server with `npx vite --port 518N --strictPort`. Stop every server you start before you finish.

**Git.** Create the branches your plan names, stacked in order. End each commit message with a blank line and `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never push, merge into main, force or rewrite history.

**Shared APIs (from L06–L08).** Read the files before using them:
- UI: `src/components/ui/*` (Frame, GoldButton/MagicButton in Button.tsx, Divider, Icon, Counter, Tabs+TabPanel, Field+useField, Crest, Tooltip, Dialog, ToastRegion).
- `src/lib/motion.ts` (gsap, ScrollTrigger, SplitText, useGSAP, eases settle/show/glow/snap/in, DUR, splitReveal, frameBuildIn, counterUp, prefersReducedMotion).
- `src/lib/sfx.ts` (`sfx.play(cue)`; cues hover, click, queue, matchFound, accept, decline, lockIn).
- `src/lib/toast.ts` (`push({title,text,icon,tone,persistent})`, `dismiss(id)`).
- `src/lib/playStore.ts` (`playStore.dispatch(event)`, `usePlayState()`; events progress, ready, queue{at}, cancel, found{at}, accept, decline, timeout, reset).
- `src/lib/stageStore.ts` (`useStageScene(id, ref)`, `selectTech`, `anyVisible`, `stageSupported`), `src/components/stage/{Stage.tsx,scenes.ts,anchor.ts}` (`SCENES[id]` receives `{anchor}`; `placeOnAnchor`).
- `src/lib/scroll.ts` (`initScroll`, `lenis`, `scrollToId(id,{onComplete})`, `onAnchorClick(e,id)`); header offset from `scroll-padding-top`; CSS vars `--hdr`, `--hdr-blur`.
- `src/content/*` + `src/lib/content.ts` (`shownProjects`, `projectsUsing`, `techCount`, `techById`, `mainsByUsage`, `lanes`, `lanesCovered`, `creditLines`), `src/lib/hash.ts` (`parseHash`, `formatHash`).

**Done for every lot:** `npm run check` and `npm run build` pass; `PW_PORT=418N npx playwright test` passes; screenshots at 1440×900 and 390×844 checked by eye against the matching mockup capture in `.superpowers/hifi/shots/t14/`; reduced motion checked; no console errors (the r3f `THREE.Clock` warning is known and allowed).

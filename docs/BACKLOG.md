# Backlog: Hextech portfolio rebuild

This file is the tracker. Every piece of remaining work is a task sized for **one fresh session**. A session picks one task, reads only what its card lists, finishes it, and ticks it here. History and older detail live in `docs/CHECKPOINT.md`.

**To start a session, say:** `Continue the backlog.` (does the task under "Next up") or `Do task <ID> from docs/BACKLOG.md.` (a specific one). For status only: `Backlog status?`

## Next up

**L01 · Cleanup and compliance** is built on the local branch `lot/L01-cleanup` (tip `382b3d0`) and waits for the owner's OK to push and open the PR. After that: **L02 · Tailwind 4** (not started), then **T10 · Mockup: home**.

Waiting on the owner:
- **T02**: fill in `docs/OWNER-QUESTIONS.md` (51 answer lines).
- **T03**: OK to install the three.js skills.
- OK to push `docs/decisions-legal` and `lot/L01-cleanup`.
- Legal calls in `docs/DECISIONS.md` → "Legal": follow the strict logo rules (no logo for React, Spring, Docker, Java) or accept the risk; keep or drop the game and publisher names in the footer notice.

How the next task is chosen:
- Take the first task in "Suggested order" whose status is `todo` or `partial` and whose dependencies are `done`.
- Skip tasks waiting on the owner (T02, owner approvals). Remind the owner about them in one line.

## Session rules (every task)

1. **Read** this file's rules and the task's card. Read only the files the card lists, and only the sections named.
2. **Usage:**
   - Check the 5-hour window with `get_usage` before starting.
   - Don't start an M or L task above about 50%.
   - If the task fans out agents (a Workflow), arm the guard first: a 2-minute cron that stops everything at 73%. The owner's rule is to stop at 80%.
3. **One task per session.** Don't drift into the next one. If the task turns out bigger than its card, stop, split it here, and finish only the first part.
4. **Finish by updating this file:**
   - Set the status to `done YYYY-MM-DD`, list the outputs, and add a line to the log at the bottom.
   - Recompute the progress line and table.
   - Rewrite "Next up" with the next task.
   - If stopped early, set `partial`, with a note saying exactly where to pick up. "Next up" then stays on that task.
   - End the session by telling the owner three things: what was done, the new %, and the next task's ID.
5. **Git:**
   - Docs-only tasks commit on a `docs/...` branch.
   - Lots (L tasks) use `lot/LNN-name`, then PR → Vercel preview check → owner OK → merge to `main` (Vercel deploys) → check production.
   - Never push, merge or force-push without the owner's OK in that session.
6. **Hard rules:**
   - No Riot assets: art, icons, logos, client images or videos, sounds, Beaufort/Spiegel fonts.
   - No "League of Legends", "LoL", "Riot" or "Hextech" in titles, meta tags or headings (type-sound-legal §0.6).
   - No Riot nouns in UI copy: Summoner, Honor, RP/LP, Clash...

## Progress

Each task has points: XS = 1, S = 2, M = 4, L = 6. Done % = done points / total points.

**Today: 23 of 119 points done = 19%. 96 points (81%) left.** L01 (2 points) is built but counts only after the merge.

This points count replaces the earlier rough "about 20%" estimate. It is stricter, because half-built mockups score nothing until they are finished.

| Phase | Points done / total | Status |
|---|---|---|
| Discovery so far (D1–D7) | 16 / 16 | done |
| 0. Housekeeping (T00) | 1 / 1 | done |
| 1. Decide (T01–T04) | 4 / 6 | T01, T04 done; T02, T03 wait on the owner |
| 2. Mockups (T09–T14) | 2 / 20 | T09 done; screens half built |
| 3. Spec and plans (T20–T21) | 0 / 6 | blocked by phases 1–2 |
| 4. Build lots (L01–L19) | 0 / 70 | L01 built, waits for owner OK; L02–L05 ready; the rest after phase 3 |

### Done before this backlog (16 points)

| ID | What | Points | Output |
|---|---|---|---|
| D1 | Project audit, deploy target (Vercel auto-deploys `main`) | 1 | `docs/CHECKPOINT.md` |
| D2 | First client-UI research | 1 | `docs/research/2026-11-09-lol-client-ui.md` |
| D3 | Direction mockups; owner chose B (Hextech landing) with A's header | 2 | `.superpowers/brainstorm/` (local) |
| D4 | Nine deep research reports | 6 | `docs/research/2026-11-09-*.md` |
| D5 | Critic: 10 gaps, 18 contradictions | 1 | `docs/checkpoints/critic-result.json` |
| D6 | 4 gaps answered (tone mapping, adaptive quality, project detail screen, champ select in Lenis) | 1 | `docs/checkpoints/gap-results.json` |
| D7 | Mockup kit (tokens, components, header, motion, SFX, 3D stage, screenshot tool) | 4 | `.superpowers/hifi/kit/`, `tools/` (local, gitignored) |

## Overview of remaining tasks

| ID | Task | Size | Depends on | Who |
|---|---|---|---|---|
| T00 | Commit the planning docs | XS | — | Claude + owner OK |
| T01 | Decision log: settle the 18 contradictions and 10 gaps | S | — | Claude |
| T02 | Owner answers the questions form | XS | T01 (form) | **Owner** |
| T03 | Install the three.js skills | XS | owner OK | Claude |
| T04 | Legal limits check (GUI look, 3D framework marks) | S | — | Claude |
| T09 | Mockup kit refresh (fonts, copy rules, design-checker flags) | S | T01 | Claude |
| T10 | Mockup: home (loader, header, hero, about) | M | T09 (optional) | Claude (workflow) |
| T11 | Mockup: stack as champion select | M | T09 (optional) | Claude (workflow) |
| T12 | Mockup: contact (queue → match found → accept) | M | T09 (optional) | Claude (workflow) |
| T13 | Mockup: projects lobby, career, achievements, detail | M | T09 (optional) | Claude (workflow) |
| T14 | Mockup gallery + owner review | S | T10–T13 | Claude + owner |
| T20 | Design spec + builder check + owner approval | M | T01, T02, T14 | Claude + owner |
| T21 | Lot plans (writing-plans) | S | T20 | Claude |
| L01 | Cleanup and compliance | S | T00 | Claude + owner OK |
| L02 | Tailwind 4 | S | L01 | Claude |
| L03 | Vite 8, TypeScript 7, oxlint | M | L02 | Claude |
| L04 | React 19, three 0.187, r3f 9, drei 10, GSAP, Lenis | S | L03 | Claude |
| L05 | Test gates (Vitest, Playwright on previews, gated build) | M | L04 | Claude |
| L06 | Design system A: tokens, fonts, frame, buttons | M | L05, T21 | Claude |
| L07 | Design system B: tabs, inputs, toast, crest, tooltip, motion, SFX module | M | L06 | Claude |
| L08 | Client header, mobile drawer, footer | M | L07 | Claude |
| L09 | WebGL stage + hero core | L | L07 | Claude |
| L10 | Hero content + scroll choreography | M | L08, L09 | Claude |
| L11 | Loader ("waiting for other players") | M | L09 | Claude |
| L12 | Projects lobby + project detail | M | L07, T02 | Claude |
| L13 | Stack champion select (2D) | M | L07, T02 | Claude |
| L14 | Stack 3D logos + lock-in | L | L09, L13 | Claude |
| L15 | Contact flow + real sending | M | L08, T02 | Claude |
| L16 | About, Career, Achievements | M | L07, T02 | Claude |
| L17 | Sound cues | S | L07 | Claude |
| L18 | Polish: a11y, reduced motion, performance, mobile, SEO | M | L10–L17 | Claude |
| L19 | Purge Riot files from git history | S | owner approval | Claude + owner |

**Suggested order:**
1. T00 → T01 → T02 (owner, any time) and T04.
2. The toolchain track (L01 → L05) can run alongside the mockups. It changes no design.
3. Mockups: T09 → T10 → T11 → T12 → T13 → T14.
4. Spec and plans: T20 → T21.
5. Feature lots: L06 onwards.

---

## Phase 0: Housekeeping

### T00 · Commit the planning docs · XS · status: done 2026-11-16
- **Output:** `CLAUDE.md`, `docs/`, `.gitignore`, `.claude/launch.json` and `.impeccable/config.json` are on `main`, merged from the branch `docs/hextech-planning`.
- **Why:** everything since 2026-11-09 is uncommitted. A fresh session on another machine would see nothing.
- **Do:**
  - Branch `docs/hextech-planning`.
  - Commit `CLAUDE.md`, `docs/`, `.gitignore` (adds `.superpowers/`), `.claude/launch.json` and `.impeccable/config.json`.
  - Open a PR and merge it after the owner's OK. This is a docs-only change; Vercel redeploys the same site.
- **Not committed:** `.superpowers/` stays local. The mockups exist only on this PC.
- **Done when:** the docs are on `main`.

---

## Phase 1: Decide

### T01 · Decision log · S · status: done 2026-11-16
- **Output:** `docs/DECISIONS.md` (18 contradiction rows C01–C18, 10 gap rows G01–G10: 12 decided, 8 owner, 6 lot spikes, 2 sent to T04) and `docs/OWNER-QUESTIONS.md` (51 answer lines). A second agent matched all 28 rows to the critic file and spot-checked 11 decided rows against the reports.
- **Weak rows:** C13 (easing names) and C14 (toast position, 5 s) rest on the critic's text, not a report §0. G04's NEUTRAL tone mapping on the 8-bit path is a reconciliation; L09 must measure it.
- **Why:** the reports disagree on 18 points, and 10 gaps were left open. Most are already settled by the reports' own "§0 Decisions" sections. This turns them into one table instead of running 23 more research agents.
- **Read:**
  - `docs/checkpoints/critic-result.json` (gaps + contradictions)
  - `docs/checkpoints/gap-results.json` (4 answers)
  - only the `## 0. Decisions` / `## Decision` sections of `docs/research/2026-11-09-{stack-modernization,type-sound-legal,3d-logos,threejs-skill,webgl-magic,champ-select,ready-check,shell-lobby-screens,codebase-audit}.md`
- **Do:**
  - Write `docs/DECISIONS.md`: one row per contradiction and gap, with the decision, its source (report §), and a status. Status is one of:
    - **decided**
    - **owner** (taste or content)
    - **spike in lot LNN** (needs a measurement in real code, e.g. loader Core Web Vitals, DOM-over-canvas cost)
  - Write `docs/OWNER-QUESTIONS.md`: a fill-in form that merges the "owner" rows with the content list in codebase-audit §12 (identity, about, experience, CV, projects, tech roles, counters, contact destination, socials, git purge, domain). Also list the taste picks:
    - PLAY style: measured arrow plate vs mockup hex
    - 4 vs 5 tabs
    - fonts: Literata + Source Sans 3 (report pick) vs the mockup's Marcellus + Barlow
- **Rules:** no web research and no agent fan-out. If a row truly needs research, mark it for T04 or a lot spike.
- **Done when:** both files exist, and every critic item has a row.

### T02 · Owner answers the questions form · XS · status: todo (owner)
- **Who:** the owner fills in `docs/OWNER-QUESTIONS.md` at their own pace (text, links, files in `docs/content/`). No session is needed. Say "T02 done" when finished.
- **Blocks:** L12 (projects), L13 (tech roles), L15 (contact destination, EmailJS keys), L16 (about/career), T20 (taste picks).

### T03 · Install the three.js skills · XS · status: todo (needs owner OK)
- **Read:** `docs/research/2026-11-09-threejs-skill.md` §Decision, §6, §7.
- **Do:** after the owner says yes, install 7 CloudAI-X skills and 2 EnzeD skills (pinned commits) plus the official `pmndrs/claude-code-plugin` at local scope, exactly as in §7.
- **Note:** the skills target React 19 + r3f 9. They're most useful from L04 on.
- **Done when:** the skills appear in the skill list.

### T04 · Legal limits check · S · status: done 2026-11-16
- **Output:** `docs/DECISIONS.md` → "Legal": do/don't rules, a per-mark table (19 marks), footer notice and credits. A second agent re-fetched the five main claims and corrected four overstated ones.
- **Result:** gold 3D extrusion only for Angular (CC BY 4.0) and the community JS shield. All other marks: flat unaltered logo or name only. No Java cup, no Duke (licence unread), no Spring or Docker logo.
- **Unconfirmed:** case law on GUI look, trade dress law, Oracle and OpenJDK pages (HTTP 403), the rows for Node.js, Kubernetes, PostgreSQL and MongoDB. Not legal advice.
- **Read:** `docs/research/2026-11-09-type-sound-legal.md` §C, and critic gap "Legal limits on copying the client GUI, and on 3D versions of framework marks".
- **Do:** one focused web-research pass (single agent):
  - trade dress and copyright risk of a site styled after a game client's UI
  - rules for showing framework logos in 3D (Angular CC BY credit, Java via OpenJDK Duke, React/others' trademark guidelines)
- **Output:** append a "Legal" section to `docs/DECISIONS.md` with do/don't rules and a credits list for the footer. Not legal advice.

---

## Phase 2: Mockups (local, `.superpowers/hifi/`)

**Common steps for T10–T13:**
1. Start the static server: launch config `hifi-mockups` (port 5174).
2. Arm the usage guard.
3. Run the workflow with `Workflow({ scriptPath: "C:/Users/abdel/Desktop/projects/league/docs/checkpoints/mockups-resume.workflow.js", args: { "only": ["<screen>"] } })`.
   - It reuses the built kit (embedded in the script).
   - It continues from the half-built screen files.
   - Then it runs 2 reviews (fidelity and craft), a fix pass and a final check.
   - That's about 5 agents.
4. Look at the result yourself (browser pane), then stop the server.

Pages are at http://127.0.0.1:5174/.superpowers/hifi/<screen>.html.

### T09 · Mockup kit refresh · S · status: done 2026-11-16
- **Output:** `.superpowers/hifi/kit/hextech.css` and `kit/demo.html` (local). Screenshots `shots/kit/t09-*.png`: 0 console errors at 1440 and 390 wide.
- **Fonts:** not switched (owner pick C06 is open). `--font-display` and `--font-body` now sit in one block at the top of `hextech.css`. The swap also needs self-hosted Literata and Source Sans 3 files; the kit still loads Google Fonts.
- **Copy:** banned nouns removed from visible text. "Champion pedestal", "Champ select", "Loot" and "Lobby" stay until the owner decides.
- **Checker flags:** the one-side border and the 10px text are fixed. Glows and uppercase display text are kept (they are the look). Open: section numbers "01"–"06" at about 3:1 contrast; repeated text in one demo container, not looked at.
- **Not re-shot:** the four screen pages, which share `hextech.css`.
- **Depends:** T01 (fonts and copy decisions).
- **Do:**
  - Apply the decided fonts to `.superpowers/hifi/kit/hextech.css` (if Literata/Source Sans 3: self-host or Google Fonts, tabular numerals).
  - Remove Riot nouns from kit copy.
  - Triage the design-checker flags on the kit: one-side accent border at `kit/hextech.css:929`, glows, all-caps runs, cramped padding, sub-11px text.
  - Re-shoot `kit/demo.html` with `tools/shoot.mjs`.
- **Done when:** the demo has zero console errors and the screenshots look right.

### T10 · Mockup: home · M · status: partial (builder stopped mid-way 2026-11-10)
- **Scope:**
  - Loader: "waiting for other players" ring filling on real load milestones, then the reveal.
  - Header with PLAY states.
  - Hero: three.js core, particles, bloom, name reveal, CTAs.
  - About band styled like the profile screen.
- **Run:** common steps with `only: ["home"]`.

### T11 · Mockup: stack as champion select · M · status: partial
- **Scope:**
  - Signature Draft mapping: roles Backend/Data/Frontend/Mobile/Core.
  - Grid of real framework tiles.
  - Centre: real logo extruded in 3D on a pedestal.
  - LOCK IN timeline and a skippable intro draft.
  - Projects as the "skin" carousel.
- **Run:** common steps with `only: ["stack"]`.

### T12 · Mockup: contact · M · status: partial
- **Scope:**
  - Framed form → IN QUEUE card → MATCH FOUND dialog (12 s ring) → ACCEPT → toast.
  - Decline path.
  - Social strip styled like the friends list.
- **Run:** common steps with `only: ["contact"]`.

### T13 · Mockup: projects · M · status: partial
- **Scope:**
  - Lobby banners filled centre-out, with real projects.
  - Project detail modal (use the gap:5 answer in `docs/checkpoints/gap-results.json`).
  - Career as loading-screen cards.
  - Achievements as the post-game screen.
- **Run:** common steps with `only: ["projects"]`.

### T14 · Mockup gallery + owner review · S · status: todo
- **Depends:** T10–T13.
- **Do:**
  - Start the server and screenshot the 4 pages. Check:
    - 0 console errors
    - grep for riot/communitydragon/ddragon/leagueoflegends and Beaufort/Spiegel
  - Rebuild `.superpowers/hifi/index.html` as a styled gallery with thumbnails.
  - Show the owner in the browser pane.
  - Record their reactions per screen in `docs/DECISIONS.md` → "Mockup feedback".

---

## Phase 3: Spec and plans

### T20 · Design spec · M · status: todo
- **Depends:** T01, T02 (taste picks at least), T14.
- **Read:** `docs/DECISIONS.md`, `docs/OWNER-QUESTIONS.md`, the mockup pages, and report sections only as needed.
- **Do:**
  - Write `docs/superpowers/specs/<date>-hextech-portfolio-design.md` (brainstorming skill's "Written design" rules).
  - Run the builder check (`builder-check-prompt.md`, one subagent).
  - Ask the owner the questions it raises, then get approval.
- **Done when:** the owner approves the spec.

### T21 · Lot plans · S · status: todo
- **Depends:** T20.
- **Do:**
  - Use `superpowers:writing-plans` to write one plan per feature lot (L06–L18): `docs/plans/LNN-<name>.md`.
  - Re-split any lot bigger than M.
  - Update the lot cards below with plan links.
  - L01–L05 already have exact steps in stack-modernization §11.

---

## Phase 4: Build lots (each = branch → PR → preview → merge → deploy)

**Every lot ends with:**
- `npm run build` passes (plus tests from L05 on).
- Vercel preview screenshots at 1440×900 and 390×844.
- Owner OK → merge → production check → tick here.

### L01 · Cleanup and compliance · S · status: partial (built 2026-11-16; waits for owner OK to push)
- **Where:** local branch `lot/L01-cleanup`, 5 commits, tip `382b3d0`. Not pushed.
- **Result:** `dist` 6.31 MB → 5.11 MB, 452 lockfile packages removed, music and howler gone, build passes, lint unchanged (3 old errors), 38 asset URLs resolve, clean console. A second agent reviewed the diff: no defect.
- **Pick up:** push the branch, open the PR, check the Vercel preview at 1440×900 and 390×844 against production (no screenshot diff was made), confirm the `/_app/` cache header and that `engines.node: 24.x` builds on Vercel, get the owner's OK, merge, check production.
- **Known:** the Headphones button in the sidebar still toggles its colour but plays nothing.
- **Story:** as the owner, I want the live site free of ripped audio and dead code, so it is legally safe and lighter.
- **Read:** stack-modernization §8, §9, §11 "Lot A"; codebase-audit §0, §10.
- **Do:**
  - Remove the unused dependencies, dead files (`src/components/projects/*`, `MatchControls`, unused hooks) and the 11 unused `index.css` classes.
  - Remove `public/sounds/inqueue.mp3` + `SoundPlayer`.
  - Add `vercel.json` (immutable caching for hashed assets) and `engines.node`.
- **Done when:** the site looks the same, the music is gone, and the build is smaller.

### L02 · Tailwind 4 · S · status: todo
- **Note 2026-11-16:** a run started and was stopped by the usage guard before any change. Branch from `lot/L01-cleanup` if L01 is not merged yet.
- **Read:** stack-modernization §3, §11 "Lot B".
- **Done when:** the site looks identical on the preview (screenshot diff by eye).

### L03 · Vite 8, TypeScript 7, oxlint · M · status: todo
- **Read:** stack-modernization §5, §10.1, §11 "Lot C".
- **Do:**
  - Add the tsconfigs and convert `.jsx` → `.tsx`.
  - Replace ESLint with oxlint.
  - Fix the type errors.
- **Done when:** `tsc` and oxlint are clean, and the site is unchanged.

### L04 · React 19 + 3D stack + GSAP/Lenis · S · status: todo
- **Read:** stack-modernization §6, §7, §11 "Lot D"; webgl-magic §0.1 (pins).
- **Pins:** react 19.3.1, three 0.187.0, @react-three/fiber 9.8.2, drei 10.7.9, @react-three/postprocessing 3.2.2, postprocessing 6.39.6, gsap 3.15.1, @gsap/react 2.1.2, lenis 1.3.27.
- **Done when:** the old site runs on the new stack with no console errors.

### L05 · Test gates · M · status: todo
- **Read:** stack-modernization §10, §11 "Lot E".
- **Do:**
  - Vitest for pure logic.
  - Playwright smoke + screenshots against each Vercel preview (GitHub workflow on `deployment_status`).
  - A `vercel-build` script gated by oxlint + tsc + vitest.
- **Owner:** must add the repo secret `VERCEL_AUTOMATION_BYPASS_SECRET`.

### L06 · Design system A · M · status: todo
- **Story:** as a visitor, every surface reads as gold-framed Hextech UI.
- **Do:**
  - Tailwind 4 `@theme` tokens: palette, gradients, motion durations/easings.
  - Self-hosted fonts (decided in T01/T02).
  - React components: `Frame` (+ornaments), `GoldButton` (all layers), `MagicButton`, `Divider`.
  - A dev-only kit page.
- **Port:** port the mockup kit. Don't redesign.

### L07 · Design system B · M · status: todo
- **Do:**
  - `Tabs`, `Input`/`Textarea`, `Toast` (one aria-live region), `Crest` (XP ring), `Tooltip` (CSS), `Dialog` (native).
  - `motion.ts`: CustomEase registry with one naming scheme per DECISIONS.
  - `sfx.ts`: Web Audio cues, muted by default.

### L08 · Client header, mobile drawer, footer · M · status: todo
- **Story:** as a visitor, the top bar looks and reacts like the game client's.
- **Do:**
  - PLAY state machine: patching → play → queue → found → accepted.
  - Tabs and counters, crest with XP ring, sound toggle.
  - A 56 px bar + drawer below 768 px.
  - Footer with the non-affiliation notice (type-sound-legal §C.6) and credits.
- **Remove:** old `Navbar`, `Sidebar`, `ChatBox`.

### L09 · WebGL stage + hero core · L · status: todo
- **Read:** webgl-magic §2, §5, §6; gap:1 (tone mapping) and gap:3 (adaptive quality) answers.
- **Do:**
  - One fixed canvas, with gsap.ticker driving Lenis and r3f.
  - Quality tiers via PerformanceMonitor and a reduced-motion still frame.
  - Lazy-load the 3D chunk.
  - Core: crystal, energy, halo, rings, particles, bloom.
- **Done when:** 60 fps on the dev iGPU at the mid tier, and nothing renders while the canvas is off screen.

### L10 · Hero content + scroll choreography · M · status: todo
- **Do:**
  - Name reveal, identity chip, CTAs, scroll cue.
  - Camera pull-back with ScrollTrigger.
  - GSAP frame build-in reveals for sections.
- **Remove:** old `Hero`.

### L11 · Loader · M · status: todo
- **Read:** ready-check §15–§18, DECISIONS (loader row).
- **Do:**
  - Inline loader in `index.html` (≤ 2 KB) with real milestones and the reveal sequence.
  - A 10 s failsafe and a `<noscript>` fallback.
- **Spike:** measure first-visit LCP/CLS with and without the loader. Record it in DECISIONS.

### L12 · Projects lobby + project detail · M · status: todo
- **Needs:** owner project content (T02).
- **Do:**
  - Typed `projects.ts`.
  - Lobby banners and pager.
  - Detail modal (gap:5 answer).
  - Optimised images (the current 2048² PNGs → AVIF/WebP at their display size).
- **Remove:** old `MainSection`.

### L13 · Stack champion select (2D) · M · status: todo
- **Needs:** tech roles and levels (T02).
- **Do:**
  - Typed `stacks.ts` with roles.
  - Team columns, role filters, search, 67 px tiles, timer bars, phase banner.
  - Mobile layout.
  - Use the Lenis/pinning approach from the gap:4 answer.
- **Remove:** old `Stack`.

### L14 · Stack 3D logos + lock-in · L · status: todo
- **Read:** 3d-logos §0, §3, §4, §5.
- **Do:**
  - Simple Icons paths in `logos3d.ts`.
  - Extrude pipeline with an inward bevel, enamel face + gold sides, NEUTRAL tone mapping.
  - Pedestal, dissolve swap, LOCK IN timeline, skippable intro draft.
  - Credits (Angular CC BY, OpenJDK Duke).

### L15 · Contact flow + real sending · M · status: todo
- **Needs:** destination + EmailJS keys as Vercel env vars (T02).
- **Do:**
  - Framed form with blur validation.
  - IN QUEUE card, MATCH FOUND dialog, accept, toast.
  - `@emailjs/browser` with a rate limit and a domain allowlist.
  - Social strip.
- **Remove:** old `Contact`.

### L16 · About, Career, Achievements · M · status: todo
- **Needs:** owner content (T02).
- **Do:**
  - About as the profile screen.
  - Career as loading-screen cards.
  - Achievements as the post-game screen.
  - CV download.

### L17 · Sound cues · S · status: todo
- **Do:**
  - Wire the synthesised cues (hover, click, queue pop, accept, lock-in) to the components.
  - Unlock on the first gesture.
  - Respect the iOS silent switch.

### L18 · Polish · M · status: todo
- **Do:**
  - Accessibility pass: keyboard, focus, contrast, aria.
  - Reduced-motion pass.
  - Lighthouse budgets.
  - Mobile QA at 390 px.
  - Meta/OG without Riot marks, real `404.html`.
- **Done when:** the budgets in stack-modernization §10.4 are met.

### L19 · Purge Riot files from git history · S · status: todo (needs explicit owner approval)
- **Why:** `poro.png`, `bg-primary.jpg` and `inqueue.mp3` remain in the public history (codebase-audit §0.11).
- **Do:** rewrite history with `git filter-repo` on a fresh clone, then force-push `main`.
- **Warning:** this is destructive. Confirm with the owner in that session, and warn about existing clones and forks.

---

## Log

- 2026-11-16: backlog created from `docs/CHECKPOINT.md`. The mockup workflow can now run one screen per session (`args.only`) and reuses the built kit by default. The 23 unanswered research items are folded into T01 (decision log) and lot spikes instead of a research fan-out.
- 2026-11-16: T00 done. The planning docs are merged to `main` from `docs/hextech-planning`, with the owner's OK. Next: T01.
- 2026-11-16: one run of five tasks, by the owner's request (overrides rule 3 for that run). Done: T01, T04, T09. L01 is built on a local branch and waits for the owner's OK. L02 was stopped by the usage guard at 73% before any change. Progress 19%. Next: L01 push and PR, then L02, then T10.

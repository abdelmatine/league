# Checkpoint: Hextech rebuild

> **Since 2026-11-16, `docs/BACKLOG.md` is the tracker.** It splits all remaining work into one-session tasks. Start a fresh session with "Do task <ID> from docs/BACKLOG.md". This file is the history and detail behind it.
>
> - **Mockups:** run one screen per session. The resume steps below are replaced by the backlog's T10–T13, which use `docs/checkpoints/mockups-resume.workflow.js` with `args.only`.
> - **Research:** `docs/checkpoints/research-resume.workflow.js` is superseded by T01 (decision log).

## State on 2026-11-22 (latest)

2026-11-23: PR #5 merged and live (banners one by one, in-queue music with its notice). Open: the font pick (`docs/BACKLOG.md` → Next up 3b), EmailJS keys, content, real-device checks.


PR #4 merged into `main` (`ca70e9e`); production is live at https://abdelmatine.vercel.app. Backlog at 97%. Left: the owner items in `docs/BACKLOG.md` → "Next up" (EmailJS keys, the bypass secret, T03, L19, content, legal calls, real-device checks).

## State on 2026-11-21

The owner asked to finish the whole backlog in one run, stopping only if usage reached 90%, and said "not yet" to pushing. Everything except the owner-gated items is built on local branches; the tip is `integrate/parallel-lots`.

- Design phase done: owner-form defaults (T02), mockup review and gallery (T10–T14), spec (T20), plans (T21).
- Lots L02–L18 built and verified: L02–L08 by Claude and a foundation agent; L09–L16 by four agents in parallel git worktrees (under `.claude/worktrees/`, safe to clean up once merged); L17–L18 by Claude.
- Checks on the tip: `npm run check` (75 unit tests), `npm run build`, `npx playwright test` (42 passed, 8 skipped by design), keyed contact e2e (6 passed). Lighthouse accessibility, best practices and SEO 100.
- Open: push and merge (owner OK), EmailJS env vars, the Playwright bypass secret, T03, L19, the owner's review of defaults. Not verified: Safari, Firefox, real phones, a discrete GPU, real email delivery.
- To resume: read `docs/BACKLOG.md` → "Next up".

---

Last saved 2026-11-10, at the owner's request ("checkpoint & stop"). To pick it up, say: "resume from docs/CHECKPOINT.md".

## Where we are

| Step | Status |
|---|---|
| Audit project, find deploy target | Done. Vercel auto-deploys `main` to https://abdelmatine.vercel.app |
| First research pass on the client UI | Done: `docs/research/2026-11-09-lol-client-ui.md` |
| Direction mockups | Done. Owner picked **B (Hextech landing) with A's client header** |
| Deep research: 9 topic reports | **Done** (all in `docs/research/`) |
| Deep research: completeness critic | **Done**: 10 gaps and 18 contradictions, saved in `docs/checkpoints/critic-result.json` |
| Deep research: gap round + synthesis brief | **Stopped 2026-11-10 by the 80% usage guard (5-hour limit at 73%).** 4 of 27 gap/contradiction items answered (tone mapping, adaptive quality, project detail screen, champ select inside Lenis), saved in `docs/checkpoints/gap-results.json`. The other 23 items and the synthesis brief are not done |
| Hi-fi mockups: shared Hextech kit | **Done** (`.superpowers/hifi/kit/`, result saved in `docs/checkpoints/kit-result.json`) |
| Hi-fi mockups: 4 screens (home/loader, stack, contact, projects) | **Stopped 2026-11-10 by the 80% usage guard.** The 4 builders were still working (no builder finished; files keep growing: home.html last touched 09:24). No reviews, fixes or final check yet. Resume: same session `resumeFromRunId: "wf_6ae98441-6c5"` with `scriptPath: docs/checkpoints/mockups-resume.workflow.js` and `args.kit` from `docs/checkpoints/kit-result.json`; new session: rerun that script with the same `args.kit` (builders continue from the partial files) |
| Design spec + builder check | Not started |
| Lot plan + progress tracker (`docs/PROGRESS.md`) | Not started |
| Lot-by-lot build (branch, PR, merge, Vercel deploy) | Not started |

No product code has changed. Nothing is committed.

## Decisions so far

- **Layout:** one scrolling page (Hextech landing). The hero sits around a three.js hextech core with particles, every section has gold Hextech frames, and GSAP reveals sections on scroll.
- **Header:** the client-style top header: PLAY button, nav tabs, counters, and an avatar with a level ring.
- **Loading screen:** the Match Found / accept flow, in its "waiting for other players" state.
- **Contact:** sending the form plays the queue → match found → accept flow.
- **Stack section:** a Champion Select screen where frameworks are the champions. The 3D logos must match the real framework shapes.
- **Tools:** Tailwind (shadcn if useful), three.js / react-three-fiber, GSAP.
- **Hard rule:** no Riot assets (art, icons, logos, client images or videos, music, sound effects) and no Riot fonts (Beaufort, Spiegel). We recreate the design language ourselves.
- **Delivery:** work in lots. Each lot is one branch and one PR, merged to `main`, which Vercel deploys; then start the next lot. Track done and to-do in a progress file.

## Research files (all in `docs/research/`)

| Topic | File |
|---|---|
| Client UI basics | `2026-11-09-lol-client-ui.md` |
| Match Found / ready check, loader storyboard | `2026-11-09-ready-check.md` |
| Champion select, mapping to the stack | `2026-11-09-champ-select.md` |
| Header, social panel, lobby, loading, post-game, profile | `2026-11-09-shell-lobby-screens.md` |
| WebGL hextech visuals, performance tiers, version pins | `2026-11-09-webgl-magic.md` |
| 3D framework logos | `2026-11-09-3d-logos.md` |
| Toolchain upgrade | `2026-11-09-stack-modernization.md` |
| Full code audit | `2026-11-09-codebase-audit.md` |
| Three.js skills for Claude Code (vetting only) | `2026-11-09-threejs-skill.md` |
| Fonts, sound, legal | `2026-11-09-type-sound-legal.md` |

### What the critic found (to settle in the synthesis and the spec)

**18 contradictions between reports.** The main ones:

- **Loader:** the reports disagree on every loader parameter (sequence, timings, milestones).
- **Versions:** React 18 + fiber 8 (champ-select) vs React 19 + fiber 9 + drei 10 (webgl-magic, stack-modernization).
- **Tone mapping:** AgX for the hero core vs neutral, so brand-colour logos and gold aren't washed out.
- **Contact trigger:** SEND button vs header PLAY.
- **Header style:**
  - The mockup's hex PLAY with teal text vs the measured arrow plate with a #F0E6D2 label.
  - A fading underline vs the measured top pointer + bottom glow on main tabs.
- **Fonts:** Marcellus SC / Cinzel vs Literata for display; Barlow vs Source Sans 3 for body.
- **Sections and nav:** 4 tabs vs 5 (CAREER), chat dock or not, and missing content for About, Career and Stats.
- **3D logos:** three different builds (React especially), materials and lighting.
- **Frame loop:** three different frame-loop models and DPR policies.
- **Champion count and tile style.**
- **Riot wording:** type-sound-legal says not to use Riot nouns in UI copy (Summoner, Honor, RP/LP, Clash...) and warns against pixel-faithful client ornament paths.
- **Easing names:** the same names point to different curves.
- **Toast behaviour.**
- **Sounds:** synthesised vs recorded.
- **Caching headers.**
- **Lobby banner proportions.**
- **ESLint vs no ESLint.**

**10 open gaps.**

High priority:
- First-visit loader timeline and Core Web Vitals.
- One tone-mapping choice for the shared canvas.
- A reusable gold-frame section reveal.
- Adaptive quality on real devices and Safari.

Medium priority:
- Champ select inside Lenis smooth scroll.
- Project detail / case-study screen.
- Cost of DOM effects over the live canvas.
- The original ornament and glyph kit.
- Legal limits on copying the client GUI look.

Low priority:
- Project evidence and media pack.

### Flags

- `public/sounds/inqueue.mp3` looks ripped from League. Removed in L01; restored on 2026-11-22 at the owner's request under Riot's fan policy, with its notice (DECISIONS → Legal).
- The contact form uses placeholder EmailJS IDs, so it cannot send as shipped.
- The three.js skill install is waiting on the owner's OK. The vetting report is `2026-11-09-threejs-skill.md`.

## Hi-fi mockups (`.superpowers/hifi/`, gitignored)

- **Kit (done, checked by screenshots, zero console errors):** made of these parts:
  - `kit/hextech.css` (tokens + components)
  - `kit/motion.js` (client easings, effect helpers)
  - `kit/sfx.js` (Web Audio sounds, muted by default)
  - `kit/header.js` (`<hx-header>` with PLAY states)
  - `kit/stage.js` (three.js core, particles, bloom, extruded logos, pedestal)
  - `kit/demo.html` (showcase)
  - `tools/shoot.mjs` (Playwright screenshot tool on system Chrome; `playwright-core` installed in `tools/`)
- **Screens (partial, stopped mid-build):** `home.html` + `home/`, `stack.html` + `stack/`, `contact.html` + `contact/`, `projects.html` + `projects/`. Not reviewed.
- **Viewing:** serve them with the launch config `hifi-mockups` (python http.server at the repo root, port 5174), then open http://127.0.0.1:5174/.superpowers/hifi/index.html (the gallery page is still a placeholder).
- Screenshots so far are in `.superpowers/hifi/shots/` (about 67 MB).
- **Design-checker flags left to triage on resume:** 17 items across `kit/hextech.css`, `kit/demo.html`, `home.html`, `projects.html` and `projects/projects.css`.
  - A one-side accent border at `kit/hextech.css:929` (new).
  - Coloured glows (probably intentional hextech glow).
  - All-caps runs of text.
  - Cramped padding.
  - Untriaged, because work was stopped. Feed them to the resumed review pass.

## Usage pacing (owner rule: stop at 80% of the 5-hour limit)

- On 2026-11-10 both workflows together used about 53% of the 5-hour window in about 80 minutes (20% → 73%), and no mockup builder finished in that time.
- Next time:
  - Run one workflow at a time.
  - Arm the guard first: a 2-minute cron that stops everything at 73%.
  - Consider fewer concurrent agents, or a lower effort for the builders.

## How to resume

1. **Start the mockup server:** launch config `hifi-mockups` (preview_start).
2. **Finish the research:**
   - Same session: `Workflow({ scriptPath: <session>/workflows/scripts/hextech-research-audit-wf_9c8cf68a-f96.js, resumeFromRunId: "wf_9c8cf68a-f96" })`. It reuses the reports, the critic and the 4 answered gap items, then runs the rest and the synthesis.
   - New session: run `docs/checkpoints/research-resume.workflow.js` with `args: { critique: <contents of docs/checkpoints/critic-result.json> }`. It skips all 9 reports and the critic.
3. **Finish the mockups** (can run at the same time as step 2):
   - Same session: resume run `wf_0dfb7ad2-589` with its persisted script.
   - New session: run `docs/checkpoints/mockups-resume.workflow.js` with `args: { kit: <contents of docs/checkpoints/kit-result.json> }`. Builders continue from the partial screen files, then two reviews per screen, fixes, and a final check.
4. **Show the mockups.** Collect the owner's reactions, and ask them:
   - The synthesis's open questions (content: about text, experience, CV, real project descriptions).
   - The three.js skill install.
   - The contradictions that need their taste: fonts, PLAY style, 4 vs 5 tabs.
5. **Write the design spec** at `docs/superpowers/specs/2026-11-09-hextech-portfolio-design.md`, run the builder check, and get the owner's approval.
6. **Plan the lots** with `superpowers:writing-plans`, and create `docs/PROGRESS.md` as the tracker.
7. **Build lot by lot:** branch → PR → merge to `main` → Vercel deploy → update `docs/PROGRESS.md` → next lot.

## Local environment

- Dependencies are installed (`npm ci`). `dist/` exists from an audit build; it is gitignored.
- Launch configs in `.claude/launch.json`: `league-dev` (Vite, port 5173) and `hifi-mockups` (port 5174).
- Uncommitted files: `.gitignore` (adds `.superpowers/`), `.claude/launch.json`, `.impeccable/config.json` (design-checker ignores scoped to the old mockup file), `docs/`.
- All servers and workflows are stopped.

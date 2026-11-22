# L12 + L16 · Projects lobby, About, Career, Achievements (agent P)

Spec: §6.4, §6.5, §6.8, §10. Rules: `_parallel-rules.md`. Branches: `lot/L12-projects` → `lot/L16-about-career`.

**Read:** gap-results `gap:5` (project detail = a champion-details style panel, one native dialog, tabs, the "ALL" grid, sizes, the `#projects/<slug>` deep link); shell-lobby-screens §0 and its lobby-banner, loading-card, post-game and profile sections; DECISIONS rows C07, C17, G06, G10. Mockup reference: `.superpowers/hifi/projects.html`, `projects/projects.js`, `projects/projects.css`, `projects/art.js`, the About band in `home.html` and `home/home.css`, shots `projects-*` and `home-*`.

**Owns:** `src/sections/Projects.tsx`, `src/sections/projects/*`, `src/sections/About.tsx`, `src/sections/about/*`, new `src/sections/Career.tsx` and `src/sections/Achievements.tsx` (+ folders), the `src/App.tsx` lines that mount them (content-gated), optimised images under `public/assets/` (new files), `src/content/projects.ts` (additive optional fields only, e.g. `images`, `year`).

**Content rules:** shown projects only (`shownProjects`); no ratings, ranks or invented metrics; project texts as in the content file. Career and Achievements render only when `career.ts` or an achievements array has entries. Both are empty today, so neither may appear (and no CAREER tab appears). About uses `profile.ts`; the placeholder flag shows only in dev.

## L12 · projects

1. Lobby: short banners filled centre-out (first project in the centre), 5 visible ≥ 1280 px, 3 ≥ 768 px, 1 on phones with swipe (pointer events, no library); pager arrows, dots and keyboard arrows; reduced motion → no slide animation.
2. Banner: emblem (project image in a gold crest frame; fix the dark-on-dark logos, for example with a light inner disc for dark marks), name, one-line tag, up to 3 stack chips (+N), a VIEW button. Chips follow each tech's logo policy (flat logo or monogram).
3. Detail: one `Dialog` under the header, tabs OVERVIEW (description, stack, live link), STACK (each tech and its lane), GALLERY (the images we have); full-screen sheet below 768 px. Deep link `#projects/<slug>` opens it at load and on click; closing restores `#projects`.
4. Images: convert the shown projects' images to AVIF and WebP at display size (2×) with a one-off script (sharp, installed temporarily); `<picture>` with width and height; lazy below the fold. Spike G10: check that each shown project's live link responds (HEAD or GET from Node) and record the results in DECISIONS (row G10).

## L16 · about, career, achievements

1. About as the profile screen (the mockup's About band): crest with the photo, name, title, the paragraph(s), the five mains with project counts (`mainsByUsage`), counters (projects shipped, technologies, lanes covered) with `counterUp` on reveal.
2. Career as loading-screen cards and Achievements as the post-game screen, both content-gated. Build them against a small fixture in a test so they are ready when content arrives. Show a CV button only when `profile.cvUrl` is set.

**Done:** the common done list; the deep link works from a cold load; the dialog traps focus and returns it.

# L17 · Sound cues and L18 · Polish

Done by Claude after the parallel lots merge. Spec: §9, §11, §12.

## L17 · sound cues

1. Audit every place that should make a sound: header PLAY and tabs (hover, click), buttons (click), contact (queue, matchFound, accept, decline), stack (tile hover, lockIn). Wire what the lots left out.
2. Unlock on the first pointerdown or keydown; sound stays off until the toggle is on; the choice persists.
3. iOS: never set `navigator.audioSession.type`.
4. Unit-test the cue table.

**Done:** with sound on, every cue fires once per action; with sound off, nothing plays; no console errors.

## L18 · polish

1. Accessibility: a keyboard pass through every section, focus order, focus ring, aria on dialogs and live regions, contrast of muted text, the skip link; Lighthouse accessibility ≥ 0.95 on the preview build.
2. Reduced-motion pass with `prefers-reduced-motion: reduce` emulated.
3. Budgets: eager JS ≤ 170 kB gz, 3D chunk ≤ 310 kB gz, CSS ≤ 20 kB gz, fonts ≈ 50 KB; LCP ≤ 2.5 s, CLS ≤ 0.1 (Lighthouse CI with `npx -y @lhci/cli@0.16.0` against `dist`).
4. Mobile QA at 390×844 and 768×1024.
5. Meta and OG: title, description, canonical, theme-color, an OG image of our own (name and a gold frame, no tech or game logos), a favicon of our own crest; check `public/404.html`.
6. README (credits, non-affiliation notice) and the backlog.

**Done:** all budgets met, or the gaps written down with numbers; the Playwright suite is green.

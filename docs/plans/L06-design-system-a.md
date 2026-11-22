# L06 · Design system A

Spec: §4, §5. Port source: `.superpowers/hifi/kit/hextech.css` (local). Do not copy client values as a set: use the spec's own tokens.

**Goal:** tokens, fonts, base styles and the first components (Frame, GoldButton, MagicButton, Divider, Icon), shown on a dev-only kit page.

**Files:** `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/components.css`, `src/index.css` (imports), `public/fonts/*`, `index.html` (preloads), `src/components/ui/{Frame,GoldButton,MagicButton,Divider,Icon}.tsx`, `src/dev/KitPage.tsx` (rendered when `?kit` is in the URL, dev builds only).

**Steps**
1. Fonts: build a caps-only Literata subset (A–Z, digits, punctuation, wght 500–800) and copy Source Sans 3 Variable latin from `@fontsource-variable/source-sans-3`. Name them `-v1.woff2`; `vercel.json` marks `/fonts/(.*)-v(\d+).woff2` immutable.
2. `tokens.css`: `@theme` with the spec palette, fonts, easings, durations; `--radius-*: initial`.
3. `base.css`: body, selection, focus ring, scrollbar, `.sr-only`, `html.js` gate for reveals with a 3 s failsafe.
4. Components as React + component CSS classes (`hx-*`), ported from the kit and renamed. Ornaments are our own SVG.
5. Spike G03/G08: write the ornament construction rules (grid, angles, stroke weights) at the top of `components.css`; measure the frame build-in over the canvas in L10.

**Done when:** the kit page shows every component in all states at 1440 and 390 with no console errors, and `npm run check` passes.

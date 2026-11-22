# L09–L11 · 3D stage, hero, loader (agent S)

Spec: §6.1, §6.3, §7, §8, §12. Rules: `_parallel-rules.md`. Branches: `lot/L09-webgl-stage` → `lot/L10-hero-choreography` → `lot/L11-loader`.

**Read:** webgl-magic §0 and §2–§7 (frame loop, core build, materials, post chain, tiers, lazy chunk, reduced motion); gap-results `gap:1` (NEUTRAL tone mapping and the MID constants) and `gap:3` (custom tier monitor, `tierPlan`, never climb back); ready-check §15–§18 (loader storyboard); DECISIONS rows C01, C03, C10, G01, G02, G04, G07. Mockup reference: `.superpowers/hifi/home.html`, `home/home.js`, `home/home.css`, `kit/stage.js` (`buildHextechCore`, `buildParticles`, `runeMaterial`), shots `home-*`.

**Owns:** `src/components/stage/*` (except the `stack` entry in `scenes.ts`), `src/lib/tiers.ts` (+test), `src/sections/Hero.tsx` and `src/sections/hero/*`, `index.html`, `src/main.tsx`, `src/lib/loader.ts` (+test), a CSS poster for the hero.

## L09 · stage + core

1. Quality tiers: `tierPlan` (phones ≤ MID; HIGH only on an allowlisted desktop GPU; software GPU → no 3D), pixel budgets HIGH 2.4 MP / MID 1.2 MP / LOW 0.6 MP, a custom monitor that scores continuous frames only and never climbs back. Unit-test the pure parts.
2. Hero core in r3f: hexagonal bipyramid crystal (LatheGeometry, 6 segments) with fake glass on MID/LOW and transmission on HIGH only, fbm energy sphere, additive fresnel halo, two hex rings, a procedural rune ring, drifting particles. Our own shader code; port ideas from `kit/stage.js`.
3. Post: Bloom (mipmapBlur, threshold 1) → Vignette → ToneMapping NEUTRAL last, `multisampling={0}`. No float buffers → no post and `gl.toneMapping = NeutralToneMapping`. MID constants from gap:1.
4. Render only while a scene is visible (already in the skeleton); keep the one clock (gsap.ticker → lenis.raf → advance).
5. Reduced motion: one still frame. CSS poster under the canvas while 3D is off or still loading.
6. Spike G07: measure the header backdrop blur and the PLAY effects over the live canvas (frame time with and without) and write a per-tier downgrade table into DECISIONS (row G07 → decided); drive it with `--hdr-blur`.

**Done L09:** 60 fps target at MID on the dev iGPU (report what you measured), nothing renders while the hero is off screen, lazy chunk ≤ 310 kB gz.

## L10 · hero content + choreography

1. Name reveal with SplitText (chars rise and sharpen, staggered), title line, CTAs, scroll cue; an identity chip if it fits the mockup.
2. ScrollTrigger: the camera pulls back and the core dims as About enters; pointer parallax on desktop only.
3. Section reveals: `frameBuildIn` on every section frame once at 20% in view, content visible without JS. Prototype the gold border draw-on (spike G03) and keep it under 2 ms per frame over the canvas; record the result in DECISIONS (G03).
4. Reduced motion: no camera move, no parallax, opacity-only reveals.

## L11 · loader

1. Inline loader in `index.html` (≤ 2 KB of inline CSS + JS together; measure it): our own ring SVG, status text; `<noscript>` hides it.
2. Milestones: HTML parsed 10%, fonts ready 35%, app mounted 60%, 3D chunk ready or skipped 90%, first frame 100% (`src/lib/loader.ts`, tested state machine). Then "MATCH ACCEPTED" over "Waiting for other players", 400 ms hold, overlay out over 600 ms while `playStore` goes patching → play (`progress` events during load, `ready` at the end; take over the `ready` dispatch App does today).
3. Failsafe reveal at 10 s. Returning visitor in the same session: a 600 ms version. Reduced motion: plain fade, no ring animation. No sound.
4. Spike G01: measure first-visit LCP and CLS with and without the loader (Playwright + PerformanceObserver on the preview build, desktop and mobile) and record the numbers and the final timings in DECISIONS (rows C01 and G01 → decided).

**Done L11:** LCP ≤ 2.5 s on the local preview at desktop size, CLS ≤ 0.1, no layout shift when the loader leaves.

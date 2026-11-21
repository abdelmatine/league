# L13–L14 · Stack screen, 2D and 3D (agent K)

Spec: §6.6, §7 (logos), §13. Rules: `_parallel-rules.md`. Branches: `lot/L13-stack-2d` → `lot/L14-stack-3d`.

**Read:** champ-select report §0 and the sections it points to (layout, tiles, timer bar, phase banner, intro draft, LOCK IN); 3d-logos §0, §3, §4, §5; gap-results `gap:4` (champion select inside a Lenis page: intro start and skip, no pinning, heights, no layout shift, DOM-to-3D drift, `#stack/<id>` deep links); DECISIONS rows C08, C09, C11, G05 and the Legal per-mark table. Mockup reference (strongest screen; port its look): `.superpowers/hifi/stack.html`, `stack/stack.js`, `stack/stack.css`, `stack/scene.js`, `stack/data.js`, `stack/sheet.js`, shots `stack-*`.

**Owns:** `src/sections/Stack.tsx`, `src/sections/stack/*`, the `stack` entry in `src/components/stage/scenes.ts`, `src/components/stage/stack/*` (logo scene), `src/sections/stack/logos3d.ts`.

**Content rules (do not break):** lanes and mains come from `src/content/tech.ts` and `src/lib/content.ts` (`mainsByUsage`, `projectsUsing`). Lane labels are Frontend, Backend, Data, Mobile, Core, never game lanes (Top, Jungle, Mid, Bot, Support). Logo policy per tech: `extrude` (Angular and JavaScript only) → 3D mesh; `flat` → the unaltered official logo (from `public/icons`) on our own gold token; `name` → a monogram in our display font on the token. Never recolour, bevel or animate a `flat` logo into a new shape. No ratings or made-up levels: a tile shows how many shown projects use the tech, or "No listed projects yet".

## L13 · 2D

1. Layout per spec §6.6 at `max(640px, calc(100svh - var(--hdr)))`, no pinning, one reserved box shared by the grid and the build sheet (no layout shift).
2. Left: MAINS (5 lanes). Centre: splash (selected tech name, lane, project count) above lane filters (All + 5 lanes), search and the tile grid. Right: the projects that use the selected tech (the "skins"), linking to `#projects/<slug>`.
3. Intro draft: starts when the section is active and Lenis has stopped; skip on pointerdown or focus inside, a `#stack/<id>` hash at load, or reduced motion. Phase banner and timer bar as in the mockup, with our own geometry.
4. Deep link `#stack/<id>` selects a tech at load and on click (via `hash.ts`); the scroll-spy never writes the hash.
5. Keyboard: the grid is arrow-navigable (roving tabindex), Enter selects, LOCK IN is reachable; `data-lenis-prevent` on any inner scroller. Mobile layout as in the `stack-390x844` capture.

## L14 · 3D + LOCK IN

1. `logos3d.ts`: Simple Icons paths (CC0) for Angular and JavaScript only; SVGLoader → ExtrudeGeometry with an inward bevel, `toCreasedNormals`, `mergeGroups`, cached, built lazily (idle callback).
2. Scene `stack` registered in `scenes.ts`, placed on the splash anchor every frame (`placeOnAnchor`): the extruded logo with an enamel face and gold sides on a pedestal for `extrude` techs; for the others a gold token (our own coin or plinth geometry) with the flat logo or the monogram as a texture on its face. RoomEnvironment through PMREM on these materials only; blob shadow; NEUTRAL tone mapping (the stage sets it).
3. Swap between techs with a dissolve; LOCK IN timeline (about 1.2 s: snap flash, ring burst, tile locks, `sfx.play('lockIn')`), then the right column highlights.
4. Credits: Angular (CC BY 4.0, modified) and JS (MIT, modified) lines exist in `creditLines`; make sure they appear when those meshes show. No Duke.
5. Reduced motion: no dissolve or spin, a still mesh.

**Done:** both lots meet the common done list; the 3D logo tracks its DOM box while scrolling with no visible drift at 60 Hz.

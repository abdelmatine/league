# L07 · Design system B

Spec: §4 (motion), §5, §9.

**Goal:** the rest of the UI kit plus the motion and sound modules.

**Files:** `src/components/ui/{Tabs,Field,Toast,Crest,Tooltip,Dialog,Counter}.tsx`, `src/lib/motion.ts`, `src/lib/sfx.ts`, `src/lib/toast.ts` (store), tests.

**Steps**
1. `motion.ts`: register GSAP plugins once (ScrollTrigger, SplitText, CustomEase, useGSAP); create the spec's easing table with `CustomEase.create`; helpers `splitReveal`, `frameBuildIn`, `counterUp`, `prefersReducedMotion`.
2. `sfx.ts`: Web Audio synth, muted by default, `setEnabled`, `play(cue)`, first-gesture unlock, persisted choice.
3. Toast: one region, store with `push/dismiss`, persistent option, max 3.
4. Dialog: native `<dialog>`, `showModal`, focus return, Esc, sheet below 768 px, `dialog { margin: auto }`.
5. Tabs: roving tabindex, arrow keys, `aria-selected`.
6. Field: blur-first validation API, reserved error line.
7. Add all to the kit page.

**Done when:** kit page shows all components; `toast` and `sfx` logic covered by unit tests where pure; `npm run check` passes.

# Hextech WebGL magic: hero core, particles, post-processing, performance

Date: 2026-11-09. Reader: the front-end dev building direction B (scrolling Hextech landing) with A's client header. Scope: three.js / react-three-fiber visuals and what they cost. Palette, frames, button CSS and client timings are in `2026-11-09-lol-client-ui.md` and are not repeated.

Tags: **[measured]** I ran it today (method in §8). **[src]** read in the published npm package source today. **[doc]** official docs, release notes or blog (see Sources). **[proposal]** my starting values; tune by eye. **UNVERIFIED** I could not confirm it.

Everything below is procedural: no textures, no Riot art, no Riot fonts. Framework logos come from Simple Icons (CC0 path data).

---

## 0. Decisions

1. **Upgrade the 3D stack in the redesign branch, with exact pins:** react and react-dom 19.3.1, three 0.187.0, @react-three/fiber 9.8.2, @react-three/drei 10.7.9, @react-three/postprocessing 3.2.2, postprocessing 6.39.6, gsap 3.15.1, @gsap/react 2.1.2, lenis 1.3.27. Delete `react-three-fiber@6.0.13`, an old duplicate package that is still in package.json. I built this exact set and ran our shaders on it: it compiled with no errors and one harmless warning. (§1)
2. **Use one fixed, full-screen `<Canvas>` behind the DOM.** That gives one WebGL context and one EffectComposer. Do not use one canvas per section, and do not use drei `<View>`, because pmndrs postprocessing can't scissor. 3D that belongs to a section, such as the champion-select logo, is placed from its DOM rectangle. (§2)
3. **Use one clock:** `gsap.ticker` → `lenis.raf()` → r3f `advance()`, with `frameloop="never"`. GSAP writes to a plain mutable store and `useFrame` damps toward it. Rendering happens only while 3D is on screen. (§2.3, §6)
4. **The core is built from these parts:** a hexagonal bipyramid crystal (`LatheGeometry`, 6 segments) around an fbm energy sphere, an additive fresnel halo, two hex rings (`TorusGeometry(r, t, 4, 6)`), a procedural rune ring and drifting points. (§3–4)
5. **Transmission is the most expensive single item.** drei `MeshTransmissionMaterial` at its defaults adds **+11.1 ms** per frame on a 2020 Intel iGPU at 1080p. Samples 6 at resolution 512 still adds +8.7 ms. Use it on the HIGH tier only. MID and LOW use "fake glass", which adds +0.3 ms. [measured] (§3.3)
6. **Post-processing chain:** Bloom (`mipmapBlur`, threshold 1.0), then Vignette, then AgX `ToneMapping` last, with `multisampling={0}`. Chromatic aberration and Noise run only on HIGH. EffectComposer forces `gl.toneMapping = NoToneMapping` while it is mounted [src], so without a ToneMapping effect the HDR core clips. (§5)
7. **Budget pixels, not DPR.** HIGH gets 2.4 MP, MID 1.2 MP, LOW 0.6 MP, and `PerformanceMonitor` moves between them. On the iGPU at 1440×810, MID costs 12.5 ms and LOW 5.0 ms; the full HIGH look costs 23 ms at 1080p. [measured] (§7)
8. **Lazy-load the 3D chunk behind a CSS poster.** It is about **301 kB gzipped** with the React 19 stack. Never download it when Save-Data is on, WebGL2 is missing or the GPU is software-only. Today the app ships **384 kB gzipped eagerly**, three.js included. [measured] (§7.6)
9. **Reduced motion:** render one still frame. No particle drift, no scroll-driven camera, no pointer parallax. (§7.4)
10. **Champion-select logos:** Simple Icons path → `SVGLoader` → beveled `ExtrudeGeometry`. React, Angular, Spring Boot, Flutter, TypeScript and Node all extruded correctly. Build them lazily, because React's mesh takes 126 ms on the main thread. [measured] (§9)

---

## 1. Version matrix (from `npm view` on 2026-11-09)

| Package | In repo now | Latest stable (release date) | Pre-release | Peer constraints [src] |
|---|---|---|---|---|
| react, react-dom | 18.3.1 | **19.3.1** (2026-10-14) | 19.3 canary | — |
| three | 0.171.0 | **0.187.0** (2026-10-30); 0.186.1 also current | — | — |
| @react-three/fiber | 8.17.10 | **9.8.2** (2026-10-14) | 10.0.0-alpha.6 (2026-10-17) | 9.8.2: react `>=19 <19.4`, three `>=0.156`. Last v8 is 8.18.0 (2025-02-19): react `>=18 <19` |
| @react-three/drei | 9.118.0 | **10.7.9** (2026-09-25) | 11.0.0-alpha.7 | 10.7.9: fiber `^9.0.0`, react `^19`, three `>=0.159`. Last v9 is 9.122.0 (2025-02-19): fiber `^8`, react `^18`. 11 alpha: react `>=19.0 <19.3` (excludes 19.3.1) |
| @react-three/postprocessing | — | **3.2.2** (2026-10-21) | — | fiber `>=9.7.0`, react `^19`, postprocessing `^6.36.0`. Last v2 is 2.19.1 (2025-01-23): fiber `^8` |
| postprocessing | — | **6.39.6** (2026-11-01) | 7.0.0-beta.16 | three **`>=0.168.0 <0.188.0`**. This caps three at r187 |
| gsap | — | **3.15.1** (2026-11-04) | 4.0.0-beta.3 (2026-11-05, no announcement on gsap.com/blog) | — |
| @gsap/react | — | **2.1.2** | — | gsap `^3.12.5`, react `>=17` |
| lenis | — | **1.3.27** | 2.0.0-dev.6 | react `>=17` (optional) |
| maath | 0.10.8 (pulled in by drei) | 0.10.8 | — | three `>=0.134` |
| detect-gpu | (pulled in by drei) | 5.0.70 | — | — |
| three-custom-shader-material | — | 6.4.0 | — | fiber `>=8`, three `>=0.159` |
| r3f-perf (dev only) | — | 7.2.3 | — | fiber `>=8` |
| simple-icons | — | 16.37.0 (license CC0-1.0) | — | — |
| react-three-fiber (old package name) | **6.0.13** | dead | — | **remove** |

**Compatibility check [measured].** React 19.3.1 + three 0.187.0 + fiber 9.8.2 + drei 10.7.9 + postprocessing wrapper 3.2.2 + postprocessing 6.39.6 bundled and rendered our full scene: MTM, Environment with Lightformers, all post effects and every custom shader in this report. Shader compile errors: 0. One console warning per root: `THREE.Clock: This module has been deprecated` (Clock has been deprecated since r183 [src]; fiber 9.8.2 still constructs it). It is harmless.

**Upgrade to React 19 + fiber 9 now? Yes, in the redesign branch.**
- **For:**
  - fiber 8, drei 9 and postprocessing wrapper 2 have been frozen since January–February 2025.
  - The current 3D code is two files, about 95 lines, so it gets rewritten anyway.
  - fiber 9.x fixes matter here [doc]:
    - 9.6.0: stable `ShaderMaterial` uniform references, so inline `uniforms` objects work.
    - 9.7.0: reconciler hardening.
    - 9.8.0: React 19.3 compatibility.
    - 9.8.1: `<Activity>` support.
    - 9.8.2: portal memory-leak fix, pixel ratio updates when the window moves between displays, and objects are removed immediately under `frameloop="demand"`.
  - fiber 10 (WebGPU by default, tree-shakable core) requires React 19.
- **Against:**
  - About **+23 kB gzipped** on the main chunk (react-dom 19 is 69.0 kB vs 45.8 kB).
  - About **+25 kB gzipped** in the lazy 3D chunk. [measured]
  - These libraries pin React 18 at their installed versions: framer-motion 11.12, react-spring 9.7.4, react-modal 3.16.1, react-scroll 1.9.0 and typewriter-effect 2.21. Each has a later version that accepts React 19, or GSAP replaces it [src].
  - Since fiber v9, react-dom `StrictMode` also applies inside `<Canvas>` [doc], so dev mode runs effects twice. Use `useGSAP`, which reverts automatically, rather than raw `useEffect` for tweens.
- **Do not adopt:** the fiber 10 alpha, the drei 11 alpha (it rejects React 19.3.1), the postprocessing 7 beta or the GSAP 4 beta.

**WebGPU? Not now.**
- fiber 10 alpha makes `WebGPURenderer` the default and moves WebGL to `@react-three/fiber/legacy` [doc].
- drei MTM and pmndrs postprocessing are GLSL/WebGL.
- Our scene has about 10 draw calls and 3,000 points, so it gains nothing from WebGPU.
- WebGPU now ships in Chrome 113+ (Android 121+), Safari 26 and Firefox 141 on Windows and 145 on Apple Silicon Macs; Linux and Android Firefox are behind a flag. `WebGPURenderer` falls back to WebGL2 [doc: utsubo].
- Revisit when fiber 10 and drei 11 go stable. The future path is TSL with three's `RenderPipeline` (renamed from `PostProcessing` in r183 [doc]).

---

## 2. Stage architecture

### 2.1 Options compared

| Option | Contexts | Post-processing | Cost and risk |
|---|---|---|---|
| **A. One fixed full-screen canvas** behind transparent DOM sections; section-bound meshes follow DOM rectangles | 1 | One composer covers everything | Rectangle-sync code (§2.5). HAOQI.DESIGN uses this setup (Codrops case study, 2026-08) [doc] |
| B. drei `<View>` (one canvas, `gl.scissor` per tracked div) | 1 | **No.** pmndrs postprocessing has no viewport/scissor support (GitHub discussion #513), and each View renders its own portal scene with scissor [src: `web/View.js`]. Combining them is UNVERIFIED and probably needs custom work | Fine for many small post-free widgets. `track` is deprecated in favour of inline Views [doc] |
| C. One canvas per section | N | One composer per canvas | Chrome is commonly reported to keep at most 16 active contexts and drop the oldest. Firefox mobile was historically 2 per origin and 4 total, raised to 16 on Android (Mozilla bug 1421481). Every context compiles its own shaders and uploads its own geometry. Only acceptable with at most 2 mounted at once, using IntersectionObserver |

**Choose A.** The canvas sits at `position: fixed; inset: 0; z-index: 0; pointer-events: none`. Sections sit above it. A framed panel that must show 3D, such as the champion-select splash, keeps a **transparent** interior. All other panels stay opaque `#010A13`, which also hides the canvas cheaply.

### 2.2 Component layout

```jsx
// App.jsx (sketch). The 3D chunk is lazy and the poster is pure CSS (not an LCP candidate, nothing to download)
const Stage = lazy(() => import('./stage/Stage.jsx'))   // three + r3f + drei + post ≈ 301 kB gz

export default function App() {
  const allow3D = useAllow3D()            // §7.4: false for Save-Data, no WebGL2, software GL
  const [ready, setReady] = useState(false)
  return (
    <>
      <div className="stage-poster" data-ready={ready} aria-hidden="true" />  {/* same composition in radial-gradients */}
      {allow3D && <Suspense fallback={null}><Stage onReady={() => setReady(true)} /></Suspense>}
      <ClientHeader />                     {/* A's top bar */}
      <main className="relative z-10">{/* framed sections */}</main>
    </>
  )
}
```

```jsx
// stage/Stage.jsx (the lazy chunk)
import { Canvas, useThree, advance } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { useEffect, useState } from 'react'
import { frameHooks } from '../scroll/clock'   // the main-chunk clock, §2.3
import { stage } from './store'

export const TIERS = {
  high: { maxPx: 2.4e6, glass: 'mtm',  post: 'full', particles: 3000, octaves: 5, warp: 3 },
  mid:  { maxPx: 1.2e6, glass: 'fake', post: 'lite', particles: 2000, octaves: 4, warp: 1 },
  low:  { maxPx: 0.6e6, glass: 'fake', post: 'none', particles: 900,  octaves: 3, warp: 1 },
}
// shortcut: budget uses the viewport at tier-change time; re-run on resize if users resize a lot
const dprFor = (maxPx) => Math.min(devicePixelRatio, Math.sqrt(maxPx / (innerWidth * innerHeight)))

function Ready({ onReady }) {                     // keep last: everything above is mounted
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    let live = true
    gl.compileAsync(scene, camera).then(() => live && onReady())   // KHR_parallel_shader_compile when available [src]
    return () => { live = false }
  }, [gl, scene, camera, onReady])
  return null
}

function Tiering({ setTier }) {                    // PerformanceMonitor callbacks get fps/factor, not gl
  const gl = useThree((s) => s.gl)
  return (
    <PerformanceMonitor flipflops={3}
      onIncline={() => setTier((x) => (x === 'low' ? 'mid' : allowHigh(gl) ? 'high' : 'mid'))}
      onDecline={() => setTier((x) => (x === 'high' ? 'mid' : 'low'))}
      onFallback={() => setTier('low')} />
  )
}

function Driver() {                               // r3f renders only when the clock says so
  useEffect(() => {
    const render = (t) => { if (stage.active || stage.dirty) { stage.dirty = false; advance(t) } }  // t in seconds
    frameHooks.add(render)
    return () => frameHooks.delete(render)
  }, [])
  return null
}

export default function Stage({ onReady }) {
  const [tier, setTier] = useState(initialTier())  // §7.3
  const t = TIERS[tier]
  return (
    <Canvas
      aria-hidden="true"
      frameloop="never"
      dpr={dprFor(t.maxPx)}
      gl={{ antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance', toneMapping: THREE.AgXToneMapping }}
      camera={{ position: [0, 0.4, 5.2], fov: 40, near: 0.1, far: 40 }}
      eventSource={document.getElementById('root')}
      eventPrefix="client"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    >
      <color attach="background" args={['#010A13']} />
      <Driver />
      <Tiering setTier={setTier} />
      <Core tier={t} />                               {/* Core, Particles, Post: §3–§5; initialTier, allowHigh: §7.2 */}
      <Particles count={t.particles} />
      {t.post !== 'none' && <Post kind={t.post} />}
      <Ready onReady={onReady} />
    </Canvas>
  )
}
```

Notes:
- **Canvas defaults [src]:** fiber 9's `<Canvas>` defaults to `dpr={[1, 2]}`, `antialias: true`, `alpha: true`, `powerPreference: 'high-performance'` and `frameloop: 'always'`. The sketch overrides all of them.
- **Tone mapping:** fiber sets ACESFilmic unless `flat`, but an explicit `gl.toneMapping` wins [src]. `toneMapping: AgX` on the renderer keeps the LOW tier (no composer) looking the same as the composer's AgX `ToneMapping` effect.
- **Depth buffer:** keep `depth` on. The postprocessing README recommends `depth: false` [doc], but LOW renders straight to the canvas and needs a depth buffer.
- **Pointer:** `eventSource` plus `pointer-events: none` keeps `state.pointer` (used for parallax) working through the DOM [doc].
- **`frameloop="never"`:** `advance(t)` runs the global effects, the `useFrame` subscribers and the render. In this mode `clock.elapsedTime = t`, so **pass seconds**. `invalidate()` does nothing in this mode [src: fiber 9.8.2 `update()`, `invalidate()`].
- **`AdaptiveDpr`:** it reacts only to `performance.regress()` (movement regression), not to frame rate [src]. It is useless without controls; use `PerformanceMonitor`.

### 2.3 One clock (main chunk; it must not import three or r3f)

```js
// scroll/clock.js: the page's only requestAnimationFrame owner. gsap + ScrollTrigger + useGSAP ≈ 49 kB gz, lenis 5.6 kB gz
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
gsap.registerPlugin(ScrollTrigger, useGSAP)

export const lenis = new Lenis({ autoRaf: false })   // respectReducedMotion is on by default [doc]
lenis.on('scroll', ScrollTrigger.update)             // Lenis' documented integration [doc]
export const frameHooks = new Set()                  // the lazy Stage adds its renderer here
gsap.ticker.lagSmoothing(0)
gsap.ticker.add((time) => {                          // seconds; runs after GSAP's own updateRoot [src]
  lenis.raf(time * 1000)                             // → 'scroll' → ScrollTrigger.update → scrubbed timelines
  for (const f of frameHooks) f(time)                // → r3f renders last, with this frame's values
})
```

Why this order:
- **GSAP runs first.** `gsap-core.js` registers `_ticker.add(Timeline.updateRoot)` at init, and `ticker.add` appends listeners unless `prioritize` is set [src]. Tweens are therefore applied before our listener runs.
- **No one-frame lag.** HAOQI.DESIGN measured a one-frame WebGL lag when Lenis and R3F each owned a requestAnimationFrame loop. They fixed it by driving `lenis.raf` from r3f `addEffect` [doc]. The ticker version gives the same guarantee and also works while the canvas is paused or absent.
- **Scrub mode.** Use `scrub: true` (direct progress) with Lenis. A numeric `scrub` adds a second smoothing layer, and its catch-up tween lands one tick later [doc].

### 2.4 Store and damping (refs, never React state)

```js
// stage/store.js: plain object. GSAP tweens it, useFrame reads it. No React re-render per frame
export const stage = { active: true, dirty: false, camZ: 5.2, coreX: 0, coreY: 0.35, coreScale: 1, glow: 1, rune: 0 }
```

```jsx
import { easing } from 'maath'   // damp* return true while still moving [src]
useFrame((s, dt) => {
  dt = Math.min(dt, 1 / 20)                                    // after a pause, delta can be seconds long
  easing.damp(s.camera.position, 'z', stage.camZ, 0.25, dt)
  easing.damp3(core.current.position, [stage.coreX, stage.coreY, 0], 0.3, dt)
  easing.damp3(core.current.scale, stage.coreScale, 0.3, dt)
  easing.dampE(core.current.rotation, [s.pointer.y * 0.12, s.pointer.x * 0.18, 0], 0.4, dt)   // parallax ±0.18 rad
  energy.uniforms.uIntensity.value = stage.glow * (1 + 0.08 * Math.sin(s.clock.elapsedTime * 1.5))  // breathe, 4.2 s
})
```

The r3f docs say to mutate inside `useFrame`, not call setState, and to scale by `delta` so motion is frame-rate independent [doc: pitfalls].

### 2.5 DOM-synced 3D (champion-select logo)

```js
const v = new THREE.Vector3(), dir = new THREE.Vector3()
// Centre of a DOM rect → world point on the plane z = zPlane, for any camera orientation
export function domToWorld(rect, camera, size, out, zPlane = 0) {
  v.set(((rect.left + rect.width / 2) / size.width) * 2 - 1, -((rect.top + rect.height / 2) / size.height) * 2 + 1, 0.5).unproject(camera)
  dir.copy(v).sub(camera.position).normalize()
  return out.copy(camera.position).addScaledVector(dir, (zPlane - camera.position.z) / dir.z)
}
```

Rect caching follows HAOQI's approach [doc]:
- Keep a rect cache and, on every frame, subtract the scroll delta (`lenis.scroll - last`) from it.
- Call `getBoundingClientRect()` only on elements near the viewport, plus a staggered refresh every 12 frames.
- Never read layout for every element on every frame.

### 2.6 Render gating [proposal]

`stage.active` is true while `#home` or `#stack` intersects the viewport (`ScrollTrigger.create({ trigger, onToggle })`). Otherwise:
- Stop calling `advance`. The last frame stays on screen.
- Fade the canvas to `opacity: .35` with CSS.

The rAF loop also stops on hidden tabs, and the driver skips work while `document.hidden`. For the idle champion logo, use the equivalent of `demand` mode: set `stage.dirty = true` from a tween's `onUpdate`, and render nothing otherwise.

---

## 3. Hextech core (hero)

### 3.1 Composition [proposal]

- **Crystal size:** about 40% of viewport height (group scale ≈ 0.6). It sits above the title, as in mockup B.
- **Camera:** fov 40 at (0, 0.4, 5.2).
- **Layers, outside in:**
  1. Rune ring: nearly flat, about 14° from the floor plane, outer radius ≈ 2.2. One revolution per 125 s.
  2. Two hex rings: radius 1.45 and 1.75, tube 0.018. Tilted −0.35 and +0.5 rad off vertical. They spin +0.08 and −0.05 rad/s about their own axes.
  3. Fresnel halo.
  4. Faceted crystal.
  5. Energy sphere, radius 0.42.
  6. Particles: a 12 × 8 × 6 volume behind and around everything.
- **Colours (from the palette doc):**
  - Energy: deep `#005A82` → teal `#0AC8B9` → hot `#CDFAFA`.
  - Metal: gold `#C89B3C`.
  - Glyphs: `#C8AA6E`.
  - Background: `#010A13`.
- **HDR rules** (they make the threshold-1.0 bloom selective):
  - Above 1 (bloom): vein peaks ×2–3, halo ×2, particle cores ×2.5, glyphs ×1.2.
  - Gold metal stays mostly below 1.
- **Tuning:** the bench screenshot overexposed at `uIntensity 1.6` with veins ×3. Start at `uIntensity 1.0` with veins ×2.

### 3.2 Geometry (cheap, unmistakably "hex")

```js
// Hexagonal bipyramid: LatheGeometry with 6 radial segments, made non-indexed so facets shade flat
const pts = [[0, -1.25], [0.5, -0.45], [0.62, 0.3], [0.42, 0.85], [0, 1.3]].map(([x, y]) => new THREE.Vector2(x, y))
const crystal = new THREE.LatheGeometry(pts, 6).toNonIndexed(); crystal.computeVertexNormals()
// Hex ring: a torus with 4 radial and 6 tubular segments gives a hexagon with a diamond cross-section
<torusGeometry args={[1.45, 0.018, 4, 6]} />
```

### 3.3 Crystal material: three tiers

| Variant | Extra GPU per frame, 1080p iGPU [measured] | Use it for |
|---|---|---|
| drei `MeshTransmissionMaterial` at defaults (samples **10**, full-resolution FBO) | +11.1 ms | never |
| MTM, samples 6, resolution 512 | +8.7 ms | HIGH |
| MTM, samples 4, resolution 256 | +6.8 ms | not needed |
| MTM, samples 6, resolution 512, `backside` | +9.1 ms (backside itself is only +0.4 ms) | HIGH, if facets look flat |
| three `MeshPhysicalMaterial` with `transmission: 1, dispersion: 3` | +11.8 ms | no |
| …the same with `renderer.transmissionResolutionScale = 0.5` | +5.4 ms | no; MTM looks better per ms |
| **Fake glass:** `meshPhysicalMaterial` `transparent`, `opacity .28`, `roughness .04`, `metalness .2`, `clearcoat 1`, `envMapIntensity 2`, `depthWrite false` | **+0.3 ms** | MID and LOW |

MTM facts [src: drei 10.7.9 `core/MeshTransmissionMaterial.js`]:
- **The docs table is wrong about `samples`.** It says the default is 6 [doc]; the component defaults to **`samples = 10`**. The 6 is the material class constructor default.
- **Resolution:** `resolution` undefined means the FBO is canvas size × DPR.
- **Extra scene render:** in its own `useFrame`, the material re-renders the whole scene into that FBO every frame, twice with `backside`. It swaps the host mesh's material for a discard material and sets `NoToneMapping` during that pass. The expensive energy shader therefore runs twice.
- **Several MTM meshes:** they can share one `buffer` (a `useFBO` texture) instead of rendering the scene once each [doc].
- **Roughness:** with `roughness` > 0, a 32×32 buffer is enough [doc].

HIGH-tier MTM settings [proposal; cost measured above]:

```jsx
<MeshTransmissionMaterial samples={6} resolution={512} thickness={0.6} ior={1.45} chromaticAberration={0.06}
  anisotropicBlur={0.1} distortion={0.15} distortionScale={0.4} temporalDistortion={0.1} roughness={0.05}
  color="#CDFAFA" attenuationColor="#0AC8B9" attenuationDistance={1.2} />
```

Fake-glass upgrade (optional): Volatile Nexus weights the refracted layer by a facing term (strong face-on, mirror-like at grazing angles) so it doesn't wash out [doc]. Here the halo already does this. If the body still looks flat, add `pow(1 - N·V, 3)` to `emissive` via `onBeforeCompile` or three-custom-shader-material 6.4.0.

Analytic alternative (not built): the energy core is a procedural sphere at the origin. A custom crystal shader could `refract()` the view ray, intersect the inner sphere analytically and evaluate the energy function at the hit point. That gives real refraction of the core with no FBO and no second scene pass. Worth trying only if HIGH must get cheaper.

### 3.4 Energy shader (compiled and run on three r187) [measured]

```glsl
// --- noise (hash13 = Dave Hoskins "Hash without Sine", MIT)
float hash13(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float vnoise(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash13(i), hash13(i + vec3(1,0,0)), f.x), mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x), mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y), f.z);
}
#ifndef OCTAVES
#define OCTAVES 4
#endif
#ifndef WARP
#define WARP 1            // guard: never let `#if WARP == 3` see an undefined macro
#endif
float fbm(vec3 p) { float a = 0.5, s = 0.0; for (int i = 0; i < OCTAVES; i++) { s += a * vnoise(p); p = p * 2.02 + 17.1; a *= 0.5; } return s; }
```

```glsl
// vertex: slow wobble, plus view-space normal and view vector for the fresnel term
uniform float uTime; varying vec3 vPos; varying vec3 vN; varying vec3 vV;
void main() {
  vec3 p = position + normal * (fbm(position * 2.5 + uTime * 0.4) - 0.5) * 0.08;
  vPos = p; vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vN = normalize(normalMatrix * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv;
}
// fragment: domain-warped fbm → ridged filaments → hextech ramp; peaks above 1 feed the bloom
uniform float uTime; uniform float uIntensity; uniform vec3 uDeep; uniform vec3 uTeal; uniform vec3 uHot;
varying vec3 vPos; varying vec3 vN; varying vec3 vV;
void main() {
  vec3 p = vPos * 3.0;
  #if WARP == 3
  vec3 q = vec3(fbm(p + uTime * 0.15), fbm(p + 5.2), fbm(p - 3.7 + uTime * 0.1));
  #else
  vec3 q = vec3(fbm(p + uTime * 0.15));
  #endif
  float v = fbm(p + 2.0 * q);
  float vein = pow(1.0 - abs(2.0 * v - 1.0), 6.0);                 // 1 on filament centre
  float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
  vec3 col = mix(uDeep, uTeal, smoothstep(0.2, 0.8, v)) + uHot * vein * 2.0 + uTeal * fres * 1.5;
  gl_FragColor = vec4(col * uIntensity, 1.0);
  #include <tonemapping_fragment>   // no-op under EffectComposer (renderer tone mapping is off), AgX on LOW
  #include <colorspace_fragment>    // no-op into render targets; sRGB when drawn straight to the canvas
}
```

Mesh: `icosahedronGeometry args={[1, 24]}` at scale 0.42, `uniforms` created once in `useMemo`.

Cost of the sphere alone at 1080p [measured]:
- 5 octaves, 3 warps: **+4.3 ms**.
- 4 octaves, 1 warp: **+2.2 ms**. The warp count is the lever; 3 octaves vs 4 measured the same.
- Use `defines={{ OCTAVES, WARP }}` per tier.
- Changing defines recompiles the shader, so set them only on tier changes.

### 3.5 Fresnel halo (additive shell)

```glsl
varying vec3 vN; varying vec3 vV;   // vertex: same as above, without the displacement
uniform vec3 uColor; uniform float uPower; uniform float uIntensity;
void main() {
  float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPower);
  gl_FragColor = vec4(uColor * uIntensity, f);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
```

- Mesh: `icosahedronGeometry [1, 6]` at scale 0.62, with `side={THREE.BackSide}` (halo), `blending={THREE.AdditiveBlending}`, `transparent`, `depthWrite={false}`.
- Uniforms: `uPower 3`, `uIntensity 2`, colour teal.
- Cost: +0.6 ms at 1080p [measured].
- Variant: `FrontSide` with power 4 gives a rim on the crystal itself.

### 3.6 Gold without a network request

- **Avoid drei `<Environment preset="…">`.** Presets download HDRs from `raw.githack.com/pmndrs/drei-assets/...` at runtime [src: `core/useEnvironment.js`], a third-party CDN on the critical path.
- **Use `<Environment resolution={256}>` with `<Lightformer>` children.** The portal defaults are `frames = 1` and `resolution = 256` [src], so the environment is rendered once.
- Lights [proposal]:
  - rect key `#F0E6D2`, intensity 3, at (0, 3, 2)
  - ring rim `#0AC8B9`, intensity 4, at (−3, 0, 1)
  - rect fill `#C89B3C`, intensity 2, at (3, −1, 1)
- Rings use `meshStandardMaterial color="#C89B3C" metalness={1} roughness={0.28}`. Cost +1.1 ms [measured].

### 3.7 Optional flourishes (not benchmarked)

- **Hex containment field:** a FrontSide shell at radius 0.66 whose fragment uses a hex-grid SDF on sphere UVs. Multiply the edge mask by the fresnel term so hexagons show only at the silhouette. Cost is in the fresnel shell's range: one simple shader on the core's pixels.
- **Six-ray star streaks on highlights:** HAOQI.DESIGN's "Star 6" pass. It thresholds luminance, then streaks along a vertical axis and two axes at ±30° [doc]. Six rays fit Hextech's six-fold theme. It costs a custom effect pass; HIGH only.
- **ACCEPT shockwave:** an in-scene additive ring mesh with a `uRadius` uniform tweened 0 → 6 over 0.8 s. Don't toggle the postprocessing `ShockWave` effect at runtime: adding or removing effects rebuilds the `EffectPass` (a shader recompile hitch), and UV effects can't merge with convolution effects such as ChromaticAberration [src: `buildPasses` mergeMode rules].

---

## 4. Particles and runes

### 4.1 Ambient particles: stateless, no CPU work per frame (compiled and run)

```glsl
// vertex: slow rise with wrap, plus displacement by an analytic, divergence-free trig curl field
uniform float uTime; uniform float uPixelRatio; uniform float uSize; uniform vec3 uBox;
attribute float aSeed; varying float vAlpha;
vec3 curlTrig(vec3 p, float t) {   // curl of ψ=(sin(z+a.x)cos y, sin(x+a.y)cos z, sin(y+a.z)cos x)
  vec3 a = vec3(1.3, 2.1, 0.7) * t;
  return vec3(cos(p.y + a.z) * cos(p.x) + sin(p.x + a.y) * sin(p.z),
              cos(p.z + a.x) * cos(p.y) + sin(p.y + a.z) * sin(p.x),
              cos(p.x + a.y) * cos(p.z) + sin(p.z + a.x) * sin(p.y));
}
void main() {
  vec3 p = position; float h = uBox.y;
  p.y = mod(p.y + uTime * (0.05 + 0.1 * aSeed) + h * 0.5, h) - h * 0.5;
  vec3 q = p * 0.6;
  p += 0.35 * curlTrig(q, uTime * 0.12) + 0.15 * curlTrig(q * 2.1 + 4.0, uTime * 0.2);
  vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.4 + aSeed) * uPixelRatio / -mv.z;
  vAlpha = (1.0 - smoothstep(0.35, 0.5, abs(p.y / h))) * (0.5 + 0.5 * sin(uTime * (1.0 + 2.0 * aSeed) + aSeed * 40.0));
}
// fragment: soft sprite, no texture
uniform vec3 uColor; uniform float uIntensity; varying float vAlpha;
void main() {
  float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5)); a *= a;
  gl_FragColor = vec4(uColor * uIntensity, a * vAlpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
```

- Material: `<points frustumCulled={false}>` with `transparent`, `depthWrite={false}`, `blending={THREE.AdditiveBlending}`.
- Uniforms: `uSize` 35–45, `uIntensity` 2.5, `uPixelRatio` set to the current DPR.
- Seeds: positions uniform in a 12 × 8 × 6 box; `aSeed = Math.random()`.
- **Cost:** 3,000 points add +0.5 ms at 1080p [measured]. Overdraw from large sprites is the real cost; keep sprites under about 40 px.
- **Tier counts [proposal]:** 3,000 / 2,000 / 900.
- **Honest limit:** this displaces points by a moving curl field; it is not true advection. If particles must flow, swirl around the core or react to the cursor with memory, use GPGPU. The Codrops "Dreamy Particles" tutorial uses `GPUComputationRenderer` with position and velocity textures [doc]. It adds two render-to-texture passes of N texels each frame.
- **Zero-code alternative:** drei `<Sparkles>`. Its shader is sine wobble with `gl_PointSize = size * 25 * pixelRatio / -z` [src]: less organic, and no wrap fade.

### 4.2 Rune ring: one draw call, procedural "runic" strokes (compiled and run)

```glsl
// h21: common 2D hash (The Art of Code); seg: segment distance (iq, distfunctions2d)
uniform float uTime; uniform float uProgress; uniform float uCells; uniform vec2 uBand; uniform vec3 uColor; uniform float uIntensity;
varying vec2 vUv;
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float seg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }
void main() {
  vec2 p = vUv * 2.0 - 1.0; float r = length(p);
  float ang = fract(atan(p.y, p.x) / 6.2831853 + 0.5 + uTime * 0.008);
  float rr = (r - uBand.x) / (uBand.y - uBand.x);
  float cell = floor(ang * uCells);
  vec2 lp = vec2(fract(ang * uCells), rr);
  lp.x = (lp.x - 0.5) * (6.2831853 * r / uCells) / (uBand.y - uBand.x) + 0.5;   // undo the polar stretch
  float k = h21(vec2(cell, 7.0));
  float d = seg(lp, vec2(0.5, 0.15), vec2(0.5, 0.85));                                  // stem, always
  if (fract(k * 3.1) > 0.4) d = min(d, seg(lp, vec2(0.5, 0.85), vec2(0.78, 0.6)));       // branch
  if (fract(k * 7.7) > 0.5) d = min(d, seg(lp, vec2(0.5, 0.5), vec2(0.22, 0.28)));       // diagonal
  if (fract(k * 13.3) > 0.6) d = min(d, seg(lp, vec2(0.3, 0.62), vec2(0.7, 0.62)));      // bar
  if (fract(k * 21.7) > 0.7) d = min(d, abs(length(lp - vec2(0.5, 0.32)) - 0.12));       // ring
  float aa = fwidth(d), glyph = 1.0 - smoothstep(0.055 - aa, 0.055 + aa, d);
  glyph *= step(0.0, rr) * step(rr, 1.0) * step(mod(cell, 9.0), 7.5);                  // gap every 9th cell
  float lw = fwidth(r) * 1.2;
  float lines = (1.0 - smoothstep(0.0, lw, abs(r - uBand.x + 0.012))) + (1.0 - smoothstep(0.0, lw, abs(r - uBand.y - 0.012)));
  float a = clamp(glyph * step(cell / uCells, uProgress) + lines * smoothstep(0.0, 0.2, uProgress), 0.0, 1.0);
  gl_FragColor = vec4(uColor * uIntensity, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
```

- Uniforms: `uCells 48`, `uBand (0.8, 0.9)`, `uColor #C8AA6E`, `uIntensity 1.2`. GSAP tweens `uProgress` 0 → 1 for a write-on reveal.
- Blending: additive, `DoubleSide`, `depthWrite false`.
- **Cost:** on a 2.4-scale quad it adds +1.7 ms at 1080p [measured]. Most of those pixels are empty.
- **Fix:** draw it on `RingGeometry(0.78, 0.92, 192, 1)` instead of the quad. The band is about **21.6%** of the quad's area (π(0.94² − 0.78²)/4, computed, not measured). Map `vUv` the same way: RingGeometry UVs are planar over the outer square.
- **Real runes instead:** drei `<Text>` (troika SDF) with **Noto Sans Runic** (Google Fonts, OFL), Unicode U+16A0–U+16F8. It costs a TTF fetch plus SDF generation in a worker; prefer the procedural ring.

---

## 5. Post-processing

### 5.1 Facts that change how you write it [src]

- **EffectComposer defaults (wrapper 3.2.2):**
  - `multisampling = 4`; v2.19.1 defaulted to 8.
  - `frameBufferType = HalfFloatType`.
  - `renderPriority = 1`, so it takes over rendering.
  - `mergeMode = "auto"`.
- **Tone mapping:** while mounted it sets **`gl.toneMapping = NoToneMapping`**; v2 does the same. Put `<ToneMapping mode={ToneMappingMode.AGX} />` (or `NEUTRAL`) last.
- **Merging:** effects merge into one `EffectPass`. `mergeMode: auto` splits passes when a CONVOLUTION effect meets another convolution effect or a UV-transform effect. `ChromaticAberrationEffect` has the CONVOLUTION attribute; ShockWave, LensDistortion, Glitch and Pixelation are UV effects.
- **Bloom defaults:**
  - The core `BloomEffect` in postprocessing 6.39.6 defaults to `luminanceThreshold 1`, `luminanceSmoothing 0.03`, `mipmapBlur true`, `intensity 1`, `radius 0.85`, `levels 8`, blend SCREEN.
  - The r3f wrapper overrides the blend to ADD.
  - The react-postprocessing docs list threshold 0.9 and smoothing 0.025 [doc]. The docs lag the code, so always pass values explicitly.
- **Wrapper defaults for Noise:** the wrapper's `Noise` defaults to blend `COLOR_DODGE`.
- **Selective bloom [doc]:** threshold 1 means nothing glows out of the box. Push the chosen materials above 1. Built-in materials need `toneMapped={false}`.
- **Renderer flags [doc: postprocessing README]:** `powerPreference: "high-performance"`, `antialias: false`, `stencil: false`, `depth: false`. Keep `depth` on here (§2.2).

### 5.2 Stacks [proposal]

```jsx
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

export function Post({ kind }) {           // 'full' (HIGH) | 'lite' (MID)
  const full = kind === 'full'
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={1.1} radius={0.75} levels={full ? 7 : 5} />
      {full ? <ChromaticAberration offset={[0.0006, 0.0006]} radialModulation modulationOffset={0.3} /> : <></>}
      <Vignette offset={0.3} darkness={0.65} />
      {full ? <Noise premultiply opacity={0.3} /> : <></>}
      <ToneMapping mode={ToneMappingMode.AGX} />
    </EffectComposer>
  )
}
```

- **Fragments:** the `<></>` placeholders are what the bench used; that pattern is verified working.
- **Half-float support:** if the device lacks `EXT_color_buffer_half_float` and `EXT_color_buffer_float` (check `gl.extensions.has(...)`), pass `frameBufferType={THREE.UnsignedByteType}` and use `luminanceThreshold 0.8`. 8-bit buffers clamp at 1, so bloom becomes brightness-based rather than truly selective.

### 5.3 Measured costs (Intel iGPU, 1920×1080, scene costs 9.0 ms without post)

| Change | Δ GPU ms |
|---|---|
| EffectComposer + ToneMapping only (scene → half-float RT, one fullscreen pass) | **+4.6** |
| + Bloom mipmap, 7 levels | +6.2 (4 levels: the same; the full-resolution passes dominate) |
| ChromaticAberration + Vignette + Noise (no bloom) | +3.0 |
| Everything (Bloom 7, CA, Vignette, Noise, AgX), half-float | 22.65 ms total |
| …with 8-bit buffers | **−5.1** |
| …with `multisampling={4}` | **+9.7** |

On integrated GPUs, post-processing is bandwidth-bound per pixel, so pixel count is the lever (§7). Gold-ring aliasing without MSAA: keep the tube at 0.018 or more, let bloom soften the edges, and allow MSAA 4 only on HIGH.

---

## 6. GSAP × r3f

### 6.1 Rules

- **Animate refs and uniforms, not React state.** GSAP tweens any object's numeric properties: `gsap.to(mat.uniforms.uProgress, { value: 1 })`, `gsap.to(stage, { camZ: 7 })`. React re-renders are for things that change once in a while: tier, phase, selected champion.
- **Use `useGSAP` for every timeline, inside the Canvas too:**
  - It reverts its context on unmount [doc], which survives fiber 9's inherited StrictMode double-invocation.
  - Wrap handlers created later (pointer events, clicks) in `contextSafe` [doc].
  - `scope` only matters for selector strings, which are irrelevant inside the Canvas.
- **Let GSAP set targets and damping smooth them.** GSAP writes targets into `stage`, and `useFrame` damps toward them with smoothTime 0.15–0.3 s. GSAP owns choreography and timing; maath owns feel. The two don't fight, because GSAP never touches the Object3D directly.
- **`frameloop="demand"` elsewhere:** if another canvas uses `demand`, add `onUpdate: () => invalidate()` to its tweens.

### 6.2 Scroll choreography [proposal]

```jsx
useGSAP(() => {
  const mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.timeline({ scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true } })
      .to(stage, { camZ: 7.2, coreX: 2.1, coreY: 0.6, coreScale: 0.55, glow: 0.7, ease: 'none' })
    const live = new Set()                       // sections whose 3D is on screen
    for (const id of ['#home', '#stack', '#contact']) ScrollTrigger.create({ trigger: id, start: 'top bottom', end: 'bottom top',
      onToggle: (self) => { self.isActive ? live.add(id) : live.delete(id); stage.active = live.size > 0 } })
  })
})   // auto-reverted on unmount
```

| Section | Camera z | Core | Glow | Rendering |
|---|---|---|---|---|
| Hero | 5.2 → 7.2 | (0, 0.35) → (2.1, 0.6), scale 1 → 0.55 | 1 → 0.7 | every tick |
| Projects | 7.2 | parked top right | 0.6 | paused, canvas `opacity .35` |
| Stack (champion select) | 6.0 | logo pedestal synced to the DOM splash box | — | every tick while visible |
| Contact | 7.2 | (0, 0.4), scale 0.7 | 0.8; flash on submit | every tick while visible |

ScrollTrigger notes [doc]:
- `invalidateOnRefresh: true` on tweens whose start values depend on layout.
- `fastScrollEnd` and `preventOverlaps` for section-entry animations.
- Never animate the pinned element itself.
- Avoid `content-visibility: auto` on triggers; it breaks start/end measurement.

### 6.3 "Match found" intro and loading gate [proposal]

The loader the owner asked for ("waiting for other players to accept") maps onto real milestones:

| "Player" | Accepts when |
|---|---|
| 1 | DOM is interactive |
| 2 | `document.fonts.ready` resolves |
| 3 | the Stage chunk import resolves |
| 4 | `gl.compileAsync()` resolves |
| 5 | the first `advance()` after compile has run |

- Cap the wait at **1500 ms**, then accept anyway; the canvas fades in later over 600 ms.
- Skip the loader on repeat visits with a `sessionStorage` flag.
- On ACCEPT:

```js
export function playIntro(u) {   // u = { energy, rune, particles } uniform objects
  return gsap.timeline({ defaults: { ease: 'power2.out' } })
    .fromTo(stage, { camZ: 8.5 }, { camZ: 5.2, duration: 1.6, ease: 'power3.inOut' }, 0)
    .fromTo(u.rune.uProgress, { value: 0 }, { value: 1, duration: 1.4 }, 0.2)
    .fromTo(u.particles.uIntensity, { value: 0 }, { value: 2.5, duration: 1.2 }, 0.6)
    .fromTo(u.energy.uIntensity, { value: 0 }, { value: 2.6, duration: 0.35, ease: 'expo.out' }, 0.9)   // the "accept" flash
    .to(u.energy.uIntensity, { value: 1.0, duration: 0.9 }, 1.25)
}
```

---

## 7. Performance budget and fallbacks

### 7.1 Measured GPU time (Intel iGPU, method in §8)

| Configuration | 1920×1080 | 1440×810 | 1280×720 |
|---|---|---|---|
| Empty (clear plus about 2 ms of measurement readback) | 2.14 | 1.82 | — |
| Scene, no transmission, no post, 3,000 particles | 9.00 | — | — |
| **FULL / HIGH:** MTM s6/512 + Bloom 7 + CA + Vignette + Noise + AgX, 3,000 particles, core 4 oct/1 warp | 22.95 | 18.33 | 14.55 |
| **MID:** fake glass + Bloom 5 + Vignette + AgX, 2,000 particles | 19.34 | **12.47** (11.44 with 8-bit buffers) | 10.44 |
| **LOW:** no composer, fake glass, 1,200 particles, 3 octaves | — | **4.99** | — |

Per-item deltas at 1080p:

| Item | Δ ms |
|---|---|
| Energy sphere, 5 octaves / 3 warps | +4.3 |
| Energy sphere, 4 octaves / 1 warp | +2.2 |
| Rune quad | +1.7 |
| Gold rings | +1.1 |
| Fresnel halo | +0.6 |
| 3,000 particles | +0.5 |

### 7.2 Tier policy [proposal, anchored on §7.1]

- **Frame budget:** 60 fps leaves 16.7 ms per frame. Target **8 ms or less of GPU on the default tier**, so DOM compositing (gradient borders, CSS glows) has headroom.
- **Budget pixels, not DPR:** `dpr = min(devicePixelRatio, sqrt(maxPx / (w·h)))`. A 1920×1080 viewport on MID gets dpr 0.76. An iPhone at 393×852 with DPR 3 (3.0 MP) on LOW gets dpr 1.34, about 5× fewer pixels. Bloom and glow survive upscaling well; thin glyph lines are the first casualty, so keep their stroke width at 0.055 cells or more.
- **Start tier:** MID on desktop, LOW on phones (`(pointer: coarse) and (max-width: 820px)`).
- **`PerformanceMonitor` [doc] behaviour:**
  - It averages frame rate over 10 windows of 250 ms. The default `bounds` are 50–60 fps (50–90 above 90 Hz), with threshold 0.75.
  - It declines when frame rate stays below 50 and inclines when it holds the upper bound.
  - Set `flipflops={3}`; `onFallback` then pins LOW.
- **HIGH only for known-strong GPUs:**

```js
// shortcut: renderer-string regex, not detect-gpu (detect-gpu fetches benchmark data from unpkg by default);
// upgrade to detect-gpu with self-hosted benchmarks if tiers come out wrong
export const allowHigh = (gl) => {
  const c = gl.getContext(), ext = c.getExtension('WEBGL_debug_renderer_info')
  return /nvidia|geforce|rtx|radeon rx|radeon pro|apple m\d/i.test(ext ? c.getParameter(ext.UNMASKED_RENDERER_WEBGL) : '')
}
```

detect-gpu details [src]:
- `benchmarksURL` defaults to `https://unpkg.com/detect-gpu@5.0.70/dist/benchmarks`.
- One JSON file is fetched per device: for example `d-intel.json` is 4.4 kB gzipped and `d-nvidia.json` 11.3 kB gzipped; the whole folder is 713 kB on disk.
- Tiers are `[0, 15, 30, 60]` fps.
- On Firefox it skips the debug-renderer extension.
- Safari reports "Apple GPU" (masked), so the regex above leaves Macs on MID. UNVERIFIED for Intel Macs.

### 7.3 Decide before downloading the 3D chunk

```js
export function useAllow3D() {
  return useMemo(() => {
    if (navigator.connection?.saveData) return false
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2', { failIfMajorPerformanceCaveat: true })   // null on software or blocklisted GPUs
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()                       // free the probe context
    return true
  }, [])
}
```

### 7.4 Reduced motion, low power, failures

- **`prefers-reduced-motion: reduce`:**
  - Mount the Stage and keep `stage.active = false`. After `compileAsync`, set `stage.dirty = true` once so the driver renders a single frame. That gives a still frame: no drift, no scroll camera, no parallax, no intro timeline.
  - Lenis turns its own smoothing off (`respectReducedMotion` defaults to true; `lerp` is forced to 1 [doc]).
  - Put all choreography inside `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`.
- **Save-Data, no WebGL2, or a software rasterizer:** CSS poster only. The 3D chunk is never requested.
- **Context loss:** listen for `webglcontextlost` on `gl.domElement`, fade the poster back in, and keep the DOM fully usable. WebGLRenderer handles restoration itself.
- **Canvas:** decorative, so `aria-hidden="true"`. It can't be the LCP element: LCP candidates are img, svg image, video, `url()` backgrounds and text blocks [doc: web.dev]. CSS gradients are excluded too, so the hero title stays the LCP element.

### 7.5 Mobile specifics

- **Fill rate.** Phones report DPR 3 (Maxime Heckel caps at 2 for this reason [doc]). The LOW budget of 0.6 MP is stricter.
- **One context.** See the context caps in §2.1.
- **Half-float render targets.** Check at runtime (§5.2). iOS support is UNVERIFIED.
- **Battery and heat.** Pause outside hero and stack (§2.6). Whether iOS Low Power Mode caps requestAnimationFrame at 30 fps is UNVERIFIED; `PerformanceMonitor` would read that as a decline and drop to LOW, which is fine.

### 7.6 Bundle (measured: esbuild 0.28.2, ESM, minified, `gzip -9`; kB = 1000 B)

| Bundle | React 19.3 + fiber 9.8.2 + drei 10.7.9 + wrapper 3.2.2 | React 18.3 + fiber 8.18 + drei 9.122 + wrapper 2.19.1 |
|---|---|---|
| react + react-dom | 69.0 | 45.8 |
| three alone, tree-shaken (vanilla scene) | 134.1 | 134.1 |
| `<Canvas>` + one mesh, including react-dom | 317.2 | 279.0 |
| + drei (MTM, Environment, Lightformer, Sparkles, PerformanceMonitor, AdaptiveDpr, Float) | 343.9 | 305.0 |
| + post (Bloom, CA, Noise, Vignette) = **full hero stack** | **370.5** | 322.3 |
| ⇒ lazy 3D chunk (full stack minus react/react-dom) | **≈301** | ≈277 |
| gsap + ScrollTrigger / + @gsap/react | 45.3 / 49.0 | — |
| lenis | 5.6 | — |
| fiber 9 `createRoot` + selective `extend({...})` (no `<Canvas>`, no react-dom) | 192.3 | — |
| **Current app today** (`src/main.jsx`, all eager) | **384.2** (1,341 kB raw) | |

Where the bytes go in the full React 19 stack (raw minified, from the metafile):
- three 733 kB. The tree-shaken vanilla scene is 527 kB; fiber's `extend(THREE)` inside `<Canvas>` pulls in the whole namespace.
- react-dom 205 kB.
- fiber 169 kB (it bundles its own reconciler).
- postprocessing 69 kB.
- drei 27 kB.
- three-stdlib 26 kB.
- **n8ao 22 kB**, bundled by the postprocessing wrapper even though N8AO isn't used.
- **gainmap-js 18 kB**, bundled via drei Environment.

The current app's eager bundle includes three 671 kB, framer-motion 109 kB, swiper 86 kB and howler 35 kB.

Loading strategy:
- **Splitting:** `lazy(() => import('./stage/Stage.jsx'))` is all the splitting needed. Vite 8 (Rolldown) or Vite 6 both split on dynamic import; no `manualChunks` tuning.
- **When to start:** after first paint, inside `requestIdleCallback` with a 300 ms fallback, or immediately when the "match found" loader is showing.
- **Selective `extend`:** it saves about 56 kB gzipped but loses `<Canvas>` conveniences (resize observer, event-source wiring, the context bridge from react-dom). Not worth it; fiber 10 removes the three import from the core [doc].

---

## 8. Method (so the numbers can be reproduced)

- **Device:** `ANGLE (Intel, Intel(R) UHD Graphics (0x00009B41) Direct3D11 vs_5_0 ps_5_0, D3D11)`. That is a 2020-class laptop iGPU; the exact model mapping is UNVERIFIED. Browser: the Chromium-based pane in Claude desktop.
- **Harness:**
  - fiber 9.8.2 root with `frameloop: 'never'`, DPR 1, explicit canvas size.
  - Each frame: `advance()` followed by a 1-pixel `readPixels` to serialize.
  - 30 warm-up frames, then 120 measured frames inside one `EXT_disjoint_timer_query_webgl2` `TIME_ELAPSED` query, divided by 120.
- **Scene:**
  - Camera fov 40 at (0, 0.4, 5.2).
  - Energy sphere (`icosahedron [1, 24]` at scale 0.42), fresnel halo (scale 0.62), crystal (Lathe, 6 segments).
  - Two hex rings with a Lightformer environment, rune quad at scale 2.4, and N particles at `uSize 60`.
- **Limits:**
  - One machine; discrete GPUs, Apple Silicon and phones were not measured.
  - Absolute values include about 2 ms of readback overhead; the deltas are the signal.
  - Shader time was fed in milliseconds (wrong animation speed), which doesn't change cost.
- **Scratch files** (not in the repo):
  - Bench: `C:/Users/abdel/AppData/Local/Temp/claude/8d57b08e2422bb31/1bd66213-b433-46ef-8926-dbe5a9999d6c/scratchpad/entries/bench.jsx`
  - Shaders: `C:/Users/abdel/AppData/Local/Temp/claude/8d57b08e2422bb31/1bd66213-b433-46ef-8926-dbe5a9999d6c/scratchpad/entries/hextech-shaders.js`
  - Logo test: `C:/Users/abdel/AppData/Local/Temp/claude/8d57b08e2422bb31/1bd66213-b433-46ef-8926-dbe5a9999d6c/scratchpad/entries/logo-test.js`

---

## 9. Champion select: shape-accurate 3D framework logos

**Why not the current icons:**
- Today `IconScene` maps a texture onto a 1 × 1 × 0.1 box: a flat slab.
- `public/icons/*.svg` come from SVG Repo with mixed viewBoxes. `flutter.svg` has no `<path>` and three gradients, and `SVGLoader` ignores gradients.
- Simple Icons normalizes every brand to **one path in a 24 × 24 viewBox** with a brand `hex` colour. Import with `import { siReact } from 'simple-icons'` (tree-shakable ESM) [doc].
- Slugs I checked exist in 16.37.0: `react angular springboot spring flutter qt javascript typescript openjdk c cplusplus kotlin minio nestjs nextdotjs nodedotjs postgresql python redis supabase dart`.
- **There is no `java`; use `openjdk`.**

```js
import * as THREE from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'

export function logoGeometry(path, { depth = 2.4, bevel = 0.45, curveSegments = 12 } = {}) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}"/></svg>`
  const shapes = new SVGLoader().parse(svg).paths.flatMap((p) => SVGLoader.createShapes(p))
  const g = new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.6, bevelSegments: 3, curveSegments })
  g.rotateX(Math.PI)   // SVG is y-down; a rotation flips Y without inverting the winding (a -1 scale would)
  g.center()
  g.scale(1 / 24, 1 / 24, 1 / 24)
  g.computeVertexNormals()
  return g
}
```

[measured] I ran this function on the real Simple Icons SVGs, with a gold PBR material and RoomEnvironment. All six logos were recognizable, with correct holes and bevels; the depth is 0.14 units.

| Logo | Triangles | Main-thread build |
|---|---|---|
| React | 18,682 | 126 ms |
| TypeScript | 11,364 | 55 ms |
| Node | 7,592 | 48 ms |
| Spring Boot | 4,948 | 21 ms |
| Angular | 208 | 4.5 ms |
| Flutter | 184 | 2.5 ms |

Implications [proposal]:
- Build each geometry on first hover or selection, or in idle chunks after the hero is ready, and cache them in a `Map`. Use `curveSegments: 6` for React and TypeScript.
- The 20-tile champion grid stays DOM: inline SVG from the same `path`, with `fill="currentColor"`. Only the selected champion is 3D, two draw calls: the logo plus a fresnel halo in the brand `hex`.
- **Material:** gold `#C8AA6E`, metalness 1, roughness 0.3. The halo uses the brand colour at intensity 1.5, the "champion aura". Shape carries the identity while the palette stays Hextech.
- **React as a true 3D atom:** three `TorusGeometry(1, 0.055, 12, 128)` scaled (1, 0.36, 1) and rotated 0°, 60° and 120° about Z, plus a 0.18 sphere. About 10k triangles, and it reads better in motion than an extrusion.
- **LOCK IN timeline:**
  - scale 0.6 → 1 (0.5 s, `back.out(1.7)`)
  - `rotation.y += 2π` (1.2 s, `expo.out`)
  - halo 0 → 3 (0.15 s) → 1.5 (0.6 s)
  - particle intensity spike
- **Trademarks:** brand logos remain trademarks. Using them to name a tech you use is the usual practice; read Simple Icons' DISCLAIMER.md. UNVERIFIED legally.

---

## 10. Reference work: what to take from each

- **Bruno Simon, folio 2025** (Awwwards case study) [doc]:
  - Instancing everywhere.
  - Merged geometry coloured through a palette texture (UV into a colour strip instead of vertex colours).
  - DRACO quantization.
  - The mobile preset turns off water blur and depth of field and shrinks the shadow maps.
  - Written in TSL, so it runs on WebGPU when available.
  - Lesson: decide the mobile preset per effect up front.
- **HAOQI.DESIGN** (Codrops case study, 2026-08-15) [doc]:
  - Fixed canvas with DOM layout.
  - Lenis driven from r3f `addEffect`.
  - ScrollBus and PointerBus singletons.
  - Rect cache with scroll-delta correction and a staggered refresh every 12 frames.
  - FBO glass after Maxime Heckel.
  - One InstancedMesh with a sticker atlas.
  - Six-ray "Star 6" streak pass.
  - The author's regret: set mobile budgets and shutoff conditions earlier.
- **Igloo Inc by abeto**, Awwwards Site of the Year 2024 [doc]: immersive 3D with simple scroll navigation. Its case study mentions a custom volume-data exporter and a fluid simulation (not opened).
- **Maxime Heckel, "Refraction, dispersion, and other shader light effects"** [doc]:
  - Per-channel IOR sampling loop; the loop count is the main cost.
  - Fresnel term.
  - Backside done with two FBOs.
  - Caps dpr at 2.
  - Also from him: "Shining a light on Caustics" and "The Study of Shaders with R3F".
- **Codrops tutorials** [doc]:
  - **Procedural vortex inside a glass sphere** (TSL, 2025-03-10): fbm-warped swirl on a 512×512 particle plane. Glass via `MeshPhysicalNodeMaterial` with ior 1.5, thickness 0.3, dispersion 5, clearcoat 0.73. The author's own optimizations: fewer and smaller particles, a noise texture instead of fbm, pre-rendering the vortex.
  - **Warping 3D text inside a glass torus** (2025-03-13): MTM explained prop by prop. Resolution 128–256 gives a pixelated look; `roughness` 1 makes the material vanish.
  - **Dreamy particles with GPGPU** (2024-12-19).
  - **Volatile Nexus** (2026-08-31): glass with caustics; refraction weighted by a facing term.
  - **Infinite liquid glass grid** (WebGPU/TSL, 2026-09-08): for the later WebGPU path (not opened).
- **three.js Journey** chapters to revisit [doc]:
  - Main course: Particles, Galaxy Generator, Shader Patterns, Hologram (fresnel), Fireworks (additive sprites), GPGPU Flow Field Particles, Wobbly Sphere, Post-processing, Performance tips, Mixing HTML and WebGL.
  - WebGPU & TSL course: Shield, Magic Explosions.
- **Awwwards 2025:** "Site of the Year 2025" badges appear on listings for Messenger (abeto), Lando Norris (OFF+BRAND) and Women At Work (Trione). The official winners page is client-rendered and I could not read it. UNVERIFIED which one won overall.

---

## 11. Unverified / open

- **GPU numbers:** from one Intel iGPU, through ANGLE on D3D11, in an embedded Chromium. Discrete GPUs, Apple Silicon, Safari, Firefox and phones were not measured.
- **drei `<View>` plus EffectComposer:** that they don't combine is inferred from postprocessing lacking scissor support (discussion #513) and from View's scissor rendering. No official statement.
- **fiber 9.8.1 `<Activity>`:** the release notes don't say whether a hidden Activity pauses `useFrame`. Gate rendering explicitly.
- **Mobile limits:** WebGL context caps on mobile Chrome and Safari, iOS half-float colour buffers and the iOS Low Power Mode frame-rate cap are all unconfirmed.
- **GSAP 4.0.0-beta.3** is on npm with no announcement; contents unknown.
- **React 18 stack on three 0.187:** it only bundled; I did not run it (drei 9.122 is frozen at February 2025).
- **Rune ring saving:** the 21.6% figure for `RingGeometry` is computed, not measured.
- **Device model:** mapping 0x9B41 to an exact Intel part is not verified.

---

## Sources

npm metadata (versions, dates, peers): `npm view <pkg> version dist-tags time peerDependencies` on 2026-11-09 for every package in §1. I read the source of three 0.187.0, @react-three/fiber 9.8.2, @react-three/drei 10.7.9, @react-three/postprocessing 3.2.2 and 2.19.1, postprocessing 6.39.6, gsap 3.15.1, maath 0.10.8 and detect-gpu 5.0.70, installed with `--ignore-scripts` in the scratch folder.

- drei MeshTransmissionMaterial: https://drei.docs.pmnd.rs/shaders/mesh-transmission-material
- drei View: https://drei.docs.pmnd.rs/portals/view
- drei PerformanceMonitor: https://drei.docs.pmnd.rs/performances/performance-monitor
- R3F scaling performance: https://r3f.docs.pmnd.rs/advanced/scaling-performance
- R3F pitfalls: https://r3f.docs.pmnd.rs/advanced/pitfalls
- R3F v9 migration guide: https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide
- R3F releases (9.6–9.8.2, 10 alphas): https://github.com/pmndrs/react-three-fiber/releases and https://github.com/pmndrs/react-three-fiber/releases/tag/v9.8.1
- react-postprocessing Bloom: https://react-postprocessing.docs.pmnd.rs/effects/bloom
- pmndrs/postprocessing README: https://github.com/pmndrs/postprocessing
- postprocessing viewport/scissor discussion: https://www.github.com/pmndrs/postprocessing/discussions/513
- GSAP React guide: https://gsap.com/resources/React/
- ScrollTrigger docs: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- gsap.updateRoot: https://gsap.com/docs/v3/GSAP/gsap.updateRoot()
- GSAP blog (3.13 made GSAP free, 3.14, 3.15): https://gsap.com/blog/ and https://gsap.com/blog/3-13/
- Lenis README: https://github.com/darkroomengineering/lenis
- three.js in 2026 (WebGPU browser matrix, r183 RenderPipeline rename): https://www.utsubo.com/blog/threejs-2026-what-changed
- LCP element types: https://web.dev/articles/lcp
- WebGL context limits:
  - https://bugzilla.mozilla.org/show_bug.cgi?id=790138
  - https://reviewboard.mozilla.org/r/204206/diff (Mozilla bug 1421481)
  - https://community.plotly.com/t/too-many-active-webgl-contexts/16379
- HAOQI.DESIGN case study: https://tympanus.net/codrops/?p=118395
- Procedural vortex in a glass sphere: https://tympanus.net/codrops/2025/03/10/rendering-a-procedural-vortex-inside-a-glass-sphere-with-three-js-and-tsl/
- Glass torus / MTM: https://tympanus.net/codrops/2025/03/13/warping-3d-text-inside-a-glass-torus/
- Dreamy particles (GPGPU): https://tympanus.net/codrops/2024/12/19/crafting-a-dreamy-particle-effect-with-three-js-and-gpgpu/
- Volatile Nexus: https://tympanus.net/codrops/2026/08/31/volatile-nexus-tinkering-with-glass-caustics-cubes-and-sound-in-three-js/
- Infinite liquid glass grid: https://tympanus.net/codrops/2026/09/08/building-an-infinite-liquid-glass-grid-with-three-js-webgpu-and-tsl/
- Maxime Heckel:
  - https://blog.maximeheckel.com/posts/refraction-dispersion-and-other-shader-light-effects/
  - https://blog.maximeheckel.com/posts/caustics-in-webgl
  - https://blog.maximeheckel.com/posts/the-study-of-shaders-with-react-three-fiber/
- Bruno Simon case study: https://www.awwwards.com/brunos-portfolio-case-study.html
- Awwwards 2024 Site of the Year (Igloo Inc): https://www.awwwards.com/annual-awards-2024/site-of-the-year and https://awwwards.com/igloo-inc-case-study.html
- three.js Journey curriculum: https://threejs-journey.com/
- Simple Icons (CC0; icons checked at 16.37.0): https://cdn.jsdelivr.net/npm/simple-icons@16.37.0/README.md and https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md
- Noto Sans Runic: https://fonts.google.com/noto/specimen/Noto+Sans+Runic
- Hash without Sine (hash13): https://www.shadertoy.com/view/4djSRW
- 2D distance functions (segment SDF): https://iquilezles.org/articles/distfunctions2d/

import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  EdgesGeometry,
  FrontSide,
  IcosahedronGeometry,
  LatheGeometry,
  LineBasicMaterial,
  Matrix4,
  MeshBasicMaterial,
  OctahedronGeometry,
  PlaneGeometry,
  RingGeometry,
  ShaderMaterial,
  TorusGeometry,
  Vector2,
  Vector3,
  type Material,
  type Side,
} from 'three'
import type { TierSpec } from '../../lib/tiers'
import * as glsl from './shaders'

/** Our palette (tokens.css), read once so the core and the page never drift apart. */
function palette() {
  const css = getComputedStyle(document.documentElement)
  const c = (name: string) => new Color(css.getPropertyValue(`--color-${name}`).trim() || '#ffffff')
  return { deep: c('teal-700'), teal: c('teal-300'), hot: c('teal-100'), gold: c('gold-300'), glyph: c('gold-200'), haze: c('teal-500') }
}
const hdr = (c: Color, k: number) => c.clone().multiplyScalar(k)

/** Light levels by render path. The composer values start from gap-results gap:1 (MID) and were re-tuned for our
 *  shaders by eye against the home mockup; without the composer everything is tone mapped per material, so the
 *  energy runs hotter, the halo widens (power < 1 stands in for bloom) and the glass thickens. */
export const LOOK = {
  post: { energy: 1.05, vein: 2.6, halo: 3.2, haloPower: 3, glass: 0.3, motes: 2, rune: 1.2, flare: 0.5 },
  direct: { energy: 1.15, vein: 2.4, halo: 2.4, haloPower: 0.8, glass: 0.4, motes: 3, rune: 1.2, flare: 0.65 },
}

const MOTES = 3000 // the HIGH count; lower tiers draw a prefix
const BOX = new Vector3(14, 9, 7)

/** Small seeded generator so the motes land in the same places on every load (stable screenshots). */
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function motesGeometry() {
  const rnd = random(7)
  const pos = new Float32Array(MOTES * 3)
  const seed = new Float32Array(MOTES)
  const kind = new Float32Array(MOTES)
  for (let i = 0; i < MOTES; i++) {
    pos.set([(rnd() - 0.5) * BOX.x, (rnd() - 0.5) * BOX.y, (rnd() - 0.5) * BOX.z], i * 3)
    seed[i] = rnd()
    kind[i] = rnd() < 0.62 ? 1 : 0 // 1 = teal, 0 = gold
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(pos, 3))
  g.setAttribute('aSeed', new BufferAttribute(seed, 1))
  g.setAttribute('aKind', new BufferAttribute(kind, 1))
  return g
}

/** Teal crystal nodes on the six corners of a hex ring. */
export function nodeMatrices(r: number) {
  const m = new Matrix4()
  return Array.from({ length: 6 }, (_, i) => m.makeTranslation(Math.cos((i / 6) * Math.PI * 2) * r, Math.sin((i / 6) * Math.PI * 2) * r, 0).clone())
}

/** Every geometry and material of the hero core, built once per stage. */
export function buildCore() {
  const p = palette()
  const additive = { transparent: true, depthWrite: false, blending: AdditiveBlending }

  // Hexagonal bipyramid: a 6-segment lathe, non-indexed so each facet shades flat.
  const crystal = new LatheGeometry([[0, -1.25], [0.5, -0.45], [0.62, 0.3], [0.42, 0.85], [0, 1.3]].map(([x, y]) => new Vector2(x, y)), 6).toNonIndexed()
  crystal.computeVertexNormals()

  const geo = {
    crystal,
    edges: new EdgesGeometry(crystal, 1),
    energy: new IcosahedronGeometry(1, 24),
    halo: new IcosahedronGeometry(1, 6),
    ringA: new TorusGeometry(1.45, 0.02, 4, 6), // 4 x 6 segments: a hexagon with a diamond cross-section
    ringB: new TorusGeometry(1.75, 0.02, 4, 6),
    node: new OctahedronGeometry(0.055),
    rune: new RingGeometry(0.78, 0.99, 192, 1), // the glyph band and the tick dial, not a full quad
    flare: new PlaneGeometry(4.4, 4.4),
    haze: new PlaneGeometry(11, 11),
    motes: motesGeometry(),
  }

  const glass = (side: Side) =>
    new ShaderMaterial({
      uniforms: { uTint: { value: hdr(p.teal, 0.3) }, uRim: { value: hdr(p.teal, side === BackSide ? 0.45 : 1.3) }, uOpacity: { value: LOOK.post.glass }, uSpec: { value: 0.6 } },
      vertexShader: glsl.VIEW_VERT,
      fragmentShader: glsl.GLASS_FRAG,
      side,
      transparent: true,
      depthWrite: false,
    })

  const mat = {
    energy: new ShaderMaterial({
      defines: { OCTAVES: 4, WARP: 1 },
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: LOOK.post.energy },
        uVein: { value: LOOK.post.vein },
        uDeep: { value: p.deep.clone().lerp(new Color('#01080f'), 0.45) }, // darker deep + cyan hot: plasma depth, not a white blur
        uTeal: { value: p.teal },
        uHot: { value: p.hot.clone().lerp(p.teal, 0.5) },
      },
      vertexShader: glsl.ENERGY_VERT,
      fragmentShader: glsl.ENERGY_FRAG,
    }),
    halo: new ShaderMaterial({
      uniforms: { uColor: { value: p.teal }, uPower: { value: LOOK.post.haloPower }, uIntensity: { value: LOOK.post.halo } },
      vertexShader: glsl.VIEW_VERT,
      fragmentShader: glsl.HALO_FRAG,
      side: BackSide,
      ...additive,
    }),
    glassBack: glass(BackSide),
    glassFront: glass(FrontSide),
    edges: new LineBasicMaterial({ color: hdr(p.teal, 2.2), opacity: 0.22, ...additive }),
    gold: new ShaderMaterial({
      uniforms: { uGold: { value: p.gold }, uRimColor: { value: p.teal }, uGlint: { value: 1.6 } },
      vertexShader: glsl.VIEW_VERT,
      fragmentShader: glsl.GOLD_FRAG,
    }),
    node: new MeshBasicMaterial({ color: hdr(p.teal, 2.4) }),
    rune: new ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uProgress: { value: 1 }, uColor: { value: p.glyph }, uIntensity: { value: LOOK.post.rune } },
      vertexShader: glsl.PLANE_VERT,
      fragmentShader: glsl.RUNE_FRAG,
      side: DoubleSide,
      ...additive,
    }),
    motes: new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uSize: { value: 42 },
        uBox: { value: BOX },
        uIntensity: { value: LOOK.post.motes },
        uTeal: { value: p.teal },
        uGold: { value: p.glyph },
      },
      vertexShader: glsl.MOTES_VERT,
      fragmentShader: glsl.MOTES_FRAG,
      ...additive,
    }),
    flare: new ShaderMaterial({
      uniforms: { uIntensity: { value: LOOK.post.flare }, uTime: { value: 0 }, uLow: { value: 0 }, uColor: { value: p.hot.clone().lerp(p.teal, 0.45) } },
      vertexShader: glsl.PLANE_VERT,
      fragmentShader: glsl.FLARE_FRAG,
      depthTest: false,
      ...additive,
    }),
    haze: new ShaderMaterial({
      uniforms: { uColor: { value: hdr(p.haze, 0.8) }, uIntensity: { value: 0.22 } },
      vertexShader: glsl.PLANE_VERT,
      fragmentShader: glsl.HAZE_FRAG,
      ...additive,
    }),
  }

  let look = LOOK.post
  return {
    geo,
    mat,
    /** Shader variants, mote count and light levels for a tier (a define change recompiles: tier changes only). */
    setTier(spec: TierSpec, post: boolean) {
      look = post ? LOOK.post : LOOK.direct
      const e = mat.energy
      if (e.defines.OCTAVES !== spec.octaves || e.defines.WARP !== spec.warp) {
        e.defines.OCTAVES = spec.octaves
        e.defines.WARP = spec.warp
        e.needsUpdate = true
      }
      geo.motes.setDrawRange(0, spec.particles)
      mat.halo.uniforms.uPower.value = look.haloPower
      mat.glassBack.uniforms.uOpacity.value = mat.glassFront.uniforms.uOpacity.value = look.glass
      mat.flare.uniforms.uLow.value = post ? 0 : 1
    },
    /** Per-frame uniforms. glow: 0..1 (dims on scroll), intro: 0..1 (entrance), flash: 0..1 (accept beat). */
    update(t: number, glow: number, intro: number, flash: number, pixelRatio: number) {
      const u = (m: ShaderMaterial) => m.uniforms
      u(mat.energy).uTime.value = t
      u(mat.energy).uIntensity.value = look.energy * (glow * (1 + 0.08 * Math.sin(t * 1.5)) + flash * 1.6)
      u(mat.energy).uVein.value = look.vein
      u(mat.halo).uIntensity.value = look.halo * glow
      u(mat.rune).uTime.value = t
      u(mat.rune).uProgress.value = Math.min(1, Math.max(0, intro * 1.25 - 0.1))
      u(mat.rune).uIntensity.value = look.rune * (0.35 + 0.65 * glow)
      u(mat.motes).uTime.value = t
      u(mat.motes).uPixelRatio.value = pixelRatio
      u(mat.motes).uIntensity.value = look.motes * (0.3 + 0.7 * glow) * intro
      u(mat.flare).uTime.value = t
      u(mat.flare).uIntensity.value = look.flare * glow + flash * 1.5
      u(mat.haze).uIntensity.value = 0.22 * glow
    },
    dispose() {
      Object.values(geo).forEach((g) => g.dispose())
      Object.values(mat).forEach((m: Material) => m.dispose())
    },
  }
}

export type Core = ReturnType<typeof buildCore>

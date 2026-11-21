import {
  AdditiveBlending,
  CanvasTexture,
  CircleGeometry,
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PMREMGenerator,
  RingGeometry,
  ShaderMaterial,
  SRGBColorSpace,
  TorusGeometry,
  Vector3,
  type Material,
  type Texture,
  type WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { Tech } from '../../../content/tech'
import { techById } from '../../../lib/content'
import { DUR, gsap } from '../../../lib/motion'
import { monogram } from '../../../sections/stack/data'
import { LOGOS3D, type Logo3D } from '../../../sections/stack/logos3d'
import { logoGeometry } from './logoGeometry'

/** World units spanned by the anchor's height (placeOnAnchor). */
export const WORLD_H = 3.4
const HOLDER_Y = 0.3
const PED_Y = -0.98
const TOKEN_R = 0.8
const LOGO_W = 1.62

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

// ---------- dissolve: object-space noise discard with a hot edge (3d-logos §4.3), plus a lock-in flash ----------
interface Fx {
  uProgress: { value: number }
  uEdge: { value: number }
  uEdgeColor: { value: Color }
  uScale: { value: number }
  uFlash: { value: number }
}
const NOISE = /* glsl */ `
float h31(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vnoise(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h31(i), h31(i + vec3(1,0,0)), f.x), mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), f.x), mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), f.x), f.y), f.z); }`

function withFx<M extends Material>(m: M, u: Fx): M {
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, u)
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObj;\nuniform float uScale;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObj = position * uScale;')
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vObj;\nuniform float uProgress, uEdge, uFlash;\nuniform vec3 uEdgeColor;\n${NOISE}`)
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
  float dn = 0.75 * vnoise(vObj * 3.5) + 0.25 * vnoise(vObj * 9.0) + 0.12 * vObj.y;
  float cut = uProgress * 1.5 - 0.2;
  if (dn < cut) discard;`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
  totalEmissiveRadiance += uEdgeColor * (1.0 - smoothstep(cut, cut + uEdge, dn)) * step(0.001, uProgress) * 4.0 + vec3(uFlash);`,
      )
  }
  m.customProgramCacheKey = () => 'cs-fx'
  return m
}

// ---------- shared, cheap geometry ----------
const VERT = 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
const OUT = '\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'
const glow = (color: Color, intensity: number, radius: number, power: number) =>
  new ShaderMaterial({
    uniforms: { uColor: { value: color }, uI: { value: intensity } },
    vertexShader: VERT,
    fragmentShader: `uniform vec3 uColor; uniform float uI; varying vec2 vP; void main(){ vec3 c = uColor * uI * pow(max(1.0 - length(vP) / ${radius.toFixed(3)}, 0.0), ${power.toFixed(2)}); gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)));${OUT}`,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })

const tokenBody = new CylinderGeometry(TOKEN_R, TOKEN_R, 0.16, 96, 1).rotateX(Math.PI / 2)
const tokenRim = new TorusGeometry(TOKEN_R - 0.035, 0.042, 12, 128).translate(0, 0, 0.08)
const tokenFace = new CircleGeometry(TOKEN_R - 0.075, 96).translate(0, 0, 0.0815)

/** Our token's face: dark enamel, a fine gold ring, then the official logo file untouched (flat) or our
 *  monogram (name). Also returns a glow colour taken from the logo itself. */
async function faceTexture(t: Tech) {
  const c = document.createElement('canvas')
  c.width = c.height = 512
  const g = c.getContext('2d', { willReadFrequently: true })!
  const bg = g.createRadialGradient(256, 190, 24, 256, 256, 260)
  bg.addColorStop(0, css('--color-ink-700'))
  bg.addColorStop(1, css('--color-ink-950'))
  g.fillStyle = bg
  g.fillRect(0, 0, 512, 512)
  g.strokeStyle = 'rgb(209 180 124 / 0.5)'
  g.lineWidth = 3
  g.beginPath()
  g.arc(256, 256, 232, 0, Math.PI * 2)
  g.stroke()
  let tint = new Color(css('--color-gold-200'))
  const img = new Image()
  if (t.policy === 'flat' && t.logo) img.src = t.logo
  if (img.src && (await img.decode().then(() => true, () => false))) {
    const ar = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1
    const w = ar >= 1 ? 280 : 280 * ar
    const h = ar >= 1 ? 280 / ar : 280
    g.drawImage(img, 256 - w / 2, 256 - h / 2, w, h)
    tint = averageColour(g, tint)
  } else {
    // 'name' marks, or a logo file that failed to load: our monogram
    const text = monogram(t).toUpperCase()
    const size = text.length > 2 ? 150 : 196
    await document.fonts.load(`700 ${size}px "Literata Caps"`).catch(() => [])
    g.font = `700 ${size}px "Literata Caps", Georgia, serif`
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    const fill = g.createLinearGradient(0, 256 - size / 2, 0, 256 + size / 2)
    fill.addColorStop(0.1, css('--color-gold-50'))
    fill.addColorStop(0.55, css('--color-gold-200'))
    fill.addColorStop(1, css('--color-gold-500'))
    g.fillStyle = fill
    g.fillText(text, 256, 268)
  }
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return { tex, tint }
}

/** Mean of the logo's saturated pixels (white or black marks keep the fallback). */
function averageColour(g: CanvasRenderingContext2D, fallback: Color) {
  const d = g.getImageData(116, 116, 280, 280).data
  let r = 0
  let gr = 0
  let b = 0
  let n = 0
  for (let i = 0; i < d.length; i += 16) {
    const hi = Math.max(d[i], d[i + 1], d[i + 2])
    if (hi - Math.min(d[i], d[i + 1], d[i + 2]) < 48) continue
    r += d[i]
    gr += d[i + 1]
    b += d[i + 2]
    n++
  }
  return n > 40 ? new Color().setRGB(r / n / 255, gr / n / 255, b / n / 255, SRGBColorSpace) : fallback
}

function gradientMap(gr: NonNullable<Logo3D['gradient']>) {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  const lg = g.createLinearGradient(gr.x1 * 256, gr.y1 * 256, gr.x2 * 256, gr.y2 * 256)
  for (const [o, col] of gr.stops) lg.addColorStop(o, col)
  g.fillStyle = lg
  g.fillRect(0, 0, 256, 256)
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  t.flipY = false
  t.repeat.set(1 / 24, 1 / 24) // extruded caps carry raw SVG units as UVs
  return t
}

interface Model {
  swap: Group
  u: Fx
  tint: Color
  dispose: () => void
}

/** The stack splash: a pedestal and the selected tech, built imperatively and placed on the anchor by
 *  the scene. Lit by RoomEnvironment through PMREM on these materials only: no scene lights, so nothing
 *  here touches other scenes on the shared canvas. */
export function buildStage(gl: WebGLRenderer, still: boolean) {
  const pm = new PMREMGenerator(gl)
  const env = pm.fromScene(new RoomEnvironment(), 0.04).texture
  pm.dispose()
  const own: { dispose: () => void }[] = [env]
  const keep = <T extends { dispose: () => void }>(x: T) => (own.push(x), x)

  const goldHex = css('--color-gold-300')
  const teal = new Color(css('--color-teal-300'))
  const gold = keep(new MeshStandardMaterial({ color: goldHex, metalness: 1, roughness: 0.3, envMap: env }))

  const root = new Group()
  root.rotation.x = 0.17 // a little top-down, so the pedestal reads as a plinth

  // aura (takes the tech's colour) and a slow tick dial behind the mark
  const auraMat = keep(glow(teal.clone(), 0.32, 2.3, 2.6))
  const aura = new Mesh(keep(new PlaneGeometry(4.8, 4.8)), auraMat)
  aura.position.set(0, HOLDER_Y, -1.4)
  const dialMat = keep(
    new ShaderMaterial({
      uniforms: { uColor: { value: new Color(css('--color-gold-200')) }, uI: { value: 0.55 } },
      vertexShader: VERT,
      fragmentShader: `uniform vec3 uColor; uniform float uI; varying vec2 vP; void main(){
        float a = atan(vP.y, vP.x) / 6.2831853 * 144.0;
        float w = fwidth(a) * 1.2;
        float tick = smoothstep(0.62 - w, 0.62 + w, abs(fract(a) - 0.5) * 2.0);
        float major = step(0.5, fract(a / 12.0 + 0.04) * 12.0 - 11.0) * 0.6 + 0.4;
        vec3 c = uColor * uI * tick * major;
        gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)));${OUT}`,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  )
  const dial = new Group()
  dial.add(new Mesh(keep(new RingGeometry(1.3, 1.4, 144, 1)), dialMat))
  const line = new Mesh(keep(new RingGeometry(1.255, 1.263, 144, 1)), keep(new MeshBasicMaterial({ color: css('--color-gold-500'), transparent: true, opacity: 0.6 })))
  dial.add(line)
  dial.position.set(0, HOLDER_Y, -0.9)

  // pedestal: our own two-step plinth, gold rims, a teal inlay and a glow pool
  const ped = new Group()
  ped.position.y = PED_Y
  const dark = keep(new MeshStandardMaterial({ color: css('--color-ink-800'), metalness: 0.75, roughness: 0.42, envMap: env, envMapIntensity: 0.9 }))
  const top = keep(new MeshStandardMaterial({ color: css('--color-ink-900'), metalness: 0.5, roughness: 0.34, envMap: env, envMapIntensity: 0.45 }))
  const base = new Mesh(keep(new CylinderGeometry(1.12, 1.22, 0.2, 72)), [dark, top, dark])
  base.position.y = -0.1
  const foot = new Mesh(keep(new CylinderGeometry(1.26, 1.32, 0.07, 72)), [dark, dark, dark])
  foot.position.y = -0.235
  const ring = (r: number, tube: number, y: number) => {
    const m = new Mesh(keep(new TorusGeometry(r, tube, 8, 128)), gold)
    m.rotation.x = Math.PI / 2
    m.position.y = y
    return m
  }
  const inlayMat = keep(new MeshBasicMaterial({ color: teal.clone().multiplyScalar(2.2) }))
  const inlay = new Mesh(keep(new RingGeometry(0.72, 0.765, 128)), inlayMat)
  const poolMat = keep(glow(teal.clone(), 0.5, 0.74, 2.2))
  const pool = new Mesh(keep(new CircleGeometry(0.74, 64)), poolMat)
  const shadowMat = keep(
    new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: 'varying vec2 vP; void main(){ gl_FragColor = vec4(0.0, 0.0, 0.0, pow(1.0 - clamp(length(vP) / 0.6, 0.0, 1.0), 1.6) * 0.6); }',
      transparent: true,
      depthWrite: false,
    }),
  )
  const shadow = new Mesh(keep(new CircleGeometry(0.6, 48)), shadowMat)
  for (const [m, y, order] of [
    [inlay, 0.002, 1],
    [pool, 0.003, 2],
    [shadow, 0.004, 3],
  ] as const) {
    m.rotation.x = -Math.PI / 2
    m.position.y = y
    m.renderOrder = order
  }
  ped.add(base, foot, ring(1.12, 0.02, 0), ring(1.26, 0.014, -0.2), inlay, pool, shadow)

  const holder = new Group()
  holder.position.y = HOLDER_Y
  root.add(aura, dial, ped, holder)

  // ---------- models: one per tech, built on first show and cached ----------
  const fx = (scale: number): Fx => ({ uProgress: { value: 1 }, uEdge: { value: 0.08 }, uEdgeColor: { value: teal.clone() }, uScale: { value: scale }, uFlash: { value: 0 } })
  const enamel = (color: string, map?: Texture) =>
    new MeshPhysicalMaterial({ ...(map ? { map } : { color }), flatShading: true, roughness: 0.38, metalness: 0.05, clearcoat: 0.6, clearcoatRoughness: 0.12, envMap: env, envMapIntensity: 0.7 })

  function extruded(id: string, l: Logo3D): Model {
    const g = logoGeometry(id, l)
    const u = fx(1 / 12)
    const map = l.gradient ? gradientMap(l.gradient) : undefined
    const mats = [withFx(enamel(l.face, map), u), withFx(gold.clone(), u)]
    const k = (LOGO_W / 24) * l.optical
    const c = g.body.boundingBox!.getCenter(new Vector3())
    const place = (m: Mesh) => {
      m.scale.set(k, -k, k) // SVG y runs down; a mirrored mesh keeps culling right (3d-logos §3.6)
      m.position.set(-c.x * k, c.y * k, -c.z * k)
      return m
    }
    const swap = new Group()
    swap.add(place(new Mesh(g.body, mats)))
    let inlayMat: Material | undefined
    if (g.inlay && l.inlay) {
      inlayMat = withFx(enamel(l.inlay), u)
      swap.add(place(new Mesh(g.inlay, inlayMat)))
    }
    return { swap, u, tint: new Color(l.face), dispose: () => [...mats, inlayMat, map].forEach((x) => x?.dispose()) }
  }

  async function token(t: Tech): Promise<Model> {
    const { tex, tint } = await faceTexture(t)
    const u = fx(1.2)
    const metal = withFx(gold.clone(), u)
    // exact logo colours: the face is emissive, untouched by lights or tone mapping; the env adds only a sheen
    const face = withFx(new MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: tex, roughness: 0.4, metalness: 0, envMap: env, envMapIntensity: 0.35, toneMapped: false }), u)
    const swap = new Group()
    swap.add(new Mesh(tokenBody, metal), new Mesh(tokenRim, metal), new Mesh(tokenFace, face))
    return { swap, u, tint, dispose: () => [metal, face, tex].forEach((x) => x.dispose()) }
  }

  const models = new Map<string, Promise<Model>>()
  const model = (id: string) => {
    let m = models.get(id)
    if (!m) {
      const t = techById(id)!
      const l = t.policy === 'extrude' ? LOGOS3D[t.id] : undefined // never extrude a mark whose policy is not 'extrude'
      m = l ? Promise.resolve(extruded(t.id, l)) : token(t)
      models.set(id, m)
    }
    return m
  }

  let current: Model | null = null
  let wanted = ''
  let shown = false
  const settle = (m: Model) => {
    m.u.uProgress.value = 0
    m.swap.rotation.y = 0
    m.swap.scale.setScalar(1)
  }

  async function show(id: string) {
    wanted = id
    const m = await model(id)
    if (wanted !== id || m === current) return
    const prev = current
    current = m
    shown = true
    gsap.killTweensOf([m.u.uProgress, m.swap.rotation, m.swap.scale])
    holder.add(m.swap)
    const tint = (m.tint.getHSL({ h: 0, s: 0, l: 0 }).l < 0.12 ? new Color(css('--color-gold-200')) : m.tint).clone()
    if (still) {
      settle(m)
      if (prev) holder.remove(prev.swap)
      auraMat.uniforms.uColor.value.copy(tint)
      return
    }
    gsap.to(auraMat.uniforms.uColor.value, { r: tint.r, g: tint.g, b: tint.b, duration: DUR.glow, ease: 'glow' })
    const delay = prev ? DUR.fast : 0
    gsap.fromTo(m.u.uProgress, { value: 1 }, { value: 0, duration: DUR.glow, ease: 'show', delay })
    gsap.fromTo(m.swap.rotation, { y: -0.7 }, { y: 0, duration: DUR.glow * 1.5, ease: 'settle', delay })
    gsap.fromTo(m.swap.scale, { x: 0.9, y: 0.9, z: 0.9 }, { x: 1, y: 1, z: 1, duration: DUR.glow, ease: 'settle', delay })
    if (prev) {
      gsap.killTweensOf([prev.u.uProgress, prev.swap.rotation])
      gsap.to(prev.swap.rotation, { y: '+=0.5', duration: DUR.slow, ease: 'in' })
      gsap.to(prev.u.uProgress, { value: 1, duration: DUR.slow, ease: 'in', onComplete: () => void (prev !== current && holder.remove(prev.swap)) })
    }
  }

  const pulse = { v: 0 }
  function lockIn() {
    const m = current
    if (!m || still) return
    gsap.fromTo(m.u.uFlash, { value: 1.2 }, { value: 0, duration: DUR.glow, ease: 'glow' })
    gsap.fromTo(m.swap.scale, { x: 1.14, y: 1.14, z: 1.14 }, { x: 1, y: 1, z: 1, duration: DUR.slower, ease: 'settle' })
    gsap.fromTo(pulse, { v: 1 }, { v: 0, duration: DUR.glow * 1.5, ease: 'glow' })
  }

  /** Builds what the visitor is likely to pick next while the main thread is idle. */
  function prebuild(ids: string[]) {
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 60))
    const q = [...ids]
    const pump = () => {
      const id = q.shift()
      if (!id) return
      void model(id).then(() => ric(pump))
    }
    ric(pump)
  }

  function tick(t: number) {
    if (!still) {
      holder.position.y = HOLDER_Y + Math.sin(t * 1.1) * 0.05
      holder.rotation.y = Math.sin(t * 0.5) * 0.45 // a swing, never edge-on
      dial.rotation.z = -t * 0.031 // one turn every ~200 s
    }
    const lift = holder.position.y - HOLDER_Y
    shadow.scale.setScalar(1 - lift * 1.2)
    inlayMat.color.copy(teal).multiplyScalar(2.2 + pulse.v * 3)
    poolMat.uniforms.uI.value = 0.5 + pulse.v * 0.9
  }

  function dispose() {
    for (const m of models.values()) void m.then((x) => x.dispose())
    own.forEach((x) => x.dispose())
  }

  return { root, show, lockIn, prebuild, tick, dispose, ready: () => shown }
}

export type StackStage = ReturnType<typeof buildStage>

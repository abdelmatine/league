import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { Color, HalfFloatType, LinearSRGBColorSpace, NeutralToneMapping, WebGLRenderTarget } from 'three'
import { gsap } from '../../lib/motion'
import { stageStore } from '../../lib/stageStore'
import { createMonitor, dprFor, ORDER, stagePlan, TIERS, type StagePlan, type Tier } from '../../lib/tiers'
import { Post } from './Post'
import { frame, QualityContext } from './quality'
import { SCENES } from './scenes'
import './stage.css'

const html = document.documentElement
/** Stable object: r3f re-applies `gl` props whenever their identity changes. */
const GL = { antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance', toneMapping: NeutralToneMapping } as const
const CAMERA = { position: [0, 0, 10], fov: 35, near: 0.1, far: 60 } as const
/** Page colour (ink-950). The composer tone maps the clear colour, so it gets the linear value NEUTRAL maps back to #01080f. */
const BG = new Color('#01080f')
const BG_POST = new Color().setRGB(0.006974, 0.009098, 0.011448, LinearSRGBColorSpace)
const NO_PLAN: StagePlan = { start: 'low', ceiling: 'low', floatRT: false } // App mounts the stage only with a plan

/** One clock: gsap.ticker (after lenis.raf) advances the canvas while a scene is on screen, and feeds the tier monitor
 *  with the continuous frames only (gap:3). advance() takes seconds in frameloop="never". */
function Clock({ step }: { step?: (dir: -1 | 1) => void }) {
  const advance = useThree((s) => s.advance)
  useEffect(() => {
    const sample = step && createMonitor(step)
    let was = false
    let shown = false
    const tick = (time: number) => {
      if (!frame.ready) return
      const visible = stageStore.anyVisible()
      if (visible && !shown) frame.dirty = true // a scene came on screen: reduced motion draws its still now
      shown = visible
      const live = visible && !frame.still
      if (live || frame.dirty) {
        frame.dirty = false
        advance(time)
      }
      sample?.(time * 1000, live && was)
      was = live
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [advance, step])
  return null
}


/** Compiles every scene program on the GPU's worker threads before the first frame (KHR_parallel_shader_compile),
 *  for the variant the frame will use: the composer renders into a linear half-float target. Then one frame is drawn
 *  even off screen, and the page swaps the CSS poster for the canvas. */
function Warmup({ tier, post }: { tier: Tier; post: boolean }) {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    let live = true
    frame.ready = false
    const target = post ? new WebGLRenderTarget(1, 1, { type: HalfFloatType }) : null
    gl.setRenderTarget(target)
    const compiled = gl.compileAsync(scene, camera).catch(() => undefined) // a failed compile falls back to compiling on first draw
    gl.setRenderTarget(null)
    void compiled.then(() => {
      target?.dispose()
      if (!live) return
      frame.ready = true
      frame.dirty = true
    })
    return () => {
      live = false
    }
  }, [gl, scene, camera, tier, post])
  useFrame(() => {
    if (html.dataset.stage !== 'live') requestAnimationFrame(() => (html.dataset.stage = 'live')) // after this frame is on screen
  })
  return null
}

/** The one canvas: fixed behind the DOM, never interactive. Lazy chunk (App), mounted only when stagePlan() allows. */
export default function Stage() {
  const [plan] = useState(() => stagePlan() ?? NO_PLAN)
  const [tier, setTier] = useState<Tier>(plan.start)
  const { scenes } = useSyncExternalStore(stageStore.subscribe, stageStore.get, stageStore.get)
  const spec = TIERS[tier]
  const post = spec.bloom > 0 && plan.floatRT
  const quality = useMemo(() => ({ tier, spec: TIERS[tier], post }), [tier, post])
  const step = useCallback((d: -1 | 1) => setTier((x) => ORDER[Math.max(0, Math.min(ORDER.indexOf(x) + d, ORDER.indexOf(plan.ceiling)))]), [plan.ceiling])

  // Budget pixels, not DPR. r3f re-applies the dpr prop on every render, so the budget lives here, refit when the
  // width changes or the height by more than 15 % (mobile toolbars sliding in and out would reallocate otherwise).
  const [view, setView] = useState(() => [innerWidth, innerHeight])
  useEffect(() => {
    const resize = () => {
      frame.dirty = true // reduced motion: redraw the still at the new size
      setView(([w, h]) => (w === innerWidth && Math.abs(h - innerHeight) < h * 0.15 ? [w, h] : [innerWidth, innerHeight]))
    }
    addEventListener('resize', resize)
    return () => removeEventListener('resize', resize)
  }, [])

  // G07: the header's backdrop blur follows the tier while the canvas is up.
  useEffect(() => {
    html.style.setProperty('--hdr-blur', spec.hdrBlur)
    return () => void html.style.removeProperty('--hdr-blur')
  }, [spec.hdrBlur])
  useEffect(() => () => void delete html.dataset.stage, [])

  // Idle: hidden, so the last drawn frame never lingers once its anchor has scrolled away.
  const idle = !scenes.some((s) => s.visible)
  return (
    <div className="hx-stage" aria-hidden="true" data-idle={idle ? '' : undefined} data-tier={tier} data-post={post ? '' : undefined}>
      <Canvas
        frameloop="never"
        dpr={dprFor(spec.maxPx, view[0], view[1], devicePixelRatio)}
        camera={CAMERA}
        gl={GL}
        onCreated={({ gl, scene, camera, advance }) => {
          const canvas = gl.domElement
          canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault() // lets the browser restore it; the poster covers meanwhile
            delete html.dataset.stage
          })
          canvas.addEventListener('webglcontextrestored', () => void (frame.dirty = true))
          if (import.meta.env.DEV) Object.assign(window, { __stage: { gl, scene, camera, advance, setTier } }) // frame-time bench
        }}
      >
        <QualityContext value={quality}>
          <primitive object={post ? BG_POST : BG} attach="background" />
          {scenes.map(({ id, anchor }) => {
            const Scene = SCENES[id]
            return Scene ? <Scene key={id} anchor={anchor} /> : null
          })}
          {post && <Post levels={spec.bloom} />}
          <Warmup tier={tier} post={post} />
          <Clock step={plan.pinned ? undefined : step} />
        </QualityContext>
      </Canvas>
    </div>
  )
}

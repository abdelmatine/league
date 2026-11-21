import { MeshTransmissionMaterial } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { MathUtils, type Group, type InstancedMesh, type Mesh, type PerspectiveCamera } from 'three'
import { prefersReducedMotion, ScrollTrigger } from '../../lib/motion'
import { stageStore } from '../../lib/stageStore'
import { buildCore, nodeMatrices } from './core'
import { frame, useQuality } from './quality'
import { heroRig } from './rig'
import type { SceneProps } from './scenes'

/** Size of the core at scale 1 in world units (the tilted rune ring is the width, the hex rings the height). */
const CORE_W = 4.8
const CORE_H = 3.6
const RINGS = [
  { r: 1.45, tilt: -0.35, yaw: 0.2, speed: 0.08 },
  { r: 1.75, tilt: 0.5, yaw: -0.35, speed: -0.05 },
] as const

const homeVisible = () => stageStore.get().scenes.some((s) => s.id === 'home' && s.visible)
const smooth = (x: number) => x * x * (3 - 2 * x)

/** The hero core: crystal, energy, halo, hex rings, rune ring, flare, haze and motes. It sits on the hero's
 *  [data-core] box, faces the camera from wherever that box is on screen, and hides while the hero is off screen.
 *  It never touches the shared camera, so other scenes keep their own framing. */
export function HomeScene({ anchor }: SceneProps) {
  const { spec, post } = useQuality()
  const core = useMemo(() => buildCore(), [])
  const root = useRef<Group>(null)
  const rig = useRef<Group>(null) // fit, scroll and dolly; faces the camera
  const tilt = useRef<Group>(null) // pointer parallax and bob
  const spin = useRef<Group>(null)
  const rings = useRef<(Mesh | null)[]>([])
  const nodes = useRef<(InstancedMesh | null)[]>([])
  const field = useRef<Group>(null)
  const box = useRef({ cx: 0, cy: 0, w: 1, h: 1 })
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 })

  useLayoutEffect(() => core.setTier(spec, post), [core, spec, post])
  useEffect(() => () => core.dispose(), [core])
  useLayoutEffect(() => {
    nodes.current.forEach((m, i) => {
      if (!m) return
      nodeMatrices(RINGS[i].r).forEach((mx, k) => m.setMatrixAt(k, mx))
      m.instanceMatrix.needsUpdate = true
    })
  }, [])

  // The core's resting place: the [data-core] box in page coordinates, re-read on resize and ScrollTrigger refreshes.
  useEffect(() => {
    const el = anchor.querySelector<HTMLElement>('[data-core]') ?? anchor
    const measure = () => {
      const r = el.getBoundingClientRect()
      box.current = { cx: r.left + r.width / 2 + scrollX, cy: r.top + r.height / 2 + scrollY, w: r.width, h: r.height }
    }
    measure()
    addEventListener('resize', measure)
    ScrollTrigger.addEventListener('refresh', measure)
    void document.fonts?.ready.then(measure)
    return () => {
      removeEventListener('resize', measure)
      ScrollTrigger.removeEventListener('refresh', measure)
    }
  }, [anchor])

  // Pointer parallax: fine pointers only, never under reduced motion.
  useEffect(() => {
    if (prefersReducedMotion() || !matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const move = (e: PointerEvent) => {
      pointer.current.tx = (e.clientX / innerWidth) * 2 - 1
      pointer.current.ty = (e.clientY / innerHeight) * 2 - 1
    }
    addEventListener('pointermove', move, { passive: true })
    return () => removeEventListener('pointermove', move)
  }, [])

  useFrame(({ camera, size, clock, gl }, delta) => {
    const visible = homeVisible()
    root.current!.visible = visible
    if (!visible) return
    const dt = Math.min(delta, 1 / 20) // a resumed clock can hand over seconds
    const t = clock.elapsedTime
    const { pull, intro, flash } = heroRig
    const cam = camera as PerspectiveCamera
    const unitsPerPx = (depth: number) => (2 * depth * Math.tan(MathUtils.degToRad(cam.fov / 2))) / size.height
    const b = box.current
    const out = smooth(MathUtils.clamp(pull, 0, 1))

    // Scroll: the core rises at about half the scroll speed (the copy slides past it), pulls back and drifts aside on wide screens.
    const sx = b.cx - scrollX + (size.width >= 1024 ? size.width * 0.16 * out : 0)
    const sy = b.cy - (frame.still ? 0 : scrollY * 0.55)
    const z = -3.2 * out
    const k = unitsPerPx(cam.position.z - z)
    const g = rig.current!
    g.position.set((sx - size.width / 2) * k, -(sy - size.height / 2) * k, z)
    g.lookAt(cam.position)
    g.scale.setScalar(Math.min(b.w / CORE_W, b.h / CORE_H) * unitsPerPx(cam.position.z) * (0.6 + 0.4 * smooth(intro)))
    field.current!.position.z = z * 0.6

    const p = pointer.current
    const damp = 1 - Math.exp(-dt / 0.4)
    p.x += (p.tx - p.x) * damp
    p.y += (p.ty - p.y) * damp
    tilt.current!.rotation.set(p.y * 0.12, p.x * 0.18, 0)
    tilt.current!.position.y = Math.sin(t * 0.8) * 0.04
    spin.current!.rotation.y = t * 0.15
    rings.current.forEach((m, i) => void (m && (m.rotation.z = t * RINGS[i].speed)))

    core.update(t, (1 - 0.85 * out) * intro, intro, flash, gl.getPixelRatio())
  })

  const { geo, mat } = core
  const real = spec.glass === 'transmission'
  return (
    <group ref={root}>
      <group ref={rig}>
        <mesh geometry={geo.haze} material={mat.haze} position-z={-1.8} renderOrder={-1} />
        <group ref={tilt}>
          <group ref={spin}>
            {/* Without the composer the energy draws after the glass, or the glass would grey its tone-mapped glow (gap:1). */}
            <mesh geometry={geo.energy} material={mat.energy} scale={0.42} renderOrder={post ? 1 : 4} />
            {!real && <mesh geometry={geo.crystal} material={mat.glassBack} renderOrder={2} />}
            <mesh geometry={geo.crystal} renderOrder={3}>
              {real ? (
                <MeshTransmissionMaterial
                  samples={6}
                  resolution={512}
                  thickness={0.6}
                  ior={1.45}
                  chromaticAberration={0.06}
                  anisotropicBlur={0.1}
                  distortion={0.15}
                  distortionScale={0.4}
                  temporalDistortion={0.1}
                  roughness={0.05}
                  color="#d3faf6"
                  attenuationColor="#2fd0c4"
                  attenuationDistance={2.6}
                  flatShading
                />
              ) : (
                <primitive object={mat.glassFront} attach="material" />
              )}
            </mesh>
            <lineSegments geometry={geo.edges} material={mat.edges} renderOrder={5} />
            <mesh geometry={geo.halo} material={mat.halo} scale={0.66} renderOrder={6} />
          </group>
          {RINGS.map((r, i) => (
            <group key={r.r} rotation={[r.tilt, r.yaw, 0]}>
              <mesh ref={(m) => void (rings.current[i] = m)} geometry={i ? geo.ringB : geo.ringA} material={mat.gold}>
                <instancedMesh ref={(m) => void (nodes.current[i] = m)} args={[geo.node, mat.node, 6]} />
              </mesh>
            </group>
          ))}
          <group rotation-x={-Math.PI / 2 + MathUtils.degToRad(14)} position-y={-0.18} scale={2.4}>
            <mesh geometry={geo.rune} material={mat.rune} renderOrder={7} />
          </group>
        </group>
        <mesh geometry={geo.flare} material={mat.flare} renderOrder={8} frustumCulled={false} />
      </group>
      <group ref={field}>
        <points geometry={geo.motes} material={mat.motes} renderOrder={9} frustumCulled={false} />
      </group>
    </group>
  )
}

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import type { Group } from 'three'
import { mainsByUsage } from '../../../lib/content'
import { prefersReducedMotion } from '../../../lib/motion'
import { stageStore } from '../../../lib/stageStore'
import { LOGOS3D } from '../../../sections/stack/logos3d'
import { placeOnAnchor } from '../anchor'
import type { SceneProps } from '../scenes'
import { buildStage, WORLD_H, type StackStage } from './build'

const selectedTech = () => stageStore.get().selectedTech

/** The stack splash on the shared canvas. Built in idle time (or as soon as the splash scrolls into
 *  view), so the hero's first frames never pay for it. Placed on its DOM anchor every frame (one rect
 *  read, after lenis.raf, before the render), so it tracks scrolling. Follows stageStore's selected
 *  tech; a `cs:lockin` event on the anchor plays the lock-in. Marks the anchor `data-stage="ready"`. */
export function StackScene({ anchor }: SceneProps) {
  const gl = useThree((s) => s.gl)
  const selected = useSyncExternalStore(stageStore.subscribe, selectedTech, selectedTech)
  const mount = useRef<Group>(null)
  const stage = useRef<StackStage | null>(null)

  useEffect(() => {
    const host = mount.current
    let s: StackStage | null = null
    const onLock = () => s?.lockIn()
    const build = () => {
      if (s) return
      s = buildStage(gl, prefersReducedMotion())
      stage.current = s
      host?.add(s.root)
      const id = stageStore.get().selectedTech
      if (id) void s.show(id)
      s.prebuild([...Object.keys(LOGOS3D), ...mainsByUsage().map((m) => m.tech.id)])
    }
    const ric = 'requestIdleCallback' in window // not in Safari
    const idle = ric ? requestIdleCallback(build, { timeout: 4000 }) : window.setTimeout(build, 1500)
    const seen = stageStore.subscribe(() => stageStore.get().scenes.some((x) => x.anchor === anchor && x.visible) && build())
    anchor.addEventListener('cs:lockin', onLock)
    return () => {
      if (ric) cancelIdleCallback(idle)
      else clearTimeout(idle)
      seen()
      anchor.removeEventListener('cs:lockin', onLock)
      anchor.removeAttribute('data-stage')
      if (s) {
        host?.remove(s.root)
        s.dispose()
      }
      stage.current = null
    }
  }, [gl, anchor])

  useEffect(() => {
    if (selected) void stage.current?.show(selected)
  }, [selected])

  useFrame(({ camera, size, clock }) => {
    const s = stage.current
    if (!s) return
    placeOnAnchor(s.root, anchor, camera, size, WORLD_H)
    s.tick(clock.elapsedTime)
    if (s.ready() && !anchor.hasAttribute('data-stage')) anchor.setAttribute('data-stage', 'ready')
  })

  return <group ref={mount} />
}

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { CylinderGeometry, EdgesGeometry, type Group } from 'three'
import { prefersReducedMotion } from '../../lib/motion'
import { placeOnAnchor } from './anchor'
import type { SceneProps } from './scenes'

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

/** Placeholder for #home until L09's core: a slowly turning wireframe hexagonal prism. */
export function HomeScene({ anchor }: SceneProps) {
  const group = useRef<Group>(null)
  const edges = useMemo(() => new EdgesGeometry(new CylinderGeometry(1, 1, 1.9, 6)), [])
  const colors = useMemo(() => ({ teal: token('--color-teal-300'), gold: token('--color-gold-200') }), [])
  const still = prefersReducedMotion()
  useFrame(({ camera, size }, dt) => {
    const g = group.current
    if (!g) return
    placeOnAnchor(g, anchor, camera, size, 3)
    if (!still) g.rotation.y += dt * 0.35
  })
  return (
    <group ref={group} rotation={[0.32, 0, 0.12]}>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={colors.teal} />
      </lineSegments>
      <lineSegments geometry={edges} scale={[1.22, 0.86, 1.22]} rotation={[0, Math.PI / 6, 0]}>
        <lineBasicMaterial color={colors.gold} transparent opacity={0.55} />
      </lineSegments>
    </group>
  )
}

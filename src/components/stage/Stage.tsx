import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useSyncExternalStore } from 'react'
import { gsap } from '../../lib/motion'
import { stageStore } from '../../lib/stageStore'
import { SCENES } from './scenes'

/** One clock: gsap.ticker (after lenis.raf) advances the canvas, and only while a scene is on screen. */
function Clock() {
  const advance = useThree((s) => s.advance)
  useEffect(() => {
    const tick = (time: number) => {
      if (stageStore.anyVisible()) advance(time * 1000)
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [advance])
  return null
}

/** The one canvas: fixed behind the DOM, never interactive. Lazy chunk (App). */
export default function Stage() {
  const { scenes } = useSyncExternalStore(stageStore.subscribe, stageStore.get, stageStore.get)
  // Idle: hidden, so the last drawn frame never lingers once its anchor has scrolled away.
  const idle = !scenes.some((s) => s.visible)
  return (
    <div className="hx-stage" aria-hidden="true" data-idle={idle ? '' : undefined}>
      <Canvas frameloop="never" dpr={[1, 1.5]} camera={{ position: [0, 0, 10], fov: 35 }} gl={{ alpha: true, antialias: true }}>
        <Clock />
        {scenes.map(({ id, anchor }) => {
          const Scene = SCENES[id]
          return Scene ? <Scene key={id} anchor={anchor} /> : null
        })}
      </Canvas>
    </div>
  )
}

import { useFrame, useThree } from '@react-three/fiber'
import { BloomEffect, EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode, VignetteEffect } from 'postprocessing'
import { useEffect, useMemo } from 'react'
import { HalfFloatType, NoToneMapping } from 'three'

/** Post chain (spec §7): selective bloom (only HDR > 1 glows), vignette, NEUTRAL tone mapping last; half-float
 *  targets, no MSAA (on integrated GPUs it costs more than the whole bloom, webgl-magic §5.3).
 *  postprocessing is used directly: the r3f wrapper bundles n8ao's model data even when AO is unused. */
export function Post({ levels }: { levels: number }) {
  const get = useThree((s) => s.get)
  const size = useThree((s) => s.size)
  const dpr = useThree((s) => s.viewport.dpr)
  const composer = useMemo(() => {
    const { gl, scene, camera } = get()
    const c = new EffectComposer(gl, { frameBufferType: HalfFloatType, multisampling: 0 })
    c.addPass(new RenderPass(scene, camera))
    c.addPass(
      new EffectPass(
        camera,
        new BloomEffect({ mipmapBlur: true, luminanceThreshold: 1, luminanceSmoothing: 0.2, intensity: 1.1, radius: 0.75, levels }),
        new VignetteEffect({ offset: 0.3, darkness: 0.65 }),
        new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
      ),
    )
    return c
  }, [get, levels])

  useEffect(() => {
    const gl = get().gl
    const own = gl.toneMapping
    gl.toneMapping = NoToneMapping // the effect tone maps; the renderer must not do it twice
    return () => {
      gl.toneMapping = own
      composer.dispose()
    }
  }, [get, composer])
  useEffect(() => composer.setSize(size.width, size.height), [composer, size, dpr]) // targets follow the drawing buffer (size x pixel ratio)

  useFrame((_, delta) => composer.render(delta), 1) // priority 1: the composer takes over rendering
  return null
}

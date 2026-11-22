import type { Camera, Object3D, PerspectiveCamera } from 'three'
import { MathUtils, Vector3 } from 'three'

const v = new Vector3()

/** Puts `obj` on the z = 0 plane at the centre of `el`, scaled so `worldHeight` units span the element's height. */
export function placeOnAnchor(obj: Object3D, el: HTMLElement, camera: Camera, size: { width: number; height: number }, worldHeight: number) {
  const r = el.getBoundingClientRect()
  v.set(((r.left + r.width / 2) / size.width) * 2 - 1, 1 - ((r.top + r.height / 2) / size.height) * 2, 0.5).unproject(camera)
  v.sub(camera.position).normalize()
  obj.position.copy(camera.position).addScaledVector(v, -camera.position.z / v.z)
  const fov = MathUtils.degToRad((camera as PerspectiveCamera).fov)
  const unitsPerPx = (2 * camera.position.z * Math.tan(fov / 2)) / size.height
  obj.scale.setScalar((r.height * unitsPerPx) / worldHeight)
}

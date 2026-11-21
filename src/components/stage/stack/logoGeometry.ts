import { ExtrudeGeometry, Path, Shape, type BufferGeometry, type Vector2 } from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { mergeGroups, toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Logo3D } from '../../../sections/stack/logos3d'

const COS_HALF_DEG = Math.cos(Math.PI / 360)

/** Simple Icons contours end ~0.001 short of their start and carry collinear runs: both make bevel spikes (3d-logos §3.2). */
function clean(pts: Vector2[], eps = 0.01) {
  const r = pts.filter((p, i) => p.distanceTo(pts[(i + pts.length - 1) % pts.length]) >= eps)
  return r.filter((p, i) => {
    const a = r[(i + r.length - 1) % r.length]
    const b = r[(i + 1) % r.length]
    const ux = p.x - a.x
    const uy = p.y - a.y
    const vx = b.x - p.x
    const vy = b.y - p.y
    return (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy)) < COS_HALF_DEG
  })
}

export interface LogoGeometry {
  /** Caps in group 0 (enamel), walls and bevel in group 1 (gold); SVG units, y down. */
  body: BufferGeometry
  /** The path's holes as recessed letters, when the mark asks for them. */
  inlay?: BufferGeometry
}

const cache = new Map<string, LogoGeometry>()

/** Extrudes a Simple Icons path with an inward bevel, so the silhouette stays exactly the published mark.
 *  Synchronous and cached; each build is timed as a `stack:logo3d:<id>` performance measure. */
export function logoGeometry(id: string, l: Logo3D): LogoGeometry {
  const hit = cache.get(id)
  if (hit) return hit
  const mark = `stack:logo3d:${id}`
  performance.mark(mark)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${l.path}"/></svg>`
  const shapes = new SVGLoader()
    .parse(svg)
    .paths.flatMap((p) => p.toShapes())
    .map((s) => {
      const { shape, holes } = s.extractPoints(8)
      const out = new Shape(clean(shape))
      out.holes = holes.map((h) => new Path(clean(h)))
      return out
    })
  const depth = 2
  const thick = Math.max(0.12, l.bevel * 1.6)
  const body = toCreasedNormals(
    new ExtrudeGeometry(shapes, { depth, steps: 1, curveSegments: 1, bevelEnabled: true, bevelSegments: 3, bevelSize: l.bevel, bevelThickness: thick, bevelOffset: -l.bevel }),
    Math.PI / 3, // in SVG units: it hashes positions on a 0.01 grid, so before any scaling
  )
  mergeGroups(body)
  body.computeBoundingBox()
  let inlay: BufferGeometry | undefined
  if (l.inlay) {
    const letters = shapes.flatMap((s) => s.holes.map((h) => new Shape(h.getPoints())))
    inlay = new ExtrudeGeometry(letters, { depth: depth + 2 * thick - 0.6, steps: 1, curveSegments: 1, bevelEnabled: false })
    inlay.translate(0, 0, -thick) // its face sits 0.6 units behind the enamel: engraved, not printed
  }
  const g = { body, inlay }
  cache.set(id, g)
  performance.measure(mark, mark)
  return g
}

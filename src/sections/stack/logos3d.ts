// Simple Icons 16.37.0 paths (CC0 1.0), 24 x 24 viewBox. Only the two marks whose licences allow changes
// (docs/DECISIONS.md → Legal): Angular (CC BY 4.0, Google) and the community JS logo (MIT). Their credit
// lines live in tech.ts. Data only: the 2D tiles draw these paths, the lazy 3D chunk extrudes them.

export interface Logo3D {
  path: string
  /** Enamel face colour (the gradient's first stop when there is one). */
  face: string
  /** Linear gradient over the 24-unit box, as fractions (Angular's official stops). */
  gradient?: { x1: number; y1: number; x2: number; y2: number; stops: readonly (readonly [number, string])[] }
  /** The path's holes come back as recessed letters in this colour (the JS letters are holes). */
  inlay?: string
  /** Inward bevel size in SVG units (3d-logos §2.2). */
  bevel: number
  /** Optical size factor, so marks of different ink coverage read the same size. */
  optical: number
}

export const LOGOS3D: Record<string, Logo3D> = {
  angular: {
    path: 'M16.712 17.711H7.288l-1.204 2.916L12 24l5.916-3.373-1.204-2.916ZM14.692 0l7.832 16.855.814-12.856L14.692 0ZM9.308 0 .662 3.999l.814 12.856L9.308 0Zm-.405 13.93h6.198L12 6.396 8.903 13.93Z',
    face: '#E40035',
    gradient: {
      x1: 0.2507,
      y1: 0.9093,
      x2: 0.9613,
      y2: 0.5518,
      stops: [
        [0, '#E40035'],
        [0.24, '#F60A48'],
        [0.352, '#F20755'],
        [0.494, '#DC087D'],
        [0.745, '#9717E7'],
        [1, '#6C00F5'],
      ],
    },
    bevel: 0.25,
    optical: 1.08,
  },
  javascript: {
    path: 'M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z',
    face: '#F7DF1E',
    inlay: '#101216',
    bevel: 0.22,
    optical: 0.85,
  },
}

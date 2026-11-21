/** CSS/SVG stand-in for the 3D core: shown until the canvas draws its first frame, and for good without WebGL.
 *  Our own drawing: a teal glow, a tilted rune ring with a tick dial, two hex rings with gem nodes and a faceted crystal. */
const hex = (r: number, rot: number, sy: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = ((i * 60 + rot) * Math.PI) / 180
    return `${(200 + r * Math.cos(a)).toFixed(1)},${(150 + r * Math.sin(a) * sy).toFixed(1)}`
  }).join(' ')

const RINGS = [hex(118, 12, 0.92), hex(140, -22, 0.84)]

export function Poster() {
  return (
    <div className="hx-poster">
      <svg viewBox="0 0 400 300" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="hx-poster-core" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#d3faf6" />
            <stop offset=".45" stopColor="#2fd0c4" stopOpacity=".85" />
            <stop offset="1" stopColor="#0a5f7e" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hx-poster-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2fd0c4" stopOpacity=".28" />
            <stop offset=".55" stopColor="#0e98ae" stopOpacity=".12" />
            <stop offset="1" stopColor="#2fd0c4" stopOpacity=".3" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="#c9a45a">
          <ellipse cx="200" cy="168" rx="176" ry="40" strokeWidth="1.4" />
          <ellipse cx="200" cy="168" rx="156" ry="34" stroke="#87672f" />
          <ellipse cx="200" cy="168" rx="185" ry="43" stroke="#87672f" strokeDasharray="1 5" />
          {RINGS.map((points) => (
            <polygon key={points} points={points} strokeWidth="1.2" />
          ))}
        </g>
        <g fill="#2fd0c4">
          {RINGS.flatMap((points) => points.split(' ')).map((xy) => {
            const [x, y] = xy.split(',').map(Number)
            return <path key={xy} d={`M${x} ${y - 4}l4 4-4 4-4-4Z`} />
          })}
        </g>
        <circle cx="200" cy="146" r="52" fill="url(#hx-poster-core)" />
        <g stroke="#2fd0c4" strokeOpacity=".7" strokeWidth="1">
          <path d="M200 46 234 82 250 126 240 186 200 250 160 186 150 126 166 82Z" fill="url(#hx-poster-glass)" />
          <path d="M200 46v204M166 82h68M150 126h100M160 186h80" fill="none" strokeOpacity=".35" />
        </g>
      </svg>
    </div>
  )
}

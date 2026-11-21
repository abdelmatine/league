import type { ReactElement } from 'react'
import type { LaneFilter } from './data'

// Our own role glyphs on a 24 px grid (work, not map positions): the lit part is currentColor,
// the rest sits at 40 %. Decorative; the controls that hold them carry the label.
const dim = { opacity: 0.4 }

const ROLE: Record<LaneFilter, ReactElement> = {
  all: <path d="M12 2.5 15.5 6 12 9.5 8.5 6Zm6 6 3.5 3.5-3.5 3.5-3.5-3.5Zm-12 0L9.5 12 6 15.5 2.5 12Zm6 6 3.5 3.5-3.5 3.5-3.5-3.5Z" />,
  frontend: (
    <>
      <path {...dim} d="M3 9h1.5v8.5h15V9H21v10H3Z" />
      <path d="M3 4.5h18V8H3Zm4 7h7v1.6H7Zm0 3h10v1.6H7Z" />
    </>
  ),
  backend: (
    <>
      <path {...dim} d="M3.5 3.5h17v5h-17Zm0 6h17v5h-17Zm0 6h17v5h-17Z" />
      <path d="M15.5 5.25h2.5v1.5h-2.5Zm0 6h2.5v1.5h-2.5Zm0 6h2.5v1.5h-2.5ZM6 5.25h6v1.5H6Z" />
    </>
  ),
  data: (
    <path d="M12 3c3.9 0 7 1.2 7 2.7S15.9 8.4 12 8.4 5 7.2 5 5.7 8.1 3 12 3ZM5 8.2v3.4c0 1.5 3.1 2.7 7 2.7s7-1.2 7-2.7V8.2c0 1.5-3.1 2.7-7 2.7S5 9.7 5 8.2Zm0 5.9v3.4c0 1.5 3.1 2.7 7 2.7s7-1.2 7-2.7v-3.4c0 1.5-3.1 2.7-7 2.7s-7-1.2-7-2.7Z" />
  ),
  mobile: (
    <>
      <path {...dim} fillRule="evenodd" d="M7.5 2h9A1.5 1.5 0 0 1 18 3.5v17a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20.5v-17A1.5 1.5 0 0 1 7.5 2Zm0 3v13h9V5Z" />
      <path d="M9 6.5h6v10H9Zm2 12.75h2v1.5h-2Z" />
    </>
  ),
  core: (
    <>
      <path {...dim} d="M12 9.25 14.75 12 12 14.75 9.25 12Z" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.5 4.5c-1.9 0-2.6 1-2.6 2.5v2.1c0 1.1-.6 1.9-2.1 2.4 1.5.5 2.1 1.3 2.1 2.4V16c0 1.5.7 2.5 2.6 2.5m7-14c1.9 0 2.6 1 2.6 2.5v2.1c0 1.1.6 1.9 2.1 2.4-1.5.5-2.1 1.3-2.1 2.4V16c0 1.5-.7 2.5-2.6 2.5"
      />
    </>
  ),
}

export function RoleGlyph({ role, className = '' }: { role: LaneFilter; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className={`cs-glyph ${className}`}>
      {ROLE[role]}
    </svg>
  )
}

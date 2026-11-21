import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'

// Spec §13: the game's and publisher's names stay out of titles, meta, headings and UI copy.
// Only the footer notice and the credits dialog (src/components/footer/) may name them.
const root = fileURLToPath(new URL('..', import.meta.url))
const BANNED = /League of Legends|\bLoL\b|\bRiot\b|Hextech/i
const exempt = [join(root, 'src', 'components', 'footer'), fileURLToPath(import.meta.url)]

it('keeps the banned names out of index.html, 404.html and src/', () => {
  const src = readdirSync(join(root, 'src'), { recursive: true, withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => join(d.parentPath, d.name))
  const files = [join(root, 'index.html'), join(root, 'public', '404.html'), ...src].filter((f) => !exempt.some((e) => f.startsWith(e)))
  expect(files.length).toBeGreaterThan(20)
  expect(files.filter((f) => BANNED.test(readFileSync(f, 'utf8'))).map((f) => relative(root, f))).toEqual([])
})

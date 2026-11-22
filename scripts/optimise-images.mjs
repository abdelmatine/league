// One-off image pass (L12/L16). Re-run it when a shown project or the profile photo changes:
//   npm install --no-save sharp@0.35.5 && node scripts/optimise-images.mjs
// then `git checkout -- package.json package-lock.json` if npm touched them. sharp is not a dependency.
//
// Emblems: each shown project's image framed for a round crest (plate colour behind transparent art,
// trimmed past white margins or padded for small marks), square, AVIF + WebP at 256 and 640 px
// (2x the banner crest and the dialog splash/gallery). The page derives the paths from the slug:
// /assets/projects/<slug>-<size>.<avif|webp> (src/sections/projects/Emblem.tsx); a unit test checks they exist.
import { mkdirSync } from 'node:fs'
import sharp from 'sharp'

const OUT = 'public/assets/projects'
const SIZES = [256, 640]
const WORK = 1280 // working canvas: every source is rendered square at this size first

// trim: % cut from each edge (zooms past margins); negative pads instead (small marks breathe).
// plate: colour behind the art; 'gold' is a light radial disc for dark marks on our navy crest.
const EMBLEMS = {
  electrocute: { src: 'public/assets/electrocute.png', plate: '#E3261C', trim: 3 },
  planify: { src: 'public/assets/cal.png', plate: '#2C4A5E', trim: 0 },
  'mondas-ol': { src: 'public/assets/mondas.png', plate: '#F5B800', trim: 5 },
  'zinine-gym': { src: 'public/assets/gym.jpg', plate: '#FFFFFF', trim: 15 },
  'glimmer-grace': { src: 'public/assets/glimmer.png', plate: '#FFFFFF', trim: 7 },
  vehicool: { src: 'public/icons/vehicool.svg', plate: 'gold', trim: -19 },
  'sam-medicale': { src: 'public/icons/sam.svg', plate: '#003D37', trim: 0 },
  mono: { src: 'public/icons/mono.svg', plate: '#4FD1D9', trim: 3 },
}

const goldDisc = (s) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><defs><radialGradient id="g" cx="50%" cy="38%" r="70%">` +
      `<stop offset="0" stop-color="#F3EAD6"/><stop offset=".62" stop-color="#D1B47C"/><stop offset="1" stop-color="#87672F"/></radialGradient></defs>` +
      `<rect width="${s}" height="${s}" fill="url(#g)"/></svg>`,
  )

async function source(file) {
  if (!file.endsWith('.svg')) return sharp(file)
  const { width = 24 } = await sharp(file).metadata() // SVG size at 72 dpi; render it crisp at WORK px
  return sharp(file, { density: Math.min(2400, (72 * WORK) / width) })
}

async function emblem(slug, { src, plate, trim }) {
  const art = await (await source(src)).resize(WORK, WORK, { fit: 'contain', background: '#0000' }).png().toBuffer()
  const cut = Math.round((WORK * Math.max(0, trim)) / 100)
  const pad = Math.round((WORK * Math.max(0, -trim)) / 100)
  let framed = sharp(art)
  if (cut) framed = framed.extract({ left: cut, top: cut, width: WORK - 2 * cut, height: WORK - 2 * cut })
  if (pad) framed = framed.extend({ top: pad, bottom: pad, left: pad, right: pad, background: '#0000' })
  const square = await framed.png().toBuffer()
  for (const size of SIZES) {
    const fg = await sharp(square).resize(size, size, { kernel: 'lanczos3' }).png().toBuffer()
    const bg = plate === 'gold' ? sharp(goldDisc(size)) : sharp({ create: { width: size, height: size, channels: 3, background: plate } })
    const flat = await bg.composite([{ input: fg }]).png().toBuffer()
    await sharp(flat).avif({ quality: 52, effort: 7 }).toFile(`${OUT}/${slug}-${size}.avif`)
    await sharp(flat).webp({ quality: 82, effort: 6 }).toFile(`${OUT}/${slug}-${size}.webp`)
  }
}

mkdirSync(OUT, { recursive: true })
for (const [slug, spec] of Object.entries(EMBLEMS)) await emblem(slug, spec)

// Profile photo: one WebP at 480 px wide covers the crests (display x zoom 1.6 x 2-3 dpr); the face crop stays in CSS.
mkdirSync('public/assets/profile', { recursive: true })
await sharp('public/assets/foto.jpg').resize({ width: 480 }).webp({ quality: 80, effort: 6 }).toFile('public/assets/profile/foto-480.webp')
console.log('done')

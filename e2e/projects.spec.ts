import { expect, test, type Page } from '@playwright/test'

// Banner probe, polled every frame into window.__banners (set it to {} to start over). Per slug: `first`, its opacity
// at first sight; `hidden` once seen at 0.5 or less; `shown`, when first seen above; `sy`, the smallest scaleY seen and
// `top`, its top edge then, from the row's top. Opacity counts every ancestor, so the row's reveal gate counts. Inject
// it before the lobby scrolls in.
const PROBE = `(() => {
  window.__banners = {}
  const opacity = (window.__opacity = (el) => (el ? +getComputedStyle(el).opacity * opacity(el.parentElement) : 1))
  const tick = () => {
    const row = document.querySelector('#projects .pj__row')?.getBoundingClientRect().top // no row yet: no banners either
    for (const b of document.querySelectorAll('#projects .pb')) {
      const o = opacity(b)
      const r = b.getBoundingClientRect()
      const sy = r.height / b.offsetHeight
      const s = (window.__banners[b.querySelector('.pb__link').dataset.slug] ??= { first: o, sy })
      if (s.shown === undefined) o > 0.5 ? (s.shown = performance.now()) : (s.hidden = true)
      if (sy <= s.sy) Object.assign(s, { sy, top: r.top - row })
    }
    requestAnimationFrame(tick)
  }
  tick()
})()`

type Seen = { first?: number; hidden?: boolean; shown?: number; sy?: number; top?: number }
/** Now: left edge, top edge from the row's top, opacity, computed transform, inline style names, has focus. */
type Now = { x: number; y: number; o: number; transform: string; inline: string[]; focused: boolean }
/** The shown lobby's banners, left to right: how each stands now, with what the probe saw of it. */
const banners = async (page: Page) =>
  (await page.evaluate(`(() => {
    const row = document.querySelector('#projects .pj__row').getBoundingClientRect().top
    return [...document.querySelectorAll('#projects .pb')]
      .map((b) => {
        const r = b.getBoundingClientRect()
        const now = { x: r.left, y: r.top - row, o: window.__opacity(b), transform: getComputedStyle(b).transform, inline: [...b.style], focused: b.contains(document.activeElement) }
        return { ...now, ...window.__banners[b.querySelector('.pb__link').dataset.slug] }
      })
      .sort((a, b) => a.x - b.x)
  })()`)) as (Seen & Now)[]
const allShown = (page: Page) =>
  expect.poll(async () => (await banners(page)).filter((b) => b.shown === undefined).length, { message: 'banners not shown yet' }).toBe(0)

test('the lobby pager works from the keyboard', async ({ page }) => {
  await page.goto('/')
  const lobby = page.locator('#projects')
  const dot = (n: number) => lobby.getByRole('button', { name: new RegExp(`^Lobby ${n} of`) })

  await lobby.getByRole('button', { name: 'Next lobby' }).focus()
  await expect(dot(1)).toHaveAttribute('aria-current', 'true')
  await page.keyboard.press('ArrowRight')
  await expect(dot(2)).toHaveAttribute('aria-current', 'true')
  await page.keyboard.press('ArrowLeft')
  await expect(dot(1)).toHaveAttribute('aria-current', 'true')

  // From a banner: its lobby leaves, so focus moves to the next lobby's first banner, the leftmost (DOM order is the
  // visual order; the motion test checks it on screen).
  const first = lobby.locator('.pb__link').first()
  const before = await first.getAttribute('data-slug')
  await first.focus()
  await page.keyboard.press('ArrowRight')
  await expect(dot(2)).toHaveAttribute('aria-current', 'true')
  await expect(first).toBeFocused()
  expect(await first.getAttribute('data-slug')).not.toBe(before)
})

test('a banner opens the detail panel; closing restores focus and the hash', async ({ page }) => {
  await page.goto('/')
  const link = page.locator('#projects [data-order="0"] .pb__link')
  const slug = await link.getAttribute('data-slug')
  const name = (await link.textContent()) ?? ''
  await link.focus()
  await page.keyboard.press('Enter')

  const dialog = page.getByRole('dialog', { name })
  await expect(dialog).toBeVisible()
  await expect(page).toHaveURL(new RegExp(`#projects/${slug}$`))
  await dialog.getByRole('tab', { name: 'Stack' }).click()
  await expect(dialog.getByRole('tabpanel', { name: 'Stack' })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(link).toBeFocused()
  await expect(page).not.toHaveURL(/#projects\//)
})

test('a cold load of #projects/<slug> opens that project', async ({ page }) => {
  await page.goto('/#projects/sam-medicale')
  const dialog = page.getByRole('dialog', { name: 'Sam Médicale' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('link', { name: /Visit live site/ })).toHaveAttribute('href', 'https://sammedicale.com.tn/')

  await dialog.getByRole('button', { name: 'Close' }).click()
  await expect(dialog).toBeHidden()
  await expect(page).toHaveURL(/#projects$/)
  await expect(page.locator('#projects [data-slug="sam-medicale"]')).toBeFocused()
})

test('an unknown or draft slug falls back to #projects', async ({ page }) => {
  await page.goto('/#projects/fixed-app')
  await expect(page).toHaveURL(/#projects$/)
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('reduced motion: every banner shows as soon as the lobby scrolls in, and on a lobby change', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(PROBE)
  await page.locator('#projects .pj__row').scrollIntoViewIfNeeded()
  await allShown(page)
  await page.getByRole('button', { name: 'Next lobby' }).click()
  await allShown(page)
  const seen = (await page.evaluate('Object.values(window.__banners)')) as Seen[]
  expect(seen.length).toBeGreaterThan(1) // both lobbies
  expect(seen.filter((s) => s.first !== 1 || s.hidden)).toEqual([]) // fully visible at first sight, never hidden
})

test.describe('with motion', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } })

  test('the banners unroll one at a time, left to right, on the reveal and on every lobby change', async ({ page, isMobile }) => {
    // Playwright's clock runs rAF, Date and performance.now in virtual time: a frame stalled by a busy machine
    // (parallel workers) can't shift the times the probe records.
    await page.clock.install()
    await page.goto('/')
    await expect(page.locator('#ld')).toHaveCount(0, { timeout: 10_000 })
    await page.evaluate(PROBE)
    await page.clock.pauseAt(Date.now() + 1_000)
    const restart = () => page.evaluate('window.__banners = {}')
    /** Once the sequence ends (about 1.5 s), every banner stands fully shown and unscaled, with nothing inline but
     *  its accent. Slow CI runners can start it a few frames late, so step the clock up to 4 s instead of one jump. */
    const settled = async () => {
      const done = (b: Now) => b.o === 1 && b.transform === 'none' && b.inline.length === 1
      await page.clock.runFor(1_500)
      let row = await banners(page)
      for (let t = 1_500; t < 4_000 && !row.every(done); t += 250) {
        await page.clock.runFor(250)
        row = await banners(page)
      }
      for (const b of row) expect(b, 'fully shown, nothing left inline').toMatchObject({ o: 1, transform: 'none', inline: ['--accent'] })
      return row
    }
    /** ...and each was hidden, then unrolled down from its top edge, about 0.25 s after the banner on its left. */
    const unrolled = async () => {
      const row = await settled()
      row.forEach((b, i) => {
        expect(b, 'hidden, then shown').toMatchObject({ hidden: true, shown: expect.any(Number) })
        expect(b.sy, 'unrolls from a fifth of its height').toBeCloseTo(0.2, 1)
        expect(b.top, 'with its top edge in place').toBeCloseTo(b.y, 0)
        if (!i) return
        const gap = b.shown! - row[i - 1].shown!
        expect(gap, 'after the banner on its left').toBeGreaterThanOrEqual(200)
        expect(gap, 'after the banner on its left').toBeLessThanOrEqual(300)
      })
      return row
    }

    // Lobby changes while the row still waits for its reveal (to lobby 2 and back): the reveal takes over from the
    // change's unroll, still running on lobby 1.
    for (const dot of [1, 0]) {
      await page.evaluate(`document.querySelectorAll('#projects .pj__dot')[${dot}].click()`)
      await page.clock.runFor(200)
    }
    await restart()
    await page.locator('#projects .pj__row').scrollIntoViewIfNeeded()
    expect((await unrolled()).length).toBe(isMobile ? 1 : 5)

    await restart()
    await page.getByRole('button', { name: 'Next lobby' }).click()
    await unrolled()

    // From a banner (on desktop, back to lobby 1's five): focus lands on the leftmost banner, the first to unroll, so
    // its ring shows within a few frames. The centre banner, which took focus before, unrolls third.
    await page.locator('#projects .pb__link').first().focus()
    await restart()
    const pressed = (await page.evaluate('performance.now()')) as number
    await page.keyboard.press('ArrowRight')
    const row = await unrolled()
    expect(row[0].focused, 'focus on the leftmost banner').toBe(true)
    expect(row[0].shown! - pressed, 'past half opacity').toBeLessThanOrEqual(100)

    // Rapid paging, 70 ms between changes: every banner still ends fully shown.
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'Next lobby' }).click()
      await page.clock.runFor(70)
    }
    await settled()
  })
})

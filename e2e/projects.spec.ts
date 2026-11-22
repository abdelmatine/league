import { expect, test, type Page } from '@playwright/test'

// Banner probe, polled every frame. Per slug: `first`, its opacity at first sight; `hidden` once seen at 0.5 or less;
// `shown`, when first seen above. Opacity counts every ancestor, so the row's reveal gate counts. Inject it before
// the lobby scrolls in.
const PROBE = `(() => {
  const seen = (window.__banners = {})
  const opacity = (el) => (el ? +getComputedStyle(el).opacity * opacity(el.parentElement) : 1)
  const tick = () => {
    for (const b of document.querySelectorAll('#projects .pb')) {
      const o = opacity(b)
      const s = (seen[b.querySelector('.pb__link').dataset.slug] ??= { first: o })
      if (s.shown === undefined) o > 0.5 ? (s.shown = performance.now()) : (s.hidden = true)
    }
    requestAnimationFrame(tick)
  }
  tick()
})()`

type Seen = { first?: number; hidden?: boolean; shown?: number }
/** The shown lobby's banners, left to right, with what the probe saw of each. */
const banners = async (page: Page) =>
  (await page.evaluate(
    `[...document.querySelectorAll('#projects .pb')].map((b) => ({ x: b.getBoundingClientRect().left, ...window.__banners[b.querySelector('.pb__link').dataset.slug] })).sort((a, b) => a.x - b.x)`,
  )) as (Seen & { x: number })[]
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

  // From a banner: its lobby leaves, so focus moves to the next lobby's first project.
  const first = lobby.locator('[data-order="0"] .pb__link')
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
    const unrolled = async () => {
      await page.clock.runFor(2_000)
      const row = await banners(page)
      row.forEach((b, i) => {
        expect(b, 'hidden, then shown').toMatchObject({ hidden: true, shown: expect.any(Number) })
        if (i) expect(b.shown! - row[i - 1].shown!, 'after the banner on its left').toBeGreaterThanOrEqual(150)
      })
      return row.length
    }
    await page.locator('#projects .pj__row').scrollIntoViewIfNeeded()
    expect(await unrolled()).toBe(isMobile ? 1 : 5)
    await page.getByRole('button', { name: 'Next lobby' }).click()
    await unrolled()
  })
})

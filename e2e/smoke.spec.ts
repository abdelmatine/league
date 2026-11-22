import { test, expect } from '@playwright/test'

test('page boots without errors and every section is there', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto('/')
  for (const id of ['home', 'projects', 'stack', 'contact']) await expect(page.locator(`#${id}`)).toBeAttached()
  expect(errors).toEqual([])
})

test('unknown path returns a real 404', async ({ page }) => {
  test.skip(!process.env.BASE_URL, 'vite preview serves index.html for every path; only Vercel serves 404.html')
  expect((await page.goto('/no-such-page'))?.status()).toBe(404)
})

test('nothing overflows the page width', async ({ page }) => {
  await page.goto('/')
  const width = page.viewportSize()!.width
  for (const id of ['home', 'about', 'projects', 'stack', 'contact']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded()
    // scrollWidth must fit clientWidth (the scrollbar gutter is excluded); phones also widen the
    // layout viewport to fit overflowing content, so innerWidth must still be the device width.
    const [scroll, client, inner] = (await page.evaluate('[document.documentElement.scrollWidth, document.documentElement.clientWidth, innerWidth]')) as number[]
    expect(scroll).toBeLessThanOrEqual(client)
    expect(inner).toBe(width)
  }
})

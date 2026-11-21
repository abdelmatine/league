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

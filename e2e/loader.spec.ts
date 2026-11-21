import { expect, test } from '@playwright/test'

const loader = '#ld'
const play = '.hx-play'

test('the loader fills, leaves on its own, and hands the PLAY plate over', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator(loader)).toHaveCount(0, { timeout: 10_000 })
  await expect(page.locator(play)).toHaveAttribute('data-state', 'play')
  expect(await page.evaluate(() => sessionStorage.getItem('ld'))).toBe('1')
})

test('any key press skips the loader', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Shift')
  await expect(page.locator(loader)).toHaveCount(0, { timeout: 1_500 })
  await expect(page.locator(play)).toHaveAttribute('data-state', 'play')
})

test('a same-session visit gets the short version', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator(loader)).toHaveCount(0, { timeout: 10_000 })
  const t0 = Date.now()
  await page.reload()
  await expect(page.locator('html')).toHaveClass(/ld-r/)
  await expect(page.locator(loader)).toHaveCount(0, { timeout: 2_000 })
  expect(Date.now() - t0).toBeLessThan(3_000)
})

test('the CSS failsafe reveals the page at 10 s when the app never loads', async ({ page }) => {
  test.setTimeout(30_000)
  await page.route(/\/(_app|src)\/.*\.(js|tsx?)(\?.*)?$/, (route) => route.abort())
  await page.goto('/')
  await expect(page.locator(loader)).toBeVisible()
  await expect(page.locator(loader)).toBeHidden({ timeout: 12_000 })
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  test('the loader is never shown', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator(loader)).toBeHidden()
  })
})

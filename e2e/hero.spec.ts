import { expect, test } from '@playwright/test'

test('without a hardware GPU the hero keeps its CSS poster and loads no 3D', async ({ page }) => {
  await page.goto('/') // Playwright's headless Chromium renders WebGL on SwiftShader: a software GPU
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/abdelmatine sfar/i)
  await expect(page.locator('.hx-poster')).toBeVisible()
  await expect(page.locator('.hx-stage canvas')).toHaveCount(0)
})

test('section frames build in once they scroll into view, and end fully visible', async ({ page }) => {
  await page.goto('/')
  const frame = page.locator('#about .hx-section__frame')
  await expect(frame).toHaveAttribute('data-reveal', 'armed')
  await frame.scrollIntoViewIfNeeded()
  await expect(frame).toHaveAttribute('data-reveal', 'done')
  await expect(frame).toHaveCSS('opacity', '1')
})

test('a pinned tier compiles the core and draws a first frame without errors', async ({ page }) => {
  test.setTimeout(90_000) // SwiftShader compiles and draws slowly
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => void (m.type() === 'error' && errors.push(m.text())))
  await page.goto('/?tier=mid') // ?tier= forces the 3D on any GPU: composer path (bloom, vignette, NEUTRAL)
  await expect(page.locator('html')).toHaveAttribute('data-stage', 'live', { timeout: 75_000 })
  await expect(page.locator('.hx-stage')).toHaveAttribute('data-tier', 'mid')
  expect(errors).toEqual([])
})

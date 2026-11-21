import { expect, test } from '@playwright/test'

test('stack: the grid is keyboard navigable and Enter selects', async ({ page }) => {
  await page.goto('/')
  await page.locator('#cs-t-nextjs').focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('#cs-t-react')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#cs-t-react')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('#cs-t-nextjs')).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator('.cs-plate__name')).toHaveText('React')
  await expect(page).toHaveURL(/#stack\/react$/)
})

test('stack: #stack/<id> selects the technology at load', async ({ page }) => {
  await page.goto('/#stack/spring-boot')
  await expect(page.locator('#cs-t-spring-boot')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('#stack')).toBeInViewport()
  await expect(page.getByRole('heading', { name: 'Projects with Spring Boot' })).toBeAttached()
})

test('stack: LOCK IN swaps the grid for the build sheet, Pick another brings it back', async ({ page }) => {
  await page.goto('/#stack/nextjs')
  await page.getByRole('button', { name: 'Lock in', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Built with Next.js' })).toBeVisible()
  await expect(page.locator('#cs-t-nextjs')).toHaveAttribute('data-locked', '')
  await expect(page.locator('.cs-msg')).toHaveText('Next.js locked in')
  await page.getByRole('button', { name: 'Pick another' }).click()
  await expect(page.locator('#cs-t-nextjs')).toBeFocused()
})

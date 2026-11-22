import { expect, test } from '@playwright/test'

test('About is the profile screen; Career and Achievements stay hidden while empty', async ({ page }) => {
  await page.goto('/')
  const about = page.locator('#about')
  await expect(about.getByRole('img', { name: /^Portrait of/ })).toBeVisible()
  await expect(about.locator('.ab-mains li')).toHaveCount(5)
  await expect(about.locator('.ab-stats li')).toHaveText([/Projects shipped/, /Technologies/, /Lanes covered/])
  await expect(about.getByRole('link', { name: /Download CV/ })).toHaveCount(0) // no cvUrl yet

  await expect(page.locator('#career')).toHaveCount(0)
  await expect(page.locator('#achievements')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Career', exact: true })).toHaveCount(0)
})

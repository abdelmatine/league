import { expect, test } from '@playwright/test'

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

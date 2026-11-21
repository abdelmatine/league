import { expect, test } from '@playwright/test'

const TABS = ['Home', 'Projects', 'Stack', 'Contact']

test('header tabs are keyboard reachable', async ({ page }) => {
  await page.goto('/')
  const menu = page.getByRole('button', { name: 'Open menu' })
  // Phones: the tabs live in the drawer behind the menu button.
  if (await menu.isVisible()) {
    await menu.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible()
  }
  const reached: string[] = []
  for (let i = 0; i < 12 && reached.length < TABS.length; i++) {
    await page.keyboard.press('Tab')
    const focused = page.locator('nav :focus')
    const name = (await focused.count()) ? (await focused.textContent())?.trim() : undefined
    if (name && TABS.includes(name) && !reached.includes(name)) reached.push(name)
  }
  expect(reached).toEqual(TABS)

  // Enter on the focused Contact tab brings the section into view.
  await page.keyboard.press('Enter')
  await expect(page.locator('#contact')).toBeInViewport()
})

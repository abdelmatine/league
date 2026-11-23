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

test('header: PLAY and the right-hand group never cover the tabs', async ({ page, isMobile }) => {
  test.skip(isMobile, 'phones show only PLAY and the menu button')
  await page.goto('/')
  for (const width of [768, 1024, 1280, 1366, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    // [space between PLAY and the tabs, space between the tabs and the first visible item on the right]
    const [left, right] = (await page.evaluate(`(() => {
      const box = (el) => el.getBoundingClientRect()
      const tabs = box(document.querySelector('.hx-nav ul'))
      const first = [...document.querySelector('.hx-header__right').children].find((el) => box(el).width > 0)
      return [tabs.left - box(document.querySelector('.hx-header__left')).right, box(first).left - tabs.right]
    })()`)) as number[]
    expect(left, `left gap at ${width}px`).toBeGreaterThanOrEqual(-0.5)
    expect(right, `right gap at ${width}px`).toBeGreaterThanOrEqual(-0.5)
  }
})

import { expect, test, type Page } from '@playwright/test'

// The contact flow. EmailJS is always stubbed with page.route: no test reaches the real service.
// The send paths need a build with EmailJS keys (fake ones are fine, the stub answers):
//   VITE_EMAILJS_SERVICE_ID=e2e_service VITE_EMAILJS_TEMPLATE_ID=e2e_template VITE_EMAILJS_PUBLIC_KEY=e2e_public PW_PORT=4184 npx playwright test e2e/contact.spec.ts
// A build without them covers the "not set up" state. Each test skips itself on the other kind of build,
// so a Vercel preview runs whichever half matches the keys the owner set.

const MESSAGE = 'Hello Abdelmatine, are you free for a call next week?'

async function setup(page: Page, status = 200) {
  const sent: { template_params?: Record<string, string> }[] = []
  await page.route('https://api.emailjs.com/**', async (route) => {
    sent.push(route.request().postDataJSON())
    await new Promise((r) => setTimeout(r, 200))
    await route.fulfill({ status, body: status === 200 ? 'OK' : 'Server error', headers: { 'access-control-allow-origin': '*' } })
  })
  // EmailJS's blockHeadless refuses automated browsers before sending anything, so the page must not know it is one.
  await page.addInitScript(() => Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false }))
  await page.goto('/')
  const configured = !(await page.locator('#contact-send').textContent())?.includes('not set up')
  return { sent, configured }
}

async function fill(page: Page) {
  await page.getByLabel('Your name').fill('Lena Moreau')
  await page.getByLabel('Email', { exact: true }).fill('lena@moreau.studio')
  await page.getByLabel('Message', { exact: true }).fill(MESSAGE)
}

const NO_KEYS = 'This build has no EmailJS keys: run it with the VITE_EMAILJS_* values above.'

test('by keyboard: validate, send, MATCH FOUND, ACCEPT, a toast that stays', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (m) => void (m.type() === 'error' && errors.push(m.text())))
  const { sent, configured } = await setup(page)
  test.skip(!configured, NO_KEYS)

  // Header PLAY scrolls here and puts focus in the name field.
  await page.locator('.hx-play').click()
  const name = page.getByLabel('Your name')
  await expect(name).toBeFocused()

  // Blur-first: the error shows once the field is left, and clears as soon as the value is fixed.
  await page.keyboard.type('L')
  await page.keyboard.press('Tab')
  await expect(name).toHaveAttribute('aria-invalid', 'true')
  await expect(name).toHaveAccessibleDescription('Use at least 2 characters.')
  await page.keyboard.press('Shift+Tab') // tabbing in selects the text: End keeps the L
  await page.keyboard.press('End')
  await page.keyboard.type('ena Moreau')
  await expect(name).not.toHaveAttribute('aria-invalid')
  await page.keyboard.press('Tab')
  await page.keyboard.type('lena@moreau.studio')
  await page.keyboard.press('Tab')
  await page.keyboard.type(MESSAGE)
  await page.keyboard.press('Tab')
  const send = page.locator('#contact-send')
  await expect(send).toBeFocused()
  await page.keyboard.press('Enter')

  // In queue: the header plate and the queue card.
  await expect(page.locator('.hx-play')).toHaveAttribute('data-state', 'queue')
  await expect(page.locator('.hx-qc')).toContainText('Finding match')

  // MATCH FOUND announces itself and takes focus on ACCEPT.
  const dialog = page.getByRole('alertdialog', { name: 'Match found' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveAccessibleDescription(/delivered to Abdelmatine Sfar's inbox/)
  await expect(dialog.getByRole('button', { name: 'Accept' })).toBeFocused()
  await page.keyboard.press('Enter')

  const toast = page.locator('.hx-toast', { hasText: 'Message delivered' })
  await expect(toast).toBeVisible()
  await expect(dialog).toBeHidden()
  expect(sent).toHaveLength(1)
  expect(sent[0].template_params).toEqual({ from_name: 'Lena Moreau', from_email: 'lena@moreau.studio', message: MESSAGE })

  // The form resets; SEND has focus again and shows the 2 minute cooldown; PLAY is back.
  await expect(page.getByLabel('Message', { exact: true })).toHaveValue('')
  await expect(send).toBeFocused()
  await expect(send).toHaveText(/Sent\s*\d:\d\d/)
  await expect(send).toHaveAttribute('aria-disabled', 'true')
  await expect(page.locator('.hx-play')).toHaveAttribute('data-state', 'play')

  // Persistent: still there after the 5 s a timed toast lives, gone once dismissed.
  await page.waitForTimeout(5500)
  await expect(toast).toBeVisible()
  await toast.getByRole('button', { name: 'Dismiss' }).click()
  await expect(toast).toBeHidden()
  expect(errors).toEqual([])
})

test('DECLINE closes the match; the message stays sent', async ({ page }) => {
  const { sent, configured } = await setup(page)
  test.skip(!configured, NO_KEYS)
  await fill(page)
  await page.locator('#contact-send').click()
  const dialog = page.getByRole('alertdialog', { name: 'Match found' })
  await dialog.getByRole('button', { name: 'Decline' }).click()
  await expect(dialog).toBeHidden()
  await expect(page.locator('#contact-note')).toContainText('Your message was already sent')
  await expect(page.locator('.hx-toast')).toHaveCount(0)
  await expect(page.locator('.hx-play')).toHaveAttribute('data-state', 'play')
  await expect(page.locator('#contact-send')).toBeFocused()
  expect(sent).toHaveLength(1)
})

test('a failed send keeps the text and says so', async ({ page }) => {
  const { configured } = await setup(page, 500)
  test.skip(!configured, NO_KEYS)
  await fill(page)
  await page.locator('#contact-send').click()
  await expect(page.locator('#contact-note')).toContainText('could not be sent')
  await expect(page.locator('.hx-toast', { hasText: 'Message not sent' })).toBeVisible()
  await expect(page.getByLabel('Message', { exact: true })).toHaveValue(MESSAGE)
  await expect(page.locator('#contact-send')).not.toHaveAttribute('aria-disabled')
  await expect(page.locator('.hx-play')).toHaveAttribute('data-state', 'play')
  await expect(page.getByRole('alertdialog')).toHaveCount(0)
})

test('without EmailJS keys the form says sending is not set up', async ({ page }) => {
  const { sent, configured } = await setup(page)
  test.skip(configured, 'This build has EmailJS keys.')
  const send = page.locator('#contact-send')
  await expect(send).toHaveText('Sending is not set up')
  await expect(send).toHaveAttribute('aria-disabled', 'true')
  const note = page.locator('#contact-note')
  await expect(note.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', /linkedin\.com/)
  await expect(note.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', /github\.com/)
  // Trying anyway (Enter in a field) sends nothing and fakes nothing.
  await fill(page)
  await page.getByLabel('Email', { exact: true }).press('Enter')
  await page.waitForTimeout(500)
  await expect(page.getByRole('alertdialog')).toHaveCount(0)
  await expect(page.locator('.hx-toast')).toHaveCount(0)
  expect(sent).toHaveLength(0)
})

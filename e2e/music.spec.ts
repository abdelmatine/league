import { expect, test, type Page } from '@playwright/test'

const MP3 = /\/sounds\/inqueue\.mp3$/
const NOTICE = `Abdelmatine Sfar · Portfolio was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.`

/** Desktop: the header button. Phones: the drawer row (the header keeps only the menu button). */
async function musicToggle(page: Page, isMobile: boolean) {
  if (!isMobile) return page.getByRole('button', { name: 'Music', exact: true })
  await page.getByRole('button', { name: 'Open menu' }).click()
  return page.getByRole('dialog', { name: 'Menu' }).getByRole('button', { name: /^Music/ })
}

test('music: nothing loads until the toggle is pressed, then it plays; pressing again stops it', async ({ page, isMobile }) => {
  const hits: string[] = []
  page.on('request', (r) => void (MP3.test(r.url()) && hits.push(r.url())))
  // Counts play() calls that started playback: the <audio> is never attached to the page, so its events cannot be watched.
  await page.addInitScript(`{
    const play = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function () {
      return play.call(this).then(() => void (window.musicPlays = (window.musicPlays ?? 0) + 1))
    }
  }`)
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  expect(hits).toEqual([])

  const toggle = await musicToggle(page, isMobile)
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await Promise.all([page.waitForRequest(MP3), toggle.click()])
  await expect.poll(() => page.evaluate('window.musicPlays')).toBe(1)
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
})

test('music: the footer and the credits carry the fan-policy notice and the music credit', async ({ page }) => {
  await page.goto('/')
  const footer = page.getByRole('contentinfo')
  await expect(footer).toContainText(NOTICE)
  await footer.getByRole('button', { name: 'Credits and legal' }).click()
  const credits = page.getByRole('dialog', { name: 'Credits and legal' })
  await expect(credits).toContainText(NOTICE)
  await expect(credits).toContainText(`In-queue music © Riot Games, used under Riot Games' "Legal Jibber Jabber" policy.`)
  await expect(credits).not.toContainText('no Riot Games assets are used')
})

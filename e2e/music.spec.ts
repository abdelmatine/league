import { expect, test, type Page } from '@playwright/test'

const MP3 = /\/sounds\/inqueue\.mp3$/
const NOTICE = `Abdelmatine Sfar · Portfolio was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.`

/** Desktop: the header button. Phones: the drawer row (the header keeps only the menu button). */
async function musicToggle(page: Page, isMobile: boolean) {
  if (!isMobile) return page.getByRole('button', { name: 'Music', exact: true })
  await page.getByRole('button', { name: 'Open menu' }).click()
  return page.getByRole('dialog', { name: 'Menu' }).getByRole('button', { name: /^Music/ })
}

/** Stands in for a tab switch: the page reads document.visibilityState on visibilitychange. */
const setVisibility = (page: Page, state: 'hidden' | 'visible') =>
  page.evaluate(`Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => '${state}' }); document.dispatchEvent(new Event('visibilitychange'))`)

test('music: loads only on the first press, loops, pauses with the tab, follows the media keys, stops on a second press', async ({ page, isMobile }) => {
  const hits: string[] = []
  page.on('request', (r) => void (MP3.test(r.url()) && hits.push(r.url())))
  // The <audio> is never attached to the page, so its events cannot be watched: the play() override keeps the element
  // and counts the calls that started playback. The setActionHandler wrapper keeps the media-key handlers.
  await page.addInitScript(`{
    const play = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function () {
      window.musicEl = this
      return play.call(this).then(() => void (window.musicPlays = (window.musicPlays ?? 0) + 1))
    }
    const setAction = MediaSession.prototype.setActionHandler
    MediaSession.prototype.setActionHandler = function (action, handler) {
      ;(window.mediaActions ??= {})[action] = handler
      return setAction.call(this, action, handler)
    }
  }`)
  await page.goto('/')
  const toggle = await musicToggle(page, isMobile)
  await expect(toggle).toBeVisible()
  expect(hits).toEqual([])
  expect(await page.evaluate(`performance.getEntriesByType('resource').some((e) => e.name.endsWith('/sounds/inqueue.mp3'))`)).toBe(false)

  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await Promise.all([page.waitForRequest(MP3), toggle.click()])
  await expect.poll(() => page.evaluate('window.musicPlays')).toBe(1)
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  expect(await page.evaluate('[musicEl.loop, musicEl.volume, musicEl.preload]')).toEqual([true, 0.35, 'none'])

  // A hidden tab pauses it and keeps it on; visible again resumes it.
  await setVisibility(page, 'hidden')
  expect(await page.evaluate('musicEl.paused')).toBe(true)
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await setVisibility(page, 'visible')
  await expect.poll(() => page.evaluate('window.musicPlays')).toBe(2)

  // Media keys and the browser's media controls go through the toggle.
  await page.evaluate('mediaActions.pause()')
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  expect(await page.evaluate('musicEl.paused')).toBe(true)
  await page.evaluate('mediaActions.play()')
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(() => page.evaluate('window.musicPlays')).toBe(3)

  // A second press stops it, and the next visit starts with it off.
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  expect(await page.evaluate('musicEl.paused')).toBe(true)
  await page.reload()
  await expect(await musicToggle(page, isMobile)).toHaveAttribute('aria-pressed', 'false')
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

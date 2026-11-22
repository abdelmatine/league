// Contact form rules. Each check returns an error message, or '' when the value is fine.
// Copy never blames the visitor and always says how to fix it.

export const NAME_MAX = 40
export const EMAIL_MAX = 254
export const MESSAGE_MIN = 10
export const MESSAGE_MAX = 1000

export function checkName(v: string) {
  const n = v.trim().length
  if (!n) return 'Add your name so I know who is writing.'
  if (n < 2) return 'Use at least 2 characters.'
  return n > NAME_MAX ? `Use ${NAME_MAX} characters or fewer.` : ''
}

export function checkEmail(v: string) {
  const s = v.trim()
  if (!s) return 'Add your email so I can reply.'
  return s.length <= EMAIL_MAX && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) ? '' : 'Use a full address, like name@mail.com.'
}

export function checkMessage(v: string) {
  const n = v.trim().length
  if (!n) return 'Write a short message first.'
  if (n < MESSAGE_MIN) return `A few more words, please (${MESSAGE_MIN - n} to go).`
  return n > MESSAGE_MAX ? `Keep it under ${MESSAGE_MAX} characters.` : ''
}

/** One message per 2 minutes, counted from the last send (kept in localStorage). */
export const COOLDOWN_MS = 120_000

/** Milliseconds until the next message may go out; 0 when free. A future timestamp (clock change) counts as just sent. */
export function cooldownLeft(lastSent: number, now: number, windowMs = COOLDOWN_MS) {
  if (!lastSent) return 0
  return Math.min(windowMs, Math.max(0, lastSent + windowMs - now))
}

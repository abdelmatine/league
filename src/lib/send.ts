import { COOLDOWN_MS } from './validate'

export interface EmailConfig {
  serviceId: string
  templateId: string
  publicKey: string
}
export interface Message {
  name: string
  email: string
  message: string
}
/** The three EmailJS keys (typed in vite-env.d.ts), or null when any is missing: the form then says sending is not set up. */
export function configFrom(env: Record<string, string | undefined>): EmailConfig | null {
  const serviceId = env.VITE_EMAILJS_SERVICE_ID?.trim()
  const templateId = env.VITE_EMAILJS_TEMPLATE_ID?.trim()
  const publicKey = env.VITE_EMAILJS_PUBLIC_KEY?.trim()
  return serviceId && templateId && publicKey ? { serviceId, templateId, publicKey } : null
}
export const emailConfig = configFrom(import.meta.env)

/** localStorage key of the last send. EmailJS's limitRate stores the attempt time under this id; the cooldown reads it. */
export const SENT_KEY = 'hx:contact'

export function lastSent() {
  try {
    return Number(localStorage.getItem(SENT_KEY)) || 0
  } catch {
    return 0 // storage blocked: no cooldown to show
  }
}

/** A failed send must not lock the visitor out: drop the attempt EmailJS recorded. */
export function forgetAttempt() {
  try {
    localStorage.removeItem(SENT_KEY)
  } catch {
    /* storage blocked: nothing was recorded */
  }
}

/** Sends through EmailJS; rejects on any failure. The SDK loads on first use, so it stays out of the first paint,
 *  and if it cannot load (it touches localStorage at import) the send fails instead of the page. */
export async function sendMessage(cfg: EmailConfig, m: Message) {
  const { send } = await import('@emailjs/browser')
  return send(
    cfg.serviceId,
    cfg.templateId,
    { from_name: m.name.trim(), from_email: m.email.trim(), message: m.message.trim() },
    { publicKey: cfg.publicKey, blockHeadless: true, limitRate: { id: SENT_KEY, throttle: COOLDOWN_MS } },
  )
}

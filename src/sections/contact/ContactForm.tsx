import type { FormEvent, ReactNode } from 'react'
import { MagicButton } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Frame } from '../../components/ui/Frame'
import type { useField } from '../../components/ui/useField'
import { profile } from '../../content/profile'
import { formatClock } from '../../lib/playState'
import { EMAIL_MAX, MESSAGE_MAX, NAME_MAX } from '../../lib/validate'

type FieldState = ReturnType<typeof useField>
export type Note = 'off' | 'fail' | 'declined' | 'lock' | 'bot'

function Social({ id }: { id: 'linkedin' | 'github' }) {
  const s = profile.socials.find((x) => x.id === id)
  return s ? (
    <a className="hx-link" href={s.url} target="_blank" rel="noopener noreferrer">
      {s.label}
    </a>
  ) : null
}

const NOTES: Record<Note, ReactNode> = {
  off: (
    <>
      Sending is not set up yet. Reach me on <Social id="linkedin" /> or <Social id="github" />.
    </>
  ),
  fail: (
    <>
      Your message could not be sent. <b>It is still here</b>: try again in a moment, or reach me on <Social id="linkedin" />.
    </>
  ),
  declined: (
    <>
      Match declined. <b>Your message was already sent</b>, so nothing is lost.
    </>
  ),
  lock: <>One message every 2 minutes. You can send another when the timer on the button runs out.</>,
  bot: (
    <>
      A hidden field was filled in, so this looks automated and was not sent. Reach me on <Social id="linkedin" /> instead.
    </>
  ),
}

/** Our own lobby wing beside SEND: gem at the button, a tapering gold blade outward. Drawn for the left side. */
const Wing = ({ right = false }) => (
  <svg className={`cx-wing${right ? ' cx-wing--r' : ''}`} viewBox="0 0 120 24" aria-hidden="true" focusable="false">
    <path className="cx-wing__line" d="M0 12h104" />
    <path className="cx-wing__blade" d="M104 9.6C78 10.4 40 11.4 8 12c32 .6 70 1.6 96 2.4l-3.5-2.4Z" />
    <path className="cx-wing__line" d="M103 6.8C82 5.2 62 4.4 42 4.2M103 17.2c-21 1.6-41 2.4-61 2.6" />
    <path className="cx-wing__stud" d="m40 4.2 2-2 2 2-2 2Zm0 15.6 2-2 2 2-2 2Z" />
    <path className="cx-wing__gem" d="m112 5.5 6.5 6.5-6.5 6.5-6.5-6.5Z" />
    <path className="cx-wing__core" d="m112 9 3 3-3 3-3-3Z" />
  </svg>
)

/** The framed form. SEND sits on the bottom edge between the wings; its label follows the flow. */
export function ContactForm(props: {
  fields: { name: FieldState; email: FieldState; message: FieldState }
  busy: boolean
  configured: boolean
  cooldown: number
  note: Note | null
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
}) {
  const { fields, busy, configured, cooldown, note, onSubmit } = props
  const { name, email, message } = fields
  // Blur-first, but tabbing past a field nobody has typed in is not an error yet.
  const blur = (f: FieldState) => () => {
    if (f.value || f.error) f.input.onBlur()
  }
  const state = !configured ? 'off' : busy ? 'queue' : cooldown > 0 ? 'sent' : 'send'
  const on = (s: string) => (state === s ? '' : undefined)
  return (
    <Frame corners className="cx-form" data-reveal="">
      <form noValidate aria-labelledby="contact-form-title" onSubmit={onSubmit}>
        <header className="cx-form__head">
          <h3 id="contact-form-title" className="cx-form__title">
            Direct message
          </h3>
          <p className="cx-form__to">To {profile.name}</p>
        </header>
        <div className="cx-form__grid">
          <Field id="contact-name" label="Your name" name="name" autoComplete="name" maxLength={NAME_MAX} placeholder="What should I call you?" readOnly={busy} {...name.input} onBlur={blur(name)} />
          <Field id="contact-email" label="Email" name="email" type="email" autoComplete="email" maxLength={EMAIL_MAX} placeholder="name@domain.com" readOnly={busy} {...email.input} onBlur={blur(email)} />
          <div className="cx-msg">
            <Field id="contact-message" multiline label="Message" name="message" maxLength={MESSAGE_MAX} placeholder="The project, the role or the idea. A few lines is enough." readOnly={busy} {...message.input} onBlur={blur(message)} />
            <span className="cx-count" data-near={message.value.length > MESSAGE_MAX * 0.9 ? '' : undefined}>
              {message.value.length} / {MESSAGE_MAX}
            </span>
          </div>
        </div>
        {/* Honeypot: hidden from people and assistive tech; form-filling bots fill it in. */}
        <div className="cx-hp" aria-hidden="true">
          <label htmlFor="contact-website">Leave this empty</label>
          <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <div className="cx-actions">
          <Wing />
          <MagicButton type="submit" size="lg" id="contact-send" className="cx-send" aria-disabled={state !== 'send' || undefined} aria-describedby="contact-note">
            {state === 'off' ? (
              'Sending is not set up'
            ) : (
              <span className="cx-send__stack">
                <span data-on={on('send')}>Send</span>
                <span data-on={on('queue')}>In queue</span>
                <span data-on={on('sent')}>
                  Sent <b className="cx-send__timer">{formatClock(cooldown + 999)}</b>
                </span>
              </span>
            )}
          </MagicButton>
          <Wing right />
        </div>
        <output id="contact-note" className="cx-note" aria-live="polite">
          {note && NOTES[note]}
        </output>
      </form>
    </Frame>
  )
}

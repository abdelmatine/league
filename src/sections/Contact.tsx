import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useField } from '../components/ui/useField'
import { profile } from '../content/profile'
import { DUR, frameBuildIn, gsap, prefersReducedMotion, ScrollTrigger, splitReveal, useGSAP } from '../lib/motion'
import { playStore } from '../lib/playStore'
import { emailConfig, forgetAttempt, lastSent, sendMessage } from '../lib/send'
import { sfx } from '../lib/sfx'
import { push } from '../lib/toast'
import { checkEmail, checkMessage, checkName, cooldownLeft } from '../lib/validate'
import { Banners, type VisitorStatus } from './contact/Banners'
import { ContactForm, type Note } from './contact/ContactForm'
import { ReadyCheck, type Result } from './contact/ReadyCheck'
import { Socials } from './contact/Socials'
import './contact/contact.css'

/** The queue shows for at least this long, even when EmailJS answers sooner. */
const MIN_QUEUE_MS = 1200
const FIELD_IDS = ['contact-name', 'contact-email', 'contact-message']
const FIRST_NAME = profile.name.split(' ')[0]
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Time left before the next message may go out; re-renders on each second while it runs. */
function useCooldown() {
  const [now, setNow] = useState(Date.now)
  const left = cooldownLeft(lastSent(), now)
  useEffect(() => {
    if (!left) return
    const t = setTimeout(() => setNow(Date.now()), left % 1000 || 1000)
    return () => clearTimeout(t)
  }, [left])
  return left
}

/** Section entrance (once, at 20% in view): title, banners drop, the form frame builds, wings unfold, socials slide in. */
function reveal(root: HTMLElement, armed: HTMLElement[]) {
  const q = (s: string) => gsap.utils.toArray<HTMLElement>(s, root)
  const form = q('.cx-form')[0]
  if (prefersReducedMotion()) {
    armed.forEach((el) => (el.dataset.reveal = 'done'))
    return void gsap.fromTo(armed, { opacity: 0 }, { opacity: 1, duration: DUR.base, ease: 'glow' })
  }
  const [eyebrow, title, sub] = q('.cx-intro > *')
  const banners = q('.bn')
  gsap
    .timeline({ defaults: { ease: 'settle' } })
    .fromTo(eyebrow, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.5 }, 0.05)
    .add(splitReveal(title), 0.1)
    .fromTo(sub, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5 }, 0.32)
    .fromTo(banners, { opacity: 0, y: -40, scaleY: 0.92, transformOrigin: '50% 0%' }, { opacity: 1, y: 0, scaleY: 1, duration: 0.5, stagger: 0.12, clearProps: 'transform' }, 0.15)
    .fromTo(q('.bn__flash'), { opacity: 1, scale: 0.6 }, { opacity: 0, scale: 1.4, duration: 0.4, ease: 'power2.out', stagger: 0.12 }, 0.62)
    .call(() => banners.forEach((b) => b.classList.add('is-sweep')), [], 0.7)
    .call(() => banners.forEach((b) => b.classList.remove('is-sweep')), [], 2.4)
    .add(frameBuildIn(form), 0.24)
    // clip-path works in local space, so the mirrored right wing unfolds outwards too
    .fromTo(q('.cx-wing'), { clipPath: 'inset(-30% 100% -30% -10%)' }, { clipPath: 'inset(-30% -10% -30% -10%)', duration: 0.6, clearProps: 'clipPath' }, 0.8)
    .fromTo(q('.cx-social'), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'none' }, 0.4)
    .fromTo(q('.cx-row'), { opacity: 0, x: 10 }, { opacity: 1, x: 0, duration: 0.45, stagger: 0.05, clearProps: 'transform' }, 0.55)
  // the tweens' start values now hold each part hidden until it plays
  for (const el of armed) if (el !== form) el.dataset.reveal = 'done'
}

/** Contact: SEND sends first (EmailJS), with the header in queue; MATCH FOUND then confirms delivery.
 *  ACCEPT leaves a persistent toast; DECLINE or the ring running out just close (the message stays sent). */
export function Contact() {
  const ref = useRef<HTMLElement>(null)
  const name = useField(checkName)
  const email = useField(checkEmail)
  const message = useField(checkMessage)
  const [phase, setPhase] = useState<'idle' | 'queue' | 'found'>('idle')
  const [note, setNote] = useState<Note | null>(emailConfig ? null : 'off')
  const cooldown = useCooldown()
  const ready = name.valid && email.valid && message.valid
  const status: VisitorStatus = phase !== 'idle' ? phase : cooldown > 0 && !message.value ? 'sent' : ready ? 'ready' : 'idle'

  useGSAP(
    (_, contextSafe) => {
      const root = ref.current
      if (!root || !contextSafe) return
      const armed = gsap.utils.toArray<HTMLElement>('[data-reveal]', root) // any value: StrictMode runs this twice
      armed.forEach((el) => (el.dataset.reveal = 'armed'))
      ScrollTrigger.create({ trigger: root, start: 'top 80%', once: true, onEnter: contextSafe(() => reveal(root, armed)) })
    },
    { scope: ref },
  )

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (phase !== 'idle' || !emailConfig) return
    const bad = [name, email, message].map((f) => f.check()).indexOf(false)
    if (bad >= 0) {
      document.getElementById(FIELD_IDS[bad])?.focus()
      if (!prefersReducedMotion()) gsap.fromTo(e.currentTarget.parentElement, { x: 0 }, { keyframes: { x: [0, -6, 6, -4, 4, 0] }, duration: 0.25, ease: 'none', clearProps: 'transform' })
      return
    }
    if (new FormData(e.currentTarget).get('website')) return setNote('bot')
    if (cooldown > 0) return setNote('lock')
    setNote(null)
    setPhase('queue')
    playStore.dispatch({ type: 'queue', at: Date.now() })
    sfx.play('queue')
    const sending = sendMessage(emailConfig, { name: name.value, email: email.value, message: message.value }).then(
      () => 'sent' as const,
      (err: { status?: number }) => (err?.status === 429 ? ('limited' as const) : ('failed' as const)), // 429: EmailJS's limitRate (another tab sent one)
    )
    const [result] = await Promise.all([sending, wait(MIN_QUEUE_MS)])
    if (result === 'sent') {
      playStore.dispatch({ type: 'found', at: Date.now() })
      sfx.play('matchFound')
      setPhase('found')
      return
    }
    playStore.dispatch({ type: 'cancel' })
    setPhase('idle')
    if (result === 'limited') return setNote('lock')
    forgetAttempt()
    setNote('fail')
    push({ title: 'Message not sent', text: 'Your text is still in the form. Try again in a moment.', tone: 'error' })
  }

  const onResult = (r: Result) => {
    playStore.dispatch({ type: r === 'accepted' ? 'accept' : r === 'declined' ? 'decline' : 'timeout' })
    sfx.play(r === 'declined' ? 'decline' : 'accept')
  }

  const onClosed = (r: Result) => {
    setPhase('idle')
    for (const f of [name, email, message]) f.reset() // delivered, whatever the choice
    if (r === 'declined') setNote('declined')
    else {
      playStore.dispatch({ type: 'reset' })
      push({ title: 'Message delivered', text: `It is in ${FIRST_NAME}'s inbox. Thanks for reaching out.`, icon: 'mail', persistent: true })
    }
    document.getElementById('contact-send')?.focus()
  }

  return (
    <section ref={ref} id="contact" tabIndex={-1} aria-labelledby="contact-title" className="cx">
      <div className="cx__inner">
        <header className="cx-intro" data-reveal="">
          <p className="hx-eyebrow cx-eyebrow">Contact</p>
          <h2 id="contact-title" className="hx-h2 cx-title">
            Queue a message
          </h2>
          <ul className="cx-sub">
            <li>1v1</li>
            <li>Direct inbox</li>
            <li>No sign-up</li>
          </ul>
        </header>
        <div className="cx-lobby">
          <Banners name={name.value} checks={{ name: name.valid, mail: email.valid, message: message.valid }} status={status} />
          <ContactForm fields={{ name, email, message }} busy={phase !== 'idle'} configured={!!emailConfig} cooldown={cooldown} note={note} onSubmit={submit} />
        </div>
        <Socials />
      </div>
      <ReadyCheck open={phase === 'found'} onResult={onResult} onClosed={onClosed} />
    </section>
  )
}

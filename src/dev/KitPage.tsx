import { useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { GoldButton, MagicButton } from '../components/ui/Button'
import { Counter } from '../components/ui/Counter'
import { Crest } from '../components/ui/Crest'
import { Dialog } from '../components/ui/Dialog'
import { Divider } from '../components/ui/Divider'
import { Field } from '../components/ui/Field'
import { Frame } from '../components/ui/Frame'
import { Icon } from '../components/ui/Icon'
import { glyphs, type IconName } from '../components/ui/glyphs'
import { TabPanel, Tabs } from '../components/ui/Tabs'
import { ToastRegion } from '../components/ui/Toast'
import { Tooltip } from '../components/ui/Tooltip'
import { useField } from '../components/ui/useField'
import { counterUp, frameBuildIn, splitReveal } from '../lib/motion'
import { CUES, sfx, type Cue } from '../lib/sfx'
import { push } from '../lib/toast'

// Dev-only component sheet (open /?kit with `npm run dev`). main.tsx imports it behind import.meta.env.DEV.

const palette = {
  ink: ['950', '900', '800', '700'],
  gold: ['50', '200', '300', '500', '700'],
  teal: ['100', '300', '500', '700', '900'],
  stone: ['200', '400', '600'],
  ruby: ['400'],
  jade: ['400'],
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-5">
      <h2 className="hx-h3">{title}</h2>
      {children}
    </section>
  )
}

const Cap = ({ children }: { children: ReactNode }) => <span className="hx-eyebrow text-stone-400">{children}</span>

function Spec({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid justify-items-start gap-2">
      {children}
      <Cap>{label}</Cap>
    </div>
  )
}

const tabItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'stack', label: 'Stack' },
  { id: 'gallery', label: 'Gallery' },
]

function TabsDemo() {
  const [tab, setTab] = useState('overview')
  return (
    <Frame className="grid gap-4 p-6">
      <Tabs label="Project detail" idBase="kit-tabs" items={tabItems} value={tab} onChange={setTab} />
      {tabItems.map((t) => (
        <TabPanel key={t.id} idBase="kit-tabs" id={t.id} value={tab} className="text-small">
          {t.label} panel. Focus a tab, then use the arrow keys, Home and End.
        </TabPanel>
      ))}
    </Frame>
  )
}

const required = (v: string) => (v.trim() ? '' : 'Please add your name.')
const email = (v: string) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please check the address: it needs a name, an @ and a domain.')

function FieldDemo() {
  const name = useField(required)
  const mail = useField(email)
  return (
    <Frame className="p-6">
      <form
        className="grid gap-x-6 gap-y-2 md:grid-cols-2"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          if ([name.check(), mail.check()].every(Boolean)) push({ title: 'Valid', text: 'Both fields pass.' })
        }}
      >
        <Field label="Name" placeholder="What should I call you?" autoComplete="off" {...name.input} />
        <Field label="Email" type="email" placeholder="name@domain.com" autoComplete="off" {...mail.input} />
        <Field label="Message" multiline className="md:col-span-2" placeholder="Blur-first: errors wait for you to leave a field." hint="Static hint text sits in the reserved line." />
        <Field label="Disabled" disabled defaultValue="Read only" />
        <div className="flex items-start md:justify-end">
          <MagicButton type="submit">Send</MagicButton>
        </div>
      </form>
    </Frame>
  )
}

function FeedbackDemo() {
  const [dialog, setDialog] = useState(false)
  const [alert, setAlert] = useState(false)
  return (
    <Frame className="flex flex-wrap gap-4 p-6">
      <GoldButton onClick={() => push({ title: 'Link copied', text: 'Closes after 5 seconds.' })}>Timed toast</GoldButton>
      <GoldButton onClick={() => push({ title: 'Message delivered', text: 'Stays until you close it.', icon: 'mail', persistent: true })}>Persistent toast</GoldButton>
      <GoldButton onClick={() => push({ title: 'Not sent', text: 'Your text is still in the form.', tone: 'error' })}>Error toast</GoldButton>
      <GoldButton onClick={() => setDialog(true)}>Dialog</GoldButton>
      <MagicButton onClick={() => setAlert(true)}>Alert dialog</MagicButton>
      <Dialog open={dialog} onClose={() => setDialog(false)} title="Credits and legal" actions={<GoldButton onClick={() => setDialog(false)}>Close</GoldButton>}>
        <p className="max-w-[60ch]">Native dialog: Esc closes, focus returns to the button that opened it, a full-screen sheet below 768 px.</p>
      </Dialog>
      <Dialog
        open={alert}
        onClose={() => setAlert(false)}
        role="alertdialog"
        describedBy="kit-alert-desc"
        title="Match found"
        actions={
          <>
            <MagicButton onClick={() => setAlert(false)}>Accept</MagicButton>
            <GoldButton onClick={() => setAlert(false)}>Decline</GoldButton>
          </>
        }
      >
        <p id="kit-alert-desc">An alertdialog: no close button, backdrop clicks ignored, Esc declines.</p>
      </Dialog>
    </Frame>
  )
}

function IdentityDemo() {
  return (
    <Frame className="grid gap-8 p-6">
      <div className="flex flex-wrap items-center gap-8">
        <Crest size="sm" initials="AS" xp={0.3} />
        <Crest src="/assets/foto.jpg" focus="54% 32%" zoom={1.6} xp={0.6} />
        <Crest size="lg" src="/assets/foto.jpg" alt="Portrait" focus="54% 32%" zoom={1.6} xp={0.8} level={8} levelLabel="8 projects" />
      </div>
      <div className="flex flex-wrap items-center gap-8">
        <Counter icon="hex" value={8} label="Projects" />
        <Counter icon="crystal" value={18} label="Technologies" className="text-teal-300" />
      </div>
      <div className="flex flex-wrap items-center gap-8 pt-10">
        <Tooltip content="Shows after 150 ms on hover or keyboard focus. Esc hides it.">
          <GoldButton>Tooltip top</GoldButton>
        </Tooltip>
        <Tooltip side="bottom" content="Bottom side.">
          <GoldButton>Tooltip bottom</GoldButton>
        </Tooltip>
      </div>
    </Frame>
  )
}

function MotionDemo() {
  const title = useRef<HTMLHeadingElement>(null)
  const frames = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  return (
    <Frame className="grid gap-6 p-6">
      <h3 ref={title} className="hx-h2">
        Abdelmatine Sfar
      </h3>
      <div ref={frames} className="grid gap-6 sm:grid-cols-3">
        {['One', 'Two', 'Three'].map((n) => (
          <Frame key={n} corners className="grid h-24 place-items-center">
            <Cap>{n}</Cap>
          </Frame>
        ))}
      </div>
      <p className="hx-num text-h2 text-gold-200">
        <span ref={count}>8</span>
      </p>
      <div className="flex flex-wrap gap-4">
        <GoldButton onClick={() => title.current && splitReveal(title.current)}>Replay title</GoldButton>
        <GoldButton onClick={() => frames.current?.querySelectorAll<HTMLElement>('.hx-frame').forEach((f, i) => frameBuildIn(f, { delay: i * 0.08 }))}>Replay frames</GoldButton>
        <GoldButton onClick={() => count.current && counterUp(count.current, 8)}>Replay counter</GoldButton>
      </div>
    </Frame>
  )
}

function SoundDemo() {
  const on = useSyncExternalStore(sfx.subscribe, sfx.isEnabled)
  return (
    <Frame className="flex flex-wrap items-center gap-4 p-6">
      <GoldButton aria-pressed={on} onClick={() => sfx.setEnabled(!on)}>
        <Icon name={on ? 'sound-on' : 'sound-off'} className="size-4" /> Sound {on ? 'on' : 'off'}
      </GoldButton>
      {(Object.keys(CUES) as Cue[]).map((c) => (
        <GoldButton key={c} disabled={!on} onClick={() => sfx.play(c)}>
          {c}
        </GoldButton>
      ))}
    </Frame>
  )
}

export default function KitPage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-16 px-4 py-12 md:px-8">
      <header className="grid gap-3">
        <p className="hx-eyebrow">Dev only · not in the production bundle</p>
        <h1 className="hx-hero hx-gold-text">UI kit</h1>
        <p className="max-w-[68ch]">Tokens and components of the portfolio client look. Every ornament is drawn in CSS or inline SVG.</p>
      </header>

      <Section title="Palette">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(palette).map(([ramp, steps]) => (
            <div key={ramp} className="grid gap-2">
              {steps.map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <span className="size-8 border border-gold-700" style={{ background: `var(--color-${ramp}-${s})` }} />
                  <span className="text-small">
                    {ramp}-{s}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type">
        <Frame className="grid gap-4 p-6">
          <p className="hx-eyebrow">Eyebrow · body 600 · 12/16</p>
          <p className="hx-hero">Hero 0123</p>
          <h3 className="hx-h2">Section heading</h3>
          <h4 className="hx-h3">Sub heading · 20–22</h4>
          <p className="max-w-[68ch]">
            Body 16/26. Software engineer building web and mobile products, from the database to the last pixel. Sentences stay under 68 characters per line.
          </p>
          <p className="text-small text-stone-400">Small 14/20, muted.</p>
          <p className="hx-num text-h2 text-gold-200">8 · 18 · 0:42</p>
        </Frame>
      </Section>

      <Section title="Frame">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Frame className="grid h-32 place-items-center">
            <Cap>Gold · top anchor</Cap>
          </Frame>
          <Frame corners className="grid h-32 place-items-center">
            <Cap>Corner gems</Cap>
          </Frame>
          <Frame tone="dim" className="grid h-32 place-items-center">
            <Cap>Dim</Cap>
          </Frame>
          <Frame anchor="bottom" className="grid h-32 place-items-center">
            <Cap>Bottom anchor</Cap>
          </Frame>
          <Frame anchor="left" corners className="grid h-32 place-items-center">
            <Cap>Left anchor</Cap>
          </Frame>
          <Frame anchor="right" tone="dim" corners className="grid h-32 place-items-center">
            <Cap>Right · dim · gems</Cap>
          </Frame>
        </div>
      </Section>

      <Section title="Buttons">
        <Frame className="grid gap-8 p-6">
          <div className="flex flex-wrap items-end gap-6">
            <Spec label="Gold · idle">
              <GoldButton>Contact</GoldButton>
            </Spec>
            <Spec label="Hover">
              <GoldButton data-force="hover" tabIndex={-1}>
                Contact
              </GoldButton>
            </Spec>
            <Spec label="Pressed">
              <GoldButton data-force="active" tabIndex={-1}>
                Contact
              </GoldButton>
            </Spec>
            <Spec label="Disabled">
              <GoldButton disabled>Contact</GoldButton>
            </Spec>
            <Spec label="Link">
              <GoldButton href="#top">
                GitHub <Icon name="external" className="size-4" />
              </GoldButton>
            </Spec>
          </div>
          <div className="flex flex-wrap items-end gap-6">
            <Spec label="Magic · idle">
              <MagicButton>Lock in</MagicButton>
            </Spec>
            <Spec label="Hover">
              <MagicButton data-force="hover" tabIndex={-1}>
                Lock in
              </MagicButton>
            </Spec>
            <Spec label="Pressed">
              <MagicButton data-force="active" tabIndex={-1}>
                Lock in
              </MagicButton>
            </Spec>
            <Spec label="Disabled">
              <MagicButton disabled>Lock in</MagicButton>
            </Spec>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <MagicButton size="lg">View projects</MagicButton>
            <GoldButton size="lg">Contact</GoldButton>
          </div>
        </Frame>
      </Section>

      <Section title="Divider">
        <Frame className="p-6">
          <Divider />
          <Divider short />
        </Frame>
      </Section>

      <Section title="Icons">
        <Frame className="grid grid-cols-3 gap-4 p-6 sm:grid-cols-6 lg:grid-cols-8">
          {(Object.keys(glyphs) as IconName[]).map((n) => (
            <div key={n} className="grid justify-items-center gap-2 text-gold-200">
              <Icon name={n} className="size-6" />
              <span className="text-label text-stone-400">{n}</span>
            </div>
          ))}
        </Frame>
      </Section>

      <Section title="Tabs">
        <TabsDemo />
      </Section>

      <Section title="Field">
        <FieldDemo />
      </Section>

      <Section title="Toast and dialog">
        <FeedbackDemo />
      </Section>

      <Section title="Crest, counter, tooltip">
        <IdentityDemo />
      </Section>

      <Section title="Motion">
        <MotionDemo />
      </Section>

      <Section title="Sound">
        <SoundDemo />
      </Section>

      <Section title="Build-in on scroll">
        <Frame buildIn corners className="grid h-40 place-items-center">
          <Cap>Builds in when 20% into view</Cap>
        </Frame>
      </Section>
      <ToastRegion />
    </main>
  )
}

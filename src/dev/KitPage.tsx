import type { ReactNode } from 'react'
import { GoldButton, MagicButton } from '../components/ui/Button'
import { Divider } from '../components/ui/Divider'
import { Frame } from '../components/ui/Frame'
import { Icon } from '../components/ui/Icon'
import { glyphs, type IconName } from '../components/ui/glyphs'

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
    </main>
  )
}

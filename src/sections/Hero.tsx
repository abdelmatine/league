import { useRef } from 'react'
import { GoldButton, MagicButton } from '../components/ui/Button'
import { Divider } from '../components/ui/Divider'
import { profile } from '../content/profile'
import { useGSAP } from '../lib/motion'
import { onAnchorClick } from '../lib/scroll'
import { useStageScene } from '../lib/stageStore'
import { heroIntro, heroScroll } from './hero/motion'
import { Poster } from './hero/Poster'
import './hero/hero.css'

/** Hero. The whole section is the 'home' stage anchor (the canvas renders while any of it is on screen);
 *  the core sits on the [data-core] box, with the CSS poster underneath until the canvas draws.
 *  Everything is readable without JS; the entrance and the scroll pull-back are layered on top. */
export function Hero() {
  const section = useRef<HTMLElement>(null)
  const copy = useRef<HTMLDivElement>(null)
  useStageScene('home', section)
  useGSAP(
    () => {
      heroScroll(section.current!, copy.current!)
      heroIntro(section.current!)
    },
    { scope: section },
  )
  return (
    <section ref={section} id="home" tabIndex={-1} aria-labelledby="home-title" className="hx-hero-section">
      <div className="hx-hero-section__core" data-core aria-hidden="true">
        <Poster />
      </div>
      <div ref={copy} className="hx-hero-copy">
        <h1 id="home-title" className="hx-hero hx-gold-text hx-hero-name">
          {profile.name}
        </h1>
        <Divider className="hx-hero-section__rule" />
        <p className="hx-hero-section__title">
          {profile.title.map((part, i, all) => (
            <span key={part}>
              {part}
              {i < all.length - 1 && (
                <>
                  <span className="sr-only">, </span>
                  <i aria-hidden="true" />
                </>
              )}
            </span>
          ))}
        </p>
        <div className="hx-hero-section__ctas">
          <MagicButton size="lg" href="#projects" onClick={(e) => onAnchorClick(e, 'projects')}>
            View projects
          </MagicButton>
          <GoldButton size="lg" href="#contact" onClick={(e) => onAnchorClick(e, 'contact')}>
            Contact
          </GoldButton>
        </div>
      </div>
      <a className="hx-cue" href="#about" aria-label="Scroll to About" onClick={(e) => onAnchorClick(e, 'about')}>
        Scroll
        <span className="hx-cue__track" aria-hidden="true" />
      </a>
    </section>
  )
}

import { useRef } from 'react'
import { GoldButton, MagicButton } from '../components/ui/Button'
import { Divider } from '../components/ui/Divider'
import { profile } from '../content/profile'
import { onAnchorClick } from '../lib/scroll'
import { useStageScene } from '../lib/stageStore'
import { Poster } from './hero/Poster'
import './hero/hero.css'

/** Hero. The whole section is the 'home' stage anchor (the canvas renders while any of it is on screen);
 *  the core sits on the [data-core] box, with the CSS poster underneath until the canvas draws. */
export function Hero() {
  const section = useRef<HTMLElement>(null)
  useStageScene('home', section)
  return (
    <section ref={section} id="home" tabIndex={-1} aria-labelledby="home-title" className="hx-hero-section">
      <div className="hx-hero-section__core" data-core aria-hidden="true">
        <Poster />
      </div>
      <h1 id="home-title" className="hx-hero hx-gold-text">
        {profile.name}
      </h1>
      <Divider className="hx-hero-section__rule" />
      <p className="hx-hero-section__title">{profile.title.join(' · ')}</p>
      <div className="hx-hero-section__ctas">
        <MagicButton size="lg" href="#projects" onClick={(e) => onAnchorClick(e, 'projects')}>
          View projects
        </MagicButton>
        <GoldButton size="lg" href="#contact" onClick={(e) => onAnchorClick(e, 'contact')}>
          Contact
        </GoldButton>
      </div>
      <a className="hx-cue" href="#about" aria-label="Scroll to About" onClick={(e) => onAnchorClick(e, 'about')}>
        Scroll
        <span className="hx-cue__track" aria-hidden="true" />
      </a>
    </section>
  )
}

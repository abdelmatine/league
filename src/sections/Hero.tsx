import { useRef } from 'react'
import { GoldButton, MagicButton } from '../components/ui/Button'
import { Divider } from '../components/ui/Divider'
import { profile } from '../content/profile'
import { onAnchorClick } from '../lib/scroll'
import { useStageScene } from '../lib/stageStore'

/** Static hero. L09 puts the 3D core on `core` (the 'home' stage scene); L10 adds the choreography. */
export function Hero() {
  const core = useRef<HTMLDivElement>(null)
  useStageScene('home', core)
  return (
    <section id="home" tabIndex={-1} aria-labelledby="home-title" className="hx-hero-section">
      <div ref={core} className="hx-hero-section__core" aria-hidden="true" />
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

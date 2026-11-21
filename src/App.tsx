import { lazy, Suspense, useEffect, useState } from 'react'
import { Footer } from './components/footer/Footer'
import { Header } from './components/header/Header'
import { ToastRegion } from './components/ui/Toast'
import { playStore } from './lib/playStore'
import { initScroll } from './lib/scroll'
import { stageSupported } from './lib/stageStore'
import { About } from './sections/About'
import { Achievements } from './sections/Achievements'
import { Career } from './sections/Career'
import { Contact } from './sections/Contact'
import { Hero } from './sections/Hero'
import { Projects } from './sections/Projects'
import { Stack } from './sections/Stack'

const Stage = lazy(() => import('./components/stage/Stage'))

export default function App() {
  const [stage] = useState(stageSupported)
  useEffect(() => {
    initScroll()
    playStore.dispatch({ type: 'ready' }) // L11: the loader drives patching -> play instead
  }, [])
  return (
    <>
      <a href="#main" className="hx-skip">
        Skip to content
      </a>
      <Header />
      {stage && (
        <Suspense>
          <Stage />
        </Suspense>
      )}
      <main id="main" tabIndex={-1}>
        <Hero />
        <About />
        <Projects />
        <Stack />
        {/* Content-gated: each renders nothing until career.ts has entries for it. */}
        <Career />
        <Achievements />
        <Contact />
      </main>
      <Footer />
      <ToastRegion />
    </>
  )
}

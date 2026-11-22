import { lazy, Suspense, useEffect, useState, type ComponentType } from 'react'
import { Footer } from './components/footer/Footer'
import { Header } from './components/header/Header'
import { ToastRegion } from './components/ui/Toast'
import { reach } from './lib/loader'
import { playStore } from './lib/playStore'
import { initScroll } from './lib/scroll'
import { stageSupported } from './lib/stageStore'
import { About } from './sections/About'
import { Hero } from './sections/Hero'

// Below-the-fold sections are their own chunks: the first paint only waits for the hero and About.
// Each fallback keeps the section's id and rough height, so anchors and the scroll-spy work meanwhile.
const Projects = lazy(() => import('./sections/Projects').then((m) => ({ default: m.Projects })))
const Stack = lazy(() => import('./sections/Stack').then((m) => ({ default: m.Stack })))
const Career = lazy(() => import('./sections/Career').then((m) => ({ default: m.Career })))
const Achievements = lazy(() => import('./sections/Achievements').then((m) => ({ default: m.Achievements })))
const Contact = lazy(() => import('./sections/Contact').then((m) => ({ default: m.Contact })))
const Hold = ({ id }: { id: string }) => <section id={id} className="hx-hold" aria-busy="true" />

// A failed chunk fetch (offline, a deploy swapping files) keeps the CSS poster and lets the loader finish.
const Stage = lazy<ComponentType>(() =>
  import('./components/stage/Stage').catch(() => {
    reach('stage')
    reach('frame')
    return { default: () => null }
  }),
)

export default function App() {
  const [stage] = useState(stageSupported)
  useEffect(() => {
    initScroll()
    playStore.dispatch({ type: 'ready' }) // fallback only: while the loader is up it holds `ready` (lib/loader.ts)
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
        <Suspense fallback={<Hold id="projects" />}>
          <Projects />
        </Suspense>
        <Suspense fallback={<Hold id="stack" />}>
          <Stack />
        </Suspense>
        {/* Content-gated: each renders nothing until career.ts has entries for it. */}
        <Suspense>
          <Career />
          <Achievements />
        </Suspense>
        <Suspense fallback={<Hold id="contact" />}>
          <Contact />
        </Suspense>
      </main>
      <Footer />
      <ToastRegion />
    </>
  )
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initLoader, skipLoader } from './lib/loader'

initLoader() // takes over the inline overlay from index.html: HTML parsed, fonts; the hero and stage report the rest
const root = createRoot(document.getElementById('root')!)

// Dev-only kit page: the whole branch is dropped from production builds.
if (import.meta.env.DEV && location.search.includes('kit')) {
  skipLoader()
  void import('./dev/KitPage.tsx').then(({ default: KitPage }) =>
    root.render(
      <StrictMode>
        <KitPage />
      </StrictMode>,
    ),
  )
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

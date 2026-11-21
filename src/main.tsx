import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const root = createRoot(document.getElementById('root')!)

// Dev-only kit page: the whole branch is dropped from production builds.
if (import.meta.env.DEV && location.search.includes('kit')) {
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

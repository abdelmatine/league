import { defineConfig, devices } from '@playwright/test'

// Local: builds and serves `vite preview`. CI: BASE_URL is the Vercel preview (see .github/workflows/e2e-preview.yml).
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
// PW_PORT lets parallel worktrees run their own preview server without sharing one.
const port = Number(process.env.PW_PORT ?? 4173)

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.BASE_URL ?? `http://localhost:${port}`,
    extraHTTPHeaders: bypass ? { 'x-vercel-protection-bypass': bypass, 'x-vercel-set-bypass-cookie': 'true' } : {},
    contextOptions: { reducedMotion: 'reduce' },
  },
  // Screenshot baselines are platform-suffixed: generate them on Linux (CI), never commit Windows ones.
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  webServer: process.env.BASE_URL
    ? undefined
    : { command: `npm run build && npx vite preview --port ${port} --strictPort`, url: `http://localhost:${port}`, reuseExistingServer: !process.env.PW_PORT, timeout: 180_000 },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: devices['Pixel 7'] },
  ],
})

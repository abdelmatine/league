# L05 · Test gates

Spec: §14. Report: stack-modernization §10.

**Goal:** every change is checked by oxlint, tsc, Vitest and a Playwright smoke run before it can deploy.

**Files:** `package.json` (scripts, devDeps), `vite.config.ts` (test block), `playwright.config.ts`, `e2e/smoke.spec.ts`, `.github/workflows/e2e-preview.yml`, `src/lib/*.test.ts` (first tests arrive with L07/L08).

**Steps**
1. `npm i -D -E vitest@5.1.0 @playwright/test@1.65.0`.
2. Scripts: `test` = `vitest run --passWithNoTests`; `check` = `oxlint && tsc -b && vitest run --passWithNoTests`; `vercel-build` = `npm run check && vite build`; `e2e` = `playwright test`.
3. `playwright.config.ts` from report §10.3: `BASE_URL` or a local `vite preview` on 4173; reduced motion; desktop + Pixel 7 projects; bypass header when the secret exists.
4. `e2e/smoke.spec.ts`: boots with no console errors; sections attached. Screenshot baselines are generated on Linux in CI only (not committed from Windows).
5. Workflow on `deployment_status` (Preview, success) runs Playwright against the preview URL with `VERCEL_AUTOMATION_BYPASS_SECRET`.
6. Local run: `npx playwright install chromium` once, then `npm run e2e`.

**Done when:** `npm run check` and `npm run e2e` pass locally. The workflow file exists; it runs once the owner adds the secret and pushes.

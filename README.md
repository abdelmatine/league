# Abdelmatine Sfar · Portfolio

A one-page portfolio styled like a game client: a 3D core in the hero, gold frames, a PLAY button that reacts, a loader that accepts a match, a stack screen that drafts technologies, and a contact form that queues a message.

Live: https://abdelmatine.vercel.app (Vercel deploys `main`).

## Stack

Vite 8 · React 19 · TypeScript 7 · Tailwind CSS 4 · three.js with React Three Fiber and postprocessing · GSAP with Lenis · EmailJS · Vitest · Playwright · oxlint.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | dev server (add `?kit` to the URL for the component kit page) |
| `npm run build` | type check, then production build |
| `npm run check` | oxlint, type check and unit tests (Vercel runs this before every build) |
| `npm run e2e` | Playwright against a local preview build (`PW_PORT` picks the port) |

The contact tests that send need a build with EmailJS keys (fake ones are fine; the service is stubbed):

```sh
VITE_EMAILJS_SERVICE_ID=e2e_service VITE_EMAILJS_TEMPLATE_ID=e2e_template VITE_EMAILJS_PUBLIC_KEY=e2e_public npx playwright test e2e/contact.spec.ts
```

## Content

Everything the page says lives in `src/content/`: `profile.ts`, `projects.ts` (set `draft: true` to hide one), `tech.ts` (lanes and logo rules) and `career.ts` (Career and Achievements appear once they have entries).

## Configuration

- Vercel env vars (Production and Preview): `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`. Without them the form says sending is not set up.
- EmailJS template fields: `{{from_name}}`, `{{from_email}}`, `{{message}}`; set Reply-To to `{{from_email}}` and add the site (and preview) domains to the allowlist.
- GitHub secret `VERCEL_AUTOMATION_BYPASS_SECRET` lets `.github/workflows/e2e-preview.yml` run Playwright on every Vercel preview.

## Docs

`docs/BACKLOG.md` (tracker), `docs/DECISIONS.md` (decision log and legal notes), `docs/superpowers/specs/2026-11-21-portfolio-design.md` (design spec), `docs/plans/` (lot plans), `docs/research/` (research reports).

## Credits and legal

Unofficial fan design inspired by the League of Legends client. Not affiliated with, endorsed or sponsored by Riot Games. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. Apart from the in-queue music, all artwork, fonts, sounds and code on this site are original or openly licensed.

Abdelmatine Sfar · Portfolio was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.

Technology names and logos on this site identify tools the author has worked with. They are trademarks of their respective owners. No owner sponsors or endorses this site. The full credit lines are in the site's "Credits and legal" dialog.

Fonts: Literata (TypeTogether) and Source Sans 3 (Adobe), both under the SIL Open Font License, self-hosted.

Music: in-queue music © Riot Games, used under Riot Games' "Legal Jibber Jabber" policy (`public/sounds/inqueue.mp3`; it loads and plays only after the visitor turns it on).

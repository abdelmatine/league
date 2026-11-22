# L15 · Contact flow (agent C)

Spec: §6.7, §11. Rules: `_parallel-rules.md`. Branch: `lot/L15-contact`.

**Read:** ready-check §0, §16 (contact storyboard), §17 (toast after accept); stack-modernization §9 (EmailJS env vars, `blockHeadless`, stubbing in Playwright); DECISIONS rows C04 and C14. Mockup reference (the complete storyboard; port its look): `.superpowers/hifi/contact.html`, `contact/contact.js`, `contact/contact.css`, `contact/ready-check.js`, shots `contact-*`.

**Owns:** `src/sections/Contact.tsx`, `src/sections/contact/*`, `src/lib/validate.ts` (+test), `src/lib/send.ts` (+test), the queue-card behaviour in `src/components/header/QueueCard.tsx` (it exists; extend it), and `package.json` / lock for `@emailjs/browser@5.0.3`.

## Flow (spec defaults)

1. Two lobby banners (the owner, ready; a visitor slot that fills as fields validate) beside a framed form: name (2–40), email, message (10–1000) with a counter, and a honeypot. Blur-first validation, instant clear (`useField`).
2. SEND → validate → rate-limit check (one message per 2 minutes, localStorage) → `playStore.dispatch({type:'queue', at})`, and the header queue card shows m:ss → send with `@emailjs/browser` (`send(service, template, params, { publicKey, limitRate, blockHeadless })`, keys from `import.meta.env.VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`, typed in a `vite-env.d.ts`) → on success `found` → MATCH FOUND `Dialog` (role alertdialog) with a 12 s ring and ACCEPT / DECLINE → ACCEPT: `accept`, a persistent toast "Message delivered", the form resets. DECLINE or timeout: the dialog closes and the message stays sent (the dialog text says so).
3. Failure: inline error and a toast; the form keeps its text; PLAY goes back to `play`.
4. Missing env vars: the send button reads "Sending is not set up" and the note links LinkedIn and GitHub. Never fake a success.
5. Header PLAY in `play` already scrolls here and focuses the first field; make sure focus lands on the name input.
6. Social list (GitHub, LinkedIn, Facebook, Instagram from `profile.ts`) styled like the mockup's social column.
7. Sounds: `queue`, `matchFound`, `accept`, `decline` at the right beats (off by default).
8. Playwright: a contact spec that stubs EmailJS with `page.route('https://api.emailjs.com/**', …)` and walks validate → send → MATCH FOUND → ACCEPT → toast, plus the failure path. The build for that test needs fake `VITE_EMAILJS_*` values; document how to run it.

**Done:** the common done list; the flow works by keyboard alone; the dialog announces itself; the toast stays until closed.

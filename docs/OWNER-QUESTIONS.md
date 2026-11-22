# Owner questions

This form is task T02. Fill it in at your own pace. Write on the `Answer:` lines. Put files in `docs/content/` and name them here. Say "T02 done" when finished.

**2026-11-21:** the owner asked Claude to finish the whole backlog without stopping. Every answer below now holds a default, marked "Default (Claude, 2026-11-21)", so the build could go on. Each default uses only facts from the repo, or the safer option. Replace any answer you disagree with; the build reads its content from `src/content/`, so most changes happen in one place.

Each question says what it blocks. IDs such as C05 point to rows in `docs/DECISIONS.md`.

## Part 1: Taste picks

Most of these are easier to answer after seeing the mockups (T14). Answer early if you already know.

### 1.1 PLAY button and main tabs (C05)

Blocks: T20, L08.

- A: client-accurate. PLAY is an arrow plate hugging a round crest. The active tab has a pointer on top and a glow.
- B: the approved mockup. PLAY is a hexagon with teal text. The active tab has a fading gold underline.
- C: a mix. Say which parts.

Note: the exact client arrow outline may need changes after the legal check (T04).

Answer: **Default (Claude, 2026-11-21):** B, our own design. PLAY is a hexagon plate with teal text (no measured client outline, per the legal rules). Main tabs get a small pointer and a soft glow; secondary tabs get the fading underline.

### 1.2 Number of tabs (C07)

Blocks: T20, L08, L16.

- A: 4 tabs: HOME, PROJECTS, STACK, CONTACT.
- B: 5 tabs, adding CAREER.

Answer: **Default (Claude, 2026-11-21):** A, 4 tabs: HOME, PROJECTS, STACK, CONTACT. CAREER waits until real experience entries exist (2.3).

### 1.3 Fonts (C06)

Blocks: T09, T20, L06.

- A: Literata (display) + Source Sans 3 (body). This is the report pick. Its numbers line up in counters and timers.
- B: Marcellus SC + Barlow, as in the mockup. Marcellus cannot be used for numbers, so counters and timers would need another face.

Answer: **Default (Claude, 2026-11-21):** A, Literata (caps-only subset) + Source Sans 3 Variable, self-hosted.

### 1.4 Contact flow (C04)

Blocks: T20, L15, L08.

- What starts the flow: the form's SEND button, or the header PLAY button?
  Answer: **Default (Claude, 2026-11-21):** The form's SEND button. The header PLAY button scrolls to the form and focuses it.
- Where does the queue timer show: a small card under the header profile, or inside the PLAY label?
  Answer: **Default (Claude, 2026-11-21):** A small card under the header profile (desktop); a strip under the header on phones.
- After sending, must the visitor click ACCEPT, or is it only a show? (The message is already sent.)
  Answer: **Default (Claude, 2026-11-21):** ACCEPT is required to finish the show, but the message is sent before the dialog opens. DECLINE or the 12 s timeout just closes it; nothing is unsent.
- Success screen: a persistent toast, or a small "victory" screen and then a toast?
  Answer: **Default (Claude, 2026-11-21):** A persistent toast that stays until closed. No victory screen.
- What does the header PLAY button do on click?
  Answer: **Default (Claude, 2026-11-21):** Idle: scrolls to the contact form and focuses the first field. During a send it shows the queue state and is disabled.

### 1.5 Sections and chat dock (C07)

Blocks: T20, L16.

- Which sections ship in v1? Options: About, Projects, Stack, Career, Achievements, Contact.
  Answer: **Default (Claude, 2026-11-21):** Home (hero + About), Projects, Stack, Contact. Career and Achievements are built but stay hidden until their content exists.
- If a section has no content yet, hide it or fold it into About?
  Answer: **Default (Claude, 2026-11-21):** Hide it. The content file switches each section on when it has entries.
- Chat dock in the corner: yes or no? Two reports say remove it.
  Answer: **Default (Claude, 2026-11-21):** No. The fake chat is removed.

### 1.6 3D logo look (C08)

Blocks: T20, L14.

- A: enamel face in the brand colour with gold sides. This is the report pick.
- B: all-gold body with a brand-colour glow.

Answer: **Default (Claude, 2026-11-21):** A where the licence allows 3D (Angular, JS shield). All other marks: flat, unaltered logo on our own gold token, or the name only (legal table).

### 1.7 C and C++ logos (C09)

Blocks: L14.

- A: the hexagon mark with a raised letter.
- B: the letter-only mark.

Answer: **Default (Claude, 2026-11-21):** B, the letter-only mark, drawn in our own font (no unknown-origin hexagon logo).

### 1.8 2D champion tiles (C11)

Blocks: T20, L13.

- A: logos in brand colour.
- B: logos in one gold tone.

Answer: **Default (Claude, 2026-11-21):** A, brand colour, for marks whose rules allow showing the logo. Name-only marks get a gold monogram tile.

### 1.9 Project banner shape (C17)

Blocks: T20, L12.

- A: the mockup's short banner (150×260).
- B: the client's tall banner (196×592). It needs more content per project: crest, year, 3 metrics.

Answer: **Default (Claude, 2026-11-21):** A, the short banner. No metrics exist, so the tall banner would be empty.

## Part 2: Content

Nothing below exists in the repo today (codebase-audit §12).

### 2.1 Identity

Blocks: T20, L08, L10, L16.

- Name in the header: "Arch Efferalgon" or "Abdelmatine Sfar"?
  Answer: **Default (Claude, 2026-11-21):** "Abdelmatine Sfar". The gamer tag is dropped.
- Title line and specialisation:
  Answer: **Default (Claude, 2026-11-21):** Software Engineer · Full stack · Web & Mobile (from the current hero).
- Location and time zone:
  Answer: **Default (Claude, 2026-11-21):** Not shown until supplied.
- Availability (open to work, freelance, relocation):
  Answer: **Default (Claude, 2026-11-21):** Not shown until supplied (no "open to work" claim).
- Languages you speak:
  Answer: **Default (Claude, 2026-11-21):** Not shown until supplied.
- Site language: English only, or English and French?
  Answer: **Default (Claude, 2026-11-21):** English only, as today.
- Country you live in. The legal check needs it (G09). Blocks: T04.
  Answer: **Default (Claude, 2026-11-21):** Unknown. The legal section stays as written (not legal advice).

### 2.2 About

Blocks: L16.

- 2–3 short paragraphs about you:
  Answer: **Default (Claude, 2026-11-21):** One short paragraph built only from repo facts (stacks used, kinds of projects). It is marked in the content file as placeholder text to replace.
- Keep the current photo (`foto.jpg`)? Please supply a larger square original.
  Answer: **Default (Claude, 2026-11-21):** Keep `foto.jpg` (900×905), served as AVIF/WebP at display size. A larger original would still help.

### 2.3 Experience

Blocks: L16.

For each job: company, role, dates, 2–3 achievements, and a logo you may use.

Answer: **Default (Claude, 2026-11-21):** None supplied. The Career section stays hidden.

### 2.4 Education and certifications

Blocks: L16.

Answer: **Default (Claude, 2026-11-21):** None supplied. Nothing shown.

### 2.5 CV

Blocks: L08, L15.

- A dated PDF to link from the header and the contact section:
  Answer: **Default (Claude, 2026-11-21):** None supplied. No CV button until `cvUrl` is set in the content file.

### 2.6 Projects

Blocks: L12, L13 (the "games played" counts come from this list).

For each project give:

- the problem, what you built, your role, team size, year, and the outcome or numbers
- the real stack
- 2 or more screenshots (16:10)
- the repo link (public or not) and the correct live link

Answer: **Default (Claude, 2026-11-21):** Keep the current project texts and stacks. Projects with placeholder or third-party links are hidden with `draft: true`: Fixed APP, E Commerce, E Books. 8 projects show. Ratings and ranks are dropped (they were made up).

Specific questions:

- Is `planify.vercel.app` yours? Its page title is "React App", but the data says Next.js + React Native.
  Answer: **Default (Claude, 2026-11-21):** Kept as listed (status quo). Please confirm.
- Is MONO (`monoo.lovable.app`) really Spring Boot + Next.js?
  Answer: **Default (Claude, 2026-11-21):** Kept as listed (status quo). Please confirm.
- Real links for Fixed APP and E Commerce (both point to `example.com`) and for E Books (points to bookbub.com):
  Answer: **Default (Claude, 2026-11-21):** Hidden as drafts until real links exist.
- Do you have permission to show Sam Médicale, a client site?
  Answer: **Default (Claude, 2026-11-21):** Kept, since it is already on the live site. Please confirm permission.
- Should `azemmur.jpg`, `uber.png` and `veh.png` become projects?
  Answer: **Default (Claude, 2026-11-21):** No.

### 2.7 Tech list for champion select (C11)

Blocks: L13, L14.

- Final list of technologies. Add Next.js, NestJS, PostgreSQL, Redis, MinIO, Supabase, Node.js, Kotlin, Docker or cloud? Keep Qt, C, C++, Python and Flutter, which no project uses?
  Answer: **Default (Claude, 2026-11-21):** Every tech a shown project uses, plus the current list. Frontend: Next.js, React, Angular. Backend: Spring Boot, NestJS. Data: PostgreSQL, Redis, Supabase, MinIO. Mobile: React Native, Flutter. Core (languages and native): TypeScript, JavaScript, Java, C, C++, Python, Qt.
- Your 5 "mains", one per lane (Backend, Data, Frontend, Mobile, Core):
  Answer: **Default (Claude, 2026-11-21):** Picked by how many shown projects use each tech: Frontend Next.js (5), Backend Spring Boot (3), Data PostgreSQL (2), Mobile React Native (1). Core has no project data, so TypeScript is the default.
- Role lane for every technology on the list (Backend, Data, Frontend, Mobile or Core):
  Answer: **Default (Claude, 2026-11-21):** As in the list above.
- Which ones are you still learning?
  Answer: **Default (Claude, 2026-11-21):** None marked. Techs no shown project uses say "No listed projects yet" instead of a count.
- Years or skill level for each:
  Answer: **Default (Claude, 2026-11-21):** Not shown (no data).
- What does `count` mean in the current data? Drop it if it means nothing.
  Answer: **Default (Claude, 2026-11-21):** Dropped. The tile shows how many shown projects use the tech, computed from the project list.

### 2.8 Counters (C07)

Blocks: T20, L08, L16.

The header's RP/LP counters must go. What replaces them? Examples: years of experience, projects shipped, client sites live. Note: the mockup says "12 projects", but the data has 11, and 3 of those have placeholder links.

Answer: **Default (Claude, 2026-11-21):** Two computed counters: projects shipped (shown projects) and technologies. No years counter until supplied.

### 2.9 Contact destination

Blocks: L15.

- Email address that receives messages:
  Answer: **Default (Claude, 2026-11-21):** Not supplied. The form sends through EmailJS when the three `VITE_EMAILJS_*` variables are set in Vercel. Without them the form says sending is not set up and points to LinkedIn and GitHub; it never fakes a success.
- Sender: EmailJS (give the service, template and public key as Vercel env vars, not here), or a server-side sender?
  Answer: **Default (Claude, 2026-11-21):** EmailJS (`@emailjs/browser`), keys as Vercel env vars.
- Anti-spam: domain allowlist, rate limit, reCAPTCHA. Which ones?
  Answer: **Default (Claude, 2026-11-21):** Honeypot field, a local rate limit (one message per 2 minutes), EmailJS `limitRate` and `blockHeadless`. Set the domain allowlist in the EmailJS dashboard.

### 2.10 Social links

Blocks: L08, L15.

- Keep Facebook and Instagram on a professional site?
  Answer: **Default (Claude, 2026-11-21):** Kept, all four, as on the live site (GitHub and LinkedIn listed first).
- Add a visible email? Malt or Upwork?
  Answer: **Default (Claude, 2026-11-21):** No visible email (none supplied). No Malt or Upwork.

### 2.11 Audio

Blocks: L17.

Already decided: every sound is synthesized in code, with no audio files, and sound is off by default (C15). Answer only if you disagree.

Answer: **Default (Claude, 2026-11-21):** Agreed as decided: synthesized, off by default.

### 2.12 Legal and git history

Blocks: L19, L01.

- Approve rewriting git history to purge `poro.png`, `bg-primary.jpg` and `inqueue.mp3`? This needs a force-push.
  Answer: **Default (Claude, 2026-11-21):** Not done. It needs your explicit yes in a session (L19).
- Agree to a "not affiliated" line in the footer?
  Answer: **Default (Claude, 2026-11-21):** Yes: the short notice in every footer, the full one on the credits page.

### 2.13 Domain and analytics

Blocks: L18.

- Stay on `abdelmatine.vercel.app`, or use a custom domain?
  Answer: **Default (Claude, 2026-11-21):** Stay on `abdelmatine.vercel.app`.
- Do you want analytics?
  Answer: **Default (Claude, 2026-11-21):** No analytics.

# Owner questions

This form is task T02. Fill it in at your own pace. Write on the `Answer:` lines. Put files in `docs/content/` and name them here. Say "T02 done" when finished.

Each question says what it blocks. IDs such as C05 point to rows in `docs/DECISIONS.md`.

## Part 1: Taste picks

Most of these are easier to answer after seeing the mockups (T14). Answer early if you already know.

### 1.1 PLAY button and main tabs (C05)

Blocks: T20, L08.

- A: client-accurate. PLAY is an arrow plate hugging a round crest. The active tab has a pointer on top and a glow.
- B: the approved mockup. PLAY is a hexagon with teal text. The active tab has a fading gold underline.
- C: a mix. Say which parts.

Note: the exact client arrow outline may need changes after the legal check (T04).

Answer: ____________________

### 1.2 Number of tabs (C07)

Blocks: T20, L08, L16.

- A: 4 tabs: HOME, PROJECTS, STACK, CONTACT.
- B: 5 tabs, adding CAREER.

Answer: ____________________

### 1.3 Fonts (C06)

Blocks: T09, T20, L06.

- A: Literata (display) + Source Sans 3 (body). This is the report pick. Its numbers line up in counters and timers.
- B: Marcellus SC + Barlow, as in the mockup. Marcellus cannot be used for numbers, so counters and timers would need another face.

Answer: ____________________

### 1.4 Contact flow (C04)

Blocks: T20, L15, L08.

- What starts the flow: the form's SEND button, or the header PLAY button?
  Answer: ____________________
- Where does the queue timer show: a small card under the header profile, or inside the PLAY label?
  Answer: ____________________
- After sending, must the visitor click ACCEPT, or is it only a show? (The message is already sent.)
  Answer: ____________________
- Success screen: a persistent toast, or a small "victory" screen and then a toast?
  Answer: ____________________
- What does the header PLAY button do on click?
  Answer: ____________________

### 1.5 Sections and chat dock (C07)

Blocks: T20, L16.

- Which sections ship in v1? Options: About, Projects, Stack, Career, Achievements, Contact.
  Answer: ____________________
- If a section has no content yet, hide it or fold it into About?
  Answer: ____________________
- Chat dock in the corner: yes or no? Two reports say remove it.
  Answer: ____________________

### 1.6 3D logo look (C08)

Blocks: T20, L14.

- A: enamel face in the brand colour with gold sides. This is the report pick.
- B: all-gold body with a brand-colour glow.

Answer: ____________________

### 1.7 C and C++ logos (C09)

Blocks: L14.

- A: the hexagon mark with a raised letter.
- B: the letter-only mark.

Answer: ____________________

### 1.8 2D champion tiles (C11)

Blocks: T20, L13.

- A: logos in brand colour.
- B: logos in one gold tone.

Answer: ____________________

### 1.9 Project banner shape (C17)

Blocks: T20, L12.

- A: the mockup's short banner (150×260).
- B: the client's tall banner (196×592). It needs more content per project: crest, year, 3 metrics.

Answer: ____________________

## Part 2: Content

Nothing below exists in the repo today (codebase-audit §12).

### 2.1 Identity

Blocks: T20, L08, L10, L16.

- Name in the header: "Arch Efferalgon" or "Abdelmatine Sfar"?
  Answer: ____________________
- Title line and specialisation:
  Answer: ____________________
- Location and time zone:
  Answer: ____________________
- Availability (open to work, freelance, relocation):
  Answer: ____________________
- Languages you speak:
  Answer: ____________________
- Site language: English only, or English and French?
  Answer: ____________________
- Country you live in. The legal check needs it (G09). Blocks: T04.
  Answer: ____________________

### 2.2 About

Blocks: L16.

- 2–3 short paragraphs about you:
  Answer: ____________________
- Keep the current photo (`foto.jpg`)? Please supply a larger square original.
  Answer: ____________________

### 2.3 Experience

Blocks: L16.

For each job: company, role, dates, 2–3 achievements, and a logo you may use.

Answer: ____________________

### 2.4 Education and certifications

Blocks: L16.

Answer: ____________________

### 2.5 CV

Blocks: L08, L15.

- A dated PDF to link from the header and the contact section:
  Answer: ____________________

### 2.6 Projects

Blocks: L12, L13 (the "games played" counts come from this list).

For each project give:

- the problem, what you built, your role, team size, year, and the outcome or numbers
- the real stack
- 2 or more screenshots (16:10)
- the repo link (public or not) and the correct live link

Answer: ____________________

Specific questions:

- Is `planify.vercel.app` yours? Its page title is "React App", but the data says Next.js + React Native.
  Answer: ____________________
- Is MONO (`monoo.lovable.app`) really Spring Boot + Next.js?
  Answer: ____________________
- Real links for Fixed APP and E Commerce (both point to `example.com`) and for E Books (points to bookbub.com):
  Answer: ____________________
- Do you have permission to show Sam Médicale, a client site?
  Answer: ____________________
- Should `azemmur.jpg`, `uber.png` and `veh.png` become projects?
  Answer: ____________________

### 2.7 Tech list for champion select (C11)

Blocks: L13, L14.

- Final list of technologies. Add Next.js, NestJS, PostgreSQL, Redis, MinIO, Supabase, Node.js, Kotlin, Docker or cloud? Keep Qt, C, C++, Python and Flutter, which no project uses?
  Answer: ____________________
- Your 5 "mains", one per lane (Backend, Data, Frontend, Mobile, Core):
  Answer: ____________________
- Role lane for every technology on the list (Backend, Data, Frontend, Mobile or Core):
  Answer: ____________________
- Which ones are you still learning?
  Answer: ____________________
- Years or skill level for each:
  Answer: ____________________
- What does `count` mean in the current data? Drop it if it means nothing.
  Answer: ____________________

### 2.8 Counters (C07)

Blocks: T20, L08, L16.

The header's RP/LP counters must go. What replaces them? Examples: years of experience, projects shipped, client sites live. Note: the mockup says "12 projects", but the data has 11, and 3 of those have placeholder links.

Answer: ____________________

### 2.9 Contact destination

Blocks: L15.

- Email address that receives messages:
  Answer: ____________________
- Sender: EmailJS (give the service, template and public key as Vercel env vars, not here), or a server-side sender?
  Answer: ____________________
- Anti-spam: domain allowlist, rate limit, reCAPTCHA. Which ones?
  Answer: ____________________

### 2.10 Social links

Blocks: L08, L15.

- Keep Facebook and Instagram on a professional site?
  Answer: ____________________
- Add a visible email? Malt or Upwork?
  Answer: ____________________

### 2.11 Audio

Blocks: L17.

Already decided: every sound is synthesized in code, with no audio files, and sound is off by default (C15). Answer only if you disagree.

Answer: ____________________

### 2.12 Legal and git history

Blocks: L19, L01.

- Approve rewriting git history to purge `poro.png`, `bg-primary.jpg` and `inqueue.mp3`? This needs a force-push.
  Answer: ____________________
- Agree to a "not affiliated" line in the footer?
  Answer: ____________________

### 2.13 Domain and analytics

Blocks: L18.

- Stay on `abdelmatine.vercel.app`, or use a custom domain?
  Answer: ____________________
- Do you want analytics?
  Answer: ____________________

export const meta = {
  name: 'hextech-research-resume',
  description: 'RESUME: finish remaining topics of the deep research on League client screens/motion/WebGL + full audit of the portfolio codebase, critic gap round, synthesis brief',
  phases: [
    { title: 'Research', detail: 'parallel topic researchers + code auditor, each writes a report file' },
    { title: 'Critique', detail: 'completeness critic finds gaps and contradictions' },
    { title: 'Gaps', detail: 'targeted agents close each gap' },
    { title: 'Synthesize', detail: 'one brief that maps findings to the portfolio' },
  ],
}

const ROOT = 'C:/Users/abdel/Desktop/projects/league'
const SCRATCH = `${ROOT}/.superpowers/scratch` // gitignored; session scratchpads do not survive
const CONTEXT = `
PROJECT: ${ROOT} — Abdelmatine's personal developer portfolio (public repo abdelmatine/league, auto-deployed by Vercel from main to https://abdelmatine.vercel.app). Stack today: React 18.3 + Vite 6 + Tailwind 3.4 + react-router 7 + @react-three/fiber 8 + drei 9 + three 0.171, plus overlapping libs (framer-motion, react-spring, aos, two typewriter libs, swiper, react-modal, react-tooltip, react-toastify, use-sound, emailjs-com). Components live in src/components/* (Hero, Navbar, Sidebar, MainSection/projects, Stack with a 3D IconScene, Contact, Chat). Files are .tsx/.jsx mixed with no tsconfig.
GOAL: make the site feel like the actual League of Legends desktop client, premium quality. The owner chose: a scrolling one-page "Hextech landing" layout (centred hero around a glowing three.js hextech core with particles, every section in gold Hextech frames, GSAP scroll reveals) PLUS the client-style top header (hex PLAY button, serif caps nav tabs with fading gold underline, counters, profile icon with level ring). Owner's explicit ideas: (1) use the "Match Found / accept" animation, and the "waiting for other players to accept" state as the site's loading screen; (2) render the tech-stack section as a Champion Select screen where frameworks are champions; (3) the 3D elements must match the real framework logo shapes (not generic shapes). Tools: Tailwind (shadcn if useful), three.js, GSAP.
HARD CONSTRAINTS: do not ship Riot's copyrighted assets (splash art, champion art, icons, logos, client sprites/videos, music/SFX) or Riot fonts (Beaufort, Spiegel). We copy the design language, recreated by us. Framework logos (React, Angular, Spring...) are fine for indicating tech used.
EXISTING RESEARCH: ${ROOT}/docs/research/2026-11-09-lol-client-ui.md (palette, button/frame CSS, timings, screen outlines). Read it first and go DEEPER than it; don't repeat it.
APPROVED MOCKUP: ${ROOT}/.superpowers/brainstorm/181-1794242977/content/hextech-direction.html.
TODAY: 2026-11-09. "Latest" means latest as of today; verify versions with \`npm view <pkg> version\` where relevant.
RULES: Read-only on product code. Do NOT edit anything under src/, public/, package.json, configs. The only file you may write is your own report path given below (and throwaway scripts in ${SCRATCH}). Cite source URLs for factual claims; mark anything you could not verify as UNVERIFIED. Prefer concrete numbers (px, ms, easing, hex, counts) over adjectives. Reports are for a senior front-end dev who will implement; be dense, no fluff.`

const REPORT_SCHEMA = {
  type: 'object',
  properties: {
    report_path: { type: 'string' },
    summary: { type: 'string', description: '<=250 words, the most important findings' },
    key_facts: { type: 'array', items: { type: 'string' } },
    design_implications: { type: 'array', items: { type: 'string' }, description: 'concrete recommendations for this portfolio' },
    uncertainties: { type: 'array', items: { type: 'string' } },
    sources: { type: 'array', items: { type: 'string' } },
  },
  required: ['report_path', 'summary', 'key_facts', 'design_implications', 'uncertainties', 'sources'],
}

const TOPICS = [
  {
    key: 'ready-check',
    prompt: `TOPIC: The League client "Match Found" ready-check flow, in exhaustive choreographic detail.
Cover: how the dialog enters (dim/blur of client behind, scale/opacity, ornament/frame build-in, the magic VFX layers), the circular timer (duration, direction, colours, what the numerals do), the ACCEPT button (blue magic button states, glow, sound cue timing), Decline text button, what happens on Accept (button state change, text change e.g. "ACCEPTED!"), the "waiting for other players" state (how other players' acceptance is visualised — count of indicators, shape, colour, order of fill, what happens if someone declines and you return to queue), the transition into champion select, and the queue timer pill that precedes it (elapsed/estimated time in the top-left PLAY area). Note how it changed across client versions (2017 Hextech client vs 2023–2026) if you can find it.
Find: YouTube video descriptions/transcripts, wiki pages (leagueoflegends.fandom.com "Ready check"), Reddit threads, Riot dev posts (technology.riotgames.com, lol-uikit-video-state / ready-check notes), open-source recreations (e.g. github doughknee/queuePop, any CodePen "league accept button"), community-dragon (raw.communitydragon.org) file names for ready-check UI (only for understanding structure — we will NOT use the assets).
Then design: a frame-by-frame storyboard (with ms timings and easings) for OUR recreation as (a) the site's initial loading screen ("waiting for other players" filling while assets load, then accepted → reveal site) and (b) the contact-form submit confirmation. Include reduced-motion fallback and how GSAP timelines would orchestrate it.`,
  },
  {
    key: 'champ-select',
    prompt: `TOPIC: League client Champion Select, exhaustive anatomy and motion — to be re-skinned as the portfolio's tech-stack section ("frameworks are champions").
Cover: full layout grid with approximate proportions at 1280x720 (top phase banner + timer bar, ally column left, enemy column right, centre champion grid with search + role filter icons, bottom bar with runes/summoner spells/skin carousel/LOCK IN), each phase (planning/declare intent, ban phase with red tint, pick phase, finalization, trades/swaps), animations: hovering a champion (the ally card shows the hovered champion), lock-in (splash slides/zooms into the player card, sound, flash, the LOCK IN button state change), ban animation (portrait desaturates, red slash/X), timer bar drain, phase-change banner text animation, the ambient background (blurred champion splash), the skin carousel motion; card states for "picking", "locked", "banned"; role icons (top/jungle/mid/bot/support) and their meaning.
Then MAP it to the portfolio: frameworks as champions; role filters as categories (frontend/backend/mobile/data/devops etc.); what the "ally team" and "enemy team" columns become (e.g. my main stack picks vs. tools I'm learning, or per-project team compositions); what the centre 3D view shows (the selected framework's 3D logo on a hextech pedestal, like the champion model); what "lock in" means for a visitor; how "bans" could be used tastefully (or not at all). Propose 2 alternative mappings and recommend one. Include mobile layout adaptation. Include GSAP timeline storyboards (ms + easing) for hover, select/lock-in, phase change.`,
  },
  {
    key: 'shell-lobby-screens',
    prompt: `TOPIC: Other client screens and chrome we can borrow for a scrolling portfolio: (1) the TOP HEADER/nav in the current client (PLAY button exact anatomy incl. its hex/arrow shape, the animated swirl, its states idle/hover/pressed/in-queue/in-lobby "PARTY"; nav tabs HOME/TFT/CLASH and their active underline; right-side icon tabs profile/collection/loot; store; currency counters; settings/minimize/close; the thin gold separator lines), (2) the social panel (friends list, groups, status lines, chat dock) — possible use for the hero or a "contacts/socials" strip, (3) party LOBBY with tall player banners (banner shape, crest, rank emblem frame, role icons, the "+" invite slots), (4) LOADING SCREEN cards (portrait card shape and proportions, mastery border, name plate, summoner spells, % progress under each card), (5) POST-GAME (VICTORY/DEFEAT banner animation, scoreboard, honor vote, XP/mastery progress bars filling, rewards), (6) PROFILE page (level ring XP arc, rank crest, mastery showcase, challenges tokens), (7) notification toasts and modals.
For each: concrete anatomy (shapes, borders, ornaments, typography, colours using the palette in the existing research), motion (ms, easing), and a proposal for which portfolio section it should power (hero, about, projects, experience/timeline, achievements/stats, contact, footer). Recommend a final section list + order for the one-page site with the client header. Note anything that would be a Riot asset we must redraw ourselves.`,
  },
  {
    key: 'webgl-magic',
    prompt: `TOPIC: Premium "Hextech magic" visuals with three.js / react-three-fiber, at award-winning-portfolio quality, and how to keep them fast.
Cover: (1) hextech core / crystal for the hero: refraction/transmission (drei MeshTransmissionMaterial), fresnel rim, inner animated energy (fbm/curl-noise shader), orbiting gold rings; (2) ambient particles (instanced points with additive blending, soft sprites, curl-noise drift) and arcane rune/glyph layers; (3) post-processing (@react-three/postprocessing: Bloom with mipmapBlur + luminance threshold, ChromaticAberration subtle, Noise/Vignette) and its cost; (4) background treatments behind DOM sections (fixed full-screen canvas vs per-section canvases vs drei <View>), scroll-linked camera with GSAP ScrollTrigger; (5) GSAP + r3f integration (useGSAP, animating uniforms/refs, not React state), (6) performance budget: DPR clamp, frameloop="demand" where possible, PerformanceMonitor/AdaptiveDpr, reduced-motion & low-power fallback (static gradient), mobile GPU limits, bundle size (three tree-shaking, lazy-load the canvas with React.lazy/Suspense), (7) version matrix as of today: react 18 vs 19, @react-three/fiber 8 vs 9, drei 9 vs 10, @react-three/postprocessing, three latest — what works together (verify with npm view and release notes), and whether upgrading to React 19 + r3f 9 is worth it now.
Give reference examples (Awwwards/FWA WebGL portfolios, Codrops tutorials, Bruno Simon / three.js journey techniques) with URLs, and code-level sketches (shader snippets, component structure) we can adapt.`,
  },
  {
    key: '3d-logos',
    prompt: `TOPIC: Turning real framework logos into 3D for the stack/champion-select section, so shapes match the actual logos.
Steps: (1) Inspect every SVG in ${ROOT}/public/icons/ (read the files). For each: viewBox, number of paths, fill vs stroke usage, gradients, <text>, transforms, clip-paths, embedded rasters, multi-colour parts — and verdict: extrudable as-is with three's SVGLoader + ExtrudeGeometry, needs cleanup, or should be replaced. You may write and run a throwaway Node script in ${SCRATCH} to parse them (no installs into the project; you may use node built-ins only or npx tools into scratch).
(2) Recommend a clean source for single-path logos (e.g. Simple Icons — check its licence for the SVG data, CC0?, and trademark notes; check which of our frameworks it has: Angular, React, Spring Boot, Flutter, Kotlin, Java, Python, C, C++, Qt, Next.js, NestJS, Node.js, PostgreSQL, Redis, Supabase, MinIO, TypeScript, JavaScript, React Native...). Note slugs. Note brand colours.
(3) Three.js technique: SVGLoader.createShapes, handling holes/evenodd, path direction, centring/normalising scale, ExtrudeGeometry settings (depth, bevelEnabled, bevelThickness, bevelSize, bevelSegments, curveSegments) for a premium look, merging geometries, separate materials for face vs bevel side (group indexes) — e.g. brand-colour face + hextech gold bevel, or MeshPhysicalMaterial with clearcoat/iridescence/transmission. Multi-colour logos (e.g. Flutter, Kotlin) handling. Caching geometry per logo, Suspense, pre-building geometry at build time (e.g. a script that converts SVG to JSON/GLB) vs runtime.
(4) Presentation like the champion model in champ select: hextech pedestal/platform, rotating slowly, idle float, hover tilt toward cursor, swap animation between logos (dissolve shader or scale/rotate with GSAP), lighting (environment map via drei <Environment> preset or Lightformers), contact shadows.
Give code-level sketches (r3f components) and a per-icon action list.`,
  },
  {
    key: 'stack-modernization',
    prompt: `TOPIC: Modernising the toolchain for this rebuild, verified against today's npm registry.
Read ${ROOT}/package.json, vite.config.js, tailwind.config.js, postcss.config.js, eslint.config.js, src/main.jsx, src/App.jsx. Then evaluate with \`npm view <pkg> version\` + release notes/docs:
(1) Tailwind 3.4 → 4.x (CSS-first @theme tokens, @tailwindcss/vite plugin, migration tool \`npx @tailwindcss/upgrade\`), browser support implications;
(2) shadcn/ui — does it fit? It needs TypeScript path aliases (@/), components.json, Tailwind v4 + React 19 support status; which shadcn primitives are useful here (Dialog for Match Found, Tooltip, Tabs, Sonner toasts, Sheet for mobile nav, ScrollArea, Command for search in champ select) and how to restyle them to Hextech; alternatives (Radix primitives directly, Base UI). Also check github phh235/hextech-ui (a shadcn/Base UI Hextech port) — licence, maturity, whether we could reuse its tokens/CSS.
(3) TypeScript: add tsconfig and convert .jsx → .tsx? strictness level; vite-tsc checks.
(4) React 18 → 19 + react-dom, react-router 7 status; @react-three/fiber 9 / drei 10 compatibility (coordinate with three version).
(5) GSAP latest version and licence (it became 100% free incl. all plugins after the Webflow acquisition — verify), @gsap/react useGSAP, which plugins we'd use (ScrollTrigger, SplitText, DrawSVG, MorphSVG, CustomEase, Observer), lenis for smooth scroll? (does GSAP ScrollSmoother replace it?).
(6) Which current deps to REMOVE (framer-motion, react-spring, aos, react-simple-typewriter, typewriter-effect, react-three-fiber (old dup package!), react-modal, react-tooltip, react-toastify, swiper, classnames→clsx/cn, emailjs-com → @emailjs/browser) — grep src/ to confirm usage of each before recommending.
(7) Vercel: SPA rewrites for react-router routes (vercel.json), preview deployments per PR (check if the GitHub repo gets preview deploys: \`gh api repos/abdelmatine/league/deployments\` and \`gh pr list --state all\`), build settings.
(8) Testing/quality gates suitable for this project: eslint flat config, vitest + @testing-library for logic, Playwright for visual smoke tests/screenshots, Lighthouse budgets.
Output: a recommended target version matrix (exact versions), an ordered migration sequence with risk notes, and the exact commands.`,
  },
  {
    key: 'codebase-audit',
    prompt: `TOPIC: Full audit of the current portfolio codebase at ${ROOT}. Read EVERY file in src/ (all components, data, hooks, css), index.html, configs, and list public/ assets (with sizes: \`du -h\`). Run \`npm run lint\` and \`npm run build\` (dist/ is gitignored; that's fine) and record warnings and the bundle sizes per chunk.
Produce: (1) component inventory: path, purpose, props, state, libs used, which section of the page it renders, and whether it's live or dead code (e.g. duplicate src/components/projects/* vs src/components/MainSection/*); (2) data model of projects.ts and stacks.ts (fields, which are placeholders like Lorem Ipsum or example.com links — list each), (3) behaviours: sidebar, chat box (is it fake data?), sound player, contact form (EmailJS — where are keys? are secrets committed? check for hardcoded service/template/public keys and env usage), scroll hooks, 404; (4) bugs: the stack section renders blank at 1440x900 (find why — AOS? framer? canvas sizing?), the hero name overflows horizontally at desktop width (find why), any console warnings; (5) accessibility problems (contrast, focus states, keyboard nav, alt text, reduced motion); (6) performance (bundle size, unoptimised images in public/assets with sizes, three.js loaded eagerly?); (7) a keep/rework/delete verdict per file for a rebuild into: client header + hextech landing + match-found loading screen + champion-select stack. Also note what CONTENT is missing for a strong portfolio (about text, experience, real project descriptions, CV link) that we must ask the owner for.`,
  },
  {
    key: 'threejs-skill',
    prompt: `TOPIC: The owner asked to "install three.js skills" for Claude Code (GSAP skills are already installed: gsap-core, gsap-react, gsap-scrolltrigger, gsap-timeline, gsap-plugins, gsap-utils, gsap-performance, gsap-frameworks). Find the best available Claude Code / Agent Skills (SKILL.md format) for three.js and react-three-fiber. Search GitHub (e.g. "threejs skills claude", "CloudAI-X/threejs-skills", "react-three-fiber SKILL.md", awesome-claude-skills lists, skills.sh / skillsmp marketplaces) and any official plugin marketplaces.
For each candidate (aim for 3–6): repo URL, stars, last commit date, licence, list of skills inside, quality of content (accuracy vs current three.js r17x/r18x and r3f v9 APIs — spot-check 2–3 skills by reading their SKILL.md raw files), and SAFETY review: does it contain scripts, hooks, settings changes, network calls, or prompt-injection-like instructions? Only read; do NOT install anything.
Recommend one (or a combination), and give the exact install method (e.g. git clone into ~/.claude/skills/<name> or a /plugin marketplace add command), plus which skills to install vs skip.`,
  },
  {
    key: 'type-sound-legal',
    prompt: `TOPIC: Three supporting areas.
(A) TYPOGRAPHY: find the closest free (OFL/Apache, ideally on Google Fonts or Fontsource) substitutes for Beaufort for LOL (display serif with flared/wedge serifs, used in caps for headers/buttons) and Spiegel (humanist sans for body). Compare candidates by concrete glyph traits (serif shape, stroke contrast, cap proportions, R/G/Q/W shapes, numerals), weights available, variable font support, and file size. Candidates to evaluate at least: Marcellus / Marcellus SC, Cinzel, Cormorant SC, Forum, Philosopher, Cormorant Garamond, Trirong, Rosarivo, Spectral SC, Petrona; body: Barlow, Barlow Semi Condensed, Fira Sans, Source Sans 3, Hind, Mulish, Inter. Recommend a pairing + fallback, the numerals font for timers/counters, and loading strategy (self-host via @fontsource, font-display, preload, subsetting).
(B) SOUND: League-like UI sound design without Riot audio — royalty-free/CC0 sources (Kenney UI audio, freesound.org CC0 packs, Sonniss GDC bundles licence), or synthesising with Web Audio/Tone.js (metallic tick hover, crystalline click, queue-pop bell, lock-in whoosh, ambient magic hum). Mute-by-default UX, autoplay policies, use-sound/howler vs raw Web Audio, file formats/sizes.
(C) LEGAL: Riot Games' "Legal Jibber Jabber" fan content policy — exact current disclaimer text, what it permits/forbids (assets usage, monetisation, use of "League of Legends" name/logos), and whether a personal portfolio styled after the client is fine; recommend our footer disclaimer wording and naming rules (e.g. avoid Riot logos/trademarks in branding). Cite the policy URL and quote the disclaimer verbatim (it is short).`,
  },
]

// Checkpoint 2026-11-09: these four reports were finished before the run was stopped; they are reused, not redone.
// Checkpoint 2026-11-10: all nine reports are written; pass the saved critic result as args.critique (docs/checkpoints/critic-result.json) to skip the critic too.
const DONE = ['ready-check', 'champ-select', 'shell-lobby-screens', 'webgl-magic', '3d-logos', 'stack-modernization', 'codebase-audit', 'threejs-skill', 'type-sound-legal']
const TODO = TOPICS.filter(t => !DONE.includes(t.key))
log(`Reusing ${DONE.length} finished reports; running ${TODO.length}: ${TODO.map(t => t.key).join(', ')}`)
phase('Research')
const reports = await parallel(TODO.map(t => () => agent(
  `${CONTEXT}\n\nYOUR REPORT PATH: ${ROOT}/docs/research/2026-11-09-${t.key}.md (write the full report there in Markdown, with a Sources section).\n\n${t.prompt}\n\nReturn the structured summary.`,
  { label: `research:${t.key}`, phase: 'Research', schema: REPORT_SCHEMA }
)))
const ok = [
  ...DONE.map(key => ({ key, report_path: `${ROOT}/docs/research/2026-11-09-${key}.md`, summary: '(finished before checkpoint; read the file)', uncertainties: [] })),
  ...reports.map((r, i) => r ? { key: TODO[i].key, ...r } : null).filter(Boolean),
]
const failed = TODO.filter((t, i) => !reports[i]).map(t => t.key)
if (failed.length) log(`Research agents with no result: ${failed.join(', ')}`)
log(`${ok.length}/${TOPICS.length} research reports written`)

phase('Critique')
const GAP_SCHEMA = {
  type: 'object',
  properties: {
    gaps: { type: 'array', items: { type: 'object', properties: {
      topic: { type: 'string' }, question: { type: 'string' }, why_it_matters: { type: 'string' }, priority: { type: 'string', enum: ['high', 'medium', 'low'] },
    }, required: ['topic', 'question', 'why_it_matters', 'priority'] } },
    contradictions: { type: 'array', items: { type: 'object', properties: {
      between: { type: 'string' }, issue: { type: 'string' }, resolution_needed: { type: 'string' },
    }, required: ['between', 'issue', 'resolution_needed'] } },
  },
  required: ['gaps', 'contradictions'],
}
const critique = (args && args.critique) ? args.critique : await agent(
  `${CONTEXT}\n\nYou are a completeness critic. Read every report file listed below in full, plus the existing research doc. Find: (1) GAPS — questions a senior implementer would still need answered to build this premium League-client-styled portfolio (missing measurements/timings, unverified key claims, a screen or component nobody covered, version-compat holes, content we lack), (2) CONTRADICTIONS between reports (e.g. different version recommendations, different section mappings). Be specific and actionable; each gap must be answerable by one focused research agent. Max 10 gaps, prioritised.\n\nReports:\n${ok.map(r => `- ${r.key}: ${r.report_path}`).join('\n')}`,
  { label: 'critic', phase: 'Critique', schema: GAP_SCHEMA }
)
const gaps = (critique && critique.gaps) || []
const contradictions = (critique && critique.contradictions) || []
log(`Critic: ${gaps.length} gaps, ${contradictions.length} contradictions`)

phase('Gaps')
const work = [
  ...gaps.filter(g => g.priority !== 'low').map((g, i) => ({ kind: 'gap', i, text: `GAP (${g.topic}): ${g.question}\nWhy it matters: ${g.why_it_matters}` })),
  ...contradictions.map((c, i) => ({ kind: 'contradiction', i, text: `CONTRADICTION between ${c.between}: ${c.issue}\nResolve: ${c.resolution_needed}` })),
]
const lowSkipped = gaps.filter(g => g.priority === 'low')
if (lowSkipped.length) log(`Skipping ${lowSkipped.length} low-priority gaps: ${lowSkipped.map(g => g.question).join(' | ')}`)
const RESOLVE_SCHEMA = {
  type: 'object',
  properties: { item: { type: 'string' }, answer: { type: 'string' }, confidence: { type: 'string', enum: ['high', 'medium', 'low'] }, sources: { type: 'array', items: { type: 'string' } } },
  required: ['item', 'answer', 'confidence', 'sources'],
}
const resolved = (await parallel(work.map(w => () => agent(
  `${CONTEXT}\n\nResolve exactly this item with focused research (web, npm registry, reading the repo, reading the report files under ${ROOT}/docs/research/). Default to skepticism: verify claims rather than repeating them. Do NOT write any files.\n\n${w.text}\n\nReturn a precise answer (numbers, versions, verbatim quotes where relevant) with sources.`,
  { label: `${w.kind}:${w.i}`, phase: 'Gaps', schema: RESOLVE_SCHEMA }
)))).filter(Boolean)
log(`${resolved.length}/${work.length} gap items resolved`)

phase('Synthesize')
const SYN_SCHEMA = {
  type: 'object',
  properties: {
    brief_path: { type: 'string' },
    section_list: { type: 'array', items: { type: 'object', properties: { section: { type: 'string' }, client_metaphor: { type: 'string' }, key_motion: { type: 'string' } }, required: ['section', 'client_metaphor', 'key_motion'] } },
    target_stack: { type: 'array', items: { type: 'string' } },
    open_questions_for_owner: { type: 'array', items: { type: 'string' } },
    top_risks: { type: 'array', items: { type: 'string' } },
    threejs_skill_recommendation: { type: 'string' },
    summary: { type: 'string' },
  },
  required: ['brief_path', 'section_list', 'target_stack', 'open_questions_for_owner', 'top_risks', 'threejs_skill_recommendation', 'summary'],
}
const synthesis = await agent(
  `${CONTEXT}\n\nYou are the synthesis lead. Read ALL report files below in full and the resolved gap answers. Write ONE design brief to ${ROOT}/docs/research/2026-11-09-synthesis.md that a builder could plan from: (1) final one-page section list in order, each with its client metaphor, layout, content needed, and signature motion (ms/easing); (2) the client header spec; (3) the loading screen (waiting for other players → accepted) storyboard; (4) champion-select stack spec incl. 3D logo pipeline; (5) hextech design tokens (colour, type, spacing, borders/ornaments, motion tokens) as a single table; (6) WebGL/visual layer architecture + perf budget + reduced-motion; (7) target toolchain with exact versions and the migration order; (8) sound + legal (disclaimer text); (9) risks; (10) open questions only the owner can answer (content, preferences). Where reports disagree, pick one and say why. Keep it tight (aim ≤ 2500 words) but complete; link to the detailed reports instead of repeating them.\n\nReports:\n${ok.map(r => `- ${r.key}: ${r.report_path}`).join('\n')}\n\nResolved gaps/contradictions:\n${JSON.stringify(resolved, null, 1)}`,
  { label: 'synthesis', phase: 'Synthesize', schema: SYN_SCHEMA }
)
return { reports: ok.map(r => ({ key: r.key, path: r.report_path, summary: r.summary, uncertainties: r.uncertainties })), failed, contradictions, resolved, synthesis }

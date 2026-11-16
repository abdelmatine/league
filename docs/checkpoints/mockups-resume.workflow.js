export const meta = {
  name: 'hextech-hifi-mockups-resume',
  description: 'RESUME (pass args.kit from docs/checkpoints/kit-result.json to reuse the built kit): build premium animated hi-fi mockups (loader+header+hero, champ-select stack, contact accept flow, projects lobby) on a shared Hextech kit, then dual-lens review, fix and verify',
  phases: [
    { title: 'Kit', detail: 'shared tokens, components, motion eases, synth SFX, three.js helpers, screenshot tool' },
    { title: 'Build', detail: 'one builder per screen' },
    { title: 'Review', detail: 'fidelity lens + craft/perf lens per screen' },
    { title: 'Fix', detail: 'apply review fixes, re-verify' },
    { title: 'Verify', detail: 'final console/screenshot check and gallery' },
  ],
}

const ROOT = 'C:/Users/abdel/Desktop/projects/league'
const HIFI = `${ROOT}/.superpowers/hifi`
const URL = 'http://127.0.0.1:5174/.superpowers/hifi'
const R = `${ROOT}/docs/research`
const CONTEXT = `
PROJECT: ${ROOT} — Abdelmatine's developer portfolio, being rebuilt to feel like the actual League of Legends desktop client at premium, award-winning quality. Owner-approved direction: one scrolling "Hextech landing" page (three.js hextech core hero with particles, gold Hextech frames, GSAP scroll reveals) + the client-style top header. Owner ideas: the Match Found accept flow's "waiting for other players" state as the loading screen; the tech stack as a Champion Select screen where frameworks are champions and 3D logos match the REAL framework shapes; contact form plays queue → match found → accept.
THIS TASK: throwaway hi-fi MOCKUPS (not product code) to show the owner. They must look and move like the real client — owner said "I know you can do better", so aim for jaw-dropping polish: layered gold frames with ornaments, exact client timings/easings, glow/sheen/flare micro-interactions, real depth, bloom, particles, crisp typography. No generic "AI dark template" look.
WHERE: all files under ${HIFI}/ (gitignored). Static server already running: ${URL}/<file> (server root is the repo root, so repo files are reachable, e.g. http://127.0.0.1:5174/public/assets/electrocute.png and /public/icons/*.svg). Never touch src/, public/, package.json or other product files.
RESEARCH (read the parts you need, they contain exact px/ms/easing/hex values measured from the live client's CSS): ${R}/2026-11-09-lol-client-ui.md (palette, button/frame CSS), ${R}/2026-11-09-shell-lobby-screens.md (header, PLAY button, social panel, lobby banners, loading cards, post-game, profile, toasts), ${R}/2026-11-09-ready-check.md (match found + loader storyboard), ${R}/2026-11-09-champ-select.md (champ select layout, timings, Signature Draft mapping), ${R}/2026-11-09-webgl-magic.md (hextech core shaders, particles, bloom, perf tiers, version pins). Also read when relevant: ${R}/2026-11-09-3d-logos.md (logo extrusion specifics), ${R}/2026-11-09-type-sound-legal.md (§C legal/copy rules, §B sound), ${R}/2026-11-09-codebase-audit.md (real content gaps). FONTS: keep the kit's provisional fonts (Marcellus SC display, Cinzel digits, Barlow body) on every page; the final pairing is an owner decision later, so do not switch fonts per page.
REAL CONTENT: ${ROOT}/src/data/projects.ts and ${ROOT}/src/data/stacks.ts (read them; project images in /public/assets, icons in /public/icons). Owner name: Abdelmatine; role: Software Engineer (full stack: web + mobile).
LIBS (CDN only, exact versions): three@0.187.0 via <script type="importmap"> {"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.187.0/examples/jsm/"}}; GSAP 3.15.1 from https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/ (gsap.min.js, CustomEase.min.js, ScrollTrigger.min.js, SplitText.min.js, Flip.min.js, DrawSVGPlugin.min.js — GSAP and all plugins are free); lenis@1.3.27 optional; Simple Icons SVGs from https://cdn.jsdelivr.net/npm/simple-icons@16.37.0/icons/<slug>.svg (single-path, ideal for SVGLoader + ExtrudeGeometry).
HARD RULES: never load or hotlink any Riot asset (nothing from raw.communitydragon.org, ddragon, riotgames or leagueoflegends domains — no images, videos, sounds, fonts); no Beaufort/Spiegel fonts; draw every ornament, icon and glyph yourself (SVG/CSS/canvas/shaders); sounds only synthesised with Web Audio, muted by default. COPY: avoid Riot-specific nouns in UI text (Summoner, Honor, RP, LP, BE, Clash, champion names, "League of Legends"); generic game words like PLAY, IN QUEUE, MATCH FOUND, ACCEPT, LOCK IN, VICTORY are fine (type-sound-legal §C). Respect prefers-reduced-motion (instant/opacity-only fallbacks). No console errors. Desktop 1440x900 is the primary viewport; must also be usable at 390x844.
SCREENSHOT TOOL (after the Kit phase): node ${HIFI}/tools/shoot.mjs — read its header comment for usage. Use it to look at your work (Read the PNGs) — never claim something looks right without looking.`

const RESULT_SCHEMA = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
    deviations_from_research: { type: 'array', items: { type: 'string' } },
    known_issues: { type: 'array', items: { type: 'string' } },
    screenshots: { type: 'array', items: { type: 'string' } },
  },
  required: ['files', 'summary', 'deviations_from_research', 'known_issues', 'screenshots'],
}

// The kit was built on 2026-11-10 (docs/checkpoints/kit-result.json). It is reused unless args.rebuildKit is true.
const KIT_DONE = {"files":["C:/Users/abdel/Desktop/projects/league/.superpowers/hifi/tools/shoot.mjs","C:/Users/abdel/Desktop/projects/league/.superpowers/hifi/tools/package.json","C:/Users/abdel/Desktop/projects/league/.superpowers/hifi/kit/hextech.css","C:/Users/abdel/Desktop/projects/league/.superpowers/hifi/kit/motion.js","C:/Users/abdel/Desktop/projects/league/.superpowers/hifi/kit/sfx.js","C:/Users/abdel/Desktop/projects/league/.superpowers/hifi/kit/header.js","C:/Users/abdel/Desktop/projects/league/.superpowers/hifi/kit/stage.js","C:/Users/abdel/Desktop/projects/league/.superpowers/hifi/kit/demo.html"],"summary":"The Hextech kit is built, and I checked every part in screenshots. The demo page (http://127.0.0.1:5174/.superpowers/hifi/kit/demo.html) gives no console errors or warnings at 1440x900, 390x844, 768/800/1024/1280 and in reduced motion. It renders on the GPU (Intel UHD through ANGLE D3D11, headless Chrome 155). There is no horizontal scroll at 390.\n\nParts:\n\n1. **tools/shoot.mjs** (playwright-core 1.65.0 installed in tools/). Uses system Chrome, falls back to Edge, launches with the GPU flags, and relaunches on SwiftShader if WebGL is missing. Flags: --times, --steps (click/hover/type/key/scroll, plus an `eval` step), --reduced-motion, --full-page, --prefix. Writes `<prefix>-<ms>.png` and `<prefix>-console.json`, prints a JSON summary with the actual capture times, and exits 1 on a page error or failed step, 2 on bad arguments. I tested it on index.html, on a page that throws, and with no arguments. In --full-page mode it scrolls through the page before each capture so offscreen WebGL and scroll reveals draw.\n\n2. **kit/hextech.css**:\n   - Tokens: gold, blue, grey, red and status scales, gradients including hover and press, and the client durations and easings.\n   - Base: body #010A13, gold focus ring, 11px client scrollbars, type scale in px.\n   - Components: .hx-frame (anchored 2px border, halo, gem and cap ornament strips, plus --top, --gold, --corners and a pure-CSS --chamfer variant), .hx-btn-gold with every layer (300ms border, 400ms background, 600ms glow, text pulse, 100ms press, disabled; the release layers are injected by motion.js), .hx-btn-magic (drifting teal noise texture, hover tint), main and secondary .hx-tabs, input and textarea, .hx-select, .hx-checkbox, .hx-tooltip, .hx-toast (ticks ring turns every 30s), .hx-crest (metal rim, animatable XP ring, level pill), .hx-counter, .hx-divider, .hx-modal on a native dialog, .hx-scroll-cue.\n   - Extras: .hx-dot and .hx-progress, plus the header styles.\n\n3. **kit/motion.js**: registers every named curve from the task plus the other curves in the research tables. Exports reducedMotion(), goldButtonFX() (scale .94→1 in 130ms, 330ms sheen at −5°, two corner flares 30ms apart), splitReveal() (chars rise, unblur, white glow fades, tracking settles), frameBuildIn() (a glowing gold line draws from the top centre round both sides, cools into the real border, then the strips unfold) and counterUp(). Each has a reduced-motion path.\n\n4. **kit/sfx.js**: Web Audio only, with a generated reverb. Sounds: hover, click, select, queuePop (bell partials 1318/1976 Hz plus a noise swell), accept, lockIn (whoosh plus impact) and an ambient loop. Muted by default, the choice is kept in localStorage, and nothing plays before the first user gesture. Also exports subscribe() and wire().\n\n5. **kit/header.js**: `<hx-header>`. 79px bar plus 1px border, 215 / fluid / 225 grid, sticky with a 12px blur.\n   - PLAY is drawn in SVG to the research geometry, with a monogram \"A\" crest overlapping the plate by 14px. The teal swirl is feTurbulence noise shown through two dashed masks, with two blur layers, a 1500ms cycle on hover and 750ms bursts.\n   - setPlayState() covers patching (fill bar, spinning ring), play, queue (wider plate, m:ss timer), found (flash) and accepted.\n   - Five tabs with pop effect, three drawn icon tabs with tooltips and the 700ms glow collapse, separators, two counters, 40px crest with XP ring, sound toggle tied to sfx.\n   - Below 768px: 56px bar and a drawer built like the social panel.\n   - Events: hx-play, hx-nav, hx-loot, hx-playstate.\n\n6. **kit/stage.js**:\n   - createStage(): pixel budget per tier, EffectComposer with UnrealBloomPass at threshold 1.0 and OutputPass with AgX tone mapping, procedural environment lighting, tier switching on the median frame time, pauses when offscreen, one still frame in reduced motion.\n   - buildHextechCore(): flat-shaded 6-sided crystal (two-sided fake glass on mid/low, real transmission on high), fbm energy sphere, fresnel halo, gold hex rings with glowing nodes, procedural rune ring plus tick dial, pointer parallax, intro().\n   - buildParticles(): curl drift, gold and teal sprites.\n   - buildLogo(): Simple Icons SVG to a cached extrusion with a brand-colour face (pale gold for dark brands) and gold sides.\n   - buildPedestal(): stepped hex tiers, teal inlay, rotating rune ring, light pool, contact shadow, faint beam.\n   - Forced high and low tiers both compile and render cleanly.\n\n7. **kit/demo.html**: shows every component, the live header, a framed 3D core, and a pedestal stage that loads real logos (React, Angular, Spring Boot, Flutter, TypeScript, Node.js). It has buttons to replay the motion helpers, switch PLAY states and play each sound.\n\nBugs found and fixed through screenshots:\n- The base `svg{max-width:100%}` rule shrank PLAY to 81%.\n- `--hx-on` did not reach `::before`, so the active-tab pointer never showed.\n- Marcellus SC's \"1\" reads as \"I\"; digits now come from Cinzel.\n- The magic texture looked dirty, and the energy core blew out to white.\n- Full-page captures came out black for WebGL.\n- The tier dropped wrongly because screenshot stalls made long frames.\n- The toast caused a 2px overflow at 390px.\n- The patching fill could get a negative width.\n\nI also added an accessible muted grey after the design linter flagged #5B5A56 captions as low contrast.","known_issues":["Fonts are provisional. When docs/research/2026-11-09-type-sound-legal.md lands, update the @import, --font-display and --font-body in hextech.css.","On 1x screens at 12–14px, Cinzel's '1' flag is about 1px, so small digits can still look like 'I'. At 2x and above they are clear.","'HX Digits' points at a pinned gstatic URL (Cinzel v26 latin). If Google retires that version, digits fall back to Marcellus SC.","Only one GPU was measured: Intel UHD through ANGLE D3D11 in headless Chrome 155. It runs at 60fps and stays on the mid tier. High and low were only checked by forcing them. allowHigh() is a renderer-string check, so iGPUs and Macs stay on mid, and it may log a deprecation warning in Firefox.","With WebGL readback, each screenshot takes about 0.3–1s, so closely spaced --times drift. The summary reports the actual ms; use eval steps for precise triggers. Playwright clicks also wait for elements to be stable.","In --full-page captures, one stray pixel can appear at the pedestal canvas edge. It is a compositing artifact and does not show in viewport captures.","demo.html opens two WebGL contexts (core and pedestal). The product should use one fixed canvas (webgl report §2).","Sounds were checked to run without errors after unmuting, but nobody has listened to them (headless).","Placeholder content to confirm: 5 years (the research example; level = years), XP .62, GitHub URL https://github.com/abdelmatine guessed from the git user. The 11 projects come from projects.ts. The avatar is /public/assets/foto.jpg.","The avatar crop uses object-view-box, which only works in Chromium. Firefox and Safari show the whole photo inside the crest.","Tab glow, the modal and drawer open/close transitions, and the select picker rely on @property, @starting-style, allow-discrete and base-select. Older browsers fall back to instant changes or a native list.","The pressed magic label (#005A82) is low contrast. That is the client's value, and the state is transient.","Added one gradient-text ignore to .impeccable/config.json, scoped to kit/hextech.css (the client's measured 'promoted number' gradient)."],"deviations_from_research":[],"screenshots":[]}
phase('Kit')
const kit = (args && args.kit) ? args.kit : !(args && args.rebuildKit) ? KIT_DONE : await agent(`${CONTEXT}

YOUR JOB: build the shared Hextech KIT every screen will import, plus the screenshot tool. Quality of this kit sets the ceiling for everything — make components faithful to the research (exact layers, gradients, timings) and beautiful.

1) ${HIFI}/tools/shoot.mjs + install: run \`npm init -y\` and \`npm i playwright-core@latest\` inside ${HIFI}/tools (gitignored). Use the system browser via channel 'chrome' (C:/Program Files/Google/Chrome/Application/chrome.exe exists) with fallback 'msedge'; launch with args ['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist'] so WebGL works (fall back to SwiftShader if needed). CLI: node shoot.mjs <url> --out <dir> [--size 1440x900] [--times 0,600,1500,4000] [--steps "<json array of {at:ms, click|hover|type|scroll|key: ...}>"] [--reduced-motion] [--full-page]. It must: save one PNG per timepoint named <prefix>-<ms>.png, write console messages + page errors + failed requests to <dir>/<prefix>-console.json, print a JSON summary to stdout, and exit non-zero on page errors. Document usage in a header comment. Test it on ${URL}/index.html.

2) ${HIFI}/kit/hextech.css — design tokens as CSS custom properties (full gold/blue/grey/red scales, hextech-black, gradients incl. hover/press, motion tokens: durations + the client easings), fonts (@import Google Fonts per the rule above), base (body #010A13, text grey-100, selection, focus-visible ring in gold, thin scrollbars), and components: .hx-frame (2px gradient border, halo, ornament strips top/bottom via pseudo-elements, optional chamfered corners variant), .hx-btn-gold (ALL layers from the research: idle border, transition border fade 300ms, bg fade 400ms, 600ms glow pulse, text-shadow pulse, press 100ms, release scale .94→1 130ms, sheen sweep 330ms, corner flares 400ms — use extra spans if pseudo-elements are not enough, plus disabled), .hx-btn-magic (blue, animated texture behind, hover tint, focus), .hx-tabs (main nav tab style from the shell report: 14px/700/.075em, #CDBE91→#F0E6D2, active top pointer + bottom glow, hover glow in 100ms out 400ms; secondary tab with 1px fading underline), .hx-input/.hx-textarea, .hx-select, .hx-checkbox, .hx-tooltip, .hx-toast, .hx-crest (round avatar with gold rim, XP ring arc, level pill), .hx-counter, .hx-divider (gold hairline with diamond centre), .hx-modal + backdrop, .hx-scroll-cue. Everything keyboard-accessible.

3) ${HIFI}/kit/motion.js — ES module, expects gsap + plugins loaded as globals; registers CustomEase curves by name from the research (rc-slam '.2,.9,0,1', rc-mag '1,0,1,1', settle '0,0,0,1', popIn '.87,.07,.98,.38', ringPop '0,.74,1,1', shine '0,0,.15,.99', glowOff '.7,.21,.68,.77', urgent '.46,.19,.7,.98', soft '0,0,.33,1'), exports reducedMotion(), and helpers: goldButtonFX(el) (JS-driven sheen+flare on release), splitReveal(el) (SplitText caps reveal), frameBuildIn(el) (border draw-in + ornament fade), counterUp(el, to).

4) ${HIFI}/kit/sfx.js — ES module, Web Audio synthesised UI sounds: hover (soft metallic tick), click (crystalline chime), select, queuePop (bell, bright), accept (rising shimmer), lockIn (whoosh + impact), ambient hum (optional loop). Global mute default ON, toggle(), persisted in localStorage (try/catch). No audio files.

5) ${HIFI}/kit/header.js — custom element <hx-header active="home"> rendering the client header from the shell report: 79px bar + 1px rgba(240,230,209,.25) border, 215/840/225 grid at 1280+ (fluid between), PLAY button drawn in SVG (arrow plate 32px tall, 15px tip, concave left arc r≈21.46, our own monogram crest "A" overlapping ~14px, 162x58 hit box, #F0E6D2 label, teal swirl effect recreated with an SVG noise/turbulence or animated gradient revealed through dashed strokes, 1500ms hover cycle, 750ms bursts), nav tabs HOME · PROJECTS · STACK · CAREER · CONTACT, right cluster: three icon tabs we draw (profile, collection, loot), 2×57px gold separators, two stacked counters (projects count, years of experience), 40px crest with XP ring, sound toggle (wired to sfx.js). Expose element.setPlayState('patching'|'play'|'queue'|'found'|'accepted') with distinct visuals (patching = fill bar while loading; queue = timer m:ss). Sticky with blur backdrop per the shell report. Below 768px: 56px bar + drawer nav styled like the social panel.

6) ${HIFI}/kit/stage.js — ES module (imports 'three' and 'three/addons/...'): createStage(canvas, {tier}) with renderer (DPR clamp per tier), EffectComposer + UnrealBloomPass (mipmap-style threshold) + OutputPass, a tier switch based on frame time; buildHextechCore() (hexagonal bipyramid crystal via LatheGeometry 6 segments flat-shaded, fake-glass physical material on mid/low, fbm energy sphere shader, additive BackSide fresnel halo, gold hex rings TorusGeometry(r,0.018,4,6), rotating rune ring drawn procedurally); buildParticles(count) (curl-noise drift, additive soft sprites, gold+teal); buildLogo(svgText, {depth, bevel, faceColor}) using SVGLoader.createShapes + ExtrudeGeometry with face/side material groups (brand-colour or pale-gold face, hextech gold metal bevel/sides), centred and normalised to unit size, cached; buildPedestal() (hex platform with emissive rune ring and soft contact shadow). Use the shader/perf guidance in the webgl report.

7) ${HIFI}/kit/demo.html — a kit showcase page (all components + header + a small 3D core canvas) so reviewers can check the kit. Screenshot it with shoot.mjs at 1440x900 and fix what looks off before you finish.

Return files, summary, deviations, known issues, screenshot paths.`, { label: 'kit', phase: 'Kit', schema: RESULT_SCHEMA })
if (!kit) { log('Kit agent failed — stopping'); return { error: 'kit failed' } }
log(`Kit ready: ${kit.files.length} files`)

const SCREENS = [
  {
    key: 'home',
    file: 'home.html',
    brief: `FIRST IMPRESSION PAGE: loader → header → hero (+ a short About/Profile band below the hero).
LOADER (from the ready-check report's loader design): inline-painted overlay before any heavy JS; the "waiting for other players" ring (291° arc starting 214.5°, 5 segments of 56.6° with 2° notches); segment 1 = "you" fills at +300ms; segments 2–5 = REAL milestones (document.fonts.ready, three module imported, scene compiled via renderer.compile/compileAsync, first frame rendered) with a minimum total of ~1.6s and a 10s CSS failsafe; title "MATCH ACCEPTED" + subtitle "WAITING FOR OTHER PLAYERS" with the 2017 text-change animation; when all ready → the reveal sequence from the report (notches dissolve, ring flash #CDFAFA, title zoom-out, portal burst) dissolving into the site; header slides in; PLAY goes patching → play with the 750ms intro burst.
HERO: full-viewport three.js hextech core (crystal + fbm energy + fresnel halo + hex rings + rune ring + curl particles + bloom), mouse parallax, scroll-linked camera pull-back with ScrollTrigger; name ABDELMATINE in display caps with a SplitText reveal and gold hairline; role line; social identity chip (crest with XP ring, name, green dot "Open to work"); CTAs: magic button "VIEW PROJECTS" (FIND MATCH style 188x48 with drawn wings) + gold button "CONTACT"; scroll cue. Below: an ABOUT band styled like the client PROFILE (big crest with level ring = years coding, "mastery" tokens = top 3 frameworks, short bio placeholder text marked as placeholder).`,
  },
  {
    key: 'stack',
    file: 'stack.html',
    brief: `TECH STACK AS CHAMPION SELECT (follow the champ-select report's "Signature Draft" mapping and measured layout/timings exactly).
Include: top header (<hx-header active="stack">); phase banner + two draining timer bars into a number; left column = 5 "mains" one per role (Backend=TOP, Data=JUNGLE, Frontend=MID, Mobile=BOT, Core=SUPPORT) as ally cards; right column = "learning next" cards; centre = role filter icons (draw our own 34x34 two-tone glyphs) + search + grid of framework tiles (67px, 6 per row) built from src/data/stacks.ts plus any missing frameworks from public/icons (Java, Kotlin, Python, C, C++, Qt, Next.js, NestJS, Node.js, PostgreSQL, Redis, Supabase, MinIO, TypeScript, JavaScript, React Native...). Tiles use Simple Icons glyphs (check each slug exists: curl -s -o /dev/null -w '%{http_code}' https://cdn.jsdelivr.net/npm/simple-icons@16.37.0/icons/<slug>.svg; if missing, fall back to /public/icons/<name>.svg). Hover = gold corner brackets + sfx; selecting a tile = the centre 3D view swaps to that framework's REAL logo extruded in 3D (kit stage.js buildLogo, brand-colour face + gold bevel) on the hex pedestal, slow idle rotation, hover tilt, swap animation; LOCK IN shield button (166x43) plays the 600ms lock-in card timeline (ring pop, shine, white flash, ghost logo Flip into the ally card, splash slide) from the report. On first view (ScrollTrigger at 40% visibility) play the ≤6.2s auto "draft" intro locking the 5 mains in order, skippable by click/key/scroll. Bottom bar: "skin carousel" = projects that use the selected framework (from projects.ts frameworks icons) + details panel (years, mastery, skills). Mobile 390px: stacked layout per the report.`,
  },
  {
    key: 'contact',
    file: 'contact.html',
    brief: `CONTACT AS QUEUE → MATCH FOUND → ACCEPT (follow the ready-check report's contact storyboard B1–B3 exactly).
Include header (<hx-header active="contact">), a hextech-framed contact form (Your name, Email, Message; client-style inputs; validation on blur with client-styled error text). SEND (magic button) → button becomes IN QUEUE and the header PLAY → queue state; a queue card appears under the header profile ring: "FINDING MATCH", elapsed m:ss, "Estimated: 0:02" in #2CC0DE, gold X to cancel → after ~2.5s simulated send success: MATCH FOUND dialog (backdrop rgba(1,10,19,.82) 200ms, dialog slam 280ms, icon slam, title intro 233ms, details 466ms, ring ignites at +180ms, 12s clockwise ring drain with leading white-cyan spark, our own drawn emblem in the centre, big blue ACCEPT! plate, DECLINE text) → ACCEPT: ring refill 180ms + flash #84FEFA, plate flash #52B1BB, text swaps to MATCH ACCEPTED / "Abdelmatine will reply within 24h", then outro and a celebration toast (422x135 with ticks ring from the shell report) "MESSAGE DELIVERED". DECLINE → back to form with content kept. Also a social strip styled like the client's social panel (friends list rows: GitHub, LinkedIn, Email, Instagram with status lines). No real network sending (simulate).`,
  },
  {
    key: 'projects',
    file: 'projects.html',
    brief: `PROJECTS AS PARTY LOBBY + CAREER AS LOADING SCREEN + ACHIEVEMENTS AS POST-GAME (follow the shell-lobby-screens report measurements).
Section 1 PROJECTS: header (<hx-header active="projects">) then the lobby: tall banners (196x592 proportion, scale to fit) filled centre-out in visual order 4-2-1-3-5 with the measured intro animation; each banner = a real project from projects.ts (image from /public/assets, name in display caps, category, tech crests from its frameworks, rating as a rank-style emblem we draw), the local-player (featured) banner gets the 180px crest + #FABE0A name treatment; "+" invite slots (80px) for "next project"; carousel/pager to page through more than 5 projects; FIND MATCH style magic button bottom-centre = "VIEW LIVE". Clicking a banner opens a project detail modal styled as a client modal (frame with ornaments, buttons docked on the bottom border).
Section 2 CAREER: loading-screen cards (portrait ~1:1.8, two rows on desktop) = roles/education entries (placeholder content clearly marked), each with a loading % bar that fills as it scrolls into view.
Section 3 ACHIEVEMENTS: post-game style: VICTORY banner animation, progression bars filling (XP / mastery), stat tiles (projects shipped, years, technologies) with the measured card fly-in (translateZ(600) translateY(400) over 2s cubic-bezier(.25,1,0,1)).`,
  },
]

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['premium', 'good-needs-polish', 'not-there'] },
    fixes: { type: 'array', items: { type: 'object', properties: {
      severity: { type: 'string', enum: ['critical', 'major', 'minor'] },
      where: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' },
    }, required: ['severity', 'where', 'problem', 'fix'] } },
    screenshots: { type: 'array', items: { type: 'string' } },
  },
  required: ['verdict', 'fixes', 'screenshots'],
}

const LENSES = [
  { key: 'fidelity', text: 'FIDELITY lens: does it look and move like the ACTUAL League client? Check every measurable against the research reports (sizes, layout ratios, colours, borders/ornaments, typography caps/tracking, ms timings and easings, sequence order). Flag anything that reads as a generic dark template instead of the client. Also flag any Riot asset usage or hotlink (critical).' },
  { key: 'craft', text: 'CRAFT/PERF lens: is it premium? Visual hierarchy, spacing rhythm, alignment, typography quality, depth/lighting/bloom balance, motion quality (no janky or linear UI motion, no overlapping chaos, sensible choreography), interaction states (hover/focus/active/disabled), console errors, frame rate (measure with a rAF sampler in the page via shoot steps or reasoning about cost), reduced-motion behaviour (shoot with --reduced-motion), and the 390x844 mobile layout (shoot it).' },
]

// args.only = ['home'] etc. runs one screen per session (see docs/BACKLOG.md T10-T13); omit to run all four.
const ACTIVE = (args && args.only) ? SCREENS.filter(s => args.only.includes(s.key)) : SCREENS
log(`Screens this run: ${ACTIVE.map(s => s.key).join(', ')}`)
const results = await pipeline(
  ACTIVE,
  s => agent(`${CONTEXT}

KIT (already built — read it first and USE it, don't re-implement): ${kit.files.join(', ')}. Kit notes: ${kit.summary}

YOUR SCREEN: ${HIFI}/${s.file}
${s.brief}
RESUME NOTE: a previous builder was stopped mid-way; if ${HIFI}/${s.file} and ${HIFI}/${s.key}/ already exist, read them and continue from them rather than starting over (keep what is good, fix what is not).

Process: plan the choreography first (a GSAP master timeline per sequence), build, then screenshot with shoot.mjs at 1440x900 at meaningful timepoints and interactions, look at every PNG, fix, repeat until it is genuinely premium; also shoot 390x844 and --reduced-motion. You may add page-specific files under ${HIFI}/${s.key}/ but do NOT edit kit files (report kit bugs in known_issues). Save screenshots under ${HIFI}/shots/${s.key}/. Return files, summary, deviations, known issues, screenshot paths.`,
    { label: `build:${s.key}`, phase: 'Build', schema: RESULT_SCHEMA }),
  (built, s) => built && parallel(LENSES.map(l => () => agent(`${CONTEXT}

You are an independent, demanding reviewer. Default to skepticism: the builder believes it is done; find what keeps it from feeling like the real client at premium quality.
SCREEN: ${URL}/${s.file} (source ${HIFI}/${s.file} and ${HIFI}/${s.key}/, kit in ${HIFI}/kit/). Builder summary: ${built.summary}. Builder's known issues: ${JSON.stringify(built.known_issues)}.
${l.text}
Use shoot.mjs yourself (save under ${HIFI}/shots/${s.key}/review-${l.key}/) and look at the PNGs. Do not edit any files. Return at most 15 fixes, most important first, each concrete enough to implement without asking.`,
    { label: `review:${s.key}:${l.key}`, phase: 'Review', schema: REVIEW_SCHEMA }))).then(reviews => ({ built, reviews: reviews.filter(Boolean) })),
  (rv, s) => rv && agent(`${CONTEXT}

KIT: ${HIFI}/kit/ (you may now fix kit bugs only if the fix cannot break other screens; prefer page-level overrides).
YOUR SCREEN: ${HIFI}/${s.file} (+ ${HIFI}/${s.key}/). Two independent reviewers returned these fixes:
${JSON.stringify(rv.reviews, null, 1)}
Apply every critical and major fix, and minor ones that are cheap. If you disagree with a fix, say why in deviations. Then re-shoot (1440x900 key timepoints, 390x844, --reduced-motion) into ${HIFI}/shots/${s.key}/final/, look at them, and make sure the console has zero errors. Return files, summary of what changed, remaining known issues, and final screenshot paths.`,
    { label: `fix:${s.key}`, phase: 'Fix', schema: RESULT_SCHEMA }).then(fixed => ({ key: s.key, file: s.file, built: rv.built, reviews: rv.reviews.map(r => ({ verdict: r.verdict, n: r.fixes.length })), fixed })),
)

phase('Verify')
const done = results.filter(Boolean)
const failedScreens = ACTIVE.filter(s => !done.find(d => d.key === s.key)).map(s => s.key)
if (failedScreens.length) log(`Screens without a final result: ${failedScreens.join(', ')}`)
const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    pages: { type: 'array', items: { type: 'object', properties: {
      file: { type: 'string' }, console_errors: { type: 'number' }, verdict: { type: 'string' }, best_screenshots: { type: 'array', items: { type: 'string' } }, notes: { type: 'string' },
    }, required: ['file', 'console_errors', 'verdict', 'best_screenshots', 'notes'] } },
    gallery: { type: 'string' },
    riot_asset_check: { type: 'string' },
  },
  required: ['pages', 'gallery', 'riot_asset_check'],
}
const verify = await agent(`${CONTEXT}

FINAL VERIFIER. Pages: ${done.map(d => `${URL}/${d.file}`).join(', ')} plus ${URL}/kit/demo.html.
1) Shoot each page at 1440x900 (several timepoints covering the intro sequences) and 390x844; record console errors (must be 0 — if a page has errors, fix trivial ones directly in that page's files and re-shoot; report anything non-trivial).
2) grep all files under ${HIFI}/ (excluding tools/node_modules) for riot/communitydragon/ddragon/leagueoflegends URLs and for Beaufort/Spiegel — report findings (must be none).
${(args && args.only) ? '3) Do NOT touch index.html: the gallery is built in a later task (BACKLOG T14). Skip this step.' : ''}
3) (only when no args.only was given) Rewrite ${HIFI}/index.html as a polished Hextech-styled gallery (using the kit) linking every page with a one-line description and a thumbnail screenshot each (copy the best PNG to ${HIFI}/shots/thumbs/).
Return per-page verdict, console error counts, best screenshot paths, gallery path, and the Riot-asset check result.`, { label: 'verify', phase: 'Verify', schema: VERIFY_SCHEMA })

return { kit: { files: kit.files, summary: kit.summary, known_issues: kit.known_issues }, screens: done.map(d => ({ key: d.key, file: d.file, reviews: d.reviews, fixed: d.fixed && { summary: d.fixed.summary, known_issues: d.fixed.known_issues, screenshots: d.fixed.screenshots } })), failedScreens, verify }

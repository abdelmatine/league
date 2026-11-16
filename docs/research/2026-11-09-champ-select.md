# Champion Select: anatomy, motion, and the "Stack Select" re-skin

Date: 2026-11-09. Scope: the League client's Champion Select (draft) screen, taken apart down to px/ms/easing, then mapped onto the portfolio's tech-stack section ("frameworks are champions"). Builds on `docs/research/2026-11-09-lol-client-ui.md` (palette, gold/magic buttons, frames, fonts). That file's content is not repeated here.

Rule: we copy numbers and behaviour only. Every Riot sprite, video, SVG path, sound and font named below is reference material. None of it ships.

## 0. TL;DR

- The numbers come from the live client's own champ-select plugin (client **16.22**; CSS dated 2026-10-31, JS 2026-11-04), read from CommunityDragon's raw mirror. Treat them as ground truth, not guesses.
- **Layout (1280×720 stage):** two 25% team columns (5 cards × 80px), a 50% centre column holding the header timer (68px), a grid header (40px), a 633×456 grid of 67px tiles (6 per row), the LOCK IN button (166×43, a shield shape) and a 37px loadout row.
- **Phases:** PLANNING 15s → bans 30s (simultaneous) → reveal 5s → picks 6 turns × 30s (order 1-2-2-2-2-1) → FINALIZATION 30s → GAME_STARTING.
- **Motion signature:** a *slam* (`cubic-bezier(1,0,1,1)`, 170–270ms), then a *settle* (`cubic-bezier(0,0,0,1)`, 570–900ms), then *glow-off* (a white text-shadow copy fading 600–900ms). Dramatic reveals are staggered 650–700ms apart. When time runs low, things pulse at 1Hz ×10. Errors get a ±1px shake for 300ms. Ambient rings rotate slowly (90° per 60s; 160s and 190s per full turn).
- **Lock-in** is a 600ms base timeline on the player card: ring pop, shine sweep, two magic swirls and a text flash. The centre splash flashes `brightness(1.5→1)` over 900ms, holds for 1.7s, then slides ±300px toward the team side with `blur(8px)` in 200ms.
- **Ban:** the banned splash is sliced by a 12px bar that rotates ±45°, the halves drift ±35px over 2.5s, and the whole thing goes greyscale in 400ms. During your ban turn the screen takes a red overlay of `rgba(183,0,0,.37)`.
- **Recommended mapping (Alt 1, "Signature Draft"):** frameworks are champions; 5 role filters become categories (Backend=TOP, Data=JUNGLE, Frontend=MID, Mobile=BOT, Core=SUPPORT). The left column holds my 5 mains, locked in by a ≤6.5s intro. The right column holds "next opponents" (what I'm learning) or flex picks. The centre shows the selected framework's extruded logo on a hexagonal pedestal. LOCK IN opens that framework's build sheet: projects as a skin carousel, skills as runes, tools as spells. Bans show 3 anti-patterns, or are switched off.
- **Versions:** gsap 3.15.1 (published 2026-11-04) with @gsap/react 2.1.2, which already include CustomEase/Flip/SplitText. Keep @react-three/fiber 8.18.0 + drei 9.122.0 while the site is on React 18.3, because R3F 9.x needs React ≥19 <19.4.

Tags used below: **[css]** and **[js]** = the live client plugin; **[img]** = a client sprite I looked at, not reused; **[wiki]** = League wiki; **[obs]** = recalled from playing, not fetched; **UNVERIFIED** = could not confirm.

---

## 1. Layout at 1280×720

The client authors champ select on a `1278×718` box, which is the 1280×720 window minus a 1px frame [css]. Riot's support page names 1280×720 as the default window size [riot-support]. All coordinates below are stage px.

```
x: 0          320                         640                         960          1280
y:0 ┌──────────┬──────────── timer-status (h 68) ──────────────────────┬──────────┐
    │ ▢▢▢▢▢ ←ally bans, y30  "message" y20–40 (22px italic / 28px)  enemy bans→ ▢▢▢▢▢ │
 30 │ x10–210  │   ══ bar 245×5 ══ [ 27 ] ══ bar 245×5 ══   y≈42–84   │ x1070–1270│
 80 │          ├─ filters 180×20 ─────────────────── search 195 ─(h40)─┤          │
 96 │ ┌ally───┐│ ┌──────────── grid 633×456, 6 cols ──────────────────┐ │┌enemy──┐ │
    │ │5×80px ││ │ tile 67×67 + name, pitch 102 × 96px, 4.75 rows vis. │ ││5×80px │ │
    │ │cards  ││ │ (scrollbar 11px, top/bottom 1% mask fade)           │ ││cards  │ │
496 │ └───────┘│ └────────────────────────────────────────────────────┘ │└───────┘ │
516 │┌chat────┐│        champion name block y515 (after lock)          │          │
    ││300×184 ││               [  LOCK IN 166×43  ]  ≈y590–635 (obs)   │  queue · │
667 ││        ││  ── runes ▾ 193px │ spells ▣▣ │ ward/emotes ── h37    │  5v5     │
720 └┴────────┴┴────────────────────────────────────────────────────────┴──────────┘
```

| Region | Box (stage px) | % of stage | Source |
|---|---|---|---|
| Ally column / enemy column | x0–320 / x960–1280, each 25% wide | 25% each | `.summoner-array{width:25%}` [css] |
| Centre column | x320–960 (`left:25%;right:25%`) | 50% | `.champion-select-main-container` [css] |
| Card stack | `margin-top:66px` + `padding:30px 0`, 5 × 80px → y≈96–496 | 56% of height | [css] |
| Top darkening | 100px gradient strip across full width | 14% | `.top-darken` [css] |
| Header (timer-status) | 68px tall, row 578px wide, centred | 9.4% | [css] |
| Ban strips | y30, 5 × (30px tile + 10px margins); ally strip ends x210, enemy starts x1070 | — | `.team-bans{top:30px}`, `right/left:750px` [css] |
| Grid header | y80–120, 578px wide, 1px bottom rule `rgba(120,90,40,.6)` | — | [css] |
| Grid | 633×456, starts ~13px under header | 49% × 63% | [css] |
| Champion name block | `top:515px`, 80px tall | — | [css] |
| LOCK IN | 166×43 inside a 178×82 container; y position approximate | — | [css] sizes, [obs] y |
| Grid toggle (finalization) | `bottom:88px`, 50×20 with 171px brackets each side | — | [css] |
| Loadout row | `bottom:16px`, 37px tall, 50px rules `#614a25` either side | 5% | [css] |
| Chat | x20–320, 300×184, 20px margins | 23% × 26% | [css] |
| Queue info + buttons | bottom-right, `right:20px; bottom:19px` | — | [css] |

### Typography

The client uses `--font-display` (Beaufort) and `--font-body` (Spiegel). Our substitutes: Cinzel for the 600–700 weights and Marcellus SC for small caps, since **Marcellus SC ships only weight 400** (Google Fonts check, 2026-11-09). Barlow covers body text.

| Element | Size/LH | Weight | Tracking | Colour |
|---|---|---|---|---|
| Header timer number | 40/42 | 700 | .05em | #F0E6D2 |
| Header message, your turn | 28/20 | 700 | .05em | #F0E6D2 |
| Header message, others' turn | 22/20 *italic* | 700 | .025em | #A09B8C |
| Phase-transition label | 30/32 caps | 700 | **.2em** | #F0E6D2 |
| Card primary (champion / status) | 14/18 caps | 700 | .075em | #F0E6D2; self **#FABE0A** |
| Card secondary (position/status) | 12/14–16 | 400 | .1em | #CDBE91 (name #A09B8C) |
| Grid tile name | 12/12 | 400 | — | #A09B8C |
| LOCK IN / BAN label | 14 caps | 700 | .0325em | see §3.5 |
| Skin name | 18/22 *italic* | 500 | .025em | #F0E6D2 |
| "First pick" tag | 12/16 caps, opacity .65 | 700 | .075em | #F0E6D2 |
| Ban announcement | 24/28 caps | 700 | .2em | #F0E6D2, rules #BE1E37 |

All header text carries `text-shadow: 0 0 5px rgba(1,10,19,.8)` [css].

---

## 2. Phase model

| Phase (LCU enum [js]) | Duration [wiki] | Header line (paraphrased) | Screen class [js] | Ambient state |
|---|---|---|---|---|
| `PLANNING` (declare intent) | 15s (`pickIntentSeconds:15` [js]) | "Pick your champion" (intent); cards say *Declaring Intent* | `position-assignment-screen` → `pick-screen` | "You were assigned" map intro; pins land in 630ms; card intro staggered 700ms |
| `BAN_PICK`, ban turn | 30s, all 10 players ban at once; a missed ban = no ban | "Ban a champion!" | `pick-screen` + `is-banning-now` | **red overlay**, red edge backlight, red header glow, red BAN button |
| Ban reveal ceremony (`ten_bans_reveal`) | 5s server-side [wiki]; client animation constant 6400ms [js] | — | `ban-showcase-screen` | staged reveal, enemy bans 650ms apart |
| `BAN_PICK`, pick turns | 6 turns × 30s. Blue first, then two at a time, i.e. 1-2-2-2-2-1 (my inference from "6 turns, alternate two at a time" [wiki]) | yours: "Pick your champion!", then "Lock in your choice!"; others: "Your team / Enemy team is picking…" | `pick-screen` (+`is-picking-now`) | blue edge backlight on your turn; music gains a layer per completed pick |
| `FINALIZATION` | 30s; champion trades only here [wiki] | "Prepare your loadout!" | `selected-screen` | your skin splash full screen; grid closed behind a toggle |
| `GAME_STARTING` | — | "Prepare for battle!" | `game-starting-screen` | — |

Other client constants [js]: `pickPhaseChangeTransition:1000`, `showLockedInSplash:1700`, `actionSoundThreshold:10` (the tick plus pulse during the last 10s of your action), `skipIntroAnimationsThresholdSeconds:12` (intros are skipped if you join late), `tenBansAnimationDelayBeforeEnemyBans:500`, `tenBansAnimationDelayBetweenEnemyBans:650`, `teamBansAnimationDelayBeforeBanItem:1750`, `pinAnimation:630`.

Swaps [wiki]:
- Pick-order swap lasts up to 10s and is cancelled at 5s left in the turn.
- Role swap lasts up to 15s.
- Champion trade lasts up to 30s, finalization only.
- All swaps are disabled in the last 5s.
- The swap dialog's timer bar is a 15s linear `scaleX(1→0)` [css].

Full-screen phase banners are a server *ceremony* (`phase_transition`). The strings include "First/Second Ban Phase" and "First/Second Pick Phase", so tournament draft (Clash) uses them. Whether solo queue shows a full-screen banner is **UNVERIFIED**; solo queue certainly changes the header line and the music.

---

## 3. Component anatomy and states

### 3.1 Header: timer-status [css][js]

**Row:** `[bar 245×5] [number 82px wide] [bar 245×5]`, 578px total, under the message line. Gold metalwork brackets extend about 60px past each end.
- The bracket shape is a hairline running outward from the centre, curving up a quarter circle into a short step plate [img].
- Its colour state is a sprite: neutral = dark gold, picking = teal glow, banning = red glow. It is 815px wide and swapped by `background-position`, which is instant in the client CSS. For our version, crossfade it over 500ms to match the edge backlight.

**Bars ("burnout timer"):**
- Track is a 20%-alpha team colour: blue `rgba(10,150,170,.2)`, red `rgba(190,30,55,.2)`.
- Fill gradients: blue `#005A82 10% → #0A96AA 70% → #CDFAFA 125%`; red `#690014 0 → #BE1E37 50% → #FE7350 85%`.
- Each bar is `scaleX(1→0)`, **linear**, lasting exactly the time remaining, restarted at every new action.
- `transform-origin` sits on the centre side of each bar. Both bars therefore drain *into the number*, and the bright end of the gradient stays on the moving tip, like a burning fuse.
- A duplicate bar with `blur(5px)` sits under each one as glow.

**Visibility:** the left bar shows only while your team acts, red if that action is a ban. The right bar shows only while the enemy acts (red), or blue during planning/finalization [js].

**Per-second tick** (your action, last 10s) [css][js]:
- The `.timer:after` element is a **red `#BE1E37` copy of the number**. It scales 1→2.5 while fading 1→0 over 1000ms `cubic-bezier(0,0,0,1)`.
- A 52×56 teal radial glow (`#0A95AA` centre) fades 1→0 over 1000ms linear.
- Sound: `sfx-cs-timer-tick` [js].
- During planning (last 5s) and finalization (last 10s) only a small tick sound plays.

**Under 11s** (`timer-less-than-11-seconds`): header glow, LOCK IN linework and edge backlight all pulse opacity `1 → .5 (75%) → 1`, 1000ms × 10, `cubic-bezier(.46,.19,.7,.98)` [css].

### 3.2 Player card ("summoner-object") [css][js]

**Box:** 78px tall inside an 80px row. Columns, ally side (mirrored with `row-reverse` for enemies):

| Active bar | Spacer | Spells (2 × 24px, stacked) | Portrait | Spacer | Details | Swap/trade |
|---|---|---|---|---|---|---|
| 8px | 8px | 30px | ring 62px / icon 58px circle | 10px | 156px (max-h 66px) | 40px |

- Portrait well: `#1E282D`, `inset 0 0 8px rgba(0,0,0,.7)`.
- Ring: gold, about 10px thick at 4× scale, with a dark inner vignette and a thin grey outer line [img]. Enemies get a red variant.
- Between cards: a 386px-wide gold hairline (9px image) runs from the outer edge and fades toward the centre.

**States:**

| State | Visual |
|---|---|
| Empty / waiting | Position glyph centred at 55% size on the dark well; card text is position plus name |
| **Intent** (selected, not your turn, or planning) | Portrait and spells at **opacity .5** (`dim`). They are "bright" only when `showIntroAnimation`, `isDonePicking` or `isPickingNow` [js]. Status *Declaring Intent*. Ban intent shows as a separate 28×28 square beside the circle, bg `rgba(1,10,19,.5)`, 1px `#1E282D`, with a red ban glyph (70% of the square's size) hanging 30% off its bottom edge |
| **Picking / banning now** (acting) | 8px active bar: **#0A96AA** ally, **#FABE0A** self, **#BE1E37** enemy. Magic background: an 80px-tall, 316px-wide webm with intro → idle loop → outro (blue/gold/red silk streaks) [img]. Spinner ring 75×75 at −7px: 1 turn in 1s `cubic-bezier(0,0,.43,.7)`, then 1.55s per turn linear, forever. Status *Picking…* / *Banning…*. Portrait **bright** (your current selection at 100%) |
| Picking/Banning next | Status *Picking Next…* / *Banning Next* |
| **Locked** | 600ms lock-in sequence (§4.2). Portrait bright; primary text = champion name; self text #FABE0A |
| Actions complete (finalization) | Other cards at opacity .7, self at 1. The card's background shows that player's chosen skin as a 480px-wide strip at .7 opacity, masked into the ring |
| **Pick-sniped** (your intent was banned/taken) | Card shakes ±1px for 300ms `cubic-bezier(0,0,.5,1)`. Portrait goes `grayscale(1)` by 10% (80ms), then fades out by 800ms. Red radial glow `#E44F72` (800ms) and a red magic swipe (400ms mask band). Red picksnipe spinner rotates 270° in 1.17s. Screen edges flash red once (1.13s, `rgba(248,2,0,.05)`). Sound: *your-pick-denied* |
| Intro (cards appear) | Per slot, delays 0.72s + 0.7s·i. Ring flashes a 2px border `#F7F0DE` (self `#C8AA6E`) with 3× 5px drop-shadow, fading over 900ms linear. Portrait scales 1.4→1 in 170ms `cubic-bezier(.87,.07,.98,.38)`. Details slide −10px→0 over 800ms `cubic-bezier(0,0,0,1)` (+150ms). Text glow fades over 800ms. Position glyph flashes `#fff→#C8AA6E` over 900ms linear (+120ms). Each slot has its own sound (`posassign-ally-0..4`) |
| Enemy column entry (bans present) | Slides `translateX(52px→0)` over 400ms, +300ms, easing varied per nth-child: `(0,.95,0,1)`, `(0,.9,.7,1)`, `(.1,.2,.3,1)` |
| Expand/collapse (swap buttons) | Step 1 is 270ms `cubic-bezier(1,0,1,1)`, ±38px → ±3px; step 2 is 570ms `cubic-bezier(0,0,0,1)` → 0 |

### 3.3 Bans [css][js][img]

- **Top-corner strips:** 30×30 tiles, `rgba(1,10,19,.5)`, 1px `#1E282D`, small ban glyph at 66.7%. When a ban completes, the champion icon (28px) pops `scale(1.8→1)` and `opacity 0→1` in 500ms ease-out. Enemy tiles follow at 0.5s, 1.15s, 1.8s, 2.45s, 3.1s (650ms apart).
- **Grid, banned:** `grayscale(1) brightness(.75)`, a small grey circle-slash glyph at the bottom, not clickable. Grid in ban mode: hover border `#FE734F` plus glow `0 0 0 1px rgba(1,10,19,.85), 0 0 7px 1px rgba(190,30,55,.85)`; reticle turns red/orange; a selected ban shows a large red circle-slash over the tile.
- **Centre "slice" ban** (serial bans, large-area animations on). The splash sits inside a 538px circle mask, then:
  1. A 12px black bar slides across: `translateX(−100%→0)` (ally; the enemy version comes from the right), 300ms `cubic-bezier(1,0,1,1)`, +100ms.
  2. The cut rotates 0→**+45°** (ally) or **−45°** (enemy), 250ms linear.
  3. The top and bottom halves drift ±35px over **2500ms `cubic-bezier(0,.94,.21,1)`**, +250ms.
  4. The whole thing fades to greyscale in 400ms `cubic-bezier(0,.6,.1,1)`, +300ms.

  The ring around it also animates:
  - Main ring greys out in 200ms.
  - Centre ring scales 1→.8 and fades over 300–400ms.
  - Dashed ring goes `1.5→.85→.85→1` over 450ms, +200ms.
  - Gear ring scales `1.15→1` over 300ms, +100ms.
  - A white flash `brightness(3) grayscale + drop-shadow(0 0 10px #fffc)` plays for 400ms `cubic-bezier(0,1,0,1)`, +200ms.
- **Low-spec ban:** `grayscale(0)+brightness(1.5) → grayscale(1)+brightness(1)` over 900ms `cubic-bezier(0,0,.66,1)`, then opacity 1→0 over 400ms at +870ms. This is our reduced-motion template.
- **Ten-ban reveal:**
  - "Bans locked in" label: scale 1.5→1 (200ms slam) at +700ms, with red 1px rules either side (`#fff→#BE1E37` over 830ms).
  - Ally list slides up −108px (200ms slam), then −122px (670ms settle).
  - Enemy bans fade/zoom 1.25→1 (400ms, `(.75,.07,0,1)`).
  - Each locked ban: image slides in from −67px (330ms `(.85,0,1,1)`), shakes ±1px for 300ms, and a red marching border (`#FF3217` conic band, rotate 45°→300° over 1.2s `(.1,.69,.3,.93)`) fades out over 1.2s.
  - The whole showcase scales to .7 and fades at 6.1s (200ms slam).

### 3.4 Champion grid [css][img]

- **Header:** 5 position filters, each 20×26 with 5px gaps (180px row); active = 3px bottom border `#785A28`. A **fuzzy** search box sits on the right (195px, opacity .45 at rest; the client bundles the `fuzzy` npm lib [license.json]).
- **Tile:** 71×83 (a 67×67 thumbnail with the image cropped to 72px at −4px, plus a 12px name), margins 31px left, 9px top, 4px bottom. Six columns. Thin border, `outline:1px rgba(1,10,19,.75)`.
- **Hover:** the border becomes `linear-gradient(180deg,#F0E6D2 4%,#C89B3C)`, image `brightness(1.25)`, and 4 gold L-shaped **corner brackets** (81×81 reticle at −7/−6) appear. This is **instant** in the client (no transition).
- **Press:** border becomes `#463714→#695625`.
- **Selected:** brackets plus a **gold ring circle** (gradient gold → cream) over the tile. Every other tile gets a `rgba(1,10,19,.5)` dim overlay.
- **Picked by an ally / intent by an ally:** `grayscale(.65)`, plus a bottom "tray" bracket carrying **that ally's position glyph** (5 variants), so you can see who wants what.
- **Scrolling:** custom scrollbar 11px; thumb `#785A28` with a 3px transparent border (≈5px visible), radius 6, min 32px; hover `#C8AA6E`, active `#463714`. Top and bottom 1% are masked to fade.
- **Grid open/close** (finalization toggle): hidden = `translateY(600px)` plus opacity 0, children `transition: transform .3s`; the toggle arrow rotates 180°.
- **Random tile:** a dice "?" portrait.

### 3.5 Action button: LOCK IN / BAN [css][img]

- **Shape:** `clip-path: polygon(13px 0, 153px 0, 166px 37px, 50% 100%, 0 37px)` on 166×43. That is a flat top inset 13px, flaring to full width at y=37, with a shallow 6px V at the bottom: a bowl or shield silhouette. Dark fill (≈`#1E2328`), with a 2-tone border [img].
- **LOCK IN** border: teal → deep blue (`#0AC8B9→#0397AB→#005A82`). Text `#B2D9DB`, hover `#CDFAFA`, active `#005A82`, disabled `#5C5B57` (disabled background crossfades over .5s).
- **BAN** border: red `#FF4B4B→#BE1E37→#802626` [img est.]. Text `#BE1E37`, hover `#FF2345`, active `#802626`.
- **Linework:** brackets on both sides (a hairline dipping at an angle into a small parallelogram cap). Four colour states: teal (pick), red (ban), dark gold (idle), gold glow.
- **Click:** the label goes `brightness(2)` in 100ms and `opacity 0` over 600ms while an "enabled-click" webm plays [css]. States come from a video state machine: disabled-intro, enabled-intro, enabled-hover, enabled-click.
- **Riot's animated magic border** is configured with `speed="15000"`, most likely a 15s loop in ms (unit UNVERIFIED) [riot-blog]. A conic-gradient border rotating once per 15s is our equivalent.
- **Sounds:** hover `sfx-cs-lockin-button-hover`, click `sfx-cs-lockin-button-click`; the ban click has its own sound [js].

### 3.6 Ambient background stack, bottom → top [css][img]

1. `#010A13` base.
2. The selected or locked splash (cross-fading switcher).
3. Bottom fade: `linear-gradient(0deg,#010A13 0,rgba(1,10,19,0) 40%)`.
4. Darken overlay at .55.
5. "**Defocus**" while the grid is open. This is **not a blur**: `brightness(35%)` plus a navy rounded-rect vignette (clear centre ≈1000×380, fading over ~150px to opaque `#010A13`).
6. Outside your pick turn: a centre spotlight mask, a soft disc ≈700px wide centred on the stage (`mask-position-y:-45px`).
7. Top darkening, 100px.
8. **Ban turn overlay:** `radial-gradient(circle farthest-corner at 50% 40%, rgba(0,0,0,.4) 0, rgba(0,0,0,.6) 30%, #000 70%)` over `linear-gradient(0deg, rgba(183,0,0,.37), rgba(165,0,0,.37))`, opacity 0→1.
9. **Edge backlight** on your turn: blue (pick) or red (ban) side glows, opacity transition .5s.
10. Locked splash: `grayscale(50%)` plus a `rgba(1,10,19,.5)` veil.

**New-pick outro** (someone locks in):
- The splash fades in from `brightness(1.5)→1` over 900ms `cubic-bezier(0,0,0,1)`.
- It holds; the *just-locked* name block fades at 1.5s.
- At 1500ms it fades out (200ms linear), **slides ±300px toward that team's side** (200ms `cubic-bezier(1,0,1,1)`), and goes to `brightness(1.5) blur(8px)` (200ms).
- Total 1.7s (`showLockedInSplash`).

**Entering finalization ("pre-animation"):**
- The stage flashes `brightness(1.8) contrast(.8)`.
- Columns start at `translateX(±46.5px) translateY(5px) scale(.9)`; header, carousel and loadout start at `scale(.9)` with ±5–10px y.
- Everything settles to identity. Settle duration **UNVERIFIED** (not in the CSS); the screen change uses a 1000ms transition window [js].

**Centre ring:** a 598px dial of ~180 faint cream radial ticks, rotating **90° per 60s** linear [css][img]. On entry:
- Outer half-rings shrink in width 750→374px (800ms `cubic-bezier(.01,1,.085,.915)`), then snap to 324px with a `brightness(4)` flash settling over 900ms `cubic-bezier(0,.755,.425,.91)`.
- Inner ring goes 180→287.5→324px the same way.
- The dashed ring does the same in scale: `1→1.175→1`.

### 3.7 Finalization: skin carousel, loadout, chat [css][js]

**Carousel:**
- 5 visible slots, plus 2 hidden slots each side used for transitions. `left%` per offset: **0.5, 19, 37.5 (centre), 66, 84.5**; hidden slots −18 / 103 at opacity 0.
- Side items are 73×50, `#3C3C41`, outline `rgba(1,10,19,.6)`. The centre item is **25% wide × 66px**, thumbnail at 125%, with a 2px border `linear-gradient(0deg,#C8AA6E,#C89B3C 44%,#A07B32 59%,#785A28)`.
- Every change is `transition: all .2s`. A scroll moves at most ±2 slots and plays a forward/back sound.
- Hover border `#C89B3C→#F0E6D2` plus `brightness(125%)`; active `#695625→#463714`.
- Locked skin: `grayscale(50%)`, `#010A13` veil .75, 30px lock icon at the bottom centre.
- Chroma button: 26px circle under the centre item, inner 18px with a red diagonal for "none".
- Pips: 6px dots with 4px padding on a 376px row, flanked by 2px gold rules fading out (`transparent→#785A28 20%`). Arrows are 24×32 on a 520px row. The track is about 470px (**approx.**).
- Teammates' skin changes reach your screen at most once per 1000ms [js].

**Loadout row (37px):**
- Rune page dropdown 193px wide (27–37px tall) plus an edit button.
- A 1px `#785A28` spacer.
- 2 summoner-spell buttons.
- Ward/emote buttons.
- 50px gold rules on both ends.

**Spell picker flyout:** 270×430; title, description and spell grid slide in over 763/733/633ms.

**Swap dialog:** mask reveal `mask-size 100% 25%→100% 100%` over 500ms `cubic-bezier(.02,.85,.08,.99)`; its timer drops in −100px→+5px.

### 3.8 Position (role) icons [css][img][wiki]

| Client enum | Label | Meaning [wiki] | Glyph grammar (34×34 grid) |
|---|---|---|---|
| TOP | Top | Solo lane, upper corner; self-sufficient bruisers/tanks | Gold L-bracket in the top-left corner |
| JUNGLE | Jungle | No lane; farms monsters, roams to every lane; Smite required | Three claw/fang strokes |
| MIDDLE | Mid | Shortest, central solo lane; carry mages/assassins | Diagonal bar, bottom-left → top-right |
| BOTTOM | Bot | Lane carry (marksman) that scales with gold | Gold L-bracket in the bottom-right corner |
| UTILITY | Support | Low-income partner of Bot; vision, enchanters, tanks | Winged crest |

Shared grammar for all five:
- Active part `#C8AA6E`.
- Passive "map" silhouette `#785A28` at 50% opacity.
- Intro: the active part flashes `#fff → #C8AA6E` over 900ms linear, +120ms.

There is also a separate *class* filter set (Fighter/Tank/Mage/Assassin/Marksman/Support). We draw our own glyphs in the same grammar and do **not** trace Riot's paths.

### 3.9 Sound map (reference only; author our own) [js][file listing]

| Event | Client sound |
|---|---|
| Grid | hover / click / release ticks |
| Grid open/close | open / close |
| Lock-in button | hover, click |
| Turn notices | "your pick", "your ban" |
| Pick confirmed | left/right × single/double |
| Champion feedback | VO line on pick and ban, plus a per-champion stinger that ducks other channels |
| Bans | ally ban, enemy ban, team bans locked |
| Pick snipe | pick denied |
| Timer | tick / small tick |
| Skin carousel | splash forward / back |
| Music | phase loops with layered intensity: base at .37 volume, then layers at .185 / .2775 / .37 as picks complete; transition stingers between phases; a 60s finalization track started at an offset |

Riot's tech blog notes that VO always ducks the music slightly [riot-blog].

---

## 4. Motion language, extracted

**Patterns:**
1. **Slam:** ease-in over 170–270ms (`1,0,1,1` / `.87,.07,.98,.38`) for things arriving with weight: labels, portraits, ban bars.
2. **Settle:** an extreme ease-out with no overshoot (`0,0,0,1`), 570–1000ms.
3. **Glow-off:** a white duplicate layer (`text-shadow 0 0 8px #fff, 0 0 10px #fff`, or a 2px `#F7F0DE` ring with a 3×5px drop-shadow) fading 600–900ms (`.7,.21,.68,.77` or linear).
4. **Staggered drama:** 650–700ms between team members.
5. **Urgency:** opacity `1→.5→1` at 1Hz, 10 times.
6. **Error:** a 300ms ±1px shake.
7. **Ambience:** linear rotations of 60s per 90°, 160s and 190s per turn, which cost almost nothing.

**Easing table**, registered in GSAP with `CustomEase.create(id, "x1,y1,x2,y2")`. CustomEase accepts 4-number input (checked in gsap 3.15.1 source).

| id | cubic-bezier | Client use |
|---|---|---|
| `cs.slam` | 1,0,1,1 | phase label 200ms, card expand step 1 270ms, splash outro slide 200ms, ban slice bar 300ms |
| `cs.settle` | 0,0,0,1 | details slide 800ms, expand final 570ms, splash brighten 900ms, timer ghost 1000ms |
| `cs.popIn` | .87,.07,.98,.38 | portrait scale 1.4→1, 170ms |
| `cs.ringPop` | 0,.74,1,1 | lock-in ring 600ms |
| `cs.shine` | 0,0,.15,.99 | lock-in shine 600ms |
| `cs.textFlash` | 0,0,.84,.35 | lock-in secondary text 1050ms |
| `cs.glowOff` | .7,.21,.68,.77 | white glow copies 600–700ms |
| `cs.urgent` | .46,.19,.7,.98 | last-10s pulses |
| `cs.ringIn` / `cs.ringFlash` | .01,1,.085,.915 / 0,.755,.425,.91 | centre ring entry 800ms / 900ms |
| `cs.mask` | .02,.85,.08,.99 | swap dialog reveal 500ms |
| `cs.slice` | 0,.94,.21,1 | ban halves drift 2500ms |
| `cs.vignette` | 0,.6,.1,1 | greyscale/vignette 300–400ms |
| `cs.spinDecel` | 0,0,.43,.7 | spinner first turn 1000ms |

**Porting note:** CSS applies `animation-timing-function` to *each keyframe segment*. To reproduce multi-stop client keyframes in GSAP, use `keyframes: { "0%":…, "38%":…, "100%":…, easeEach: "cs.ringPop" }` with `ease: "none"`.

---

## 5. Mapping to the portfolio

### 5.1 Shared by both alternatives

**Champions = frameworks.**
- The 20 vector icons already in `public/icons` qualify: angular, c, c++, flutter, java, js, kotlin, minio, nestjs, nextjs, nodejs, postgresql, python, qt, react, react-native, redis, springboot, supabase, ts.
- mono, sam, vehicool and mondas are project logos, not frameworks.
- Add a "?" random tile (our own glyph) that cycles 8 tiles at 60ms, then settles.

**Data:**
- Extend `src/data/stacks.ts` rather than adding a new store.
- **Derive "games played" from `src/data/projects.ts`** by matching `frameworks[].asset` (lazy and always correct). Current counts: Spring Boot 6, Next.js 5, PostgreSQL 4, Angular 3, React 3, NestJS 2, React Native/Supabase/Redis/MinIO 1, everything else 0.
- The existing `count` field has no stated meaning and does not match the projects data. Drop it or redefine it.

```ts
type Role = 'backend' | 'data' | 'frontend' | 'mobile' | 'core';   // TOP, JUNGLE, MID, BOT, SUPPORT
interface Champ { id: string; name: string; title: string;          // "Spring Boot — the Bulwark"
  role: Role; icon: string; color: string; mastery: 1|2|3|4|5|6|7; since: number;
  skills: string[];  /* runes, 3–6 chips */  tools: [string, string]; /* spells */ }
```

**Role filters = categories**, keeping League's 5-slot lane metaphor (it reads as an in-joke and justifies the order):

| Category | Lane | Why it fits |
|---|---|---|
| BACKEND | TOP | Solo, self-sufficient, tanky: Spring Boot, NestJS, Node.js |
| DATA | JUNGLE | Works across the map and enables every lane: PostgreSQL, Redis, Supabase, MinIO |
| FRONTEND | MID | Centre stage, the carry: Next.js, React, Angular |
| MOBILE | BOT | Scales into the late game: React Native, Flutter, Kotlin |
| CORE | SUPPORT | Languages and tooling that support every lane: TypeScript, JavaScript, Java, Python, C, C++, Qt |

Draw 5 new 34×34 two-tone glyphs (browser frame, server slabs, phone, cylinder, braces). Active part `#C8AA6E`, passive `#785A28` at 50%, with the white→gold 900ms intro flash. Filter row: 5 icons plus "All".

**Grid:**
- 6 columns, 67px tiles, 31px gutters, reticle brackets on hover, gold ring when selected, `rgba(1,10,19,.5)` dim on the others.
- 21 tiles fit in 4 rows, so the grid **does not scroll** at desktop sizes.
- Search: plain case-insensitive `includes` over name plus aliases (no fuzzy lib).

**Centre 3D = "splash".** The selected framework's real logo, extruded, on a hextech pedestal (§5.5). The ambient background reuses the client's treatment: the logo's brand colour as a large radial bloom behind the canvas at 35% brightness, plus the rounded-rect vignette.

**Timer:**
- Used only during the intro, with short phases of 1.2–1.8s. Bars drain linearly into the number.
- After the intro the timer is "infinite": bars hidden, header reads *Pick a framework to inspect*.
- **No real countdown** pressuring visitors.
- Optional, cheap: bars = ScrollTrigger progress while the section is pinned.

**Bans, used tastefully:**
- Three **anti-patterns, not products**: untyped `any`, untested merges, N+1 queries.
- Our own glyph tiles in the top-left ban strip, with a tooltip each.
- Intro: tile pop (500ms) and optionally *one* slice ban.
- Never ban someone else's framework: a recruiter may use it.
- Ship with a `showBans` flag so the owner can turn the strip off.

**Sound:** own clips, muted by default. 4 sounds max: hover tick, lock chime, phase stinger, slash.

### 5.2 Alternative 1: "Signature Draft" (recommended)

**Left column, "MY TEAM":** my 5 mains, one per lane. The data suggests MID Next.js (5 projects), TOP Spring Boot (6), JUNGLE PostgreSQL (4), BOT React Native (1), SUPPORT TypeScript. **Owner to confirm.** The intro locks them in with the full card lock-in, which is the "this is my main stack" moment.

**Right column, "NEXT OPPONENTS":** 3–5 technologies I'm learning.
- They use the client's hidden-enemy look: names show as "Unknown" until hovered, with a red 8px bar and the acting spinner **permanently running**, which honestly reads as "in progress".
- Fallback if the owner won't list learning items: **FLEX PICKS**, the second choice per lane (React, NestJS, Supabase, Flutter, Java), styled in neutral gold-grey rather than red.

**Visitor flow:**
1. Hover previews in the centre 3D.
2. Click = **intent**. The matching lane card shows the candidate at 50% opacity with a gold spinner (the visitor plays the gold "self").
3. **LOCK IN** plays the lock-in. A ghost logo flies into that lane card, which turns gold.
4. The centre switches to **finalization = build sheet**:
   - "skins" carousel = projects that used this framework (from projects.ts; 5-slot geometry from §3.7; centre slot shows screenshot and link)
   - "runes" = skill chips
   - "spells" = 2 tools
   - mastery crest plus "since 20xx"
5. The grid collapses behind the bracket toggle (*Pick another*).
6. The URL hash becomes `#stack/<id>`, giving free deep links.
7. A **RESET** gold button restores my mains.

**Stretch (~15 lines):** a *Request this stack →* link prefills the contact message with the 5 lane slots.

### 5.3 Alternative 2: "Team Comps" (project-driven)

- **Queue selector**, bottom-right where the client shows queue name and team size: the visitor picks one of the 11 projects.
- **Left column** re-drafts that project's `frameworks` in pick order, using the 700ms-cadence card intro compressed to 250ms. Empty slots stay dim.
- **Background:** the project screenshot (`public/assets/*`) given the client splash treatment (35% brightness, vignette, bottom fade).
- **Centre:** the "carry" framework's 3D logo.
- **Right column, "ENEMY TEAM":** the project's problems (e.g. checkout, image storage, caching), revealed one per pick.
- **LOCK IN** opens the case study or live site.

Pros: storytelling; reuses projects.ts. Cons: duplicates the Projects section; needs 3–5 lines of new copy for each of 11 projects; weaker as a stack overview.

### 5.4 Recommendation

**Pick Alt 1** and use Alt 2's data only inside the build-sheet carousel. That links projects in without a second projects UI.

Skipped on purpose (YAGNI): chat, real trades/swap dialogs, rune editor, spell flyout, layered music, the full ten-ban ceremony, the position-assignment map video, per-player countdowns, the last-10s urgency loop, chromas.

### 5.5 Centre 3D: "the champion model"

The current `FloatingIcon` is a textured `Box`, a generic shape. Replace it.

**Build:**
- `SVGLoader` (three 0.171 in repo; supports `fill-rule` nonzero/evenodd in `createShapes`, and strokes via `pointsToStroke`).
- `ExtrudeGeometry` with a **material array `[face, side]`**. ExtrudeGeometry puts caps in group 0 and walls in group 1, so every logo gets brand-coloured faces and a **gold hextech rim**:
  - face: `MeshPhysicalMaterial` in the brand colour, metalness .3, roughness .35, clearcoat 1
  - side: `#C89B3C`, metalness 1, roughness .3
- Normalise every logo to width 2.0 units. Constants:
  - depth .18–.24
  - bevelThickness .03, bevelSize .02, bevelSegments 3
  - curveSegments 12 (8 for paths over 10KB: nestjs 18.6KB, postgresql 13.3KB)
  - `geometry.center()`; `scale.y = -1` (three flips front-face winding for mirrored objects)
- Cache geometry per id; build lazily on first hover.

| Logo | Build (shape must match the real mark) |
|---|---|
| **React / React Native** | Native 3D rather than extruded. Official geometry: nucleus r 2.05; three ellipses rx 11, ry 4.2, stroke 1, rotated 0/60/120°, `#61DAFB` [wikimedia]. Build: `TubeGeometry(new CatmullRomCurve3(pts, true), 256, 0.5, 12, true)` ×3, where `pts` = 128 samples of `(11cosθ, 4.2sinθ, 0)`, plus `SphereGeometry(2.05)`, all scaled ×0.09. `EllipseCurve` is 2D and gives NaN z inside `TubeGeometry`; a non-uniformly scaled `TorusGeometry` distorts the tube thickness. It can spin freely because it is truly 3D. RN uses the same mark; tint differently and add a thin extruded phone-frame ring behind it |
| Angular | `angular.svg`: shield halves `#E23237` / `#B52E31` extruded .18, white "A" .26 (raised) |
| Spring Boot | single path (leaf + power ring), recolour `#6DB33F` |
| Next.js | circle with the N cut out (evenodd); black disc with a chrome rim on our dark background |
| NestJS, PostgreSQL, Redis, Qt, Java, Node, MinIO | extrude their paths. MinIO: bird mark only (repo file is a 2600×446 wordmark) |
| Flutter | 5 chevrons extruded separately at stepped depths .14 / .18 / .22 to sell the fold |
| Python | two snakes as separate meshes `#3776AB` / `#FFD43B`, z ±.02 |
| TS / JS | rounded square depth .18, letters raised to .26 |
| C / C++ | **hexagonal prism** `CylinderGeometry(r, r, d, 6)` plus raised letters; the hex echoes hextech |
| Kotlin, Supabase, Python, Flutter | SVG gradients come through as `url(#…)`. Fall back to one brand hex per path (or vertex colours) |

**Pedestal:**
- Hex prism `CylinderGeometry(1.5, 1.7, .22, 6)`, `#1E2328`, metalness .8, roughness .45, with gold `EdgesGeometry` lines `#C8AA6E`.
- Inset top hex in teal `#0AC8B9`, emissive .6.
- Tick-dial ring with 180 instanced ticks, r 1.85, rotating **0.0262 rad/s** (= 90°/60s).
- Counter-rotating dashed ring at 160s/turn (0.0393 rad/s) and a gear ring at 190s/turn (0.0331 rad/s).
- 120 additive teal particles rising (40 on mobile).
- drei `ContactShadows` (opacity .4, blur 2.5).

**Lights:** no HDR download.
- key directional `#F0E6D2` 2.0
- teal rim spot from behind 3.0
- gold point fill 1.0
- drei `<Environment resolution={64}>` with `Lightformer`s for reflections

**Phase reactions:**
- ban: rim light → `#BE1E37` over 400ms
- pick: teal
- lock: key light 2→4→2 over 600ms, and exposure 1.5→1 over 900ms `cs.settle` (the `transitionFromBright` analogue)

**Idle:**
- float `0.06·sin(1.1t)`
- flat logos **swing ±30° yaw** (`sin(.5t)`) rather than spinning 360°, so they never sit edge-on
- pointer parallax ±8° via `gsap.quickTo(…, {duration:.6, ease:'power3'})`

**Performance:**
- One Canvas.
- `dpr={[1,1.75]}` (mobile `[1,1.5]`).
- `frameloop="demand"`, with `invalidate()` from GSAP `onUpdate` and from the idle loop only while in view (IntersectionObserver).
- Under 150k triangles.
- Dispose geometry on unmount.

**Versions** (`npm view`, 2026-11-09):
- three 0.187.0 is latest (repo on 0.171.0).
- @react-three/fiber 9.8.2 needs `react >=19 <19.4`, so on React 18.3 stay on **fiber 8.18.0 / drei 9.122.0**, the last v8/v9 releases.
- gsap 3.15.1 is from 2026-11-04. 3.15.0 (2026-04-13) is the older, longer-soaked option if wanted.
- @gsap/react 2.1.2. GSAP ships under the "Standard no-charge license" with CustomEase, Flip, SplitText, DrawSVG, MorphSVG and ScrambleText inside the public package (checked by unpacking 3.15.1).

---

## 6. GSAP storyboards

**Setup:**
- `gsap.registerPlugin(useGSAP, CustomEase, Flip)`, plus the §4 eases.
- All tweens inside `useGSAP(…, { scope: rootRef })`; event handlers wrapped in `contextSafe`.
- Branch with `gsap.matchMedia()`: `reduce: (prefers-reduced-motion: reduce)` and `mobile: (max-width: 767px)`.
- Animate only `transform`, `opacity` and small-element `filter`.
- The full-stage flash is a white overlay `div` with `mix-blend-mode: screen` animating opacity. Filtering the whole subtree, as the client does with `brightness(1.8)`, is too expensive.

### 6.1 Hover (pointer over a grid tile; keyboard focus behaves the same)

| t ms | Target | From → to | Dur | Ease | Basis |
|---|---|---|---|---|---|
| 0 | tile reticle (4 brackets, our SVG) | opacity 0→1, scale 1.06→1 | 120 | cs.settle | client is instant; softened for web |
| 0 | tile image | brightness 1→1.25; border → gold gradient | 120 | none | [css] hover |
| 0 | sfx tick | — | — | — | [js] grid-hover |
| 80 | (debounced 80ms) outgoing 3D logo | scale 1→.92, opacity→0 | 160 | power2.in | ours |
| 200 | incoming logo | y +.25→0, scale .9→1, opacity 0→1, rotY 25°→0 | 450 | cs.settle | settle language |
| 80 | pedestal inset emissive | .6→1.6→.6 | 500 | sine.inOut | ours |
| 80 | centre name/title | crossfade | 200 | none | `--statusMessageTransitionDuration:200ms` [css] |
| leave +150 | revert to selected item | same, reversed | — | — | — |

### 6.2 Select = intent (click or tap a tile)

| t | Target | Change | Dur | Ease |
|---|---|---|---|---|
| 0 | tile | gold ring 1.15→1 plus brackets; others dim veil 0→1 | 200 | cs.settle / none |
| 0 | matching lane card portrait | crossfade to candidate at **opacity .5** (intent); primary text → *Considering…* | 200 | none |
| 0 | card spinner, gold 75px | rotate 360° | 1000, then 1550/turn ∞ | cs.spinDecel, then none |
| 0 | card active bar (8px, `#FABE0A`) | scaleY 0→1 | 270 | cs.slam |
| 0 | LOCK IN | disabled→enabled: text `#5C5B57→#B2D9DB`; inner teal radial 0→.9→.35 | 500 | cs.settle |
| 0 | header linework, edge backlight | gold→teal; backlight 0→1 | 500 | none |

### 6.3 Lock-in (click LOCK IN; client base L = 600ms)

| t ms | Target | Change | Dur | Ease | Basis |
|---|---|---|---|---|---|
| 0 | button | scale 1→.97→1 | 60+70 | power1 | existing research, click 130ms |
| 0 | label | brightness 1→2 (100), opacity 1→0 (600) | 100/600 | none | [css] |
| 0 | button magic flash (CSS radial, clip-path shape) | opacity 0→1→0, scaleY 1→2.4 | 450 | cs.settle | replaces the enabled-click webm |
| 0 | stage white overlay | opacity .45→0 | 600 | cs.settle | pre-animation `brightness(1.8)`; duration ours |
| 0 | spinner | opacity→0 | 200 | none | — |
| 0 | **ghost logo** (DOM SVG) | `Flip.fit` from centre (~280px) into the card portrait (58px), blur 0→4→0px | 450 | cs.slam | "splash into the card" (client: ±300px slide + 8px blur in 200ms) |
| 0 | 3D exposure | 1.5→1; camera dolly −5% | 900 | cs.settle | `transitionFromBright` 900ms |
| 450 | portrait | opacity .5→1, scale 1.4→1 | 170 | cs.popIn | [css] intro scale |
| 525 | ring pop (gold disc `#FEFFDF`/`#FCFD87→#DDBB63`) | keyframes `0%:{75px,o1}` `38%:{62px,o1}` `100%:{62px,o0}`, `easeEach: cs.ringPop` | 600 | none | [css] lockin-ring, +.125L |
| 525 | ring shine (−60° white band, 45–55%) | background-position −31→+31px; opacity →.2 | 600 | cs.shine | [css] |
| 600 | inner swirl (58px, our SVG) | rotate −76°→0°(20%)→28°(40%)→fade | 750 | none | [css] 1.25L, +.25L |
| 600 | outer swirl (86px) | rotate −65°→−21°→12°, opacity .9→1→0 | 450 | none | [css] .75L |
| 450 | card secondary text | brightness 1.5 + blur .5px + glow → normal; opacity .85→.65 | 1050 | cs.textFlash | [css] 1.75L |
| 0 / 120 | sfx | click, then our lock chime; music −6dB for 1.5s | — | — | client: click + VO + stinger, ducked |
| 1700 | grid | y 0→40, opacity 1→0 (collapse behind toggle) | 300 | power2.in | `showLockedInSplash:1700` [js]; grid `transform .3s` [css] |
| 1700 | build sheet: carousel items | y 20→0, opacity 0→1, stagger 40ms, centre last | 400 | cs.settle | ours |
| 1700 | header message → *Your build* | crossfade | 200 | none | [css] var |

### 6.4 Phase change (intro: planning → ban → pick → explore)

| t ms | Target | Change | Dur | Ease | Basis |
|---|---|---|---|---|---|
| 0 | old header message | opacity 1→0 | 200 | none | [css] |
| 0 | **phase banner** (30/32, .2em tracking, centred at y = 50% − 40px) | scale 1.5→1, opacity 0→1 | 200 | cs.slam / none | [css] `.phase-transition` |
| 200 | banner glow copy | opacity 1→0 | 700 | cs.glowOff | [css] |
| 0 | header linework / edge backlight | crossfade to phase colour | 500 | none | [css] |
| 0 | *(ban only)* red overlay | opacity 0→1; team linework saturate 1→.3 | 400 | none | `--banning-phase-outro-animation-duration:400ms` |
| 200 | new message | opacity 0→1, y −4→0 | 200 | none | — |
| 200 | timer bars | scaleX 1→0 over the phase length | phase | none | [css] linear |
| 1000 | banner exit | scale 1→.8, opacity 1→0 | 200 | cs.settle / none | ban label outro [css]; 1000ms window [js] |
| leave ban | red overlay | 1→0 | 400 | none | — |

### 6.5 Intro master timeline

Runs once when 40% of the section is in view. Total ≈6.2s; any pointer, key or scroll does `tl.progress(1)`, mirroring the client's skip-if-late rule.

| Window | Content |
|---|---|
| 0–1700 | **Planning.** Centre ring entry: our dial scales 2→1 over 800ms `cs.ringIn`, then a flash and 900ms `cs.ringFlash`. Lane cards intro **staggered 280ms** (client 700ms), each with ring flash 900ms, portrait slam 170ms, details settle 800ms, glyph white→gold 900ms |
| 1700–2900 | **Ban** (optional). Banner, red overlay; 3 ban tiles pop (scale 1.8→1, 500ms, stagger 250ms); optional single slice (§3.3 values; offsets scaled ×0.52 for a 280px circle → drift ±18px) |
| 2900–5300 | **Pick.** Mains lock in 1-2-2 beats (MID; TOP+JUNGLE; BOT+SUPPORT) at 0 / 700 / 1400ms. Each beat: logo in (450ms), lock-in micro-sequence (§6.3 rows 450–1575 only) |
| 5300–6200 | **Explore.** Banner, then LOCK IN enabled; bars hidden; header *Pick a framework to inspect* |

### 6.6 Reduced motion

- No intro; render the end state.
- Hover and select become opacity-only, ≤150ms.
- Lock-in = a 200ms crossfade to the gold ring. No ghost flight, no flashes, no rotations, no particles.
- Ban uses the low-spec recipe without the brightness flash.
- 3D: static logo, drag to rotate only.
- With motion enabled, keep flashes at ≤.45 opacity and never more than 3 per second (WCAG 2.3.1).

**Sketch of the eases and the lock-in core** (values from §6.3):

```js
const E = { slam:'1,0,1,1', settle:'0,0,0,1', popIn:'.87,.07,.98,.38', ringPop:'0,.74,1,1',
            shine:'0,0,.15,.99', textFlash:'0,0,.84,.35', glowOff:'.7,.21,.68,.77' };
Object.entries(E).forEach(([k, v]) => CustomEase.create(`cs.${k}`, v));

const lockIn = (card, ghost, portrait) => gsap.timeline()
  .to(ghost, { ...Flip.fit(ghost, portrait, { getVars: true }), duration: .45, ease: 'cs.slam' })
  .fromTo(portrait, { opacity: .5, scale: 1.4 }, { opacity: 1, scale: 1, duration: .17, ease: 'cs.popIn' }, .45)
  .to(card.querySelector('.ring-pop'), { keyframes: { '0%': { width: 75, height: 75, opacity: 1 },
      '38%': { width: 62, height: 62, opacity: 1 }, '100%': { opacity: 0 }, easeEach: 'cs.ringPop' },
      duration: .6, ease: 'none' }, .525)
  .fromTo(card.querySelector('.ring-shine'), { backgroundPosition: '-31px -31px', opacity: 1 },
      { backgroundPosition: '31px 31px', opacity: .2, duration: .6, ease: 'cs.shine' }, .525)
  .fromTo(card.querySelector('.secondary'), { filter: 'brightness(1.5) blur(0.5px)', opacity: .85 },
      { filter: 'brightness(1) blur(0px)', opacity: .65, duration: 1.05, ease: 'cs.textFlash' }, .45);
// fromTo with matching filter functions on both ends: GSAP can't interpolate from computed "none".
```

---

## 7. Mobile and responsive

**≥1024px:** a fluid 3-column CSS grid at 25% / 50% / 25% with the §1 proportions. Do **not** scale a fixed 1280×720 stage with `transform`/`zoom`: R3F pointer mapping inside zoomed ancestors is unreliable (UNVERIFIED per browser). Card internals hold their px sizes; the centre flexes.

**768–1023px:**
- Centre stage (3D + grid side by side, 55/45).
- Lane cards collapse into a **horizontal strip** of 5 × 64px portraits above, labelled with lane glyphs.
- Opponents/flex strip below.

**<768px, single column, top to bottom:**
1. Header: message (16px caps) plus full-width bars (2 × (50% − 28px)) and a 28px number.
2. My-team strip: 5 × 52px portraits with 12px gaps (308px, fits 358px), glyph and 11px label under each.
3. 3D stage at `aspect-ratio: 4/3`; name 24px, title 13px italic.
4. Filter row: 6 × 44px tap targets, then a search icon that expands.
5. Grid of 4 columns (72px tiles, 12px gaps = 324px), all items, **no inner scroll**.
6. Opponents/flex as a collapsible "Next opponents (4)".
7. After lock: build sheet. The carousel becomes horizontal `scroll-snap` with the centre card at 60% width and 20% peeks; chips wrap.

**LOCK IN on mobile:**
- `position: sticky; bottom: max(16px, env(safe-area-inset-bottom))` while the section is in view.
- Scaled to 200×48 (≥44px touch target).

**Touch:** no hover. First tap = select/intent (and the preview), LOCK IN = lock, and a second tap on the selected tile also locks.

**Mobile performance:** particles 40; DPR ≤1.5; pause the canvas off-screen; the intro stagger is shortened to 180ms.

**Accessibility:**
- Grid: `role="listbox"` with roving `tabindex`; arrow keys move, Enter/Space select, Ctrl+Enter or the LOCK IN `<button>` locks.
- `aria-live="polite"` announces phase and selection.
- Timer bars are `aria-hidden`.

**Contrast** (computed):

| Pair | Ratio | Verdict |
|---|---|---|
| `#A09B8C` on `#010A13` | 7.2:1 | pass |
| `#C8AA6E` on `#010A13` | 9.0:1 | pass |
| `#B2D9DB` on `#1E2328` (LOCK IN) | 10.4:1 | pass |
| Client BAN label `#BE1E37` on `#1E2328` | **2.6:1** | **fails** → use `#F59898` (7.4:1) at rest, `#FF2345` for accents only |
| `#5C5B57` | 2.9:1 | disabled state only |

---

## 8. Do-not-ship and legal

**Seen during research, not to be copied:**
- Sprites: reticles, rings, buttons, linework, masks.
- WebM magic backgrounds and button videos.
- Position and class icon paths.
- All `.ogg` sounds and music.
- Beaufort/Spiegel fonts.

Rebuild everything with CSS (`clip-path`, `border-image`, gradients), our own SVG, canvas or a small shader.

**Repo risk:** `public/sounds/inqueue.mp3` (1.16 MB, ID3 title "InQueue", used by `src/hooks/SoundPlayer.tsx`) is very likely Riot's in-queue music. Origin is **UNVERIFIED**; replace it or confirm it.

Our UI copy should be our own words. Single-word labels like LOCK IN and BAN are generic.

Riot's "Legal Jibber Jabber" policy covers projects that *use* Riot assets [riot-legal]. We use none, so the required notice doesn't apply. A courtesy footer line such as "UI inspired by the League of Legends client; not affiliated with or endorsed by Riot Games" is still cheap insurance.

## 9. Uncertainties

- The LOCK IN button's exact y (≈590–635) and the carousel track width (≈470px) are inferred.
- The settle duration of the finalization "pre-animation" is not in the CSS (UNVERIFIED).
- Whether solo queue shows the full-screen `phase_transition` banner, or only Clash/tournament draft does (UNVERIFIED).
- Ban reveal is 5s per the wiki but the client animation constant is 6.4s; the server/client split is unverified.
- Pick order 1-2-2-2-2-1 is inferred from the wiki's "6 turns, alternate two at a time".
- Durations of the videos (magic backgrounds, LOCK IN enabled-intro/click) were not measured. I listed file sizes only; ours are invented to fit the CSS timings.
- The ban button border gradient hexes are estimated from the sprite.
- The proposed mains per lane, the learning list and the anti-pattern bans need owner input.

## Sources

- [cdragon-dir] Client champ-select plugin listing (sounds/, video/, images/, svg/), live 2026-11-09: https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/
- [css] https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/rcp-fe-lol-champ-select.css (2026-10-31; keyframes, layout, colours)
- [js] https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/rcp-fe-lol-champ-select.js (2026-11-04; template paths show client 16.22; `DURATIONS`, `TIMER_PHASES`, `SCREENS`, timer/bar/music/carousel logic)
- [trans] https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/trans.json (UI strings: phase lines, card statuses)
- [license.json] https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/license.json (`fuzzy` 0.1.3)
- [svg] https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/ (position-*.svg, glow.css, champion-splash-ban-component.svg, ban-ring-component.svg)
- [img] https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/images/ (config/reticle-sprite-324x324-2x6f.png, action-button/button-lockin.png, button-ban.png, config/linework-top.png, linework-button.png, champion-ring/ring-splash-dashed.png, background/center-splash-mask.png, config/overlay-defocus.png, summoner-object/player-object-ring.png, background-magic-blue.png)
- [wiki] Draft pick (phase timers, swaps, intent, quotes on lock): https://wiki.leagueoflegends.com/en-us/Draft_pick
- [wiki-pos] Positions: https://wiki.leagueoflegends.com/en-us/Position
- [riot-support] Default client size 1280×720: https://support.riotgames.com/en-us/league-of-legends/performance/troubleshooting-lag-or-low-fps-in-the-updated-client
- [riot-blog] Hextech UI internals (video state machine, 200/300ms fades, `speed="15000"` border, VO ducking): https://www.riotgames.com/en/news/under-hood-league-client’s-hextech-ui
- [riot-legal] Legal Jibber Jabber: https://www.riotgames.com/en/legal
- [wikimedia] React logo geometry: https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg
- npm (`npm view`, 2026-11-09): https://www.npmjs.com/package/gsap , https://www.npmjs.com/package/@gsap/react , https://www.npmjs.com/package/three , https://www.npmjs.com/package/@react-three/fiber , https://www.npmjs.com/package/@react-three/drei
- GSAP licence: https://gsap.com/standard-license
- Fonts (weights checked via the CSS API): https://fonts.google.com/specimen/Marcellus+SC , https://fonts.google.com/specimen/Cinzel
- three.js SVGLoader (fill-rule and stroke support confirmed in repo `node_modules/three@0.171.0`): https://threejs.org/docs/#examples/en/loaders/SVGLoader
- Previous research: `docs/research/2026-11-09-lol-client-ui.md`. Approved mockup: `.superpowers/brainstorm/181-1794242977/content/hextech-direction.html`

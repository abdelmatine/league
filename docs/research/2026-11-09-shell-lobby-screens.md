# League client: header, social, lobby, loading, post-game, profile, toasts

Date: 2026-11-09. Companion to `2026-11-09-lol-client-ui.md` (palette, buttons, base frame). This file does not repeat that one. It adds measured anatomy for seven client screens and maps each to a portfolio section. Audience: the front-end dev building the B ("Hextech landing") layout with the A client header.

## 0. TL;DR

- The live client's own stylesheets are public (CommunityDragon mirrors the client files, version **16.22**, files dated 2026-10-31). Most numbers below come from them, so they are measured, not guessed.
- **Header grid at 1280 px:** PLAY zone 215 px, nav 840 px, social column 225 px. The bar is 79 px plus a 1 px `rgba(240,230,209,.25)` bottom border.
- **PLAY button:** a 162×58 hit box. A **right-pointing arrow plate** 32 px tall, with a 15 px tip and a **concave left edge** (arc r 21.46, 8.4 px deep), hugs a round crest. The label is **gold-100 #F0E6D2**, not teal. The teal "swirl" is a noise texture seen through two dashed strokes animated along the outline: dash 50, a 1500 ms cycle on hover and 750 ms bursts, two blur layers. The whole thing can be rebuilt in SVG with no Riot assets.
- **Main nav tabs:** 14 px / 700 / .075em caps, #CDBE91 → #F0E6D2. The active tab gets a **15 px pointer at the top edge plus a bottom-up glow**, not an underline. The fading 1 px underline belongs to the **secondary** tabs (12 px / 500 / .1em).
- **Lobby:** banner columns are **196×592**. Slots are ordered centre-out (visual order 4-2-1-3-5). The local player gets a 180 px crest and a **#FABE0A** name. Empty slots show an 80 px "+" invite button.
- **Ready-made premium motion, measured:** the honor-ceremony card fly-in (`translateZ(600px) translateY(400px)` → 0, 2 s `cubic-bezier(.25,1,0,1)`, perspective 600 px). The reward ceremony: a 418.5 px ring scales Y 0→1 and linework slides out, 600 ms `cubic-bezier(.2,.9,0,1)`. The celebration toast: 422×135, with a rotating ticks ring (30 s per turn). The letterbox "vignette": two 360 px bars retract to 104–195 px over 400 ms.
- **Section plan:** Header → Hero (core) → About (= Profile) → Projects (= Party lobby) → Stack (= Champ select) → Career (= Loading-screen cards) → Achievements (= Post-game progression + honor cards) → Contact (= Social panel + form, with a PLAY → IN QUEUE → MATCH FOUND flow) → Footer (status bar). The loader is a ready-check "WAITING FOR OTHER PLAYERS" screen that exits through the letterbox vignette.
- **Repo finding:** `public/sounds/inqueue.mp3` is tagged "InQueue", 72.5 s, converted with ffmpeg from a DASH (YouTube-style) source. Treat it as Riot audio and replace it. The contact form also sends with placeholder emailjs IDs (`'YOUR_SERVICE_ID'`), so it cannot work as shipped.

## 1. Sources and confidence tags

- **[css] / [js]**: values read from the live client's plugin CSS and JS (CommunityDragon raw mirror, `latest` = 16.22.8348910, Last-Modified 2026-10-31). Riot's own code. These numbers were used to measure only. Nothing is copied into the product; the snippets below are our own code.
- **[str]**: UI strings from the client's `trans.json` files.
- **[asset]**: asset filenames in the client folders. They show layers and states (for example `play-button-hover-loop.webm`). We never ship them.
- **[rec]**: a community recreation (a WPF version of the PLAY button) that matches the [js] geometry.
- **[riot] / [wiki]**: web articles or support pages.
- **[obs]**: from memory of the client, not checked. **UNVERIFIED** marks anything open.
- **[ours]**: a design decision for the portfolio.

Context: TFT moved to its own client on Oct 7–9 2026 [riot FAQ]. The League client still ships the TFT tab string (`navbar_tft`) and the `rcp-fe-lol-tft` plugin, so it is unclear whether the tab is still shown (UNVERIFIED). Riot says a brand-new client is coming ("details at the end of this year", July 2026 interview; other coverage says 2027). The UI described here is the current one.

### Corrections to `2026-11-09-lol-client-ui.md`

1. Main nav: no sliding underline. See §3.4. The underline is only on secondary tabs.
2. The PLAY label is #F0E6D2 at 14/18/700/.075em [css]. The mockup's `.play-hex` (teal text, hex clip) should become the arrow plate plus crest (§3.2).
3. The header is exactly 80 px (79 + 1 px border) and the social panel exactly 225 px. The old doc gave both as "about".
4. Type scale in px [css typekit]: h1 40/42 .05em · h2 30/32 .05em · h3 24/28 .05em · h4 18/22 .05em · h5 14/18 .075em · h6 12/16 .075em · p 12/16 .025em #A09B8C · large body 14/20 .025em. All headings are #F0E6D2, 700. The old rem scale gave h2 = 28 px, which is wrong.
5. Toasts do not slide in from the right. They expand vertically (§9.2).
6. The frame ornament strip sits 6 px outside the padding edge (flush outside the 2 px border). It is 4 px tall, inset 12 px, and the top and bottom strips use different art. The frame gradient points toward the anchored edge (§9.1).
7. Status dot colours are exact pairs (§4.2), not approximations.

## 2. Tokens to add

### Colours (all [css])

| Token | Value | Where the client uses it |
|---|---|---|
| gold-local | #FABE0A | Local player's name (lobby, scoreboard), local stat bar, warning hover |
| line-soft | rgba(240,230,209,.25) (= hsla(40,50%,88%,.25)) | Nav bottom border |
| hover-wash | rgba(240,230,209,.10) | Roster row / group hover background |
| unread-wash | rgba(240,230,209,.18), pulsing to .40 | Unread rows |
| line-dark | #3C3C41 | Post-game header hairline; disabled and pressed label |
| xp-fill / xp-track | #0596AA (#0A96AA) / #0A323C | XP rings and arcs; ally team bar |
| online | fill #1E825A, ring #36D987, text #00A741 | Availability |
| in-game | fill #025579, ring #0ACBE6, text #16CAE5 | Availability (dnd / spectating) |
| away | fill #400A12, ring #BE1E37 | Availability |
| offline | fill #010A13, ring #5B5A56 | Availability |
| enemy / loss | #BE1E37 (hover #FF2345) | Team bar, LP loss |
| attention | bg #D09A1D, text #3D2E1D, deco #7D591C | Nav "new" callout |
| accept-idle | #A3C7C7 → hover #CDFAFA | ACCEPT! label |
| consolation | #4CB5D5 | Soft-positive helper text |
| stat-alt | #8566FF (CC), #1F995C (damage taken) | Scoreboard bars |
| card-fill | #181E1E | Honor card body |
| select-glow | #00CCFF | Honor selection border and glow |
| row-hover | rgba(205,250,250,.08) | Scoreboard and menu hover |

### Easings ([css], with where each is used)

| Name [ours] | cubic-bezier | Client use | GSAP |
|---|---|---|---|
| settle | .2,.9,0,1 | Reward ceremony, lobby slot move, toast ticks | `CustomEase.create("settle",".2,.9,0,1")` (≈ expo.out) |
| sharp-out | 0,0,0,1 | Toast frame expand, fades, search-field expand | ≈ expo.out |
| fly-in | .25,1,0,1 | Honor card entrance (2 s) | CustomEase |
| snap-in | 1,0,1,1 | Toast icon pop; LP loss scroll | ≈ expo.in |
| implode | .21,.02,1,1 | Nav icon glow collapse (700 ms) | CustomEase |
| pop | 0,1,1,1 | LP number glow-grow (333 ms) | CustomEase |

CustomEase accepts 4-number cubic-bezier strings ([gsap docs]). It is imported as `gsap/CustomEase`; it is not part of the core. Versions as of today: `gsap` **3.15.1** (published 2026-11-04, "Standard no-charge licence"), `@gsap/react` **2.1.2**. Avoid `gsap@4.0.0-beta.3`.

## 3. Top header

### 3.1 Grid [css]

```
|<- 215 PLAY zone ->|<----------- 840 nav root ------------>|<- 225 social ->|  = 1280
 height 79 + 1px bottom border rgba(240,230,209,.25)
```

- `.left-nav-menu` and `.right-nav-menu`: flex, height 79 px. Each tab's `.section` is 79 px tall.
- Over content (lobby/post-game): `backdrop-filter: blur(12px)` with `linear-gradient(180deg, rgba(1,10,19,.6) 46.02%, rgba(1,10,19,.25))`, height 79. **Use this for the sticky header on a scrolling page.**
- Plain backdrop tint: `rgba(1,0,13,.3)`.

### 3.2 PLAY button anatomy

| Layer | Spec | Tag |
|---|---|---|
| Hit box `.basic-button` | 162×58, left 29, top 10, padding 7px 0, `opacity .3s ease-out` | [css] |
| Frame image | Fills the box, contain, `transition: background .4s ease` | [css] |
| Plate container | Background image per mouse state (default / hover / pressed / disabled; lobby set separate), `transition: background .4s ease .2s` | [css][js] |
| Content | Starts at **left 36 px** to clear the crest, padding 6, width calc(100% − 34px). In the PLAY variant the text box is calc(100% − 16px) so the tip stays clear. | [css] |
| Label | Display font 14/18, 700, .075em, uppercase, **#F0E6D2**. Pressed and disabled **#3C3C41**. Polish shrinks to 12/16. | [css] |
| Crest (League logo) | Overlaps the plate: logo at left −13, top −6. Logo videos at left 20, top −7; large video at top −25. | [css] |
| Plate outline | 32 px tall arrow, 15 px tip at mid-height, **concave left arc** (r 21.461, 8.4 px deep) that hugs the crest. The same outline exists flat-left for other arrow buttons. | [js] uikit `animated-arrow-overlay`; [rec] WPF path 118×28 agrees |

Rebuild ([ours]; W = plate body width, about 110 for "PLAY", 130 for "PARTY"):

```svg
<path d="M0 0H{W}l15 16-15 16H0a21.46 21.46 0 0 0 8.4-16A21.46 21.46 0 0 0 0 0Z"/>
```

Our colours, from existing tokens:

| State | Fill | Stroke (2 px) |
|---|---|---|
| Idle | #1E2328 | `to bottom` #0AC8B9 → #005A82 at 80% |
| Hover | #0A323C → #091428 | #CDFAFA → #0397AB |
| Pressed | #0A1428 | #5B5A56 |
| Disabled | #1E2328 | #3C3C41 (crest desaturated) |

The WPF version uses #3FE7FF/#006D7D/#0493A7, then #AFF5FF/#46E6FF/#00ADD4 on hover. Those are close, but the palette tokens are safer.

Crest ([ours], replaces the League "L"): a 56 px circle with a 2 px gold-gradient ring (§8.2 proportions), our monogram, and a teal crystal glint.

### 3.3 PLAY state machine [js] (Ember `basic-button` with `lol-uikit-video-state-machine`)

Events: `enabled`, `disabled`, `hover-in`, `hover-out`, `release`, `refresh`. Mouse states: `default`, `hover`, `pressed`, `disabled`. Two video sets exist ([asset]):

- **play:** `button-disabled-intro`, `play-button-enabled-intro`, `patcher-to-play-button-enabled`, `play-button-hover-intro/loop/outro`, `play-button-release`, `play-button-magic-release`, `league-logo-loop-idle`, `league-logo-magic`.
- **lobby ("Party"):** `lobby-button-intro`, `lobby-button-hover-intro/loop/outro`, `lobby-button-release`, `lobby-button-magic-release`, and `lobby-button-to-play-button` for the switch back.

The logo also has `league-logo-intro` and `league-logo-loop-active`, which loop while patching. Hover is ignored while you are already viewing the lobby. Labels [str]: "Play", "Party", "In Queue", "Estimated:". There are separate hover and click sounds for each set. The Riot tech blog gives the state fades: **in 200 ms, out 300 ms**.

Portfolio state table ([ours], built on the above):

| State | Trigger | Label | Visual | Timing |
|---|---|---|---|---|
| patching | 3D/assets chunk loading | PLAY (dim) | A teal bar fills inside the plate (client loader gradient, §10) | Until ready |
| enabled-intro | Ready | PLAY | Fast swirl burst plus crest flash | 750 ms |
| idle | — | PLAY | Static. Optional crest glint every 8 s. | — |
| hover | pointerenter / focus | PLAY | Swirl container 0→1 over 300 ms linear; 1500 ms dash cycle loops; label adds text-shadow 0 0 6px rgba(205,250,250,.5) | Loops |
| hover-out | leave / blur | PLAY | Swirl fades over 300 ms; static class after 500 ms [js] | 500 ms |
| pressed | pointerdown | PLAY #3C3C41 | Pressed fill | Instant |
| release | click | — | Fast swirl (750 ms cycle) for 1500 ms [js] plus a radial burst; opens the "Match found" contact modal | 1500 ms |
| party | Contact modal open or #contact in view | PARTY | Lobby colour set; crossfade background over 400 ms with 200 ms delay [css] | 400 ms |
| in-queue | Form submitting | IN QUEUE 0:03 | Swirl loops slowly; timer in 12/16 body | Until response |
| match-found | Send OK | MATCH FOUND | Hands off to the toast or ready-check (§9) | — |

The client shows the queue timer in the lobby footer, not in the header. Putting it in the header is our choice (UNVERIFIED that the client does this).

### 3.4 Swirl recipe [js] (uikit animated-arrow-overlay, rebuilt [ours])

- An SVG 16 px larger than the plate (path offset by `translate(8px,8px)`).
- Two **masks**, each a `<use>` of the outline with `stroke-width 4`, `stroke-dasharray 50`:
  - Mask A animates dashoffset 0 → −100.
  - Mask B starts at −50 and animates to −150.
  - Both are linear and infinite. The cycle is **1500 ms on hover** and **750 ms for the init and click bursts**. Init returns to static after 750 ms, click after 1500 ms [js].
- Each mask reveals a **noise texture** (the client uses a 400×40 pattern). We draw ours with `feTurbulence` coloured teal; tune the values:

  ```svg
  <feTurbulence type="fractalNoise" baseFrequency=".035 .25" numOctaves="2"/>
  <feColorMatrix values="0 0 0 0 .04  0 0 0 0 .78  0 0 0 0 .73  1.6 0 0 0 -.4"/>
  ```

- The result is drawn twice:
  - low layer: `filter: blur(2px) contrast(1.15); opacity: .75`
  - high layer: `filter: blur(4px) contrast(1.35) brightness(1.5); opacity: .85`
- Container: `opacity 0 → 1, 300ms linear`.
- A cheaper variant for gold CTAs (the uikit "comet border"): a 2 px #F0E6D2 streak with `drop-shadow(0 0 1px)` ×2 travelling round the border in 3 s, infinite.

### 3.5 Nav tabs (main, `nav-bar`) [js]

- **Text:** display 14 px, 700, .075em, uppercase, padding 0 12 px, full 79 px height.
- **Colours:** default #CDBE91 · hover #F0E6D2 · active #F0E6D2 · pressed (not active) #C89B3C · disabled rgba(240,230,209,.5) in the main nav (the component's own default is #888).
- **Hover:** an `::after` layer `linear-gradient(0deg, rgba(205,190,145,.2) 0%, rgba(31,37,38,0) 55%)` fades in over **100 ms ease-out** and out over **400 ms ease-in**.
- **Active:**
  - background `linear-gradient(0deg, rgba(205,190,145,.15), transparent 55%)`
  - `::before` pointer image, 15 px tall, full width, centred, at `top:-1px`
  - a `.section-glow` highlight image (100%×32, bottom-aligned, opacity transition 100 ms)
- **Transitions:** `text-shadow .3s ease-in-out`, background 1.5 s.
- **Alert dot:** 10 px circle in the text colour, top −5, right 0.
- The pointer art is unseen (UNVERIFIED). [ours]: a 7 px CSS chevron in #C8AA6E with `drop-shadow(0 0 4px rgba(200,170,110,.6))`.

**Secondary tabs** (`nav-bar-secondary`, used for section sub-tabs):

- 12 px, **500**, .1em, #CDBE91 → active #F0E6D2.
- Active underline: 1 px at `top:20px`, `linear-gradient(to left, transparent, #CDBE91, transparent)`.
- Alert dot 6 px #C89B3C.

**Vertical tab list** (`tabbed`, for settings-style side menus):

- 14 px / 700 / .0325em #C8AA6E, hover #F0E6D2, pressed #785A28, disabled #5C5B57.
- Line-height 30, padding-left 12, color transition 300 ms.
- Active: a 3 px #C89B3C left bar fades in over 400 ms.

### 3.6 Right side [css]

- **Icon tabs** (profile, collection, loot, store):
  - 24×24 mask icons, #CDBE91 → hover #F0E6D2 → pressed #785A28; disabled `rgba(240,230,209,.5)`.
  - Item min-width 40 (68 with text).
  - **Activation:** `popEffect` 100 ms linear (starts white at scale .8) plus a glow `box-shadow 0 0 26px 16px #CDBE91` that collapses (opacity 1→0, scale 1→.1) over **700 ms `cubic-bezier(.21,.02,1,1)`**.
  - Unread pip at right 7, top 25.
- **Attention callout** (nav "new feature"):
  - 375 px wide, top 92 (12 px under the bar), bg #D09A1D, radius 2, 12 px arrow up.
  - Title 18/22 700 #3D2E1D, message 12/16, dismiss X 12 px at 8/8.
  - Entrance UNVERIFIED. [ours]: 300 ms `settle` from translateY(−6px).
- **Wallet:**
  - Two counters stacked (RP above BE, margin-bottom 5), display 14 px / 700 / .075em, #CDBE91 → #F0E6D2.
  - Icons 15×15 (RP, padding-left 24) and 17×17 (BE). The BE icon plays add/remove videos when the value changes.
  - Top-up pill: 115×26, radius 14, 1 px rgba(160,155,140,.5) border, #010A13 fill.
  - Group margin-right 26.
- **Vertical separator:** 2×57 px, `linear-gradient(0deg, transparent, #CDBE91 50%, transparent)`.
- **Status ticker:** a 32×32 button in blue, red or yellow variants.
- **Window controls** (help, minimize, settings, close): 18×18 masks #A09B8C → hover #F0E6D2 → active #5B5A56, gap 15.

### 3.7 Portfolio header [ours]

- **≥1280 px:** 80 px tall. Left to right:
  - PLAY: "PLAY" → contact flow.
  - Main tabs: **HOME · PROJECTS · STACK · CAREER · CONTACT**.
  - Spacer.
  - Icon tabs: Profile → #about, Collection → GitHub, Loot → CV download (fires the reward ceremony, §9.3).
  - Separator.
  - Stacked counters ("11 PROJECTS", "5 YEARS"; our own glyphs).
  - Separator.
  - Profile crest, 40 px, with an XP ring.
  - Sound toggle (settings-style icon).
- **1024–1279 px:** 72 px; counters hidden.
- **≤767 px:** 56 px. Crest is 40 px, plate 28 px tall. The burger opens a **social-panel-style drawer** (right side, `min(320px, 86vw)`) with tabs as roster groups (§4).
- **Active tab** follows scroll through ScrollTrigger / IntersectionObserver. On change, play `popEffect` on the label colour and the bottom glow.
- **Sticky backdrop:** the lobby `navbar-blur` values (§3.1). Use the `blur(12px)` only on this one element (mobile GPU cost).

## 4. Social panel (friends list, groups, chat dock)

### 4.1 Layout [css]

| Part | Spec |
|---|---|
| Panel | 225 px column. Background `linear-gradient(#010A13, transparent 18%)`. Base text 12 px #A09B8C. The list fades in over 500 ms. |
| Identity (you) | Width 213, min-height 55, padding-top 20 |
| Identity avatar | 56×56 (margins 0 12 5 11); icon 48 px at 5,5 |
| XP ring | 56 px; track #0A323C, fill #0596AA, centre #010A13 48 px, so the ring is 4 px |
| Level ring art | 70 px (bg 76 px) at −10/−10, `brightness(1.5)` on hover |
| Level number | Display 11 px #A09B8C at bottom −10 |
| Name | Display 14/18 700 .0375em #F0E6D2 |
| Status line | Body 12/16 .025em #A09B8C, hover #F0E6D2 |
| Actions bar | 33 px: "SOCIAL" label plus 30 px buttons with 18 px masks (add friend, add folder, sort, search), #C8AA6E → #F0E6D2 → #463714. Search expands with `width .2s cubic-bezier(0,0,0,1)`; the field has a gold border-image #785A28→#C8AA6E. |
| Group header | 24 px tall, mb 4, bg rgba(1,10,19,.45). Display 12/16 700 .075em caps #A09B8C, label padding 0 9. Hover: wash .10 and #F0E6D2. Unread: wash .18 pulsing to .40, **825 ms ×4 alternate**. Collapse chevron box 18 px, `width .25s cubic-bezier(0,0,0,1)` + `opacity .25s ease-out`. Rename sweep #785A28 over 300 ms ease-out. |
| Member row | 212×48; icon 32 (margins 0 8 0 2). Name body 14/20 .025em #A09B8C; status #5B5A56. Hover: wash .10, name #F0E6D2, status #A09B8C. Pressed name #3C3C41. Offline: icon .5 opacity, name #5B5A56. Riot ID tag #5B5A56. Open-party marker: 4 px #1E825A left bar. Row `opacity .3s ease-out`. |
| Scrollbar | 11 px. Thumb #785A28 with a 3 px transparent border, radius 6, min 32. Hover #C8AA6E, active #463714. |
| Chat button | 38×32. Unread pulse is `brightness/saturate 1→1.5`, .75 s ease-in-out infinite alternate. |
| Hover card | 390 px wide (profile summary on hover) |

### 4.2 Availability dots [css]

8 px circle (11 px large), 2 px ring, outer `box-shadow 0 0 0 2px #010A13`. Ring and fill per status are in §2. Mobile users get a 12 px phone glyph instead. The roster's status line is grey by default; whether each status gets its own colour there is UNVERIFIED (the hover card colours them: in-game #16CAE5, online #00A741).

```css
.dot{width:8px;height:8px;border-radius:50%;border:2px solid var(--ring);background:var(--fill);box-shadow:0 0 0 2px #010A13}
.dot.online{--fill:#1E825A;--ring:#36D987}.dot.ingame{--fill:#025579;--ring:#0ACBE6}
.dot.away{--fill:#400A12;--ring:#BE1E37}.dot.offline{--fill:#010A13;--ring:#5B5A56}
```

### 4.3 Portfolio use [ours]

- **Hero identity chip** under the title: 56 px crest with XP ring, the name, and a status line with a dot: "● Open to work" (online) or "● Shipping <project>" (in-game).
- **Contact section, right column:** the full panel.
  - Group "SOCIALS (4/4)" with rows for GitHub, LinkedIn, Email and Instagram. Each row has a status line ("In game · committing daily", "Online · replies < 24h").
  - Clicking a row opens the link. Email copies the address and fires a toast.
- **Chat dock:** the current `ChatBox` becomes a 33 px bar. The chat button pulses while unread, and opening it expands into the contact form.
- **Mobile nav drawer:** reuse the group and row components.

## 5. Party lobby

### 5.1 Anatomy [css][js]

| Part | Spec |
|---|---|
| Column | **196×592** (placeholder). Five in a centred row (980 px). |
| Order | Slot 1 (you) in the centre; slots 2 and 3 to its left and right; slots 4 and 5 at the far left and far right. Visual order **4-2-1-3-5**, set with CSS `order` 10–50. |
| Banner art | A tall hanging flag behind the crest. The static image is 148% of the column wide at top −18%; for other players 132% at −9%, on a 176 px background at top −25. The "waiting" image is 324×762. States: initializing → preloading → intro → intro-overlap → static, plus waiting / waiting-static / outro. |
| Crest | 160×160 (others) / **180×180 (local)**. Margin-top 5 (local 0). Spacer 190 above the name. |
| Name | Display 16/18 #F0E6D2, max 160 px, ellipsis. The party-controls variant uses 18/22 #A09B8C for others and **24/28 #FABE0A for the local player**. Leader crown 16 px before the name. |
| Achievement row | Min-height 82: 3 challenge tokens (§8) |
| Position icons | Two 24 px glyphs, each on a **36×36 black diamond** (square rotated 45°, 1 px #CDCDCD border), 7 px side margin. Margin-top 30 (local 50). Transitions .5 s circular ease-out. In single-selector mode: primary +20 px x; secondary fades and scales to .8 from −30 px. |
| Local highlight | `banner-highlight` opacity 1 (a glow behind your banner) |
| Party controls | Kick / promote / options buttons 41.91 px. They fade in on banner hover over **200 ms linear**. |
| Empty slot | Invite button **80×80** centred in the 592 column; the icon has default, hover and active art |
| Slot move | `transform .5s cubic-bezier(.2,.9,0,1), opacity .4s ease-out` |
| Invited slot | Invited-banner image, then a video fades in over .5 s ease-in-out after .2 s |
| Intro | A gem / crystal drops onto your banner (`#player-banner-gem-intro` 500 px tall at top 175; Lottie or video) |
| Lobby header | Game mode text: display 14/18 .075em #F0E6D2, details #A09B8C, `text-shadow 0 1px 2px rgba(1,10,19,.5)`, small #5B5A56 separators |
| Footer | 50 px, bottom 5. **FIND MATCH** 188×48, text #CDFAFA 14/18 700 .075em (pressed #005A82). Wing ornaments 122×28 on both sides at ±110 px (mirrored). |

Ranked border on the crest: an ornament frame **188%** of the crest box, centred (§8.2).

### 5.2 Portfolio use: Projects [ours]

- Secondary tabs: **FEATURED · WEB · MOBILE · ALL (11)**. Each tab is a "lobby" of up to 5 banners.
- Changing tab replays the banner drop. Slots below 5 show "+" invites ("Your project here" → contact).
- **Banner build:**
  - 196×592 at 1280 px; aspect **0.331**. Scale with `clamp(168px, 15.3vw, 216px)`.
  - Silhouette `clip-path: polygon(0 0,100% 0,100% calc(100% - 28px),50% 100%,0 calc(100% - 28px))`, as in the approved mockup.
  - Trim: 2 px border-box gradient #C8AA6E → #463714 40% → #463714 80% → #785A28. Fill: #0A323C → #010A13 60%.
  - Cloth sheen: three vertical 8%-white bands at 18/50/82%.
  - A 6 px gold rod above, 16 px wider, with round end caps.
- **Banner contents:**
  - Crest: the project logo on a 76% icon inside an 82% circular mask.
  - Ring pill: the year.
  - Name in caps.
  - Three tokens: key metrics.
  - Two diamonds: main frameworks (framework logos are allowed).
  - On hover, three 42 px round buttons (Live ↗ · Code · Details) fade in over 200 ms linear.
- **Featured project** sits in slot 1: 180 px crest, #FABE0A name, radial glow `rgba(250,190,10,.15)`.
- **Entrance** (ScrollTrigger at 60% of the viewport): banners drop from translateY(−40px) and scaleY .92, origin top, 500 ms `settle`. Stagger 120 ms in **centre-out order (1,2,3,4,5)**. Then a 400 ms gem flash on each crest (radial #CDFAFA → transparent, scale .6→1.4, opacity 1→0).
- **CTA** under the row: FIND MATCH-style 188×48 magic button with drawn wings → "SEE ALL 11". The remaining projects go in a grid below.
- **Mobile:** horizontal scroll-snap row (`scroll-snap-type:x mandatory`, 196 px cards, 16 px gutter); or 2 columns with the banner height cut to 420 px.

## 6. In-game loading screen cards

This screen belongs to the game, not the client, so there is no [css] for it. Sources are the wiki and memory.

- **Grid:** two rows of five cards (one team per row). A random tip sits in the centre [wiki]. Background: map art [obs].
- **Card art:** champion loading art **308×560** (aspect **0.55**) [wiki file sizes].
- **On each card** [wiki]:
  - skin name (gold small caps) [obs styling]
  - Riot ID
  - two summoner spells
  - keystone rune plus secondary-tree icon
  - ranked border by current rank (Silver and up), with jewel ornaments and the division in the border
  - honor flair at top centre (honored last game and Honor ≥3)
  - mastery shown on the banner from level 4 [riot support]
  - a "climb indicator" announced for 2026 [riot, Dec 2025]
- **Loading %:** shown per player ("100%", "80%") [wiki]. Exact position UNVERIFIED [obs: below each card].
- Clicking a card flips it to show mastery and level [wiki].
- **Our card build:** 2 px frame in the gold-press gradient. Name plate across the bottom 26%: `linear-gradient(transparent, #010A13 60%)`. Two 22 px square "spell" slots and a 26 px round "keystone" at bottom-left. Under the card, a 200×11 progress frame (§10) with the % in 12/16 #A09B8C.

### Portfolio use: Career / experience [ours]

- One card per role or degree, at most 5 per row, 220×400 desktop.
- Card "art" is our own: an abstract gradient plus the company monogram. Never champion art.
- Text mapping:
  - skin-name line = job title
  - name line = company
  - two spell slots = the two key skills
  - keystone = main tech
- **Tenure bar:** past roles fill to 100%. The current role counts up to its share of a typical stint and keeps a slow 2 s pulse.
- **Entrance:** cards fade up 24 px, stagger 120 ms. The % counts up over 1200 ms `power2.out` (GSAP `snap: 1`).
- **Click:** the card flips (`rotateY(180deg)`, 600 ms `settle`, backface hidden) to show bullet achievements.
- **More than 5 entries:** switch to "match-history rows" (§7.3 row spec).
- This needs content the site doesn't have yet.

## 7. Post-game

### 7.1 Header and result [css][str]

- Header 80 px, margin 0 24, bottom border thin #3C3C41. On the progression tab it gets the same blur and gradient as the nav.
- Map icon 42×42 (mr 7). Then the result text "VICTORY" / "DEFEAT" with 8 px #F0E6D2 dot dividers (margin 3 10). A leaver's result is #5B5A56.
- Tabs: **Progression · Scoreboard**. Buttons: "PLAY AGAIN", "HOME" / "Return to Party", "Next".
- The giant animated VICTORY crest is part of the game, not the client [obs]. Do not copy it.
- [ours] VICTORY treatment, built from the measured reward-ceremony pieces (§9.3):
  - display 40/42, gradient text `linear-gradient(180deg,#CDBE91,#C8AA6E 35%,#765C29)` with `background-clip:text`. This is the client's "promoted number" gradient [css].
  - letter-spacing .3em → .05em and scale 1.15 → 1, over 600 ms `settle`
  - two linework rules sliding out from the centre (407 px, 600 ms `settle`)

### 7.2 Progression widgets [css]

- **Champion-mastery radial:** 139×139, three ring layers (track, current, gained) at 112% with a −6% offset. Crest image 65–88% of the box, by level. Marks 26×26 (empty or complete). Grade letter display 30/32 700 .05em. Details block 111 px. Small variant 90×90 with 20 px marks.
- **Meter bar:** 20 px container, **5 px fill**, 148–170 px wide. Fill is a sprite slid by `background-position: calc(-W + W*var(--progress))`. [ours]: use `transform: scaleX(var(--p))` with the §10 gradient, 1200 ms `settle`.
- **LP card:**
  - frame 189 px tall, fade in 250 ms linear; header at 25%, body at 51%, footer at 77% (500 weight, .1em)
  - **gain:** number scales 1 → 1.5 over 333 ms `cubic-bezier(0,1,1,1)`, flash fades over 500 ms ease-in
  - **loss:** scroll 333 ms `cubic-bezier(1,0,1,1)`, flash after 350 ms, delta in #BE1E37
  - consolation line #4CB5D5 fades in over 1 s after .5 s; pending spinner after 2 s
  - series pips 20 px: enter-shrink 333 ms `cubic-bezier(1,0,1,.5)`, then glow 1 s ease-in
- **Number reels:** top and bottom 1 px rgba(120,90,40,.5) rules, margin 5px 0.
- **Honor notification:** 195×97, fades over 500 ms. A 120×17 indicator sweeps ±163 px every 4 s (opacity .6), clipped by a horizontal fade mask (20%–80%). Category icon 32 px moves 195 ms ease-in-out after 896 ms. Videos 80×80.
- **Reward outro sizes** [asset]: 515, 900 or 1280 wide by 330, 445 or 512 tall. This is the client's reward panel template set; useful size presets for our panels.

### 7.3 Scoreboard row [css]

- 956×40 at 1280 px. A 3 px colour bar: ally #0A96AA, enemy #BE1E37, **you #FABE0A** (your name too).
- Player block 336 px: skin art masked left-to-right under a `#010A13 → transparent 37%` overlay. Name and champion 160 px.
- Items 235 px (6 px spacer before the trinket).
- Stat columns 90 px wide, each with a **52×4 bar** on a #3C3C41 track. Fill colours: damage #CDFAFA, CC #8566FF, damage taken #1F995C, you #FABE0A. Fill animates `transform .43s ease`. A 14 px star marks the top value.
- Hover: `linear-gradient(90deg, rgba(205,250,250,.08) 88.2%, transparent)`. A right-side 299 px controls area slides in.
- Header row hairline thin #3C3C41.

### 7.4 Honor ceremony [css][riot]

- Full screen, 1280×720. Title display 24/36 .05em #F0E6D2. Remaining votes as 24×24 pips (diamond fades in over 50 ms; heart fades out over 300 ms).
- Player container 878 wide, padding-top 12, **perspective 600 px**.
- **Cards:**
  - ally 206×288 (aspect .715), border gradient `#16CAE5 → #3C3C41`
  - enemy 162×228, border gradient `#FF2345 → #3C3C41`
  - fill #181E1E, 2 px border-image
  - hover: a second border `#B2D9DB → #5B5A56` fades in over 200 ms ease-out, and the .2 black overlay clears
  - voted: border 2 px #00CCFF with inset and outer 15 px glow (keyframes: hidden until 10%, on at 13.33%, border shrinks to 0 by 85%, gone by 100%, total 3 s); badge 64 px at top 170 (48 px at 136 for enemies) fades in over 200 ms; celebration video
- Role corner: 60×60 dark wedge, `linear-gradient(135deg, rgba(0,0,0,.15) 45%, transparent 60%)`, with a 20 px role icon at 8/8.
- Names: summoner #A09B8C 700 .03em; champion #5B5A56 12/18. Colours change over 200 ms ease-out.
- **Entrance:** from `translateZ(600px) translateY(400px)` to 0, **2 s `cubic-bezier(.25,1,0,1)`**. A low-spec mode skips it.
- Exit: opacity over .1 s after a 1.4 s delay.
- Today's rules: you can honor **either team**, one vote per player, up to 4 banked votes; votes cannot be taken back [riot support]. Opponent honor returned in Sept 2024 (14.18) [ensigame].

### 7.5 Portfolio use [ours]

- **Achievements section, "SEASON 2026 · VICTORY"**: the post-game header, then the progression row:
  - XP bar: level = years coding; the bar is progress to the next year
  - three mastery radials: top skills, levels 1–10 with crests we draw
  - an LP-style card: GitHub contributions this year (+N, with the gain animation)
  - number reels: projects, clients, commits
- **Testimonials:** honor ceremony cards (206×288) flying in with the 2 s fly-in. On mobile: a single column, translateY(40px) → 0 over 600 ms. Show only if real testimonials exist.
- **Contact success:** a small post-game: VICTORY gradient line, a meter filling 0→100% in 900 ms, then the celebration toast.

## 8. Profile

### 8.1 Overview layout [css][str]

- Sub-tabs (secondary style): **Overview · Match History · Ranked · Challenges · Masteries**. "Runes" and "Spells" also exist as legacy labels.
- Overview content inset 35 px each side; fades in over **500 ms ease**. Backdrop: the player's highest-mastery champion splash, masked [str].
- **Left column** (194 px):
  - banner backdrop **196×592** (the lobby banner)
  - crest **100×100** ("huge") at y 235; a 192×192 picker ring on hover
  - challenge tokens row at y 394 (46 px)
  - other absolute offsets: XP bar y 204, XP pill y 165, status icons y 628
  - Which elements stack in which order is partly UNVERIFIED; own and searched profiles may differ.
- **XP pill:** height 20, min-width 48. An SVG circle progress rotated 90°, stroke #0A96AA on #1E2328, `stroke-dashoffset .35s`. Numbers display 12/16 700 .075em #A09B8C. Hover shows "xp / next" (body 12/16) 25 px below.
- **Level bar:** 175×20. Number plate at left 15. Level 12/16 700 #F0E6D2, 34 px wide at left 27. Fill track from 65 px to right 22. Hover brightens the fill and shows the numbers below.
- **Emblem row** (bottom right): 240 px tall, flex-end, slots **144 px** wide.
  - Slot title #CDBE91 12/16 700 .075em (hover #F0E6D2); subtitle 10/14 #F0E6D2.
  - Ranked crest 134 px tall.
  - Tooltip divider 1×90 `linear-gradient(270deg, transparent, #785A28, transparent)`.
  - Warning colours #C89B3C → #FABE0A and #BE1E37 → #FF2345 (transition 250 ms).
- **Challenge tokens:**
  - containers 38 px (46 local), token 32 px (40 local; capstone 34 / 44)
  - empty slot `rgba(255,255,255,.09)`
  - next-token ring glow `0 0 34px #C8AA6E`
  - title tooltip token 56 px

### 8.2 Crest system [js] (one component everywhere)

- **Summoner icon:** 76% of the crest box, under a circular mask at 82%.
- **Plain ring** (no rank): 95% at 2.5% inset.
- **Ranked frame:** **188%** of the box, centred (wings and ornaments overflow). Division text under it.
- **Themed level ring:** level text at top 84.5–85%; 10–12 px by size (small, medium, large, huge).
- **Voice halo:** a 4 px #36D987 ring at 76% − 8 px.
- **Level borders:** **21** in total, at levels 1, 30, 50, then every 25 to 500 [loltheory].
- **Mastery:** since 14.10 (15 May 2024) levels have no cap. Crests 1–10 get more complex as they rise; level 11+ shows the number on the level-10 crest. Marks are needed from level 5 [riot support].

### 8.3 Portfolio use: About [ours]

- **Left column:** our banner (196×592) with a 100 px photo crest (XP ring = years) and the name.
- **Title line:** "Full-stack engineer" in display 14 caps #C8AA6E.
- **Tokens:** three tokens for three headline facts, for example "Spring + React", "11 shipped", "Open to work".
- **Right side:** a two-paragraph bio (body 14/20), then the emblem row of 4 × 144 px slots:
  - Education (in the "ranked" slot): our degree crest
  - Top mastery: React crest, level by years
  - Honor: testimonials count
  - Challenges: certifications
- **Entrance:** content opacity 0→1 over 500 ms, then the crest XP ring fills over 1200 ms (the client uses .35 s; slower suits a reveal), then tokens pop with a 120 ms stagger (scale .8 → 1, 300 ms `settle`).

## 9. Toasts, modals, celebrations

### 9.1 Dialog frame (modal) [js]

- **Fill and shadow:** #010A13; `box-shadow 0 0 0 1px rgba(1,10,19,.48)`; `::before` `0 0 10px 1px rgba(0,0,0,.5)`.
- **Border:** 2 px border-image. The gradient points toward the anchored edge:
  - `.top`: `to bottom`, #785A28 0 → #463714 50% → #463714
  - `.bottom` / `.left` / `.right`: the matching direction
  - disabled: #39393E → #1E282D within the first 5 px
- **Ornament strips:** 4 px tall, inset 12 px, sitting 6 px outside the padding edge (flush outside the border). Built with `border-image-slice 4 4 0 4`, so each strip has 4×4 end caps. The top and bottom strips use **different** art ("secondary" and "primary"), rotated 180° on top-anchored frames. The art itself is UNVERIFIED. [ours]: a 1 px #785A28 hairline strip on #010A13, radius 2, with a 6 px rotated-square gem at the centre of the top strip.
- **Close X:** 24 px at 8/8, `rgba(0,0,0,.5)` (hover `rgba(10,20,40,.5)`), radius 4, X glyph at 75%.
- **Buttons** sit over the bottom border, as in the old doc. The ready-check buttons sit at bottom −11 px.

```css
.hx-dialog{position:relative;background:#010A13;border:2px solid transparent;
  border-image:linear-gradient(to bottom,#785A28,#463714 50%,#463714) 1;
  box-shadow:0 0 0 1px rgba(1,10,19,.48),0 0 10px 1px rgba(0,0,0,.5)}
.hx-dialog::before,.hx-dialog::after{content:"";position:absolute;left:12px;right:12px;height:4px;
  box-sizing:border-box;background:#010A13;border:1px solid #785A28;border-radius:2px}
.hx-dialog::before{top:-6px}.hx-dialog::after{bottom:-6px}
```

### 9.2 Celebration toast [css]

- **Size and layout:** 422×135 box.
  - Framed body on the right: inner width 350, height 64–135.
  - Left edge fades in from a radial `#010A13 50% → transparent` (80 px, extends 6 px above and below).
  - Body padding 15 0 15 108, width 356, margin-right 25.
- **Medallion** (left, 135×135, overlapping the frame):
  - Ticks ring, two dashed circles:
    - fill ticks: stroke #785A28, width 7, dash 2.15/6.98, opacity .5
    - border ticks: stroke #000, width 8, dash 3.15/5.98, opacity .75
  - The ring **spins every 30 s**. Image 128 px.
- **Text:** title display 14/18 700 .075em #F0E6D2; details body 12/16.
- **Group indicators:** a "×N" tag (25×17 pill, #010A13, 2 px #785A28 border) and 10 px pips (opacity .7) for grouped toasts.
- **Entrance (all 500 ms):**
  - frame `scaleY .5 → 1` and opacity .5 → 1, `cubic-bezier(0,0,0,1)`
  - ticks scale .5 → 1, `settle`
  - image scale .5 → 1, `settle`
  - icon 1.25 → 1.2 (at 40%) → 1, `cubic-bezier(1,0,1,1)`
- **Exit:** opacity over 400 ms `cubic-bezier(0,0,0,1)`.
- Where the toast layer sits on screen is UNVERIFIED. [ours]: bottom-right, 24 px from the edges, above the chat dock. At most 3 stacked with 8 px gaps. Auto-dismiss after 5 s; pause on hover. Announce with `role="status"`.
- **Ticks ring radius** is UNVERIFIED. [ours]: SVG viewBox 135, r = 60.

### 9.3 Reward ceremony (centre modal) [css]

- Container 1235 px wide.
- Black disc 366 px with `box-shadow 0 0 174px 79px #000` (a huge soft vignette).
- Inner ring 418.5 px: `scaleY(0) → 1`, 600 ms `settle`.
- Outer dashed ring 418.5 px: rotates every **80 s**, fades in over 1 s after 600 ms.
- Linework: two 407.25×10 rules slide from ±407 px to 0 (the right one is mirrored), 600 ms `settle`.
- Content fades in over 1 s after 600 ms.
- Reward image area 150 px. It rises (header 315 px with −130 px top margin) and carries `drop-shadow(0 0 46px #010A13)`.
- Title display 24 #F0E6D2; a 347.5×15 rule; body max-height 120 px.
- The body text curves to follow the circle using float shapes 80×120 with `shape-outside: polygon(0 0,50% 70%,100% 100%,0 100%)` (and its mirror).
- OK button 130×39 at y 391 (sprite). [ours]: a gold button.

**Use:** "Download CV" (Loot icon), the Easter egg, and a "project shipped" announcement.

### 9.4 Vignette (letterbox) celebration [css]

- Full screen. Top and bottom bars `rgba(0,0,0,.5)` start at 360 px each (closed = whole screen) and retract to a max height of 195 / 137 / 104 px (small / medium / large).
- `transition: all .4s`. The inner edge of each bar has a 2 px rule `linear-gradient(90deg, #32281E, #785A28 50%, #32281E)`.
- Header at the bottom: title 24, subtext 14/20 #A09B8C, footer button min-width 125 (mb 25).
- Fades 400 ms `cubic-bezier(0,0,0,1)`. An intro video plays at 1.5 s for 1.5 s ease-in.

**Use:** the loader's exit (bars retract to 0) and the hero intro.

## 10. Loader (owner's "waiting for other players" idea)

Measured parts:

- **Client boot loader** [css]:
  - full-screen #010A13
  - a **504×504 dashed ring** turning every **60 s**
  - status text display 18/22 700 .05em caps #C8AA6E
  - progress frame 200×11, 1 px #C8AA6E, radius 6; fill 9 px `linear-gradient(90deg, #005A82 10%, #0A96AA 70%, #CDFAFA 125%)`, `scaleX` from the left
  - queue lines in body 12/16 #A09B8C with values in #C8AA6E; cancel button min-width 100, mt 32
  - [str]: "Loading", "Waiting in queue", "Current Position:", "Approximate wait time:", "Cancel"
- **Ready check** [css][str]:
  - 530×530 root; map art masked to 410 px; ring frame
  - title 30/32 .05em; details 12 px .1em
  - **ACCEPT!** 212×70 (label #A3C7C7 → #CDFAFA); **DECLINE** 120 px wide, 8 px below
  - buttons straddle the frame bottom (−11 px)
  - videos: `timer-countdown`, `timer-accepted-intro`, `timer-accepted-idle`, `timer-declined`, fading in 200 ms and out 300 ms [riot]
  - [str]: "MATCH FOUND", "Accept!", "DECLINE", "MATCH ACCEPTED", "MATCH DECLINED", "WAITING FOR OTHER PLAYERS", "PREPARE FOR BATTLE"

Composite ([ours]; the full ready-check spec is in the sibling report if one exists):

1. Show the loader only if loading takes more than 400 ms. Once shown, keep it at least 900 ms. Hard cap 3 s. Skip it on repeat visits in the session (sessionStorage, inside try/catch).
2. 0 ms: #010A13 with the 504 px dashed ring at 30% opacity. The frame ring fades and scales .96 → 1 over 200 ms.
3. "MATCH FOUND". At 300 ms ACCEPT! presses itself (pressed state 100 ms) and the ring switches to accepted-intro. **Never make the visitor click.**
4. "WAITING FOR OTHER PLAYERS": five pips, one per asset group (fonts, hero scene, textures, data, audio). Each turns teal as it resolves. The ring loops the accepted-idle glow (2 s).
5. Done: "MATCH ACCEPTED", fade out over 300 ms, then the §9.4 letterbox exit (bars to 0, 400 ms `cubic-bezier(0,0,0,1)`) reveals the hero core intro.
6. Reduced motion: static text, 200 ms fade. Use `role="status" aria-live="polite"` and no focus trap.
7. Lazy chunks after first paint (the three.js core, champ-select models): put the header PLAY into its *patching* state (§3.3) instead of blocking the page.

## 11. Final section list and order

| # | Section (anchor, tab label) | Client screen behind it | Main motion | Content needed |
|---|---|---|---|---|
| 0 | Loader | Ready check + boot ring + vignette | §10 | none |
| 1 | Header (fixed) | Client nav | §3 | counters |
| 2 | `#home` HOME | Approved B core + social identity chip + FIND MATCH-style CTA with wings | Core intro after vignette | status line |
| 3 | `#about` (Profile icon) | Profile overview | §8.3 | bio, 3 tokens, 4 emblems |
| 4 | `#projects` PROJECTS | Party lobby + collection grid | §5.2 | have |
| 5 | `#stack` STACK | Champion select (sibling report) | — | have |
| 6 | `#career` CAREER | Loading-screen cards (≤5) or match-history rows | §6 | **missing** |
| 7 | `#stats` (no tab) | Post-game progression + honor cards | §7.5 | numbers, testimonials (optional) |
| 8 | `#contact` CONTACT | Social panel + form in a dialog frame; PLAY → IN QUEUE → MATCH FOUND → toast | §4.3, §9 | have |
| 9 | Footer | Status bar: `line-soft` top border; 18 px icon row (window-control style); "Not affiliated with Riot Games" | none | — |

If content is thin, merge 7 into 3: Profile emblems can carry the stats. Every section sits in the dialog frame (§9.1) with the frame gradient anchored on the edge facing the previous section.

Mobile, section by section:

- banners: scroll-snap
- loading cards: 2 columns, 0.55 aspect
- honor cards: one column
- scoreboard rows: wrap to two lines (name over bars)
- social panel: full width

## 12. Riot assets we must redraw (never ship)

- **League crest:** the "L" logo and all its videos; the `lol_icon` boot logo.
- **PLAY button:** frame and plate images (default, hover, pressed, disabled, lobby) and every play/lobby/patcher video. → our SVG plate and swirl.
- **Nav:** pointer and highlight images; profile / collection / loot / store icon masks; RP and BE currency icons and their change videos; ticker buttons; window-control icons.
- **Social:** avatar ring sprites, the level ring, chat and bug-report sprites, poro art, the open-party and mobile glyphs, Riot ID styling assets.
- **Lobby:** banner (regalia) art and banner videos, the invited banner, crest rings, local highlight, gem/crystal intro (video and Lottie), footer wings, the add-player icon, the captain crown, **position (role) icons**, FIND MATCH sprites and videos.
- **Regalia:** ranked emblems, borders and mini-crests (Iron … Emerald … Challenger), prestige crests, the 21 level borders, themed level rings, the icon mask, the solid ring.
- **Profile:** hextech framing, level bar pieces, XP pill background, emblem background, mastery crests 1–10, marks and frames, challenge tokens, crystals and token backgrounds, honor emblems, crests and leaves.
- **Post-game:** ranked frame, orbs and radials, meter pieces, honor category icons (cool / heart / shotcaller), grade S/A/B/C art, end-of-game explosion and reward-outro videos, level-up explosions, the scoreboard star.
- **Modals and toasts:** sub-border strip art, close X, celebration rings (solid and dashed), linework, the button sprite, pip images.
- **In-game:** champion loading art (308×560), map and loading backgrounds, the boot dashed ring, spinners, ready-check frame, ACCEPT sprites, ready-check videos.
- **Fonts:** Beaufort and Spiegel (the client ships both as `--font-display` and `--font-body`).
- **Audio:** every .ogg (button hovers and clicks, missions, celebrations, music). **The repo's `public/sounds/inqueue.mp3`** (see TL;DR) should go too.
- **Policy:** Riot's fan-content terms ban its logos and trademarks, including as keywords or in domains [riot legal]. So keep "League of Legends" out of meta keywords and titles, and add "Not affiliated with or endorsed by Riot Games" in the footer. The generic shapes (arrow plate, diamonds, rings) are ours to draw.

## 13. Open questions

- What the nav pointer, sub-border strips, and frame / banner art look like: their shapes were never viewed (we would have had to download PNGs). The [ours] stand-ins are listed in each section.
- Where the toast layer sits; whether the header shows queue time; per-status colours in roster rows.
- Exact layout of today's in-game loading card (spell and rune placement, where the % sits).
- Whether the TFT tab still shows after the Oct 2026 standalone launch.
- Banner silhouettes vary by banner art; ours is a single V-tail.

## Sources

Client files (CommunityDragon raw mirror of the live client, read 2026-11-09):

- Version: https://raw.communitydragon.org/latest/content-metadata.json
- PLAY button CSS and JS: https://raw.communitydragon.org/latest/plugins/rcp-fe-ember-libs/global/default/rcp-fe-ember-libs.css · https://raw.communitydragon.org/latest/plugins/rcp-fe-ember-libs/global/default/rcp-fe-ember-libs.js
- Nav, wallet, ready check, boot loader: https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-navigation/global/default/rcp-fe-lol-navigation.css · asset list https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-navigation/global/default/ · https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-navigation/global/default/trans-loading-screen.json
- uikit (nav item, dialog frame, arrow overlay, comet border): https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-uikit/global/default/rcp-fe-lol-uikit.js
- Static images and videos (state names): https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ · https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/videos/
- Social: https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-social/global/default/rcp-fe-lol-social.css
- Lobby: https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-parties/global/default/rcp-fe-lol-parties.css · https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-parties/global/default/
- Regalia (banner, crest, profile): https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/rcp-fe-lol-shared-components.js
- Profile: https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-profiles/global/default/rcp-fe-lol-profiles.css · https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-profiles/global/default/trans.json
- Post-game: https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-postgame/global/default/rcp-fe-lol-postgame.css · https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-postgame/global/default/trans.json
- Toasts and celebrations: https://raw.communitydragon.org/latest/plugins/rcp-fe-common-libs/global/default/main.css
- Type scale and fonts: https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-typekit/global/default/main.css · https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-typekit/global/default/fonts/
- Strings: https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-l10n/global/default/trans.json · https://raw.communitydragon.org/latest/plugins/rcp-fe-ember-libs/global/default/trans-patcher-and-play-button.json

Web:

- Riot tech blog, video state machine (fades 200/300 ms, magic-button layers): https://www.riotgames.com/en/news/under-hood-league-client’s-hextech-ui
- Real client selectors (social panel 223 px, play button class): https://github.com/nomi-san/indie-theme
- WPF PLAY recreation (geometry cross-check): https://github.com/JamesnetGroup/riotplaybutton
- Loading screen: https://wiki.leagueoflegends.com/en-us/Loading_Screen · 308×560 art: https://wiki.leagueoflegends.com/en-us/Category:Ziggs_loading_screens
- Mastery: https://support.riotgames.com/en-us/league-of-legends/rewards/champion-mastery-guide · https://blog.masterychart.com/champion-mastery-rework
- Honor: https://support.riotgames.com/en-us/league-of-legends/rewards/league-of-legends-honor-guide · https://ensigame.com/news/lol/lol-players-will-be-able-to-honor-opponents-once-again
- Level borders: https://blog.loltheory.gg/level-borders-lol/
- Ranked borders: https://riftfeed.gg/lol-news/lol-ranked-borders-to-be-updated
- TFT standalone client: https://teamfighttactics.leagueoflegends.com/en-us/news/game-updates/faq-tft-unreal-migration · https://www.strafe.com/news/read/tft-gets-its-own-client-as-riot-addresses-ongoing-issues/
- New client: https://www.invenglobal.com/articles/23758/lol-dev-qa-new-client-to-be-unveiled-within-the-year
- Patch 26.11: https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-11-notes/
- 2026 dev update (loading screen climb indicator): https://www.leagueoflegends.com/news/dev/tldw-s1-2026-theme-gameplay-more-dev-update
- Fan content policy: https://www.riotgames.com/en/legal
- CustomEase cubic-bezier input: https://gsap.com/docs/v3/Eases/CustomEase/
- Versions: `npm view gsap` (3.15.1, 2026-11-04), `npm view @gsap/react` (2.1.2), `npm view three` (0.187.0, 2026-10-30)

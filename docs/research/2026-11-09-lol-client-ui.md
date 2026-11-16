# League client (Hextech) UI research

Date: 2026-11-09. Purpose: design reference for making the portfolio feel like the League client. We take the design language only. We do not ship Riot assets (splash arts, icons, logos, Beaufort/Spiegel fonts, client sprites or videos).

## Confidence

- Hex values, gradients and timings come from open-source recreations. The most faithful is react-hextech (MIT, 2019); its button layers look transcribed from the real client.
- The palette matches across four independent repos, but it is community consensus. Riot never published it.
- Screen layouts marked [obs] come from knowledge of the client, not a fetched source.

## Color tokens

| Token | Hex | Use |
|---|---|---|
| gold-100 | #F0E6D2 | Light text, hover highlight |
| gold-200 | #C8AA6E | Primary gold, top of gold gradients |
| gold-300 | #CDBE91 | Default button text |
| gold-400 | #C89B3C | Mid gold, focus |
| gold-500 | #785A28 | Borders, bottom of gold gradients |
| gold-600 | #463714 | Dark frame borders |
| gold-700 | #32281E | Deepest gold |
| blue-100 | #CDFAFA | Text on magic (blue) buttons |
| blue-200 | #0AC8B9 | Hextech teal glow |
| blue-300 | #0397AB | Teal |
| blue-400 | #005A82 | Deep blue |
| blue-500 | #0A323C | Dark teal fill |
| blue-600 | #091428 | Navy |
| blue-700 | #0A1428 | Navy background |
| grey-100 | #A09B8C | Body text |
| grey-150 | #5B5A56 | Disabled / pressed text |
| grey-200 | #3C3C41 | Disabled borders |
| grey-300 | #1E2328 | Button and control fill |
| grey-cool | #1E282D | Muted surface |
| hextech-black | #010A13 | App background, modals |

Extras: black #11161D, bg-dark #011223, translucent border rgba(155,125,35,.5). Reds (not Riot, from phh235/hextech-ui) for bans and defeat: #F59898, #C75A6D, #6D2D3D, #2E141E.

Gradients (all `to top`):

- gold: #785A28 → #C89B3C → #C8AA6E
- gold hover: #C89B3C → #C8AA6E → #F0E6D2
- gold press: #463714 → #463714 → #785A28
- hextech: #0AC8B9 → #005A82
- hextech hover: #CDFAFA → #0397AB
- hextech press: #0A323C → #005A82

Status dots (approximate): green online, red away, teal in queue / champ select / in game, grey offline or mobile.

## Typography

- Riot uses Beaufort for LOL (headers) and Spiegel (body). Licence for a public site is unclear: do not ship them.
- Free substitutes: headers Marcellus / Marcellus SC (closest to Beaufort) or Cinzel; body Barlow, Fira Sans or Source Sans 3.
- Headers: 700, uppercase, letter-spacing 0.05em (tabs 0.1em).
- Buttons: header font, 700, uppercase, letter-spacing 0.05em, padding 9px 21px, line-height 1.
- Body: about 12–14px, letter-spacing 0.01–0.025em.
- Scale (rem, apparently on a 12px root): h1 3.33, h2 2.33, h3 1.92, h4 1.5, h5 1.17, label 0.92, large number 4.75.

## Components

**Gold button** (secondary actions: navigation, dismiss, buy)

- Fill #1E2328, text #CDBE91, shadow `0 0 1px 1px #010A13, inset 0 0 1px 1px #010A13`, radius 0.
- Border 2px `linear-gradient(to top, #785B28 0%, #C89C3C 55%, #C8A355 71%, #C8AA6E 100%)`.
- Hover: text #F0E6D2; brighter border fades in (300ms linear); background `#1E232A 0%, #1E232A 40%, rgba(118,97,51,.8) 140%` fades in (400ms `cubic-bezier(0,0,.33,1)`); one-shot 600ms glow `0 0 5px 4px rgba(240,230,216,.5)`; text-shadow pulse `0 0 4px #F0E6D8`.
- Press: text #5C5B57 (100ms).
- Release: scale 0.94 → 1 (130ms); white 0→15% sheen sweeps top to bottom with -5° rotate (330ms); corner flares top-left and bottom-right (400ms, second delayed 30ms).
- Disabled: border and text #5C5B57.

**Blue "magic" button** (game actions only: PLAY, ACCEPT, LOCK IN, FIND MATCH; use sparingly)

- Text #CDFAFA, border `linear-gradient(to bottom, #0596AA, #005A82)`, fill #111.
- Hover fill tints to rgba(5,150,170,.15) / rgba(0,90,130,.15); animated texture behind it, opacity 0.3 → 0.6.

**Frame / panel**

- 2px border `linear-gradient(to top, #614A1F 0, #463714 5px, #463714 100%)`, background #010A13.
- Shadow `0 0 0 1px rgba(1,10,19,.48)` plus a 10px black halo.
- Ornament strip on top/bottom edges: pseudo-element bar 0.25rem tall, inset 12px each side, fill #010A13, 1px gold-600/500 border, pill radius.
- Modal buttons sit centred over the bottom border on a black backing.
- Chamfered corners: `clip-path: polygon()` on a gradient outer box plus an inset inner box.
- Gradient borders that need radius: `background: <fill> padding-box, <gradient> border-box` with a transparent border (lolmath technique).

**Inputs**: 1px #785A28 border, bg rgba(0,0,0,.7), text #A09B8C, padding 8–10px 21px. Focus: bg `linear-gradient(rgba(7,16,25,.7), rgba(32,39,44,.7))`, border #785A28 → #C8AA6E.

**Dropdown**: fill #11161D, 1px border `#695625 → #A9852D 23% → #B88D35 93% → #C8AA6E`; menu #010B13 with #463714 border, opens over 0.4s ease; options 40px tall, separated by 1px #1E2328; focused option #1E2328 fill, #F0E6D2 text.

**Tabs / top nav**: header font, uppercase, gold-300; hover/active gold-100; pressed gold-500. Underline 1px `linear-gradient(to right, transparent, #C8AA6E, transparent)`, slides in over 200ms.

**Checkbox**: square, border #463714; check glyph dark gold, #F0E6D2 on hover.

**Slider**: track 2px #1E2328; fill 3px #463714 → #695625 (hover #785A28 → #C89B3C → #C8AA6E); diamond handle about 30px.

**Tooltip**: 2px gold-press gradient border, fill #1E2328, shadow `0 2px 4px #1E2328`, two-layer arrow (gold-600 outside, grey-300 inside). 150ms in, after 150ms delay.

**Other** [obs]: round profile icon with gold ring and a level pill at the bottom, XP as a thin arc; currency counters in gold-100 numerals (draw our own glyphs); toasts as #010A13 panels with thin gold border sliding in from the right; scrollbar about 6px, thumb #785A28 on #1E2328.

## Screens [obs; client window 1280×720]

- **Shell**: top bar about 80px. PLAY button top-left, then HOME / TFT / CLASH. Right: icon tabs (profile, collection, loot), store, currency, settings. Social panel on the right, about 225px: own icon, level ring, name, status; collapsible groups like "GENERAL (3/40)" with rows of icon, name, status ("In Game – 12m"); chat windows dock at the bottom.
- **Home**: large hero banner carousel plus a column of news tiles over an ambient video background.
- **Lobby**: up to 5 tall player banners (icon, name, rank crest, role icons). Blue FIND MATCH bottom-centre.
- **Match Found**: centred dialog, client dimmed; circular depleting ring timer (about 10–12s); big blue ACCEPT!, small Decline text below.
- **Champion select**: top phase title and draining timer bar; ally cards left, enemy right; centre square portrait grid with search and role filters; bottom runes, spells, skin carousel, blue LOCK IN. Ban phase tints red.
- **Loading screen**: two rows of 5 tall portrait cards (about 1:1.8) over a dark background.
- **Post-game**: VICTORY / DEFEAT header; tabs Scoreboard / Overview / Graphs; blue and red team blocks.
- **Profile**: big background art, centred icon with level ring, rank crest, tabs Overview / Match History / Ranked.
- **Collection**: sub-tab strip over a filterable grid.
- **Store**: featured carousel then a priced tile grid.
- **Settings**: full-screen modal, category list left, form panels right.

## Motion and sound

- Riot uses WebM video for magic effects, switched by a state machine (fade in 200ms, out 300ms). We use three.js / canvas particles or our own loops instead.
- Timings: hover glow 600ms `cubic-bezier(0,0,.33,1)`; border fade 300ms; background fade 400ms; click scale 130ms; sheen 330ms; flare 400ms; menus 400ms ease; tabs 200–400ms.
- Soft easing lets things settle; sharp easing snaps for attention.
- Audio: hover is a soft metallic tick, click a heavier chime, queue pop a loud bell. Use our own clips, muted by default.

## References

- https://github.com/s-coimbra21/react-hextech (MIT; button layers, frame ornaments; do not reuse its PNGs)
- https://github.com/lolmath/lolmath/tree/main/packages/ui (ISC; padding-box/border-box gradient borders, Tailwind theme) and https://lolmath-docs.pages.dev/ui
- https://github.com/phh235/hextech-ui (MIT; shadcn / Base UI port, Cinzel + Barlow, `packages/themes/src/hextech.css`)
- https://github.com/zaferayan/lol-hextech-ui (no licence, bundles Riot fonts: palette reference only)
- https://github.com/OchreFox/league-builds-gui (same palette in tailwind.config.js)
- https://www.riotgames.com/en/news/under-hood-league-client’s-hextech-ui
- https://github.com/doughknee/queuePop (Cinzel / Marcellus substitution)

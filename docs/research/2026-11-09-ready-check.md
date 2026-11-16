# Ready check ("Match Found"): choreography research and recreation storyboard

Date: 2026-11-09. Companion to `2026-11-09-lol-client-ui.md`. That file already covers the palette, gold and magic buttons, frames, fonts and general timings, so none of it is repeated here. Scope: queue, ready check, accept, waiting, decline or everyone ready, the hand-off to champion select, then our storyboards for (a) the site loader and (b) the contact-form submit. Riot files are named below only to explain structure. None of them ships.

Tags: **[code]** read in Riot client code (CommunityDragon extracts). **[gif]** measured frame by frame. **[str]** client localisation string. **[shot]** screenshot observation. **[inf]** inference. **UNVERIFIED** means no source found.

---

## 0. Corrections to the brief (read first)

1. **The ring shows no numbers.** Neither client version has a numeric countdown in its templates, and the 2018 capture shows none [code][gif]. The mockup's "8" is our own idea.
2. **The button never says "ACCEPTED!"** ACCEPT! keeps its label and greys out (text #5C5B57, fill #1F2429). The status text changes instead: "MATCH ACCEPTED" over "WAITING FOR OTHER PLAYERS" [code][gif][str].
3. **The real client shows no per-player indicators.** No pips, count or portraits appear in 2017–2026. The waiting state is a full, steady ring plus text [code][gif]. Anything we add for progress is our own invention.
4. **The ring stops counting down after you accept.** It refills (it fades in, it does not sweep) to a full idle ring [gif].
5. **The queue timer is not in the top-left PLAY area.** In 2020 and 2024 screenshots it is a card at the top of the right-hand social column, under the profile block: "FINDING MATCH", m:ss, "Estimated: m:ss" and an X. The lobby footer shows a disabled "In Queue" pill with a round X [shot][str].
6. **The window is 12 s** (LoL Wiki). The per-map ready-check SFX files are 12–13 s. The ring is a video whose playback rate is synced to the server `timer`, so it empties exactly when the server window closes [code]. Community tools disagree: some assume 10 s, others 12 s.
7. **Compliance issue in the repo.** `public/sounds/inqueue.mp3` is 1,160,402 B. Its ID3 title is "InQueue", it was encoded by ffmpeg `Lavf59.27.100` from a DASH source, its creation_time is 2024-10-09, and `src/hooks/SoundPlayer.tsx` plays it. It looks like a rip of League's in-queue music, which breaks the "no Riot music/SFX" rule. Replace or remove it [inf from metadata].

---

## 1. Method and confidence

- **Code.** Riot client plugins as extracted by CommunityDragon (CDragon): the 7.1 `rcp-fe-lol-ready-check` (`1.bundle.js`, the full 2017 version with CSS keyframes inline), the 10.1 JS and CSS, and the 2026 `rcp-fe-lol-navigation.css` plus l10n `trans.json`. I read them through a summarising fetcher and re-checked every number with separate targeted queries (for example, the `scale(-1)` below was confirmed verbatim).
- **Frame analysis.** LoL Wiki `Ready_Check_UI.gif`: 585×547 px, 196 frames, 8.53 s, frames of 40/50 ms (about 23 fps), uploaded 2018-09-15. I decoded it in the browser (ImageDecoder) and measured ring angle, brightness and RGB per frame. It is about 1:1 with a 1280×720 client: ring radius ≈201 px against a 410 px CSS disc. Timing resolution is ±45 ms. Colours are GIF-palette quantised (±~8 per channel).
- **Concept GIF.** `Match_Found_UI_Animation_Concept.gif`: 600×200 px, 30 frames × 30 ms, 0.9 s. It compares three easing studies labelled "EASE-OUT", "CUSHIONED" and "MAGNETIC".
- **API shapes.** Generated LCU types from stirante/lol-client-java-api and LeagueAkari, plus Snooze-CSS's 2026 notes on the ready-check service.
- **Screens.** Bing thumbnails of Reddit and press screenshots (Reddit hosts are blocked from the browser pane), a Surrender@20 2013 screenshot and a GameRevolution login-queue screenshot.
- **Not used.** YouTube: frame-accurate GIF and code data beat video descriptions. leagueoflegends.fandom.com returned HTTP 402. The Riot Nexus article "The visual language of hextech" now redirects to the homepage.

---

## 2. State machine and data

**LCU `GET /lol-matchmaking/v1/ready-check`** [code: generated types]

| field | values |
|---|---|
| `state` | `Invalid` · `InProgress` · `EveryoneReady` · `StrangerNotReady` · `PartyNotReady` · `Error` |
| `playerResponse` | `None` · `Accepted` · `Declined` |
| `timer` | float, seconds **elapsed** (counts up) |
| `declinerIds` | summoner ids |
| `dodgeWarning` | `None` · `Warning` · `Penalty` (the 2026 UI also handles `ConnectionWarning`, per Snooze-CSS) |
| `suppressUx` | bool. `true` means no modal |

**`/lol-matchmaking/v1/search`:**

- `searchState`: `Invalid` · `AbandonedLowPriorityQueue` · `Canceled` · `Searching` · `Found` · `Error` · `ServiceError` · `ServiceShutdown`.
- `timeInQueue` and `estimatedQueueTime` are in seconds.
- Other fields: `isCurrentlyInQueue`, `lowPriorityData`, `dodgeData`, `readyCheck`.

**UI machine from 10.1 on (`uikit-state-machine`)** [code]

- Main states: `hidden → intro → in-progress → accepted | declined → success-outro | failure-outro → hidden`.
- Ring sub-machine: `timer-hidden → countdown → accepted-intro → (ended) accepted-idle (loop) | declined`.

**2017 machine** [code]

- Flow: `intro`. The `ready-check-start` video ends, then `countdown`. Then `accept` or `decline`, then `game-ready` (if `EveryoneReady`) or `game-declined`. Then the `ready-check-end` outro, which signals 0.6 s before its end, and the modal is removed.
- When shown, the client:
  - exits fullscreen (`webkitExitFullscreen`);
  - locks the viewport;
  - pushes the modal into the uikit modal manager.
- The wiki adds that the client window restores itself.

**Gameflow** [code, 7.1 nav]

- Phases run `Matchmaking → ReadyCheck → ChampSelect`.
- The navigation bar is hidden during `ChampSelect`, `GameStart`, `InProgress` and `EndOfGame`.

---

## 3. The queue before the pop

- **Lobby footer.** FIND MATCH is a magic button. Its video layer is offset −21/−27 px so the VFX bleed outside the button. Pressed text is #005A82; disabled text is grey. While searching, it becomes a disabled "In Queue" pill with a round X (Cancel) to its left [code: parties CSS][str][shot].
- **Queue card** at the top of the social column, under the profile [shot]. Colours are sampled from screenshots (approximate):
  - Header "FINDING MATCH" in serif caps, grey-blue ≈#9EA4A4.
  - Gold X at top right, ≈#BCA57B.
  - Mode icon on the left, about 28–32 px, gold frame with teal fill.
  - Elapsed time large, ≈#F2E7D1, minutes not zero-padded (seen: 7:52, 10:30, 30:00, 40:32).
  - "Estimated: m:ss" small, teal ≈#2CC0DE.
  - Background ≈ vertical #10223A → #1C587A, brighter toward the right edge (≈#1B628E), with a 1 px bottom line ≈#596A71.
  - The movement probably comes from `party-status-bg-loop.webm` (145 KiB, parties plugin) [inf from the asset name].
- **Strings** [str]: "Finding Match", "Estimated:", "In Queue", "Cancel", "Find Match", "Find Match {{playersReady}}/{{totalPlayers}}".
- **Audio.** A map-specific in-queue music loop plays (`music-inqueue-loop-summonersrift.ogg`, 1.4 MiB) [code: asset listing].
- **Another native "waiting" screen, the login queue** [shot][code]:
  - Layout: a thin gold circle with a band of fine radial tick marks, and 1 px hairlines running from the circle to the panel edges.
  - Centre: the crest, then "WAITING IN QUEUE", then two label/value rows and a CANCEL button.
  - CSS: rows 12/16 body #A09B8C, values #C8AA6E; CANCEL has margin-top 32 px and min-width 100 px.
  - It is a second legitimate reference for a League-style loader.

---

## 4. The pop: layer stack and geometry

**Layer order from 10.1 on, bottom to top** [code]:

1. map background (img, circular mask, 410×410, centred at `calc(50% − 205px)`);
2. frame (static PNG, full size);
3. timer ring (video state machine, `top: 2px`);
4. map icon (92×92);
5. status text (300×80);
6. buttons (container 300 wide at `bottom: −11px`): ACCEPT 212×70, then DECLINE 120 wide with margin-top 8.

**Sizes.** Root is 530×530 from 2019 on. In 2017 the component was 558×565 and the frame 552×554.

**Type** [code]:

- Title: 30/32, display font 700, letter-spacing .05em, uppercase, #F0E6D2. ja-JP uses 24/28.
- Details: 12/16, .1em, #A09B8C, margin-top 5 px. Mixed case with bullet separators, for example "Summoner's Rift • Ranked • 5v5" built from map + `ready_check_queue_type_*` + "{{myTeamCount}}v{{theirTeamCount}}". ja-JP uses 13 px.

**Measured geometry** [gif, about 1:1]. Origin is the ring centre, +y points down.

| element | measurement |
|---|---|
| outer hairline | r≈252, ≈#605B38 |
| outer rim | r≈209.5, ≈#8D8355 |
| inner rim | r≈195, 3–4 px, #BD9B4F → #726135 |
| ring band | r≈196–208 |
| disc | r≲194; darkened, desaturated map art #18282E–#2E373D |
| icon centre | −49 |
| title centre | +36 (cap height ≈19) |
| details centre | +69 |
| ACCEPT plate centre | ≈+179; body 212 wide, sits on a ≈260 px gold rail at ≈+165 |
| DECLINE box | ≈115×19, centre ≈+240 |

**Arc geometry.** The lit arc spans **291°**. A **69° gap centred on 6 o'clock** is hidden behind the plate. Measured clockwise from 12, the arc runs from **214.5° to 145.5°**.

**Backdrop.** Pixels outside the dialog sample #010304–#111A1A, so the client is dimmed to near-black. Exact alpha UNVERIFIED (≥80 % [inf]). No blur is detectable.

**Per-mode art** [code: game-data listing]:

- The map art comes from the mode's `ready-check-background.png` (Classic SR: 145.9 KiB; the wiki's TFT one is 410×410).
- When declined, the map art gets `filter: grayscale(100%)`.
- The icon is the mode's `game-select-icon-*`. On accept, the 2017 static mode swapped it to `*-icon-fill.png`, the teal-filled icon.

---

## 5. Entry choreography

**Current behaviour (7.6 → 2026)** [code][gif]

| t (ms) | what happens |
|---|---|
| 0 | modal added; intro SFX `sfx-readycheck-lowspec-intro.ogg`; exits fullscreen |
| 0 | dialog visible at full opacity. 2017 static numbers: **scale 1.1→1, 280 ms, cubic-bezier(.2,.9,0,1), opacity stays 1** (a pop, not a fade). No entry animation is defined in 10.1+ CSS (UNVERIFIED) |
| ~180–430 | **ring ignites**: brightness rises uniformly around all 291° at once (no sweep). Core reaches #54D6EF, rims #6FE6F4/#76DDDD, halo #193A47 [gif] |
| 430–830 | ring holds full |
| ~830 → end | **ring drains clockwise**, eating from the 7:30 end (214.5°) toward 4:30 (145.5°). Leading edge is a white-cyan spark #C2FCFC about 4° wide, then #4DF9F9, with a ~4° dim tail; head luminance ≈1.2× the body. Body during the drain #29B0DA–#2BC3E7 [gif] |
| in-progress | `sfx-readycheck-ringmagic-countdown.ogg` and the per-map bed (`sfx-readycheck-sr-portal.ogg`, ~13 s) start [code] |

**2017 designed text motion** [code]. In the 2018 capture, text swaps instantly instead.

- **Title "MATCH FOUND"** (`introTitleAnimation`):
  - 233 ms, `cubic-bezier(1,0,1,1)`, forwards.
  - Transform runs from scale 1.35 + translateY 20 to scale 1 + translateY 0.
  - Blur: 0 at 0 %, 1.4 px at 20 %, .7 px at 80 %, 0 at 100 %.
  - Text-shadow `-2px -2px 24px #F0E6D2` fades to transparent.
  - Then a pulse: 1500 ms, linear, infinite. Text-shadow `0 1px 12px` goes from rgba(240,230,210,0) to #F0E6D2 at 50 %.
- **Details** (`introDetailsAnimation`):
  - 466 ms, same curve.
  - Holds at 1.35/20 until 35 %, blurs .5 → 1 px.
  - Glow uses rgba(160,155,140,.6).

**Concept study** [gif concept]

- At 30 ms, giant blurred frame corners appear (≈2.5×).
- From 60 to 300 ms the icon shrinks to size, filled overexposed white-cyan.
- "MATCH FOUND!" appears blurred at about 180–240 ms and is sharp by about 330–390 ms.
- The icon fill cools from teal to empty by about 540–600 ms; everything is settled by 600 ms.
- The shipped curve `cubic-bezier(1,0,1,1)` is the **"MAGNETIC"** option: hold, then snap.

**2017 full version, patches 7.1–7.5** [code]. Video layers, each with fade-in/fade-out in ms:

| layer | videos |
|---|---|
| map background | countdown intro; accept intro/idle |
| frame | `frame-countdown-intro` (260 KiB, fade-out 100); `frame-accept-intro` (0/50); `frame-decline-outro` |
| timer | `countdown-intro` (200/200); `accept-intro` (200/300); `accept-idle` (200/300); `decline-intro` |
| map icon | 100/200 |
| intro/outro overlays | `ready-check-start` (100/100); `ready-check-end` (`signal-before-end="0.6"`) |
| ACCEPT button | intro, hover-in, looping magic hover idle, hover-out, release, outro |

- It had per-map frames for SR, Howling Abyss, Twisted Treeline, Ascension, Poro King and Siege.
- It had per-map "portal" SFX (`sfx-readycheck-{sr,tt,cs}-portal.ogg`).

---

## 6. Ring timer

- **Duration.** The server window is 12 s (wiki). The `timer` field counts up in seconds.
- **Sync** [code]: `playbackRate = (video.duration − video.currentTime) / (video.duration − serverTimer)`, falling back to 1.
  - The video plays faster when the modal appears late, so the ring always ends with the server window.
  - In the 2018 capture the drain ran at ≈**33°/s**: 291° in ≈8.8 s, and ≈9.6 s from modal visible to empty. That fits a late-shown modal sped up [gif][inf].
- **Direction.** Clockwise. The bottom-left end is eaten first; the remaining arc shrinks toward the bottom-right end beside the plate.
- **No numbers.** The title pulse (2017) is the only other urgency cue.

---

## 7. ACCEPT and DECLINE

**ACCEPT!** [code][gif]

- Plate 212×70, padding-top 20; text 18/22, 700, .05em, uppercase.
- Text colour: **#A3C7C7**, hover **#CDFAFA**, disabled **#5C5B57**.
- Background images for default, hover and disabled.
- 2017 transitions: color 200 ms, background 300 ms, disabled 400 ms.
- Measured fills: default #282A23, hover #2A535E, flash #52B1BB, disabled #1F2429.
- SFX on hover and click. 2017 added the hover-in, magic idle loop, hover-out and release videos.

**DECLINE** [code]

- `lol-uikit-flat-button`, 120 wide, margin-top 8, opacity transition 100 ms.
- Click SFX `sfx-readycheck-decline-button-click.ogg`; disabled once you have responded.
- Label "DECLINE".

---

## 8. On accept, measured (2018 capture, t = 0 at the click) [gif]

| t (ms) | what happens |
|---|---|
| +0 | map icon swaps to teal fill instantly: inside #106780/#116476, frame #CAC198 (was #0A1528 / #B9AC89) |
| +0 → 100 | DECLINE fades out (matches the 100 ms CSS) |
| +0 → 180 | ring: the drained part **fades in uniformly** back to the full 291°; the countdown head disappears |
| +130 → 300 | plate flash peaks at #52B1BB; ring flash peaks with core **#84FEFA–#9CF8EA** and halo #316C79 |
| +180 | title becomes **"MATCH ACCEPTED"**, details become **"WAITING FOR OTHER PLAYERS"**. In 2018 this is an instant swap |
| +650 | plate settles into disabled (#1F2429 fill, #5C5B57 text) |
| +1,300 | ring settles into accepted-idle |

**2017 designed swap** (`change-animation`) [code]:

- **Title:** 200 ms `cubic-bezier(1,0,1,1)` from scale 1.35 + y 20; at 5 % it reaches blur 1.4, opacity .75 and glow `-2px -2px 24px #F0E6D2`; it ends at scale .98, blur 0, opacity 1.
- Then .98 → 1 over 100 ms linear, starting at +300 ms.
- In parallel, a glow `1px 1px 24px rgba(240,230,210,.8)` fades to 0 over 400 ms linear, starting at +200 ms.
- **Details:** the same with +100 ms offsets: swap at +100, scale-up at +400, glow at +300.

**Sound and video** [code]

- The click SFX plays.
- `sfx-readycheck-ringmagic-accepted-loop.ogg` starts when the accepted-intro video starts; the countdown loop fades out.
- The ring video goes `timer-accepted-intro` (566 KiB), then on `ended` to `timer-accepted-idle` (1.5 MiB, loop).
- Riot's 2017 dev blog describes this as a quick "intro" video plus a looping "idle" video while waiting; both fade in over 200 ms and out over 300 ms.

---

## 9. Waiting for other players

- **What it looks like.** A full, steady ring: mean brightness varies ±2 % over 2.3 s of capture. It has a **"hollow tube" look**: bright rims (#76DDDD outer, #16CCCF inner) around a darker core (#106780–#167991), halo #152B35. The icon is teal-filled, the plate is disabled, DECLINE is gone, and the text reads MATCH ACCEPTED / WAITING FOR OTHER PLAYERS [gif].
- **What it does not show.** No count, pips, portraits or fill order; the template renders only the status text [code].
- **Legacy AIR client.** Per-player indicators UNVERIFIED (no source found). The 2013 legacy dialog style is confirmed only for the dodge-warning modal.

---

## 10. Declines

| case | state | what follows [str] |
|---|---|---|
| a stranger declines or times out | `StrangerNotReady` | failure-outro, then "A player has declined ready check. You have been returned to the queue."; search resumes |
| a party member declines | `PartyNotReady` | "{{summonerName}} has declined ready check. You have been returned to the lobby." |
| you decline or time out | `playerResponse: Declined` | "MATCH DECLINED", then "You have declined ready check and have been returned to the lobby." |
| repeated declines | `dodgeWarning: Warning` | "You have declined too many games in a row. Be sure that you're ready to play before you enter the queue or you may face a penalty." |
| further declines | `dodgeWarning: Penalty` | "…temporarily unable to join queues." plus a "Queue Lockout Timer" (`{{minutes}}:{{seconds}}`; H, D and W variants) |

**Decline motion** [code]

- **Title:** fades out over 200 ms `cubic-bezier(1,0,1,1)` to scale .65, translateY −31, opacity 0.
- **Map background:** goes `grayscale(100%)`.
- **ACCEPT container `.hide`:**
  - A mask is applied after 50 ms: `radial-gradient(circle, transparent 0 222px, #000 222px)`, size 444×460, position `50% calc(100% − 8px)`.
  - The plate then runs `acceptButtonHide` for 200 ms: translateY 6 + scaleY .85, then −12/−16/−20 with `scale(-1)`, opacity 1 → 0 over the last 25 %.
  - Net effect: the plate slides up into the ring's masked circle and vanishes.
- **Other layers:** `timer-declined.webm` (352 KiB) plays; 2017 also played `frame-decline-outro` and showed a cracked map icon (232×178).
- **Sound:** `sfx-readycheck-outro-declined.ogg`.
- **Exit:** the modal hides (2017 static: scale → .85 and opacity → 0 over 200 ms `cubic-bezier(1,0,1,1)`).

**Open questions:** the declined ring colour (UNVERIFIED), and whether time-in-queue resets after a stranger declines (UNVERIFIED).

---

## 11. Everyone ready, then champion select

**Outro** [code]

- Title zooms out: 250 ms `cubic-bezier(1,0,1,1)` after a 240 ms delay, to scale 1.2, translateY 16, blur 2 px, opacity 0, glow #F0E6D2 24 px.
- 2017 also played the ACCEPT outro video and the `ready-check-end` outro. Removal is signalled 0.6 s before that outro ends.
- Loops fade over 100 ms and `sfx-readycheck-lowspec-outro-accepted.ogg` plays (2017 full version: `-outro-accepted.ogg`). The modal is removed.

**Champion select entry** [code: assets; order inferred]

- Gameflow moves to ChampSelect; the top nav and social column disappear.
- Draft modes open on position assignment: `map-north-intro.webm` or `map-south-intro.webm` (≈400 KiB, by side), `music-cs-draft-posassign-01`, and **five sequential ally reveal cues** `sfx-cs-draft-posassign-ally-0…4` plus `-player`.
- Time from EveryoneReady to champ select on screen: UNVERIFIED (≈1–3 s [inf]).

---

## 12. Audio map (for timing only; nothing here ships)

| moment | client file |
|---|---|
| match found | `sfx-readycheck-lowspec-intro` (87.7 KiB); 2017 full version: `sfx-readycheck-intro` |
| countdown bed | `sfx-readycheck-ringmagic-countdown` (176.4 KiB) + per-map `sfx-readycheck-{sr}-portal` (~13 s) |
| accept hover / click | `sfx-readycheck-accept-button-hover` / `-click` |
| accepted loop | `sfx-readycheck-ringmagic-accepted-loop` (99 KiB) |
| everyone ready | `sfx-readycheck-lowspec-outro-accepted` (90 KiB) |
| declined | `sfx-readycheck-outro-declined` (34.6 KiB) |
| decline click | `sfx-readycheck-decline-button-click` |
| in queue | `music-inqueue-loop-summonersrift` |

---

## 13. Version history [code: CDragon snapshots]

| era | ready check |
|---|---|
| Legacy AIR client, 2013 | The dodge-warning modal was added on PBE in July 2013; today's warning text is word-for-word the same. The legacy dialog visuals are UNVERIFIED. |
| 7.1–7.5 (Jan–Mar 2017), 55–59 files | Fully video-driven, with per-map frames, icons, portal SFX, intro/outro overlays and accept-button magic videos. A static fallback (`ReadyCheckModalStatic`, shown when `uxAllAnimationsEnabled` is off) used Web Animations: show 280 ms, hide 200 ms. |
| 7.6 (Mar 2017) to 9.x, 22–23 files | One static frame PNG and static accept PNGs (default, hover, disabled). The ring stays a video: `timer-countdown` 2.6 MiB, `timer-accepted-intro` 566 KiB, `timer-accepted-idle` 1.5 MiB, `timer-declined` 352 KiB. "Lowspec" SFX. |
| ≤10.1 (Jan 2020) | Rewritten on `uikit-state-machine` with the `ready-check-low-spec-mode="true"` flag; root 530×530. |
| ≤10.25 (Dec 2020) to 2026 | Merged into `rcp-fe-lol-navigation`. The four ring videos are byte-size-identical in the 2026-01 build, so the visuals have not changed [inf]. Mode strings added: Arena "Multi-Team", `STRAWBERRY` (Swarm [inf]) title override "Threat Detected", Swiftplay, "ARAM: Mayhem", Brawl "Experimental"; plus the connection-warning toast. The wiki says the 2025 client redesign changed home and navigation, and that League Next will replace the LCU in 2027. |

---

## 14. Our recreation: spec

**Design box.** 540×540 SVG, ring centre (270, 262). Scale it with a container: `width: min(540px, 100vw − 32px); aspect-ratio: 1; container-type: inline-size`. Set text in `cqi` units: title `clamp(20px, 5.56cqi, 30px)`.

**Layer stack, bottom to top** (this mirrors the client):

1. backdrop;
2. disc;
3. frame;
4. ring (track, halo strokes, core, rims, head);
5. icon;
6. status text;
7. plate and close button;
8. particle canvas (2D, additive);
9. vignette.

**Geometry**

| element | value |
|---|---|
| disc | r 193, `radial-gradient(circle at 50% 40%, #0B2230, #091428 45%, #010A13)` plus our own hex lattice at 5 % (no map art) |
| inner rim | r 195, 3 px, #BD9B4F → #726135 |
| ring band | r 201.5, 11 px |
| outer rim | r 209.5, 1.5 px, #8D8355 |
| outer hairline | r 252, 1.5 px, #605B38 at 60 % |
| arc | 291°, from 214.5° to 145.5° clockwise from 12 |
| C | 2π·201.5 = **1266.1 px** |
| 1° | 3.517 px |
| icon | centre −49, 72 px (ours; the client's is 92) |
| title | centre +36 |
| details | centre +69 |
| plate | centre +179, 212×70 with chamfered ends, hung from a 260 px rail at +165 |
| close button | centre +240, 120×20 |

**Colour tokens** (all measured, see §5–§9)

```css
:root{
  --rc-core:#54D6EF; --rc-core-drain:#2BC3E7; --rc-rim:#6FE6F4; --rc-head:#C2FCFC; --rc-head-falloff:#4DF9F9;
  --rc-flash:#84FEFA; --rc-idle-core:#106780; --rc-idle-rim:#76DDDD; --rc-halo:rgba(10,200,185,.22);
  --rc-track:rgba(70,55,20,.55); --rc-gold-in:#BD9B4F; --rc-gold-out:#8D8355; --rc-gold-hair:#605B38;
  --rc-plate:#282A23; --rc-plate-hover:#2A535E; --rc-plate-flash:#52B1BB; --rc-plate-off:#1F2429;
  --rc-text-accept:#A3C7C7; --rc-text-accept-hover:#CDFAFA; --rc-text-off:#5C5B57;
  --rc-backdrop:rgba(1,10,19,.82);
}
```

**Easing tokens**

- `rc-slam` = `CustomEase.create("rc-slam", ".2,.9,0,1")` (client dialog show).
- `rc-mag` = `CustomEase.create("rc-mag", "1,0,1,1")` (client text and hide).
- Glow fades use `none`; ignitions use `power2.out`.

**Halo without filters.** Use three stacked strokes on the same dash: 26 px at .08, 18 px at .14, and the 11 px core. Animating `filter: blur()` on a 540 px SVG every frame is the main avoidable cost.

**Head spark.** A `<g>` rotated about the centre, transform only. It holds a 4 px white core, a 10 px #C2FCFC circle at .8, a 22 px rgba(10,200,185,.35) circle, and tail dots at −2°, −4° and −6° with opacity .6, .35 and .15.

**Particles.** Canvas 2D, DPR ≤ 2, `globalCompositeOperation='lighter'`, at most 60 live particles, ≤ .5 ms per frame.

| moment | emission |
|---|---|
| drain | from the head, every 50 ms; life 400–700 ms; 1–2.5 px; #CDFAFA → #0AC8B9 → transparent |
| accept | 24 sparks from the circumference, flying 60–120 px outward over 500 ms (`power2.out`) |

---

## 15. Storyboard A: site loader ("waiting for other players")

**Concept.** The visitor has just accepted. The ring is split into **5 segments**, one per "player". Segment 1 is "you" (always immediate). Segments 2–5 are real load milestones:

1. fonts: `document.fonts.ready`;
2. hero core: R3F `<Canvas onCreated>`, then `gl.compile(scene, camera)` and the first frame;
3. textures: drei `useProgress` reports `!active && progress === 100`;
4. page: `load` event.

Each milestone has a 6 s timeout. A timed-out milestone shows a grey segment and the site continues.

When all 5 are full, the ring is whole. That is the client's accepted-idle ring, read as "everyone ready". The segments are our own invention (see §9); the text and motion are the client's.

**Segment geometry.** Each segment is 56.6°, with 2° notches; 5 × 56.6 + 4 × 2 = 291. Segment k starts at 214.5 + 58.6k (clock degrees). Notch studs (6 px diamonds) sit at 272.1°, 330.7°, 29.3° and 87.9°. Segments fill clockwise and in count order, whichever milestone resolved.

**A0, before JS.** The overlay markup and keyframes are inlined in `index.html` so the loader paints before the bundle arrives.

- The overlay is solid #010A13 with a radial vignette.
- Failsafe 1: `@keyframes rc-failsafe` hides the overlay at 10 s unless JS removes that class.
- Failsafe 2: a `<noscript>` rule hides it entirely.

**A1, entry.** t is in ms from first paint.

| t | element | from → to | dur | ease | basis |
|---|---|---|---|---|---|
| 0 | dialog | scale 1.1 → 1 (opacity 0 → 1 over the first 80) | 280 | rc-slam | client static show |
| 0 | gold rims | dash-draw from 12 o'clock both ways, outer → inner, 40 stagger | 360 | power2.out | ours; echoes the 2017 `frame-countdown-intro` |
| 0 | icon | scale 2.4 → 1; fill #CDFAFA → #0AC8B9 | 300 | rc-mag | concept "MAGNETIC" |
| 0 | title "MATCH ACCEPTED" | 2017 change animation (§8) | 200 + 100 @300; glow 400 @200 | rc-mag / none | client |
| 100 | details "WAITING FOR OTHER PLAYERS" | change animation, +100 offsets | 200 | rc-mag | client |
| 0 | plate | fill #52B1BB → #1F2429; text #A3C7C7 → #5C5B57 | 130 up, 520 down | power2.out | measured accept flash |
| 180 | ring track | opacity 0 → 1 | 250 | power2.out | measured ignition window |
| 300 | segment 1 ("you") | sweep 0 → 56.6°, head spark rides the edge, completion flash core → #9CF8EA (120) → #54D6EF (400) | 280 | power2.out | ours |
| 233 → | title | pulse: text-shadow 0 1 12 rgba(240,230,210,0 ↔ 1), 1500, ∞ | 1500 | none | client 2017 |
| 700 → | halo | breathe .16 ↔ .26, yoyo, ∞ | 1500 | sine.inOut | ours (idle loop) |

**A2, waiting.** One step per milestone. Fills are at least **180 ms apart**, queued.

| on milestone | element | motion | dur | ease |
|---|---|---|---|---|
| fill k | segment k | sweep + head spark + completion flash, as in A1 | 280 | power2.out |
| +280 | stud k | scale 1.8 → 1; #FFF → #0AC8B9; glow 0 → 10 → 6 px | 240 | expo.out |
| +280 | ripple at stud | scale 1 → 2.2, opacity .8 → 0 | 360 | power1.out |
| — | live region | "k of 5 ready" | — | — |
| 8000 | details | → "STILL WAITING · SLOW CONNECTION" (crossfade) | 200 | none |
| 12000 | gold "ENTER ANYWAY" button | fades in | 200 | power1.out |
| milestone timed out | segment | grey #3C3C41 fill; horizontal shake (x 0, −6, 6, −4, 4, 0) | 250 | none |

The shake copies the client's `shake-horizontal .25s` on "player not found".

**A3, everyone ready.** R = max(all milestones, min 1,600 ms first visit / 500 ms returning visit), plus the fill queue draining.

| t | element | from → to | dur | ease |
|---|---|---|---|---|
| R | studs and notches | studs fade, gaps fill, so the ring becomes continuous | 120 | power1.out |
| R | ring | core → #CDFAFA, stroke 11 → 15, halo → .5 | 160 | power2.out |
| R+240 | title + details | scale 1.2, y +16, blur 2 px, opacity 0 (client zoom-out) | 250 | rc-mag |
| R+160 | ring group | "portal burst": scale 1 → 1.18 (expo.in) and opacity → 0 (power1.in), plus a FLIP translate to the hero core's screen position | 520 | expo.in / power1.in |
| R+300 | icon, plate, frame | scale .85, opacity 0 (client hide) | 200 | rc-mag |
| R+350 | overlay | opacity 1 → 0 | 500 | power1.inOut |

**A4, site reveal** (our analogue of the champ-select hand-off).

| t | element | motion | dur | ease |
|---|---|---|---|---|
| R+450 | hero three.js core | scale .6 → 1; emissive and bloom 0 → 1 (it inherits the ring's position) | 800 | expo.out |
| R+600 | header | y −100% → 0. The nav "returns", the inverse of the client hiding nav in champ select | 400 | expo.out |
| R+640 | nav tabs | y −8 → 0, 40 stagger | 300 | power2.out |
| R+700 | hero h1 chars | y 20 → 0, blur 1.4 → 0, 18 stagger | 500 | expo.out |
| R+1,100 | overlay | removed; `#root` loses `inert` and `aria-busy`; scroll lock released | — | — |

**Variants**

- **Returning visit** (`sessionStorage` `rc:seen`): skip A1's icon and title beats and start in A2. Min 500 ms; outro 600 ms (burst 360).
- **Tab hidden at load:** skip the loader.
- **Load under 300 ms:** skip the loader.

---

## 16. Storyboard B: contact submit

**B1, queue.** Fires when the submit passes validation.

| t | element | motion | dur | ease |
|---|---|---|---|---|
| 0 | SEND (magic) | press scale .96 (100); release sheen (330); label crossfades to "IN QUEUE", disabled | 150 | power2.out |
| 0 | queue card | clip-path `inset(0 0 100% 0)` → `inset(0)` with y −8 → 0 | 280 | expo.out |
| 0 → | elapsed | `m:ss`, updated every 1000 ms, tabular-nums | — | — |
| 0 | estimated | "Estimated: 0:02", static or the mean of the last 5 sends | — | — |

- **Card spec:** 240×64 desktop, anchored **under the header's profile ring**, which is the client's position. On mobile it sits under the header at full width minus 2 × 16 px and is 56 px tall.
- **Card content:**
  - Header Marcellus SC 11/14 .1em #A0A7AA, with a gold X.
  - Time 24/26 700 #F0E6D2; estimate 12 Barlow #2CC0DE.
  - Background `linear-gradient(180deg, #10223A, #15405F 60%, #1C587A)` plus our own sheen: a 105° gradient band at 10 % #CDFAFA crossing every 3.2 s; 1 px bottom line #596A71.
- **Minimum queue time:** 1,200 ms before "found", even if the request returns sooner.

**B2, found.** Runs when send resolves and the minimum has passed.

| t | element | motion | dur | ease |
|---|---|---|---|---|
| F | card header | "FINDING MATCH" → "MATCH FOUND" (crossfade); background brightness 1 → 1.5 → 1 | 120 / 160 | none |
| F+160 | card | y −6, opacity 0 | 200 | rc-mag |
| F | backdrop | opacity 0 → 1 (`--rc-backdrop`); add `backdrop-filter: blur(3px)` only on desktop | 200 | power1.out |
| F | dialog | scale 1.1 → 1 | 280 | rc-slam |
| F | rims | dash draw | 360 | power2.out |
| F | icon (our envelope/handshake mark) | slam 2.4 → 1 plus fill flash | 300 | rc-mag |
| F | title "MATCH FOUND" | intro (§5), then pulse from +233 | 233 | rc-mag |
| F | details "Inbox • Direct • 1v1" (copy is the owner's call) | intro, holds 35 % | 466 | rc-mag |
| F | plate | y 12 → 0, opacity 0 → 1 (ours; 2017 had a button intro video) | 240 | expo.out |
| F+180 | ring | ignite to #9CF8EA, settling to #54D6EF by +570 | 250 | power2.out |
| F+830 | countdown | 291° → 0 clockwise with head and particles; **pauses on hover or focus-within** | 8,000 | none |

**B3, accept.** The click lands at C. These are the measured 2018 timings (§8) plus the 2017 text motion.

| t | element | motion | dur | ease |
|---|---|---|---|---|
| C | plate | scale .96 (100); flash #52B1BB peaking at C+130 to C+300; disabled by C+650; text → #5C5B57 (200) | 650 | power2.out |
| C | close button | opacity → 0 | 100 | none |
| C | countdown arc + head | opacity → 0, while the "accepted" full ring goes opacity 0 → 1 (uniform refill, no sweep) | 180 | power2.out |
| C | ring colour | core → #84FEFA by C+260, then to the idle colours (core #106780, rims #76DDDD) by C+1,300 | 260 + 1,040 | power2.out / power1.out |
| C | icon fill | 0 → 1 | 160 | power2.out |
| C | title "MATCH ACCEPTED" | change animation | 200 + 100 @300 | rc-mag |
| C+100 | details "WAITING FOR ABDELMATINE…" or "REPLY WITHIN 24H" | change animation | 200 | rc-mag |
| C+1,400 | outro | A3 minus the site reveal, ≈850 ms total | — | — |
| C+2,250 | toast | x 24 → 0, opacity in; persistent with a close button | 300 | expo.out |
| C+2,250 | focus | returns to SEND, now "SENT" with a lockout timer | — | — |

**Other paths**

- **B4, timeout** (ring reaches 0): run B3 without the plate press. The message is already delivered, so this must not look like a failure.
- **B5, send failed:**
  - The card header changes to "QUEUE FAILED", the card goes `grayscale(1)` over 200 ms, then shakes for 250 ms.
  - The card then expands to "Couldn't deliver. Your message is still here." with a gold RETRY button.
  - The form keeps its content; SEND is re-enabled.
- **B6, rate limited:** the card variant reads "QUEUE LOCKOUT TIMER" and counts down `m:ss`, reusing the client's `queue_penalty_timer_ms` format. Copy: "You sent a message recently. You can queue again in 42:10."

---

## 17. Reduced motion and accessibility

Use `gsap.matchMedia()` with `{ reduce: "(prefers-reduced-motion: reduce)", full: "(prefers-reduced-motion: no-preference)" }`.

**Under `reduce`:**

- No scale, blur, translate, particles, ignition or burst. Only opacity crossfades of ≤150 ms.
- Rings render static and full. **The contact dialog has no countdown**; it stays open until the user acts.
- Loader segments switch state instantly with no ripple; progress is announced in a polite live region; the overlay fades out over 150 ms.
- Text swaps are a 120 ms crossfade.
- Sound is off.

**Loader semantics**

- The dialog art is `aria-hidden="true"`.
- A visually hidden `role="status"` reads "Loading portfolio: 3 of 5 ready".
- `#root` carries `inert` and `aria-busy="true"` until the reveal.
- A focusable "Skip intro" control is available from the first frame.

**Contact dialog semantics**

- `role="alertdialog"` with `aria-label="Message sent"`. The game text is decorative; `aria-describedby` points to a plain sentence.
- Focus goes to ACCEPT on open, Tab is trapped, and Esc closes.
- Focus returns to SEND afterwards.
- The countdown is decorative. When it auto-closes, the same information remains in a persistent toast, which keeps WCAG 2.2.1 satisfied; the ring also pauses on hover and focus.

**Contrast.** #A3C7C7 on #282A23 ≈ 8:1; #A09B8C on #18282E ≈ 5.5:1.

---

## 18. GSAP orchestration

`gsap` latest is **3.15.1**, published 2026-11-04. 3.15.0 (2026-04-13) is the conservative pin. A 4.0.0-beta.3 exists; do not use it. `@gsap/react` is **2.1.2**. Since 3.13 every plugin, including CustomEase and DrawSVG, is free and ships in the npm package.

**Architecture**

- One `<ReadyCheck mode="loader" | "contact">` component with a reducer whose states mirror the client: `hidden | intro | countdown | accepted | waiting | success | failure`.
- One GSAP timeline per transition, built inside `useGSAP(..., { scope })` so it survives StrictMode double-mounts.
- Event handlers go through `contextSafe`.
- The countdown is its own tween, so it can be paused, resumed and time-scaled. That is the analogue of the client's playbackRate sync: `tween.timeScale((dur − t) / (dur − serverElapsed))` if a server clock ever exists.

```ts
// rc-motion.ts  (sketch; px dash math avoids WebKit pathLength quirks)
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
gsap.registerPlugin(CustomEase);
export const MAG = CustomEase.create("rc-mag", "1,0,1,1");    // client text/hide curve
export const SLAM = CustomEase.create("rc-slam", ".2,.9,0,1"); // client show curve
export const R = 201.5, C = 2 * Math.PI * R, ARC = 291, START = 214.5;
const px = (deg: number) => (deg / 360) * C;
// the arc <circle> is pre-rotated by (START - 90)deg about the centre so its path starts at 214.5°

export const show = (q: (s: string) => Element[]) => gsap.timeline()
  .fromTo(q(".rc-dialog"), { scale: 1.1, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .28, ease: SLAM }, 0)
  .fromTo(q(".rc-icon"), { scale: 2.4 }, { scale: 1, duration: .3, ease: MAG }, 0)
  .fromTo(q(".rc-ring"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .25, ease: "power2.out" }, .18);

export const textIn = (el: Element, delay = 0, dur = .233) => gsap.fromTo(el,
  { scale: 1.35, y: 20, filter: "blur(1.4px)", textShadow: "-2px -2px 24px rgba(240,230,210,1)" },
  { scale: 1, y: 0, filter: "blur(0px)", textShadow: "-2px -2px 24px rgba(240,230,210,0)",
    duration: dur, delay, ease: MAG, clearProps: "filter" });

export const textChange = (el: HTMLElement, text: string, d = 0) => gsap.timeline({ delay: d })
  .call(() => { el.textContent = text; })
  .fromTo(el, { scale: 1.35, y: 20, opacity: .75, filter: "blur(1.4px)" },
              { scale: .98, y: 0, opacity: 1, filter: "blur(0px)", duration: .2, ease: MAG })
  .to(el, { scale: 1, duration: .1, ease: "none" }, .3)
  .fromTo(el, { textShadow: "1px 1px 24px rgba(240,230,210,.8)" },
              { textShadow: "1px 1px 24px rgba(240,230,210,0)", duration: .4, ease: "none" }, .2);

export function countdown(arc: SVGElement, head: SVGGElement, secs: number, onEnd: () => void) {
  const s = { e: 0 };
  return gsap.to(s, { e: ARC, duration: secs, ease: "none", onComplete: onEnd, onUpdate() {
    arc.style.strokeDasharray = `${px(ARC - s.e)} ${C}`;
    arc.style.strokeDashoffset = `${-px(s.e)}`;
    head.style.transform = `rotate(${START + s.e}deg)`;               // transform-origin = ring centre
  }});
}

export const accept = (q: (s: string) => Element[], root: HTMLElement) => gsap.timeline()
  .to(q(".rc-arc, .rc-head"), { autoAlpha: 0, duration: .18 }, 0)
  .to(q(".rc-ring-full"), { autoAlpha: 1, duration: .18, ease: "power2.out" }, 0)   // uniform refill
  .to(root, { "--rc-core": "#84FEFA", duration: .26, ease: "power2.out" }, 0)
  .to(root, { "--rc-core": "#106780", duration: 1.04, ease: "power1.out" }, .26)
  .to(q(".rc-plate"), { "--plate": "#52B1BB", duration: .13 }, 0)
  .to(q(".rc-plate"), { "--plate": "#1F2429", color: "#5C5B57", duration: .52, ease: "power2.out" }, .13)
  .to(q(".rc-close"), { autoAlpha: 0, duration: .1 }, 0)
  .to(q(".rc-icon-fill"), { opacity: 1, duration: .16 }, 0);

export const success = (q: (s: string) => Element[]) => gsap.timeline()
  .to(q(".rc-title, .rc-details"), { scale: 1.2, y: 16, filter: "blur(2px)", autoAlpha: 0, duration: .25, ease: MAG }, .24)
  .to(q(".rc-ring"), { scale: 1.18, duration: .52, ease: "expo.in", svgOrigin: "270 262" }, .16)
  .to(q(".rc-ring"), { autoAlpha: 0, duration: .52, ease: "power1.in" }, .16)
  .to(q(".rc-dialog"), { scale: .85, autoAlpha: 0, duration: .2, ease: MAG }, .3)
  .to(q(".rc-backdrop"), { autoAlpha: 0, duration: .5, ease: "power1.inOut" }, .35);
```

**Loader controller.** Fills are sequential, at least 180 ms apart, with a minimum show time:

```ts
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
const gate = (p: Promise<unknown>, ms = 6000) => Promise.race([p.then(() => true), wait(ms).then(() => false)]);
const gates = [document.fonts.ready, coreReady, texturesReady, pageLoaded].map(p => gate(p));
let n = 1, chain: Promise<unknown> = fillSegment(0, true);                 // segment 0 = "you"
gates.forEach(g => g.then(ok => { chain = chain.then(() => fillSegment(n++, ok)).then(() => wait(180)); }));
await Promise.all([...gates, wait(firstVisit ? 1600 : 500)]); await chain;
await success(q); window.dispatchEvent(new Event("rc:reveal"));           // hero core + header listen
```

**GSAP notes**

- GSAP tweens CSS variables (including colours) and complex strings such as `"0 1266"` and `blur()`.
- Timelines are thenable, so they can be awaited.
- For a percentage-keyframe port of the 2017 CSS, use `keyframes: { "0%": …, "20%": …, easeEach: MAG }`.

---

## 19. Performance and pitfalls

- **Budget:** 60 fps on mid-range phones.
  - Animate only transform, opacity, stroke-dash and CSS variables on small elements.
  - Never animate `filter` on the 540 px SVG; text blur (300×32) is fine.
- **Loader JS:** the inline bootstrap stays ≤2 KB. three.js is lazy (`React.lazy` for the hero `Canvas`), so the loader never waits on the 3D bundle before painting. Milestone 2 waits on it without blocking the first frames.
- **Clean up after text blur:** clear `transform` and `filter` when the tween ends, otherwise text stays soft.
- **Hidden tabs:** rAF pauses. If gates resolve while the tab is hidden, run the outro on `visibilitychange`, or just skip it.
- **Mobile:** drop the backdrop blur and halve the particle count below 768 px or under `navigator.hardwareConcurrency <= 4`.
- **Audio:** off by default, with a toggle in the header. Use our own WebAudio synth cues (0 KB):
  - match found: two bell partials, 1318 + 1976 Hz, 1.2 s exponential decay, plus a 300 ms filtered noise swell;
  - accept: an 80 ms click plus a 400 ms chime;
  - segment fills: rising pentatonic ticks (C5 D5 E5 G5 A5), modelled on the client's `posassign-ally-0…4` sequence, not copied;
  - ready: a three-note arpeggio, 120 ms apart.
  - Delete `inqueue.mp3` (§0.7).
- **Existing contact code:** `emailjs-com` is deprecated in favour of `@emailjs/browser` (5.0.3). The current code also has placeholder IDs and an in-memory 1-hour limit that resets on reload. Storyboard B needs a real promise and should persist the lockout in `localStorage`.

---

## 20. UNVERIFIED

- Ready-check entry animation in 10.1+; the dialog may simply pop.
- Modal backdrop alpha and blur in the current client.
- Declined ring colour and visuals (`timer-declined.webm`, which I did not inspect); the 2017 success and decline outro visuals.
- Whether `timeInQueue` resets after a stranger declines.
- Legacy AIR client per-player accept indicators.
- Gap between EveryoneReady and champion select on screen.
- Whether the queue card moved in the 2025 client redesign (latest screenshot seen is 2024).
- `STRAWBERRY` = Swarm (inferred from the codename and the "PvE" string).
- Exact ready-check duration if it differs by queue (wiki says 12 s; some tools assume 10 s).
- Where the 2026 UI uses `ready_check_prepare_battle` ("PREPARE FOR BATTLE").
- Queue-card colours are JPEG-thumbnail samples; GIF colours are palette-quantised.

---

## Sources

- LoL Wiki, Queuing and Matchmaking (12 s ready check, decline behaviour, auto-restore): https://wiki.leagueoflegends.com/en-us/Queuing_and_Matchmaking
- LoL Wiki, Ready Check UI GIF (frame analysis source): https://wiki.leagueoflegends.com/en-us/File:Ready_Check_UI.gif and https://wiki.leagueoflegends.com/en-us/images/Ready_Check_UI.gif
- LoL Wiki, Match Found UI Animation Concept GIF: https://wiki.leagueoflegends.com/en-us/File:Match_Found_UI_Animation_Concept.gif
- LoL Wiki, Play UI GIF: https://wiki.leagueoflegends.com/en-us/File:Play_UI.gif
- LoL Wiki, Client (LCU history, nav hidden in champ select, 2025 redesign, League Next 2027): https://wiki.leagueoflegends.com/en-us/Client
- LoL Wiki file search (ready-check SFX 12–13 s; 410×410 ready-check background): https://wiki.leagueoflegends.com/en-us/Special:Search?search=ready+check&fulltext=1&ns6=1
- LoL Wiki file search (in-queue music files): https://wiki.leagueoflegends.com/en-us/Special:Search?search=queue&fulltext=1&ns6=1
- Riot, "Under the hood of the League Client's Hextech UI" (Jules Glegg, 2017-02-14; `lol-uikit-video-state`, accept intro/idle 200/300 ms, easing as priority): https://www.riotgames.com/en/news/under-hood-league-client%E2%80%99s-hextech-ui (mirror: https://technology.riotgames.com/node/57)
- CDragon 7.1 ready-check plugin (full 2017 version): https://raw.communitydragon.org/7.1/plugins/rcp-fe-lol-ready-check/global/default/ , `1.bundle.js`, `bundle.js`, `trans.json` in that folder
- CDragon 7.3 / 7.4 / 7.5 / 7.6 / 7.12 / 7.20 / 8.1 / 8.9 / 8.17 / 9.1 listings (version boundary): https://raw.communitydragon.org/7.5/plugins/rcp-fe-lol-ready-check/global/default/ and https://raw.communitydragon.org/7.6/plugins/rcp-fe-lol-ready-check/global/default/ (others at the same path)
- CDragon 10.1 ready-check JS/CSS (state machine, sizes, sync formula): https://raw.communitydragon.org/10.1/plugins/rcp-fe-lol-ready-check/global/default/rcp-fe-lol-ready-check.js and `.css`
- CDragon latest navigation CSS (2026 ready-check sizes, login-queue CSS): https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-navigation/global/default/rcp-fe-lol-navigation.css and `trans.json`
- CDragon 10.25 navigation listing (merge date): https://raw.communitydragon.org/10.25/plugins/rcp-fe-lol-navigation/global/default/
- CDragon latest l10n strings: https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-l10n/global/default/trans.json
- CDragon latest parties strings/CSS/assets: https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-parties/global/default/
- CDragon static-assets videos/sounds: https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/videos/ and `/sounds/`
- CDragon Classic SR mode assets: https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/content/src/leagueclient/gamemodeassets/classic_sru/
- CDragon champ-select sounds and intro videos: https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/sounds/ and `/video/position-assignment-intro/`
- CDragon 7.1 navigation JS (nav hidden during ChampSelect etc.): https://raw.communitydragon.org/7.1/plugins/rcp-fe-lol-navigation/global/default/rcp-fe-lol-navigation.js
- CDragon 7.1 patcher JS (PLAY/lobby button slot): https://raw.communitydragon.org/7.1/plugins/rcp-fe-lol-patcher/global/default/rcp-fe-lol-patcher.js
- Generated LCU enums and resources: https://github.com/stirante/lol-client-java-api (`src/main/java/generated/LolMatchmakingMatchmaking*.java`)
- LeagueAkari matchmaking types: https://github.com/LeagueAkari/LeagueAkari/blob/main/src/shared/types/league-client/matchmaking.ts
- Snooze-CSS simulation notes (2026 ready-check service in navigation; timer semantics; dodgeWarning values): https://github.com/ReformedDoge/Snooze-CSS/blob/main/src/simulation.js
- custom-league-client (open-source client; ready-check UI assumes 10 s): https://github.com/caiovini980/custom-league-client
- doughknee/queuePop (auto-accept tray tool, not a UI recreation; MIT): https://github.com/doughknee/queuePop
- maoloader queue-alerts ("about 10 seconds"): https://github.com/steele123/maoloader/blob/main/plugins/queue-alerts/index.js
- league-remote (`READY_CHECK_DURATION = 12`): https://github.com/Nishuw/league-remote
- Surrender@20, ready check dodge penalty on PBE (2013; legacy dialog screenshot): https://www.surrenderat20.net/2013/07/ready-check-dodge-penalty-on-pbe.html
- Queue card screenshots via Bing Images (Reddit hosts blocked): https://www.reddit.com/r/LeagueOfMemes/comments/14vo05y/league_of_waiting/ and https://www.reddit.com/r/leagueoflegends/comments/1bo6uli/longest_queue_time_ive_ever_had/ (search: https://www.bing.com/images/search?q=league+of+legends+%22finding+match%22+estimated+queue+timer)
- GameRevolution login-queue screenshot: https://www.gamerevolution.com/guides/634540-league-of-legends-waitin-in-queue-fix
- GSAP CustomEase docs (cubic-bezier shorthand): https://gsap.com/docs/v3/Eases/CustomEase/
- GSAP 3.13 "100% free" release: https://gsap.com/blog/3-13/ and https://webflow.com/blog/gsap-becomes-free
- npm: `npm view gsap version` returned 3.15.1 (time: 3.15.1 on 2026-11-04, 3.15.0 on 2026-04-13); `@gsap/react` 2.1.2 (2025-01-15); `@emailjs/browser` 5.0.3; `emailjs-com` deprecated ("The SDK name changed to @emailjs/browser").
- Local evidence: `public/sounds/inqueue.mp3` header and `src/hooks/SoundPlayer.tsx`, `src/components/Contact/Contact.tsx`, `package.json` (read-only).

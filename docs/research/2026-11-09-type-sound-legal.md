# Type, sound and legal: research for the League-client portfolio

Date: 2026-11-09 (data fetched 2026-11-09/10). Scope: (A) free substitutes for Beaufort and Spiegel, plus how to load them; (B) League-like UI sound without Riot audio; (C) Riot's fan-content and trademark rules.

This builds on `2026-11-09-lol-client-ui.md` (palette, components, timings) and does not repeat it. One correction: that doc and the champ-select doc call Marcellus / Marcellus SC "closest to Beaufort" and pick Cinzel for bold weights. The measurements below disagree, and they show Marcellus's figures are unusable for counters.

Tags: **[meas]** I measured it (throwaway scripts listed in §E), **[src]** a cited source says it, **[inf]** inference, **UNVERIFIED** could not confirm.

---

## 0. Decisions

1. **Display font: Literata** (TypeTogether, OFL) at 600–700, always uppercase, text optical size (opsz 12).
   - It measures closest to Beaufort Bold:
     - cap widths within 4.9% at weight 600;
     - stroke contrast 1.74 / 1.75 against Beaufort's 1.58 / 1.42 (Cinzel is 3.58 / 3.92);
     - full-height W apex and a vertical G jaw, like Beaufort.
   - Ship one self-built caps-only subset: variable wght 500–800 = **21,632 B**, or static 700 = **12,512 B**. Preload it.
2. **Do not use Marcellus / Marcellus SC for anything that shows numbers.**
   - Its figures hang: 3 4 5 7 9 drop 0.22 cap-height below the baseline.
   - Digit widths are proportional, from 0.29 em (the 1) to 0.81 em (the 0), and the font has no `tnum` or `lnum`.
   - The approved mockup uses it for the currency counters and the Match Found title.
   - Cinzel stays the "fan convention" option: its serif shape is close, but its contrast is about 2.3× Beaufort's and it has no tabular figures.
3. **Body font: Source Sans 3 Variable**, from `@fontsource-variable/source-sans-3@5.3.1`.
   - It comes from the same American-gothic lineage as Spiegel and has tabular figures by default.
   - The latin file is 28.2 KiB and covers weights 200–900.
   - Alternative: Fira Sans. Its x-height is closest, but it ships static files only, at about 24 KiB per weight.
4. **Numerals:**
   - Timers and big counters: Literata 700 with `font-variant-numeric: tabular-nums`. Every digit becomes 0.582 em wide; checked in our subset.
   - Small counters: Source Sans 3, which is tabular by default at 0.497 em.
5. **Sound: synthesize every cue with raw Web Audio.**
   - That means 0 bytes of audio files and about 2 KB of code. The cues are verified against the client's measured envelopes (§B.2).
   - Remove `use-sound` and `howler` together with `public/sounds/inqueue.mp3`. The mp3 is still live in production (§B.7).
   - Sound is off by default. Unlock it on the first click or keydown.
   - Respect the iOS silent switch: do not set `navigator.audioSession.type = "playback"`.
6. **Legal: we ship no Riot assets, so we do not rely on the "Legal Jibber Jabber" licence.**
   - Its required notice says the project uses Riot's assets, which would be false for us. Use the non-affiliation footer in §C.6 instead.
   - Keep "League of Legends", "LoL", "Riot" and "Hextech" out of the title, meta tags, OG tags, repo description and topics, and headings. HEXTECH is a registered Riot mark.
   - Do not add Riot-API features. Riot's developer policies bar API products that resemble its products in style.

---

## A. Typography

### A.1 What we are replacing

**Beaufort** (Nick Shinn, Shinntype) [shinntype][beaufort-pdf][beaufort-family]

- **The foundry's description** (p.2 of the specimen):
  - low stroke contrast and discreet serifs, but still a stressed serif face;
  - proportions in the oldstyle line that runs from Granjon to Plantin and Times;
  - a large, fairly narrow lowercase and an even width across letters;
  - bold romans that recall a "grotesque with small serifs" sign-lettering style.
- **Selling point:** extremely sharp Bézier serifs.
- **Family:** Light, Regular, Medium, Bold and Heavy, each in roman and italic, in Condensed, Normal and Extended widths. A variable version, Beaufort VF, has specimen images dated 2023-04.
- **OpenType:** the default figures are **tabular lining**. It also has small caps, oldstyle figures (proportional and tabular), and an all-caps feature (specimen p.3).
- **Riot's version:** the client uses "Beaufort for LOL", a Monotype modification with an expanded character set and stylistic changes, for example a flat-topped 3 [fontsinuse].
- **Friz Quadrata:** the game used it until about 2015 and the logo still does [fontsinuse]. Today's champ-select CSS still references `--font-frizquadrata` 36 times [meas, CDragon `cs.css`].
- **Client usage, champ-select CSS** [meas]:
  - `--font-display`: 79 rules; 700, uppercase, 14 px and 24 px, letter-spacing .0325–.05em.
  - `--font-body`: 50 rules; 400, 12 px on a 16 px line, letter-spacing .025em, colour #A09B8C.

**Spiegel / Spiegel Sans** (Luc(as) de Groot, LucasFonts) [lucasfonts]

- Commissioned for the magazine *Der Spiegel*.
- LucasFonts calls it an American-style gothic with subtle diagonal stress and faint traces of handwriting.
- Two widths, Normal and Condensed, with 16 styles each.
- Measured from the bold headline in the LucasFonts SVG specimen [meas]:
  - x-height about **0.78–0.79** of cap height, very large;
  - stem 0.207 of cap height;
  - set very narrow, though that may be tight headline tracking.

Both families are commercial. Never ship them; some GitHub repos bundle them, so don't copy from those.

### A.2 Method [meas]

**Beaufort reference**

- Source: the foundry's own specimen PDF. Page 6 (Pro Regular) and page 10 (Pro Bold) were rendered at 4× with PDFium.
- The caps rows were split into glyphs, with a cap height of 192 px.

**Candidates**

- 24 families: the 17 requested, plus Bellefair (by Beaufort's designer), Spectral, Literata, Castoro Titling, Alike Angular and Libre Franklin.
- Each weight's Fontsource latin TTF was rendered with Pillow/FreeType 2.14.3 at a 200 px cap height, A–Z and 0–9.

**Metrics**

- **Cap-width deviation:** mean |ln(width ratio)| over 24 caps (all except I and J), ink width divided by cap height.
- **Contrast:**
  - H: stem ÷ crossbar;
  - O: side thickness ÷ top thickness.
- **Serif profile:** the I's ink width at baseline + 0, 2, 4, 7, 10, 15 and 25% of cap height, divided by its stem width. Serif Δ is the mean absolute difference from Beaufort's profile.
- **Weight:** I stem ÷ cap height. Each candidate's weight was matched to Beaufort Regular (0.120) or Bold (0.214).
- **Shape flags:**
  - W apex: how high the middle vertex reaches, as a share of cap height (1.0 = full height);
  - G jaw: whether there is a vertical stroke on the lower right;
  - Q tail: how far the tail drops below the baseline, as a share of cap height.
- **Features and figures:** fontTools on the Fontsource subsets and on the upstream `google/fonts` TTFs.

**Beaufort reference values**

| | stem | H contrast | O contrast | serif profile 0/2/4/7/10/15/25% | W apex | G jaw | Q tail |
|---|---|---|---|---|---|---|---|
| Beaufort Pro Regular | 0.120 | 1.71 | 1.44 | 1.96 / 1.52 / 1.26 / 1.09 / 1.00 / 1.00 / 1.00 | 1.02 | yes | 0.15 |
| Beaufort Pro Bold | 0.214 | 1.58 | 1.42 | 1.61 / 1.37 / 1.22 / 1.10 / 1.02 / 1.00 / 1.00 | 1.00 | yes | 0.17 |

- **Regular cap widths** (ink width ÷ cap height): A .95, B .69, C .82, D .89, E .64, F .59, G .88, H .91, K .83, L .64, M 1.08, N .94, O .97, P .68, Q 1.06, R .76, S .59, T .81, U .87, V .95, W 1.36, X .92, Y .89, Z .77.
- **Digits:** lining, 1.00–1.05 of cap height, sitting on the baseline.
- **Reading:** the serifs are about 2× stem width at the baseline and blend into the stem within 7–10% of cap height. That is a small, sharp, concave serif, not a flared stem.

### A.3 Display candidates vs Beaufort Bold (what the client mostly uses) [meas]

Each font is shown at the weight whose stem is closest to Beaufort Bold's (±20%).

| Font, weight | stem | H contrast | O contrast | cap-width dev | serif Δ | W apex | G jaw | Q tail |
|---|---|---|---|---|---|---|---|---|
| **Literata 600** | .201 | **1.74** | **1.75** | 4.9% | .53 | **1.00** | yes | .27 |
| Literata 700 | .240 | 1.78 | 1.82 | 6.4% | .45 | 1.00 | yes | .28 |
| Petrona 600 | .175 | 1.94 | 1.80 | **4.3%** | .45 | .88 | yes | .29 |
| Petrona 700 | .200 | 2.00 | 1.91 | 4.4% | .40 | .89 | yes | .30 |
| Trirong 700 | .224 | 3.00 | 3.00 | 6.7% | .18 | .96 | yes | .22 |
| Spectral 600 | .190 | 2.24 | 2.65 | 7.0% | .37 | 1.01 | yes | .23 |
| Spectral 700 | .225 | 2.88 | 3.00 | 10.2% | .30 | 1.01 | yes | .23 |
| Philosopher 700 | .195 | 2.79 | 3.04 | 7.2% | .13 | 1.01 | yes | .31 |
| Cinzel 700 | .215 | 3.58 | 3.92 | 10.8% | **.09** | 1.02 | yes | .40 |
| Cormorant SC 700 | .181 | 4.00 | 4.59 | 6.7% | .17 | 1.01 | no | .32 |

These families have no weight within 20% of Beaufort Bold's stem: Marcellus, Marcellus SC, Bellefair, Forum, Rosarivo, Castoro Titling and Alike Angular. Faux bold is not an option.

**Against Beaufort Regular** (stem 0.120): useful for light display use.

| Font, weight | stem | H contrast | O contrast | cap-width dev | serif Δ | W apex | G jaw | Q tail |
|---|---|---|---|---|---|---|---|---|
| **Bellefair 400** | .105 | 1.62 | 1.92 | **5.3%** | **.02** | 1.02 | yes | .20 |
| Petrona 400 | .125 | 1.79 | 1.72 | 6.9% | .50 | .87 | yes | .28 |
| Literata 300 | .109 | 1.57 | 1.48 | 6.9% | .77 | 1.00 | yes | .27 |
| Marcellus 400 (same caps as Marcellus SC) | .125 | 1.92 | 2.40 | 9.0% | .16 | .86 | **no** | .40 |
| Trirong 400 | .134 | 2.45 | 2.41 | 9.2% | .24 | .95 | yes | .22 |
| Spectral 300 | .120 | 1.64 | 1.96 | 9.3% | .54 | 1.01 | yes | .23 |
| Forum 400 | .105 | 1.91 | 1.91 | 12.1% | .03 | 1.00 | yes | .26 |
| Cormorant Garamond 400 | .110 | 3.00 | 3.43 | 12.7% | .37 | 1.00 | no | .29 |
| Cinzel 500 | .134 | 3.00 | 3.39 | 12.9% | .12 | 1.02 | yes | .36 |
| Rosarivo 400 | .125 | 2.04 | 2.07 | 12.9% | .68 | .99 | yes | .32 |
| Cormorant SC 500 | .131 | 3.57 | 3.87 | 14.1% | .26 | 1.01 | no | .30 |

- Philosopher 400 has an H contrast of 2.25 / 2.54. Its I is hooked, so the serif metric does not apply.
- Sanity check: the cap-width metric ignores serifs. Mulish, a sans, scores 6.4% on widths alone, so read widths together with contrast and serif Δ.

**Glyph notes**, from the side-by-side sheets (gold caps on #010A13, at 13, 26 and 44 px cap heights):

- **Beaufort:**
  - R: straight leg ending in a tiny sharp foot.
  - G: vertical jaw with a spur.
  - Q: tail starts at the bottom centre and sweeps right, 0.15–0.17 cap below the baseline.
  - W: two Vs meeting at full height, no crossed strokes.
  - Digits: lining at cap height; the 1 has a flag. Riot's version has a flat-topped 3.
- **Literata 600/700:**
  - Same skeleton (straight R leg, G jaw, full-height W, sturdy lining digits).
  - Its serifs are larger, blunter wedges than Beaufort's needle points. This is the main visible difference, and it is negligible at 13–14 px.
  - The Q tail is a longer swash (0.27).
- **Petrona 600/700:**
  - Proportions are close.
  - Google Fonts describes heavy asymmetric serifs and arms at inverted angles, which you can see on E, F and T.
  - The W apex is lower (0.88).
  - The result reads quirkier than Beaufort's orthodox shapes.
- **Cinzel 700:**
  - Trajan-style inscriptional caps: thin horizontals (H crossbar about 1/3.6 of the stem), a 0.40 Q tail, classical width contrast (wide O and M, narrow E and S).
  - Reads "epic fantasy" more than "client UI".
  - Digits are lining and proportional, with no `tnum`.
- **Marcellus / Marcellus SC:**
  - A flared (glyphic) face, not a serifed one. Its I widens to 1.32× the stem at the baseline and tapers over 15% of cap height; Beaufort's is 1.96× within 7–10%.
  - No G jaw, a W apex at 0.86 and a long 0.40 Q tail.
  - Hanging figures.
  - Only weight 400.
- **Bellefair 400:**
  - By Nick Shinn, Beaufort's designer. It is the best match at regular weight.
  - Only one weight, lighter than Beaufort Regular, with a tiny x-height (0.53 of cap height). Display use only.
- **Spectral and Trirong:**
  - Tabular lining figures by default, like Beaufort.
  - But contrast reaches 2.2–3.0 at bold weights, and Spectral is set wide.

### A.4 Files, features and sizes [meas]

Sizes are Fontsource latin-subset woff2 files from jsDelivr, fetched 2026-11-09. Fontsource npm versions are 5.3.0 (Source Sans 3: 5.3.1).

| Family | Designer | Weights | Variable axes | 400 / 700 / VF latin (KiB) | Default figures | `tnum` in Fontsource file |
|---|---|---|---|---|---|---|
| Marcellus, Marcellus SC | Astigmatic | 400 | – | 14.2 | hanging (3 4 5 7 9 drop 0.22 cap), proportional 0.29–0.81 em | no; none upstream either |
| Cinzel | Natanael Gama | 400–900 | wght 400–900 | 13.8 / 14.8 / 25.3 | lining, proportional | no |
| Cormorant SC | Christian Thalmann | 300–700 static | – | 20.4 / 19.9 | oldstyle | yes, with `lnum` |
| Cormorant Garamond | Christian Thalmann | 300–700 | wght 300–700 | 22.3 / 21.8 / 36.8 | oldstyle | yes, with `lnum` |
| Forum | Denis Masharov | 400 | – | 23.3 | lining, short (0.93 cap) | no |
| Philosopher | Jovanny Lemonad | 400, 700 | – | 21.5 / 21.7 | lining, proportional | no |
| Trirong | Cadson Demak | 100–900 static | – | 20.2 / 20.3 | **tabular lining** | default |
| Rosarivo | – | 400 | – | 14.4 | oldstyle | no |
| Spectral / Spectral SC | Production Type | 200–800 static | – | 21.2 / 22.5 (SC: 26.9 / 28.7) | **tabular lining** | yes |
| Petrona | Ringo R. Seeber | 100–900 | wght 100–900 | 23.3 / 23.4 / 42.9 | lining, proportional | yes |
| **Literata** | TypeTogether | 200–900 | opsz 7–72, wght 200–900 | 19.9 / 21.5 / 51.3 (wght only; 107.5 with opsz) | lining, proportional | yes (582/1000 em) |
| Bellefair | Nick Shinn, Liron Lavi Turkenich | 400 | – | 16.1 | lining, proportional | no |
| Castoro Titling / Alike Angular | – | 400 | – | 18.1 / 20.9 | lining | no |

**Fontsource and Google Fonts subsets strip OpenType features.**

- They keep GSUB `calt ccmp dnom frac liga locl numr pnum tnum` and GPOS `kern mark mkmk`.
- They drop `case`, `smcp`, `c2sc`, `onum`, `lnum`, `zero`, `ssNN` and `cvNN`, even though the upstream fonts have them. Checked on Literata, Petrona, Fira Sans, Source Sans 3, Inter (the woff2 too) and Cinzel.
- Consequences:
  - `font-variant-caps: small-caps` produces synthesized fake small caps.
  - `font-feature-settings: "case"`, which raises hyphens, colons and brackets to cap height, does nothing.
- If you need those features, subset the upstream TTFs yourself (§A.7).

### A.5 Body candidates vs Spiegel [meas]

**Setup**

- Spiegel's bold headline ("Spiegel erweitert seine Sprache") was taken from the LucasFonts specimen.
- Each candidate set the same string at the same cap height, at the weight whose stem best matches 0.207.

| Font, weight | x/cap (file / rendered bold) | Width vs Spiegel | Stem | Default figures | `tnum` | Latin woff2 (KiB) |
|---|---|---|---|---|---|---|
| Barlow Semi Condensed 700 | .723 / .735 | **−0.3%** | .205 | lining, proportional | yes | 21.8–22.7 per weight |
| Barlow 700 (current mockup) | .723 / .735 | +10.0% | .200 | lining, proportional | yes | 21.7–22.3 per weight |
| Libre Franklin 700 | .714 / .710 | +11.8% | .210 | lining, proportional | no | VF 28.6 |
| **Fira Sans 600** | **.765 / .770** | +13.6% | .205 | lining, proportional | yes | 23.3–24.4 per weight (static only) |
| Hind 700 | .744 / .755 | +13.9% | .215 | lining, proportional | no | 15.8–16.2 per weight |
| Inter 700 | .750 / .750 | +15.5% | .200 | lining, proportional | yes | VF 47.1 (71.2 with opsz) |
| **Source Sans 3 700** | .736 / .760 | +16.0% | .225 | **tabular** | default | **VF 28.2** (200–900) |
| Mulish 800 | .709 / .720 | +18.1% | .215 | tabular | default | VF 29.3 |

- The specimen headline is probably set tight. The width column shows that Spiegel runs narrow; it does not mean Barlow Semi Condensed is Spiegel.
- **Genre match:**
  - LucasFonts calls Spiegel an American gothic with humanist hints.
  - Source Sans was modelled on Morris Fuller Benton's American gothics (News Gothic, Franklin Gothic), with a larger x-height [typekit-2012][wiki-source-sans]. It is the same genre, has tabular figures by default, and one 28 KiB file covers every weight.
  - Fira Sans has the closest x-height and Meta-style humanist detail, but three static weights come to about 72 KiB.
  - Barlow, the mockup's choice, is a rounded, DIN-like grotesk. It is good for condensed micro-labels and further from Spiegel's stress.
- On the regular-weight paragraph comparison, Fira Sans and Source Sans 3 are both visually close.

### A.6 Recommendation and tokens

| Role | Font | Weight | Size (desktop / mobile) | Tracking | Case | Colour | Contrast on #010A13 |
|---|---|---|---|---|---|---|---|
| Hero name | Literata (display) | 700 | clamp(40px, 6vw, 72px), line-height 1 | .04em | upper | #F0E6D2 or gold gradient | 16.1:1 |
| Section title | display | 700 | 32 / 24 px | .05em | upper | #F0E6D2 | 16.1:1 |
| Card / "champion" name | display | 600 (VF 630) | 18 / 16 px | .06em | upper | #F0E6D2 | 16.1:1 |
| Button / nav tab | display | 600 | 14 / 13 px | .08em (tabs .1em) | upper | #CDBE91 → hover #F0E6D2 | 10.8:1 |
| Timer / large number | display, `tabular-nums` | 700 | 48–64 px | 0 | – | #CDFAFA or #F0E6D2 | 17.7:1 |
| Eyebrow / label | Source Sans 3 | 600 | 11–12 px | .12em | upper | #C8AA6E | 8.95:1 |
| Body | Source Sans 3 | 400 | 16 / 15 px, line-height 1.5 | .01em | – | #A09B8C | 7.17:1 (5.70:1 on #1E2328) |
| Small counter | Source Sans 3 (tabular by default) | 600 | 12–13 px | .02em | – | #F0E6D2 | – |
| Disabled | Source Sans 3 / display | – | – | – | – | #5B5A56 | 2.89:1: exempt, but pair it with a state cue |

- #785A28 (gold-500) is 3.12:1 on #010A13. Use it for borders only, never for text.
- The client sizes come from a 1280×720 app (14 px buttons, 12 px body). On the web, scale up as above.
- Optional: Petrona replaces Literata 1:1 if you want a sharper, quirkier cut. Bellefair suits a light, large, mixed-case quote style; don't add a third family unless that style exists.

### A.7 Loading strategy

**1. Display font: self-host one file built once from upstream.**

Literata's OFL has no Reserved Font Name, so a subset may keep the name.

```bash
# Source: https://github.com/google/fonts/blob/main/ofl/literata/Literata%5Bopsz,wght%5D.ttf  (Python: pip install "fonttools[woff]")
fonttools varLib.instancer "Literata[opsz,wght].ttf" opsz=12 wght=500:800 -o literata-vf.ttf
pyftsubset literata-vf.ttf \
  --unicodes="U+0020-005F,U+00A0-00BF,U+00C0-00DE,U+0152,U+0178,U+2013-2014,U+2018-201E,U+2022,U+2026,U+20AC,U+2122" \
  --layout-features="kern,case,tnum,lnum,ccmp,locl,mark,mkmk" --name-IDs='*' \
  --flavor=woff2 --output-file=public/fonts/display-caps-v1.woff2
```

- **Measured sizes:**

  | Build | Size |
  |---|---|
  | VF 500–800 caps | 21,632 B |
  | Static 700 caps | 12,512 B |
  | Static 600 caps | 12,588 B |
  | VF 500–800, full latin with `case` and `tnum` | 36,472 B |
  | Static 700, full latin | 20,756 B |
  | Fontsource `latin-700` (no `case`) | 21.5 KiB |

- **What the caps set covers:**
  - ASCII punctuation, digits and A–Z;
  - « » © ® ° ·;
  - the Latin-1 capitals including all French ones (É È Ê À Ç Ô Î Ù Û Ë Ï Ü), plus Œ and Ÿ;
  - dashes, curly quotes, bullet, ellipsis, € and ™.
- Lowercase is excluded on purpose. Display text must be uppercase; bake `text-transform: uppercase` into the class. A forgotten lowercase letter falls back visibly, in the fallback face.
- **Pin opsz.** At opsz 72, Literata's contrast jumps to 7.8–9.2 (a Didone look, the opposite of Beaufort); at opsz 12 it is 1.69 / 1.75 [meas].
  - Fontsource's static files and its `wght` VF are already at the default opsz.
  - If you ever ship an opsz build, set `font-optical-sizing: none`.
- **No-tooling fallback:** `@fontsource/literata/latin-600.css` + `latin-700.css`, 21.3 + 21.5 KiB. These handle mixed case but have no `case` feature.

**2. CSS.**

Fallback metrics are computed Capsize-style: an advance width averaged with letter-frequency weights (caps-weighted for display), plus the font's typo metrics [meas].

```css
@font-face {
  font-family: "Display";
  src: url("/fonts/display-caps-v1.woff2") format("woff2");
  font-weight: 500 800; font-display: swap;
  unicode-range: U+0020-005F, U+00A0-00DE, U+0152, U+0178, U+2013-2014, U+2018-201E, U+2022, U+2026, U+20AC, U+2122;
}
@font-face { /* Literata 700 caps vs Georgia Bold */
  font-family: "Display Fallback"; src: local("Georgia Bold"), local("Georgia-Bold"); font-weight: 500 800;
  size-adjust: 95.13%; ascent-override: 123.73%; descent-override: 32.38%; line-gap-override: 0%;
}
@font-face { /* Source Sans 3 400 vs Arial */
  font-family: "Body Fallback"; src: local("Arial");
  size-adjust: 94.26%; ascent-override: 108.64%; descent-override: 42.44%; line-gap-override: 0%;
}
:root {
  --font-display: "Display", "Display Fallback", Georgia, serif;
  --font-body: "Source Sans 3 Variable", "Body Fallback", Arial, sans-serif;
}
.font-display { font-family: var(--font-display); text-transform: uppercase; font-feature-settings: "case" 1; }
.num { font-variant-numeric: tabular-nums lining-nums; }
```

- **Other fallback pairs** [meas]:
  - Literata vs Times New Roman Bold: `size-adjust` 103.48%, ascent 113.74%, descent 29.76%.
  - Fira Sans vs Arial: 103.80%, 90.08%, 25.53%.
- **Browser support** [bcd]:
  - `ascent-override`, `descent-override` and `line-gap-override` work in Chrome 87+ and Firefox 89+, and only in Safari Technology Preview. Stable Safari applies only `size-adjust` (Safari 17+), so expect a small vertical shift there on swap.
  - Automated alternative: `fontaine@1.0.3` (MIT, Vite plugin through unplugin) generates these fallbacks at build time.

**3. Body font.**

- `npm i @fontsource-variable/source-sans-3` and `import "@fontsource-variable/source-sans-3";`.
- That gives family `Source Sans 3 Variable`, weights 200–900, `font-display: swap`, and per-subset `unicode-range`, so English and French text downloads only the 28.2 KiB latin file.
- **Don't subset it yourself.** Its OFL reserves the name "Source", and OFL condition 3 bars a modified version from using a reserved name. The same applies to Marcellus ("Marcellus").

**4. Preload only the display file.** It is critical for the loader and the hero.

```html
<link rel="preload" href="/fonts/display-caps-v1.woff2" as="font" type="font/woff2" crossorigin>
```

- `crossorigin` is required even for same-origin fonts, because fonts are fetched in anonymous CORS mode [mdn-preload].
- Don't preload the body font: it sits behind the loader and would compete with the three.js chunk.

**5. Loader gate.** Use this as one of the "waiting for players" pips from the shell doc.

```js
const fontsReady = Promise.race([document.fonts.load('700 1em "Display"'), new Promise(r => setTimeout(r, 1500))]);
```

**6. Centring caps in buttons.**

- Literata's typo metrics are ascent 1.177 em and descent 0.308 em, against a cap height of 0.701 em.
- In a `line-height: 1` box, caps start 0.234 em below the top and end 0.066 em above the bottom, so they look about 0.084 em low [meas].
- Fixes:
  - `text-box: trim-both cap alphabetic` on buttons and tabs. Supported in Chrome 133, Safari 18.2 and Firefox 154 [bcd].
  - Or add `ascent-override: 85.05%; descent-override: 14.95%` to the real `@font-face`. This centres caps exactly, but only in Chromium and Firefox.

**7. Caching on Vercel** (checked live, 2026-11-10):

- Both `https://abdelmatine.vercel.app/assets/index-CibCfBTT.js` and `/as.svg` return `Cache-Control: public, max-age=0, must-revalidate`, so every visit revalidates.
- Add `vercel.json` header rules for `/assets/(.*)` and `/fonts/(.*)`: `public, max-age=31536000, immutable`.
- Version the font filenames (`-v1`).
- Out of scope, but noticed: the main bundle is 1,307,007 B uncompressed.

**Font budget:** about 21.6 KB (display, preloaded) + 28.9 KB (body) ≈ **50 KB**, self-hosted. The mockup's Google Fonts setup (Marcellus SC + Barlow 400/500/600) is about 80 KiB plus a third-party connection.

**If Cinzel is kept anyway**

- Use it for titles only.
- For digits, use Literata or Source Sans 3, or force fixed widths: `.digit{display:inline-block;width:.62em;text-align:center}`.

---

## B. Sound

### B.1 Reference: what the client's UI sounds measure like [meas]

These measurements set design targets only. I downloaded 14 files from CommunityDragon's `latest` (the 2026-01 build) to a temp folder, measured them and deleted them. Nothing ships.

- All files are 48 kHz stereo Ogg Vorbis.
- "Active" means within 50 dB of the peak. T-20 is the time from the peak to −20 dB.
- LUFS was measured with pyloudnorm; it is approximate for files under 0.4 s.

| Client file | Role | Active (s) | Attack (ms) | T-20 (ms) | Peak (dBFS) | LUFS | Centroid | Size |
|---|---|---|---|---|---|---|---|---|
| sfx-uikit-grid-hover | grid hover | 0.06 | 5 | 30 | −40.2 | −53.4 | 11.4 kHz | 5.0 KiB |
| sfx-uikit-button-gold-hover | gold hover | 0.87 | 105 | 335 | −53.2 | −64.1 | 8.5 kHz | 15.8 KiB |
| sfx-uikit-checkbox-click | checkbox | 0.15 | 0 | 25 | −18.4 | −37.3 | 7.6 kHz | 11.2 KiB |
| sfx-uikit-dropdown-click | dropdown | 0.41 | 40 | 75 | −25.8 | −41.6 | 9.2 kHz | 11.7 KiB |
| sfx-uikit-button-gold-click | gold click | 1.53 | 175 | 140 | −17.8 | −32.6 | 6.9 kHz | 47.2 KiB |
| sfx-uikit-magic-button-hover | blue hover | 2.83 | 125 | 790 | −35.7 | −51.0 | 1.5 kHz | 59.0 KiB |
| sfx-nav-button-play-hover | PLAY hover | 2.81 | 120 | 790 | −31.7 | −46.2 | 1.5 kHz | 62.0 KiB |
| sfx-readycheck-accept-button-hover | ACCEPT hover | 2.71 | 130 | 290 | −17.4 | −33.6 | 2.2 kHz | 55.0 KiB |
| sfx-cs-lockin-button-hover | LOCK IN hover | 2.58 | 120 | 120 | −21.5 | −41.5 | 2.4 kHz | 48.4 KiB |
| sfx-uikit-magic-button-click | blue click | 2.94 | 200 | 35 | −2.8 | −19.9 | 4.0 kHz | 68.7 KiB |
| sfx-nav-button-play-click | PLAY click | 3.05 | 150 | 595 | −10.4 | −27.3 | 4.3 kHz | 83.9 KiB |
| sfx-cs-lockin-button-click | LOCK IN | 1.76 | 85 | 450 | −9.9 | −25.6 | 5.8 kHz | 39.4 KiB |
| sfx-readycheck-accept-button-click | ACCEPT | 2.94 | **860** | 475 | −4.1 | −19.2 | 6.2 kHz | 53.5 KiB |
| sfx-readycheck-lowspec-intro | Match Found | 4.16 | **385** | 1655 | −6.5 | −19.8 | 1.7 kHz | 87.7 KiB |

**Takeaways**

- **A loudness ladder of about 45 dB:**
  - hovers −64 to −34 LUFS (gold hover the quietest, ACCEPT hover the loudest);
  - small clicks −42 to −33;
  - nav and lock-in clicks −27 to −26;
  - Accept and Match Found −20 to −19.
- **Gold hovers are almost silent** (−53 dBFS peak).
- **Blue "magic" hovers are soft swells of about 2.8 s.** They share spectral peaks at 63, 416, 1392 and 4924 Hz, so one shared shimmer layer is probably reused [inf].
- **Big moments have a pre-swell:** Match Found peaks 385 ms after onset, the Accept click 860 ms after.
- **File budget:** clicks run 5–88 KiB each, and the client spends about 1 MB on UI audio. We can spend 0.

### B.2 Our cues: synthesized and verified [meas]

**Setup:** each cue was rendered with `OfflineAudioContext` at 48 kHz in Chromium 152, through a 1.6 s synthetic reverb at 0.22 wet. The live module adds a ×0.8 master gain, about −2 dB.

| Cue | Recipe | Active | Attack | T-20 | Peak | RMS | Centroid | Client target |
|---|---|---|---|---|---|---|---|---|
| hover ("metallic tick") | sines 4.2 / 6.4 / 9.8 kHz, τ 8 / 6 / 4 ms | 45 ms | 0 | 20 ms | −38.7 | −55.5 | 5.4 kHz | grid hover: 60 ms, −40 dBFS |
| click ("crystalline") | 4 ms noise high-passed at 2.5 kHz, plus 2093 / 5777 / 11300 Hz, τ 160 / 70 / 35 ms, plus reverb send | 0.94 s | 0 | 355 ms | −19.9 | −38.8 | 2.8 kHz | gold click: 1.5 s, −17.8 dBFS |
| matchFound ("queue pop") | 350 ms band-pass noise swell 400→2400 Hz (Q 1.5), then a Risset-style bell on C5, 10 partials | 4.66 s | 215 ms | 1280 ms | −8.2 | −28.7 | 1.7 kHz | 4.16 s, 385 ms, 1655 ms, −6.5 dBFS, 1.7 kHz |
| lockIn ("whoosh") | 300 ms noise sweep 300→3000 Hz (Q 1.2), then a 110→45 Hz thump (τ 120 ms) and a 2093 / 5777 Hz chime | 2.1 s | 170 ms | 555 ms | −9.1 | −29.3 | 2.9 kHz | 1.76 s, 85 ms, 450 ms, −9.9 dBFS |
| hum ("ambient magic") | saws at 55 / 55.4 / 110.2 Hz → low-pass at 320 Hz, swept ±120 Hz by a 0.07 Hz LFO, plus 1760 / 2637 Hz shimmer into the reverb; 2 s fade-in | loop | – | – | −36.0 | −48.0 | 298 Hz | below every cue |

**Tuning**

- To get the client's brighter 6–7 kHz click, multiply the click partials by 1.5.
- For more weight on Match Found, lower f0 from 523.25 Hz to 392 Hz (G4).

### B.3 Reference module (about 75 lines, plain JS)

The cue bodies below were run in Chromium 152. The wrapper (`setSound`, `play`, `startHum`) was not run.

```js
// sfx.js: synthesized UI cues, no audio files. Silent until setSound(true) runs inside a click/keydown handler.
let ctx, out, verb, on = false, lastHover = 0, humStop = null;
function init() {
  if (ctx) return;
  ctx = new AudioContext({ latencyHint: 'interactive' });
  const lim = ctx.createDynamicsCompressor(); // safety limiter
  lim.threshold.value = -6; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.003; lim.release.value = 0.1;
  out = ctx.createGain(); out.gain.value = 0; out.connect(lim).connect(ctx.destination);
  verb = ctx.createConvolver(); verb.buffer = impulse(1.6, 3.2);
  const wet = ctx.createGain(); wet.gain.value = 0.22; verb.connect(wet).connect(out);
}
function impulse(sec, decay) {
  const n = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** decay; }
  return b;
}
const env = (g, t, peak, atk, tau) => { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + atk); g.gain.setTargetAtTime(0, t + atk, tau); };
function partial(f, peak, atk, tau, dest, t) {
  const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = f; env(g, t, peak, atk, tau);
  o.connect(g).connect(dest); o.start(t); o.stop(t + atk + tau * 7); // 7τ ≈ −60 dB
}
function noise(sec) {
  const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * sec), ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = ctx.createBufferSource(); s.buffer = b; return s;
}
function sweep(t, dur, f0, f1, q, peak, tPeak, tEnd) {
  const n = noise(dur), bp = ctx.createBiquadFilter(), g = ctx.createGain();
  bp.type = 'bandpass'; bp.Q.value = q; bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + tPeak);
  g.gain.setValueAtTime(1e-4, t); g.gain.exponentialRampToValueAtTime(peak, t + tPeak); g.gain.exponentialRampToValueAtTime(1e-4, t + tEnd);
  n.connect(bp).connect(g).connect(out); n.start(t); n.stop(t + dur);
}
const cues = {
  hover(t) { [[4200, .0065, .008], [6400, .004, .006], [9800, .0025, .004]].forEach(([f, a, tau]) => partial(f, a, .001, tau, out, t)); },
  click(t) {
    const n = noise(.03), hp = ctx.createBiquadFilter(), g = ctx.createGain();
    hp.type = 'highpass'; hp.frequency.value = 2500; env(g, t, .07, .001, .004); n.connect(hp).connect(g).connect(out); n.start(t); n.stop(t + .03);
    [[2093, .05, .16], [5777, .03, .07], [11300, .012, .035]].forEach(([f, a, tau]) => partial(f, a, .002, tau, out, t));
    partial(2093, .025, .002, .25, verb, t);
  },
  matchFound(t) {
    sweep(t, .5, 400, 2400, 1.5, .45, .33, .45);
    const t1 = t + .35, f0 = 523.25; // [ratio, amp, tau]: Risset-style inharmonic bell
    [[.56, .9, .9], [.92, .6, .8], [1, 1, .6], [1.19, .7, .45], [1.71, .55, .35], [2, .45, .3], [2.74, .35, .22], [3, .3, .18], [3.76, .22, .14], [4.07, .2, .12]]
      .forEach(([r, a, tau]) => { partial(f0 * r, .11 * a, .004, tau, out, t1); partial(f0 * r, .045 * a, .004, tau, verb, t1); });
  },
  lockIn(t) {
    sweep(t, .4, 300, 3000, 1.2, .3, .28, .36);
    const t1 = t + .3, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(110, t1); o.frequency.exponentialRampToValueAtTime(45, t1 + .18); env(g, t1, .22, .003, .12);
    o.connect(g).connect(out); o.start(t1); o.stop(t1 + 1);
    [[2093, .09, .4], [5777, .05, .15]].forEach(([f, a, tau]) => { partial(f, a, .002, tau, out, t1); partial(f, a * .6, .002, tau, verb, t1); });
  },
};
export async function setSound(enable) {           // call from the toggle's click handler
  init(); on = enable;
  if (on && ctx.state !== 'running') await ctx.resume();
  out.gain.setTargetAtTime(on ? 0.8 : 0, ctx.currentTime, 0.05);
  if (!on) stopHum();
}
export function play(name) {
  if (!on || ctx.state !== 'running') return;
  const t = ctx.currentTime + 0.005;
  if (name === 'hover') { if (t - lastHover < 0.06) return; lastHover = t; } // ≤ 1 tick per 60 ms
  cues[name](t);
}
export function startHum() {
  if (!on || humStop) return;
  const t = ctx.currentTime, lp = ctx.createBiquadFilter(), g = ctx.createGain(), sg = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
  lp.type = 'lowpass'; lp.frequency.value = 320; lp.Q.value = 0.7; lfo.frequency.value = 0.07; lg.gain.value = 120; lfo.connect(lg).connect(lp.frequency);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.005, t + 2); sg.gain.value = 0.0015;
  const oscs = [55, 55.4, 110.2].map(f => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(lp); return o; });
  [1760, 2637].forEach(f => { const o = ctx.createOscillator(); o.frequency.value = f; o.connect(sg); oscs.push(o); });
  lp.connect(g).connect(out); sg.connect(verb); [...oscs, lfo].forEach(o => o.start(t));
  humStop = () => { const n = ctx.currentTime; g.gain.setTargetAtTime(0, n, 0.2); sg.gain.setTargetAtTime(0, n, 0.2); [...oscs, lfo].forEach(o => o.stop(n + 1.5)); };
}
export function stopHum() { humStop?.(); humStop = null; }
document.addEventListener('visibilitychange', () => { if (ctx && on) document.hidden ? ctx.suspend() : ctx.resume(); });
```

- The tested harness also had a shimmer tremolo, a 0.2 Hz LFO on the shimmer gain. The module drops it; that changes only the sparkle.
- **Restoring a saved "on" preference:**
  - Don't create the context at load. Chrome warns, and the context stays suspended.
  - Register `addEventListener('click', () => setSound(true), { once: true, capture: true })`, plus a `keydown` twin, and let the first interaction start audio.

### B.4 UX rules

**Default and toggle**

- Sound is **off** by default for everyone.
- The toggle is a header icon button with `aria-pressed` and an accessible name such as "Sound". Persist the choice in `localStorage`; it is a per-viewer convenience.

**Unlocking audio**

- Chrome creates an `AudioContext` before any gesture in the "suspended" state, and it needs `resume()` from a gesture. Chrome recommends `click` [chrome-autoplay].
- Activation-triggering events [mdn-activation]:
  - `keydown`, except Esc;
  - `mousedown`;
  - `pointerdown` when the pointer is a mouse;
  - `pointerup` for touch and pen;
  - `touchend`.
- Hover is not one of them. Hover ticks are dropped silently until the first click or keypress, which is acceptable.
- Firefox gates Web Audio on sticky activation (`media.autoplay.block-webaudio`, true by default) [mdn-autoplay].
- `navigator.userActivation.hasBeenActive` (Chrome 72, Firefox 120, Safari 16.4) lets you skip pointless `resume()` calls [bcd].

**iOS**

- Web Audio is treated as "ambient" and obeys the hardware silent switch [webkit-237322].
- `navigator.audioSession.type` exists only in Safari (16.4+) and defaults to `"auto"` [mdn-audiosession][bcd]. Setting it to `"playback"` would ignore the switch and pause other apps' audio, which is wrong for UI sounds. Leave it alone.

**Accessibility**

- WCAG 2.2 SC 1.4.2: audio that plays automatically for more than 3 s needs a way to pause, stop or control volume [wcag-142].
- Our hum only starts after the user enables sound, and the same toggle stops it.
- Also:
  - fade the hum in over 2 s;
  - stop it on `visibilitychange` when hidden;
  - fade it out after about 60 s without interaction [inf].

**Hover and triggers**

- Play hover only under `(hover: hover) and (pointer: fine)`.
- Allow at most one tick per 60 ms, and none while the pointer moves within the same element.
- Never attach sounds to scroll reveals.

**Cue mapping**

| Cue | Triggers |
|---|---|
| hover | gold buttons, nav tabs, stack-grid cells |
| click | gold buttons, tabs |
| lockIn | LOCK IN, contact "send" |
| matchFound | loader "Match Found" |
| hum | optional; only behind the hero while sound is on |

### B.5 Libraries [bundlephobia, npm view 2026-11-10]

| Option | Version | Min / gzip | Verdict |
|---|---|---|---|
| raw Web Audio | – | about 2 KB of our own code | **ship** |
| use-sound | 5.0.0 (repo has ^4.0.3) | 1.8 / 0.9 KB, plus howler | remove; it only plays `inqueue.mp3` today |
| howler | 2.2.4 (last published 2023-09) | 36.5 / 9.7 KB | only worth it for long streamed music with an HTML5 Audio fallback |
| Tone.js | 15.1.22 | 336.9 / 76.6 KB | prototyping only |
| ZzFX | 1.4.0 (MIT) | 2.2 / 1.3 KB | 8-bit timbre; quick prototypes only |

The current eager bundle already carries howler at about 35 kB (webgl doc).

### B.6 If you prefer recorded samples

**CC0 sources** (no attribution required)

- Kenney "UI Audio": 50 files, CC0, v1.0, 2012 [kenney-ui].
- Kenney "Interface Sounds": 100 files, CC0, 2020 [kenney-if].
- The Kenney pages don't state a file format (UNVERIFIED; usually .ogg).
- Freesound, filtered to "Creative Commons 0" [freesound-search]. Examples, with the licence read on the sound page on 2026-11-10:
  - "Fantasy_ui_Button_6.wav", ZenithInfinitiveStudios, CC0, 1.42 s, 44.1 kHz 16-bit stereo, 248.8 KB, pack 21157 (6 sounds; check each one);
  - "Whoosh", qubodup, CC0, 0.43 s, FLAC, 70.8 KB.
- Other CC0-filtered hits to check before use: "Item Pickup Chime" (Irolan, 735168), "Crystal Twinkle" (LaurenPonder, 639429), "Far ethereal chimes" (moogsy, 463563).
- Freesound downloads need an account. CC BY needs a credit line, CC BY-NC bars commercial use, and Sampling+ is retired [freesound-faq]. **Filter to CC0 only.**

**Sonniss #GameAudioGDC** [sonniss][sonniss-licence]

- Royalty-free, commercial use, no attribution, unlimited projects.
- Licence v2.0, effective 2026-08-27, bars supplying the sounds themselves as sound effects or files, including edited versions and asset packs; finished projects are allowed. AI training is banned.
- **Our repo is public.** Committing Sonniss files to `public/` publishes the raw files. **Avoid Sonniss for this repo.**

**Formats** [caniuse]

| Format | Support |
|---|---|
| MP3 and AAC (.m4a) | the only single formats that play everywhere |
| Opus in WebM | Safari 17.5+; on macOS, full support needs Safari 18.4 on macOS 15.4 |
| Ogg container on iOS | only from 18.4; iOS 17.4–18.3 decodes Vorbis but not Ogg |

- Ship MP3: mono, 48 kHz, about 96 kbps (about 12 KB/s).
- Keep the whole set under 60 KB and load it after unlock, not at first paint.
- After `decodeAudioData`, start each buffer at its first sample above −60 dBFS. This skips MP3 encoder padding, which varies by browser (UNVERIFIED).

### B.7 Repo action

- `public/sounds/inqueue.mp3` is live: a HEAD request to `https://abdelmatine.vercel.app/sounds/inqueue.mp3` returns 200, `audio/mpeg`, 1,160,402 B.
- Sibling docs already flag it as probable Riot in-queue music.
- Delete it and `src/hooks/SoundPlayer.tsx`. It stays in the public git history; rewriting history is optional and disruptive.

---

## C. Legal (not legal advice)

### C.1 The policy

- Riot Games, "Legal Jibber Jabber": https://www.riotgames.com/en/legal. The page still shows **"Last Updated: August 2018"** (re-fetched 2026-11-10).
- The required notice from §6, verbatim. It uses straight quotes, and the page publishes two spaces between the sentences.

> [The title of your Project] was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games.  Riot Games does not endorse or sponsor this project.

### C.2 What it allows and forbids (paraphrased)

- **§1:** a personal, non-exclusive, revocable licence to use, display and create derivative works of Riot IP, only for non-commercial community use. Riot can withdraw it at any time, and you must stop at once.
- **§2:** no commercial projects. That includes crowdfunding, paywalls, or anything involving a business or legal entity, unless you have a written licence.
  - Exceptions: passive ad revenue, donations or subscriptions while streaming, and API-key products that comply with the API policies.
- **§3:** no games or apps built on Riot IP (character looks, abilities, maps, icons, items), and no app-store releases without a licence or API key.
- **§4:** the project must add original content.
- **§5:** no Riot logos or trademarks anywhere in the project or its site or materials. No domains or social handles built on Riot marks, names or character names. No Riot marks as keywords or search tags.
- **§6:** display the notice "conspicuously".
- **§7:** Riot gets a perpetual, royalty-free, sublicensable licence to use and modify your project, with no credit or payment.

### C.3 Does it apply to this portfolio?

**Where we stand**

- The LJJ licenses the *use of Riot IP*. Our plan uses none of it:
  - no art, icons, logos, fonts, sounds, sprites or videos;
  - no traced ornament paths;
  - our own copy.
- We therefore don't rely on the licence, and its notice, which says the project uses assets owned by Riot Games, would be false [inf].

**Grey zone**

- Colours, gradients, generic gold frames and UI patterns are generally not protectable on their own [inf].
- Pixel-faithful copies of specific client artwork (sprites, SVG ornament paths, WebM loops) would make the site a derivative work. The LJJ would then apply, including its non-commercial condition.
- A job-hunting or freelance portfolio is arguably promotional, and the LJJ counts anything "that involves a business" as commercial. **Keep zero Riot assets to stay out of that question.**

**If a Riot asset is ever added** (for example a Data Dragon icon):

- Switch the footer to the exact LJJ notice with the project title.
- Keep the site free and ad-free.
- Accept the §7 licence-back.

**Riot API**

- The developer General Policies (https://developer.riotgames.com/policies/general, last updated 2025-05-29) bar API products that closely resemble Riot's games or products in style or function.
- They also require product registration and their own boilerplate.
- So: **no live rank or match-history widgets on this client-styled site.**

### C.4 Naming rules

**Riot marks to keep out of branding**

- "League of Legends" and "Riot Games" (Riot's own boilerplate calls them trademarks).
- **"HEXTECH"**: USPTO serial 87191190, registration 5389278, owner Riot Games, Inc., classes 9 / 35 / 41. Source: third-party trademark databases (Justia, markinton). Confirm on USPTO TSDR.
- Likely also Arcane, Runeterra, Summoner's Rift, TFT and Clash (UNVERIFIED individually).

**Never in**

- `<title>`, meta description or keywords, OG or Twitter tags, the favicon, domains or subdomains;
- the repo name, description or topics, or social handles;
- headings, nav or button labels, or SEO alt text.

**Fix now**

- The GitHub description reads "A league of legends themed portfolio" [gh].
- Change it to something like "Personal portfolio with a game-client-inspired UI (unofficial fan design)".
- The repo has no topics; keep it that way.

**In-site copy**

- Fine: generic verbs and phrases such as PLAY, ACCEPT, DECLINE, LOCK IN, BAN, MATCH FOUND, "waiting for other players" (sibling doc agrees).
- Avoid Riot-specific nouns: Hextech, Summoner, Rift, Runeterra, Arcane, champion names, RP / Riot Points, Blue / Orange Essence, Honor, Clash, TFT, LoL.
- Counters use our own units: projects, commits, years.

**Code identifiers**

- These are not trademark use, so the risk is low. Prefer neutral names (`gold`, `magic`, `frame`) anyway, because the repo is public.

**Where the name may appear**

- "League of Legends" appears once, in plain text: the footer disclaimer and the README credits. Never styled like the logo.

### C.5 Licences of what we do ship

- **OFL fonts:**
  - No credit is needed on the site.
  - Keep the copyright and licence entries in the font's name table (`--name-IDs='*'`), or ship OFL.txt beside the files.
  - Literata, Petrona and Cinzel have no reserved name, so a self-made subset is fine.
  - Source Sans 3 ("Source") and Marcellus ("Marcellus") do. Use them unmodified, through Fontsource.
- **CC0 audio:** no credit needed, though it's courteous.
- **CC BY audio:** a credit line is mandatory.
- **Synthesized audio:** ours.

### C.6 Footer wording (recommended)

**EN, full:**

> Unofficial fan design inspired by the League of Legends client. Not affiliated with, endorsed or sponsored by Riot Games. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. All artwork, fonts, sounds and code on this site are original or openly licensed; no Riot Games assets are used.

**EN, short** (mobile footer, linking to the full text):

> Unofficial fan design inspired by League of Legends. Not affiliated with or endorsed by Riot Games.

**FR, if the site is bilingual:**

> Design non officiel inspiré du client League of Legends. Ce site n'est ni affilié à Riot Games, ni approuvé ou sponsorisé par Riot Games. League of Legends et Riot Games sont des marques commerciales ou déposées de Riot Games, Inc. Aucun élément appartenant à Riot Games n'est utilisé.

**Placement**

- Every page footer, at 12 px or more, in #A09B8C on #010A13 (7.17:1).
- Not behind a toggle.
- Repeat it in the README under "Credits & legal".

---

## D. UNVERIFIED and limits

- The Beaufort metrics come from Shinntype's Beaufort Pro specimen, not Riot's Monotype-modified "Beaufort for LOL". The changes known from Fonts In Use are the character set and a flat-topped 3; proportions are assumed equal.
- Raster measurements were taken at 192–200 px cap height, where ±1 px ≈ ±0.5%. Contrast and serif profile are proxies, and the W, G and Q flags are automated, then checked by eye.
- The Spiegel comparison uses one bold headline from a LucasFonts SVG specimen. It may be tightly tracked or the Condensed width, so the width column is indicative only.
- Client sound numbers come from one build (CDragon `latest`, files dated 2026-01-11). LUFS is approximate for very short files.
- Synth cue metrics were measured in Chromium 152 only; Safari and Firefox output was not measured.
- The HEXTECH registration comes from third-party databases; USPTO TSDR was not opened. Other Riot marks were not checked one by one.
- Kenney pack formats, and the full licence list of Freesound pack 21157, were not checked.
- How each browser handles MP3 encoder delay in `decodeAudioData` was not tested.
- Whether a job-seeking portfolio counts as "commercial" under the LJJ is a legal judgement; not decided here.
- Browser versions for `text-box-trim` and the metric overrides come from MDN's compatibility data (main branch, 2026-11-10); not hands-on tested.

## E. Reproducibility

These are throwaway scripts in `C:/Users/abdel/AppData/Local/Temp/claude/8d57b08e2422bb31/1bd66213-b433-46ef-8926-dbe5a9999d6c/scratchpad/tsl/`.

| Script / file | What it does |
|---|---|
| `fetch_fonts.py` | Fontsource metadata, TTFs and woff2 sizes |
| `measure.py`, `compare.py` | glyph metrics |
| `sheet.py`, `ui_sheet.py` | comparison sheets (`sheet_*.png`) |
| `spiegel_measure.py`, `spiegel_sheet.py` | Spiegel comparison |
| `ftinfo.py`, `ftfeat.py`, `tnumcheck.py` | OpenType features and figures |
| `vfmeasure.py` | Literata opsz test |
| `subset_test.py`, `subset2.py` | subset sizes |
| `fallback.py` | fallback metric overrides |
| `sfxmeasure.py` | client sound metrics; the files were deleted |
| `synth-test.html` / `synth-test.js` | Web Audio harness, run in the Claude browser on https://example.com |

---

## Sources

Typography
- [shinntype] Shinntype, Beaufort: https://shinntype.com/beaufort/
- [beaufort-pdf] Beaufort Pro specimen PDF (42 pp.): https://shinntype.com/wp-content/uploads/2021/09/Beaufort.pdf
- [beaufort-family] Beaufort full-family image: https://shinntype.com/wp-content/uploads/2024/05/Beaufort_Full_Family-1.png
- [fontsinuse] Fonts In Use, League of Legends game and website: https://fontsinuse.com/uses/26935/league-of-legends-game-and-website
- [lucasfonts] LucasFonts, Spiegel Sans: https://www.lucasfonts.com/fonts/spiegel-sans/info ; specimen SVG: https://www.lucasfonts.com/media/Spiegel-erweitert-seine-Sprache.svg
- Client CSS (reference only): https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/ (`cs.css` from the sibling research cache)
- Google Fonts specimens (designers, descriptions): https://fonts.google.com/specimen/Literata , /Petrona , /Bellefair , /Cinzel , /Marcellus , /Marcellus+SC , /Spectral , /Trirong , /Forum , /Philosopher , /Cormorant+SC , /Source+Sans+3 , /Fira+Sans , /Barlow , /Barlow+Semi+Condensed (metadata via https://fonts.google.com/metadata/fonts/<Family>)
- Fontsource API and CDN: https://api.fontsource.org/v1/fonts/literata ; https://cdn.jsdelivr.net/fontsource/fonts/literata@latest/latin-700-normal.woff2 ; https://cdn.jsdelivr.net/npm/@fontsource-variable/source-sans-3@5.3.1/index.css
- Upstream TTFs and licences: https://github.com/google/fonts/tree/main/ofl/literata , .../ofl/sourcesans3/OFL.txt , .../ofl/marcellussc/OFL.txt
- SIL Open Font License 1.1: https://openfontlicense.org/open-font-license-official-text/
- [typekit-2012] Source Sans Pro launch: https://blog.typekit.com/2012/08/02/source-sans-pro ; [wiki-source-sans] https://en.wikipedia.org/wiki/Source_Sans
- [bcd] MDN browser-compat-data: https://github.com/mdn/browser-compat-data (css/at-rules/font-face.json, css/properties/text-box-trim.json, api/AudioSession.json, api/UserActivation.json)
- [mdn-preload] https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload
- fontaine: https://github.com/unjs/fontaine (npm 1.0.3)
- Vercel CDN cache: https://vercel.com/docs/caching/cdn-cache ; live headers checked on https://abdelmatine.vercel.app/

Sound
- [chrome-autoplay] https://developer.chrome.com/blog/autoplay
- [mdn-activation] https://developer.mozilla.org/en-US/docs/Web/Security/User_activation
- [mdn-autoplay] https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
- [mdn-audiosession] https://developer.mozilla.org/en-US/docs/Web/API/AudioSession/type ; W3C Audio Session: https://www.w3.org/TR/audio-session/
- [webkit-237322] https://bugs.webkit.org/show_bug.cgi?id=237322
- [wcag-142] https://www.w3.org/TR/WCAG22/#audio-control
- [caniuse] https://caniuse.com/opus , https://caniuse.com/ogg-vorbis , https://caniuse.com/mp3 (data: https://github.com/Fyrd/caniuse/tree/main/features-json)
- [kenney-ui] https://kenney.nl/assets/ui-audio ; [kenney-if] https://kenney.nl/assets/interface-sounds
- [freesound-faq] https://freesound.org/help/faq/ ; [freesound-search] https://freesound.org/search/?q=crystal+chime&f=license%3A%22Creative+Commons+0%22 ; https://freesound.org/people/ZenithInfinitiveStudios/sounds/376748/ ; https://freesound.org/people/qubodup/sounds/60013/
- [sonniss] https://sonniss.com/gameaudiogdc ; [sonniss-licence] https://sonniss.com/gdc-bundle-license/
- Bundle sizes: https://bundlephobia.com/package/howler@2.2.4 , /use-sound@5.0.0 , /tone@15.1.22 , /zzfx@1.4.0
- Client sound listings (measured, not shipped): https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-uikit/global/default/ , https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/sounds/ , https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/sounds/

Legal
- [riot-legal] https://www.riotgames.com/en/legal (Last Updated August 2018; fetched 2026-11-10)
- Riot Developer General Policies: https://developer.riotgames.com/policies/general (last updated 2025-05-29)
- HEXTECH trademark: https://trademarks.justia.com/871/91/hextech-87191190.html ; https://markinton.com/trademark/hextech-87191190 ; verify at https://tsdr.uspto.gov/#caseNumber=87191190&caseType=SERIAL_NO&searchType=statusSearch
- [gh] `gh repo view abdelmatine/league` (description, topics), 2026-11-10

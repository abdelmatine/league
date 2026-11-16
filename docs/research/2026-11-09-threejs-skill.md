# three.js / React Three Fiber skills for Claude Code

Date: 2026-11-09. Scope: choose the Agent Skills (SKILL.md) to install for three.js and R3F work on this portfolio, next to the GSAP skills already installed (`gsap-skills@gsap-skills` 1.0.0, user scope). This was read-only research: nothing was installed. Every repo was read through the GitHub API at the commit listed, and no code from any repo was run.

## Decision

Install this combination: 7 skills from one repo, 2 skills from a second, and the official pmndrs plugin.

| Source | What to install | Why |
|---|---|---|
| **CloudAI-X/threejs-skills** @ `0e18186` (MIT) | 7 of 13: `threejs-fundamentals`, `threejs-geometry`, `threejs-materials`, `threejs-lighting`, `threejs-shaders`, `threejs-performance`, `threejs-react-three-fiber` | Best current three.js content. Rewritten for r186 on 2026-10-18/19. Markdown only. All 57 `three/addons/*` import paths it uses exist in r187. |
| **EnzeD/r3f-skills** @ `4a11805` (README says MIT, but there is no LICENSE file) | 2 of 11: `r3f-postprocessing`, `r3f-shaders` | Fills two R3F gaps that CloudAI-X leaves: `@react-three/postprocessing` (bloom for the hextech core) and drei `shaderMaterial` with `extend` on Fiber 9. Small: about 1.4k tokens each. |
| **pmndrs/claude-code-plugin** @ `9ec2934` (MIT, official Poimandres) | the whole plugin (`pmndrs:docs`, `pmndrs:examples`, plus the remote docs MCP server), **local scope** | Live official docs for r3f, drei and react-postprocessing, plus a gallery of 208 working demos (selective-bloom, flow-shield, instanced-particles-effects, svg-maps…). Covers version drift that no static skill can. |

Skip the other 6 CloudAI-X skills, the other 9 EnzeD skills, and every other candidate. The reasons are in §6 and §4.

**Prerequisite (most important design implication):** every recommended source targets **React 19 + @react-three/fiber 9 + drei 10**. This repo is on React 18.3, `@react-three/fiber ^8.17.10`, `@react-three/drei ^9.118.0` and `three ^0.171.0`. Upgrade first (§2), or the skills will produce v9-only code such as the async `gl` factory, `extend(Class)` returning a component, and `ThreeElement<typeof X>` types.

---

## 1. Latest versions (checked with `npm view` on 2026-11-09)

| Package | This repo | CloudAI-X target | EnzeD fixture | Latest |
|---|---|---|---|---|
| three | ^0.171.0 (2024-11-29) | 0.186.1 | 0.185.1 | **0.187.0** (2026-10-30) |
| @react-three/fiber | ^8.17.10 | 9.8.2 | 9.7.0 | **9.8.2** (2026-10-14); `alpha` tag 10.0.0-alpha.6 (2026-10-17) |
| @react-three/drei | ^9.118.0 | 10.7.9 | 10.7.8 | **10.7.9** |
| react / react-dom | ^18.3.1 | 19 | 19.2.8 | **19.3.1** |
| @react-three/postprocessing | not installed | n/a | 3.1.1 | **3.2.2** |
| postprocessing | not installed | n/a | 6.39.4 | **6.39.6** |
| react-three-fiber (legacy v6 package) | ^6.0.13, **never imported in `src/`** | n/a | n/a | remove it |

Peer constraints (npm): fiber 9.8.2 needs `react >=19 <19.4` and `three >=0.156`. drei 10.7.9 needs `react ^19`, `@react-three/fiber ^9.0.0` and `three >=0.159`. @react-three/postprocessing 3.2.2 needs `@react-three/fiber >=9.7.0`, `react ^19.0.0` and `postprocessing ^6.36.0`. Fiber 8.18.0 needs `react >=18 <19`. So React 18 locks you to fiber 8 and drei 9, and `@react-three/postprocessing` 3.2.2 will not install (I checked only that version's peers).

## 2. What changed between r171 and r187 (the yardstick used to grade skills)

Every row was checked against the three.js Migration Guide and, where marked, the r187 source.

| Change | Release | Effect at r187 |
|---|---|---|
| `RGBELoader` renamed `HDRLoader` | r180 | `RGBELoader.js` is a 268-byte shim that warns, "deprecated, r180" |
| `Timer` moved into core (`THREE.Timer`) | r179 | |
| `Clock` deprecated, use `Timer` | r183 | The `Clock` constructor warns. Fiber 9.8.2's store runs `new THREE.Clock()`, so **every Canvas logs one Clock warning**. That warning does not come from our code. |
| `PostProcessing` renamed `RenderPipeline` (WebGPU) | r183 | `three/webgpu` still exports both |
| `PCFSoftShadowMap` deprecated for WebGLRenderer | r182 | Fiber 9.8.2 maps `shadows` (true *or* false) to `PCFSoftShadowMap` and `'percentage'` to `PCFShadowMap`. Use `<Canvas shadows="percentage">`. |
| `PCFSoftShadowMap` removed for WebGPURenderer | r186 | |
| `SVGLoader.createShapes()` deprecated, use `shapePath.toShapes()` | r185 | PR #33503 moved the fill-rule-aware triangulation (nonzero/evenodd, from `userData.style.fillRule`) into `ShapePath.toShapes()`. **On r171 keep `SVGLoader.createShapes(path)`; on r185+ use `path.toShapes()`.** |
| `MeshPhysicalMaterial.iridescenceThicknessRange` deprecated, use `iridescenceThicknessMinimum/Maximum` | r187 | |
| Custom WebGPU lights: `renderer.library.addLight(Node, Light)` became `Light.registerNode(Node)` | r187 | |
| PMREMs built on cube render targets; `CubeUVReflectionMapping` removed | r187 | Environment reflections look slightly different |
| `TextGeometry` `height` renamed `depth`; WebGL 1 removed | r163 | |
| `physicallyCorrectLights` renamed `useLegacyLights=false` | r150 | Old property name does nothing |

Fiber v9 facts confirmed in the v9.8.2 source:
- `extend(Class)` returns `React.ExoticComponent<ThreeElement<T>>`, while `extend({...})` returns void (`extend.ts` L24–28).
- With `frameloop="never"`, `advance(timestamp)` expects **seconds**: `delta = timestamp - clock.elapsedTime` (`loop.ts` L64–68).

## 3. Candidates compared

Stars and dates come from the GitHub API on 2026-11-09. Installs are the counts skills.sh displays.

| Repo | Stars | Last commit | Licence | Skills | Executable / config parts | Target | Verdict |
|---|---|---|---|---|---|---|---|
| [CloudAI-X/threejs-skills](https://github.com/CloudAI-X/threejs-skills) | 4,105 (469 forks) | 2026-10-19 `0e18186` | MIT (LICENSE file) | 13 | **None.** 13 SKILL.md files, 239–500 lines (18–30 KB) | r186, fiber 9.8.2, drei 10.7.9 | **Install 7** |
| [pmndrs/claude-code-plugin](https://github.com/pmndrs/claude-code-plugin) | 6 | 2026-08-14 `9ec2934` | MIT | 2 + MCP | `.mcp.json` points to a remote HTTP MCP (`https://docs.pmnd.rs/api/mcp`). No hooks, no bin. | Live docs | **Install (local scope)** |
| [EnzeD/r3f-skills](https://github.com/EnzeD/r3f-skills) | 135 | 2026-08-31 `4a11805` | README says "MIT"; **no LICENSE file** (GitHub reports none) | 11 | None inside `skills/`. Repo-only dev tooling (`scripts/*.mjs` fetch from the npm registry; `evals/grade.mjs` runs `npx tsc`) is not installed. | r185, fiber 9.7.0, React 19.2.8 | **Install 2** |
| [emalorenzo/three-agent-skills](https://github.com/emalorenzo/three-agent-skills) | 68 | 2026-01-28 `f950f95` | README says MIT; no LICENSE file | 2 (+ `.zip` bundles) | None in the skill folders. The `.zip` files were not inspected. | r180–r183 | Skip: stale, broken refs |
| [mrgoonie/claudekit-skills](https://github.com/mrgoonie/claudekit-skills) (`threejs`) | 2,240 (whole collection) | 2026-04-03 `80113d8` | No LICENSE file (SKILL frontmatter says MIT) | 1 (+18 refs) | The plugin path `plugins/web-dev-tools/skills/threejs` is a **git symlink** (mode 120000) | Generic, pre-r180 patterns | Skip |
| [freshtechbro/claudedesignskills](https://github.com/freshtechbro/claudedesignskills) | 1,304 | 2025-11-20 `1da73fe` | MIT | `react-three-fiber`, `threejs-webgl` (in a big pack) | 3 Python generators that write files (no network or subprocess) | Starter pins fiber ^8.18.8, drei ^9.123, three ^0.172 | Skip |
| [secondsky/claude-skills](https://github.com/secondsky/claude-skills/tree/main/plugins/threejs) (`threejs`) | 248 | 2026-09-26 | MIT | 1 | Big pack (some other plugins have hooks) | "r160+ (January 2024)". Derived from the *old* CloudAI-X, and its references are 142–253-byte stubs | Skip |
| [mintdotgg/mint-threejs-skills](https://github.com/mintdotgg/mint-threejs-skills) | 126 | 2026-08-01 | MIT | 9 | `scripts/sync-mint-assets.mjs` (24 KB) and Python scaffolders; writes `mint-assets.json` | Vendor-coupled ("Mint MCP is the only generated-asset production pipeline") | Skip |
| [cesartevisual/threejs-skills](https://github.com/cesartevisual/threejs-skills) | 17 | 2026-09-10 (1 commit) | MIT | 24 | None | Version-agnostic, about 2 KB of principles per skill, no code | Skip: too thin |

Popularity (skills.sh): CloudAI-X has **202.9K** total installs across its 13 skills (e.g. animation 24.7K, react-three-fiber 4.8K). EnzeD has **24.2K**. emalorenzo has **3.2K**. skills.sh audits shown as "Pass" from Gen Agent Trust Hub, Socket and Snyk for `cloudai-x/…/threejs-react-three-fiber` and `enzed/…/r3f-postprocessing`. No findings are listed, so treat these as weak signals.

No three.js or R3F plugin exists in `claude-plugins-official` (317 plugins, local cache dated 2026-11-09), in `anthropics/claude-plugins-community` (2,283 plugins) or in `anthropics/skills`. pmndrs's plugin is the only first-party option. Mirrors of CloudAI-X also appear in aggregator repos such as the sickn33 "awesome skills" packs (UNVERIFIED which version they copied). Install from upstream instead.

## 4. Accuracy spot-checks

### CloudAI-X (raw SKILL.md read in full: `threejs-react-three-fiber`; sections read from `threejs-postprocessing`, `threejs-geometry`, `threejs-lighting`, `threejs-materials`)

- **r3f skill (488 lines):** every claim checked against fiber v9.8.2 source was correct:
  - shadow-type mapping (`configuration.ts` L276–285)
  - `state.clock` is a `THREE.Clock`, and its deprecation warning is attributed to fiber, not user code (`store.ts` L200 with r187 `Clock.js` L61)
  - `advance()` takes seconds under `frameloop="never"` (`loop.ts`)
  - `extend` registers addon classes
  - the TypeScript `threeLine`/`threePath` tags
  - tone mapping on by default, with `flat` giving NoToneMapping
  - the async `gl` factory for WebGPURenderer

  It also tags which drei helpers break under WebGPU: `Text`, `ContactShadows`, `Environment` with children on the WebGL2 fallback. The behaviour behind those tags was not verified.
- **Its "Common Mistakes" sections are the main value.** `new THREE.Clock()`/`getElapsedTime()` appear 9 times, all on the *wrong* side of a "wrong → right" pair. The same goes for `RGBELoader`, bare `shadows`, `examples/jsm` paths and `requestAnimationFrame` inside R3F.
- **postprocessing:** the WebGPU section uses `new THREE.RenderPipeline(renderer)`, `pass()`, `bloom()` from `three/addons/tsl/display/BloomNode.js`, and `renderPipeline.outputNode`. All of these exist in r187 (`Three.WebGPU.js` L15). The WebGL selective-bloom recipe is three's two-composer darken-material technique. That is correct, but it is **not** the idiomatic R3F route, which is why this skill is skipped in favour of EnzeD's `r3f-postprocessing`.
- **Import paths:** all 57 distinct `three/addons/...` paths across the 13 skills exist in r187 `examples/jsm/`.
- **Drift since r187 (the skills target r186):**
  - `threejs-materials` L168 still uses `iridescenceThicknessRange: [100, 400]`, deprecated in r187. This matters if the hextech core uses iridescence.
  - `threejs-lighting` L441 uses `renderer.library.addLight(SunLightNode, SunLight)`, changed in r187. WebGPU only and irrelevant here.
  - Expect more small drift with every monthly three.js release. The repo has no tags; the "Verification" claims in its README are author-stated.
- **Gaps:** no `@react-three/postprocessing`, no `SVGLoader`, no GSAP and no `prefers-reduced-motion`. `ExtrudeGeometry` gets a single generic example.

### EnzeD (raw SKILL.md read in full: `r3f-fundamentals`, `r3f-postprocessing`, `r3f-geometry`; first half of `r3f-shaders`)

- **Version discipline is explicit.** For example: "Inspect the project's manifest and lockfile before selecting APIs… Fiber 8 pairs with React 18. Do not upgrade a project just to match a recipe." It also excludes Fiber 10 alpha.
- **Checked against source:**
  - `extend(Class)` creates a locally typed component in Fiber 9 (`extend.ts` L24): correct.
  - "On r182+ use `shadows="percentage"`": correct.
  - "WebGPU uses node effects and `RenderPipeline` on r183+": correct.
- **`r3f-postprocessing` rules that apply directly to a glowing core:**
  - EffectComposer takes over rendering through a positive frame priority, so never add your own `gl.render`.
  - The composer disables renderer tone mapping, so put a `<ToneMapping>` effect last.
  - Bloom reads brightness *before* tone mapping, so drive glow with emissive/HDR values and `luminanceThreshold`.
  - `SelectiveBloom` needs `lights={[ref]}` and `<Selection>/<Select>`; plain `Bloom` ignores selection.
  - SSAO needs `enableNormalPass`.
- **Engineering:** the repo type-checks 18 TypeScript examples extracted from the Markdown and renders 11 of them in Chromium (Playwright) in CI (README). The CI was not run here.
- **Gaps:** no SVG; `Text3D` is only mentioned in passing; no GSAP.

### emalorenzo (skip)
- `r3f-best-practices` lists **68 rule IDs but ships 7 rule files**. Its "How to Use" points to `rules/state-zustand-selectors.md`, which does not exist (the file is `perf-zustand-selectors.md`), and to `../R3F_BEST_PRACTICES.md`, which lies *outside* the skill folder and is lost when the folder is copied. `three-best-practices` lists 139 rule IDs and ships 25 files.
- Stale APIs: `new THREE.Clock()` plus `getElapsedTime()` (`render-delta-time.md` L28/L70), `RGBELoader` (`lighting-shadows-advanced.md` L104), `new THREE.PostProcessing(renderer)` (`postprocessing-optimization.md` L119).

### mrgoonie `threejs` (skip)
- The Quick Start teaches `requestAnimationFrame` with `rotation.x += 0.01`, which is frame-rate dependent.
- Stale APIs: `renderer.physicallyCorrectLights` (renamed in r150), `PCFSoftShadowMap` as the default, `three/examples/jsm` paths, `RGBELoader`, `SVGLoader.createShapes`, `new THREE.Clock`.
- No R3F coverage.
- On this machine `git config core.symlinks` is `false`, so the plugin's symlinked skill folder would check out as a 31-byte text file. This was observed through the API blob, not tested with an install.

### freshtechbro (skip)
- `react-three-fiber/SKILL.md` is **1,079 lines**, against the "keep SKILL.md under 500 lines" guidance.
- It references `references/hooks_guide.md` and `references/drei_helpers.md`, which do not exist (only `api_reference.md` does).
- Its GSAP example uses `useEffect` instead of `useGSAP`, which the installed `gsap-react` skill prefers.
- The repo is a year old.

## 5. Safety review

**Method.** For every candidate I saved the text files under `scratchpad/dl/<owner>__<repo>/` through `gh api` and ran a read-only Python scanner (`python -I`) over them. Nothing was executed. The scanner flagged:
- SKILL.md frontmatter keys other than `name`/`description`, especially `allowed-tools`, `hooks`, `context`, `shell` and `model`
- `` !`cmd` `` shell injection, which runs when a skill renders and never prompts (per the Claude Code skills docs)
- HTML comments, invisible or bidi Unicode, base64 blobs
- `curl`/`wget`/`iwr`, `rm -rf`
- `settings.json`, `permissions`, `bypassPermissions`
- phrases like "ignore previous instructions" or "without telling the user"
- key/token assignments

**Results:**

| Source | Findings |
|---|---|
| CloudAI-X | **Clean.** Frontmatter is only `name` and `description`. No scripts, hooks, settings or injection phrasing. External URLs: `cdn.jsdelivr.net/npm/three` (import-map examples) and `cdn.example.com` placeholders. The `npx @gltf-transform/cli …` lines in `threejs-asset-pipeline` are documentation, and that skill is skipped anyway. |
| EnzeD | **Clean inside `skills/`.** Frontmatter is `name`/`description` only. The repo's `scripts/` and `evals/` (network and exec) are not part of installed skill folders. The only flag was a GitHub Actions `permissions:` block, which is benign. |
| pmndrs plugin | **Clean.** No hooks, `bin/` or `settings.json` at the plugin root. The repo's `.claude/settings.json` (`enabledPlugins: plugin-dev, skill-creator`) and `AGENTS.md`/`docs/agents/*` are maintainer files. According to the plugins reference they are not plugin components: only root `settings.json` is read, and only its `agent`/`subagentStatusLine` keys. **Network:** the plugin adds an always-connected remote MCP server, `docs.pmnd.rs/api/mcp`. It is unauthenticated and read-only; I probed it with `initialize`, `tools/list` and `resources/read` and it reported `serverInfo pmndrs-docs 4.31.0`. Its content is *not* version-pinned: the server operator can change what it returns at any time, so treat its output as data. Its manifest includes steering text such as "Call `search_docs` before answering… Do not answer from memory." That is benign. |
| emalorenzo | Skill folders are clean (extra frontmatter `license`/`metadata` only). `rm -rf` appears only in the repo's CLAUDE.md skill-authoring template, which is not installed. The `.zip` bundles were not reviewed. |
| mrgoonie | Clean text (extra frontmatter `license`/`version`). `.mcp.json.example` files are inactive. Symlink issue noted in §4. |
| freshtechbro | Clean text. The Python scripts only write the output file you pass them. |
| mintdotgg | Not line-reviewed (skipped). It ships executable `.mjs`/`.py` scripts and instructs a commercial remote pipeline, which is vendor steering rather than injection. |

**Residual risks and mitigations:**
1. **Copied skills** are inert Markdown. Pin to the reviewed SHAs, and read the diff before re-copying newer versions.
2. **The pmndrs plugin has no `version`,** so each commit on `main` counts as a new version. Third-party marketplaces have **auto-update off by default** (Claude Code docs), so nothing changes until you run `/plugin marketplace update pmndrs` and update. Check the repo's commits for new `hooks/`, `bin/`, `settings.json` or MCP entries first.
3. `npx skills` (vercel-labs/skills 1.7.6) is itself third-party code that you would run. It sends anonymous telemetry and audit requests unless `DISABLE_TELEMETRY=1` or `DO_NOT_TRACK=1` is set. On Windows it symlinks by default; use `--copy`. The manual `git` route below avoids all of this.

**Minor bug in the pmndrs skills:** they hardcode `mcp__pmndrs__get_page_content`. Plugin-provided servers are namespaced (this session shows the pattern `mcp__plugin_<plugin>_<server>__<tool>`), so the real name is probably `mcp__plugin_pmndrs_pmndrs__get_page_content` (UNVERIFIED until installed). The skills also predate the server's `search_docs` tool, the newly served `react-postprocessing` docs, and the gallery's growth from 167 to 208 demos. Claude adapts to such mismatches, but expect this lag.

## 6. Which skills to install and which to skip

**CloudAI-X: install these 7**
- `threejs-fundamentals`: renderer, tone mapping, color management, resize, disposal. The r3f skill builds on it.
- `threejs-geometry`: `ExtrudeGeometry`/`Shape` (for the logos), `Points`, `InstancedMesh`/`BatchedMesh` (particles), `BufferGeometry`.
- `threejs-materials`: PBR, physical (transmission, iridescence, clearcoat) for the hextech crystal and the gold metal logos. Watch the r187 iridescence rename noted in §2.
- `threejs-lighting`: environment/IBL, light units, PMREM. Gold metalness needs a good environment map.
- `threejs-shaders`: GLSL patterns (fresnel, displacement, dissolve) and the TSL port, for the core glow and rim.
- `threejs-performance`: draw calls, fill rate, DPR, compile stalls. The site has to run on phones.
- `threejs-react-three-fiber`: the main R3F reference.

**CloudAI-X: skip these 6**
- `threejs-animation`: AnimationMixer, skeletal and morph animation. Motion here is GSAP, and its trigger "Use when animating objects" competes with the `gsap-*` skills.
- `threejs-postprocessing`: vanilla EffectComposer plus the WebGPU RenderPipeline. In R3F use `@react-three/postprocessing` (EnzeD plus pmndrs docs). Add it back only if you move to WebGPU.
- `threejs-interaction`: vanilla raycasting and controls. R3F pointer events and drei controls are already covered by the r3f skill.
- `threejs-loaders` and `threejs-asset-pipeline`: no glTF is planned (logos are extruded SVG, the core is procedural). Add them the day a `.glb` arrives.
- `threejs-textures`: nothing texture-heavy is planned. Add it for KTX2, render targets or canvas textures.

**EnzeD: install these 2**
- `r3f-postprocessing`
- `r3f-shaders`

**EnzeD: skip the other 9.** `r3f-fundamentals`, `-geometry`, `-materials`, `-lighting`, `-textures`, `-loaders`, `-animation` and `-interaction` duplicate CloudAI-X and would double-trigger. `r3f-physics` is not needed. If you would rather not depend on a repo without a LICENSE file, drop EnzeD: pmndrs `get_example("selective-bloom")` plus the react-postprocessing docs cover most of `r3f-postprocessing`.

**pmndrs: install both skills.** Keep the plugin at **local scope**, so its MCP server is active only in this repo. `.claude/settings.local.json` is already git-ignored through the global ignore (`~/.config/git/ignore`).

## 7. Install commands

The commands are for Git Bash. Skills go in user scope (`~/.claude/skills`, currently empty) to match how GSAP is installed and to keep third-party files out of this public repo. Claude Code watches that folder, so the new skills load without a restart.

```bash
# 1) Pinned copies of 7 CloudAI-X skills + 2 EnzeD skills
SRC="$(mktemp -d)"
git clone --quiet https://github.com/CloudAI-X/threejs-skills.git "$SRC/threejs-skills"
git -C "$SRC/threejs-skills" checkout --quiet 0e181866f095b5f06d005133876e926515390d95
git clone --quiet https://github.com/EnzeD/r3f-skills.git "$SRC/r3f-skills"
git -C "$SRC/r3f-skills" checkout --quiet 4a11805f097396fb0b893172efd1e359e8051f92
mkdir -p ~/.claude/skills
for s in threejs-fundamentals threejs-geometry threejs-materials threejs-lighting \
         threejs-shaders threejs-performance threejs-react-three-fiber; do
  cp -r "$SRC/threejs-skills/skills/$s" ~/.claude/skills/
done
cp -r "$SRC/r3f-skills/skills/r3f-postprocessing" "$SRC/r3f-skills/skills/r3f-shaders" ~/.claude/skills/
ls ~/.claude/skills    # expect exactly 9 folders
```

PowerShell equivalent for the copy step: `'threejs-fundamentals','threejs-geometry','threejs-materials','threejs-lighting','threejs-shaders','threejs-performance','threejs-react-three-fiber' | % { Copy-Item -Recurse -Force "$src\threejs-skills\skills\$_" "$HOME\.claude\skills" }`. Use the same pattern for the two `r3f-*` folders. `-Recurse` keeps `r3f-shaders/references/webgpu.md`.

```text
# 2) Official pmndrs plugin, in a Claude Code session started in C:/Users/abdel/Desktop/projects/league
/plugin marketplace add pmndrs/claude-code-plugin
/plugin install pmndrs@pmndrs          # in the details pane choose "Install for you, in this repo only"
```

Shell alternative, run from the repo root: `claude plugin marketplace add pmndrs/claude-code-plugin` then `claude plugin install pmndrs@pmndrs --scope local`.

**Verify the install:**
- Type `/threejs-` and `/r3f-` and check that 9 skills are listed.
- `claude plugin details pmndrs@pmndrs` shows the always-on token cost.
- `/mcp` should show the pmndrs server connected.
- Ask "which three.js release do the threejs skills target?". The answer should come from the skill: r186.

**Alternative (CLI, not preferred):**

```powershell
$env:DISABLE_TELEMETRY='1'
npx -y skills@1.7.6 add CloudAI-X/threejs-skills -g -a claude-code --copy -y --skill threejs-fundamentals --skill threejs-geometry --skill threejs-materials --skill threejs-lighting --skill threejs-shaders --skill threejs-performance --skill threejs-react-three-fiber
```

Do the same for `EnzeD/r3f-skills` with `--skill r3f-postprocessing --skill r3f-shaders`. The CLI does not pin a commit: `owner/repo@ref` is documented for tags, and a SHA there is UNVERIFIED.

**Update:**
- Copied skills: `git -C <clone> fetch && git -C <clone> log --oneline 0e18186..origin/main`, read the diff, then re-copy.
- Plugin: `/plugin marketplace update pmndrs`, then Installed → Update now.

**Remove:**
- Delete the 9 folders from `~/.claude/skills`.
- `claude plugin uninstall pmndrs@pmndrs --scope local`
- `claude plugin marketplace remove pmndrs`

## 8. Context cost (body bytes ÷ 4 ≈ tokens, rough)

- **Always on:** about 2,350 characters of descriptions for the 9 skills (about 600 tokens), plus the 2 pmndrs skill descriptions and 3 MCP tools (`search_docs`, `get_page_content`, `get_example`).
- **CloudAI-X skill when loaded:** 22–30 KB, roughly 5.5–7.5k tokens. `threejs-react-three-fiber` is the largest at 29.9 KB (about 7.5k tokens).
- **EnzeD skill when loaded:** about 5.5–5.8 KB, roughly 1.4k tokens.
- **pmndrs pages:** 1.2k–4k tokens each. Examples have a median around 1.4k. `flow-shield` is about 23k: open it on purpose, never alongside another large one.
- **A typical "hextech core" turn** (r3f + shaders + performance + r3f-postprocessing + r3f-shaders) costs about 23k tokens. After compaction, Claude Code keeps the first 5k tokens of each invoked skill, within a 25k combined budget (skills docs).

## 9. Gaps no candidate covers (verified notes for the implementer)

These are the owner's explicit asks that no skill addresses. Put the essentials in a short project note (for example a 10-line section in the repo's CLAUDE.md) so the skills do not steer the work elsewhere.

**1. Framework logos as real 3D shapes** (owner idea 3). Use the SVG path, then `SVGLoader`, then `ExtrudeGeometry`.
- **Source SVGs:** Simple Icons (`simple-icons` 16.37.0, CC0-1.0 for the path data; brand trademarks still apply) ships single-path 24×24 SVGs for React, Angular, Spring and others.
- **Shapes:** r185+ `path.toShapes()`; r171 `SVGLoader.createShapes(path)` (§2).
- **Flip the y axis:** SVG is y-down, so use a negative `scale.y` on the mesh or group. WebGLRenderer picks the front face from the sign of the world matrix determinant (UNVERIFIED in source here; standard behaviour).
- **Center:** `geometry.center()` or drei `<Center>`.
- **ExtrudeGeometry defaults since r133:** `depth 1`, `bevelThickness 0.2`, `bevelSize = bevelThickness − 0.1`. In 24-unit SVG space, set them explicitly. Suggested start (my choice, not a fact): `depth 3`, `bevelThickness 0.4`, `bevelSize 0.3`, `bevelSegments 3`, `curveSegments 24`, then scale by about 1/24.
- **Rendering:** SVGLoader shapes need explicit `renderOrder` since r152.
- **Reference demo:** the pmndrs gallery has `svg-maps-with-html-annotations` (SVGLoader to per-path components). drei `<Svg>` renders flat shapes, not extrusions (UNVERIFIED).

**2. GSAP and R3F in one loop.** Neither the GSAP skills nor the three skills cover this.
- **Default:** keep `frameloop="always"` and let `useGSAP` tween refs (`mesh.position`, `material.uniforms.uX.value`). Have ScrollTrigger write into a ref that `useFrame` reads.
- **Under `frameloop="demand"`:** call `invalidate()` in `onUpdate`.
- **Single-rAF option:** `<Canvas frameloop="never">` plus `gsap.ticker.add((time) => advance(time))`. GSAP's ticker `time` is in seconds, and fiber's `advance` expects seconds (§2).

**3. Reduced motion.** No three or R3F skill mentions it. Use the installed `vectorlab-ux-skills:reduced-motion` skill. The R3F lever is `frameloop="demand"` plus one static frame, with particles and bloom pulses off.

**4. Bloom for the hextech core.** Use `@react-three/postprocessing` `Bloom` (`mipmapBlur`, `luminanceThreshold` near 1, emissive intensity > 1 on core materials) and a final `ToneMapping` effect. Cap `dpr={[1, 2]}`, since fill rate dominates (`threejs-performance`). Reference demos: `selective-bloom`, `instanced-particles-effects`, `sparks-and-effects`, `flow-shield`.

**5. Stay on WebGL.** CloudAI-X lists drei helpers that break under WebGPU (`Text`, `ContactShadows`, …). Fiber 10 (WebGPU-first, `pmndrs/react-three-examples`) is alpha and explicitly excluded by EnzeD.

## 10. Uncertainties

- Three things were not exercised in a live Claude Code session: the exact tool names the pmndrs plugin's MCP gets once installed, whether `skills@1.7.6` accepts a commit SHA, and the `/threejs-` listing.
- CloudAI-X's README claims (every JS block parses, rendering was measured) are author-stated. I verified a sample: the 57 import paths and 6 R3F claims.
- EnzeD's licence is ambiguous: the README says MIT but there is no LICENSE file. That is fine for personal use, but do not vendor it into this public repo.
- skills.sh install counts and "Pass" audits are third-party numbers with no published findings.
- The pmndrs MCP content can change server-side at any time and is not pinned by the plugin SHA.
- Both chosen sources trail three.js by one release. Expect more `iridescenceThicknessRange`-type drift with each monthly release; re-check the Migration Guide on upgrades.

## Sources

- CloudAI-X skills: https://github.com/CloudAI-X/threejs-skills (commit 0e181866f095b5f06d005133876e926515390d95; raw files under `skills/*/SKILL.md`), https://skills.sh/cloudai-x/threejs-skills, https://skills.sh/cloudai-x/threejs-skills/threejs-react-three-fiber
- pmndrs plugin: https://github.com/pmndrs/claude-code-plugin (9ec2934e40d3211730b980e4c148cedad4ec7465), https://pmndrs.github.io/docs/agents/introduction, MCP endpoint https://docs.pmnd.rs/api/mcp (probed 2026-11-09), https://github.com/pmndrs/examples
- EnzeD: https://github.com/EnzeD/r3f-skills (4a11805f097396fb0b893172efd1e359e8051f92), https://skills.sh/enzed/r3f-skills, https://skills.sh/enzed/r3f-skills/r3f-postprocessing
- Others: https://github.com/emalorenzo/three-agent-skills, https://skills.sh/emalorenzo/three-agent-skills, https://github.com/mrgoonie/claudekit-skills, https://github.com/freshtechbro/claudedesignskills, https://github.com/secondsky/claude-skills/tree/main/plugins/threejs, https://github.com/mintdotgg/mint-threejs-skills, https://github.com/cesartevisual/threejs-skills, https://github.com/full-stack-skills/threejs-skills, https://github.com/anthropics/claude-plugins-community, https://github.com/anthropics/claude-plugins-official
- three.js: https://github.com/mrdoob/three.js/wiki/Migration-Guide, https://github.com/mrdoob/three.js/pull/33503, r187 sources (`examples/jsm/loaders/RGBELoader.js`, `examples/jsm/loaders/SVGLoader.js`, `src/core/Clock.js`, `src/Three.WebGPU.js`, `src/extras/core/ShapePath.js`) at https://github.com/mrdoob/three.js/tree/r187, https://github.com/mrdoob/three.js/blob/r187/llms.txt, https://threejs.org/docs/llms.txt
- Fiber v9.8.2 sources: https://github.com/pmndrs/react-three-fiber/tree/v9.8.2/packages/fiber/src/core (`configuration.ts`, `store.ts`, `loop.ts`, `extend.ts`)
- npm registry (`npm view`): three, @react-three/fiber, @react-three/drei, @react-three/postprocessing, postprocessing, react, simple-icons, skills
- Claude Code docs: https://code.claude.com/docs/en/skills, https://code.claude.com/docs/en/plugins-reference, https://code.claude.com/docs/en/discover-plugins
- Skills CLI: https://github.com/vercel-labs/skills (README, docs/troubleshooting.md, docs/commands.md)
- GSAP ticker: https://gsap.com/docs/v3/GSAP/gsap.ticker/

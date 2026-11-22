/* GLSL for the hero core. Procedural only: no textures, no network.
   hash13 is Dave Hoskins' "Hash without Sine" (MIT); seg() is the usual point-to-segment distance.
   Every fragment shader ends with three's tone mapping and colour space chunks: no-ops while the composer
   renders into its linear target, NEUTRAL + sRGB when LOW draws straight to the canvas. */

const TAIL = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>`

const NOISE = /* glsl */ `
  float hash13(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
  float vnoise(vec3 x) {
    vec3 i = floor(x), f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash13(i), hash13(i + vec3(1, 0, 0)), f.x), mix(hash13(i + vec3(0, 1, 0)), hash13(i + vec3(1, 1, 0)), f.x), f.y),
               mix(mix(hash13(i + vec3(0, 0, 1)), hash13(i + vec3(1, 0, 1)), f.x), mix(hash13(i + vec3(0, 1, 1)), hash13(i + vec3(1, 1, 1)), f.x), f.y), f.z);
  }
  #ifndef OCTAVES
  #define OCTAVES 4
  #endif
  #ifndef WARP
  #define WARP 1
  #endif
  float fbm(vec3 p) {
    float a = 0.5, s = 0.0;
    for (int i = 0; i < OCTAVES; i++) { s += a * vnoise(p); p = p * 2.02 + 17.1; a *= 0.5; }
    return s;
  }`

/** View-space normal and view vector: every fresnel-style shader below starts from these. */
export const VIEW_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }`

/** Local xy position, for flat shaders drawn on planes and rings. */
export const PLANE_VERT = /* glsl */ `
  varying vec2 vP;
  void main() {
    vP = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`

/** Energy sphere: a slow fbm wobble, then domain-warped fbm folded into bright filaments. */
export const ENERGY_VERT = /* glsl */ `
  ${NOISE}
  uniform float uTime;
  varying vec3 vPos;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec3 p = position + normal * (fbm(position * 2.5 + uTime * 0.4) - 0.5) * 0.08;
    vPos = p;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }`

export const ENERGY_FRAG = /* glsl */ `
  ${NOISE}
  uniform float uTime;
  uniform float uIntensity;
  uniform float uVein;
  uniform vec3 uDeep;
  uniform vec3 uTeal;
  uniform vec3 uHot;
  varying vec3 vPos;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec3 p = vPos * 3.0;
    #if WARP == 3
    vec3 q = vec3(fbm(p + uTime * 0.15), fbm(p + 5.2), fbm(p - 3.7 + uTime * 0.1));
    #else
    vec3 q = vec3(fbm(p + uTime * 0.15));
    #endif
    float v = fbm(p + 2.0 * q);
    float vein = pow(1.0 - abs(2.0 * v - 1.0), 12.0); // fbm clusters near .5: a sharp ridge keeps the veins thin
    float facing = abs(dot(normalize(vN), normalize(vV)));
    vec3 col = mix(uDeep, uTeal, smoothstep(0.22, 0.75, v)) + uHot * vein * uVein + uTeal * pow(1.0 - facing, 2.0) * 1.5
      + uHot * pow(facing, 4.0) * 0.8; // hot heart: pushes the middle over the bloom threshold
    gl_FragColor = vec4(col * uIntensity, 1.0);
    ${TAIL}
  }`

/** Corona around the energy (drawn on back faces, additive): bright at the heart, gone before the silhouette. */
export const HALO_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uIntensity;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float d = abs(dot(normalize(vN), normalize(vV)));
    gl_FragColor = vec4(uColor * uIntensity, pow(smoothstep(0.0, 0.8, d), uPower) * 0.5);
    ${TAIL}
  }`

/** Cheap faceted glass: teal body that thickens towards the edges, a fresnel rim and one fixed key glint. */
export const GLASS_FRAG = /* glsl */ `
  uniform vec3 uTint;
  uniform vec3 uRim;
  uniform float uOpacity;
  uniform float uSpec;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec3 v = normalize(vV);
    vec3 n = normalize(vN) * (gl_FrontFacing ? 1.0 : -1.0);
    float facing = clamp(dot(n, v), 0.0, 1.0);
    float edge = pow(1.0 - facing, 3.0);
    float spec = pow(max(dot(reflect(-v, n), normalize(vec3(-0.45, 0.75, 0.5))), 0.0), 60.0); // flat facets light up whole: keep it a glint
    vec3 col = uTint * (0.3 + 0.7 * (1.0 - facing)) + uRim * edge + vec3(1.0, 0.96, 0.88) * spec * uSpec;
    gl_FragColor = vec4(col, clamp(uOpacity * (0.35 + 0.65 * edge) + spec * 0.2, 0.0, 1.0));
    ${TAIL}
  }`

/** Gold without an environment map: reflection against a studio gradient, a hot horizon band and a teal rim. */
export const GOLD_FRAG = /* glsl */ `
  uniform vec3 uGold;
  uniform vec3 uRimColor;
  uniform float uGlint;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec3 n = normalize(vN), v = normalize(vV);
    vec3 r = reflect(-v, n);
    float sky = smoothstep(-0.3, 0.9, r.y);
    float band = pow(max(0.0, 1.0 - abs(r.y - 0.3) * 2.4), 8.0);
    float rim = pow(1.0 - abs(dot(n, v)), 3.0);
    vec3 col = uGold * (0.1 + 0.9 * sky) + vec3(1.0, 0.92, 0.75) * band * uGlint + uRimColor * rim * 0.45;
    gl_FragColor = vec4(col, 1.0);
    ${TAIL}
  }`

/** Rune ring: 48 cells of procedural strokes (a stem plus hashed branches, bars and loops), two rim lines and
 *  a tick dial outside them. uProgress writes the glyphs on clockwise. */
export const RUNE_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vP;
  float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float seg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)); }
  const float CELLS = 48.0;
  const vec2 BAND = vec2(0.8, 0.9);
  void main() {
    float r = length(vP);
    float turn = atan(vP.y, vP.x) / 6.2831853 + 0.5;
    float ang = fract(turn + uTime * 0.008);
    float rr = (r - BAND.x) / (BAND.y - BAND.x);
    float cell = floor(ang * CELLS);
    vec2 lp = vec2(fract(ang * CELLS), rr);
    lp.x = (lp.x - 0.5) * (6.2831853 * r / CELLS) / (BAND.y - BAND.x) + 0.5; // undo the polar stretch
    float k = h21(vec2(cell, 7.0));
    float d = seg(lp, vec2(0.5, 0.15), vec2(0.5, 0.85));
    if (fract(k * 3.1) > 0.4) d = min(d, seg(lp, vec2(0.5, 0.85), vec2(0.78, 0.6)));
    if (fract(k * 7.7) > 0.5) d = min(d, seg(lp, vec2(0.5, 0.5), vec2(0.22, 0.28)));
    if (fract(k * 13.3) > 0.6) d = min(d, seg(lp, vec2(0.3, 0.62), vec2(0.7, 0.62)));
    if (fract(k * 21.7) > 0.7) d = min(d, abs(length(lp - vec2(0.5, 0.32)) - 0.12));
    float aa = fwidth(d);
    float glyph = (1.0 - smoothstep(0.055 - aa, 0.055 + aa, d)) * step(0.0, rr) * step(rr, 1.0) * step(mod(cell, 9.0), 7.5);
    float lw = fwidth(r) * 1.2;
    float rims = (1.0 - smoothstep(0.0, lw, abs(r - BAND.x + 0.012))) + (1.0 - smoothstep(0.0, lw, abs(r - BAND.y - 0.012)));
    float ta = fract(turn - uTime * 0.004) * 180.0;
    float tw = fwidth(ta) * 1.5;
    float tick = smoothstep(0.62 - tw, 0.62 + tw, abs(fract(ta) - 0.5) * 2.0);
    float major = step(0.93, abs(fract(ta / 15.0) - 0.5) * 2.0);
    float dial = tick * smoothstep(0.935, 0.94, r) * (1.0 - smoothstep(mix(0.965, 0.985, major) - 0.004, mix(0.965, 0.985, major), r));
    float a = glyph * step(cell / CELLS, uProgress) + (rims + dial * 0.5) * smoothstep(0.0, 0.25, uProgress);
    gl_FragColor = vec4(uColor * uIntensity, clamp(a, 0.0, 1.0));
    ${TAIL}
  }`

/** Ambient motes: stateless rise with wrap-around plus an analytic curl drift; no CPU work per frame. */
export const MOTES_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform vec3 uBox;
  attribute float aSeed;
  attribute float aKind;
  varying float vAlpha;
  varying float vKind;
  vec3 curl(vec3 p, float t) {
    vec3 a = vec3(1.3, 2.1, 0.7) * t;
    return vec3(cos(p.y + a.z) * cos(p.x) + sin(p.x + a.y) * sin(p.z),
                cos(p.z + a.x) * cos(p.y) + sin(p.y + a.z) * sin(p.x),
                cos(p.x + a.y) * cos(p.z) + sin(p.z + a.x) * sin(p.y));
  }
  void main() {
    vec3 p = position;
    float h = uBox.y;
    p.y = mod(p.y + uTime * (0.05 + 0.1 * aSeed) + h * 0.5, h) - h * 0.5;
    vec3 q = p * 0.6;
    p += 0.35 * curl(q, uTime * 0.12) + 0.15 * curl(q * 2.1 + 4.0, uTime * 0.2);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.4 + aSeed) * uPixelRatio / -mv.z;
    vAlpha = (1.0 - smoothstep(0.35, 0.5, abs(p.y / h))) * (0.5 + 0.5 * sin(uTime * (1.0 + 2.0 * aSeed) + aSeed * 40.0));
    vKind = aKind;
  }`

export const MOTES_FRAG = /* glsl */ `
  uniform vec3 uTeal;
  uniform vec3 uGold;
  uniform float uIntensity;
  varying float vAlpha;
  varying float vKind;
  void main() {
    float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
    gl_FragColor = vec4(mix(uGold, uTeal, vKind) * uIntensity, a * a * vAlpha);
    ${TAIL}
  }`

/** Six-ray star and a thin horizontal streak at the crystal's heart (drawn in-scene, so LOW gets it too). */
export const FLARE_FRAG = /* glsl */ `
  uniform float uIntensity;
  uniform float uTime;
  uniform float uLow;
  uniform vec3 uColor;
  varying vec2 vP;
  void main() {
    float r = length(vP), a = atan(vP.y, vP.x);
    float star = pow(abs(cos(a * 3.0 + uTime * 0.05)), 110.0) + 0.4 * pow(abs(cos(a * 3.0 + 0.5236 - uTime * 0.03)), 220.0);
    star *= smoothstep(0.17, 0.34, r) * exp(-r * 3.2);
    float streak = exp(-abs(vP.y) * 150.0) * exp(-abs(vP.x) * 1.5) * smoothstep(0.12, 0.34, abs(vP.x));
    float glow = exp(-r * r * 7.0) * smoothstep(0.1, 0.3, r) * (0.06 + 0.7 * uLow); // LOW has no bloom: this stands in
    float heart = exp(-r * r * 60.0) * 0.5;
    gl_FragColor = vec4(uColor * (star * 0.85 + streak * 1.1 + glow + heart) * uIntensity, 1.0);
    ${TAIL}
  }`

/** Soft teal atmosphere behind the core, kept under the bloom threshold. */
export const HAZE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vP;
  void main() {
    gl_FragColor = vec4(uColor, pow(max(0.0, 1.0 - length(vP) / 5.5), 3.0) * uIntensity);
    ${TAIL}
  }`

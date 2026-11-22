/** Hero choreography values. The hero (main chunk) tweens them with GSAP; the core scene (lazy 3D chunk)
 *  reads them every frame. Plain numbers and no three.js import, so the hero never pulls in the 3D chunk. */
export const heroRig = {
  /** 0 at rest, 1 once the hero has scrolled out: the core pulls back and dims. */
  pull: 0,
  /** Entrance: 0 dark and small (under the loader), 1 settled. */
  intro: 1,
  /** Energy flash on top of the settled glow, 0..1 (the "accept" beat). */
  flash: 0,
}

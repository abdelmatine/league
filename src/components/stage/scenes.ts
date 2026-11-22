import type { ComponentType } from 'react'
import { HomeScene } from './HomeScene'
import { StackScene } from './stack/StackScene'

export interface SceneProps {
  /** The DOM element the scene sits on (registered with useStageScene). */
  anchor: HTMLElement
}

/** Scene components by stageStore id. A section registers its anchor; the stage draws the match here. */
export const SCENES: Record<string, ComponentType<SceneProps>> = {
  home: HomeScene,
  stack: StackScene,
}

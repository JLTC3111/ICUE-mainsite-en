import { shouldAvoidCanvasEffects } from '../../../shared/browser/visualEffectsPolicy.js'

export { shouldAvoidCanvasEffects }

/** @returns {'none' | 'css' | 'webgl'} */
export function getGridScanRenderer(effectsTier, environment) {
  if (effectsTier === 'none') return 'none'
  if (effectsTier !== 'full' || shouldAvoidCanvasEffects(environment)) return 'css'
  return 'webgl'
}

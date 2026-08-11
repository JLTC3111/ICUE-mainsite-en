import { lazy, Suspense, useEffect } from 'react'
import { useHomeGridScanVisible } from '../hooks/useHomeGridScanVisible'
import { useVisualEffectsTier } from '../hooks/useHeavyVisualEffects'

const GridScan = lazy(() =>
  import('./reactbits/GridScan').then((module) => ({ default: module.GridScan })),
)

export default function HomeHeroGridScan() {
  const visible = useHomeGridScanVisible()
  // Phones and other coarse-pointer devices get no grid at all. It is a
  // full-viewport raymarched shader whose only input on those devices is the
  // gyro, which is off here — all cost, no interaction. Everything else on the
  // home page already degrades through this same tier.
  const tier = useVisualEffectsTier()

  const enabled = visible && tier === 'full'

  useEffect(() => {
    if (!enabled) return undefined
    document.documentElement.setAttribute('data-home-hero-grid-scan', 'on')
    return () => document.documentElement.removeAttribute('data-home-hero-grid-scan')
  }, [enabled])

  if (!enabled) return null

  return (
    <Suspense fallback={null}>
      <GridScan
        className="home-hero__grid-scan"
        linesColor="#2f293a"
        scanColor="#9fb9ff"
        lineThickness={1}
        gridScale={0.09}
        lineJitter={0.1}
        scanGlow={0.4}
        scanSoftness={3.2}
        chromaticAberration={0.002}
        noiseIntensity={0.01}
        // A soft grid gains almost nothing from a 2x backing store and costs
        // four times the fragments for it; 1.25 keeps the lines crisp on
        // Retina at well under half the pixel throughput.
        maxPixelRatio={1.25}
        // The scan is a 4s cycle and the parallax is heavily damped. Neither
        // reads any differently at 30fps, which halves the frame count.
        maxFps={30}
        enablePost
      />
    </Suspense>
  )
}

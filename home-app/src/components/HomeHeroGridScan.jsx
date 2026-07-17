import { lazy, Suspense, useEffect } from 'react'
import { useHomeGridScanVisible } from '../hooks/useHomeGridScanVisible'

const GridScan = lazy(() =>
  import('./reactbits/GridScan').then((module) => ({ default: module.GridScan })),
)

export default function HomeHeroGridScan() {
  const visible = useHomeGridScanVisible()

  useEffect(() => {
    if (!visible) return undefined
    document.documentElement.setAttribute('data-home-hero-grid-scan', 'on')
    return () => document.documentElement.removeAttribute('data-home-hero-grid-scan')
  }, [visible])

  if (!visible) return null

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
        enablePost
      />
    </Suspense>
  )
}

import { useEffect, useState } from 'react'
import { useHomeGridScanVisible } from '../hooks/useHomeGridScanVisible'
import { useVisualEffectsTier } from '../hooks/useHeavyVisualEffects'
import { getGridScanRenderer } from '../lib/gridScanPolicy'

let gridScanModulePromise

function loadGridScan() {
  if (!gridScanModulePromise) {
    gridScanModulePromise = import('./reactbits/GridScan')
      .catch((error) => {
        // Let a later retry make a fresh request after a transient failure.
        gridScanModulePromise = undefined
        throw error
      })
  }
  return gridScanModulePromise
}

export default function HomeHeroGridScan() {
  const visible = useHomeGridScanVisible()
  const tier = useVisualEffectsTier()
  const [GridScan, setGridScan] = useState(null)

  const preferredRenderer = getGridScanRenderer(tier)
  const enabled = visible && preferredRenderer !== 'none'
  const webglEnabled = enabled && preferredRenderer === 'webgl'
  // Show the lightweight scan immediately while the desktop WebGL chunk loads.
  // On mobile, Gecko, Mullvad/Tor-like browsers, and GPC-enabled browsers this
  // remains the final renderer and no canvas context is requested at all.
  const activeRenderer = webglEnabled && GridScan ? 'webgl' : 'css'

  useEffect(() => {
    if (preferredRenderer !== 'webgl' || visible) return undefined

    // The canvas is shown when the hero video is switched off. Warm its large
    // WebGL chunk after the initial page paint so that toggle does not have to
    // wait for Three.js and the shader module before it can draw a first frame.
    const preload = () => void loadGridScan().catch(() => {})
    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(preload, { timeout: 2000 })
      return () => window.cancelIdleCallback?.(idleId)
    }

    const timerId = window.setTimeout(preload, 250)
    return () => window.clearTimeout(timerId)
  }, [preferredRenderer, visible])

  useEffect(() => {
    if (!webglEnabled || GridScan) return undefined

    let cancelled = false
    let retryTimer = null
    let attempts = 0

    const load = () => {
      attempts += 1
      void loadGridScan()
        .then((module) => {
          if (!cancelled) setGridScan(() => module.GridScan)
        })
        .catch(() => {
          if (!cancelled && attempts < 3) {
            retryTimer = window.setTimeout(load, attempts * 750)
          }
        })
    }

    load()
    return () => {
      cancelled = true
      if (retryTimer != null) window.clearTimeout(retryTimer)
    }
  }, [webglEnabled, GridScan])

  useEffect(() => {
    if (!enabled) return undefined
    document.documentElement.setAttribute('data-home-hero-grid-scan', 'on')
    document.documentElement.setAttribute('data-home-hero-grid-scan-renderer', activeRenderer)
    return () => {
      document.documentElement.removeAttribute('data-home-hero-grid-scan')
      document.documentElement.removeAttribute('data-home-hero-grid-scan-renderer')
    }
  }, [activeRenderer, enabled])

  if (!enabled) return null

  if (activeRenderer === 'css') {
    return (
      <div
        className="home-hero__grid-scan home-hero__grid-scan--fallback"
        data-gridscan-renderer="css"
        aria-hidden="true"
      />
    )
  }

  return (
    <GridScan
      className="home-hero__grid-scan"
      linesColor="#2f293a"
      scanColor="#9fb9ff"
      lineThickness={1}
      gridScale={0.09}
      lineJitter={0.1}
      scanGlow={0.4}
      scanSoftness={3.2}
      noiseIntensity={0.01}
      // A soft grid gains almost nothing from a 2x backing store and costs
      // four times the fragments for it; 1.25 keeps the lines crisp on
      // Retina at well under half the pixel throughput.
      maxPixelRatio={1.25}
      // The scan is a 4s cycle and the parallax is heavily damped. Neither
      // reads any differently at 30fps, which halves the frame count.
      maxFps={30}
    />
  )
}

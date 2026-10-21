import { useEffect, useRef, useState } from 'react'
import { useHomeGridScanVisible } from '../hooks/useHomeGridScanVisible'
import { useVisualEffectsTier } from '../hooks/useHeavyVisualEffects'
import { useHomeTheme } from '../hooks/useHomeTheme.js'
import { getGridScanRenderer } from '../lib/gridScanPolicy'
import { createRetryableLoader } from '../../../shared/resilience/requests.js'
import { useResumeRevision } from '../../../shared/resilience/usePageResume.js'
import ErrorBoundary from './ErrorBoundary'

const loadGridScan = createRetryableLoader(() => import('./reactbits/GridScan'))

function CssGridFrame({ animated }) {
  const ref = useRef(null)
  const [ping, setPing] = useState(null)

  useEffect(() => {
    if (!animated) return undefined
    const onPointerDown = (event) => {
      if (event.button !== 0) return
      if (event.target?.closest?.('a, button, input, textarea, select, [role="button"], [role="menu"]')) return
      const rect = ref.current?.getBoundingClientRect()
      if (!rect || event.clientX < rect.left || event.clientX > rect.right
        || event.clientY < rect.top || event.clientY > rect.bottom) return
      setPing({ x: event.clientX - rect.left, y: event.clientY - rect.top, id: event.timeStamp })
    }
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [animated])

  return (
    <div
      ref={ref}
      className="home-hero__grid-scan home-hero__grid-scan--fallback"
      data-gridscan-renderer="css"
      data-gridscan-animated={animated ? 'true' : 'false'}
      aria-hidden="true"
    >
      {animated && ping && (
        <span
          key={ping.id}
          className="home-hero__grid-ping"
          style={{ left: ping.x, top: ping.y }}
          onAnimationEnd={() => setPing(null)}
        />
      )}
    </div>
  )
}

export default function HomeHeroGridScan({ active = false }) {
  const visible = useHomeGridScanVisible()
  const tier = useVisualEffectsTier()
  const [theme] = useHomeTheme()
  const lightMode = theme === 'light'
  const [GridScan, setGridScan] = useState(null)

  const preferredRenderer = getGridScanRenderer(tier)
  const enabled = visible
  const animated = active && tier !== 'none'
  const webglEnabled = enabled && animated && preferredRenderer === 'webgl'
  const fallback = <CssGridFrame animated={animated} />
  const [resumeRevision] = useResumeRevision({ enabled: webglEnabled && !GridScan, minHiddenMs: 0 })
  // Show the lightweight scan immediately while the desktop WebGL chunk loads.
  // On mobile, Gecko, Mullvad/Tor-like browsers, and GPC-enabled browsers this
  // remains the final renderer and no canvas context is requested at all.
  const activeRenderer = webglEnabled && GridScan ? 'webgl' : 'css'

  useEffect(() => {
    if (!animated || preferredRenderer !== 'webgl' || visible) return undefined

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
  }, [animated, preferredRenderer, visible])

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
  }, [webglEnabled, GridScan, resumeRevision])

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

  if (activeRenderer === 'css') return fallback

  return (
    <ErrorBoundary fallback={fallback}>
      <GridScan
        className="home-hero__grid-scan"
        lightMode={lightMode}
        linesColor={lightMode ? '#b2bfce' : '#4d4757'}
        scanColor={lightMode ? '#0284c7' : '#7dd3fc'}
        cells={8}
        depth={3}
        scanDuration={2.4}
        scanDelay={1.6}
        clickEffect="ping"
        // A soft grid gains almost nothing from a 2x backing store and costs
        // four times the fragments for it; 1.25 keeps the lines crisp on
        // Retina at well under half the pixel throughput.
        maxPixelRatio={1.25}
        // Limit background drawing to 30fps while leaving UI interactions free.
        maxFps={30}
      />
    </ErrorBoundary>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BACKGROUND_SAMPLE_SIZE,
  bindBackgroundVideoSampling,
  captureBackgroundSampleCanvas,
} from './backgroundSampling.js'

const FALLBACK_COLOR = '#ffffff'
const DARK_COLOR = '#0a1a3a'

function relativeLuminance([red, green, blue]) {
  const channels = [red, green, blue].map((value) => {
    const channel = Math.max(0, Math.min(255, Number(value))) / 255
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4
  })
  return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2])
}

function contrastRatio(first, second) {
  const lighter = Math.max(first, second)
  const darker = Math.min(first, second)
  return (lighter + 0.05) / (darker + 0.05)
}

function pickBarColor(rgb) {
  if (!Array.isArray(rgb) || rgb.length < 3) return FALLBACK_COLOR

  const backgroundLuminance = relativeLuminance(rgb)
  const whiteContrast = contrastRatio(backgroundLuminance, 1)
  const darkContrast = contrastRatio(backgroundLuminance, relativeLuminance([10, 26, 58]))

  if (whiteContrast >= darkContrast && whiteContrast >= 3) return FALLBACK_COLOR
  if (darkContrast >= 3) return DARK_COLOR

  return backgroundLuminance > 0.58 ? DARK_COLOR : FALLBACK_COLOR
}

function averageCanvasRgb(canvas) {
  const ctx = canvas?.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  try {
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let red = 0
    let green = 0
    let blue = 0
    let weight = 0

    for (let index = 0; index < data.length; index += 4) {
      const alpha = data[index + 3] / 255
      if (alpha <= 0.02) continue
      red += data[index] * alpha
      green += data[index + 1] * alpha
      blue += data[index + 2] * alpha
      weight += alpha
    }

    return weight > 0 ? [red / weight, green / weight, blue / weight] : null
  } catch {
    return null
  }
}

function extractBarColorFromCanvas(canvas, rgbHint = null) {
  if (rgbHint) return pickBarColor(rgbHint)
  if (!canvas) return FALLBACK_COLOR
  return pickBarColor(averageCanvasRgb(canvas))
}

function resolveMusicBarColor(musicEl) {
  if (!musicEl) return FALLBACK_COLOR

  const { canvas, rgbHint } = captureBackgroundSampleCanvas(musicEl, BACKGROUND_SAMPLE_SIZE)
  return extractBarColorFromCanvas(canvas, rgbHint)
}

export function useMusicBarColor(barRef, enabled = true, contentKey = '') {
  const [color, setColor] = useState(FALLBACK_COLOR)
  const samplingRef = useRef(false)

  const sample = useCallback(() => {
    if (!enabled || document.hidden) return
    const el = barRef.current
    if (!el || samplingRef.current) return

    samplingRef.current = true
    try {
      const nextColor = resolveMusicBarColor(el)
      setColor((prev) => (prev === nextColor ? prev : nextColor))
    } finally {
      samplingRef.current = false
    }
  }, [barRef, contentKey, enabled])

  useEffect(() => {
    if (!enabled) return undefined

    let debounceId = null
    let frameTimerId = null
    let lastFrameSampleAt = 0
    const scheduleSample = () => {
      if (debounceId) window.clearTimeout(debounceId)
      debounceId = window.setTimeout(() => {
        sample()
      }, 64)
    }
    const scheduleFrameSample = () => {
      const now = performance.now()
      const remaining = 250 - (now - lastFrameSampleAt)
      if (remaining <= 0) {
        lastFrameSampleAt = now
        sample()
        return
      }
      if (frameTimerId) return
      frameTimerId = window.setTimeout(() => {
        frameTimerId = null
        lastFrameSampleAt = performance.now()
        sample()
      }, remaining)
    }

    sample()

    window.addEventListener('scroll', scheduleSample, { passive: true, capture: true })
    window.addEventListener('resize', scheduleSample)
    window.addEventListener('icue:legacy-page-ready', scheduleSample)
    window.addEventListener('icue:aboutUsVideoEnabled', scheduleSample)
    window.addEventListener('icue:homeVideoEnabled', scheduleSample)

    const viewport = window.visualViewport
    viewport?.addEventListener('resize', scheduleSample)
    viewport?.addEventListener('scroll', scheduleSample)

    const content = document.getElementById('content')
    const observer = content
      ? new MutationObserver(scheduleSample)
      : null
    observer?.observe(content, {
      childList: true,
      subtree: true,
    })

    const rootObserver = new MutationObserver(scheduleSample)
    rootObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-home-bg-video', 'data-aboutus-bg-video'],
    })

    const unbindVideos = bindBackgroundVideoSampling(scheduleFrameSample)
    const id = window.setInterval(sample, 2500)

    return () => {
      if (debounceId) window.clearTimeout(debounceId)
      if (frameTimerId) window.clearTimeout(frameTimerId)
      window.removeEventListener('scroll', scheduleSample, true)
      window.removeEventListener('resize', scheduleSample)
      window.removeEventListener('icue:legacy-page-ready', scheduleSample)
      window.removeEventListener('icue:aboutUsVideoEnabled', scheduleSample)
      window.removeEventListener('icue:homeVideoEnabled', scheduleSample)
      viewport?.removeEventListener('resize', scheduleSample)
      viewport?.removeEventListener('scroll', scheduleSample)
      observer?.disconnect()
      rootObserver.disconnect()
      unbindVideos()
      window.clearInterval(id)
    }
  }, [contentKey, enabled, sample])

  return color
}

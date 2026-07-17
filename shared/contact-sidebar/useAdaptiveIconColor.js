import { useCallback, useEffect, useState } from 'react'

const COLOR_PROBE = typeof document !== 'undefined' ? document.createElement('span') : null
const OPAQUE_ALPHA = 0.72
const BACKGROUND_LAYER_SELECTOR = [
  '[data-adaptive-bg-layer]',
  '.home-hero__grid-scan',
].join(', ')
const SECTION_MEDIA_SELECTOR = '.home-hero__media, .about-container'

function parseColor(color) {
  if (!color || color === 'transparent') return null

  const rgba = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i)
  if (rgba) {
    const alpha = rgba[4] !== undefined ? Number(rgba[4]) : 1
    if (alpha <= 0.04 || alpha < OPAQUE_ALPHA) return null
    return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3])]
  }

  if (!COLOR_PROBE) return null
  COLOR_PROBE.style.color = ''
  COLOR_PROBE.style.color = color
  const resolved = getComputedStyle(COLOR_PROBE).color
  return parseColor(resolved)
}

function luminance([r, g, b]) {
  const channel = (c) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function averageRgb(samples) {
  if (!samples.length) return null
  const total = samples.reduce(
    (acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b],
    [0, 0, 0],
  )
  return total.map((value) => value / samples.length)
}

function parseGradientColors(backgroundImage) {
  if (!backgroundImage || backgroundImage === 'none') return null
  const matches = backgroundImage.match(/#[0-9a-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)/gi)
  if (!matches?.length) return null
  const colors = matches.map(parseColor).filter(Boolean)
  return averageRgb(colors)
}

function readGridScanAtPoint(mediaRoot, x, y) {
  if (!(mediaRoot instanceof Element)) return null

  const gridScan = mediaRoot.querySelector('.home-hero__grid-scan canvas')
  if (!(gridScan instanceof HTMLCanvasElement) || !isMediaVisible(gridScan)) return null

  const rect = gridScan.getBoundingClientRect()
  if (!pointInside(rect, x, y)) return null

  return sampleBitmapAt(gridScan, rect, x, y)
}

function pointInside(rect, x, y) {
  if (!rect || rect.width <= 0 || rect.height <= 0) return false
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
}

function readPseudoBackground(el, pseudo) {
  if (!(el instanceof Element)) return null
  const style = getComputedStyle(el, pseudo)
  const solid = parseColor(style.backgroundColor)
  if (solid) return solid
  return parseGradientColors(style.backgroundImage)
}

function readElementSurface(el) {
  if (!(el instanceof Element)) return null
  const style = getComputedStyle(el)
  const solid = parseColor(style.backgroundColor)
  if (solid) return solid
  return parseGradientColors(style.backgroundImage)
}

function readBackground(el) {
  let node = el
  while (node && node !== document.documentElement) {
    if (node.classList?.contains('contact-sidebar')) {
      node = node.parentElement
      continue
    }

    const surface = readElementSurface(node)
    if (surface) return surface

    const beforeBg = readPseudoBackground(node, '::before')
    if (beforeBg) return beforeBg

    const afterBg = readPseudoBackground(node, '::after')
    if (afterBg) return afterBg

    node = node.parentElement
  }

  return parseColor(getComputedStyle(document.body).backgroundColor) ?? [255, 255, 255]
}

let sampleCanvas = null

function getSampleContext() {
  if (typeof document === 'undefined') return null
  if (!sampleCanvas) {
    sampleCanvas = document.createElement('canvas')
    sampleCanvas.width = 6
    sampleCanvas.height = 6
  }
  return sampleCanvas.getContext('2d', { willReadFrequently: true })
}

function averageImageData(data) {
  let r = 0
  let g = 0
  let b = 0
  let count = 0

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 12) continue
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
    count += 1
  }

  return count ? [r / count, g / count, b / count] : null
}

function mapCoverPointToSource(video, x, y) {
  const rect = video.getBoundingClientRect()
  const vw = video.videoWidth
  const vh = video.videoHeight
  if (!vw || !vh) return null

  const fullViewport = coversViewport(rect)
  const boxWidth = fullViewport ? window.innerWidth : rect.width
  const boxHeight = fullViewport ? window.innerHeight : rect.height
  const boxLeft = fullViewport ? 0 : rect.left
  const boxTop = fullViewport ? 0 : rect.top

  if (boxWidth <= 0 || boxHeight <= 0) return null

  const nx = (x - boxLeft) / boxWidth
  const ny = (y - boxTop) / boxHeight
  if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return null

  const elementAR = boxWidth / boxHeight
  const videoAR = vw / vh
  let sx
  let sy
  let sw
  let sh

  if (videoAR > elementAR) {
    sh = vh
    sw = vh * elementAR
    sx = (vw - sw) / 2
    sy = 0
  } else {
    sw = vw
    sh = vw / elementAR
    sx = 0
    sy = (vh - sh) / 2
  }

  return {
    px: sx + nx * sw,
    py: sy + ny * sh,
  }
}

function sampleBitmapAt(bitmap, rect, x, y) {
  const ctx = getSampleContext()
  if (!ctx || !bitmap || rect.width <= 0 || rect.height <= 0) return null

  try {
    let px
    let py

    if (bitmap instanceof HTMLVideoElement) {
      if (bitmap.readyState < 2) return null
      const mapped = mapCoverPointToSource(bitmap, x, y)
      if (!mapped) return null
      px = mapped.px
      py = mapped.py
    } else {
      px = ((x - rect.left) / rect.width) * (bitmap.width || rect.width)
      py = ((y - rect.top) / rect.height) * (bitmap.height || rect.height)
    }

    ctx.clearRect(0, 0, 6, 6)
    ctx.drawImage(bitmap, px - 3, py - 3, 6, 6, 0, 0, 6, 6)
    return averageImageData(ctx.getImageData(0, 0, 6, 6).data)
  } catch {
    return null
  }
}

function isMediaVisible(el) {
  if (!(el instanceof Element)) return false
  const style = getComputedStyle(el)
  if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
    return false
  }
  const rect = el.getBoundingClientRect()
  return rect.width > 1 && rect.height > 1
}

function isBackgroundVideo(video) {
  if (!(video instanceof HTMLVideoElement)) return false
  if (video.closest('.home-hero__title, .home-hero__title-fill, .home-hero__title-stack')) {
    return false
  }
  return (
    video.classList.contains('video-bg') ||
    video.id === 'bgVideo' ||
    !!video.closest('.about-container')
  )
}

function getBackgroundVideos() {
  const seen = new Set()
  const videos = []

  document.querySelectorAll('video.video-bg, video#bgVideo, .about-container video').forEach((node) => {
    if (!(node instanceof HTMLVideoElement) || seen.has(node) || !isBackgroundVideo(node)) return
    seen.add(node)
    videos.push(node)
  })

  return videos
}

function coversViewport(rect) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  return rect.width >= vw * 0.75 && rect.height >= vh * 0.75
}

function sampleVideoAtPoint(video, x, y) {
  if (!isMediaVisible(video)) return null
  const rect = video.getBoundingClientRect()
  const region = video.closest(SECTION_MEDIA_SELECTOR) || video.closest('.about-container')
  const regionRect = region?.getBoundingClientRect?.() ?? rect
  const inRegion =
    pointInside(regionRect, x, y) ||
    pointInside(rect, x, y) ||
    coversViewport(rect)
  if (!inRegion) return null
  return sampleBitmapAt(video, rect, x, y)
}

function readMarkedLayers(root) {
  if (!(root instanceof Element)) return null
  const layers = [...root.querySelectorAll(BACKGROUND_LAYER_SELECTOR)]
  for (let index = layers.length - 1; index >= 0; index -= 1) {
    const layer = layers[index]
    if (!isMediaVisible(layer)) continue
    const surface = readElementSurface(layer)
    if (surface) return surface
  }
  return null
}

function readWarpLayersAtPoint(mediaRoot, x, y) {
  return readGridScanAtPoint(mediaRoot, x, y)
}

function readCompositorStackAtPoint(x, y, mediaRoot, excludeRoot) {
  if (!(mediaRoot instanceof Element)) return null
  if (!pointInside(mediaRoot.getBoundingClientRect(), x, y)) return null

  const stack = document.elementsFromPoint(x, y)
  const samples = []

  for (const el of stack) {
    if (!(el instanceof Element)) continue
    if (isExcludedElement(el, excludeRoot)) continue
    if (!mediaRoot.contains(el)) continue

    const style = getComputedStyle(el)
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
      continue
    }

    const surface = readElementSurface(el)
    if (surface) samples.push(surface)

    const beforeBg = readPseudoBackground(el, '::before')
    if (beforeBg) samples.push(beforeBg)
  }

  return averageRgb(samples)
}

function readMediaLayersAtPoint(mediaRoot, x, y, sectionRoot = null, excludeRoot = null) {
  if (!(mediaRoot instanceof Element)) return null

  const mediaRect = mediaRoot.getBoundingClientRect()
  const sectionRect = sectionRoot?.getBoundingClientRect?.()
  const inMedia = pointInside(mediaRect, x, y)
  const inSection = sectionRect ? pointInside(sectionRect, x, y) : inMedia
  if (!inMedia && !inSection) return null

  for (const video of mediaRoot.querySelectorAll('video')) {
    if (!isBackgroundVideo(video)) continue
    const sample = sampleVideoAtPoint(video, x, y)
    if (sample) return sample
  }

  const compositorSample = readCompositorStackAtPoint(x, y, mediaRoot, excludeRoot)
  const warpSample = readWarpLayersAtPoint(mediaRoot, x, y)
  const layeredSample = averageRgb([compositorSample, warpSample].filter(Boolean))
  if (layeredSample) return layeredSample

  const markedLayer = readMarkedLayers(mediaRoot)
  if (markedLayer) return markedLayer

  const beforeBg = readPseudoBackground(mediaRoot, '::before')
  if (beforeBg) return beforeBg

  return readElementSurface(mediaRoot)
}

function findSectionAtPoint(x, y) {
  const hero = document.querySelector('.home-hero')
  if (hero && pointInside(hero.getBoundingClientRect(), x, y)) {
    return { kind: 'hero', root: hero, media: hero.querySelector('.home-hero__media') }
  }

  const about = document.querySelector('.about-container')
  if (about && pointInside(about.getBoundingClientRect(), x, y)) {
    return { kind: 'about', root: about, media: about }
  }

  return null
}

function readSectionBackgroundAtPoint(target, x, y, excludeRoot = null) {
  const hero = target?.closest?.('.home-hero')
  if (hero) {
    const media = hero.querySelector('.home-hero__media')
    const sample = readMediaLayersAtPoint(media, x, y, hero, excludeRoot)
    if (sample) return sample
  }

  const about = target?.closest?.('.about-container')
  if (about) {
    const sample = readMediaLayersAtPoint(about, x, y, about, excludeRoot)
    if (sample) return sample
  }

  const section = findSectionAtPoint(x, y)
  if (section?.media) {
    return readMediaLayersAtPoint(section.media, x, y, section.root, excludeRoot)
  }

  return null
}

function sampleBackgroundVideosAt(x, y) {
  const samples = getBackgroundVideos()
    .map((video) => sampleVideoAtPoint(video, x, y))
    .filter(Boolean)

  return averageRgb(samples)
}

function isExcludedElement(el, excludeRoot) {
  if (!(el instanceof Element)) return false
  if (el.closest('.contact-sidebar, .main-site-nav')) return true
  if (excludeRoot?.contains(el)) return true
  return false
}

function pickBackgroundTarget(x, y, excludeRoot) {
  const stack = document.elementsFromPoint(x, y)
  for (const el of stack) {
    if (isExcludedElement(el, excludeRoot)) continue
    return el
  }
  return null
}

function sampleBackgroundAt(x, y, excludeRoot) {
  const target = pickBackgroundTarget(x, y, excludeRoot)

  if (target) {
    const sectionSample = readSectionBackgroundAtPoint(target, x, y, excludeRoot)
    if (sectionSample) return sectionSample
  }

  const section = findSectionAtPoint(x, y)
  if (section?.media) {
    const sectionSample = readMediaLayersAtPoint(section.media, x, y, section.root, excludeRoot)
    if (sectionSample) return sectionSample
  }

  const videoSample = sampleBackgroundVideosAt(x, y)
  if (videoSample) return videoSample

  if (target) return readBackground(target)

  return parseColor(getComputedStyle(document.body).backgroundColor) ?? [255, 255, 255]
}

function pickIconColor(bgRgb) {
  const lum = luminance(bgRgb)
  if (lum < 0.42) return '#ffffff'
  if (lum > 0.82) return '#000000'
  return lum < 0.58 ? '#ffffff' : '#000000'
}

function clampSampleCoord(value, max, inset = 8) {
  if (max <= inset * 2) return max * 0.5
  return Math.max(inset, Math.min(max - inset, value))
}

function samplePointsFor(rect) {
  const viewWidth = window.innerWidth
  const inset = viewWidth < 768 ? 40 : 24
  const cx = rect.left + rect.width * 0.5
  const cy = rect.top + rect.height * 0.5
  const behindX = clampSampleCoord(rect.left - inset, viewWidth)
  const behindXMid = clampSampleCoord(rect.left - Math.round(inset * 0.5), viewWidth)

  return [
    [behindX, cy],
    [behindXMid, rect.top + rect.height * 0.35],
    [behindXMid, rect.top + rect.height * 0.65],
    [clampSampleCoord(cx, viewWidth), cy],
  ]
}

function bindVideoSampling(onFrame) {
  const bound = new WeakSet()

  const bindOne = (video) => {
    if (!(video instanceof HTMLVideoElement) || bound.has(video) || !isBackgroundVideo(video)) return
    bound.add(video)
    video.addEventListener('loadeddata', onFrame)
    video.addEventListener('loadedmetadata', onFrame)
    video.addEventListener('play', onFrame)
    video.addEventListener('seeked', onFrame)
    video.addEventListener('timeupdate', onFrame)

    if (typeof video.requestVideoFrameCallback === 'function') {
      const loop = () => {
        onFrame()
        if (!video.isConnected) return
        video.requestVideoFrameCallback(loop)
      }
      video.requestVideoFrameCallback(loop)
    }
  }

  getBackgroundVideos().forEach(bindOne)

  const observer = new MutationObserver(() => {
    getBackgroundVideos().forEach(bindOne)
    onFrame()
  })
  observer.observe(document.body, { childList: true, subtree: true })

  return () => {
    observer.disconnect()
    getBackgroundVideos().forEach((video) => {
      video.removeEventListener('loadeddata', onFrame)
      video.removeEventListener('loadedmetadata', onFrame)
      video.removeEventListener('play', onFrame)
      video.removeEventListener('seeked', onFrame)
      video.removeEventListener('timeupdate', onFrame)
    })
  }
}

export function useAdaptiveIconColor(ref, enabled = true, contentKey = '') {
  const [color, setColor] = useState('#ffffff')

  const sample = useCallback(() => {
    if (!enabled) return
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return

    const samples = samplePointsFor(rect)
      .map(([x, y]) => sampleBackgroundAt(x, y, el))
      .filter(Boolean)

    if (!samples.length) {
      const fallback = sampleBackgroundAt(
        clampSampleCoord(rect.left - 48, window.innerWidth),
        rect.top + rect.height * 0.5,
        el,
      )
      if (fallback) samples.push(fallback)
    }

    if (!samples.length) return
    setColor(pickIconColor(averageRgb(samples)))
  }, [contentKey, enabled, ref])

  useEffect(() => {
    if (!enabled) return undefined

    let debounceId = null
    const scheduleSample = () => {
      if (debounceId) window.clearTimeout(debounceId)
      debounceId = window.setTimeout(sample, 48)
    }

    sample()

    window.addEventListener('scroll', sample, { passive: true, capture: true })
    window.addEventListener('resize', sample)
    window.addEventListener('icue:legacy-page-ready', scheduleSample)
    window.addEventListener('icue:aboutUsVideoEnabled', sample)
    window.addEventListener('icue:homeVideoEnabled', sample)

    const viewport = window.visualViewport
    viewport?.addEventListener('resize', sample)
    viewport?.addEventListener('scroll', sample)

    const content = document.getElementById('content')
    const observer = content
      ? new MutationObserver(scheduleSample)
      : null
    observer?.observe(content, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    })

    const rootObserver = new MutationObserver(scheduleSample)
    rootObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-home-bg-video', 'data-aboutus-bg-video', 'class'],
    })

    const unbindVideos = bindVideoSampling(scheduleSample)
    const id = window.setInterval(sample, 500)
    const gridScanLoopId = window.setInterval(() => {
      if (document.querySelector('.home-hero__grid-scan canvas')) sample()
    }, 120)

    return () => {
      if (debounceId) window.clearTimeout(debounceId)
      window.removeEventListener('scroll', sample, true)
      window.removeEventListener('resize', sample)
      window.removeEventListener('icue:legacy-page-ready', scheduleSample)
      window.removeEventListener('icue:aboutUsVideoEnabled', sample)
      window.removeEventListener('icue:homeVideoEnabled', sample)
      viewport?.removeEventListener('resize', sample)
      viewport?.removeEventListener('scroll', sample)
      observer?.disconnect()
      rootObserver.disconnect()
      unbindVideos()
      window.clearInterval(id)
      window.clearInterval(gridScanLoopId)
    }
  }, [contentKey, enabled, sample])

  return color
}

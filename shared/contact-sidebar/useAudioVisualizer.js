import { useCallback, useEffect, useRef } from 'react'

const AUDIO_SRC = '/public/music/mixkit-a-very-happy-christmas-897.mp3'

function getOrCreateVisualizer() {
  if (typeof window === 'undefined') return null
  if (window.__icueAudioVisualizer) return window.__icueAudioVisualizer

  const audio = new Audio()
  audio.preload = 'none'
  audio.src = AUDIO_SRC
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const source = ctx.createMediaElementSource(audio)
  const analyser = ctx.createAnalyser()
  source.connect(analyser)
  analyser.connect(ctx.destination)
  const freqData = new Uint8Array(analyser.frequencyBinCount)
  window.__icueAudioVisualizer = { audio, ctx, analyser, freqData }
  return window.__icueAudioVisualizer
}

export function useAudioVisualizer(barRef) {
  const rafRef = useRef(null)

  const stopVisualizer = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (barRef.current) barRef.current.style.transform = 'scale(1)'
  }, [barRef])

  const updateVisualizer = useCallback(() => {
    const el = barRef.current
    const av = window.__icueAudioVisualizer
    if (!el || !av?.analyser || av.audio.paused || av.audio.ended || document.hidden) {
      stopVisualizer()
      return
    }

    av.analyser.getByteFrequencyData(av.freqData)
    const value = av.freqData[0] || 0
    const scale = Math.max(0.85, 1 + value / 512)
    el.style.transform = `scale(${scale})`
    rafRef.current = requestAnimationFrame(updateVisualizer)
  }, [barRef, stopVisualizer])

  const startVisualizer = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(updateVisualizer)
  }, [updateVisualizer])

  const toggle = useCallback(async () => {
    const av = getOrCreateVisualizer()
    if (!av) return

    if (!av.audio.paused) {
      av.audio.pause()
      stopVisualizer()
      return
    }

    if (av.ctx.state === 'suspended') await av.ctx.resume().catch(() => {})
    await av.audio.play().then(startVisualizer).catch(stopVisualizer)
  }, [startVisualizer, stopVisualizer])

  useEffect(() => {
    const onVisibilityChange = () => {
      const av = window.__icueAudioVisualizer
      if (document.hidden || !av || av.audio.paused) stopVisualizer()
      else startVisualizer()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      stopVisualizer()
    }
  }, [startVisualizer, stopVisualizer])

  return { toggle }
}

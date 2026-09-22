import { subscribeToPageResume } from './pageResume.js'

/** Only for muted decorative loops; user-controlled media must keep its pause state. */
export function observeDecorativeVideo(video, {
  target = video,
  shouldPlay = () => true,
  rootMargin = '96px',
  threshold = 0,
} = {}) {
  let onScreen = true
  let failed = false
  let disposed = false
  let restorePosition = null
  const sync = (recover = false) => {
    if (disposed) return
    if (document.hidden || !onScreen || !shouldPlay()) {
      video.pause()
      return
    }
    if (recover && (failed || video.error)) {
      const position = video.currentTime
      if (restorePosition) video.removeEventListener('loadedmetadata', restorePosition)
      restorePosition = () => {
        restorePosition = null
        if (Number.isFinite(position) && position > 0 && position < video.duration) {
          try { video.currentTime = position } catch { /* The browser may reject the seek. */ }
        }
        sync()
      }
      video.addEventListener('loadedmetadata', restorePosition, { once: true })
      failed = false
      video.load()
    }
    video.play()?.catch(() => {})
  }
  const onFailure = () => { failed = true }
  const onPlaying = () => { failed = false }
  const onVisible = () => sync(!document.hidden)
  const onCanPlay = () => sync()
  const observer = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      sync(true)
    }, { rootMargin, threshold })
    : null
  observer?.observe(target)
  video.addEventListener('error', onFailure)
  video.addEventListener('stalled', onFailure)
  video.addEventListener('playing', onPlaying)
  video.addEventListener('canplay', onCanPlay)
  document.addEventListener('visibilitychange', onVisible)
  const unsubscribe = subscribeToPageResume(() => sync(true), { minHiddenMs: 0 })
  sync()
  return () => {
    disposed = true
    unsubscribe()
    observer?.disconnect()
    document.removeEventListener('visibilitychange', onVisible)
    video.removeEventListener('error', onFailure)
    video.removeEventListener('stalled', onFailure)
    video.removeEventListener('playing', onPlaying)
    video.removeEventListener('canplay', onCanPlay)
    if (restorePosition) video.removeEventListener('loadedmetadata', restorePosition)
    video.pause()
  }
}

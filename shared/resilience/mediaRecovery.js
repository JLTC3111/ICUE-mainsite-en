import { subscribeToPageResume } from './pageResume.js'

/** Retry failed images/styles only; leave healthy media and user videos alone. */
export function installMediaRecovery(root = document) {
  const failed = new Map()
  const attempts = new WeakMap()
  const failedStyles = new Map()
  const onError = (event) => {
    const image = event.target
    if (image?.tagName === 'IMG') failed.set(image, image.currentSrc || image.src)
    if (image?.tagName === 'LINK' && image.rel === 'stylesheet') {
      const url = new URL(image.href, window.location.href)
      if (url.origin === window.location.origin && url.pathname.startsWith('/assets/')) {
        failedStyles.set(image, image.href)
      }
    }
  }
  const onLoad = (event) => { failed.delete(event.target); failedStyles.delete(event.target); attempts.delete(event.target) }
  for (const image of root.querySelectorAll('img')) {
    if (image.complete && image.naturalWidth === 0 && image.src) onError({ target: image })
  }
  root.addEventListener('error', onError, true)
  root.addEventListener('load', onLoad, true)
  const retry = () => {
    for (const [link, href] of failedStyles) {
      failedStyles.delete(link)
      if (!link.isConnected || link.href !== href) continue
      const url = new URL(href)
      url.searchParams.delete('icue-retry')
      const key = url.href
      const previous = attempts.get(link)
      const count = previous?.url === key ? previous.count : 0
      if (count >= 2) continue
      attempts.set(link, { url: key, count: count + 1 })
      url.searchParams.set('icue-retry', String(count + 1))
      // Vite remembers failed CSS preloads. Refresh the existing link so
      // recovering its JS chunk cannot leave the component without styles.
      link.href = url.href
    }
    for (const [image, url] of failed) {
      failed.delete(image)
      if (!image.isConnected || (image.currentSrc || image.src) !== url) continue
      const previous = attempts.get(image)
      const count = previous?.url === url ? previous.count : 0
      if (count >= 2) continue
      attempts.set(image, { url, count: count + 1 })
      // Reassign the existing attributes. Never modify signed URLs or remove
      // responsive source selection, and never undo an onError fallback.
      if (image.srcset) image.srcset = image.srcset
      image.src = image.src
    }
  }
  const unsubscribe = subscribeToPageResume(retry, { minHiddenMs: 0 })
  window.addEventListener('icue:retry-load', retry)
  return () => {
    unsubscribe()
    window.removeEventListener('icue:retry-load', retry)
    root.removeEventListener('error', onError, true)
    root.removeEventListener('load', onLoad, true)
    failed.clear()
    failedStyles.clear()
  }
}

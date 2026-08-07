const PAGES_WITH_MODEL_VIEWER = new Set(['aboutUs'])

let loadPromise = null

export function pageUsesModelViewer(pageName) {
  return PAGES_WITH_MODEL_VIEWER.has(pageName)
}

/** Load and register the <model-viewer> custom element (bundled, not CDN). */
export async function loadModelViewer() {
  if (typeof window !== 'undefined' && window.customElements?.get('model-viewer')) {
    return
  }

  if (!loadPromise) {
    loadPromise = import('@google/model-viewer')
      .then(() => {})
      .catch((err) => {
        loadPromise = null
        throw err
      })
  }

  await loadPromise
}

/** Load the 3D runtime only after a model is near the viewport and the browser is idle. */
export function loadModelViewerWhenVisible(root, onReady) {
  if (!root) return () => {}
  const models = [...root.querySelectorAll('model-viewer')]
  if (!models.length) return () => {}

  let cancelled = false
  let idleId = null
  let timeoutId = null
  let observer = null

  const start = () => {
    observer?.disconnect()
    observer = null
    const run = () => {
      if (cancelled) return
      void loadModelViewer().then(() => {
        if (!cancelled) onReady?.()
      })
    }
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(run, { timeout: 2500 })
    } else {
      timeoutId = window.setTimeout(run, 250)
    }
  }

  if (typeof IntersectionObserver !== 'function') {
    start()
  } else {
    observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) start()
    }, { rootMargin: '400px 0px' })
    models.forEach((model) => observer.observe(model))
  }

  return () => {
    cancelled = true
    observer?.disconnect()
    if (idleId != null && typeof window.cancelIdleCallback === 'function') {
      window.cancelIdleCallback(idleId)
    }
    if (timeoutId != null) window.clearTimeout(timeoutId)
  }
}

/** Upgrade <model-viewer> tags parsed from legacy HTML before the CE was defined. */
export function upgradeModelViewers(root) {
  if (!root || !window.customElements?.get('model-viewer')) return
  root.querySelectorAll('model-viewer').forEach((el) => {
    window.customElements.upgrade(el)
  })
}

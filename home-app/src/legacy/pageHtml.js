// Keep in sync with LEGACY_PAGE_FILES in ../lib/routes.js. About Us, Contact,
// FAQs, recruitment, community activities and the four legal documents are
// absent from both: each is served by an app on icue.vn, not injected here.
const PAGE_SOURCE_LOADERS = {
  pastProjects: () => import('../../../legacy/pages/pastProjects.html?raw'),
  newsArchive: () => import('../../../legacy/pages/News.html?raw'),
  notableAwards: () => import('../../../legacy/pages/notableAwards.html?raw'),
}

const sourcePromises = new Map()

export function readEmbeddedLegacyPageSource(pageName) {
  if (typeof document === 'undefined') return null

  const source = document.getElementById('icue-legacy-page-source')
  if (!source || source.dataset.page !== pageName) return null

  try {
    return JSON.parse(source.textContent || 'null')
  } catch {
    return null
  }
}

export function loadLegacyPageSource(pageName) {
  const loader = PAGE_SOURCE_LOADERS[pageName]
  if (!loader) return Promise.reject(new Error(`Unknown legacy page: ${pageName}`))

  if (!sourcePromises.has(pageName)) {
    sourcePromises.set(
      pageName,
      loader().then((module) => module.default),
    )
  }

  return sourcePromises.get(pageName)
}

export function preloadLegacyPageSource(pageName) {
  return loadLegacyPageSource(pageName).then(() => undefined)
}

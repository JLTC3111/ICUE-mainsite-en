const PAGE_SOURCE_LOADERS = {
  Contact: () => import('../../../legacy/pages/Contact.html?raw'),
  aboutUs: () => import('../../../legacy/pages/aboutUs.html?raw'),
  ourWork: () => import('../../../legacy/pages/ourWork.html?raw'),
  pastProjects: () => import('../../../legacy/pages/pastProjects.html?raw'),
  recruitment: () => import('../../../legacy/pages/recruitment.html?raw'),
  newsArchive: () => import('../../../legacy/pages/News.html?raw'),
  notableAwards: () => import('../../../legacy/pages/notableAwards.html?raw'),
  communityActivities: () => import('../../../legacy/pages/communityActivities.html?raw'),
  FAQs: () => import('../../../legacy/pages/FAQs.html?raw'),
  privacy: () => import('../../../legacy/pages/privacy.html?raw'),
  terms: () => import('../../../legacy/pages/terms.html?raw'),
  gdpr: () => import('../../../legacy/pages/gdpr.html?raw'),
  cookies: () => import('../../../legacy/pages/cookies.html?raw'),
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

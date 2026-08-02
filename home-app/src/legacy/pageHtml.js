const PAGE_SOURCE_LOADERS = {
  Contact: () => import('../../../src/pages/Contact.html?raw'),
  aboutUs: () => import('../../../src/pages/aboutUs.html?raw'),
  ourWork: () => import('../../../src/pages/ourWork.html?raw'),
  pastProjects: () => import('../../../src/pages/pastProjects.html?raw'),
  recruitment: () => import('../../../src/pages/recruitment.html?raw'),
  newsArchive: () => import('../../../src/pages/News.html?raw'),
  notableAwards: () => import('../../../src/pages/notableAwards.html?raw'),
  communityActivities: () => import('../../../src/pages/communityActivities.html?raw'),
  FAQs: () => import('../../../src/pages/FAQs.html?raw'),
  privacy: () => import('../../../src/pages/privacy.html?raw'),
  terms: () => import('../../../src/pages/terms.html?raw'),
  gdpr: () => import('../../../src/pages/gdpr.html?raw'),
  cookies: () => import('../../../src/pages/cookies.html?raw'),
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

/** Path routes for migrated main-site pages. */
export const ROUTE_PATHS = {
  home: '/',
  contact: '/contact',
  aboutUs: '/about-us',
  ourWork: '/our-work',
  pastProjects: '/past-projects',
  recruitment: '/recruitment',
  newsArchive: '/news-archive',
  newsArchiveLegacyHtml: '/legacy/pages/News.html',
  newsArchiveLegacyAlt: '/legacy/pages/News',
  notableAwards: '/notable-awards',
  communityActivities: '/community-activities',
  faqs: '/faqs',
  privacy: '/privacy',
  terms: '/terms',
  gdpr: '/gdpr',
  cookies: '/cookies',
}

/** Maps React path -> legacy page id used by script.js init + nav state. */
export const PATH_TO_PAGE = {
  [ROUTE_PATHS.home]: 'Home',
  [ROUTE_PATHS.contact]: 'Contact',
  [ROUTE_PATHS.aboutUs]: 'aboutUs',
  [ROUTE_PATHS.ourWork]: 'ourWork',
  [ROUTE_PATHS.pastProjects]: 'pastProjects',
  [ROUTE_PATHS.recruitment]: 'recruitment',
  [ROUTE_PATHS.newsArchive]: 'newsArchive',
  [ROUTE_PATHS.newsArchiveLegacyHtml]: 'newsArchive',
  [ROUTE_PATHS.newsArchiveLegacyAlt]: 'newsArchive',
  [ROUTE_PATHS.notableAwards]: 'notableAwards',
  [ROUTE_PATHS.communityActivities]: 'communityActivities',
  [ROUTE_PATHS.faqs]: 'FAQs',
  [ROUTE_PATHS.privacy]: 'privacy',
  [ROUTE_PATHS.terms]: 'terms',
  [ROUTE_PATHS.gdpr]: 'gdpr',
  [ROUTE_PATHS.cookies]: 'cookies',
}

export const PAGE_TO_PATH = Object.fromEntries(
  Object.entries(PATH_TO_PAGE).map(([path, page]) => [page, path]),
)
PAGE_TO_PATH.newsArchive = ROUTE_PATHS.newsArchive

export const LEGACY_PAGE_FILES = {
  Contact: 'Contact.html',
  aboutUs: 'aboutUs.html',
  pastProjects: 'pastProjects.html',
  recruitment: 'recruitment.html',
  newsArchive: 'News.html',
  notableAwards: 'notableAwards.html',
  communityActivities: 'communityActivities.html',
  FAQs: 'FAQs.html',
  privacy: 'privacy.html',
  terms: 'terms.html',
  gdpr: 'gdpr.html',
  cookies: 'cookies.html',
}

export function pageFromPathname(pathname) {
  if (!pathname) return null
  const normalized = pathname === '/'
    ? '/'
    : `/${pathname.split('/').filter(Boolean).join('/')}`
  return PATH_TO_PAGE[normalized] || null
}

export function pathFromPage(page) {
  return PAGE_TO_PATH[page] || ROUTE_PATHS.home
}

/** Rewrite legacy hash links and public/ asset paths inside injected HTML. */
export function prepareLegacyHtml(rawHtml) {
  const doc = new DOMParser().parseFromString(rawHtml, 'text/html')

  // Scripts injected through innerHTML never execute. Remove that dead payload
  // and the standalone Swiper stylesheet; migrated routes load behavior and CSS
  // through their route-specific modules instead.
  doc.body?.querySelectorAll('script').forEach((script) => script.remove())
  doc.body
    ?.querySelectorAll('link[rel="stylesheet"][href*="swiper"]')
    .forEach((link) => link.remove())

  doc.body?.querySelectorAll('img').forEach((image) => {
    if (!image.hasAttribute('loading')) image.setAttribute('loading', 'lazy')
    if (!image.hasAttribute('decoding')) image.setAttribute('decoding', 'async')
  })
  doc.body?.querySelectorAll('iframe').forEach((frame) => {
    if (!frame.hasAttribute('loading')) frame.setAttribute('loading', 'lazy')
  })
  doc.body?.querySelectorAll('video:not([autoplay])').forEach((video) => {
    if (!video.hasAttribute('preload')) video.setAttribute('preload', 'none')
  })

  // Scope document-level selectors so injected page CSS cannot clip fixed nav/footer
  // (mobile WebKit clips position:fixed when html/body have overflow-x:hidden).
  const styles = [...doc.querySelectorAll('style')]
    .map((el) => {
      let css = el.textContent || ''
      css = css
        .replace(/(^|[,}\s])html(\s*[,{])/g, '$1:root$2')
        .replace(/(^|[,}\s])body(\s*[,{])/g, '$1.legacy-page$2')
        // Only rewrite a bare universal reset (`* {`), not descendant `svg *` etc.
        .replace(/(^|})\s*\*\s*\{/g, '$1.legacy-page, .legacy-page * {')
      return `<style>${css}</style>`
    })
    .join('\n')
  let bodyHtml = doc.body?.innerHTML || rawHtml

  const VN = 'https://icue.vn'

  const hashToPath = {
    '#/Home': ROUTE_PATHS.home,
    '#/Contact': ROUTE_PATHS.contact,
    '#/aboutUs': ROUTE_PATHS.aboutUs,
    '#/ourWork': ROUTE_PATHS.ourWork,
    '#/pastProjects': ROUTE_PATHS.pastProjects,
    '#/recruitment': ROUTE_PATHS.recruitment,
    '#/News': `${VN}/newsroom/?from=en-news`,
    '#/orgStructure': `${VN}/structure/`,
    '#/notableAwards': ROUTE_PATHS.notableAwards,
    '#/communityActivities': ROUTE_PATHS.communityActivities,
    '#/FAQs': ROUTE_PATHS.faqs,
    '#/faqs': ROUTE_PATHS.faqs,
    '#/privacy': ROUTE_PATHS.privacy,
    '#/terms': ROUTE_PATHS.terms,
    '#/gdpr': ROUTE_PATHS.gdpr,
    '#/cookies': ROUTE_PATHS.cookies,
  }

  bodyHtml = bodyHtml
    .replace(/(["'(=\s])public\//g, '$1/public/')
    .replace(/(^|[^:/])\/{2,}public\//g, '$1/public/')
  for (const [hash, path] of Object.entries(hashToPath)) {
    bodyHtml = bodyHtml.replaceAll(`href="${hash}"`, `href="${path}"`)
    bodyHtml = bodyHtml.replaceAll(`href='${hash}'`, `href='${path}'`)
    bodyHtml = bodyHtml.replaceAll(`href="/${hash.slice(1)}"`, `href="${path}"`)
    bodyHtml = bodyHtml.replaceAll(`href='/${hash.slice(1)}'`, `href='${path}'`)
  }

  bodyHtml = bodyHtml
    .replaceAll('href="/newsroom/?from=en-news"', `href="${VN}/newsroom/?from=en-news"`)
    .replaceAll("href='/newsroom/?from=en-news'", `href='${VN}/newsroom/?from=en-news'`)

  for (const [pageId, file] of Object.entries(LEGACY_PAGE_FILES)) {
    const route = PAGE_TO_PATH[pageId]
    if (!route) continue
    bodyHtml = bodyHtml.replaceAll(`href="/legacy/pages/${file}"`, `href="${route}"`)
    bodyHtml = bodyHtml.replaceAll(`href='/legacy/pages/${file}'`, `href='${route}'`)
  }

  const bodyClass = doc.body?.className?.trim() || ''

  return { html: `${styles}${bodyHtml}`, bodyClass }
}

/** Convert bookmarks from the retired hash router into canonical paths. */
export function pathFromLegacyHash(hash) {
  if (!hash?.startsWith('#/')) return null

  const raw = hash.slice(2)
  const queryIndex = raw.indexOf('?')
  const page = (queryIndex >= 0 ? raw.slice(0, queryIndex) : raw).replace(/\/+$/, '')
  const search = queryIndex >= 0 ? raw.slice(queryIndex) : ''

  const pagePaths = {
    Home: ROUTE_PATHS.home,
    Contact: ROUTE_PATHS.contact,
    aboutUs: ROUTE_PATHS.aboutUs,
    ourWork: ROUTE_PATHS.ourWork,
    pastProjects: ROUTE_PATHS.pastProjects,
    recruitment: ROUTE_PATHS.recruitment,
    News: ROUTE_PATHS.newsArchive,
    newsArchive: ROUTE_PATHS.newsArchive,
    orgStructure: 'https://icue.vn/structure/',
    meetOurExperts: 'https://icue.vn/people/experts?site=en',
    coreTeam: 'https://icue.vn/people/core-team?site=en',
    notableAwards: ROUTE_PATHS.notableAwards,
    communityActivities: ROUTE_PATHS.communityActivities,
    FAQs: ROUTE_PATHS.faqs,
    faqs: ROUTE_PATHS.faqs,
    privacy: ROUTE_PATHS.privacy,
    terms: ROUTE_PATHS.terms,
    gdpr: ROUTE_PATHS.gdpr,
    cookies: ROUTE_PATHS.cookies,
  }

  const path = pagePaths[page]
  if (!path) return null
  const suffix = search && path.includes('?') ? `&${search.slice(1)}` : search
  return `${path}${suffix}`
}

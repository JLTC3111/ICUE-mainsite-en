import { withUiLang } from '../../../shared/i18n/withUiLang.js'

/**
 * Contact, About Us, Our Work, FAQs, Recruitment and Community Activities are
 * served by shared apps on icue.vn. The constants below keep `?site=en` as the
 * English-default edge redirect. Client-side chrome restamps them with
 * `withUiLang`: French, German, Korean and Japanese leave as `?lang=fr` (etc.)
 * because `?site=en` with no `lang` forces those apps back to English.
 *
 * None of those has a route here. ROUTE_PATHS keeps their local paths where nav
 * state and redirect rules need them; Our Work has no entry at all. Link to the
 * URLs below rather than to a bare path — those only reach the app through a
 * server redirect, which client-side navigation never triggers. The bare paths
 * still 301 at the edge so old inbound links keep working.
 */
export const CONTACT_APP_URL = 'https://icue.vn/contact?site=en'
export const OUR_WORK_APP_URL = 'https://icue.vn/our-work?site=en'
export const ABOUT_US_APP_URL = 'https://icue.vn/about-us?site=en'
/*
 * FAQs, Recruitment and Community Activities joined them in 2026-08. Each used
 * to exist twice, once per host; icue.vn now renders all six UI languages of
 * each, so this site redirects rather than keeping a second English copy that
 * would drift.
 */
export const FAQ_APP_URL = 'https://icue.vn/faqs?site=en'
export const RECRUITMENT_APP_URL = 'https://icue.vn/recruitment?site=en'
export const COMMUNITY_ACTIVITIES_APP_URL = 'https://icue.vn/community-activities?site=en'
/** All legal documents are rendered by the consolidated six-language app. */
export const LEGAL_APP_URLS = Object.freeze({
  privacy: 'https://icue.vn/legal/privacy?lang=en',
  terms: 'https://icue.vn/legal/terms?lang=en',
  gdpr: 'https://icue.vn/legal/gdpr?lang=en',
  cookies: 'https://icue.vn/legal/cookies?lang=en',
})
/** The newsroom is the same arrangement — one app on icue.vn, entered with a hint. */
export const NEWSROOM_URL = 'https://icue.vn/newsroom/?from=en-news'
const STRUCTURE_APP_URL = 'https://icue.vn/structure/'
const EXPERTS_APP_URL = 'https://icue.vn/people/experts?site=en'
const CORE_TEAM_APP_URL = 'https://icue.vn/people/core-team?site=en'

function appUrlsForLang(lang = 'en') {
  return {
    home: withUiLang(ROUTE_PATHS.home, lang),
    contact: withUiLang(CONTACT_APP_URL, lang),
    aboutUs: withUiLang(ABOUT_US_APP_URL, lang),
    ourWork: withUiLang(OUR_WORK_APP_URL, lang),
    pastProjects: withUiLang(ROUTE_PATHS.pastProjects, lang),
    recruitment: withUiLang(RECRUITMENT_APP_URL, lang),
    newsroom: withUiLang(NEWSROOM_URL, lang),
    newsArchive: withUiLang(ROUTE_PATHS.newsArchive, lang),
    structure: withUiLang(STRUCTURE_APP_URL, lang),
    notableAwards: withUiLang(ROUTE_PATHS.notableAwards, lang),
    communityActivities: withUiLang(COMMUNITY_ACTIVITIES_APP_URL, lang),
    faqs: withUiLang(FAQ_APP_URL, lang),
    privacy: withUiLang(LEGAL_APP_URLS.privacy, lang),
    terms: withUiLang(LEGAL_APP_URLS.terms, lang),
    gdpr: withUiLang(LEGAL_APP_URLS.gdpr, lang),
    cookies: withUiLang(LEGAL_APP_URLS.cookies, lang),
    experts: withUiLang(EXPERTS_APP_URL, lang),
    coreTeam: withUiLang(CORE_TEAM_APP_URL, lang),
  }
}

/** Path routes for migrated main-site pages. */
export const ROUTE_PATHS = {
  home: '/',
  contact: '/contact',
  aboutUs: '/about-us',
  pastProjects: '/past-projects',
  recruitment: '/recruitment',
  newsArchive: '/news-archive',
  newsArchiveLegacyHtml: '/legacy/pages/News.html',
  newsArchiveLegacyAlt: '/legacy/pages/News',
  notableAwards: '/notable-awards',
  communityActivities: '/community-activities',
  faqs: '/faqs',
  // Retired inbound paths retained only for edge/server redirect matching.
  // This app does not mount or build any of these pages.
  privacy: '/legal/privacy',
  terms: '/legal/terms',
  gdpr: '/legal/gdpr',
  cookies: '/legal/cookies',
}

/** Maps React path -> legacy page id used by script.js init + nav state. */
export const PATH_TO_PAGE = {
  [ROUTE_PATHS.home]: 'Home',
  [ROUTE_PATHS.contact]: 'Contact',
  [ROUTE_PATHS.aboutUs]: 'aboutUs',
  [ROUTE_PATHS.pastProjects]: 'pastProjects',
  [ROUTE_PATHS.recruitment]: 'recruitment',
  [ROUTE_PATHS.newsArchive]: 'newsArchive',
  [ROUTE_PATHS.newsArchiveLegacyHtml]: 'newsArchive',
  [ROUTE_PATHS.newsArchiveLegacyAlt]: 'newsArchive',
  [ROUTE_PATHS.notableAwards]: 'notableAwards',
  [ROUTE_PATHS.communityActivities]: 'communityActivities',
  [ROUTE_PATHS.faqs]: 'FAQs',
}

export const PAGE_TO_PATH = Object.fromEntries(
  Object.entries(PATH_TO_PAGE).map(([path, page]) => [page, path]),
)
PAGE_TO_PATH.newsArchive = ROUTE_PATHS.newsArchive

// Pages served by shared apps on icue.vn are deliberately absent, including
// the four retired English legal pages.
export const LEGACY_PAGE_FILES = {
  pastProjects: 'pastProjects.html',
  newsArchive: 'News.html',
  notableAwards: 'notableAwards.html',
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
export function prepareLegacyHtml(rawHtml, lang = 'en') {
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

  const urls = appUrlsForLang(lang)

  const hashToPath = {
    '#/Home': urls.home,
    '#/Contact': urls.contact,
    '#/aboutUs': urls.aboutUs,
    '#/ourWork': urls.ourWork,
    '#/pastProjects': urls.pastProjects,
    '#/recruitment': urls.recruitment,
    '#/News': urls.newsroom,
    '#/orgStructure': urls.structure,
    '#/notableAwards': urls.notableAwards,
    '#/communityActivities': urls.communityActivities,
    '#/FAQs': urls.faqs,
    '#/faqs': urls.faqs,
    '#/privacy': urls.privacy,
    '#/terms': urls.terms,
    '#/gdpr': urls.gdpr,
    '#/cookies': urls.cookies,
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
    .replaceAll('href="/newsroom/?from=en-news"', `href="${urls.newsroom}"`)
    .replaceAll("href='/newsroom/?from=en-news'", `href='${urls.newsroom}'`)

  for (const [pageId, file] of Object.entries(LEGACY_PAGE_FILES)) {
    const route = PAGE_TO_PATH[pageId]
    if (!route) continue
    const localized = withUiLang(route, lang)
    bodyHtml = bodyHtml.replaceAll(`href="/legacy/pages/${file}"`, `href="${localized}"`)
    bodyHtml = bodyHtml.replaceAll(`href='/legacy/pages/${file}'`, `href='${localized}'`)
  }

  // Legal HTML is retired but links to those old files remain in a few source
  // documents. Send them directly to the consolidated app, without a local
  // route or an avoidable redirect hop.
  for (const [pageId, file] of Object.entries({
    privacy: 'privacy.html',
    terms: 'terms.html',
    gdpr: 'gdpr.html',
    cookies: 'cookies.html',
  })) {
    const target = urls[pageId]
    bodyHtml = bodyHtml.replaceAll(`href="/legacy/pages/${file}"`, `href="${target}"`)
    bodyHtml = bodyHtml.replaceAll(`href='/legacy/pages/${file}'`, `href='${target}'`)
  }

  // These pages have no local route — send their links straight to the shared
  // apps on icue.vn rather than through a redirect hop this router never
  // triggers.
  bodyHtml = bodyHtml
    .replaceAll('href="/about-us"', `href="${urls.aboutUs}"`)
    .replaceAll("href='/about-us'", `href='${urls.aboutUs}'`)
    .replaceAll('href="/legacy/pages/aboutUs.html"', `href="${urls.aboutUs}"`)
    .replaceAll("href='/legacy/pages/aboutUs.html'", `href='${urls.aboutUs}'`)
    .replaceAll('href="/legacy/pages/Contact.html"', `href="${urls.contact}"`)
    .replaceAll("href='/legacy/pages/Contact.html'", `href='${urls.contact}'`)
    .replaceAll('href="/legacy/pages/communityActivities.html"', `href="${urls.communityActivities}"`)
    .replaceAll("href='/legacy/pages/communityActivities.html'", `href='${urls.communityActivities}'`)

  const bodyClass = doc.body?.className?.trim() || ''

  return { html: `${styles}${bodyHtml}`, bodyClass }
}

/** Convert bookmarks from the retired hash router into canonical paths. */
export function pathFromLegacyHash(hash, lang = 'en') {
  if (!hash?.startsWith('#/')) return null

  const raw = hash.slice(2)
  const queryIndex = raw.indexOf('?')
  const page = (queryIndex >= 0 ? raw.slice(0, queryIndex) : raw).replace(/\/+$/, '')
  const search = queryIndex >= 0 ? raw.slice(queryIndex) : ''
  const urls = appUrlsForLang(lang)

  const pagePaths = {
    Home: urls.home,
    Contact: urls.contact,
    aboutUs: urls.aboutUs,
    ourWork: urls.ourWork,
    pastProjects: urls.pastProjects,
    recruitment: urls.recruitment,
    News: urls.newsArchive,
    newsArchive: urls.newsArchive,
    orgStructure: urls.structure,
    meetOurExperts: urls.experts,
    coreTeam: urls.coreTeam,
    notableAwards: urls.notableAwards,
    communityActivities: urls.communityActivities,
    FAQs: urls.faqs,
    faqs: urls.faqs,
    privacy: urls.privacy,
    terms: urls.terms,
    gdpr: urls.gdpr,
    cookies: urls.cookies,
  }

  const path = pagePaths[page]
  if (!path) return null
  const suffix = search && path.includes('?') ? `&${search.slice(1)}` : search
  return `${path}${suffix}`
}

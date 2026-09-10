import { withUiLang } from '../../../shared/i18n/withUiLang.js'
import { resolveMainSiteLink } from '../../../shared/site-routes/mainSitePaths.js'

/**
 * Every non-home page is served by a React app on icue.vn. ROUTE_PATHS retains
 * old en.icue.vn paths only for redirect matching and legacy bookmark parsing.
 */
const englishAppUrl = (page) => resolveMainSiteLink(page, 'en')

export const CONTACT_APP_URL = englishAppUrl('Contact')
export const OUR_WORK_APP_URL = englishAppUrl('ourWork')
export const ABOUT_US_APP_URL = englishAppUrl('aboutUs')
export const PAST_PROJECTS_APP_URL = englishAppUrl('pastProjects')
export const NEWS_ARCHIVE_APP_URL = englishAppUrl('newsArchive')
export const NOTABLE_AWARDS_APP_URL = englishAppUrl('notableAwards')
export const FAQ_APP_URL = englishAppUrl('FAQs')
export const RECRUITMENT_APP_URL = englishAppUrl('recruitment')
export const COMMUNITY_ACTIVITIES_APP_URL = englishAppUrl('communityActivities')
export const LEGAL_APP_URLS = Object.freeze({
  privacy: englishAppUrl('privacy'),
  terms: englishAppUrl('terms'),
  gdpr: englishAppUrl('gdpr'),
  cookies: englishAppUrl('cookies'),
})
export const NEWSROOM_URL = englishAppUrl('News')
const STRUCTURE_APP_URL = englishAppUrl('orgStructure')
const EXPERTS_APP_URL = englishAppUrl('meetOurExperts')
const CORE_TEAM_APP_URL = englishAppUrl('coreTeam')

function appUrlsForLang(lang = 'en') {
  return {
    home: withUiLang(ROUTE_PATHS.home, lang),
    contact: withUiLang(CONTACT_APP_URL, lang),
    aboutUs: withUiLang(ABOUT_US_APP_URL, lang),
    ourWork: withUiLang(OUR_WORK_APP_URL, lang),
    pastProjects: withUiLang(PAST_PROJECTS_APP_URL, lang),
    recruitment: withUiLang(RECRUITMENT_APP_URL, lang),
    newsroom: withUiLang(NEWSROOM_URL, lang),
    newsArchive: withUiLang(NEWS_ARCHIVE_APP_URL, lang),
    structure: withUiLang(STRUCTURE_APP_URL, lang),
    notableAwards: withUiLang(NOTABLE_AWARDS_APP_URL, lang),
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

export function pageFromPathname(pathname) {
  if (!pathname) return null
  const normalized = pathname === '/'
    ? '/'
    : `/${pathname.split('/').filter(Boolean).join('/')}`
  return PATH_TO_PAGE[normalized] || null
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

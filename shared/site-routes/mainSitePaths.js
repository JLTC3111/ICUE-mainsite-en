export const SITES = {
  vi: 'https://icue.vn',
  en: 'https://en.icue.vn',
}

export const SUPPORTED_UI_LOCALES = ['vi', 'en', 'de', 'fr', 'ko', 'ja']

const SUPPORTED_UI_LOCALE_SET = new Set(SUPPORTED_UI_LOCALES)
const LOCALE_ALIASES = {
  vn: 'vi',
  gb: 'en',
  uk: 'en',
  kr: 'ko',
  jp: 'ja',
}

/**
 * Turn browser/flag/country variants into the locale codes used by i18next.
 * `kr` and `jp` are accepted at URL boundaries even though the canonical
 * language codes stored by the apps are `ko` and `ja`.
 */
export function normalizeUiLocale(value, fallback = null) {
  const raw = String(value || '').trim().toLowerCase().replaceAll('_', '-')
  const base = raw.split('-')[0]
  const normalized = LOCALE_ALIASES[raw] || LOCALE_ALIASES[base] || base

  if (SUPPORTED_UI_LOCALE_SET.has(normalized)) return normalized
  if (fallback == null) return null

  const fallbackRaw = String(fallback || '').trim().toLowerCase().replaceAll('_', '-')
  const fallbackBase = fallbackRaw.split('-')[0]
  const normalizedFallback = LOCALE_ALIASES[fallbackRaw]
    || LOCALE_ALIASES[fallbackBase]
    || fallbackBase
  return SUPPORTED_UI_LOCALE_SET.has(normalizedFallback) ? normalizedFallback : 'vi'
}

/** English keeps its dedicated home host; every other localized home lives on icue.vn. */
export function mainSiteOriginForLocale(locale = 'vi') {
  return normalizeUiLocale(locale, 'vi') === 'en' ? SITES.en : SITES.vi
}

/**
 * Stamp the canonical cross-app locale without carrying retired language
 * hints into newly generated URLs.
 */
export function withLocale(url, locale) {
  const normalized = normalizeUiLocale(locale)
  const value = String(url || '')
  if (!normalized || !value || value.startsWith('#')) return value
  if (/^(?:mailto|tel|sms|javascript):/i.test(value)) return value

  const hashAt = value.indexOf('#')
  const beforeHash = hashAt >= 0 ? value.slice(0, hashAt) : value
  const hash = hashAt >= 0 ? value.slice(hashAt) : ''
  const queryAt = beforeHash.indexOf('?')
  const path = queryAt >= 0 ? beforeHash.slice(0, queryAt) : beforeHash
  const params = new URLSearchParams(queryAt >= 0 ? beforeHash.slice(queryAt + 1) : '')

  params.delete('site')
  if (params.get('from') === 'en-news') params.delete('from')
  params.set('lang', normalized)
  return `${path}?${params.toString()}${hash}`
}

export const MAIN_SITE_PAGE_PATHS = {
  Home: '/',
  Contact: '/contact',
  aboutUs: '/about-us',
  ourWork: '/our-work',
  pastProjects: '/past-projects',
  newsArchive: '/news-archive',
  recruitment: '/recruitment',
  News: '/newsroom/',
  meetOurExperts: '/people/experts',
  coreTeam: '/people/core-team',
  notableAwards: '/notable-awards',
  communityActivities: '/community-activities',
  FAQs: '/faqs',
  faqs: '/faqs',
  privacy: '/legal/privacy',
  terms: '/legal/terms',
  gdpr: '/legal/gdpr',
  cookies: '/legal/cookies',
  orgStructure: '/structure/',
}

export const ICUE_VN_HOSTED_PAGES = new Set(
  Object.keys(MAIN_SITE_PAGE_PATHS).filter((page) => page !== 'Home'),
)

/** @deprecated Use ICUE_VN_HOSTED_PAGES; retained for compatibility. */
export const VI_ONLY_APP_PAGES = ICUE_VN_HOSTED_PAGES

const DETAIL_PAGES = new Set(['pastProjects', 'newsArchive'])

export function hostedPathForPage(page, currentPathname = '') {
  const path = MAIN_SITE_PAGE_PATHS[page]
  if (!path) return null

  const current = String(currentPathname || '').replace(/\/+$/, '') || ''
  if (DETAIL_PAGES.has(page) && (current === path || current.startsWith(`${path}/`))) {
    return current
  }
  return path
}

export function resolveMainSiteDetailLink(page, id, lang) {
  const locale = normalizeUiLocale(lang, 'vi')
  const path = MAIN_SITE_PAGE_PATHS[page]
  if (!path) return resolveMainSiteLink(page, locale)
  if (id == null || id === '') return resolveMainSiteLink(page, locale)
  return withLocale(`${SITES.vi}${path}/${encodeURIComponent(id)}`, locale)
}

export function resolveMainSiteLink(page, lang, base, currentPathname) {
  const locale = normalizeUiLocale(lang, 'vi')
  const origin = typeof base === 'string' && base.startsWith('http')
    ? base.replace(/\/$/, '')
    : mainSiteOriginForLocale(locale)

  const path = hostedPathForPage(page, currentPathname)
  if (!path) {
    return withLocale(`${SITES.vi}/#/${page}`, locale)
  }

  if (ICUE_VN_HOSTED_PAGES.has(page)) {
    return withLocale(`${SITES.vi}${path}`, locale)
  }

  return withLocale(`${origin}${path}`, locale)
}

export function newsroomUrl(locale = 'vi') {
  return withLocale(`${SITES.vi}/newsroom/`, locale)
}

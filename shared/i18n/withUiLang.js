import {
  normalizeUiLocale,
  withLocale,
} from '../site-routes/mainSitePaths.js'

/** Cross-app language in the query string. */
export const SHARED_LANG_CODES = new Set(['vi', 'en', 'de', 'fr', 'ko', 'ja'])

export const LANG_ALIASES = {
  vn: 'vi',
  gb: 'en',
  uk: 'en',
  kr: 'ko',
  jp: 'ja',
}

const VN_HOSTS = new Set(['icue.vn', 'www.icue.vn'])
const SKIP_HREF = /^(?:mailto|tel|sms|javascript):/i

export function normalizeUiLang(code, fallback = 'en') {
  return normalizeUiLocale(code, fallback)
}

/**
 * Stamp the current UI language onto ICUE links. Apps still read `site=en`
 * and `from=en-news` for old bookmarks, but new links emit only `lang=`.
 * The English home stays clean at `/`; non-English variants retain `lang=`.
 */
export function withUiLang(href, lang) {
  if (!href || href.startsWith('#') || SKIP_HREF.test(href)) return href

  const code = normalizeUiLang(lang)
  const isAbsolute = /^https?:\/\//i.test(href)

  let url
  try {
    url = new URL(href, 'https://en.icue.vn')
  } catch {
    return href
  }

  url.searchParams.delete('site')
  if (url.searchParams.get('from') === 'en-news') url.searchParams.delete('from')
  url.searchParams.delete('lang')

  if (VN_HOSTS.has(url.hostname)) {
    const localized = new URL(withLocale(url.toString(), code))
    return isAbsolute
      ? localized.toString()
      : `${localized.pathname}${localized.search}${localized.hash}`
  }

  if (code !== 'en') {
    url.searchParams.set('lang', code)
  }

  if (!isAbsolute) return `${url.pathname}${url.search}${url.hash}`
  return url.toString()
}

export function withUiLangOnHref(item, lang) {
  if (!item || typeof item !== 'object') return item
  const next = { ...item }
  if (typeof next.href === 'string') next.href = withUiLang(next.href, lang)
  if (Array.isArray(next.items)) {
    next.items = next.items.map((child) => withUiLangOnHref(child, lang))
  }
  return next
}

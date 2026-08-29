/**
 * Cross-app language in the query string.
 *
 * Shared ICUE apps on icue.vn (Contact, Our Work, About Us, FAQs, …) read
 * `lang` first. `site=en` and `from=en-news` only run when `lang` is absent,
 * and they force English — which is why a French reader leaving this site
 * used to land on the English Contact page.
 *
 * Country aliases (`kr`, `jp`) match those apps: the flag files are named
 * that way, but the i18n codes are `ko` and `ja`.
 */
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
  if (code == null || code === '') return fallback
  const raw = String(code).trim().toLowerCase().replaceAll('_', '-')
  const base = raw.split('-')[0]
  const mapped = LANG_ALIASES[raw] || LANG_ALIASES[base] || base
  return SHARED_LANG_CODES.has(mapped) ? mapped : fallback
}

function isNewsroomPath(pathname) {
  return pathname === '/newsroom' || pathname.startsWith('/newsroom/')
}

/**
 * Stamp the current UI language onto a link the way the apps on icue.vn do.
 *
 * English stays on the old chrome hints (`site=en`, newsroom `from=en-news`)
 * so typed /contact redirects and existing bookmarks keep working. Every
 * other UI language uses `lang=` and drops those English-forcing params.
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

  const onVn = VN_HOSTS.has(url.hostname)

  url.searchParams.delete('site')
  url.searchParams.delete('from')
  url.searchParams.delete('lang')

  if (code === 'en') {
    if (onVn) {
      if (isNewsroomPath(url.pathname)) url.searchParams.set('from', 'en-news')
      else url.searchParams.set('site', 'en')
    }
  } else {
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

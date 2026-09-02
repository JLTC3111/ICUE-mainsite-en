import { ABOUT_US_APP_URL, LEGAL_APP_URLS } from './routes.js'
import { withUiLang } from '../../../shared/i18n/withUiLang.js'

const EXTERNAL_ALIASES = new Map()

for (const alias of [
  '/about-us',
  '/about-us.html',
  '/legacy/pages/aboutus',
  '/legacy/pages/aboutus.html',
  '/legacy-embed/pages/aboutus',
  '/legacy-embed/pages/aboutus.html',
]) {
  EXTERNAL_ALIASES.set(alias, ABOUT_US_APP_URL)
}

for (const [slug, target] of Object.entries(LEGAL_APP_URLS)) {
  for (const alias of [
    `/legal/${slug}`,
    `/${slug}`,
    `/legacy/pages/${slug}`,
    `/legacy/pages/${slug}.html`,
    `/legacy-embed/pages/${slug}`,
    `/legacy-embed/pages/${slug}.html`,
  ]) {
    EXTERNAL_ALIASES.set(alias, target)
  }
}
EXTERNAL_ALIASES.set('/legal', LEGAL_APP_URLS.privacy)

export function getBootstrapExternalRedirect(pathname) {
  if (!pathname) return null
  const normalized = `/${pathname.split('/').filter(Boolean).join('/')}`.toLowerCase()
  return EXTERNAL_ALIASES.get(normalized) || null
}

function readLangHint(locationObject) {
  const fromQuery = new URLSearchParams(locationObject.search || '').get('lang')
  if (fromQuery) return fromQuery
  try {
    return localStorage.getItem('icue_news_lang')
  } catch {
    return null
  }
}

export function redirectExternalAppAtBootstrap(locationObject = window.location) {
  const target = getBootstrapExternalRedirect(locationObject.pathname)
  if (!target) return false
  const localized = withUiLang(target, readLangHint(locationObject) || 'en')
  if (new URL(localized).href === locationObject.href) return false
  locationObject.replace(localized)
  return true
}

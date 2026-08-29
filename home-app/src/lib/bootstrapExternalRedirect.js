import { ABOUT_US_APP_URL } from './routes.js'
import { withUiLang } from '../../../shared/i18n/withUiLang.js'

const ABOUT_US_ALIASES = new Set([
  '/about-us',
  '/about-us.html',
  '/legacy/pages/aboutus',
  '/legacy/pages/aboutus.html',
  '/legacy-embed/pages/aboutus',
  '/legacy-embed/pages/aboutus.html',
])

export function getBootstrapExternalRedirect(pathname) {
  if (!pathname) return null
  const normalized = `/${pathname.split('/').filter(Boolean).join('/')}`.toLowerCase()
  return ABOUT_US_ALIASES.has(normalized) ? ABOUT_US_APP_URL : null
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

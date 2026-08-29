import { ABOUT_US_APP_URL } from './routes.js'

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

export function redirectExternalAppAtBootstrap(locationObject = window.location) {
  const target = getBootstrapExternalRedirect(locationObject.pathname)
  if (!target || new URL(target).href === locationObject.href) return false
  locationObject.replace(target)
  return true
}

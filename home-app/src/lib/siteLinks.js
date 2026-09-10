/** Path-based links for the standalone home app (no hash routing). */

import { resolveMainSiteDetailLink } from '../../../shared/site-routes/mainSitePaths.js'

export const SITES = {
  vi: 'https://icue.vn',
  en: 'https://en.icue.vn',
}

export { ROUTE_PATHS } from './routes'

export function projectCardUrl(id, locale = 'en') {
  return resolveMainSiteDetailLink('pastProjects', id, locale)
}

export function articleUrl(id, locale = 'en') {
  return resolveMainSiteDetailLink('newsArchive', id, locale)
}

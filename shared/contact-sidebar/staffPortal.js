import { normalizeUiLocale, SITES, withLocale } from '../site-routes/mainSitePaths.js'

export function staffPortalCopy() {
  return { label: 'Staff', title: 'Staff sign-in', link: 'Staff login and chat management' }
}

// All English hosts, including local dev and deploy previews, use the shared inbox.
export function staffPortalUrl(locale = 'en') {
  return withLocale(`${SITES.vi}/newsroom/portal?mode=staff`, normalizeUiLocale(locale, 'en'))
}

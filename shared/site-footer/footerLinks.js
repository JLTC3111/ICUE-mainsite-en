import { resolveMainSiteLink } from '../site-routes/mainSitePaths.js'

/** Canonical path-based routes for footer and cross-site links on en.icue.vn. */
export const FOOTER_ROUTE_PATHS = {
  home: '/',
  contact: resolveMainSiteLink('Contact', 'en'),
  aboutUs: resolveMainSiteLink('aboutUs', 'en'),
  ourWork: resolveMainSiteLink('ourWork', 'en'),
  pastProjects: resolveMainSiteLink('pastProjects', 'en'),
  recruitment: resolveMainSiteLink('recruitment', 'en'),
  notableAwards: resolveMainSiteLink('notableAwards', 'en'),
  communityActivities: resolveMainSiteLink('communityActivities', 'en'),
  faqs: resolveMainSiteLink('FAQs', 'en'),
  privacy: resolveMainSiteLink('privacy', 'en'),
  terms: resolveMainSiteLink('terms', 'en'),
  gdpr: resolveMainSiteLink('gdpr', 'en'),
  cookies: resolveMainSiteLink('cookies', 'en'),
  news: resolveMainSiteLink('News', 'en'),
  archive: resolveMainSiteLink('newsArchive', 'en'),
  orgStructure: resolveMainSiteLink('orgStructure', 'en'),
  meetOurExperts: resolveMainSiteLink('meetOurExperts', 'en'),
  coreTeam: resolveMainSiteLink('coreTeam', 'en'),
}

function buildFooterLinks() {
  const p = FOOTER_ROUTE_PATHS
  return {
    notableAwards: p.notableAwards,
    news: p.news,
    archive: p.archive,
    faqs: p.faqs,
    recruitment: p.recruitment,
    privacy: p.privacy,
    terms: p.terms,
    gdpr: p.gdpr,
    cookies: p.cookies,
    contact: p.contact,
  }
}

/** @deprecated EN site no longer uses hash routing; kept for API compatibility. */
export function getHashFooterLinks() {
  return buildFooterLinks()
}

export function getStandaloneFooterLinks() {
  return buildFooterLinks()
}

export function getFooterLinks(linkMode = 'standalone') {
  return buildFooterLinks()
}

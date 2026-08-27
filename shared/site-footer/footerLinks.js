const VN_SITE = 'https://icue.vn'

/** Canonical path-based routes for footer and cross-site links on en.icue.vn. */
export const FOOTER_ROUTE_PATHS = {
  home: '/',
  // Contact is the shared Contact app on icue.vn (contact-app in the vn repo).
  // ?site=en keeps it in English and points its chrome back at en.icue.vn.
  contact: `${VN_SITE}/contact?site=en`,
  aboutUs: '/about-us',
  ourWork: `${VN_SITE}/our-work?site=en`,
  pastProjects: '/past-projects',
  recruitment: `${VN_SITE}/recruitment?site=en`,
  notableAwards: '/notable-awards',
  communityActivities: '/community-activities',
  faqs: `${VN_SITE}/faqs?site=en`,
  privacy: '/legal/privacy',
  terms: '/legal/terms',
  gdpr: '/legal/gdpr',
  cookies: '/legal/cookies',
  news: `${VN_SITE}/newsroom/?from=en-news`,
  archive: '/news-archive',
  orgStructure: `${VN_SITE}/structure/`,
  meetOurExperts: `${VN_SITE}/people/experts?site=en`,
  coreTeam: `${VN_SITE}/people/core-team?site=en`,
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

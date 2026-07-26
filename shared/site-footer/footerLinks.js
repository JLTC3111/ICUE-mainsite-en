const VN_SITE = 'https://icue.vn'

/** Canonical path-based routes for footer and cross-site links on en.icue.vn. */
export const FOOTER_ROUTE_PATHS = {
  home: '/',
  contact: '/contact',
  aboutUs: '/about-us',
  ourWork: '/our-work',
  pastProjects: '/past-projects',
  recruitment: '/recruitment',
  notableAwards: '/notable-awards',
  communityActivities: '/community-activities',
  faqs: '/faqs',
  donations: '/donations',
  privacy: '/privacy',
  terms: '/terms',
  gdpr: '/gdpr',
  cookies: '/cookies',
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
    communityActivities: p.communityActivities,
    news: p.news,
    archive: p.archive,
    faqs: p.faqs,
    recruitment: p.recruitment,
    donations: p.donations,
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

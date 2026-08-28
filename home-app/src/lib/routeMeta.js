/**
 * Per-route title/description metadata.
 *
 * Single source of truth for two consumers:
 *  - scripts/postbuild.mjs (root): bakes these into the static SEO shells
 *    (contact.html, about-us.html, etc.) at build time.
 *  - home-app/src/components/RouteHead.jsx: keeps document.title and the
 *    meta description tag in sync during client-side SPA navigation, since
 *    the static shell's <title>/<meta> only apply to the page that was
 *    actually requested from the server — React Router navigation between
 *    routes afterwards never touches the DOM head on its own.
 *
 * Keep pageFile in sync with LEGACY_PAGE_FILES in ./routes.js.
 */
// Contact has no entry here on purpose: /contact redirects to the shared
// Contact app on icue.vn, which carries its own title, description and
// structured data. Building a shell for it would put a static contact.html back
// in the publish directory, and Netlify serves that file in preference to the
// redirect. Same for /community-activities, /faqs and /recruitment.
export const ROUTE_META = [
  {
    slug: 'about-us',
    path: '/about-us',
    pageName: 'aboutUs',
    pageFile: 'aboutUs.html',
    title: 'About Us | ICUE Vietnam',
    description: 'Learn about ICUE Vietnam, our urban-development expertise, values, mission, and people.',
  },
  {
    slug: 'past-projects',
    path: '/past-projects',
    pageName: 'pastProjects',
    pageFile: 'pastProjects.html',
    title: 'Project History | ICUE Vietnam',
    description: 'Explore selected past projects and the project history of ICUE Vietnam.',
  },
  {
    slug: 'news-archive',
    path: '/news-archive',
    pageName: 'newsArchive',
    pageFile: 'News.html',
    title: 'News Archive | ICUE Vietnam',
    description: 'Read news, research updates, project stories, and announcements from ICUE Vietnam.',
  },
  {
    slug: 'notable-awards',
    path: '/notable-awards',
    pageName: 'notableAwards',
    pageFile: 'notableAwards.html',
    title: 'Awards and Recognition | ICUE Vietnam',
    description: 'Discover notable awards, certifications, and professional recognition received by ICUE Vietnam.',
  },
  {
    slug: 'legal/privacy',
    path: '/legal/privacy',
    pageName: 'privacy',
    pageFile: 'privacy.html',
    title: 'Privacy Policy | ICUE Vietnam',
    description: 'Read the ICUE Vietnam privacy policy and learn how personal information is handled.',
  },
  {
    slug: 'legal/terms',
    path: '/legal/terms',
    pageName: 'terms',
    pageFile: 'terms.html',
    title: 'Terms of Use | ICUE Vietnam',
    description: 'Read the terms governing use of the ICUE Vietnam website and services.',
  },
  {
    slug: 'legal/gdpr',
    path: '/legal/gdpr',
    pageName: 'gdpr',
    pageFile: 'gdpr.html',
    title: 'GDPR Rights | ICUE Vietnam',
    description: 'Learn about GDPR data-protection rights and how to exercise them with ICUE Vietnam.',
  },
  {
    slug: 'legal/cookies',
    path: '/legal/cookies',
    pageName: 'cookies',
    pageFile: 'cookies.html',
    title: 'Cookie Policy | ICUE Vietnam',
    description: 'Read the ICUE Vietnam cookie policy and learn how website cookies are used.',
  },
]

export const ROUTE_META_BY_PATH = Object.fromEntries(
  ROUTE_META.map((entry) => [entry.path, entry]),
)

export const DEFAULT_META = {
  title: 'iCUE Vietnam | Innovation Center',
  description: 'Official website of iCUE Vietnam (Innovation Center). Explore our projects, community activities, news, and contact information.',
}

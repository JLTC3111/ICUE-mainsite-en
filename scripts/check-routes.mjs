import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CONTACT_APP_URL,
  COMMUNITY_ACTIVITIES_APP_URL,
  FAQ_APP_URL,
  LEGACY_PAGE_FILES,
  OUR_WORK_APP_URL,
  RECRUITMENT_APP_URL,
  ROUTE_PATHS,
} from '../home-app/src/lib/routes.js'

/*
 * About Us is half-migrated and has been since 2026-08: _redirects sends
 * /about-us to icue.vn with a forced 301, but the React route, the shell and
 * the Express SPA entry are all still here — which is why that redirect needs
 * the `!`. The assertions below describe that reality rather than the
 * fully-migrated shape, so the audit passes; finishing the migration means
 * giving it the same treatment as contact, our-work, faqs and recruitment.
 */
const ABOUT_US_APP_URL = 'https://icue.vn/about-us?site=en'
import { ROUTE_META } from '../home-app/src/lib/routeMeta.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const failures = []
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

const appSource = read('home-app/src/App.jsx')
const mountedKeys = new Set(
  [...appSource.matchAll(/<Route path=\{ROUTE_PATHS\.(\w+)\}/g)].map((match) => match[1]),
)
// contact is a path this site links to but does not render: Netlify sends it to
// the shared Contact app on icue.vn. It stays in ROUTE_PATHS because nav state
// and the redirect rules read it. ourWork has no ROUTE_PATHS entry at all.
const EXTERNALLY_SERVED_ROUTES = new Set(['contact', 'faqs', 'recruitment', 'communityActivities'])
for (const key of Object.keys(ROUTE_PATHS)) {
  if (EXTERNALLY_SERVED_ROUTES.has(key)) continue
  if (!mountedKeys.has(key)) failures.push(`React route is declared but not mounted: ${key}`)
}

for (const file of Object.values(LEGACY_PAGE_FILES)) {
  if (!fs.existsSync(path.join(root, 'legacy/pages', file))) {
    failures.push(`Missing legacy source page: legacy/pages/${file}`)
  }
}
for (const file of ['card.html', 'article_template.html']) {
  if (!fs.existsSync(path.join(root, 'legacy/pages', file))) {
    failures.push(`Missing legacy source page: legacy/pages/${file}`)
  }
}

const redirects = read('_redirects')
const requiredShellPaths = Object.entries(ROUTE_PATHS)
  // contact is served by the shared app on icue.vn, not by a local shell — it
  // is asserted as an external redirect below instead.
  // aboutUs, faqs and recruitment are redirected at the edge instead of being
  // rewritten to a local shell, so none of them has a `<route>.html` rule.
  .filter(([key]) => !['home', 'contact', 'aboutUs', 'faqs', 'recruitment',
    'communityActivities', 'newsArchiveLegacyHtml', 'newsArchiveLegacyAlt'].includes(key))
  .map(([, route]) => route)
for (const route of requiredShellPaths) {
  const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const shell = `${route}.html`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  if (!new RegExp(`^${escaped}\\s+${shell}\\s+200!?\\s*$`, 'm').test(redirects)) {
    failures.push(`Missing route-specific Netlify shell rewrite: ${route}`)
  }
}

const legacyRedirects = {
  '/legacy/pages/Home.html': '/',
  '/legacy/pages/Home_OLD.html': '/',
  '/legacy/pages/Contact.html': CONTACT_APP_URL,
  '/legacy/pages/aboutUs.html': ABOUT_US_APP_URL,
  '/legacy/pages/ourWork.html': OUR_WORK_APP_URL,
  '/legacy/pages/pastProjects.html': ROUTE_PATHS.pastProjects,
  '/legacy/pages/recruitment.html': RECRUITMENT_APP_URL,
  '/legacy/pages/News.html': ROUTE_PATHS.newsArchive,
  '/legacy/pages/orgStructure.html': 'https://icue.vn/structure/',
  '/legacy/pages/notableAwards.html': ROUTE_PATHS.notableAwards,
  '/legacy/pages/communityActivities.html': COMMUNITY_ACTIVITIES_APP_URL,
  '/legacy/pages/FAQs.html': FAQ_APP_URL,
  '/legacy/pages/privacy.html': ROUTE_PATHS.privacy,
  '/legacy/pages/terms.html': ROUTE_PATHS.terms,
  '/legacy/pages/gdpr.html': ROUTE_PATHS.gdpr,
  '/legacy/pages/cookies.html': ROUTE_PATHS.cookies,
}
for (const [from, to] of Object.entries(legacyRedirects)) {
  const line = redirects
    .split('\n')
    .find((candidate) => candidate.trim().startsWith(`${from} `))
  if (!line || !line.trim().split(/\s+/).includes(to)) {
    failures.push(`Missing legacy redirect: ${from} -> ${to}`)
  }
}

const runtimeRouteSources = {
  'server.js': read('server.js'),
  'vite.config.js': read('vite.config.js'),
  'home-app/vite.config.js': read('home-app/vite.config.js'),
}
for (const [file, source] of Object.entries(runtimeRouteSources)) {
  for (const [from, to] of Object.entries(legacyRedirects)) {
    if (!source.includes(from) || !source.includes(to)) {
      failures.push(`Legacy redirect missing from ${file}: ${from} -> ${to}`)
    }
  }
}

// Routes this site links to but does not render. Every layer that can answer a
// request for one — Netlify (_redirects and netlify.toml), Express, and both
// dev servers — has to send it to the app on icue.vn. A local shell left behind
// in any of them wins over the redirect and serves a dead page.
const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const netlifyToml = read('netlify.toml')
const externalRoutes = {
  [ROUTE_PATHS.contact]: CONTACT_APP_URL,
  [`${ROUTE_PATHS.contact}/`]: CONTACT_APP_URL,
  '/our-work': OUR_WORK_APP_URL,
  '/our-work/': OUR_WORK_APP_URL,
  [ROUTE_PATHS.faqs]: FAQ_APP_URL,
  [`${ROUTE_PATHS.faqs}/`]: FAQ_APP_URL,
  [ROUTE_PATHS.recruitment]: RECRUITMENT_APP_URL,
  [`${ROUTE_PATHS.recruitment}/`]: RECRUITMENT_APP_URL,
  [ROUTE_PATHS.communityActivities]: COMMUNITY_ACTIVITIES_APP_URL,
  [`${ROUTE_PATHS.communityActivities}/`]: COMMUNITY_ACTIVITIES_APP_URL,
}
for (const [from, to] of Object.entries(externalRoutes)) {
  if (!new RegExp(`^${escapeRe(from)}\\s+${escapeRe(to)}\\s+301!?\\s*$`, 'm').test(redirects)) {
    failures.push(`Missing external app redirect in _redirects: ${from} -> ${to}`)
  }
  for (const [file, source] of Object.entries(runtimeRouteSources)) {
    if (!source.includes(`'${from}'`) || !source.includes(to)) {
      failures.push(`External app redirect missing from ${file}: ${from} -> ${to}`)
    }
  }
  // A shell rewrite for one of these wins over the redirect and serves a dead
  // page, so netlify.toml must not claim the path at all.
  if (new RegExp(`from = "${escapeRe(from)}"\\s+to = "(?!https:)`, 'm').test(netlifyToml)) {
    failures.push(`netlify.toml rewrites ${from} to a local shell`)
  }
}
// Contact is the one path netlify.toml redirects itself, because a stale
// contact.html once shadowed the _redirects rule.
if (!new RegExp(`from = "${escapeRe(ROUTE_PATHS.contact)}"\\s+to = "${escapeRe(CONTACT_APP_URL)}"`, 'm').test(netlifyToml)) {
  failures.push(`Missing external app redirect in netlify.toml: ${ROUTE_PATHS.contact} -> ${CONTACT_APP_URL}`)
}
for (const [path, label] of [
  [ROUTE_PATHS.contact, 'contact'],
  ['/our-work', 'our-work'],
  [ROUTE_PATHS.faqs, 'faqs'],
  [ROUTE_PATHS.recruitment, 'recruitment'],
  [ROUTE_PATHS.communityActivities, 'community-activities'],
]) {
  if (ROUTE_META.some((route) => route.path === path)) {
    failures.push(`routeMeta.js still builds a ${label} shell, which shadows the redirect`)
  }
}

const serverSource = runtimeRouteSources['server.js']
for (const route of requiredShellPaths) {
  if (!serverSource.includes(`'${route}'`)) {
    failures.push(`Express SPA route missing: ${route}`)
  }
}

for (const copy of ['home-app/public/_redirects', 'dist-home/_redirects']) {
  const copyPath = path.join(root, copy)
  if (fs.existsSync(copyPath) && fs.readFileSync(copyPath, 'utf8') !== redirects) {
    failures.push(`Redirect copy drifted from _redirects: ${copy}`)
  }
}


if (read('legacy/pages/article_template.html').includes('href="/youtube"')) {
  failures.push('Broken local /youtube link remains in article_template.html')
}

if (failures.length) {
  console.error(`Route audit failed:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}

console.log(`Route audit passed: ${mountedKeys.size} React routes, ${requiredShellPaths.length} SPA rewrites, and ${Object.keys(legacyRedirects).length} legacy redirects checked across all runtimes.`)

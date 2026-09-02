import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  ABOUT_US_APP_URL,
  CONTACT_APP_URL,
  COMMUNITY_ACTIVITIES_APP_URL,
  FAQ_APP_URL,
  LEGACY_PAGE_FILES,
  LEGAL_APP_URLS,
  OUR_WORK_APP_URL,
  RECRUITMENT_APP_URL,
  ROUTE_PATHS,
} from '../home-app/src/lib/routes.js'
import { ROUTE_META } from '../home-app/src/lib/routeMeta.js'
import { getBootstrapExternalRedirect } from '../home-app/src/lib/bootstrapExternalRedirect.js'
import { withUiLang } from '../shared/i18n/withUiLang.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const failures = []
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

const appSource = read('home-app/src/App.jsx')
const mainSource = read('home-app/src/main.jsx')
const mountedKeys = new Set(
  [...appSource.matchAll(/<Route path=\{ROUTE_PATHS\.(\w+)\}/g)].map((match) => match[1]),
)
// These are paths this site links to but does not render: the edge sends each
// one to its shared app on icue.vn. They stay in ROUTE_PATHS because nav state
// and redirect rules read them. ourWork has no ROUTE_PATHS entry at all.
const EXTERNALLY_SERVED_ROUTES = new Set([
  'contact',
  'aboutUs',
  'faqs',
  'recruitment',
  'communityActivities',
  'privacy',
  'terms',
  'gdpr',
  'cookies',
])
for (const key of Object.keys(ROUTE_PATHS)) {
  if (EXTERNALLY_SERVED_ROUTES.has(key)) {
    if (mountedKeys.has(key)) failures.push(`Externally served route is still mounted locally: ${key}`)
    continue
  }
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
  // External-app routes are asserted below instead of being rewritten to local
  // shells, so none of them has a `<route>.html` rule.
  .filter(([key]) => !['home', 'contact', 'aboutUs', 'faqs', 'recruitment',
    'communityActivities', 'privacy', 'terms', 'gdpr', 'cookies',
    'newsArchiveLegacyHtml', 'newsArchiveLegacyAlt'].includes(key))
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
  '/legacy/pages/aboutus.html': ABOUT_US_APP_URL,
  '/legacy/pages/aboutus': ABOUT_US_APP_URL,
  '/legacy/pages/ourWork.html': OUR_WORK_APP_URL,
  '/legacy/pages/pastProjects.html': ROUTE_PATHS.pastProjects,
  '/legacy/pages/recruitment.html': RECRUITMENT_APP_URL,
  '/legacy/pages/News.html': ROUTE_PATHS.newsArchive,
  '/legacy/pages/orgStructure.html': 'https://icue.vn/structure/',
  '/legacy/pages/notableAwards.html': ROUTE_PATHS.notableAwards,
  '/legacy/pages/communityActivities.html': COMMUNITY_ACTIVITIES_APP_URL,
  '/legacy/pages/FAQs.html': FAQ_APP_URL,
  '/legacy/pages/privacy.html': LEGAL_APP_URLS.privacy,
  '/legacy/pages/terms.html': LEGAL_APP_URLS.terms,
  '/legacy/pages/gdpr.html': LEGAL_APP_URLS.gdpr,
  '/legacy/pages/cookies.html': LEGAL_APP_URLS.cookies,
  '/legacy-embed/pages/privacy.html': LEGAL_APP_URLS.privacy,
  '/legacy-embed/pages/terms.html': LEGAL_APP_URLS.terms,
  '/legacy-embed/pages/gdpr.html': LEGAL_APP_URLS.gdpr,
  '/legacy-embed/pages/cookies.html': LEGAL_APP_URLS.cookies,
}
for (const [from, to] of Object.entries(legacyRedirects)) {
  const line = redirects
    .split('\n')
    .find((candidate) => candidate.trim().startsWith(`${from} `))
  if (!line || !line.trim().split(/\s+/).includes(to)) {
    failures.push(`Missing legacy redirect: ${from} -> ${to}`)
  } else if (!/\s301!\s*$/.test(line)) {
    failures.push(`Legacy redirect is not forced: ${from}`)
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
  [ROUTE_PATHS.aboutUs]: ABOUT_US_APP_URL,
  [`${ROUTE_PATHS.aboutUs}/`]: ABOUT_US_APP_URL,
  '/about-us.html': ABOUT_US_APP_URL,
  '/our-work': OUR_WORK_APP_URL,
  '/our-work/': OUR_WORK_APP_URL,
  [ROUTE_PATHS.faqs]: FAQ_APP_URL,
  [`${ROUTE_PATHS.faqs}/`]: FAQ_APP_URL,
  [ROUTE_PATHS.recruitment]: RECRUITMENT_APP_URL,
  [`${ROUTE_PATHS.recruitment}/`]: RECRUITMENT_APP_URL,
  [ROUTE_PATHS.communityActivities]: COMMUNITY_ACTIVITIES_APP_URL,
  [`${ROUTE_PATHS.communityActivities}/`]: COMMUNITY_ACTIVITIES_APP_URL,
  [ROUTE_PATHS.privacy]: LEGAL_APP_URLS.privacy,
  [`${ROUTE_PATHS.privacy}/`]: LEGAL_APP_URLS.privacy,
  [ROUTE_PATHS.terms]: LEGAL_APP_URLS.terms,
  [`${ROUTE_PATHS.terms}/`]: LEGAL_APP_URLS.terms,
  [ROUTE_PATHS.gdpr]: LEGAL_APP_URLS.gdpr,
  [`${ROUTE_PATHS.gdpr}/`]: LEGAL_APP_URLS.gdpr,
  [ROUTE_PATHS.cookies]: LEGAL_APP_URLS.cookies,
  [`${ROUTE_PATHS.cookies}/`]: LEGAL_APP_URLS.cookies,
  '/privacy': LEGAL_APP_URLS.privacy,
  '/terms': LEGAL_APP_URLS.terms,
  '/gdpr': LEGAL_APP_URLS.gdpr,
  '/cookies': LEGAL_APP_URLS.cookies,
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

// Contact and About Us have explicit forced redirects in netlify.toml because
// stale/local shells have previously shadowed the canonical external apps.
for (const [from, to] of [
  [ROUTE_PATHS.contact, CONTACT_APP_URL],
  [ROUTE_PATHS.aboutUs, ABOUT_US_APP_URL],
  ['/about-us.html', ABOUT_US_APP_URL],
  ['/legacy/pages/aboutus.html', ABOUT_US_APP_URL],
  ['/legacy/pages/aboutus', ABOUT_US_APP_URL],
  [ROUTE_PATHS.privacy, LEGAL_APP_URLS.privacy],
  [`${ROUTE_PATHS.privacy}/`, LEGAL_APP_URLS.privacy],
  [ROUTE_PATHS.terms, LEGAL_APP_URLS.terms],
  [`${ROUTE_PATHS.terms}/`, LEGAL_APP_URLS.terms],
  [ROUTE_PATHS.gdpr, LEGAL_APP_URLS.gdpr],
  [`${ROUTE_PATHS.gdpr}/`, LEGAL_APP_URLS.gdpr],
  [ROUTE_PATHS.cookies, LEGAL_APP_URLS.cookies],
  [`${ROUTE_PATHS.cookies}/`, LEGAL_APP_URLS.cookies],
  ['/privacy', LEGAL_APP_URLS.privacy],
  ['/terms', LEGAL_APP_URLS.terms],
  ['/gdpr', LEGAL_APP_URLS.gdpr],
  ['/cookies', LEGAL_APP_URLS.cookies],
]) {
  const redirectBlock = new RegExp(
    `from = "${escapeRe(from)}"\\s+to = "${escapeRe(to)}"\\s+status = 301\\s+force = true`,
    'm',
  )
  if (!redirectBlock.test(netlifyToml)) {
    failures.push(`Missing forced external app redirect in netlify.toml: ${from} -> ${to}`)
  }
}

for (const alias of [
  '/about-us',
  '/about-us/',
  '/about-us.html',
  '/legacy/pages/aboutUs.html',
  '/legacy/pages/aboutus.html',
  '/legacy/pages/aboutus',
]) {
  if (getBootstrapExternalRedirect(alias) !== ABOUT_US_APP_URL) {
    failures.push(`About Us bootstrap guard misses alias: ${alias}`)
  }
}
for (const [alias, target] of [
  ['/legal', LEGAL_APP_URLS.privacy],
  ['/legal/privacy', LEGAL_APP_URLS.privacy],
  ['/privacy', LEGAL_APP_URLS.privacy],
  ['/legacy/pages/privacy.html', LEGAL_APP_URLS.privacy],
  ['/legal/terms/', LEGAL_APP_URLS.terms],
  ['/terms', LEGAL_APP_URLS.terms],
  ['/legacy/pages/terms.html', LEGAL_APP_URLS.terms],
  ['/legal/gdpr', LEGAL_APP_URLS.gdpr],
  ['/gdpr', LEGAL_APP_URLS.gdpr],
  ['/legacy/pages/gdpr.html', LEGAL_APP_URLS.gdpr],
  ['/legal/cookies', LEGAL_APP_URLS.cookies],
  ['/cookies', LEGAL_APP_URLS.cookies],
  ['/legacy/pages/cookies.html', LEGAL_APP_URLS.cookies],
]) {
  if (getBootstrapExternalRedirect(alias) !== target) {
    failures.push(`Legal bootstrap guard misses alias: ${alias}`)
  }
}
if (withUiLang(LEGAL_APP_URLS.terms, 'en') !== LEGAL_APP_URLS.terms) {
  failures.push('English Legal app URL does not preserve ?lang=en')
}
if (withUiLang(LEGAL_APP_URLS.terms, 'fr') !== 'https://icue.vn/legal/terms?lang=fr') {
  failures.push('Legal app URL does not preserve a non-English UI language')
}
if (!mainSource.includes('redirectExternalAppAtBootstrap()')) {
  failures.push('Home entry does not run the external-app bootstrap redirect guard')
}
for (const [path, label] of [
  [ROUTE_PATHS.contact, 'contact'],
  [ROUTE_PATHS.aboutUs, 'about-us'],
  ['/our-work', 'our-work'],
  [ROUTE_PATHS.faqs, 'faqs'],
  [ROUTE_PATHS.recruitment, 'recruitment'],
  [ROUTE_PATHS.communityActivities, 'community-activities'],
  [ROUTE_PATHS.privacy, 'legal/privacy'],
  [ROUTE_PATHS.terms, 'legal/terms'],
  [ROUTE_PATHS.gdpr, 'legal/gdpr'],
  [ROUTE_PATHS.cookies, 'legal/cookies'],
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

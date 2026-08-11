import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CONTACT_APP_URL,
  LEGACY_PAGE_FILES,
  ROUTE_PATHS,
} from '../home-app/src/lib/routes.js'
import { ROUTE_META } from '../home-app/src/lib/routeMeta.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const failures = []
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

const appSource = read('home-app/src/App.jsx')
const mountedKeys = new Set(
  [...appSource.matchAll(/<Route path=\{ROUTE_PATHS\.(\w+)\}/g)].map((match) => match[1]),
)
// ourWork and contact are paths this site links to but does not render: Netlify
// sends them to the shared apps on icue.vn. They stay in ROUTE_PATHS so every
// link keeps one source of truth.
const EXTERNALLY_SERVED_ROUTES = new Set(['ourWork', 'contact'])
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
  // ourWork and contact are served by the shared apps on icue.vn, not by local
  // shells — they are asserted as external redirects below instead.
  .filter(([key]) => !['home', 'ourWork', 'contact', 'newsArchiveLegacyHtml', 'newsArchiveLegacyAlt'].includes(key))
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
  '/legacy/pages/aboutUs.html': ROUTE_PATHS.aboutUs,
  '/legacy/pages/ourWork.html': 'https://icue.vn/our-work?site=en',
  '/legacy/pages/pastProjects.html': ROUTE_PATHS.pastProjects,
  '/legacy/pages/recruitment.html': ROUTE_PATHS.recruitment,
  '/legacy/pages/News.html': ROUTE_PATHS.newsArchive,
  '/legacy/pages/orgStructure.html': 'https://icue.vn/structure/',
  '/legacy/pages/notableAwards.html': ROUTE_PATHS.notableAwards,
  '/legacy/pages/communityActivities.html': ROUTE_PATHS.communityActivities,
  '/legacy/pages/FAQs.html': ROUTE_PATHS.faqs,
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
const externalRoutes = {
  [ROUTE_PATHS.contact]: CONTACT_APP_URL,
  [`${ROUTE_PATHS.contact}/`]: CONTACT_APP_URL,
}
const netlifyToml = read('netlify.toml')
for (const [from, to] of Object.entries(externalRoutes)) {
  if (!new RegExp(`^${escapeRe(from)}\\s+${escapeRe(to)}\\s+301!?\\s*$`, 'm').test(redirects)) {
    failures.push(`Missing external app redirect in _redirects: ${from} -> ${to}`)
  }
  if (!new RegExp(`from = "${escapeRe(from)}"\\s+to = "${escapeRe(to)}"`, 'm').test(netlifyToml)) {
    failures.push(`Missing external app redirect in netlify.toml: ${from} -> ${to}`)
  }
  for (const [file, source] of Object.entries(runtimeRouteSources)) {
    if (!source.includes(`'${from}'`) || !source.includes(to)) {
      failures.push(`External app redirect missing from ${file}: ${from} -> ${to}`)
    }
  }
}
if (new RegExp(`to = "${escapeRe(ROUTE_PATHS.contact)}\\.html"`).test(netlifyToml)) {
  failures.push('netlify.toml still rewrites /contact to a local shell')
}
if (ROUTE_META.some((route) => route.path === ROUTE_PATHS.contact)) {
  failures.push('routeMeta.js still builds a /contact shell, which shadows the redirect')
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

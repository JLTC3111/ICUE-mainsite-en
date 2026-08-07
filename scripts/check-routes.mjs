import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  LEGACY_PAGE_FILES,
  ROUTE_PATHS,
} from '../home-app/src/lib/routes.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const failures = []
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

const appSource = read('home-app/src/App.jsx')
const mountedKeys = new Set(
  [...appSource.matchAll(/<Route path=\{ROUTE_PATHS\.(\w+)\}/g)].map((match) => match[1]),
)
// ourWork is a path this site links to but does not render: Netlify sends it to
// the shared Our Work app on icue.vn. It stays in ROUTE_PATHS so every link
// keeps one source of truth.
const EXTERNALLY_SERVED_ROUTES = new Set(['ourWork'])
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
  // ourWork is served by the shared Our Work app on icue.vn, not by a local
  // shell — it is asserted as an external redirect below instead.
  .filter(([key]) => !['home', 'ourWork', 'newsArchiveLegacyHtml', 'newsArchiveLegacyAlt'].includes(key))
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
  '/legacy/pages/Contact.html': ROUTE_PATHS.contact,
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

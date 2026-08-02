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
for (const key of Object.keys(ROUTE_PATHS)) {
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
  .filter(([key]) => !['home', 'newsArchiveLegacyHtml', 'newsArchiveLegacyAlt'].includes(key))
  .map(([, route]) => route)
for (const route of requiredShellPaths) {
  const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const shell = `${route}.html`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  if (!new RegExp(`^${escaped}\\s+${shell}\\s+200!?\\s*$`, 'm').test(redirects)) {
    failures.push(`Missing route-specific Netlify shell rewrite: ${route}`)
  }
}

const legacyRedirects = {
  '/src/pages/Home.html': '/',
  '/src/pages/Home_OLD.html': '/',
  '/src/pages/Contact.html': ROUTE_PATHS.contact,
  '/src/pages/aboutUs.html': ROUTE_PATHS.aboutUs,
  '/src/pages/ourWork.html': ROUTE_PATHS.ourWork,
  '/src/pages/pastProjects.html': ROUTE_PATHS.pastProjects,
  '/src/pages/recruitment.html': ROUTE_PATHS.recruitment,
  '/src/pages/News.html': ROUTE_PATHS.newsArchive,
  '/src/pages/News': ROUTE_PATHS.newsArchive,
  '/src/pages/orgStructure.html': 'https://icue.vn/structure/',
  '/src/pages/notableAwards.html': ROUTE_PATHS.notableAwards,
  '/src/pages/communityActivities.html': ROUTE_PATHS.communityActivities,
  '/src/pages/FAQs.html': ROUTE_PATHS.faqs,
  '/src/pages/privacy.html': ROUTE_PATHS.privacy,
  '/src/pages/terms.html': ROUTE_PATHS.terms,
  '/src/pages/gdpr.html': ROUTE_PATHS.gdpr,
  '/src/pages/cookies.html': ROUTE_PATHS.cookies,
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

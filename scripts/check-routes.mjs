import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  ABOUT_US_APP_URL,
  COMMUNITY_ACTIVITIES_APP_URL,
  CONTACT_APP_URL,
  FAQ_APP_URL,
  LEGAL_APP_URLS,
  NEWS_ARCHIVE_APP_URL,
  NEWSROOM_URL,
  NOTABLE_AWARDS_APP_URL,
  OUR_WORK_APP_URL,
  PAST_PROJECTS_APP_URL,
  pathFromLegacyHash,
  RECRUITMENT_APP_URL,
  ROUTE_PATHS,
} from '../home-app/src/lib/routes.js'
import { ROUTE_META } from '../home-app/src/lib/routeMeta.js'
import { getBootstrapExternalRedirect } from '../home-app/src/lib/bootstrapExternalRedirect.js'
import { withUiLang } from '../shared/i18n/withUiLang.js'
import {
  hostedPathForPage,
  ICUE_VN_HOSTED_PAGES,
  MAIN_SITE_PAGE_PATHS,
  resolveMainSiteDetailLink,
  resolveMainSiteLink,
  SUPPORTED_UI_LOCALES,
  withLocale,
} from '../shared/site-routes/mainSitePaths.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const failures = []
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function fail(message) {
  failures.push(message)
}

const appSource = read('home-app/src/App.jsx')
const mainSource = read('home-app/src/main.jsx')
const mountedKeys = new Set(
  [...appSource.matchAll(/<Route path=\{ROUTE_PATHS\.(\w+)\}/g)].map((match) => match[1]),
)
if (mountedKeys.size !== 1 || !mountedKeys.has('home')) {
  fail(`English app must mount only Home, found: ${[...mountedKeys].join(', ') || '(none)'}`)
}
if (ROUTE_META.length !== 0) {
  fail('English routeMeta.js must not emit subpage canonical shells')
}
if (!mainSource.includes('redirectExternalAppAtBootstrap()')) {
  fail('Home entry does not run the external-app bootstrap redirect guard')
}
if (!appSource.includes('pathFromLegacyHash')) {
  fail('Home app is missing the hash compatibility guard')
}

for (const locale of SUPPORTED_UI_LOCALES) {
  const home = new URL(resolveMainSiteLink('Home', locale))
  const expectedHomeOrigin = locale === 'en' ? 'https://en.icue.vn' : 'https://icue.vn'
  if (home.origin !== expectedHomeOrigin) {
    fail(`Home for ${locale} resolved to ${home.origin}, expected ${expectedHomeOrigin}`)
  }
  if (home.searchParams.get('lang') !== locale) {
    fail(`Home for ${locale} is missing ?lang=${locale}`)
  }
  if (home.searchParams.has('site') || home.searchParams.get('from') === 'en-news') {
    fail(`Home for ${locale} still emits a retired language hint`)
  }

  for (const page of ICUE_VN_HOSTED_PAGES) {
    const url = new URL(resolveMainSiteLink(page, locale))
    if (url.origin !== 'https://icue.vn') {
      fail(`${page} for ${locale} left icue.vn: ${url.href}`)
    }
    if (url.searchParams.get('lang') !== locale) {
      fail(`${page} for ${locale} is missing ?lang=${locale}`)
    }
    if (url.searchParams.has('site') || url.searchParams.get('from') === 'en-news') {
      fail(`${page} for ${locale} still emits a retired language hint`)
    }
    if (url.pathname !== MAIN_SITE_PAGE_PATHS[page] && `${url.pathname}/` !== MAIN_SITE_PAGE_PATHS[page]) {
      fail(`${page} for ${locale} used ${url.pathname}, expected ${MAIN_SITE_PAGE_PATHS[page]}`)
    }
  }
}

if (hostedPathForPage('pastProjects', '/past-projects/12') !== '/past-projects/12') {
  fail('Project detail path is not preserved across locale switching')
}
if (hostedPathForPage('newsArchive', '/news-archive/4') !== '/news-archive/4') {
  fail('Archive article path is not preserved across locale switching')
}
if (resolveMainSiteLink('pastProjects', 'en', undefined, '/past-projects/12') !== 'https://icue.vn/past-projects/12?lang=en') {
  fail('English project detail URL does not keep its id')
}
if (resolveMainSiteLink('newsArchive', 'de', undefined, '/news-archive/4') !== 'https://icue.vn/news-archive/4?lang=de') {
  fail('Archive article URL does not keep its id for a non-English locale')
}
if (resolveMainSiteDetailLink('pastProjects', 3, 'en') !== 'https://icue.vn/past-projects/3?lang=en') {
  fail('Project card helper does not emit a canonical English detail URL')
}
if (resolveMainSiteDetailLink('newsArchive', 8, 'fr') !== 'https://icue.vn/news-archive/8?lang=fr') {
  fail('Article helper does not emit a canonical localized detail URL')
}

if (withLocale('/newsroom/?from=en-news&site=en#latest', 'de') !== '/newsroom/?lang=de#latest') {
  fail('withLocale must strip retired language hints while writing ?lang=')
}
if (withLocale('/contact?lang=vi', 'en') !== '/contact?lang=en') {
  fail('withLocale must replace an existing lang value')
}
if (withUiLang(LEGAL_APP_URLS.terms, 'en') !== LEGAL_APP_URLS.terms) {
  fail('English Legal app URL does not preserve ?lang=en')
}
if (withUiLang(LEGAL_APP_URLS.terms, 'fr') !== 'https://icue.vn/legal/terms?lang=fr') {
  fail('Legal app URL does not preserve a non-English UI language')
}

const hashTargets = {
  '#/Home': '/',
  '#/aboutUs': ABOUT_US_APP_URL,
  '#/pastProjects': PAST_PROJECTS_APP_URL,
  '#/News': NEWS_ARCHIVE_APP_URL,
  '#/newsArchive': NEWS_ARCHIVE_APP_URL,
  '#/Contact': CONTACT_APP_URL,
  '#/ourWork': OUR_WORK_APP_URL,
  '#/FAQs': FAQ_APP_URL,
  '#/notableAwards': NOTABLE_AWARDS_APP_URL,
  '#/meetOurExperts': 'https://icue.vn/people/experts?lang=en',
  '#/coreTeam': 'https://icue.vn/people/core-team?lang=en',
  '#/orgStructure': 'https://icue.vn/structure/?lang=en',
}
for (const [hash, expected] of Object.entries(hashTargets)) {
  const actual = pathFromLegacyHash(hash, 'en')
  if (actual !== expected && !(hash === '#/Home' && (actual === '/' || actual === expected))) {
    fail(`Hash ${hash} maps to ${actual}, expected ${expected}`)
  }
}

const redirects = read('_redirects')
const requiredRedirects = {
  [ROUTE_PATHS.contact]: CONTACT_APP_URL,
  [`${ROUTE_PATHS.contact}/`]: CONTACT_APP_URL,
  [ROUTE_PATHS.aboutUs]: ABOUT_US_APP_URL,
  [`${ROUTE_PATHS.aboutUs}/`]: ABOUT_US_APP_URL,
  '/about-us.html': ABOUT_US_APP_URL,
  '/about-us-legacy': ABOUT_US_APP_URL,
  '/our-work': OUR_WORK_APP_URL,
  '/our-work/': OUR_WORK_APP_URL,
  [ROUTE_PATHS.pastProjects]: PAST_PROJECTS_APP_URL,
  [`${ROUTE_PATHS.pastProjects}/`]: PAST_PROJECTS_APP_URL,
  [ROUTE_PATHS.newsArchive]: NEWS_ARCHIVE_APP_URL,
  [`${ROUTE_PATHS.newsArchive}/`]: NEWS_ARCHIVE_APP_URL,
  [ROUTE_PATHS.notableAwards]: NOTABLE_AWARDS_APP_URL,
  [ROUTE_PATHS.faqs]: FAQ_APP_URL,
  [ROUTE_PATHS.recruitment]: RECRUITMENT_APP_URL,
  [ROUTE_PATHS.communityActivities]: COMMUNITY_ACTIVITIES_APP_URL,
  '/newsroom': NEWSROOM_URL,
  '/people': 'https://icue.vn/people/experts?lang=en',
  '/structure': 'https://icue.vn/structure/?lang=en',
  [ROUTE_PATHS.privacy]: LEGAL_APP_URLS.privacy,
  [ROUTE_PATHS.terms]: LEGAL_APP_URLS.terms,
  [ROUTE_PATHS.gdpr]: LEGAL_APP_URLS.gdpr,
  [ROUTE_PATHS.cookies]: LEGAL_APP_URLS.cookies,
  '/privacy': LEGAL_APP_URLS.privacy,
  '/terms': LEGAL_APP_URLS.terms,
  '/gdpr': LEGAL_APP_URLS.gdpr,
  '/cookies': LEGAL_APP_URLS.cookies,
  '/legacy/pages/Home.html': '/',
  '/legacy/pages/aboutUs.html': ABOUT_US_APP_URL,
  '/legacy/pages/Contact.html': CONTACT_APP_URL,
  '/legacy/pages/pastProjects.html': PAST_PROJECTS_APP_URL,
  '/legacy/pages/News.html': NEWS_ARCHIVE_APP_URL,
  '/legacy/pages/card.html': PAST_PROJECTS_APP_URL,
  '/legacy/pages/article_template.html': NEWS_ARCHIVE_APP_URL,
}

for (const [from, to] of Object.entries(requiredRedirects)) {
  if (!new RegExp(`^${escapeRe(from)}\\s+${escapeRe(to)}\\s+301!?\\s*$`, 'm').test(redirects)) {
    fail(`Missing forced redirect: ${from} -> ${to}`)
  }
}

const splatRedirects = {
  '/past-projects/*': 'https://icue.vn/past-projects/:splat?lang=en',
  '/news-archive/*': 'https://icue.vn/news-archive/:splat?lang=en',
  '/contact/*': 'https://icue.vn/contact/:splat?lang=en',
  '/people/*': 'https://icue.vn/people/:splat?lang=en',
  '/newsroom/*': 'https://icue.vn/newsroom/:splat?lang=en',
}
for (const [from, to] of Object.entries(splatRedirects)) {
  if (!new RegExp(`^${escapeRe(from)}\\s+${escapeRe(to)}\\s+301!?\\s*$`, 'm').test(redirects)) {
    fail(`Missing splat redirect: ${from} -> ${to}`)
  }
}

if (!/^\/legacy\/pages\/card\.html id=:id\s+https:\/\/icue\.vn\/past-projects\/:id\?lang=en\s+301!?$/m.test(redirects)) {
  fail('Missing project-id redirect from card.html')
}
if (!/^\/legacy\/pages\/article_template\.html id=:id\s+https:\/\/icue\.vn\/news-archive\/:id\?lang=en\s+301!?$/m.test(redirects)) {
  fail('Missing article-id redirect from article_template.html')
}

for (const line of redirects.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  if (trimmed.includes('site=en') || trimmed.includes('from=en-news')) {
    fail(`Redirect still emits a retired language hint: ${trimmed}`)
  }
}

const bootstrapCases = [
  ['/about-us', ABOUT_US_APP_URL],
  ['/about-us/', ABOUT_US_APP_URL],
  ['/about-us.html', ABOUT_US_APP_URL],
  ['/legacy/pages/aboutUs.html', ABOUT_US_APP_URL],
  ['/past-projects/9', 'https://icue.vn/past-projects/9?lang=en'],
  ['/news-archive/4', 'https://icue.vn/news-archive/4?lang=en'],
  ['/legacy/pages/card.html', PAST_PROJECTS_APP_URL],
  ['/legacy/pages/article_template.html', NEWS_ARCHIVE_APP_URL],
  ['/legal/terms', LEGAL_APP_URLS.terms],
  ['/terms', LEGAL_APP_URLS.terms],
  ['/newsroom', NEWSROOM_URL],
  ['/people/core-team', 'https://icue.vn/people/core-team?lang=en'],
]
for (const [alias, target] of bootstrapCases) {
  const search = alias.includes('card') || alias.includes('article') ? '' : ''
  if (getBootstrapExternalRedirect(alias, search) !== target) {
    fail(`Bootstrap guard misses alias: ${alias} -> ${target} (got ${getBootstrapExternalRedirect(alias, search)})`)
  }
}
if (getBootstrapExternalRedirect('/legacy/pages/card.html', '?id=6') !== 'https://icue.vn/past-projects/6?lang=en') {
  fail('Bootstrap guard does not preserve a project id from card.html')
}
if (getBootstrapExternalRedirect('/src/pages/article_template.html', '?id=2') !== 'https://icue.vn/news-archive/2?lang=en') {
  fail('Bootstrap guard does not preserve an article id from article_template.html')
}

const runtimeRouteSources = {
  'server.js': read('server.js'),
  'vite.config.js': read('vite.config.js'),
  'home-app/vite.config.js': read('home-app/vite.config.js'),
}
for (const [file, source] of Object.entries(runtimeRouteSources)) {
  if (!source.includes('getBootstrapExternalRedirect') && !source.includes('vnUrl(') && !source.includes('https://icue.vn')) {
    fail(`${file} does not send retired English routes to icue.vn`)
  }
}
if (!runtimeRouteSources['server.js'].includes("vnUrl('/past-projects/'")
  && !runtimeRouteSources['server.js'].includes("vnUrl(`/past-projects/${")) {
  fail('Express does not preserve project detail ids')
}
if (!runtimeRouteSources['server.js'].includes('lang=en')) {
  fail('Express redirects are missing lang=en')
}
if (runtimeRouteSources['server.js'].includes('site=en')) {
  fail('Express redirects still emit site=en')
}

const emittedSources = [
  'shared/main-site-nav/navLinks.jsx',
  'shared/site-footer/footerLinks.js',
  'home-app/src/data/homeContent.js',
  'home-app/src/lib/siteLinks.js',
  'home-app/src/lib/routes.js',
  'public/chatbot/kb.en.json',
  'public/chatbot/kb.vi.json',
]
for (const file of emittedSources) {
  const source = read(file)
  if (source.includes('site=en') || source.includes('from=en-news')) {
    fail(`Newly generated links still emit a retired language hint in ${file}`)
  }
  if (source.includes('card.html') || source.includes('article_template.html')) {
    fail(`Navigation still points at retired HTML in ${file}`)
  }
}

const netlifyToml = read('netlify.toml')
if (/from = "\/about-us"/.test(netlifyToml) && /to = "(?!https:)/.test(netlifyToml)) {
  fail('netlify.toml still rewrites a retired English subpage to a local shell')
}

if (failures.length) {
  console.error(`Route audit failed:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}

console.log(
  `Route audit passed: Home-only English app, ${SUPPORTED_UI_LOCALES.length} locales, `
    + `${ICUE_VN_HOSTED_PAGES.size} icue.vn-hosted pages, and forced compatibility redirects.`,
)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROUTE_META } from '../home-app/src/lib/routeMeta.js'
import {
  ABOUT_US_APP_URL,
  CONTACT_APP_URL,
  COMMUNITY_ACTIVITIES_APP_URL,
  FAQ_APP_URL,
  LEGAL_APP_URLS,
  OUR_WORK_APP_URL,
  RECRUITMENT_APP_URL,
} from '../home-app/src/lib/routes.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist-home')
const failures = []

function assert(condition, message) {
  if (!condition) failures.push(message)
}

function read(file) {
  return fs.readFileSync(file, 'utf8')
}

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(file) : [file]
  })
}

assert(fs.existsSync(dist), 'dist-home/ is missing')

const indexFile = path.join(dist, 'index.html')
assert(fs.existsSync(indexFile), 'dist-home/index.html is missing')
const indexHtml = fs.existsSync(indexFile) ? read(indexFile) : ''
assert(indexHtml.includes('<div id="root"></div>'), 'Production index is missing the React root')

const referencedAssets = [
  ...indexHtml.matchAll(/(?:src|href)="\/(assets\/[^"?#]+)(?:[?#][^"]*)?"/g),
].map((match) => match[1])
assert(referencedAssets.length > 0, 'Production index does not reference a compiled asset')
for (const asset of referencedAssets) {
  assert(fs.existsSync(path.join(dist, asset)), `Production index references missing asset: ${asset}`)
}

assert(ROUTE_META.length === 0, 'English production build must not emit subpage route shells')
for (const leakedShell of [
  'about-us.html',
  'past-projects.html',
  'news-archive.html',
  'notable-awards.html',
  'contact.html',
  'community-activities.html',
  'faqs.html',
  'recruitment.html',
]) {
  assert(!fs.existsSync(path.join(dist, leakedShell)), `English subpage shell leaked into production: ${leakedShell}`)
}

const retiredPublishedFiles = [
  'about-us.html',
  'contact.html',
  'community-activities.html',
  'faqs.html',
  'recruitment.html',
  'legacy/pages/aboutUs.html',
  'legacy/pages/aboutus.html',
  'legacy/pages/aboutus',
  'legacy-embed/pages/aboutUs.html',
  'legacy-embed/pages/aboutus.html',
  'legacy-embed/pages/aboutus',
  'legacy/pages/Contact.html',
  'legacy-embed/pages/Contact.html',
  'legacy/pages/card.html',
  'legacy/pages/article_template.html',
  'legacy-embed/pages/card.html',
  'legacy-embed/pages/article_template.html',
  'src/pages/card.html',
  'src/pages/article_template.html',
  'card.html',
  'article_template.html',
  'legal/privacy.html',
  'legal/terms.html',
  'legal/gdpr.html',
  'legal/cookies.html',
  'legacy/pages/privacy.html',
  'legacy/pages/terms.html',
  'legacy/pages/gdpr.html',
  'legacy/pages/cookies.html',
  'legacy-embed/pages/privacy.html',
  'legacy-embed/pages/terms.html',
  'legacy-embed/pages/gdpr.html',
  'legacy-embed/pages/cookies.html',
]
for (const file of retiredPublishedFiles) {
  assert(!fs.existsSync(path.join(dist, file)), `Retired page leaked into production: ${file}`)
}
for (const retiredDir of ['aboutUs', 'models', 'public', 'legacy', 'legacy-embed', 'src']) {
  assert(!fs.existsSync(path.join(dist, retiredDir)), `Retired/duplicate directory leaked into production: ${retiredDir}`)
}

const publicAliasAssets = [
  'bgVideos/home_bg_1.mp4',
  'certs/leed.png',
  'files/photos.zip',
  'files/speech.pdf',
  'logoIcons/favicon.png',
  'music/mixkit-a-very-happy-christmas-897.mp3',
  'news/articles/Card_1.jpg',
  'pastProjects/pp_1.jpg',
  'recruitment/office.jpg',
  'work/ourWork_img1.jpg',
]
for (const asset of publicAliasAssets) {
  assert(fs.existsSync(path.join(dist, asset)), `Missing asset behind /public compatibility route: ${asset}`)
}

const rootRedirectsFile = path.join(root, '_redirects')
const redirects = read(rootRedirectsFile)
assert(
  /^\/public\/\*\s+\/:splat\s+200\s*$/m.test(redirects),
  'Missing /public/* compatibility rewrite for root-emitted assets',
)
for (const copy of ['home-app/public/_redirects', 'dist-home/_redirects']) {
  const file = path.join(root, copy)
  assert(fs.existsSync(file), `Redirect copy is missing: ${copy}`)
  if (fs.existsSync(file)) {
    assert(read(file) === redirects, `Redirect copy drifted from _redirects: ${copy}`)
  }
}

const requiredExternalRedirects = {
  '/about-us': ABOUT_US_APP_URL,
  '/contact': CONTACT_APP_URL,
  '/our-work': OUR_WORK_APP_URL,
  '/community-activities': COMMUNITY_ACTIVITIES_APP_URL,
  '/faqs': FAQ_APP_URL,
  '/recruitment': RECRUITMENT_APP_URL,
  '/past-projects': 'https://icue.vn/past-projects?lang=en',
  '/news-archive': 'https://icue.vn/news-archive?lang=en',
  '/notable-awards': 'https://icue.vn/notable-awards?lang=en',
  '/legal/privacy': LEGAL_APP_URLS.privacy,
  '/legal/terms': LEGAL_APP_URLS.terms,
  '/legal/gdpr': LEGAL_APP_URLS.gdpr,
  '/legal/cookies': LEGAL_APP_URLS.cookies,
}
for (const [from, to] of Object.entries(requiredExternalRedirects)) {
  for (const variant of [from, `${from}/`]) {
    const tokens = redirects
      .split('\n')
      .map((candidate) => candidate.trim().split(/\s+/))
      .find(([candidate]) => candidate === variant)
    assert(Boolean(tokens), `Missing production redirect: ${variant}`)
    assert(tokens?.[1] === to, `Wrong production redirect target: ${variant}`)
    assert(tokens?.[2] === '301!', `External app redirect is not forced: ${variant}`)
  }
}
for (const [from, to] of Object.entries({
  '/privacy': LEGAL_APP_URLS.privacy,
  '/terms': LEGAL_APP_URLS.terms,
  '/gdpr': LEGAL_APP_URLS.gdpr,
  '/cookies': LEGAL_APP_URLS.cookies,
})) {
  const tokens = redirects
    .split('\n')
    .map((candidate) => candidate.trim().split(/\s+/))
    .find(([candidate]) => candidate === from)
  assert(tokens?.[1] === to, `Wrong Legal app alias target: ${from}`)
  assert(tokens?.[2] === '301!', `Legal app alias is not forced: ${from}`)
}
for (const line of redirects.split('\n')) {
  if (!line.trim().startsWith('/legacy/pages/')) continue
  assert(/\s301!\s*$/.test(line), `Legacy redirect is not forced: ${line.trim()}`)
}
assert(
  /^\/about-us\s+https:\/\/icue\.vn\/about-us\?lang=en\s+301!\s*$/m.test(redirects),
  'About Us redirect is not a forced redirect to the shared English page',
)
assert(
  /^\/about-us\.html\s+https:\/\/icue\.vn\/about-us\?lang=en\s+301!\s*$/m.test(redirects),
  'Retired /about-us.html URL does not redirect to the shared English page',
)
assert(
  !redirects.includes('site=en') && !redirects.includes('from=en-news'),
  'Production redirects still emit retired language hints',
)

const sitemapFile = path.join(dist, 'sitemap.xml')
assert(fs.existsSync(sitemapFile), 'Production sitemap.xml is missing')
const sitemap = fs.existsSync(sitemapFile) ? read(sitemapFile) : ''
assert(sitemap.includes('<loc>https://en.icue.vn/</loc>'), 'Sitemap is missing the English home URL')
for (const route of Object.keys(requiredExternalRedirects)) {
  assert(
    !sitemap.includes(`<loc>https://en.icue.vn${route}</loc>`),
    `Sitemap claims an externally served route as local: ${route}`,
  )
}
assert(
  !/<loc>https:\/\/en\.icue\.vn\/.+<\/loc>/.test(sitemap),
  'Sitemap still lists an English-host subpage canonical',
)

const assetFiles = walk(path.join(dist, 'assets'))
const jsFiles = assetFiles.filter((file) => file.endsWith('.js'))
assert(jsFiles.length > 0, 'No compiled JavaScript assets were produced')
const jsSources = jsFiles.map((file) => ({ file, source: read(file) }))
const allJs = jsSources.map(({ source }) => source).join('\n')

for (const sourceFile of [
  'home-app/src/components/HeroVideoTitle.jsx',
  'shared/main-site-nav/MetallicMenuIcon.jsx',
  'shared/contact-sidebar/ContactSidebar.jsx',
]) {
  assert(
    read(path.join(root, sourceFile)).includes('shouldAvoidCanvasEffects'),
    `Privacy-sensitive visual still probes canvas in restricted browsers: ${sourceFile}`,
  )
}

assert(
  allJs.includes('@ICUE*©ALL*RIGHTS*RESERVED*')
    || allJs.includes('@ICUE*\\xA9ALL*RIGHTS*RESERVED*'),
  'Compiled footer is missing the complete circular rights phrase',
)
assert(allJs.includes('https://icue.vn'), 'Compiled navigation is missing the icue.vn origin')
assert(allJs.includes('/about-us'), 'Compiled navigation is missing the About Us path')
assert(allJs.includes('set("lang"'), 'Compiled navigation does not stamp ?lang=')
for (const slug of ['privacy', 'terms', 'gdpr', 'cookies']) {
  assert(allJs.includes(`/legal/${slug}`), `Compiled navigation is missing Legal app path: /legal/${slug}`)
}
assert(!allJs.includes('?site=en'), 'Compiled bundle still emits ?site=en')
assert(
  allJs.includes('/legacy/pages/aboutus') && allJs.includes('/about-us.html'),
  'Compiled entry is missing the About Us bootstrap redirect guard',
)
assert(
  allJs.includes('/legacy/pages/') && allJs.includes('/legal/terms') && allJs.includes('.html'),
  'Compiled entry is missing the Legal app bootstrap redirect guard',
)
assert(
  jsSources.some(({ source }) => source.includes('data-home-hero-grid-scan')),
  'Home build no longer activates the GridScan canvas',
)
assert(
  allJs.includes('data-gridscan-renderer') && allJs.includes('globalPrivacyControl'),
  'Home build is missing the mobile/privacy-safe GridScan renderer',
)
assert(
  jsSources.some(({ source }) => source.includes('data-gridscan-unavailable')
    && source.includes('WebGL shader compilation failed')),
  'GridScan WebGL fallback did not reach the production bundle',
)

const forbiddenChunkNames = [
  /aboutUs/i,
  /faqPage/i,
  /gsap/i,
  /jobBoard/i,
  /model-viewer/i,
  /postprocessing/i,
]
for (const file of jsFiles) {
  const name = path.basename(file)
  for (const pattern of forbiddenChunkNames) {
    assert(!pattern.test(name), `Retired code is still bundled: ${name}`)
  }
}

if (failures.length) {
  console.error(`Production audit failed:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}

console.log(
  `Production audit passed: ${ROUTE_META.length} route shells, ${referencedAssets.length} entry assets, `
    + `${jsFiles.length} JavaScript bundles, redirects, sitemap, footer copy, and GridScan fallback checked.`,
)

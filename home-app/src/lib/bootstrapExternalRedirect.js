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
  RECRUITMENT_APP_URL,
} from './routes.js'
import { normalizeUiLang, withUiLang } from '../../../shared/i18n/withUiLang.js'

const EXTERNAL_ALIASES = new Map()

function addAliases(target, aliases) {
  for (const alias of aliases) EXTERNAL_ALIASES.set(alias.toLowerCase(), target)
}

addAliases('/', [
  '/src/pages/home.html',
  '/src/pages/home_old.html',
  '/legacy/pages/home.html',
  '/legacy/pages/home_old.html',
  '/legacy-embed/pages/home.html',
  '/legacy-embed/pages/home_old.html',
])
addAliases(ABOUT_US_APP_URL, [
  '/about-us',
  '/about-us.html',
  '/about-us-legacy',
  '/src/pages/aboutus.html',
  '/legacy/pages/aboutus',
  '/legacy/pages/aboutus.html',
  '/legacy-embed/pages/aboutus',
  '/legacy-embed/pages/aboutus.html',
])
addAliases(PAST_PROJECTS_APP_URL, [
  '/past-projects',
  '/past-projects.html',
  '/src/pages/card.html',
  '/src/pages/pastprojects.html',
  '/legacy/pages/card.html',
  '/legacy/pages/pastprojects.html',
  '/legacy-embed/pages/card.html',
  '/legacy-embed/pages/pastprojects.html',
])
addAliases(NEWS_ARCHIVE_APP_URL, [
  '/news-archive',
  '/news-archive.html',
  '/src/pages/article_template.html',
  '/src/pages/news.html',
  '/legacy/pages/article_template.html',
  '/legacy/pages/news',
  '/legacy/pages/news.html',
  '/legacy-embed/pages/article_template.html',
  '/legacy-embed/pages/news.html',
])
addAliases(NOTABLE_AWARDS_APP_URL, [
  '/notable-awards',
  '/notable-awards.html',
  '/src/pages/notableawards.html',
  '/legacy/pages/notableawards.html',
  '/legacy-embed/pages/notableawards.html',
])
addAliases(CONTACT_APP_URL, [
  '/contact',
  '/src/pages/contact.html',
  '/legacy/pages/contact.html',
  '/legacy-embed/pages/contact.html',
])
addAliases(OUR_WORK_APP_URL, [
  '/our-work',
  '/src/pages/ourwork.html',
  '/legacy/pages/ourwork.html',
  '/legacy-embed/pages/ourwork.html',
])
addAliases(FAQ_APP_URL, [
  '/faqs',
  '/src/pages/faqs.html',
  '/legacy/pages/faqs.html',
  '/legacy-embed/pages/faqs.html',
])
addAliases(RECRUITMENT_APP_URL, [
  '/recruitment',
  '/src/pages/recruitment.html',
  '/legacy/pages/recruitment.html',
  '/legacy-embed/pages/recruitment.html',
])
addAliases(COMMUNITY_ACTIVITIES_APP_URL, [
  '/community-activities',
  '/src/pages/communityactivities.html',
  '/legacy/pages/communityactivities.html',
  '/legacy-embed/pages/communityactivities.html',
])
addAliases(NEWSROOM_URL, ['/newsroom'])
addAliases(withUiLang('https://icue.vn/people/experts', 'en'), ['/people'])
addAliases(withUiLang('https://icue.vn/structure/', 'en'), [
  '/structure',
  '/src/pages/orgstructure.html',
  '/legacy/pages/orgstructure.html',
  '/legacy-embed/pages/orgstructure.html',
])

for (const [slug, target] of Object.entries(LEGAL_APP_URLS)) {
  for (const alias of [
    `/legal/${slug}`,
    `/${slug}`,
    `/legacy/pages/${slug}`,
    `/legacy/pages/${slug}.html`,
    `/legacy-embed/pages/${slug}`,
    `/legacy-embed/pages/${slug}.html`,
    `/src/pages/${slug}.html`,
  ]) {
    EXTERNAL_ALIASES.set(alias, target)
  }
}
EXTERNAL_ALIASES.set('/legal', LEGAL_APP_URLS.privacy)

const EXTERNAL_PREFIXES = [
  '/past-projects',
  '/news-archive',
  '/newsroom',
  '/people',
  '/structure',
  '/our-work',
  '/contact',
  '/faqs',
  '/recruitment',
  '/community-activities',
  '/legal',
]

function legacyDetailTarget(pathname, search) {
  const normalized = pathname.toLowerCase()
  const id = new URLSearchParams(search || '').get('id')
  if (!id) return null
  if (['/src/pages/card.html', '/legacy/pages/card.html', '/legacy-embed/pages/card.html'].includes(normalized)) {
    return withUiLang(`https://icue.vn/past-projects/${encodeURIComponent(id)}`, 'en')
  }
  if ([
    '/src/pages/article_template.html',
    '/legacy/pages/article_template.html',
    '/legacy-embed/pages/article_template.html',
  ].includes(normalized)) {
    return withUiLang(`https://icue.vn/news-archive/${encodeURIComponent(id)}`, 'en')
  }
  return null
}

export function getBootstrapExternalRedirect(pathname, search = '') {
  if (!pathname) return null
  const cleanPath = `/${pathname.split('/').filter(Boolean).join('/')}`
  const normalized = cleanPath.toLowerCase()
  const incoming = new URLSearchParams(search)
  const language = normalizeUiLang(incoming.get('lang'), 'en')
  const detailTarget = legacyDetailTarget(normalized, search)
  let target = detailTarget || EXTERNAL_ALIASES.get(normalized)
    || (EXTERNAL_PREFIXES.some((prefix) => normalized.startsWith(`${prefix}/`))
      ? `https://icue.vn${cleanPath}` : null)
  if (language !== 'en' && (normalized === '/' || normalized === '/index.html' || target === '/')) {
    target = 'https://icue.vn/'
  }
  if (!target) return null

  const url = new URL(target, 'https://en.icue.vn')
  // Keep campaign/filter parameters; a legacy detail id is now part of the path.
  for (const [key, value] of incoming) {
    if (key === 'lang' || (key === 'id' && detailTarget)) continue
    url.searchParams.append(key, value)
  }
  const href = target.startsWith('/') ? `${url.pathname}${url.search}` : url.href
  return withUiLang(href, language)
}

export function redirectExternalAppAtBootstrap(locationObject = window.location) {
  const target = getBootstrapExternalRedirect(locationObject.pathname, locationObject.search)
  if (!target) return false
  const destination = new URL(target, locationObject.href)
  if (!destination.hash) destination.hash = locationObject.hash || ''
  if (destination.href === locationObject.href) return false
  locationObject.replace(destination.href)
  return true
}

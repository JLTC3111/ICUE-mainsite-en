const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const BUILD_ROOT = path.join(ROOT, 'dist-home');
const BUILD_INDEX = path.join(BUILD_ROOT, 'index.html');
const HAS_PRODUCTION_BUILD = fs.existsSync(BUILD_INDEX);
const VN_ORIGIN = 'https://icue.vn';

function vnUrl(pathname) {
  return `${VN_ORIGIN}${pathname}?lang=en`;
}

const EXTERNAL_EXACT = new Map([
  ['/contact', vnUrl('/contact')],
  ['/about-us', vnUrl('/about-us')],
  ['/about-us.html', vnUrl('/about-us')],
  ['/about-us-legacy', vnUrl('/about-us')],
  ['/our-work', vnUrl('/our-work')],
  ['/past-projects', vnUrl('/past-projects')],
  ['/past-projects.html', vnUrl('/past-projects')],
  ['/news-archive', vnUrl('/news-archive')],
  ['/news-archive.html', vnUrl('/news-archive')],
  ['/notable-awards', vnUrl('/notable-awards')],
  ['/notable-awards.html', vnUrl('/notable-awards')],
  ['/faqs', vnUrl('/faqs')],
  ['/recruitment', vnUrl('/recruitment')],
  ['/community-activities', vnUrl('/community-activities')],
  ['/newsroom', vnUrl('/newsroom/')],
  ['/people', vnUrl('/people/experts')],
  ['/structure', vnUrl('/structure/')],
  ['/legal', vnUrl('/legal/privacy')],
  ['/privacy', vnUrl('/legal/privacy')],
  ['/terms', vnUrl('/legal/terms')],
  ['/gdpr', vnUrl('/legal/gdpr')],
  ['/cookies', vnUrl('/legal/cookies')],
])

const EXTERNAL_PREFIXES = new Set([
  '/contact',
  '/our-work',
  '/past-projects',
  '/news-archive',
  '/faqs',
  '/recruitment',
  '/community-activities',
  '/newsroom',
  '/people',
  '/structure',
  '/legal',
])

const LEGACY_EXACT = new Map([
  ['/legacy/pages/home.html', '/'],
  ['/legacy/pages/home_old.html', '/'],
  ['/legacy-embed/pages/home.html', '/'],
  ['/legacy-embed/pages/home_old.html', '/'],
  ['/src/pages/home.html', '/'],
  ['/src/pages/home_old.html', '/'],
  ['/legacy/pages/contact.html', vnUrl('/contact')],
  ['/legacy-embed/pages/contact.html', vnUrl('/contact')],
  ['/src/pages/contact.html', vnUrl('/contact')],
  ['/legacy/pages/aboutus.html', vnUrl('/about-us')],
  ['/legacy/pages/aboutus', vnUrl('/about-us')],
  ['/legacy-embed/pages/aboutus.html', vnUrl('/about-us')],
  ['/src/pages/aboutus.html', vnUrl('/about-us')],
  ['/legacy/pages/ourwork.html', vnUrl('/our-work')],
  ['/legacy-embed/pages/ourwork.html', vnUrl('/our-work')],
  ['/src/pages/ourwork.html', vnUrl('/our-work')],
  ['/legacy/pages/pastprojects.html', vnUrl('/past-projects')],
  ['/legacy-embed/pages/pastprojects.html', vnUrl('/past-projects')],
  ['/src/pages/pastprojects.html', vnUrl('/past-projects')],
  ['/legacy/pages/news.html', vnUrl('/news-archive')],
  ['/legacy/pages/news', vnUrl('/news-archive')],
  ['/legacy-embed/pages/news.html', vnUrl('/news-archive')],
  ['/src/pages/news.html', vnUrl('/news-archive')],
  ['/legacy/pages/notableawards.html', vnUrl('/notable-awards')],
  ['/legacy-embed/pages/notableawards.html', vnUrl('/notable-awards')],
  ['/src/pages/notableawards.html', vnUrl('/notable-awards')],
  ['/legacy/pages/communityactivities.html', vnUrl('/community-activities')],
  ['/legacy-embed/pages/communityactivities.html', vnUrl('/community-activities')],
  ['/src/pages/communityactivities.html', vnUrl('/community-activities')],
  ['/legacy/pages/faqs.html', vnUrl('/faqs')],
  ['/legacy-embed/pages/faqs.html', vnUrl('/faqs')],
  ['/src/pages/faqs.html', vnUrl('/faqs')],
  ['/legacy/pages/recruitment.html', vnUrl('/recruitment')],
  ['/legacy-embed/pages/recruitment.html', vnUrl('/recruitment')],
  ['/src/pages/recruitment.html', vnUrl('/recruitment')],
  ['/legacy/pages/orgstructure.html', vnUrl('/structure/')],
  ['/legacy-embed/pages/orgstructure.html', vnUrl('/structure/')],
  ['/src/pages/orgstructure.html', vnUrl('/structure/')],
])

for (const slug of ['privacy', 'terms', 'gdpr', 'cookies']) {
  const target = vnUrl(`/legal/${slug}`);
  for (const root of ['/legacy/pages', '/legacy-embed/pages', '/src/pages']) {
    LEGACY_EXACT.set(`${root}/${slug}.html`, target);
  }
}

function legacyDetailTarget(pathname, search) {
  const id = new URLSearchParams(search || '').get('id');
  const cardPaths = new Set([
    '/legacy/pages/card.html',
    '/legacy-embed/pages/card.html',
    '/src/pages/card.html',
  ]);
  const articlePaths = new Set([
    '/legacy/pages/article_template.html',
    '/legacy-embed/pages/article_template.html',
    '/src/pages/article_template.html',
  ]);

  if (cardPaths.has(pathname)) {
    return id ? vnUrl(`/past-projects/${encodeURIComponent(id)}`) : vnUrl('/past-projects');
  }
  if (articlePaths.has(pathname)) {
    return id ? vnUrl(`/news-archive/${encodeURIComponent(id)}`) : vnUrl('/news-archive');
  }
  return null;
}

function externalRedirectFor(req) {
  const cleanPath = `/${req.path.split('/').filter(Boolean).join('/')}`;
  const normalized = cleanPath.toLowerCase();
  const detailTarget = legacyDetailTarget(normalized, req.originalUrl.split('?')[1] || '');
  if (detailTarget) return detailTarget;
  if (LEGACY_EXACT.has(normalized)) return LEGACY_EXACT.get(normalized);
  if (EXTERNAL_EXACT.has(normalized)) return EXTERNAL_EXACT.get(normalized);

  for (const prefix of EXTERNAL_PREFIXES) {
    if (normalized.startsWith(`${prefix}/`)) return vnUrl(cleanPath);
  }
  return null;
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  const target = externalRedirectFor(req);
  return target ? res.redirect(301, target) : next();
});

const staticOpts = {
  index: false,
  dotfiles: 'deny',
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
};

app.use(
  '/public',
  express.static(HAS_PRODUCTION_BUILD ? BUILD_ROOT : path.join(ROOT, 'public'), staticOpts),
);
app.use(express.static(HAS_PRODUCTION_BUILD ? BUILD_ROOT : ROOT, staticOpts));

function sendAppShell(_req, res) {
  return res.sendFile(HAS_PRODUCTION_BUILD ? BUILD_INDEX : path.join(ROOT, 'index.html'));
}

app.get('/', sendAppShell);
app.use((req, res) => {
  res.status(404);
  sendAppShell(req, res);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

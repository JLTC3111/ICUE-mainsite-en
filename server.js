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
// Contact is served by the shared Contact app on icue.vn (contact-app in the vn
// repo), so it is redirected rather than rendered here. ?site=en keeps the page
// in English and sends its chrome links back to en.icue.vn.
const CONTACT_APP_URL = 'https://icue.vn/contact?site=en';
const OUR_WORK_APP_URL = 'https://icue.vn/our-work?site=en';
const ABOUT_US_APP_URL = 'https://icue.vn/about-us?site=en';
const FAQ_APP_URL = 'https://icue.vn/faqs?site=en';
const RECRUITMENT_APP_URL = 'https://icue.vn/recruitment?site=en';
const COMMUNITY_ACTIVITIES_APP_URL = 'https://icue.vn/community-activities?site=en';
const EXTERNAL_ROUTES = {
  '/contact': CONTACT_APP_URL,
  '/contact/': CONTACT_APP_URL,
  '/about-us': ABOUT_US_APP_URL,
  '/about-us/': ABOUT_US_APP_URL,
  '/about-us.html': ABOUT_US_APP_URL,
  '/our-work': OUR_WORK_APP_URL,
  '/our-work/': OUR_WORK_APP_URL,
  '/faqs': FAQ_APP_URL,
  '/faqs/': FAQ_APP_URL,
  '/recruitment': RECRUITMENT_APP_URL,
  '/recruitment/': RECRUITMENT_APP_URL,
  '/community-activities': COMMUNITY_ACTIVITIES_APP_URL,
  '/community-activities/': COMMUNITY_ACTIVITIES_APP_URL,
};
const SPA_ROUTES = [
  '/past-projects',
  '/news-archive',
  '/notable-awards',
  '/legal/privacy',
  '/legal/terms',
  '/legal/gdpr',
  '/legal/cookies',
];
const LEGACY_REDIRECTS = {
  '/legacy/pages/Home.html': '/',
  '/legacy/pages/Home_OLD.html': '/',
  '/legacy/pages/Contact.html': CONTACT_APP_URL,
  '/legacy/pages/aboutUs.html': ABOUT_US_APP_URL,
  '/legacy/pages/ourWork.html': OUR_WORK_APP_URL,
  '/legacy/pages/pastProjects.html': '/past-projects',
  '/legacy/pages/recruitment.html': RECRUITMENT_APP_URL,
  '/legacy/pages/News.html': '/news-archive',
  '/legacy/pages/orgStructure.html': 'https://icue.vn/structure/',
  '/legacy/pages/notableAwards.html': '/notable-awards',
  '/legacy/pages/communityActivities.html': COMMUNITY_ACTIVITIES_APP_URL,
  '/legacy/pages/FAQs.html': FAQ_APP_URL,
  '/legacy/pages/privacy.html': '/legal/privacy',
  '/legacy/pages/terms.html': '/legal/terms',
  '/legacy/pages/gdpr.html': '/legal/gdpr',
  '/legacy/pages/cookies.html': '/legal/cookies',
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const staticOpts = {
  index: false,
  dotfiles: 'deny',
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
};
app.get(Object.keys(LEGACY_REDIRECTS), (req, res) => {
  res.redirect(301, LEGACY_REDIRECTS[req.path]);
});

app.get(Object.keys(EXTERNAL_ROUTES), (req, res) => {
  res.redirect(301, EXTERNAL_ROUTES[req.path]);
});

// Production assets are emitted at the build root. Mount that directory at
// /public as well to preserve historical /public/* URLs without keeping a
// second physical copy of the deploy. Source assets are a development-only
// fallback when no build exists yet.
app.use(
  '/public',
  express.static(HAS_PRODUCTION_BUILD ? BUILD_ROOT : path.join(ROOT, 'public'), staticOpts),
);
app.use(
  '/legacy-embed',
  express.static(path.join(ROOT, 'dist-home', 'legacy-embed'), staticOpts),
  express.static(path.join(ROOT, 'legacy-embed'), staticOpts),
  express.static(path.join(ROOT, 'home-app', 'public', 'legacy-embed'), staticOpts),
);
for (const dir of [
  'assets',
  'aboutUs',
  'bgVideos',
  'flags',
  'legacy',
  'logoIcons',
  'models',
  'news',
  'pastProjects',
  'recruitment',
  'work',
]) {
  app.use(
    `/${dir}`,
    express.static(path.join(BUILD_ROOT, dir), staticOpts),
    express.static(path.join(ROOT, dir), staticOpts),
  );
}
app.get('/styles.css', (_req, res) => {
  res.sendFile(path.join(ROOT, 'styles.css'));
});

function sendAppShell(req, res) {
  if (HAS_PRODUCTION_BUILD && req.path !== '/') {
    const routeShell = path.join(BUILD_ROOT, `${req.path.replace(/^\//, '')}.html`);
    if (fs.existsSync(routeShell)) return res.sendFile(routeShell);
  }
  return res.sendFile(HAS_PRODUCTION_BUILD ? BUILD_INDEX : path.join(ROOT, 'index.html'));
}

app.get('/', sendAppShell);

app.use((req, res, next) => {
  if (
    req.method === 'GET' &&
    req.path.length > 1 &&
    req.path.endsWith('/') &&
    SPA_ROUTES.includes(req.path.slice(0, -1))
  ) {
    const search = req.originalUrl.includes('?')
      ? req.originalUrl.slice(req.originalUrl.indexOf('?'))
      : '';
    return res.redirect(301, `${req.path.slice(0, -1)}${search}`);
  }
  return next();
});

app.get(SPA_ROUTES, sendAppShell);

app.use((req, res) => {
  res.status(404);
  sendAppShell(req, res);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

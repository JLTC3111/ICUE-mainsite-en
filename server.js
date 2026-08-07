const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const SPA_ROUTES = [
  '/contact',
  '/about-us',
  '/our-work',
  '/past-projects',
  '/recruitment',
  '/news-archive',
  '/notable-awards',
  '/community-activities',
  '/faqs',
  '/privacy',
  '/terms',
  '/gdpr',
  '/cookies',
];
const LEGACY_REDIRECTS = {
  '/legacy/pages/Home.html': '/',
  '/legacy/pages/Home_OLD.html': '/',
  '/legacy/pages/Contact.html': '/contact',
  '/legacy/pages/aboutUs.html': '/about-us',
  '/legacy/pages/ourWork.html': 'https://icue.vn/our-work?site=en',
  '/legacy/pages/pastProjects.html': '/past-projects',
  '/legacy/pages/recruitment.html': '/recruitment',
  '/legacy/pages/News.html': '/news-archive',
  '/legacy/pages/orgStructure.html': 'https://icue.vn/structure/',
  '/legacy/pages/notableAwards.html': '/notable-awards',
  '/legacy/pages/communityActivities.html': '/community-activities',
  '/legacy/pages/FAQs.html': '/faqs',
  '/legacy/pages/privacy.html': '/privacy',
  '/legacy/pages/terms.html': '/terms',
  '/legacy/pages/gdpr.html': '/gdpr',
  '/legacy/pages/cookies.html': '/cookies',
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

app.use('/public', express.static(path.join(ROOT, 'public'), staticOpts));
app.use(
  '/legacy-embed',
  express.static(path.join(ROOT, 'legacy-embed'), staticOpts),
  express.static(path.join(ROOT, 'dist-home', 'legacy-embed'), staticOpts),
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
  app.use(`/${dir}`, express.static(path.join(ROOT, dir), staticOpts));
}
app.get('/styles.css', (_req, res) => {
  res.sendFile(path.join(ROOT, 'styles.css'));
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

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

app.get(SPA_ROUTES, (_req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

app.use((_req, res) => {
  res.status(404).sendFile(path.join(ROOT, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

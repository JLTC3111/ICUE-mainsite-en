const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./server/db/client');
const { apiRouter, pagesRouter } = require('./server/payments/routes');
const { handlePaypalWebhook } = require('./server/payments/webhooks');
const paypal = require('./server/payments/providers/paypal');

initDatabase();

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
  '/donations',
  '/privacy',
  '/terms',
  '/gdpr',
  '/cookies',
];
const LEGACY_REDIRECTS = {
  '/src/pages/Home.html': '/',
  '/src/pages/Home_OLD.html': '/',
  '/src/pages/Contact.html': '/contact',
  '/src/pages/aboutUs.html': '/about-us',
  '/src/pages/ourWork.html': '/our-work',
  '/src/pages/pastProjects.html': '/past-projects',
  '/src/pages/recruitment.html': '/recruitment',
  '/src/pages/News.html': '/news-archive',
  '/src/pages/News': '/news-archive',
  '/src/pages/orgStructure.html': 'https://icue.vn/structure/',
  '/src/pages/notableAwards.html': '/notable-awards',
  '/src/pages/communityActivities.html': '/community-activities',
  '/src/pages/FAQs.html': '/faqs',
  '/src/pages/donations.html': '/donations',
  '/src/pages/privacy.html': '/privacy',
  '/src/pages/terms.html': '/terms',
  '/src/pages/gdpr.html': '/gdpr',
  '/src/pages/cookies.html': '/cookies',
  '/legacy/pages/Home.html': '/',
  '/legacy/pages/Home_OLD.html': '/',
  '/legacy/pages/Contact.html': '/contact',
  '/legacy/pages/aboutUs.html': '/about-us',
  '/legacy/pages/ourWork.html': '/our-work',
  '/legacy/pages/pastProjects.html': '/past-projects',
  '/legacy/pages/recruitment.html': '/recruitment',
  '/legacy/pages/News.html': '/news-archive',
  '/legacy/pages/orgStructure.html': 'https://icue.vn/structure/',
  '/legacy/pages/card.html': '/src/pages/card.html',
  '/legacy/pages/article_template.html': '/src/pages/article_template.html',
  '/legacy/pages/notableAwards.html': '/notable-awards',
  '/legacy/pages/communityActivities.html': '/community-activities',
  '/legacy/pages/FAQs.html': '/faqs',
  '/legacy/pages/donations.html': '/donations',
  '/legacy/pages/privacy.html': '/privacy',
  '/legacy/pages/terms.html': '/terms',
  '/legacy/pages/gdpr.html': '/gdpr',
  '/legacy/pages/cookies.html': '/cookies',
};

async function handlePaypalWebhookRoute(req, res) {
  try {
    const event = JSON.parse(req.body.toString('utf8'));
    // Verify signature via PayPal REST endpoint before processing.
    await paypal.verifyWebhookSignature(req.headers, event);
    handlePaypalWebhook(event);
    res.json({ received: true });
  } catch (err) {
    console.error('[webhook] PayPal parse error:', err.message);
    res.status(400).send('Invalid payload');
  }
}

app.post(
  '/api/webhooks/paypal',
  express.raw({ type: 'application/json' }),
  handlePaypalWebhookRoute
);

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
app.use('/src', express.static(path.join(ROOT, 'src'), staticOpts));
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

app.use('/api', apiRouter);
app.use(pagesRouter);

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
  console.log(`Visit http://localhost:${PORT}/donations to donate`);
});

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function createApp() {
  const { getBootstrapExternalRedirect } = await import('./home-app/src/lib/bootstrapExternalRedirect.js');
  const { createChatMiddleware } = await import('./scripts/lib/chat-routes.mjs');
  const app = express();
  const root = __dirname;
  const buildRoot = path.join(root, 'dist-home');
  const hasBuild = fs.existsSync(path.join(buildRoot, 'index.html'));
  app.use(cors());
  app.use(createChatMiddleware());
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    const search = req.originalUrl.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?')) : '';
    const target = getBootstrapExternalRedirect(req.path, search);
    return target ? res.redirect(301, target) : next();
  });
  const staticOpts = {
    index: false,
    dotfiles: 'deny',
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  };
  app.use('/public', express.static(hasBuild ? buildRoot : path.join(root, 'public'), staticOpts));
  // Never expose the repository itself when a build has not been generated.
  if (hasBuild) app.use(express.static(buildRoot, staticOpts));
  else {
    app.use('/assets', express.static(path.join(root, 'assets'), staticOpts));
    app.use(express.static(path.join(root, 'public'), staticOpts));
  }
  const sendAppShell = (_req, res) => res.sendFile(path.join(hasBuild ? buildRoot : root, 'index.html'));
  app.get('/', sendAppShell);
  app.use((req, res) => { res.status(404); sendAppShell(req, res); });
  return app;
}

module.exports = { createApp };
if (require.main === module) {
  createApp().then(app => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  }).catch(error => { console.error(error); process.exitCode = 1; });
}

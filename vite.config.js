import fs from 'node:fs';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jsx': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

function publicDevFallback() {
  const root = process.cwd();
  return {
    name: 'public-dev-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const urlPath = (req.url || '').split('?')[0];
        if (!urlPath.startsWith('/public/')) {
          return next();
        }

        const rel = urlPath.replace(/^\/public\/?/, '');
        const filePath = path.join(root, 'public', rel);
        if (rel && path.extname(rel) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          res.statusCode = 200;
          res.setHeader('Content-Type', MIME[path.extname(rel).toLowerCase()] || 'application/octet-stream');
          res.end(fs.readFileSync(filePath));
          return;
        }

        next();
      });
    },
  };
}

function resolveExistingFile(...candidates) {
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

function homeDevFallback() {
  const root = process.cwd();
  const appDir = path.resolve(root, 'dist-home');
  const viteInternals = ['/@vite', '/@fs', '/@id', '/@react-refresh'];

  const legacyShellSrcPages = new Set([
    '/src/pages/News.html',
    '/src/pages/News',
    '/src/pages/notableAwards.html',
    '/src/pages/communityActivities.html',
    '/src/pages/FAQs.html',
    '/src/pages/donations.html',
    '/src/pages/privacy.html',
    '/src/pages/terms.html',
    '/src/pages/gdpr.html',
    '/src/pages/cookies.html',
  ]);

  const legacyPageRedirects = {
    '/legacy/pages/News.html': '/src/pages/News.html',
    '/legacy/pages/notableAwards.html': '/notable-awards',
    '/legacy/pages/communityActivities.html': '/community-activities',
    '/legacy/pages/FAQs.html': '/faqs',
    '/legacy/pages/donations.html': '/donations',
    '/legacy/pages/privacy.html': '/privacy',
    '/legacy/pages/terms.html': '/terms',
    '/legacy/pages/gdpr.html': '/gdpr',
    '/legacy/pages/cookies.html': '/cookies',
  };

  const staticSrcRedirects = {
    '/src/pages/notableAwards.html': '/notable-awards',
    '/src/pages/communityActivities.html': '/community-activities',
    '/src/pages/FAQs.html': '/faqs',
    '/src/pages/donations.html': '/donations',
    '/src/pages/privacy.html': '/privacy',
    '/src/pages/terms.html': '/terms',
    '/src/pages/gdpr.html': '/gdpr',
    '/src/pages/cookies.html': '/cookies',
  };

  return {
    name: 'home-dev-fallback',
    configureServer(server) {
      // Pre-middleware: rewrite News archive to the React shell before Vite
      // can serve the static src/pages/News.html file.
      return () => {
        server.middlewares.use((req, res, next) => {
          const urlPath = (req.url || '').split('?')[0];

          if (viteInternals.some((prefix) => urlPath.startsWith(prefix))) return next();

          if (legacyShellSrcPages.has(urlPath)) {
            req.url = '/index.html';
            return next();
          }

          if (staticSrcRedirects[urlPath]) {
            res.statusCode = 302;
            res.setHeader('Location', staticSrcRedirects[urlPath]);
            res.end();
            return;
          }

          if (legacyPageRedirects[urlPath]) {
            const wantsEmbed =
              req.headers['x-icue-legacy-embed'] === '1' ||
              req.headers['sec-fetch-dest'] === 'empty' ||
              req.headers['sec-fetch-mode'] === 'cors';

            if (!wantsEmbed) {
              res.statusCode = 302;
              res.setHeader('Location', legacyPageRedirects[urlPath]);
              res.end();
              return;
            }

            const legacyPath = path.join(appDir, urlPath.slice(1));
            const rootLegacyPath = path.join(root, urlPath.slice(1));
            const matched = resolveExistingFile(legacyPath, rootLegacyPath);
            if (matched) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.end(fs.readFileSync(matched, 'utf-8'));
              return;
            }
          }

          const rel = urlPath.replace(/^\//, '');
          const filePath = path.join(appDir, rel);
          const rootFilePath = path.join(root, rel);
          const hasExtension = Boolean(rel && path.extname(rel));
          const indexPath = path.join(appDir, 'index.html');

          if (hasExtension) {
            const matched = resolveExistingFile(
              filePath,
              rootFilePath,
              urlPath.startsWith('/public/')
                ? path.join(appDir, rel.replace(/^public\//, ''))
                : null,
            );
            if (matched) {
              res.statusCode = 200;
              res.setHeader('Content-Type', MIME[path.extname(matched).toLowerCase()] || 'application/octet-stream');
              res.end(fs.readFileSync(matched));
              return;
            }

            return next();
          }

          const htmlMatch = resolveExistingFile(
            `${filePath}.html`,
            `${rootFilePath}.html`,
            path.join(appDir, `${rel}.html`),
            path.join(root, `${rel}.html`),
          );
          if (htmlMatch) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(fs.readFileSync(htmlMatch));
            return;
          }

          if (!fs.existsSync(indexPath)) {
            res.statusCode = 503;
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end('Home app not built. Run npm run build:home first (or npm run dev, which builds it automatically).');
            return;
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(fs.readFileSync(indexPath, 'utf-8'));
        });
      };
    },
  };
}

export default defineConfig({
  publicDir: 'public',
  base: '',
  plugins: [react(), publicDevFallback(), homeDevFallback()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      '@icue/main-site-nav': path.resolve(__dirname, 'shared/main-site-nav'),
      '@icue/drawer-menu': path.resolve(__dirname, 'shared/drawer-menu'),
      '@icue/home-layout': path.resolve(__dirname, 'shared/home-layout'),
      '@icue/ui': path.resolve(__dirname, 'shared/ui'),
      '@icue/site-footer': path.resolve(__dirname, 'shared/site-footer'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/donations': 'http://localhost:3000',
    },
  },
});

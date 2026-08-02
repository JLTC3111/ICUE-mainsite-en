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

  const legacyPageRedirects = {
    '/legacy/pages/Home.html': '/',
    '/legacy/pages/Home_OLD.html': '/',
    '/legacy/pages/Contact.html': '/contact',
    '/legacy/pages/aboutUs.html': '/about-us',
    '/legacy/pages/ourWork.html': '/our-work',
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

  return {
    name: 'home-dev-fallback',
    configureServer(server) {
      // Pre-middleware: rewrite News archive to the React shell before Vite
      // can serve the static legacy/pages/News.html file.
      return () => {
        server.middlewares.use((req, res, next) => {
          const urlPath = (req.url || '').split('?')[0];

          if (viteInternals.some((prefix) => urlPath.startsWith(prefix))) return next();

          if (legacyPageRedirects[urlPath]) {
            res.statusCode = 302;
            res.setHeader('Location', legacyPageRedirects[urlPath]);
            res.end();
            return;
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
});

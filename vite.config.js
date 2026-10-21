import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { getBootstrapExternalRedirect } from './home-app/src/lib/bootstrapExternalRedirect.js';
import { resolveStaticFile, safeRequestPath, serveStaticFile } from './scripts/lib/static-files.mjs';
import { createChatMiddleware } from './scripts/lib/chat-routes.mjs';

function publicDevFallback() {
  const root = process.cwd();
  return {
    name: 'public-dev-fallback',
    configureServer(server) {
      server.middlewares.use(createChatMiddleware());
      server.middlewares.use((req, res, next) => {
        const urlPath = safeRequestPath(req.url);
        if (!urlPath) { res.statusCode = 403; res.end(); return; }
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
        const target = getBootstrapExternalRedirect(urlPath, query);
        if (target) { res.writeHead(302, { Location: target }); res.end(); return; }
        if (!urlPath.startsWith('/public/')) return next();
        const file = resolveStaticFile(path.join(root, 'public'), urlPath.slice('/public/'.length));
        if (file) serveStaticFile(req, res, file);
        else { res.statusCode = 404; res.end(); }
      });
    },
  };
}

function homeDevFallback() {
  const viteInternals = ['/@vite', '/@fs', '/@id', '/@react-refresh'];
  return {
    name: 'home-dev-fallback',
    configureServer(server) {
      const appDir = path.resolve(server.config.root, 'dist-home');
      // This must run before Vite's static files and HTML fallback. The latter
      // rewrites missing asset URLs to /index.html before the post hook below,
      // while repository assets can belong to an older build than that HTML.
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        const urlPath = safeRequestPath(req.url);
        if (!urlPath?.startsWith('/assets/')) return next();
        const file = resolveStaticFile(appDir, urlPath.slice(1));
        if (file) { serveStaticFile(req, res, file); return; }
        res.writeHead(404, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
        });
        res.end(req.method === 'HEAD' ? undefined : 'Asset not found');
      });
      return () => {
        server.middlewares.use((req, res, next) => {
          if (req.method !== 'GET' && req.method !== 'HEAD') return next();
          const urlPath = safeRequestPath(req.url);
          if (!urlPath) { res.statusCode = 403; res.end(); return; }
          if (viteInternals.some(prefix => urlPath.startsWith(prefix))) return next();
          const relative = urlPath.replace(/^\//, '');
          // Only built public output is eligible here. Never fall back to raw
          // repository files or let relative URLs escape the configured root.
          const file = resolveStaticFile(appDir, relative)
            || (urlPath.startsWith('/public/') ? resolveStaticFile(appDir, relative.slice(7)) : null)
            || (!path.extname(relative) ? resolveStaticFile(appDir, `${relative}.html`) : null);
          if (file) { serveStaticFile(req, res, file); return; }
          if (path.extname(relative)) return next();
          const index = resolveStaticFile(appDir, 'index.html');
          if (!index) {
            res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Home app not built. Run npm run build:home first.');
            return;
          }
          serveStaticFile(req, res, index);
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

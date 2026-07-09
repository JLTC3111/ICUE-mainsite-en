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

function homeDevFallback() {
  const root = process.cwd();
  const appDir = path.resolve(root, 'dist-home');
  const viteInternals = ['/@vite', '/@fs', '/@id', '/@react-refresh'];

  return {
    name: 'home-dev-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const urlPath = (req.url || '').split('?')[0];

        if (viteInternals.some((prefix) => urlPath.startsWith(prefix))) return next();

        const rel = urlPath.replace(/^\//, '');
        const filePath = path.join(appDir, rel);
        const hasExtension = Boolean(rel && path.extname(rel));

        if (hasExtension) {
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.statusCode = 200;
            res.setHeader('Content-Type', MIME[path.extname(rel).toLowerCase()] || 'application/octet-stream');
            res.end(fs.readFileSync(filePath));
            return;
          }

          if (urlPath.startsWith('/public/')) {
            const publicPath = path.join(appDir, rel.replace(/^public\//, ''));
            if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
              res.statusCode = 200;
              res.setHeader('Content-Type', MIME[path.extname(publicPath).toLowerCase()] || 'application/octet-stream');
              res.end(fs.readFileSync(publicPath));
              return;
            }
          }

          return next();
        }

        const indexPath = path.join(appDir, 'index.html');
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
    },
  };
}

export default defineConfig({
  publicDir: 'public',
  base: '',
  plugins: [react(), publicDevFallback(), homeDevFallback()],
  resolve: {
    alias: {
      '@icue/main-site-nav': path.resolve(__dirname, 'shared/main-site-nav'),
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

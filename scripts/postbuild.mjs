import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROUTE_META } from '../home-app/src/lib/routeMeta.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const homeDist = path.join(root, 'dist-home');
const siteOrigin = 'https://en.icue.vn';

// Route title/description/pageFile metadata now lives in
// home-app/src/lib/routeMeta.js (shared with the client-side RouteHead
// component, so the two can never drift apart again).
const routeShells = ROUTE_META;

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`[postbuild] Skipping missing path: ${src}`);
    return;
  }

  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

function removeDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function buildRouteShell(indexHtml, route) {
  const canonical = `${siteOrigin}/${route.slug}`;
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);
  const structuredData = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: route.title,
    description: route.description,
    url: canonical,
    isPartOf: {
      '@type': 'WebSite',
      name: 'ICUE Vietnam',
      url: `${siteOrigin}/`,
    },
  }).replaceAll('<', '\\u003c');
  const pageSourcePath = path.join(root, 'legacy/pages', route.pageFile);
  const pageSource = fs.readFileSync(pageSourcePath, 'utf8');
  const embeddedPageSource = JSON.stringify(pageSource).replaceAll('<', '\\u003c');

  return indexHtml
    .replace(/<title>.*?<\/title>/i, `<title>${title}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${description}" />`,
    )
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${canonical}" />`,
    )
    .replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:url" content="${canonical}" />`,
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:title" content="${title}" />`,
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${description}" />`,
    )
    .replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:title" content="${title}" />`,
    )
    .replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:description" content="${description}" />`,
    )
    .replace(
      '</head>',
      `<script type="application/ld+json">${structuredData}</script>\n  </head>`,
    )
    .replace(
      '<div id="root"></div>',
      `<div id="root"><main class="route-static-fallback"><h1>${title}</h1><p>${description}</p></main></div>`,
    )
    .replace(
      '</body>',
      `<script type="application/json" id="icue-legacy-page-source" data-page="${route.pageName}">${embeddedPageSource}</script>\n  </body>`,
    );
}

if (!fs.existsSync(homeDist)) {
  console.error('[postbuild] dist-home/ not found. Run npm run build:home first.');
  process.exit(1);
}

copyDir(path.join(root, 'public'), path.join(homeDist, 'public'));
copyFile(path.join(root, '_redirects'), path.join(homeDist, '_redirects'));
for (const file of ['robots.txt', 'sitemap.xml']) {
  copyFile(path.join(root, 'public', file), path.join(homeDist, file));
}

// Publish social/Netlify preview image at site root (/preview.jpg) in addition to /public/preview.jpg.
const previewJpg = path.join(root, 'public/preview.jpg');
if (fs.existsSync(previewJpg)) {
  copyFile(previewJpg, path.join(homeDist, 'preview.jpg'));
  copyFile(previewJpg, path.join(root, 'preview.jpg'));
} else {
  console.warn('[postbuild] Missing public/preview.jpg — Netlify/OG preview image will be unavailable.');
}

const builtIndex = path.join(homeDist, 'index.html');
if (!fs.existsSync(builtIndex)) {
  console.error('[postbuild] dist-home/index.html not found.');
  process.exit(1);
}

const builtIndexHtml = fs.readFileSync(builtIndex, 'utf8');
for (const route of routeShells) {
  fs.writeFileSync(
    path.join(homeDist, `${route.slug}.html`),
    buildRouteShell(builtIndexHtml, route),
  );
}

copyFile(builtIndex, path.join(root, 'index.html'));
removeDir(path.join(root, 'assets'));
copyDir(path.join(homeDist, 'assets'), path.join(root, 'assets'));

const rootDirsFromHome = [
  'aboutUs',
  'bgVideos',
  'flags',
  'legacy',
  'legacy-embed',
  'logoIcons',
  'models',
  'news',
  'pastProjects',
  'recruitment',
  'work',
  'public',
];

for (const dir of rootDirsFromHome) {
  const from = path.join(homeDist, dir);
  if (!fs.existsSync(from)) continue;
  removeDir(path.join(root, dir));
  copyDir(from, path.join(root, dir));
}

copyFile(path.join(homeDist, '_redirects'), path.join(root, '_redirects'));

console.log('[postbuild] Synced home-app production build to repo root for Netlify deploy.');

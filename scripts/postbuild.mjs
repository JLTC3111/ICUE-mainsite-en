import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const homeDist = path.join(root, 'dist-home');
const siteOrigin = 'https://en.icue.vn';

const routeShells = [
  {
    slug: 'contact',
    title: 'Contact ICUE Vietnam',
    description: 'Contact ICUE Vietnam for urban planning, construction, climate resilience, research, and partnership enquiries.',
  },
  {
    slug: 'about-us',
    title: 'About Us | ICUE Vietnam',
    description: 'Learn about ICUE Vietnam, our urban-development expertise, values, mission, and people.',
  },
  {
    slug: 'our-work',
    title: 'Our Work | ICUE Vietnam',
    description: 'Explore ICUE Vietnam’s work in urban planning, construction, climate resilience, research, and sustainable development.',
  },
  {
    slug: 'past-projects',
    title: 'Project History | ICUE Vietnam',
    description: 'Explore selected past projects and the project history of ICUE Vietnam.',
  },
  {
    slug: 'recruitment',
    title: 'Careers | ICUE Vietnam',
    description: 'Explore career and recruitment opportunities with ICUE Vietnam.',
  },
  {
    slug: 'news-archive',
    title: 'News Archive | ICUE Vietnam',
    description: 'Read news, research updates, project stories, and announcements from ICUE Vietnam.',
  },
  {
    slug: 'notable-awards',
    title: 'Awards and Recognition | ICUE Vietnam',
    description: 'Discover notable awards, certifications, and professional recognition received by ICUE Vietnam.',
  },
  {
    slug: 'community-activities',
    title: 'Community Activities | ICUE Vietnam',
    description: 'Explore ICUE Vietnam’s workshops, community programmes, partnerships, and public-interest activities.',
  },
  {
    slug: 'faqs',
    title: 'Frequently Asked Questions | ICUE Vietnam',
    description: 'Find answers to frequently asked questions about ICUE Vietnam, our services, projects, and partnerships.',
  },
  {
    slug: 'donations',
    title: 'Donations | ICUE Vietnam',
    description: 'Support ICUE Vietnam’s community programmes and sustainable urban-development initiatives.',
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy | ICUE Vietnam',
    description: 'Read the ICUE Vietnam privacy policy and learn how personal information is handled.',
  },
  {
    slug: 'terms',
    title: 'Terms of Use | ICUE Vietnam',
    description: 'Read the terms governing use of the ICUE Vietnam website and services.',
  },
  {
    slug: 'gdpr',
    title: 'GDPR Rights | ICUE Vietnam',
    description: 'Learn about GDPR data-protection rights and how to exercise them with ICUE Vietnam.',
  },
  {
    slug: 'cookies',
    title: 'Cookie Policy | ICUE Vietnam',
    description: 'Read the ICUE Vietnam cookie policy and learn how website cookies are used.',
  },
];

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
    );
}

if (!fs.existsSync(homeDist)) {
  console.error('[postbuild] dist-home/ not found. Run npm run build:home first.');
  process.exit(1);
}

copyDir(path.join(root, 'src/pages'), path.join(homeDist, 'src/pages'));
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

copyDir(path.join(homeDist, 'src/pages'), path.join(root, 'src/pages'));
copyFile(path.join(homeDist, '_redirects'), path.join(root, '_redirects'));

console.log('[postbuild] Synced home-app production build to repo root for Netlify deploy.');

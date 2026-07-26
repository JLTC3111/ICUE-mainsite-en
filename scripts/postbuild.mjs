import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const homeDist = path.join(root, 'dist-home');

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

if (!fs.existsSync(homeDist)) {
  console.error('[postbuild] dist-home/ not found. Run npm run build:home first.');
  process.exit(1);
}

copyDir(path.join(root, 'src/pages'), path.join(homeDist, 'src/pages'));
copyDir(path.join(root, 'public'), path.join(homeDist, 'public'));
copyFile(path.join(root, '_redirects'), path.join(homeDist, '_redirects'));

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

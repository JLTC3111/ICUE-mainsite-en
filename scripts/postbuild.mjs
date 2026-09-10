import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const homeDist = path.join(root, 'dist-home')

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name)
    return entry.isDirectory() ? walkFiles(file) : [file]
  })
}

if (!fs.existsSync(homeDist)) {
  console.error('[postbuild] dist-home/ not found. Run npm run build:home first.')
  process.exit(1)
}

copyFile(path.join(root, '_redirects'), path.join(homeDist, '_redirects'))
for (const file of ['robots.txt', 'sitemap.xml']) {
  copyFile(path.join(root, 'public', file), path.join(homeDist, file))
}

const previewJpg = path.join(root, 'public/preview.jpg')
if (fs.existsSync(previewJpg)) {
  copyFile(previewJpg, path.join(homeDist, 'preview.jpg'))
} else {
  console.warn('[postbuild] Missing public/preview.jpg — Netlify/OG preview image will be unavailable.')
}

const builtIndex = path.join(homeDist, 'index.html')
if (!fs.existsSync(builtIndex)) {
  console.error('[postbuild] dist-home/index.html not found.')
  process.exit(1)
}

// en.icue.vn owns only its React home. Remove every retired page source and
// route shell even if a stale public directory copied one into this build.
for (const retiredFile of [
  'about-us.html',
  'past-projects.html',
  'news-archive.html',
  'notable-awards.html',
  'contact.html',
  'community-activities.html',
  'faqs.html',
  'recruitment.html',
  'card.html',
  'article_template.html',
  'legal/privacy.html',
  'legal/terms.html',
  'legal/gdpr.html',
  'legal/cookies.html',
]) {
  fs.rmSync(path.join(homeDist, retiredFile), { force: true })
}

for (const retiredDir of ['aboutUs', 'legacy', 'legacy-embed', 'src', 'models', 'public']) {
  fs.rmSync(path.join(homeDist, retiredDir), { recursive: true, force: true })
}

const publishedVideos = new Set([
  'blueflow.mp4',
  'home_bg_1.mp4',
  'home_bg_1_mobile.mp4',
  'home_bg_2.mp4',
  'home_bg_2_mobile.mp4',
  'home_bg_3.mp4',
  'home_bg_3_mobile.mp4',
  'home_bg_4.mp4',
  'home_bg_4_mobile.mp4',
  'video-text-fifa2026.mp4',
  'video-text-football.mp4',
])
const videoDir = path.join(homeDist, 'bgVideos')
if (fs.existsSync(videoDir)) {
  for (const entry of fs.readdirSync(videoDir)) {
    if (!publishedVideos.has(entry)) {
      fs.rmSync(path.join(videoDir, entry), { recursive: true, force: true })
    }
  }
}

for (const file of walkFiles(homeDist)) {
  if (path.basename(file) === '.DS_Store') fs.rmSync(file, { force: true })
}

console.log('[postbuild] Prepared home-only dist-home production build.')

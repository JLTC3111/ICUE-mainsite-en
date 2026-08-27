import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(__dirname, '..')
const siteRoot = path.resolve(appRoot, '..')

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Missing directory: ${src}`)
    process.exit(1)
  }
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name)
    const to = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(from, to)
    } else {
      fs.copyFileSync(from, to)
    }
  }
}

const ASSET_DIRS = [
  'aboutUs',
  'bgVideos',
  'models',
  'pastProjects',
  'work',
  'news',
  'recruitment',
  'logoIcons',
  'flags',
]

const LEGACY_PAGES = [
  'Contact.html',
  'aboutUs.html',
  'pastProjects.html',
  'News.html',
  'notableAwards.html',
  'communityActivities.html',
  'privacy.html',
  'terms.html',
  'gdpr.html',
  'cookies.html',
  'card.html',
  'article_template.html',
]

for (const rel of ASSET_DIRS) {
  copyDir(path.join(siteRoot, 'public', rel), path.join(appRoot, 'public', rel))
}

for (const file of LEGACY_PAGES) {
  const source = path.join(siteRoot, 'legacy/pages', file)
  copyFile(source, path.join(appRoot, 'public/legacy/pages', file))
  copyFile(source, path.join(appRoot, 'public/legacy-embed/pages', file))
}

copyFile(path.join(siteRoot, 'legacy/script.js'), path.join(appRoot, 'public/legacy/script.js'))
copyFile(path.join(siteRoot, 'legacy/card.js'), path.join(appRoot, 'public/legacy/card.js'))
copyFile(path.join(siteRoot, 'legacy/article.js'), path.join(appRoot, 'public/legacy/article.js'))
copyFile(path.join(siteRoot, '_redirects'), path.join(appRoot, 'public/_redirects'))
copyFile(
  path.join(siteRoot, 'public/logoIcons/favicon.png'),
  path.join(appRoot, 'public/logoIcons/favicon.png'),
)

console.log(`Synced home-app assets: ${ASSET_DIRS.join(', ')}, legacy pages, redirects, script.js, card.js, article.js`)

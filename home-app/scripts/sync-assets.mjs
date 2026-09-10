import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(__dirname, '..')
const siteRoot = path.resolve(appRoot, '..')

function resolveExistingFile(src) {
  const dir = path.dirname(src)
  const wanted = path.basename(src)
  if (!fs.existsSync(dir)) return null
  const names = fs.readdirSync(dir)
  const exact = names.find((name) => name === wanted)
  if (exact) return path.join(dir, exact)
  const insensitive = names.find((name) => name.toLowerCase() === wanted.toLowerCase())
  if (insensitive) return path.join(dir, insensitive)
  return null
}

function copyFile(src, dest) {
  const resolved = resolveExistingFile(src)
  if (!resolved) {
    const dir = path.dirname(src)
    const listing = fs.existsSync(dir)
      ? fs.readdirSync(dir).join(', ')
      : '(directory missing)'
    console.error(`Missing file: ${src}`)
    console.error(`Contents of ${dir}: ${listing}`)
    process.exit(1)
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(resolved, dest)
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
  'certs',
  'models',
  'pastProjects',
  'work',
  'news',
  'recruitment',
  'logoIcons',
  'flags',
]

const ASSET_FILES = [
  'files/photos.zip',
  'files/speech.pdf',
  'music/mixkit-a-very-happy-christmas-897.mp3',
]

for (const rel of ASSET_DIRS) {
  copyDir(path.join(siteRoot, 'public', rel), path.join(appRoot, 'public', rel))
}

for (const rel of ASSET_FILES) {
  copyFile(path.join(siteRoot, 'public', rel), path.join(appRoot, 'public', rel))
}

for (const retiredDir of ['legacy', 'legacy-embed']) {
  fs.rmSync(path.join(appRoot, 'public', retiredDir), { recursive: true, force: true })
}
copyFile(path.join(siteRoot, '_redirects'), path.join(appRoot, 'public/_redirects'))
copyFile(
  path.join(siteRoot, 'public/logoIcons/favicon.png'),
  path.join(appRoot, 'public/logoIcons/favicon.png'),
)

console.log(`Synced home-app assets: ${ASSET_DIRS.join(', ')}, selected media, and redirects`)

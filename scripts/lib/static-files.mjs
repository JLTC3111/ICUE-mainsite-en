import fs from 'node:fs'
import path from 'node:path'

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.gif': 'image/gif', '.avif': 'image/avif', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.mp3': 'audio/mpeg', '.pdf': 'application/pdf', '.zip': 'application/zip',
}

export function safeRequestPath(url = '') {
  try {
    const decoded = decodeURIComponent(url.split('?')[0])
    if (!decoded.startsWith('/') || /[\\\0]/.test(decoded)
      || /%[0-9a-f]{2}/i.test(decoded)
      || decoded.split('/').some(part => part.startsWith('.'))) return null
    return decoded
  } catch { return null }
}

/** Both lexical and real-path containment are required, including symlinks. */
export function resolveStaticFile(root, relative) {
  if (!MIME[path.extname(relative).toLowerCase()]) return null
  const safe = safeRequestPath(`/${relative}`)
  if (!safe) return null
  try {
    const base = fs.realpathSync(root)
    const candidate = fs.realpathSync(path.resolve(base, `.${safe}`))
    const rel = path.relative(base, candidate)
    if (!rel || rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) return null
    return fs.statSync(candidate).isFile() ? candidate : null
  } catch { return null }
}

export function serveStaticFile(req, res, file) {
  const { size } = fs.statSync(file)
  let start = 0
  let end = size - 1
  res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()])
  res.setHeader('Accept-Ranges', 'bytes')
  if (req.headers.range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range)
    if (!match || (!match[1] && !match[2])) {
      res.writeHead(416, { 'Content-Range': `bytes */${size}` }); res.end(); return
    }
    start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]))
    end = match[1] && match[2] ? Math.min(size - 1, Number(match[2])) : size - 1
    if (start > end || start >= size) {
      res.writeHead(416, { 'Content-Range': `bytes */${size}` }); res.end(); return
    }
    res.statusCode = 206
    res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`)
  } else res.statusCode = 200
  res.setHeader('Content-Length', Math.max(0, end - start + 1))
  if (req.method === 'HEAD' || size === 0) { res.end(); return }
  const stream = fs.createReadStream(file, { start, end })
  stream.on('error', () => res.destroy())
  res.on('close', () => stream.destroy())
  stream.pipe(res)
}

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('../../', import.meta.url))

function request(port, pathname, method = 'GET', accept = '*/*') {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1', port, path: pathname, method,
      headers: { Accept: accept },
    }, res => {
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(chunks).toString(),
      }))
    })
    req.on('error', reject)
    req.end()
  })
}

test('root Vite serves the current build assets before SPA fallback, including module retry URLs', async t => {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'icue-en-built-assets-'))
  let server
  t.after(async () => {
    await server?.close()
    await fs.rm(temporary, { recursive: true, force: true })
  })
  const index = '<!doctype html><html><head>'
    + '<script type="module" src="/assets/index-current.js"></script>'
    + '<link rel="modulepreload" href="/assets/routes-current.js">'
    + '<link rel="modulepreload" href="/assets/VideoToggle-current.js">'
    + '<link rel="stylesheet" href="/assets/index-current.css">'
    + '</head><body><div id="root"></div></body></html>'
  await fs.mkdir(path.join(temporary, 'dist-home/assets'), { recursive: true })
  await fs.mkdir(path.join(temporary, 'assets'))
  await fs.writeFile(path.join(temporary, 'index.html'), '<html>Stale root index</html>')
  await fs.writeFile(path.join(temporary, 'dist-home/index.html'), index)
  for (const [name, source] of Object.entries({
    'index-current.js': 'import "./routes-current.js"; import "./VideoToggle-current.js";',
    'routes-current.js': 'export const route = "/";',
    'VideoToggle-current.js': 'export const toggle = true;',
    'index-current.css': 'body { color: black; }',
  })) {
    await fs.writeFile(path.join(temporary, 'dist-home/assets', name), source)
  }
  await fs.writeFile(path.join(temporary, 'assets/routes-current.js'), 'export const route = "stale";')
  const assets = [...new Set([...index.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)].map(match => match[1]))]
  assert.ok(assets.some(asset => /\/routes-.*\.js$/.test(asset)))
  assert.ok(assets.some(asset => /\/VideoToggle-.*\.js$/.test(asset)))

  server = await createServer({
    root: temporary,
    configFile: path.join(root, 'vite.config.js'),
    server: { host: '127.0.0.1', port: 0, strictPort: false },
    logLevel: 'silent',
  })
  await server.listen()
  const port = server.httpServer.address().port
  const page = await request(port, '/')
  assert.equal(page.status, 200)
  assert.equal(page.body, index, 'HTML and assets must come from the same build')

  for (const asset of assets) {
    const expected = await fs.readFile(path.join(temporary, 'dist-home', asset), 'utf8')
    for (const suffix of ['', '?__icue_module_retry=1']) {
      const response = await request(port, `${asset}${suffix}`)
      assert.equal(response.status, 200, asset)
      assert.match(response.headers['content-type'], asset.endsWith('.js') ? /javascript/ : /text\/css/, asset)
      assert.equal(response.body, expected, `${asset} must bypass stale root copies and Vite transforms`)
    }
    const head = await request(port, asset, 'HEAD')
    assert.equal(head.status, 200, asset)
    assert.equal(head.body, '')
    assert.equal(Number(head.headers['content-length']), Buffer.byteLength(expected))
  }

  for (const asset of ['/assets/does-not-exist.js', '/assets/does-not-exist.css']) {
    for (const method of ['GET', 'HEAD']) {
      for (const accept of ['*/*', 'text/html']) {
        const response = await request(port, `${asset}?__icue_module_retry=1`, method, accept)
        assert.equal(response.status, 404, `${method} ${asset}`)
        assert.doesNotMatch(response.headers['content-type'] || '', /text\/html/)
        assert.ok(!response.body.includes('<!doctype html>'))
      }
    }
  }
})

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { createServer } from 'vite'
import { getBootstrapExternalRedirect } from '../../home-app/src/lib/bootstrapExternalRedirect.js'
import edgeRedirect from '../../netlify/edge-functions/legacy-redirect.js'
import { React, act, create, platform, silenceRenderer, sourceModule, unmount } from '../../shared/resilience/testHarness.js'

const root = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(import.meta.url)
const { createApp } = require('../../server.js')

function request(port, pathname, { method = 'GET', headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, path: pathname, method, headers }, res => {
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString() }))
    })
    req.on('error', reject)
    req.end()
  })
}

test('real Vite HTTP middleware denies traversal, dotfiles, and escaped symlinks while serving assets and ranges', async t => {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'icue-en-containment-'))
  const canary = path.join(temporary, 'outside.json')
  const basename = `audit-symlink-${path.basename(temporary)}.json`
  const symlink = path.join(root, 'public', basename)
  await fs.writeFile(canary, '{"outside":"audit-canary"}')
  await fs.symlink(canary, symlink)
  const server = await createServer({ configFile: path.join(root, 'vite.config.js'), server: { host: '127.0.0.1', port: 0, strictPort: false }, logLevel: 'silent' })
  t.after(async () => { await server.close(); await fs.unlink(symlink); await fs.rm(temporary, { recursive: true, force: true }) })
  await server.listen()
  const port = server.httpServer.address().port
  const outside = `/public/../../../../../${canary.replace(/^\//, '')}`
  for (const url of [outside, '/public/%2e%2e/%2e%2e/package.json', '/public/%252e%252e/package.json', '/public/..\\package.json', '/public/.env', `/public/${basename}`, '/public/%zz']) {
    const response = await request(port, url)
    assert.ok([403, 404].includes(response.status), `${url}: ${response.status}`)
    assert.ok(!response.body.includes('audit-canary'))
  }
  const asset = await request(port, '/public/logoIcons/favicon.png')
  assert.equal(asset.status, 200)
  const head = await request(port, '/public/logoIcons/favicon.png', { method: 'HEAD' })
  assert.equal(head.status, 200)
  assert.equal(head.body, '')
  const partial = await request(port, '/public/logoIcons/favicon.png', { headers: { Range: 'bytes=0-7' } })
  assert.equal(partial.status, 206)
  assert.equal(Number(partial.headers['content-length']), 8)
  assert.match(partial.headers['content-range'], /^bytes 0-7\/\d+$/)
})

test('Express GET/HEAD and the Netlify edge retain locale, detail ids, and query parameters', async t => {
  const app = await createApp()
  const server = http.createServer(app)
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  t.after(() => new Promise(resolve => server.close(resolve)))
  const cases = [
    ['/?lang=vi', 'https://icue.vn/?lang=vi'],
    ['/?lang=de', 'https://icue.vn/?lang=de'],
    ['/?lang=fr', 'https://icue.vn/?lang=fr'],
    ['/?lang=ko-KR', 'https://icue.vn/?lang=ko'],
    ['/?lang=jp', 'https://icue.vn/?lang=ja'],
    ['/index.html?lang=ja', 'https://icue.vn/?lang=ja'],
    ['/legacy/pages/Home.html?lang=fr', 'https://icue.vn/?lang=fr'],
    ['/contact?lang=ja', 'https://icue.vn/contact?lang=ja'],
    ['/contact?lang=jp', 'https://icue.vn/contact?lang=ja'],
    ['/people/core-team?lang=ko-KR', 'https://icue.vn/people/core-team?lang=ko'],
    ['/legacy/pages/card.html?id=6&lang=fr', 'https://icue.vn/past-projects/6?lang=fr'],
    ['/src/pages/article_template.html?id=4&lang=de', 'https://icue.vn/news-archive/4?lang=de'],
    ['/src/pages/privacy.html?lang=ja', 'https://icue.vn/legal/privacy?lang=ja'],
    ['/contact?lang=invalid', 'https://icue.vn/contact?lang=en'],
    ['/contact', 'https://icue.vn/contact?lang=en'],
  ]
  for (const [url, expected] of cases) {
    for (const method of ['GET', 'HEAD']) {
      const actual = await request(server.address().port, url, { method })
      assert.equal(actual.status, 301)
      assert.equal(actual.headers.location, expected)
      const edge = await edgeRedirect(new Request(`https://en.icue.vn${url}`, { method }), { next() { throw new Error('Redirect unexpectedly bypassed') } })
      assert.equal(edge.status, 301)
      assert.equal(edge.headers.get('location'), expected)
    }
  }
  const campaign = new URL(getBootstrapExternalRedirect('/contact', '?lang=fr&utm_campaign=autumn&site=en&from=en-news'))
  assert.equal(campaign.searchParams.get('utm_campaign'), 'autumn')
  assert.equal(campaign.searchParams.get('lang'), 'fr')
  assert.ok(!campaign.searchParams.has('site'))
  assert.ok(!campaign.searchParams.has('from'))
  assert.equal(getBootstrapExternalRedirect('/', '?lang=en'), null)
  assert.equal(await edgeRedirect(new Request('https://en.icue.vn/'), { next: () => 'homepage' }), 'homepage')
})

test('opening the real desktop drawer survives a denied storage object and retains homepage content', async t => {
  silenceRenderer(t)
  const f = platform()
  f.window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} })
  f.window.location.pathname = '/'
  f.document.getElementById = () => null
  const { default: Drawer } = await sourceModule('shared/drawer-menu/DrawerMenuPanel.jsx', {
    globals: { ...f, localStorage: { getItem() { throw new DOMException('Blocked', 'SecurityError') } } },
    imports: {
      'react-dom': { createPortal: node => node },
      './LineSidebarNav': { default: () => React.createElement('span', null, 'links') },
      './useLineSidebarProximity': { useLineSidebarProximity: () => ({ navRef: { current: null }, handlePointerMove() {}, handlePointerLeave() {} }) },
    },
  })
  const { default: Boundary } = await sourceModule('shared/resilience/RecoveryBoundary.jsx', { globals: f })
  const widths = []
  const nodeMock = () => ({ style: { setProperty: (key, value) => widths.push(value) }, classList: { add() {}, remove() {} }, addEventListener() {}, removeEventListener() {}, getBoundingClientRect: () => ({ width: 340 }) })
  const tree = open => React.createElement(Boundary, null, React.createElement('main', null, 'homepage'), React.createElement(Drawer, { open, portal: false, showToggle: false, resizable: true, links: [] }))
  let renderer
  await act(async () => { renderer = create(tree(false), { createNodeMock: nodeMock }) })
  await act(async () => renderer.update(tree(true)))
  assert.equal(renderer.root.findAllByType('main').length, 1)
  assert.equal(renderer.root.findByType(Boundary).instance.state.error, null)
  assert.ok(widths.includes('340px'))
  await unmount(renderer)
})

test('calendar moves and traps focus, dismisses with Escape, restores focus and background state', async t => {
  silenceRenderer(t)
  const f = platform()
  const app = { inert: false, contains: () => false }
  const alreadyInert = { inert: true, contains: () => false }
  f.document.body.children = [app, alreadyInert]
  f.document.body.style.overflow = 'auto'
  let dialog, trigger, close
  function element(name) {
    const node = { name, isConnected: true, hidden: false, closest: () => null, focus() { f.document.activeElement = node } }
    return node
  }
  close = element('close')
  const { default: Sidebar } = await sourceModule('shared/contact-sidebar/ContactSidebar.jsx', {
    globals: f,
    imports: {
      'react-dom': { createPortal: node => node },
      '@icue/zalo/zaloLink': { ICUE_ZALO_PHONE: '0', openZaloChat() {}, zaloWebUrl: () => '#' },
      './useCalendarClock': { useCalendarClock: () => ({ month: 'October', day: '8', time: '09:00' }) },
      './useAudioVisualizer': { useAudioVisualizer: () => ({ toggle() {}, isPlaying: false, isAnimating: false }) },
      './useMusicBarColor': {
        useMusicBarColor: () => '#fff',
        useBackgroundAppearance: () => ({ color: '#fff', overVideo: false }),
      },
    },
  })
  let renderer
  await act(async () => {
    renderer = create(React.createElement(Sidebar), { createNodeMock(node) {
      if (node.props['aria-label'] === 'Open calendar') return trigger = element('trigger')
      if (node.props['aria-label'] === 'Close calendar') return close = element('close')
      if (node.props.role === 'dialog') {
        dialog = element('dialog')
        dialog.querySelectorAll = () => [close]
        dialog.contains = target => target === close || target === dialog
        f.document.body.children = [app, alreadyInert, dialog]
        return dialog
      }
      return element('other')
    } })
  })
  trigger.focus()
  const open = renderer.root.findByProps({ 'aria-label': 'Open calendar' })
  await act(async () => open.props.onClick())
  assert.equal(f.document.activeElement, close)
  assert.equal(app.inert, true)
  assert.equal(f.document.body.style.overflow, 'hidden')
  for (const shiftKey of [false, true]) {
    const tab = Object.assign(new Event('keydown', { cancelable: true }), { key: 'Tab', shiftKey })
    f.document.dispatchEvent(tab)
    assert.equal(tab.defaultPrevented, true)
    assert.equal(f.document.activeElement, close)
  }
  await act(async () => f.document.dispatchEvent(Object.assign(new Event('keydown', { cancelable: true }), { key: 'Escape' })))
  assert.equal(renderer.root.findAllByProps({ role: 'dialog' }).length, 0)
  assert.equal(f.document.activeElement, trigger)
  assert.equal(app.inert, false)
  assert.equal(alreadyInert.inert, true)
  assert.equal(f.document.body.style.overflow, 'auto')
  await unmount(renderer)
})

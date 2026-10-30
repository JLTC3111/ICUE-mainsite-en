import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import { createRoot } from 'react-dom/client'
import { React, act, sourceModule } from '../../shared/resilience/testHarness.js'

test('the actual closed drawer and collapsed People links are inert in React 19 DOM output', async t => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'https://en.icue.vn/' })
  const { window } = dom
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
  const previous = Object.getOwnPropertyDescriptors(globalThis)
  Object.defineProperty(globalThis, 'window', { configurable: true, value: window })
  Object.defineProperty(globalThis, 'document', { configurable: true, value: window.document })
  const root = createRoot(window.document.getElementById('root'))
  t.after(async () => {
    await act(async () => root.unmount())
    for (const key of ['window', 'document']) {
      if (previous[key]) Object.defineProperty(globalThis, key, previous[key])
      else delete globalThis[key]
    }
    dom.window.close()
  })
  const { default: Drawer } = await sourceModule('shared/drawer-menu/DrawerMenuPanel.jsx', { globals: {
    window, document: window.document, localStorage: window.localStorage,
    performance,
    requestAnimationFrame: callback => setTimeout(() => callback(performance.now()), 0),
    cancelAnimationFrame: clearTimeout,
  }, imports: { 'react-dom': { createPortal: node => node } } })
  const render = async (open, peopleOpen) => act(async () => root.render(React.createElement(Drawer, {
    open, portal: false, showToggle: false, resizable: false,
    links: [{ href: '/', label: 'Home' }, { href: '/contact', label: 'Contact' }],
    people: { label: 'People', open: peopleOpen, onToggle() {}, items: [{ href: '/people/experts', label: 'Experts' }] },
  })))
  await render(false, false)
  const drawer = window.document.querySelector('aside')
  assert.equal(drawer.getAttribute('aria-hidden'), 'true')
  assert.ok(drawer.hasAttribute('inert'))
  for (const control of drawer.querySelectorAll('button, a[href]')) assert.ok(control.closest('[inert]'))
  await render(true, false)
  assert.equal(drawer.hasAttribute('inert'), false)
  const home = drawer.querySelector('a[href="/"]')
  assert.equal(home.closest('[inert]'), null)
  home.focus()
  assert.equal(window.document.activeElement, home)
  const experts = drawer.querySelector('a[href="/people/experts"]')
  assert.ok(experts.closest('[inert]'))
  assert.equal(experts.closest('[aria-hidden="true"]')?.classList.contains('nav-drawer__submenu'), true)
  await render(true, true)
  assert.equal(experts.closest('[inert]'), null)
  experts.focus()
  assert.equal(window.document.activeElement, experts)
})

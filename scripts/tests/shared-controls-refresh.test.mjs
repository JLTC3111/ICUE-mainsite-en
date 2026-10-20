import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import { React, act, create, silenceRenderer, sourceModule, unmount, platform } from '../../shared/resilience/testHarness.js'

const require = createRequire(import.meta.url)
const { JSDOM } = require('jsdom')
const postcss = require('postcss')
const read = file => fs.readFile(new URL('../../' + file, import.meta.url), 'utf8')

test('Home reveals support current options, clean up and follow live OS motion changes', async t => {
  silenceRenderer(t)
  const media = Object.assign(new EventTarget(), { matches: false })
  let reverted = 0, started = 0, complete = 0, timelines = 0, from, to
  const root = { children: [{}, {}] }
  const gsap = {
    registerPlugin() {}, set() {}, to() {},
    context(callback) { callback(); return { revert() { reverted++ } } },
    timeline(options) {
      timelines++
      return { fromTo(_targets, first, last) { from = first; to = last }, play() { options.onStart(); options.onComplete() } }
    },
  }
  const { default: AnimatedContent } = await sourceModule('home-app/src/components/reactbits/AnimatedContent.jsx', {
    globals: { window: { matchMedia: () => media }, document: { getElementById: () => null } },
    imports: { gsap: { gsap }, 'gsap/ScrollTrigger': { ScrollTrigger: {} } },
  })
  let renderer
  await act(async () => {
    renderer = create(React.createElement(AnimatedContent, {
      trigger: 'mount', blur: 6, tilt: 4, stagger: 0.1, wipe: 'up',
      onStart: () => started++, onComplete: () => complete++,
    }, 'Content'), { createNodeMock: () => root })
  })
  assert.equal(from.filter, 'blur(6px)')
  assert.equal(from.rotationX, 4)
  assert.equal(from['--ac-wipe'], 0)
  assert.equal(to['--ac-wipe'], 1)
  assert.equal(to.stagger.each, 0.1)
  assert.equal(started, 1)
  assert.equal(complete, 1)
  assert.equal(renderer.root.findByType('div').props.blur, undefined)
  assert.equal(renderer.root.findByType('div').props.trigger, undefined)
  await act(async () => { media.matches = true; media.dispatchEvent(new Event('change')) })
  assert.equal(reverted, 1, 'Turning reduced motion on cancels the existing reveal')
  assert.equal(timelines, 1, 'Reduced motion reveals content without creating an animation')
  assert.equal(complete, 2)
  await act(async () => { media.matches = false; media.dispatchEvent(new Event('change')) })
  assert.equal(timelines, 2)
  await unmount(renderer)
  assert.equal(reverted, 3)
})

function contrast(foreground, background, minimum, label) {
  const luminance = hex => {
    const channels = hex.replace('#', '').match(/../g).map(value => {
      const channel = parseInt(value, 16) / 255
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    })
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
  }
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  const ratio = (values[0] + 0.05) / (values[1] + 0.05)
  assert.ok(ratio >= minimum, `${label}: ${foreground} on ${background}: ${ratio.toFixed(2)}:1`)
}

test('shared controls retain readable palettes for OS and explicit themes, including toggling back', async () => {
  const source = await read('shared/ui/control-theme.css')
  for (const osDark of [false, true]) {
    const css = postcss.parse(source)
    css.walkAtRules('media', rule => osDark ? rule.replaceWith(rule.nodes) : rule.remove())
    for (const attribute of ['data-theme', 'data-about-theme', 'data-icue-page-theme']) {
      const dom = new JSDOM(`<html><head><style>${css.toString()}</style></head><body></body></html>`)
      try {
        const root = dom.window.document.documentElement
        for (const theme of [null, 'dark', 'light', 'dark', 'light']) {
          if (theme) root.setAttribute(attribute, theme)
          else root.removeAttribute(attribute)
          const tokens = dom.window.getComputedStyle(root)
          const value = name => tokens.getPropertyValue('--' + name).trim()
          const dark = theme === 'dark' || (theme === null && osDark)
          assert.equal(value('drawer-toggle-surface'), dark ? '#161c25' : '#ffffff')
          for (const [ink, surface] of [
            ['drawer-toggle-ink', 'drawer-toggle-surface'],
            ['drawer-toggle-hover-ink', 'drawer-toggle-hover'],
            ['contact-sidebar-ink', 'contact-sidebar-surface'],
            ['floating-control-ink', 'floating-control-bg'],
            ['floating-control-ink', 'floating-control-hover'],
            ['floating-control-active-ink', 'floating-control-active-bg'],
          ]) contrast(value(ink), value(surface), 4.5, ink)
          contrast(value('drawer-toggle-focus'), value('drawer-toggle-surface'), 3, 'Keyboard focus')
          contrast(value('drawer-toggle-border'), value('drawer-toggle-surface'), 3, 'Control border')
        }
      } finally { dom.window.close() }
    }
  }
})

test('sidebar social icons render monochrome artwork at the shared calendar size', async t => {
  silenceRenderer(t)
  const { default: Sidebar } = await sourceModule('shared/contact-sidebar/ContactSidebar.jsx', {
    globals: platform(),
    imports: {
      'react-dom': { createPortal: node => node },
      '../ui/useModalFocus.js': { default() {} },
      '../ui/useFloatingCollapse.js': { default: () => ({ collapsed: false, automatic: false, interactionProps: {} }) },
      '../ui/FloatingCollapseControls.jsx': { default: () => null },
      '@icue/zalo/zaloLink': { ICUE_ZALO_PHONE: '0', openZaloChat() {}, zaloWebUrl: () => '#' },
      './useCalendarClock': { useCalendarClock: () => ({ month: 'October', day: '20', time: '09:00' }) },
      './useAudioVisualizer': { useAudioVisualizer: () => ({ toggle() {}, isPlaying: false, isAnimating: false }) },
      './useMusicBarColor': { useMusicBarColor: () => '#fff' },
    },
  })
  let renderer
  await act(async () => { renderer = create(React.createElement(Sidebar)) })
  for (const label of ['Zalo', 'Messenger']) {
    const anchor = renderer.root.findAllByType('a').find(node => node.props['aria-label'] === label)
    const svg = anchor.findByType('svg')
    assert.equal(svg.findAllByType('linearGradient').length, 0)
    for (const node of svg.findAll(() => true)) {
      for (const property of ['fill', 'stroke']) {
        if (node.props[property]) assert.match(node.props[property], /^(?:black|white|none|#(?:0{3}|0{6}|f{3}|f{6}))$/i)
      }
    }
  }
  const css = await read('shared/contact-sidebar/ContactSidebar.css')
  const parsed = postcss.parse(css)
  assert.ok(parsed.nodes.some(rule => rule.selector === '.contact-sidebar__item svg' && rule.nodes.some(decl => decl.prop === 'width' && decl.value === '70%')))
  parsed.walkRules(rule => assert.ok(!/^\.contact-sidebar__(?:calendar|item--messenger) svg$/.test(rule.selector), 'No oversized per-icon override'))
  await unmount(renderer)
})

test('Line Sidebar highlights nested links using viewport positions and stops when closed', async t => {
  silenceRenderer(t)
  const frames = new Map()
  let next = 0, hook
  const style = () => ({ values: {}, setProperty(name, value) { this.values[name] = value }, getPropertyValue(name) { return this.values[name] } })
  const link = { style: style(), classList: { contains: () => false }, getBoundingClientRect: () => ({ top: 400, height: 40 }) }
  const nav = { querySelectorAll: selector => selector === 'a, .nav-drawer__submenu-toggle' ? [link] : [] }
  const { useLineSidebarProximity } = await sourceModule('shared/drawer-menu/useLineSidebarProximity.js', {
    globals: { window: { matchMedia: () => ({ matches: true }) }, performance: { now: () => 0 },
      requestAnimationFrame(callback) { frames.set(++next, callback); return next }, cancelAnimationFrame(id) { frames.delete(id) },
    },
  })
  function Probe({ enabled }) { hook = useLineSidebarProximity({ enabled }); hook.navRef.current = nav; return null }
  let renderer
  await act(async () => { renderer = create(React.createElement(Probe, { enabled: true })) })
  const flush = () => { for (const [id, callback] of [...frames]) { frames.delete(id); callback(16) } }
  await act(async () => { flush(); hook.handlePointerMove({ clientY: 420, pointerType: 'mouse' }); flush() })
  assert.equal(link.style.values['--effect'], '1.0000', 'Nested link center matches the pointer')
  hook.handlePointerLeave()
  assert.equal(frames.size, 1)
  await act(async () => renderer.update(React.createElement(Probe, { enabled: false })))
  assert.equal(frames.size, 0)
  await unmount(renderer)
})

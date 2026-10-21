import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { React, act, create, silenceRenderer, sourceModule, unmount } from '../../shared/resilience/testHarness.js'

const require = createRequire(import.meta.url)
const { JSDOM } = require('jsdom')

test('the beam overlay shrinks with Home after resizing instead of retaining its own scroll overflow', async t => {
  silenceRenderer(t)
  const dom = new JSDOM('<html><body></body></html>', { pretendToBeVisual: true })
  const { window } = dom, { document } = window
  window.matchMedia = () => Object.assign(new window.EventTarget(), { matches: false })
  const frames = new Map(), observers = new Set()
  let nextFrame = 0, width = 1200, height = 3600, previousWidth = 0, previousHeight = 0, renderer
  const requestAnimationFrame = callback => { frames.set(++nextFrame, callback); return nextFrame }
  const cancelAnimationFrame = id => frames.delete(id)
  class ResizeObserver {
    constructor(callback) { this.callback = callback }
    observe() { observers.add(this) }
    disconnect() { observers.delete(this) }
  }
  const rect = (left, top, w, h) => ({ left, top, width: w, height: h })
  const containerRef = { current: {
    get scrollWidth() { return Math.max(width, previousWidth) },
    get scrollHeight() { return Math.max(height, previousHeight) },
    getBoundingClientRect: () => rect(0, 0, width, height),
  } }
  const heroRef = { current: { getBoundingClientRect: () => rect(0, 0, width, 600) } }
  const sectionRefs = [{ current: { getBoundingClientRect: () => rect(0, 600, width, height - 600) } }]
  const { default: Network } = await sourceModule('home-app/src/components/HomeBeamNetwork.jsx', {
    globals: { window, document, ResizeObserver, requestAnimationFrame, cancelAnimationFrame },
    imports: { 'motion/react': { motion: { linearGradient: 'linearGradient' } } },
  })
  t.after(async () => { if (renderer) await unmount(renderer); window.close() })
  const flush = async () => {
    for (let i = 0; i < 6 && frames.size; i++) {
      const pending = [...frames.values()]
      frames.clear()
      await act(async () => pending.forEach(callback => callback()))
    }
  }
  await act(async () => { renderer = create(React.createElement(Network, {
    tier: 'full', containerRef, heroRef, sectionRefs, cardRefs: [[]],
  })) })
  await flush()
  const svg = () => renderer.root.findByType('svg')
  assert.equal(svg().props.height, height)
  previousWidth = svg().props.width
  previousHeight = svg().props.height
  width = 900
  height = 1800
  await act(async () => observers.forEach(observer => observer.callback()))
  await flush()
  assert.equal(svg().props.width, width)
  assert.equal(svg().props.height, height, 'old SVG overflow must not enlarge the new page measurement')
  await unmount(renderer)
  renderer = null
  assert.equal(frames.size, 0)
  assert.equal(observers.size, 0)
})

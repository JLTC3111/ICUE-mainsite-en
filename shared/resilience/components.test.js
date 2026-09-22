import test from 'node:test'
import assert from 'node:assert/strict'
import { React, act, create, platform, sourceModule, silenceRenderer, unmount } from './testHarness.js'

test('failed lazy content retries on reconnect while preserving sibling state', async t => {
  silenceRenderer(t); const f = platform(); let calls = 0
  const { lazyWithRecovery } = await sourceModule('shared/resilience/lazyWithRecovery.jsx', { globals: f })
  const Lazy = lazyWithRecovery(async () => {
    if (++calls === 1) throw new Error('offline')
    return { default: () => React.createElement('output', null, 'recovered') }
  })
  function Fixture() {
    const [open, setOpen] = React.useState(false)
    return React.createElement(React.Fragment, null,
      React.createElement('button', { onClick: () => setOpen(true) }, String(open)), React.createElement(Lazy))
  }
  let renderer; await act(async () => { renderer = create(React.createElement(Fixture)) })
  await act(async () => renderer.root.findAllByType('button')[0].props.onClick())
  await act(async () => f.window.dispatchEvent(new Event('online')))
  assert.equal(calls, 2); assert.equal(renderer.root.findByType('output').children[0], 'recovered')
  assert.equal(renderer.root.findByType('button').children[0], 'true'); await unmount(renderer)
})

test('a hung lazy download offers a manual retry after its deadline', async t => {
  silenceRenderer(t); t.mock.timers.enable({ apis: ['setTimeout'] }); const f = platform(); let calls = 0
  const { lazyWithRecovery } = await sourceModule('shared/resilience/lazyWithRecovery.jsx', { globals: f })
  const Lazy = lazyWithRecovery(() => ++calls === 1 ? new Promise(() => {}) : Promise.resolve({ default: () => 'ready' }))
  let renderer; await act(async () => { renderer = create(React.createElement(Lazy)) })
  await act(async () => t.mock.timers.tick(20_000))
  const retry = renderer.root.findAllByType('button').find(node => node.children.includes('Retry'))
  assert.ok(retry); await act(async () => retry.props.onClick()); assert.equal(renderer.toJSON(), 'ready')
  await unmount(renderer)
})

test('optional visual errors recover locally after page restoration', async t => {
  silenceRenderer(t); const f = platform(); let fail = true
  const { default: Boundary } = await sourceModule('home-app/src/components/ErrorBoundary.jsx', { globals: f })
  function Visual() { if (fail) throw new Error('context lost'); return 'graphic' }
  let renderer; await act(async () => { renderer = create(React.createElement(Boundary, { fallback: 'static' }, React.createElement(Visual))) })
  assert.equal(renderer.toJSON(), 'static'); fail = false
  await act(async () => f.window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true })))
  assert.equal(renderer.toJSON(), 'graphic'); await unmount(renderer)
})

test('the calendar clock refreshes immediately after a short app switch', async t => {
  silenceRenderer(t); t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-09-21T01:01:00Z').getTime() })
  const f = platform(); const { useCalendarClock } = await sourceModule('shared/contact-sidebar/useCalendarClock.js', { globals: { ...f, Date } })
  let latest; function Fixture() { latest = useCalendarClock(); return null }
  let renderer; await act(async () => { renderer = create(React.createElement(Fixture)) }); const before = latest.time
  f.document.hidden = true; f.document.dispatchEvent(new Event('visibilitychange')); t.mock.timers.tick(120_000)
  await act(async () => { f.document.hidden = false; f.document.dispatchEvent(new Event('visibilitychange')) })
  assert.notEqual(latest.time, before); await unmount(renderer)
})

test('the calendar changes locale immediately without resetting its clock', async t => {
  silenceRenderer(t); t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 11, 21, 13, 5).getTime() })
  const f = platform(); const { useCalendarClock } = await sourceModule('shared/contact-sidebar/useCalendarClock.js', { globals: { ...f, Date } })
  let latest; function Fixture({ locale }) { latest = useCalendarClock(locale); return null }
  let renderer; await act(async () => { renderer = create(React.createElement(Fixture, { locale: 'en' })) })
  assert.equal(latest.month, 'December'); assert.match(latest.time, /1:05\s*PM/)
  for (const [locale, month, day] of [['fr', 'décembre', '21'], ['de', 'Dezember', '21'], ['ja', '12月', '21日'], ['ko', '12월', '21일']]) {
    await act(async () => renderer.update(React.createElement(Fixture, { locale })))
    assert.equal(latest.month, month); assert.equal(latest.day, day)
    if (locale === 'fr' || locale === 'de' || locale === 'ja') assert.equal(latest.time, '13:05')
    if (locale === 'ko') assert.match(latest.time, /오후\s*1:05/)
  }
  await unmount(renderer)
})

async function musicFixture(t) {
  silenceRenderer(t); const f = platform()
  class Audio extends EventTarget {
    paused = true; ended = false; readyState = 0; playCalls = 0
    constructor(src) { super(); this.src = src }
    async play() {
      this.playCalls++; this.paused = false; this.ended = false; this.readyState = 4
      this.dispatchEvent(new Event('playing'))
    }
    pause() { this.paused = true; this.dispatchEvent(new Event('pause')) }
  }
  const { useAudioVisualizer } = await sourceModule('shared/contact-sidebar/useAudioVisualizer.js', { globals: { ...f, Audio } })
  let latest; function Fixture() { latest = useAudioVisualizer(); return null }
  let renderer; await act(async () => { renderer = create(React.createElement(Fixture)) })
  return { ...f, renderer, audio: f.window.__icueBackgroundAudio, state: () => latest }
}

test('music bars follow playback, buffering, visibility, errors, and the end of the track', async t => {
  const f = await musicFixture(t)
  assert.equal(f.state().isAnimating, false); assert.equal(f.audio.playCalls, 0)
  assert.match(f.audio.src, /mixkit-a-very-happy-christmas-897\.mp3$/)
  await act(async () => f.state().toggle()); assert.equal(f.state().isAnimating, true)
  await act(async () => f.audio.dispatchEvent(new Event('waiting'))); assert.equal(f.state().isAnimating, false)
  await act(async () => f.audio.dispatchEvent(new Event('playing'))); assert.equal(f.state().isAnimating, true)
  await act(async () => { f.document.hidden = true; f.document.dispatchEvent(new Event('visibilitychange')) })
  assert.equal(f.state().isPlaying, true); assert.equal(f.state().isAnimating, false)
  await act(async () => { f.document.hidden = false; f.document.dispatchEvent(new Event('visibilitychange')) })
  assert.equal(f.state().isAnimating, true)
  for (const event of ['error', 'emptied', 'ended']) {
    await act(async () => f.audio.dispatchEvent(new Event(event))); assert.equal(f.state().isAnimating, false)
    await act(async () => f.audio.dispatchEvent(new Event('playing')))
  }
  await act(async () => f.state().toggle()); assert.equal(f.state().isAnimating, false)
  await unmount(f.renderer)
})

test('music resume never autoplays a paused track, and cleans up playback listeners', async t => {
  const f = await musicFixture(t)
  await act(async () => f.state().toggle()); await act(async () => f.state().toggle())
  await act(async () => f.window.dispatchEvent(new Event('online')))
  assert.equal(f.audio.playCalls, 1); assert.equal(f.audio.paused, true); assert.equal(f.state().isPlaying, false)
  // A page restored from memory may have missed its latest playback event.
  f.audio.paused = false
  await act(async () => f.window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true })))
  // Distinct online signals are always retained even inside the dedupe window.
  await act(async () => f.window.dispatchEvent(new Event('online')))
  assert.equal(f.state().isPlaying, true); assert.equal(f.audio.playCalls, 1)
  await unmount(f.renderer)
  const { getEventListeners } = await import('node:events')
  for (const event of ['playing', 'pause', 'ended', 'waiting', 'emptied', 'error']) {
    assert.equal(getEventListeners(f.audio, event).length, 0)
  }
})

test('the optional grid chunk retries after reconnect when its initial retries fail', async t => {
  silenceRenderer(t); t.mock.timers.enable({ apis: ['setTimeout'] }); const f = platform(); let calls = 0, online = false
  f.document.documentElement.setAttribute = () => {}; f.document.documentElement.removeAttribute = () => {}
  const { default: Grid } = await sourceModule('home-app/src/components/HomeHeroGridScan.jsx', {
    globals: f,
    imports: {
      '../hooks/useHomeGridScanVisible': { useHomeGridScanVisible: () => true },
      '../hooks/useHeavyVisualEffects': { useVisualEffectsTier: () => 'full' },
      '../lib/gridScanPolicy': { getGridScanRenderer: () => 'webgl' },
    },
    dynamicImport: async () => {
      calls++; if (!online) throw new Error('offline')
      return import('data:text/javascript,export function GridScan(){return "recovered grid"}')
    },
  })
  let renderer; await act(async () => { renderer = create(React.createElement(Grid)) })
  await act(async () => t.mock.timers.tick(750)); await act(async () => t.mock.timers.tick(1500))
  assert.equal(calls, 3); assert.equal(renderer.toJSON().props['data-gridscan-renderer'], 'css')
  online = true; await act(async () => f.window.dispatchEvent(new Event('online')))
  assert.equal(calls, 4); assert.equal(renderer.toJSON(), 'recovered grid'); await unmount(renderer)
})

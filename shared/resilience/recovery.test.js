import test from 'node:test'
import assert from 'node:assert/strict'
import { subscribeToPageResume } from './pageResume.js'
import { withDeadline, createRetryableLoader } from './requests.js'
import { platform, sourceModule, deferred, silenceRenderer } from './testHarness.js'
const dispatch = (target, type, properties = {}) => target.dispatchEvent(Object.assign(new Event(type), properties))
function lifecycle() {
  const f = platform(); let time = 1_000; const events = []
  const stop = subscribeToPageResume(e => events.push(e), { documentTarget: f.document, windowTarget: f.window, navigatorTarget: f.navigator, now: () => time })
  return { ...f, events, stop, advance: ms => { time += ms }, hide: () => { f.document.hidden = true; dispatch(f.document, 'visibilitychange') }, show: () => { f.document.hidden = false; dispatch(f.document, 'visibilitychange') } }
}
test('a reconnect received while hidden survives a brief app switch and cleans up', () => {
  const f = lifecycle(); f.hide(); f.advance(100); dispatch(f.window, 'online'); assert.equal(f.events.length, 0)
  f.show(); dispatch(f.window, 'focus'); assert.equal(f.events.length, 1); assert.equal(f.events[0].reason, 'online')
  f.stop(); dispatch(f.window, 'online'); assert.equal(f.events.length, 1)
})
test('offline back-forward restoration waits for connectivity', () => {
  const f = lifecycle(); f.navigator.onLine = false; dispatch(f.window, 'pageshow', { persisted: true }); assert.equal(f.events.length, 0)
  f.navigator.onLine = true; dispatch(f.window, 'online'); assert.equal(f.events.length, 1); f.stop()
})
test('freeze and resume recover once; ordinary focus does not refetch', () => {
  const f = lifecycle(); dispatch(f.window, 'focus'); assert.equal(f.events.length, 0)
  dispatch(f.document, 'freeze'); f.advance(50); dispatch(f.document, 'resume'); dispatch(f.window, 'focus')
  assert.equal(f.events.length, 1); f.stop()
})
test('a second background trip inside the deduplication interval still recovers', () => {
  const f = lifecycle(); dispatch(f.window, 'pageshow', { persisted: true }); f.hide(); f.advance(100); dispatch(f.window, 'pageshow', { persisted: true }); f.show()
  assert.equal(f.events.length, 2); f.stop()
})
test('deadline settles an operation that ignores abort', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] }); let signal
  const pending = withDeadline(s => { signal = s; return new Promise(() => {}) }, { timeoutMs: 40 })
  const rejection = assert.rejects(pending, { name: 'TimeoutError' }); await Promise.resolve(); t.mock.timers.tick(40); await rejection; assert.equal(signal.aborted, true)
})
test('pre-cancelled requests do not start the operation', async () => {
  const controller = new AbortController(); controller.abort(); let calls = 0
  await assert.rejects(withDeadline(() => { calls++ }, { signal: controller.signal }), { name: 'AbortError' }); assert.equal(calls, 0)
})
test('a failed loader can retry, while concurrent and successful loads share work', async () => {
  let calls = 0; const pending = deferred(); const load = createRetryableLoader(() => { calls++; return calls === 1 ? pending.promise : 'ready' })
  const one = load(); assert.equal(load(), one); pending.reject(new Error('offline')); await assert.rejects(one)
  assert.equal(await load(), 'ready'); assert.equal(await load(), 'ready'); assert.equal(calls, 2)
})
test('failed image recovery preserves signed URLs and cleans up', async () => {
  const f = platform(); let writes = 0; const signed = 'https://fixture.invalid/a.png?signature=keep'; let src = signed
  const img = { tagName: 'IMG', complete: true, naturalWidth: 0, isConnected: true, currentSrc: signed, srcset: '' }; Object.defineProperty(img, 'src', { get: () => src, set: v => { writes++; src = v } }); f.document.querySelectorAll = () => [img]
  const mod = await sourceModule('shared/resilience/mediaRecovery.js', { globals: f }); const stop = mod.installMediaRecovery(f.document)
  dispatch(f.window, 'online'); assert.equal(src, signed); assert.equal(writes, 1); stop(); dispatch(f.window, 'online'); assert.equal(writes, 1)
})

test('failed bundled styles retry twice without replacing signed external styles', async () => {
  const f = platform(); f.window.location = { href: 'https://example.test/', origin: 'https://example.test' }
  const { installMediaRecovery } = await sourceModule('shared/resilience/mediaRecovery.js', { globals: f })
  const stop = installMediaRecovery(f.document)
  const link = { tagName: 'LINK', rel: 'stylesheet', href: 'https://example.test/assets/HomePage.css', isConnected: true }
  const fail = target => {
    const event = new Event('error'); Object.defineProperty(event, 'target', { value: target }); f.document.dispatchEvent(event)
  }
  fail(link); dispatch(f.window, 'icue:retry-load'); assert.equal(link.href, 'https://example.test/assets/HomePage.css?icue-retry=1')
  fail(link); dispatch(f.window, 'online'); assert.equal(link.href, 'https://example.test/assets/HomePage.css?icue-retry=2')
  fail(link); dispatch(f.window, 'online'); assert.equal(link.href, 'https://example.test/assets/HomePage.css?icue-retry=2')
  const external = { ...link, href: 'https://fonts.example.test/font.css?signature=keep' }
  fail(external); dispatch(f.window, 'online'); assert.equal(external.href, 'https://fonts.example.test/font.css?signature=keep')
  stop()
})

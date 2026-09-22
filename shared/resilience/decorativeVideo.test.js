import test from 'node:test'
import assert from 'node:assert/strict'
import { platform, sourceModule } from './testHarness.js'

async function fixture() {
  const f = platform(); let intersection; let enabled = true
  const video = Object.assign(new EventTarget(), {
    currentTime: 7, duration: 30, loads: 0, plays: 0, pauses: 0,
    load() { this.loads++; this.currentTime = 0 },
    play() { this.plays++; return Promise.resolve() },
    pause() { this.pauses++ },
  })
  class IntersectionObserver { constructor(callback) { intersection = callback } observe() {} disconnect() { intersection = null } }
  const { observeDecorativeVideo } = await sourceModule('shared/resilience/decorativeVideo.js', { globals: { ...f, IntersectionObserver } })
  const stop = observeDecorativeVideo(video, { shouldPlay: () => enabled })
  return { ...f, video, stop, intersect: visible => intersection?.([{ isIntersecting: visible }]), disable: () => { enabled = false } }
}

test('decorative video recovery preserves position and never reloads healthy media', async () => {
  const f = await fixture(); f.window.dispatchEvent(new Event('online')); assert.equal(f.video.loads, 0)
  f.video.dispatchEvent(new Event('error')); f.window.dispatchEvent(new Event('online'))
  assert.equal(f.video.loads, 1); f.video.dispatchEvent(new Event('loadedmetadata')); assert.equal(f.video.currentTime, 7)
  f.stop()
})

test('decorative media failure received offscreen waits until it is visible', async () => {
  const f = await fixture(); f.intersect(false); const plays = f.video.plays
  f.video.dispatchEvent(new Event('stalled')); f.window.dispatchEvent(new Event('online'))
  assert.equal(f.video.loads, 0); assert.equal(f.video.plays, plays)
  f.intersect(true); assert.equal(f.video.loads, 1); f.stop()
})

test('hidden and disabled decorative media cannot autoplay on reconnect', async () => {
  const f = await fixture(); const plays = f.video.plays
  f.document.hidden = true; f.document.dispatchEvent(new Event('visibilitychange'))
  f.video.dispatchEvent(new Event('error')); f.window.dispatchEvent(new Event('online'))
  assert.equal(f.video.loads, 0); assert.equal(f.video.plays, plays)
  f.disable(); f.document.hidden = false; f.document.dispatchEvent(new Event('visibilitychange'))
  assert.equal(f.video.loads, 0); assert.equal(f.video.plays, plays); f.stop()
})

test('cleanup cancels decorative video recovery and delayed metadata callbacks', async () => {
  const f = await fixture(); f.video.dispatchEvent(new Event('error')); f.window.dispatchEvent(new Event('online'))
  const plays = f.video.plays; f.stop(); f.video.currentTime = 0
  f.video.dispatchEvent(new Event('loadedmetadata')); f.video.dispatchEvent(new Event('canplay')); f.window.dispatchEvent(new Event('online'))
  assert.equal(f.video.currentTime, 0); assert.equal(f.video.plays, plays); assert.equal(f.video.loads, 1)
})

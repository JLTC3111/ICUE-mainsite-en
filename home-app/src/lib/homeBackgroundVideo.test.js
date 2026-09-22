import assert from 'node:assert/strict';
import test from 'node:test';

let fixtureId = 0;

async function createFixture(t, { play, readyState = 2 } = {}) {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval', 'Date'] });
  t.mock.method(console, 'log', () => {});
  t.mock.method(console, 'warn', () => {});
  const idleTasks = new Map();
  const warmupVideos = [];
  let idleId = 0;

  class Video extends EventTarget {
    attributes = new Map();
    style = {};
    isConnected = true;
    paused = true;
    readyState = readyState;
    currentTime = 0;
    duration = 30;
    playCalls = 0;
    loads = 0;
    setAttribute(key, value) { this.attributes.set(key, String(value)); }
    getAttribute(key) { return this.attributes.get(key) ?? null; }
    removeAttribute(key) { this.attributes.delete(key); }
    get src() { return this.getAttribute('src') || ''; }
    set src(value) { this.setAttribute('src', value); }
    get currentSrc() { return this.src; }
    querySelectorAll() { return []; }
    load() { this.loads += 1; }
    pause() { this.paused = true; }
    play() {
      this.playCalls += 1;
      if (play) return play(this);
      this.paused = false;
      return Promise.resolve();
    }
    remove() { warmupVideos.splice(warmupVideos.indexOf(this), 1); }
  }

  const video = new Video();
  const document = Object.assign(new EventTarget(), {
    hidden: false,
    documentElement: new Video(),
    querySelector: () => ({}),
    getElementById: id => id === 'bgVideo' ? video : null,
    createElement: () => new Video(),
    body: { appendChild: el => warmupVideos.push(el) },
  });
  let intersectionCallback;
  class IntersectionObserver {
    constructor(callback) { intersectionCallback = callback; }
    observe() {}
    disconnect() { intersectionCallback = null; }
  }
  const window = Object.assign(new EventTarget(), {
    matchMedia: () => ({ matches: false }),
    requestIdleCallback: callback => {
      idleTasks.set(++idleId, callback);
      return idleId;
    },
    cancelIdleCallback: id => idleTasks.delete(id),
  });
  const storage = () => {
    const values = new Map();
    return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)) };
  };
  const globals = { IntersectionObserver, window, document, navigator: {}, localStorage: storage(), sessionStorage: storage() };
  const descriptors = Object.fromEntries(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  const { default: manager } = await import(`./homeBackgroundVideo.js?fixture=${++fixtureId}`);
  t.after(() => {
    manager.destroy();
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  return { manager, video, document, window, idleTasks, warmupVideos, intersect: visible => intersectionCallback?.([{ isIntersecting: visible }]) };
}

test('turning video off cancels queued preloads and resize work', async t => {
  const { manager, video, window, idleTasks, warmupVideos } = await createFixture(t);
  manager.init();
  assert.ok(video.src);
  video.dispatchEvent(new Event('playing'));
  assert.equal(idleTasks.size, 1);
  window.dispatchEvent(new Event('resize'));
  manager.setEnabled(false);
  for (const callback of idleTasks.values()) callback();
  t.mock.timers.tick(2000);
  assert.equal(video.src, '');
  assert.equal(idleTasks.size, 0);
  assert.equal(warmupVideos.length, 0);
  assert.equal(video.playCalls, 1);
});

test('a play rejection after leaving Home cannot access the detached video', async t => {
  let rejectPlay;
  const { manager, video } = await createFixture(t, {
    play: () => new Promise((resolve, reject) => { rejectPlay = reject; }),
  });
  manager.init();
  manager.destroy();
  rejectPlay(new Error('autoplay blocked'));
  await Promise.resolve();
  t.mock.timers.tick(2000);
  assert.equal(video.playCalls, 1);
  assert.equal(video.src, '');
});

test('a queued autoplay retry is cancelled when video is turned off', async t => {
  const { manager, video } = await createFixture(t, {
    play: () => Promise.reject(new Error('autoplay blocked')),
  });
  manager.init();
  await Promise.resolve();
  manager.setEnabled(false);
  t.mock.timers.tick(2000);
  assert.equal(video.playCalls, 1);
});

test('a rejected promise from a previous activation cannot retry the new video', async t => {
  let rejectPlay;
  const { manager, video } = await createFixture(t, {
    play: el => el.playCalls === 1
      ? new Promise((resolve, reject) => { rejectPlay = reject; })
      : Promise.resolve(),
  });
  manager.init();
  manager.init();
  rejectPlay(new Error('old autoplay blocked'));
  await Promise.resolve();
  t.mock.timers.tick(200);
  assert.equal(video.playCalls, 2);
});

test('loading completion and retry timers do not resume video in a hidden tab', async t => {
  const { manager, video, document } = await createFixture(t, { readyState: 0 });
  manager.init();
  document.hidden = true;
  video.dispatchEvent(new Event('canplay'));
  t.mock.timers.tick(1500);
  assert.equal(video.playCalls, 0);
  document.hidden = false;
  document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(video.playCalls, 1);
});

test('leaving Home removes pending media event listeners', async t => {
  const { manager, video } = await createFixture(t, { readyState: 0 });
  manager.init();
  manager.destroy();
  video.dispatchEvent(new Event('loadedmetadata'));
  video.dispatchEvent(new Event('canplay'));
  t.mock.timers.tick(2000);
  assert.equal(video.playCalls, 0);
});

test('reconnect reloads failed home video and preserves playback position', async t => {
  const { manager, video, window, document } = await createFixture(t);
  manager.init(); video.currentTime = 12; video.dispatchEvent(new Event('stalled'));
  document.hidden = true; document.dispatchEvent(new Event('visibilitychange'));
  const before = video.loads; window.dispatchEvent(new Event('online')); assert.equal(video.loads, before);
  document.hidden = false; document.dispatchEvent(new Event('visibilitychange')); assert.equal(video.loads, before + 1);
  video.currentTime = 0; video.dispatchEvent(new Event('loadedmetadata')); assert.equal(video.currentTime, 12);
});
test('reconnect respects the home video toggle and removes its recovery listeners', async t => {
  const { manager, video, window } = await createFixture(t);
  manager.init(); video.dispatchEvent(new Event('stalled')); manager.setEnabled(false);
  const before = video.loads; window.dispatchEvent(new Event('online')); assert.equal(video.loads, before); assert.equal(video.src, '');
});

test('reconnect defers failed offscreen video until the hero becomes visible', async t => {
  const { manager, video, window, intersect } = await createFixture(t);
  manager.init(); video.currentTime = 9;
  video.dispatchEvent(new Event('stalled')); intersect(false);
  const before = video.loads; const plays = video.playCalls;
  window.dispatchEvent(new Event('online'));
  assert.equal(video.loads, before); assert.equal(video.playCalls, plays);
  intersect(true); assert.equal(video.loads, before + 1);
  video.currentTime = 0; video.dispatchEvent(new Event('loadedmetadata'));
  assert.equal(video.currentTime, 9);
});

test('offscreen autoplay retries and idle preloads cannot restart the hero', async t => {
  const { manager, video, idleTasks, warmupVideos, intersect } = await createFixture(t, {
    play: () => Promise.reject(new Error('interrupted')),
  });
  manager.init(); await Promise.resolve();
  video.dispatchEvent(new Event('playing')); intersect(false);
  for (const callback of idleTasks.values()) callback();
  t.mock.timers.tick(2000);
  assert.equal(video.playCalls, 1); assert.equal(warmupVideos.length, 0);
});

test('restoring from back-forward cache recovers failed media without changing the playlist', async t => {
  const { manager, video, window } = await createFixture(t);
  manager.init(); const src = video.src; const before = video.loads;
  video.dispatchEvent(new Event('stalled'));
  window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }));
  assert.equal(video.loads, before + 1); assert.equal(video.src, src);
});

test('re-enabling the same playlist item restores its source', async t => {
  const { manager, video } = await createFixture(t);
  sessionStorage.setItem('home_bg_video_index', '0'); manager.init(); const src = video.src;
  manager.setEnabled(false); sessionStorage.setItem('home_bg_video_index', '0');
  manager.setEnabled(true); assert.equal(video.src, src); assert.ok(video.src);
});

test('recovery and resize respect reduced motion and data saver', async t => {
  const { manager, video, window } = await createFixture(t);
  manager.init(); const loads = video.loads; const plays = video.playCalls;
  window.matchMedia = query => ({ matches: query === '(prefers-reduced-motion: reduce)' });
  window.dispatchEvent(new Event('online')); window.dispatchEvent(new Event('resize')); t.mock.timers.tick(300);
  assert.equal(video.loads, loads); assert.equal(video.playCalls, plays);
  window.matchMedia = () => ({ matches: false }); navigator.connection = { saveData: true };
  window.dispatchEvent(new Event('online')); assert.equal(video.playCalls, plays);
});

test('mobile landscape uses the existing English mobile video assets', async t => {
  const { manager, video, window } = await createFixture(t);
  window.matchMedia = query => ({ matches: query.includes('(pointer: coarse)') });
  manager.init(); assert.match(video.src, /^\/public\/bgVideos\/home_bg_[1-4]_mobile\.mp4$/);
});

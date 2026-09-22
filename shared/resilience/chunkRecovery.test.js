import test from 'node:test'
import assert from 'node:assert/strict'
import { createChunkLoader } from './chunkRecovery.js'

test('failed module retries use a fresh URL and successful imports keep their identity', async () => {
  const requests = []; const module = { default: 'ready' }
  const load = createChunkLoader(async url => { requests.push(url); return module })
  let initial = 0
  await assert.rejects(load('https://example.test/', '/assets/HomePage-abc.js', () => {
    initial++; return Promise.reject(new Error('cached ESM failure'))
  }))
  const retry = load('https://example.test/', '/assets/HomePage-abc.js')
  assert.equal(load('https://example.test/', '/assets/HomePage-abc.js'), retry)
  assert.equal(await retry, module)
  assert.equal(await load('https://example.test/', '/assets/HomePage-abc.js'), module)
  assert.equal(initial, 1)
  assert.deepEqual(requests, ['https://example.test/assets/HomePage-abc.js?icue-retry=1'])
})

test('a timed-out module can retry without waiting for its original import to settle', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] }); const urls = []
  const load = createChunkLoader(async url => { urls.push(url); return { ready: true } }, { timeoutMs: 40 })
  const pending = load('https://example.test/assets/index.js', './Grid.js', () => new Promise(() => {}))
  const rejected = assert.rejects(pending, { name: 'TimeoutError' })
  await Promise.resolve(); t.mock.timers.tick(40); await rejected
  assert.deepEqual(await load('https://example.test/assets/index.js', './Grid.js'), { ready: true })
  assert.deepEqual(urls, ['https://example.test/assets/Grid.js?icue-retry=1'])
})

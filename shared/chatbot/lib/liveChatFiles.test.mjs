import assert from 'node:assert/strict'
import test from 'node:test'
import { sourceModule } from '../../resilience/testHarness.js'

const config = { url: 'https://example.supabase.co', anonKey: 'public-test-key' }
const identity = { id: '00000000-0000-4000-8000-000000008920', token: 'a'.repeat(64) }

test('attachment upload and download deadlines include a stalled response body', { timeout: 2000 }, async () => {
  for (const kind of ['upload', 'download']) {
    let requestSignal, headersReceived
    const received = new Promise(resolve => { headersReceived = resolve })
    const api = await sourceModule('shared/chatbot/lib/liveChatFiles.js', { globals: {
      FormData, Blob, File,
      fetch: async (_url, init) => {
        requestSignal = init.signal
        headersReceived()
        return new Response(new ReadableStream({ start() {} }))
      },
    } })
    const options = { accessToken: null, timeoutMs: 25 }
    const pending = kind === 'upload'
      ? api.uploadChatFile(config, new File(['PDF'], 'document.pdf', { type: 'application/pdf' }), identity, 'client-file', options)
      : api.downloadChatFile(config, { id: 'file', name: 'document.pdf' }, identity, options)
    const rejected = assert.rejects(pending, error => error.name === 'TimeoutError')
    await received
    assert.equal(requestSignal.aborted, false)
    await rejected
    assert.equal(requestSignal.aborted, true)
  }
})

test('attachment cancellation still works after successful response headers arrive', { timeout: 2000 }, async () => {
  let headersReceived, requestSignal
  const received = new Promise(resolve => { headersReceived = resolve })
  const controller = new AbortController()
  const { uploadChatFile } = await sourceModule('shared/chatbot/lib/liveChatFiles.js', { globals: {
    FormData, Blob, File,
    fetch: async (_url, init) => {
      requestSignal = init.signal
      headersReceived()
      return new Response(new ReadableStream({ start() {} }))
    },
  } })
  const pending = uploadChatFile(config, new File(['PDF'], 'document.pdf', { type: 'application/pdf' }), identity, 'client-file', { accessToken: null, signal: controller.signal })
  const rejected = assert.rejects(pending, error => error.name === 'AbortError')
  await received
  // Let fetch finish returning headers before cancellation.
  await new Promise(resolve => setImmediate(resolve))
  controller.abort()
  await rejected
  assert.equal(requestSignal.aborted, true)
})

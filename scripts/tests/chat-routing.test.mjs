import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import test from 'node:test'
import { createChatMiddleware } from '../lib/chat-routes.mjs'

async function request(middleware, { path, method = 'GET', origin, protocol, publicHost = 'en.icue.vn', forwardedProtocol } = {}) {
  const req = Object.assign(Readable.from([]), {
    url: path, method, protocol,
    headers: {
      host: publicHost, authorization: `Bearer ${'a'.repeat(64)}`,
      ...(origin ? { origin } : {}),
      ...(forwardedProtocol ? { 'x-forwarded-proto': forwardedProtocol } : {}),
    },
  })
  const response = { headers: {}, setHeader(key, value) { this.headers[key] = value }, end(body) { this.body = body?.toString() || '' } }
  await middleware(req, response, error => { throw error || new Error('Chat request bypassed the handler') })
  return response
}

test('local chat middleware serves the same query-free and conflicting-locale URLs as Netlify', async t => {
  t.mock.method(globalThis, 'fetch', async url => {
    const locale = /kb\.([a-z]+)\.json$/.exec(url)?.[1]
    assert.ok(locale)
    return Response.json({ language: locale, intents: [] })
  })
  const middleware = createChatMiddleware()
  for (const [path, language] of [
    ['/chatbot/shared/en', 'en'], ['/chatbot/shared/en?lang=fr', 'en'],
    ['/chatbot/shared/ja/', 'ja'], ['/.netlify/functions/chat-knowledge?lang=fr', 'fr'],
  ]) {
    const response = await request(middleware, { path })
    assert.equal(response.statusCode, 200)
    assert.equal(JSON.parse(response.body).language, language)
  }
  const invalid = await request(middleware, { path: '/chatbot/shared/invalid?lang=en' })
  assert.equal(invalid.statusCode, 404)
})

test('history writes behind HTTPS termination retain Origin validation', async t => {
  let fetched = 0
  t.mock.method(globalThis, 'fetch', async url => {
    assert.equal(url, 'https://vi.icue.vn/.netlify/functions/chat-history')
    fetched++
    return Response.json({ revision: 1 })
  })
  for (const method of ['PUT', 'DELETE']) {
    for (const [middleware, protocol] of [
      [createChatMiddleware({ publicOrigin: 'https://en.icue.vn' }), 'http'],
      [createChatMiddleware(), 'https'],
    ]) {
      const good = await request(middleware, { path: '/.netlify/functions/chat-history', method, protocol, origin: 'https://en.icue.vn' })
      assert.equal(good.statusCode, 200)
      const beforeRejected = fetched
      const bad = await request(middleware, { path: '/.netlify/functions/chat-history', method, protocol, origin: 'https://other.example' })
      assert.equal(bad.statusCode, 403)
      assert.equal(fetched, beforeRejected)
    }
  }
  const beforeUntrusted = fetched
  const untrusted = await request(createChatMiddleware(), {
    path: '/.netlify/functions/chat-history', method: 'DELETE', origin: 'https://en.icue.vn', forwardedProtocol: 'https',
  })
  assert.equal(untrusted.statusCode, 403, 'untrusted forwarding headers cannot change the expected origin')
  assert.equal(fetched, beforeUntrusted)
})

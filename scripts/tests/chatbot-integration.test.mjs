import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import test from 'node:test'
import { sharedKnowledge } from '../../netlify/functions/chat-knowledge.mjs'
import { relayChatHistory } from '../../netlify/functions/chat-history.mjs'
import { createChatbotKnowledge } from '../../shared/chatbot/lib/knowledge.js'
import { createBotCopy } from '../../shared/chatbot/lib/botCopy.js'
import { knowledgeUrls } from '../../shared/chatbot/lib/knowledgeAssets.js'
import { React, act, create, silenceRenderer, sourceModule, unmount } from '../../shared/resilience/testHarness.js'

const locales = ['vi', 'en', 'de', 'fr', 'ko', 'ja']
const request = (locale, method = 'GET') => new Request(`https://en.icue.vn/chatbot/shared/${locale}?lang=${locale}`, { method })

test('the mirrored chatbot and bird artwork match the VN provenance hashes', async () => {
  const manifest = JSON.parse(await fs.readFile(new URL('../../shared/chatbot/upstream.json', import.meta.url)))
  assert.equal(manifest.source, 'ICUE-mainsite-vn')
  assert.ok(manifest.files['shared/chatbot/mascot/icue-bird.webp'])
  assert.ok(manifest.files['shared/chatbot/mascot/icue-bird-core.webp'])
  assert.ok(manifest.files['shared/chatbot/Chatbot.jsx'])
  for (const [file, expected] of Object.entries(manifest.files)) {
    const bytes = await fs.readFile(new URL(`../../${file}`, import.meta.url))
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected, file)
  }
})

test('knowledge uses the live VN JSON for all six languages, accepts no arbitrary destination, and omits credentials', async () => {
  for (const locale of locales) {
    const live = { language: locale, intents: [{ id: 'live-test', answer: 'Updated shared answer' }] }
    const response = await sharedKnowledge(request(locale), async (url, options) => {
      assert.equal(url, `https://icue.vn/public/chatbot/kb.${locale}.json`)
      assert.equal(options.credentials, 'omit')
      assert.equal(options.redirect, 'error')
      return Response.json(live)
    })
    assert.equal(response.headers.get('x-icue-knowledge'), 'live')
    assert.deepEqual(await response.json(), live)
  }
  const invalid = await sharedKnowledge(request('https://other.example'), () => { throw new Error('Must not fetch') })
  assert.equal(invalid.status, 404)
})

test('an upstream outage, HTML fallback, or wrong language uses the synced VN snapshot', async () => {
  for (const fetchUpstream of [
    async () => { throw new Error('Offline') },
    async () => new Response('<html>SPA fallback</html>', { headers: { 'Content-Type': 'text/html' } }),
    async () => Response.json({ language: 'vi', intents: [] }),
  ]) {
    const response = await sharedKnowledge(request('en'), fetchUpstream)
    const kb = await response.json()
    assert.equal(response.headers.get('x-icue-knowledge'), 'snapshot')
    assert.equal(kb.language, 'en')
    assert.ok(kb.intents.length > 30)
    assert.equal(response.headers.get('cache-control'), 'no-store')
  }
  const head = await sharedKnowledge(request('en', 'HEAD'), async () => { throw new Error('Offline') })
  assert.equal(head.status, 200)
  assert.equal(await head.text(), '')
})

test('VN knowledge links stay canonical and retain the answer language on the English host', async () => {
  const response = await sharedKnowledge(request('fr'), async () => Response.json({
    language: 'fr', intents: [{ answer: 'Bonjour', links: [
      { label: 'Contact', url: '/contact' },
      { label: 'Projet', url: '/past-projects/6' },
      { label: 'Outside', url: 'https://example.org/article' },
    ] }],
  }))
  const kb = await response.json()
  assert.deepEqual(kb.intents[0].links.map(link => link.url), [
    'https://icue.vn/contact?lang=fr', 'https://icue.vn/past-projects/6?lang=fr', 'https://example.org/article',
  ])
})

test('the actual retrieval engine reads the shared relay and answers a site question', async t => {
  const kb = JSON.parse(await fs.readFile(new URL('../../public/chatbot/kb.en.json', import.meta.url)))
  const copy = createBotCopy({ faqsUrl: 'https://icue.vn/faqs?lang=en', contactUrl: 'https://icue.vn/contact?lang=en' })
  const urls = []
  t.mock.method(globalThis, 'fetch', async url => { urls.push(url); return Response.json(kb) })
  const knowledge = createChatbotKnowledge({ siteLang: 'en', urls: knowledgeUrls, copy })
  const response = await knowledge.getResponse('What consulting services does ICUE provide?')
  assert.ok(urls.includes('/chatbot/shared/en'))
  assert.ok(response.content.length > 40)
  assert.notEqual(response.meta.source, 'fallback')
})

test('encrypted history pairs with the existing VN vault and keeps upstream status and ciphertext', async () => {
  const token = 'a'.repeat(64)
  const payload = { revision: 2, payload: { version: 1, iv: 'b'.repeat(16), data: 'c'.repeat(24) } }
  for (const method of ['GET', 'PUT', 'DELETE']) {
    const response = await relayChatHistory(new Request('https://en.icue.vn/.netlify/functions/chat-history', {
      method, headers: { Authorization: `Bearer ${token}`, Origin: 'https://en.icue.vn', Cookie: 'must-not-forward', ...(method === 'PUT' ? { 'Content-Type': 'application/json' } : {}) },
      ...(method === 'PUT' ? { body: JSON.stringify(payload) } : {}),
    }), async (url, options) => {
      assert.equal(url, 'https://icue.vn/.netlify/functions/chat-history')
      assert.equal(options.method, method)
      assert.equal(options.credentials, 'omit')
      assert.equal(options.headers.Authorization, `Bearer ${token}`)
      assert.equal(options.headers.Origin, 'https://icue.vn')
      assert.ok(!('Cookie' in options.headers))
      if (method === 'PUT') assert.deepEqual(JSON.parse(await options.body.text()), payload)
      return Response.json({ revision: 3 }, { status: 200 })
    })
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { revision: 3 })
    assert.equal(response.headers.get('cache-control'), 'private, no-store')
  }
})

test('history rejects missing capabilities, cross-origin callers, oversized bodies, and unsupported methods before reaching VN', async () => {
  const headers = { Authorization: `Bearer ${'a'.repeat(64)}` }
  const cases = [
    [new Request('https://en.icue.vn/.netlify/functions/chat-history'), 401],
    [new Request('https://en.icue.vn/.netlify/functions/chat-history', { headers: { ...headers, Origin: 'https://other.example' } }), 403],
    [new Request('https://en.icue.vn/.netlify/functions/chat-history', { method: 'POST', headers }), 405],
    [new Request('https://en.icue.vn/.netlify/functions/chat-history', { method: 'PUT', headers, body: 'x'.repeat(1_501_001) }), 413],
  ]
  for (const [input, status] of cases) {
    const response = await relayChatHistory(input, () => { throw new Error('Must not fetch') })
    assert.equal(response.status, status)
  }
})

test('the English host adapter keeps chat copy and VN links in English despite an old locale preference', async t => {
  silenceRenderer(t)
  const listeners = new Set()
  const i18n = { language: 'en', resolvedLanguage: 'en', on: (_, listener) => listeners.add(listener), off: (_, listener) => listeners.delete(listener), getResource: () => undefined }
  const { default: SiteChatbot } = await sourceModule('shared/chatbot/SiteChatbot.jsx', { imports: { './Chatbot.jsx': { default: props => React.createElement('chat-fixture', props) } } })
  let renderer
  await act(async () => { renderer = create(React.createElement(SiteChatbot, { i18n })) })
  const props = () => renderer.root.findByType('chat-fixture').props
  assert.equal(props().locale, 'en')
  assert.equal(props().links.contact, 'https://icue.vn/contact?lang=en')
  await act(async () => {
    i18n.language = i18n.resolvedLanguage = 'ja'
    renderer.update(React.createElement(SiteChatbot, { i18n }))
  })
  assert.equal(props().locale, 'en')
  assert.equal(props().links.faqs, 'https://icue.vn/faqs?lang=en')
  await unmount(renderer)
  assert.equal(listeners.size, 0)
})

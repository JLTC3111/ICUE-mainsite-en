import assert from 'node:assert/strict'
import test from 'node:test'
import { sharedChatConfig } from '../../netlify/functions/chat-config.mjs'
import { getBootstrapExternalRedirect } from '../../home-app/src/lib/bootstrapExternalRedirect.js'
import { staffPortalUrl } from '../../shared/contact-sidebar/staffPortal.js'
import { NAV_LABELS } from '../../shared/main-site-nav/navContent.js'
import { React, act, create, platform, silenceRenderer, sourceModule, unmount } from '../../shared/resilience/testHarness.js'

const configRequest = method => new Request('https://en.icue.vn/newsroom/supabase-config.json', { method })
const publicKey = role => `header.${Buffer.from(JSON.stringify({ role })).toString('base64url')}.signature`

test('English live chat relays only the existing public VN configuration and rejects private keys', async () => {
  for (const anonKey of [publicKey('anon'), 'sb_publishable_test']) {
    const response = await sharedChatConfig(configRequest('GET'), async (url, options) => {
      assert.equal(url, 'https://icue.vn/newsroom/supabase-config.json')
      assert.equal(options.credentials, 'omit')
      assert.equal(options.redirect, 'error')
      return Response.json({ url: 'https://example.supabase.co', anonKey, privateValue: 'must-not-leak' })
    })
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.deepEqual(await response.json(), { url: 'https://example.supabase.co', anonKey })
  }
  for (const payload of [
    { url: 'https://example.supabase.co', anonKey: publicKey('service_role') },
    { url: 'https://example.supabase.co', anonKey: 'sb_secret_test' },
    { url: 'https://other.example', anonKey: 'sb_publishable_test' },
  ]) {
    assert.equal((await sharedChatConfig(configRequest('GET'), async () => Response.json(payload))).status, 503)
  }
  assert.equal((await sharedChatConfig(configRequest('POST'), () => { throw new Error('Must not fetch') })).status, 405)
  assert.equal(getBootstrapExternalRedirect('/newsroom/supabase-config.json'), null)
  assert.equal(getBootstrapExternalRedirect('/newsroom/portal', '?mode=staff'), 'https://icue.vn/newsroom/portal?mode=staff&lang=en')
})

test('staff sign-in always opens the shared portal with English selected', () => {
  assert.equal(staffPortalUrl(), 'https://icue.vn/newsroom/portal?mode=staff&lang=en')
})

test('People stays in the pill header on desktop and tablet and has a direct mobile action', async t => {
  silenceRenderer(t)
  for (const width of [1440, 900, 390]) {
    const f = platform()
    f.window.matchMedia = query => Object.assign(new EventTarget(), { matches: query.includes('768') ? width <= 768 : width <= 1024 })
    const { default: Header } = await sourceModule('home-app/src/components/PillSiteHeader.jsx', {
      globals: f,
      imports: {
        '../hooks/useHeaderOverHero.js': { default: () => false },
        './HomeThemeToggle.jsx': { default: () => null },
        './HomeBeamsToggle.jsx': { default: () => null },
        '@icue/main-site-nav/MetallicMenuIcon': { default: () => null },
        '@icue/main-site-nav/VideoToggle': { default: () => null },
      },
    })
    let renderer
    const peopleHref = 'https://icue.vn/people/experts?lang=en'
    await act(async () => { renderer = create(React.createElement(Header, {
      activePage: 'coreTeam', homeHref: '/', labels: NAV_LABELS,
      items: [{ page: 'Home', href: '/', label: 'Home' }, { page: 'ourPeople', href: peopleHref, label: 'People / Staff' }],
      LanguageControl: () => null,
    })) })
    const link = renderer.root.findByProps({ 'data-page': 'ourPeople' })
    assert.equal(link.props.href, peopleHref)
    assert.equal(link.props['aria-current'], 'page')
    assert.equal(link.props['aria-label'], 'People / Staff')
    assert.equal(link.props.target, undefined)
    await unmount(renderer)
  }
})

test('the shared dock header also exposes the English People destination', async t => {
  silenceRenderer(t)
  const wrapper = ({ children }) => React.createElement('div', null, children)
  const { default: Header } = await sourceModule('shared/main-site-nav/MainSiteHeader.jsx', {
    imports: {
      '@icue/ui/Dock': { Dock: wrapper, DockIcon: wrapper },
      './MetallicMenuIcon': { default: () => null },
      './VideoToggle': { default: () => null },
    },
  })
  let renderer
  await act(async () => { renderer = create(React.createElement(Header, { LanguageControl: () => null })) })
  assert.equal(renderer.root.findByProps({ 'data-page': 'ourPeople' }).props.href, 'https://icue.vn/people/experts?lang=en')
  await unmount(renderer)
})

test('signing in on English claims the current guest conversation and sign-out clears the account view', async t => {
  silenceRenderer(t)
  const user = { id: '00000000-0000-4000-8000-000000000123', email: 'visitor@example.invalid' }
  let account = { user: null, status: 'ready' }
  let chat = { messages: [], conversation: { id: 'conversation', account_saved: false } }
  const listeners = new Set(), chatListeners = new Set(), claims = []
  const publish = () => listeners.forEach(notify => notify())
  const client = { auth: {
    async signInWithPassword(args) {
      assert.equal(args.email, user.email)
      assert.equal(args.password, 'example-password')
      account = { user, status: 'ready' }; publish()
      return { data: { session: { user } } }
    },
    async signOut() { account = { user: null, status: 'ready' }; publish(); return {} },
  } }
  const live = {
    subscribe: notify => { chatListeners.add(notify); return () => chatListeners.delete(notify) },
    getSnapshot: () => chat,
    async syncAccount(next) {
      claims.push(next?.id || null)
      chat = { ...chat, conversation: next ? { id: 'conversation', account_saved: true } : null }
      chatListeners.forEach(notify => notify())
    },
  }
  const { default: Dialog } = await sourceModule('shared/customer-account/CustomerAccountDialog.jsx', {
    globals: { document: { activeElement: null, body: {} }, FormData: class { constructor(form) { this.fields = form.fields } get(key) { return this.fields[key] } } },
    imports: {
      'react-dom': { createPortal: element => element },
      '../ui/useModalFocus.js': { default() {} },
      './account.js': { connectAccount: async () => client, getAccountSnapshot: () => account, subscribeAccount: notify => { listeners.add(notify); return () => listeners.delete(notify) } },
      '../chatbot/lib/liveChat.js': { getLiveChatClient: () => live, liveChatRpc: async () => ({ conversations: [] }) },
    },
  })
  let renderer
  await act(async () => { renderer = create(React.createElement(Dialog, { onClose() {} })) })
  await act(async () => renderer.root.findByType('form').props.onSubmit({ preventDefault() {}, currentTarget: { fields: { email: user.email, password: 'example-password' } } }))
  assert.ok(claims.includes(user.id))
  assert.ok(JSON.stringify(renderer.toJSON()).includes('Your conversation and files are saved'))
  const logout = renderer.root.findAllByType('button').find(button => button.props.children === 'Sign out')
  await act(async () => logout.props.onClick())
  assert.equal(claims.at(-1), null)
  assert.equal(renderer.root.findAllByType('form').length, 1)
  await unmount(renderer)
  assert.equal(listeners.size, 0)
  assert.equal(chatListeners.size, 0)
})

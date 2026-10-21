import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { LANGUAGE_OPTIONS, languageSelectionTarget } from '../../home-app/src/lib/siteLanguage.js'
import { redirectExternalAppAtBootstrap } from '../../home-app/src/lib/bootstrapExternalRedirect.js'
import { React, act, create, silenceRenderer, sourceModule, unmount } from '../../shared/resilience/testHarness.js'

const require = createRequire(import.meta.url)

test('the English site renders English regardless of saved, requested, or programmatic locale changes', async () => {
  const instance = require('i18next').createInstance()
  const stored = new Map([['icue_news_lang', 'de']])
  await sourceModule('home-app/src/lib/i18n.js', {
    globals: {
      window: { location: { search: '?lang=fr' } },
      localStorage: { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value) },
    },
    imports: {
      i18next: { default: instance },
      'react-i18next': { initReactI18next: { type: '3rdParty', init() {} } },
    },
  })
  assert.equal(instance.resolvedLanguage, 'en')
  for (const { code } of LANGUAGE_OPTIONS) {
    await instance.changeLanguage(code)
    assert.equal(instance.resolvedLanguage, 'en')
    assert.equal(instance.hasResourceBundle(code, 'translation'), code === 'en')
  }
  assert.equal(instance.t('lang.label'), 'Page language')
  assert.equal(stored.get('icue_news_lang'), 'de', 'Opening English must preserve the separate main-site preference')
})

test('every non-English flag opens icue.vn in the chosen locale and retains campaign parameters and anchors', () => {
  for (const { code } of LANGUAGE_OPTIONS.filter(language => language.code !== 'en')) {
    const target = new URL(languageSelectionTarget(code, {
      pathname: '/', search: '?lang=en&utm_campaign=autumn&site=en&from=en-news', hash: '#home-news',
    }))
    assert.equal(target.origin, 'https://icue.vn')
    assert.equal(target.pathname, '/')
    assert.equal(target.searchParams.get('lang'), code)
    assert.equal(target.searchParams.get('utm_campaign'), 'autumn')
    assert.equal(target.searchParams.has('site'), false)
    assert.equal(target.searchParams.has('from'), false)
    assert.equal(target.hash, '#home-news')
  }
  assert.equal(languageSelectionTarget('en'), null)
  assert.equal(languageSelectionTarget('invalid'), null)
  assert.equal(languageSelectionTarget('jp', { pathname: '/past-projects/12' }), 'https://icue.vn/past-projects/12?lang=ja')
})

test('the actual flag menu stays English and redirects even when local storage is blocked', async t => {
  silenceRenderer(t)
  const navigations = []
  const { default: Menu } = await sourceModule('home-app/src/components/SiteLanguageMenu.jsx', {
    globals: {
      window: { location: { assign: target => navigations.push(target) } },
      localStorage: { setItem() { throw new Error('Storage unavailable') } },
    },
    imports: {
      'react-router-dom': { useLocation: () => ({ pathname: '/', search: '', hash: '' }) },
      '@icue/i18n/LanguageFlagMenu': { default: 'language-menu' },
    },
  })
  let renderer
  await act(async () => { renderer = create(React.createElement(Menu)) })
  const menu = renderer.root.findByType('language-menu')
  assert.equal(menu.props.value, 'en')
  for (const code of ['vi', 'de', 'fr', 'ko', 'ja']) {
    menu.props.onChange(code)
    assert.equal(navigations.at(-1), `https://icue.vn/?lang=${code}`)
  }
  menu.props.onChange('en')
  assert.equal(navigations.length, 5)
  await unmount(renderer)
})

test('bookmarked non-English home links redirect before React mounts, preserving anchors', () => {
  const replacements = []
  assert.equal(redirectExternalAppAtBootstrap({
    href: 'https://en.icue.vn/?lang=fr#home-news', pathname: '/', search: '?lang=fr', hash: '#home-news',
    replace: href => replacements.push(href),
  }), true)
  assert.deepEqual(replacements, ['https://icue.vn/?lang=fr#home-news'])
  for (const search of ['', '?lang=en', '?lang=invalid']) {
    assert.equal(redirectExternalAppAtBootstrap({
      href: `https://en.icue.vn/${search}`, pathname: '/', search,
      replace() { throw new Error('English home must stay local') },
    }), false)
  }
})

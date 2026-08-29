import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageFlagMenu from '@icue/i18n/LanguageFlagMenu'
import { normalizeUiLang } from '@icue/i18n/withUiLang'
import { buildLanguageSwitchTarget } from '@icue/main-site-nav/languageSwitcher'
import { CROSS_SITE_LANGUAGE, SUPPORTED_LANGUAGES } from '../lib/i18n'

/**
 * Replaces the flag link in the injected nav.
 *
 * Five of the six entries change this app's UI language in place. The sixth,
 * Vietnamese, is the crossing to icue.vn the flag has always been — and it
 * lands on the counterpart of the page you were reading, not the homepage.
 *
 * Module scope, not inline in App: a component identity that changed each
 * render would remount the whole nav.
 */
export default function SiteLanguageMenu() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const value = i18n.resolvedLanguage || i18n.language

  useEffect(() => {
    const code = normalizeUiLang(value)
    if (!code || code === CROSS_SITE_LANGUAGE.code) return

    const params = new URLSearchParams(location.search)
    if (code === 'en') {
      if (!params.has('lang')) return
      params.delete('lang')
    } else if (params.get('lang') === code) {
      return
    } else {
      params.set('lang', code)
    }

    const search = params.toString()
    navigate(
      {
        pathname: location.pathname,
        search: search ? `?${search}` : '',
        hash: location.hash,
      },
      { replace: true },
    )
  }, [location.hash, location.pathname, location.search, navigate, value])

  const handleChange = (code) => {
    if (code !== CROSS_SITE_LANGUAGE.code) {
      i18n.changeLanguage(code)
      return
    }

    // `currentSiteLanguage` is explicit because this app now sets <html lang>
    // to whichever UI language is active, which the host sniffing would read
    // as a site identity on localhost.
    const target = buildLanguageSwitchTarget({ currentSiteLanguage: 'en' })
    try {
      localStorage.setItem('preferredLanguage', target.targetSite.language)
      localStorage.setItem('lastVisitedPage', target.targetPageName)
      // The UI-language key is shared with every ICUE app, icue.vn included.
      // Without this a reader who was reading in German and then asked for
      // Vietnamese would land on the Vietnamese site still set to German.
      localStorage.setItem('icue_news_lang', CROSS_SITE_LANGUAGE.code)
    } catch {
      // Storage can be unavailable in privacy-restricted contexts.
    }

    // Do not carry `?lang=fr` (etc.) across: the destination would honour it
    // over the Vietnamese store write above. Stamp `lang=vi` instead.
    try {
      const dest = new URL(target.targetUrl)
      dest.searchParams.delete('site')
      dest.searchParams.delete('from')
      dest.searchParams.set('lang', CROSS_SITE_LANGUAGE.code)
      window.location.assign(dest.toString())
    } catch {
      window.location.assign(target.targetUrl)
    }
  }

  return (
    <LanguageFlagMenu
      languages={SUPPORTED_LANGUAGES}
      value={value}
      onChange={handleChange}
      ariaLabel={t('lang.label')}
    />
  )
}

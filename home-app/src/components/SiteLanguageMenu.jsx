import { useLocation } from 'react-router-dom'
import LanguageFlagMenu from '@icue/i18n/LanguageFlagMenu'
import { normalizeUiLang } from '@icue/i18n/withUiLang'
import { pageFromPathname } from '@icue/main-site-nav/languageSwitcher'
import { LANGUAGE_OPTIONS, languageSelectionTarget } from '../lib/siteLanguage'

export default function SiteLanguageMenu() {
  const location = useLocation()

  const handleChange = (code) => {
    const target = languageSelectionTarget(code, location)
    if (!target) return

    try {
      const language = normalizeUiLang(code)
      localStorage.setItem('preferredLanguage', language)
      localStorage.setItem('lastVisitedPage', pageFromPathname(location.pathname))
      localStorage.setItem('icue_news_lang', language)
    } catch {
      // Navigation also works when browser storage is unavailable.
    }

    window.location.assign(target)
  }

  return (
    <LanguageFlagMenu
      languages={LANGUAGE_OPTIONS}
      value="en"
      onChange={handleChange}
      ariaLabel="Language"
    />
  )
}

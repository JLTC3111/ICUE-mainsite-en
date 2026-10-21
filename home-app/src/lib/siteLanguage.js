import { normalizeUiLang, withUiLang } from '../../../shared/i18n/withUiLang.js'
import { resolveMainSiteLink } from '../../../shared/site-routes/mainSitePaths.js'
import { pageFromPathname } from '../../../shared/main-site-nav/languageSwitcher.js'

// English renders here; every other flag opens the main site's selected locale.
export const LANGUAGE_OPTIONS = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'ko', label: '한국어' },
  { code: 'ja', label: '日本語' },
]

export function languageSelectionTarget(code, { pathname = '/', search = '', hash = '' } = {}) {
  const language = normalizeUiLang(code, null)
  if (!language || language === 'en') return null

  const target = new URL(resolveMainSiteLink(pageFromPathname(pathname), language, undefined, pathname))
  for (const [key, value] of new URLSearchParams(search)) {
    if (key !== 'lang') target.searchParams.append(key, value)
  }
  target.hash = hash
  return withUiLang(target.href, language)
}

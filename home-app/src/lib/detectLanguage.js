/** Shared with the newsroom, Our Work and Contact on icue.vn, so a choice made
    on one of them survives the walk back to this home page. */
const LANG_KEY = 'icue_news_lang'

/** The UI languages this app actually ships. Must match UI_LANGUAGES in i18n.js. */
const UI_CODES = new Set(['en', 'de', 'fr', 'ko', 'ja'])

function readStored() {
  try {
    return localStorage.getItem(LANG_KEY)
  } catch {
    return null
  }
}

function store(code) {
  try {
    localStorage.setItem(LANG_KEY, code)
  } catch {
    // Storage can be unavailable in privacy-restricted contexts.
  }
}

/**
 * A stored `vi` is deliberately not honoured here and not overwritten:
 * Vietnamese on this site means icue.vn, and silently bouncing a reader across
 * domains on page load is worse than showing them the page the URL promised.
 * They get the English UI and the flag menu still offers the crossing.
 */
export function detectInitialLanguage() {
  const params = new URLSearchParams(window.location.search)

  const requested = params.get('lang')
  if (requested && UI_CODES.has(requested)) {
    store(requested)
    return requested
  }

  const saved = readStored()
  if (saved && UI_CODES.has(saved)) return saved

  return 'en'
}

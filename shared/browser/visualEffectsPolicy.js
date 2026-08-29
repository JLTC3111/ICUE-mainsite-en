const GECKO_PRIVACY_BROWSER_RE = /\b(?:Firefox|FxiOS|Mullvad|TorBrowser)\b/i

function readBrowserPrivacyEnvironment() {
  if (typeof navigator === 'undefined') {
    return { globalPrivacyControl: false, userAgent: '' }
  }

  return {
    globalPrivacyControl: navigator.globalPrivacyControl === true,
    userAgent: navigator.userAgent || '',
  }
}

/**
 * Mullvad and Tor intentionally present a Firefox-like fingerprint, so trying
 * to distinguish them with another capability probe would work against their
 * privacy model. Keep canvas/WebGL effects off for Gecko and for browsers that
 * explicitly expose Global Privacy Control instead.
 */
export function shouldAvoidCanvasEffects(environment = readBrowserPrivacyEnvironment()) {
  return environment.globalPrivacyControl === true
    || GECKO_PRIVACY_BROWSER_RE.test(environment.userAgent || '')
}

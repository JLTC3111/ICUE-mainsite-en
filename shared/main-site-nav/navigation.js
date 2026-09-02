export function isUnmodifiedPrimaryActivation(event) {
  if (!event || event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;

  const anchor = event.currentTarget;
  if (anchor?.hasAttribute?.('download')) return false;
  if (anchor?.target && anchor.target !== '_self') return false;

  return true;
}

/**
 * Same-origin paths that are NOT routes of this SPA — Netlify redirects them to
 * an app hosted elsewhere. Handing one to the router would land on the
 * catch-all instead of navigating, so they must stay real link activations.
 */
const EXTERNAL_APP_PATHS = new Set([
  '/our-work',
  '/contact',
  '/about-us',
  '/faqs',
  '/recruitment',
  '/community-activities',
  '/legal/privacy',
  '/legal/terms',
  '/legal/gdpr',
  '/legal/cookies',
]);

export function getSameOriginNavigationTarget(href) {
  if (!href || typeof window === 'undefined' || href.startsWith('#')) return null;

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return null;
    if (EXTERNAL_APP_PATHS.has(url.pathname.replace(/\/$/, ''))) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function handleSpaNavigation(event, href, onNavigate) {
  if (typeof onNavigate !== 'function' || !isUnmodifiedPrimaryActivation(event)) {
    return false;
  }

  const target = getSameOriginNavigationTarget(href);
  if (!target) return false;

  event.preventDefault();
  onNavigate(target);
  return true;
}

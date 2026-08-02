export function isUnmodifiedPrimaryActivation(event) {
  if (!event || event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;

  const anchor = event.currentTarget;
  if (anchor?.hasAttribute?.('download')) return false;
  if (anchor?.target && anchor.target !== '_self') return false;

  return true;
}

export function getSameOriginNavigationTarget(href) {
  if (!href || typeof window === 'undefined' || href.startsWith('#')) return null;

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return null;
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

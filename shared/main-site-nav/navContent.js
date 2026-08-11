/**
 * Every word the site chrome says, in one place.
 *
 * The nav and footer are injected into pages that no longer share a single
 * language: this site's home app now carries five UI languages of its own.
 * So the copy is a prop rather than a constant — pass `labels` to MainSiteNav
 * and it flows down to the drawer, the pill header and the aria strings.
 *
 * Omit it and you get these English defaults, which is what every page that
 * has not been localized still shows.
 */
export const NAV_LABELS = {
  /** Full destination names — the drawer, and the pill's accessible name. */
  pages: {
    Home: 'Home',
    orgStructure: 'Structure',
    ourWork: 'Our Work',
    pastProjects: 'Project History',
    News: 'News',
    aboutUs: 'About Us',
    Contact: 'Contact',
    ourPeople: 'Personnel',
    meetOurExperts: 'Meet Our Experts',
    coreTeam: 'Core Team',
  },
  /** Shorter forms for the pill, where a long label breaks the row. */
  compact: {
    Home: 'Home',
    orgStructure: 'Structure',
    ourWork: 'Our Work',
    pastProjects: 'Projects',
    News: 'News',
    aboutUs: 'About',
  },
  aria: {
    nav: 'Site navigation',
    home: 'Go to homepage',
    more: 'Open additional navigation',
    moreLabel: 'More',
    overflow: 'Additional navigation',
    openMenu: 'Open full navigation menu',
    toggleMenu: 'Toggle navigation menu',
    closeMenu: 'Close full navigation menu',
    resizeMenu: 'Resize navigation menu',
    resizeMenuTitle: 'Drag to resize menu',
    homeVideo: 'Toggle background video',
    aboutUsVideo: 'Toggle background video (About Us)',
  },
  /** The dock variant's wordmark link, set in video-filled type. */
  contactWordmark: 'About Us',
}

/**
 * Shallow-merges one level down, so a caller can override `pages` without
 * having to restate `aria`, and can leave individual keys inside either group
 * to the defaults.
 */
export function resolveNavLabels(overrides) {
  // A missing `nav` key makes i18next hand back the key string rather than the
  // block; spreading that would fill `pages` with character indices. Falling
  // back to the defaults keeps the nav readable instead.
  if (!overrides || typeof overrides !== 'object') return NAV_LABELS
  return {
    ...NAV_LABELS,
    ...overrides,
    pages: { ...NAV_LABELS.pages, ...overrides.pages },
    compact: { ...NAV_LABELS.compact, ...overrides.compact },
    aria: { ...NAV_LABELS.aria, ...overrides.aria },
  }
}

/** Re-labels a link list by page key, leaving hrefs and icons alone. */
export function localizeNavLinks(links, labels) {
  return links.map((link) => {
    const label = labels.pages[link.page]
    return label && label !== link.label ? { ...link, label } : link
  })
}

/** Same, for the Personnel group and the two entries under it. */
export function localizePeopleSubmenu(submenu, labels) {
  return {
    ...submenu,
    label: labels.pages[submenu.page] ?? submenu.label,
    items: localizeNavLinks(submenu.items, labels),
  }
}

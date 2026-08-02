import { DRAWER_LINKS, PEOPLE_SUBMENU, STANDALONE_DRAWER_LINKS } from './navLinks';
import {
  getSameOriginNavigationTarget,
  isUnmodifiedPrimaryActivation,
} from './navigation';

export function navigateDrawerLink(event, link, onClose, onNavigate) {
  if (!isUnmodifiedPrimaryActivation(event)) return;

  if (link.href.startsWith('#/')) {
    event.preventDefault();
    onClose();
    window.location.hash = link.href;
    return;
  }

  const target = getSameOriginNavigationTarget(link.href);
  if (target && typeof onNavigate === 'function') {
    event.preventDefault();
    onClose();
    onNavigate(target);
    return;
  }

  // Let the browser handle external links and same-origin links when no SPA
  // navigator is available. This preserves modifier-click and link semantics.
  onClose();
}

export function buildMainSiteDrawerNav({
  activePage,
  onClose,
  links = DRAWER_LINKS,
  peopleSubmenu = PEOPLE_SUBMENU,
  peopleOpen,
  onPeopleToggle,
  onNavigate,
}) {
  const navLinks = links.map((link, index) => ({
    key: link.page,
    page: link.page,
    href: link.href,
    label: link.label,
    index: index + 1,
    icon: link.icon,
    isCurrent: link.page === activePage,
    onClick: (e) => {
      navigateDrawerLink(e, link, onClose, onNavigate);
    },
  }));

  const people = {
    open: peopleOpen,
    onToggle: (e) => {
      e.preventDefault();
      onPeopleToggle();
    },
    label: peopleSubmenu.label,
    index: links.length + 1,
    icon: peopleSubmenu.icon,
    items: peopleSubmenu.items.map((item) => ({
      key: item.page,
      page: item.page,
      href: item.href,
      label: item.label,
      className: item.className,
      icon: item.icon,
      isCurrent: item.page === activePage,
      onClick: (e) => {
        navigateDrawerLink(e, item, onClose, onNavigate);
      },
    })),
  };

  return { navLinks, people };
}

export { DRAWER_LINKS, PEOPLE_SUBMENU, STANDALONE_DRAWER_LINKS };

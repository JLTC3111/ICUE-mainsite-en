import { articleUrl, projectCardUrl } from '../lib/siteLinks'
import { NEWSROOM_URL, OUR_WORK_APP_URL, ROUTE_PATHS } from '../lib/routes'

/**
 * Structure here, words in the locale files.
 *
 * Everything below — ids, images, hrefs, which section is `alt`, which cards
 * are image-only — is layout and does not change with language. The titles,
 * descriptions, link labels and alt text all come from `home.*` in
 * src/locales/, so a reader on the Korean or German page gets the whole home
 * page rather than a translated menu on top of English copy.
 *
 * The card keys (`laoCai`, `auCoPark`, …) are the join between the two: rename
 * one here and the same key has to move in all five locale files.
 */
const SECTION_LAYOUT = [
  {
    id: 'home-past-projects',
    key: 'pastProjects',
    linkHref: ROUTE_PATHS.pastProjects,
    cards: [
      { key: 'laoCai', image: '/public/pastProjects/pp_1.jpg', href: projectCardUrl(1) },
      { key: 'subdivision6b', image: '/public/pastProjects/pp_3.jpg', href: projectCardUrl(3) },
      { key: 'dongYen', image: '/public/pastProjects/pp_5.jpg', href: projectCardUrl(5) },
    ],
  },
  {
    id: 'home-our-work',
    key: 'ourWork',
    alt: true,
    linkHref: OUR_WORK_APP_URL,
    cards: [
      { key: 'evaluation', image: '/public/work/ourWork_img1.jpg', href: OUR_WORK_APP_URL },
      { key: 'quantitySurveying', image: '/public/work/ourWork_img2.jpg', href: OUR_WORK_APP_URL },
      { key: 'gapAnalysis', image: '/public/work/ourWork_img3.jpg', href: OUR_WORK_APP_URL },
    ],
  },
  {
    id: 'home-news',
    key: 'news',
    linkHref: NEWSROOM_URL,
    cards: [
      { key: 'auCoPark', image: '/public/news/articles/Card_1.jpg', href: articleUrl(1) },
      { key: 'conservationForum', image: '/public/news/articles/Card_2.jpg', href: articleUrl(2) },
      { key: 'yagi', image: '/public/news/articles/Card_3.jpg', href: articleUrl(3) },
    ],
  },
  {
    id: 'home-recruitment',
    key: 'recruitment',
    alt: true,
    linkHref: ROUTE_PATHS.recruitment,
    cards: [
      { key: 'culture', image: '/public/recruitment/office.jpg', href: ROUTE_PATHS.recruitment, imageOnly: true },
      { key: 'growth', image: '/public/recruitment/event.jpg', href: ROUTE_PATHS.recruitment, imageOnly: true },
      { key: 'impact', image: '/public/recruitment/survey.jpg', href: ROUTE_PATHS.recruitment, imageOnly: true },
    ],
  },
]

export function buildHero(t) {
  return {
    bannerLabel: t('home.hero.bannerLabel'),
    bannerHref: NEWSROOM_URL,
    title: t('home.hero.title'),
    subtitle: t('home.hero.subtitle'),
    ariaLabel: t('home.hero.ariaLabel'),
    actions: [
      { label: t('home.hero.actions.contact'), href: ROUTE_PATHS.contact, variant: 'primary' },
      { label: t('home.hero.actions.pastProjects'), href: ROUTE_PATHS.pastProjects, variant: 'ghost' },
    ],
  }
}

export function buildHomeSections(t) {
  return SECTION_LAYOUT.map((section) => ({
    id: section.id,
    alt: section.alt,
    linkHref: section.linkHref,
    title: t(`home.sections.${section.key}.title`),
    description: t(`home.sections.${section.key}.description`),
    linkLabel: t(`home.sections.${section.key}.linkLabel`),
    cards: section.cards.map((card) => ({
      image: card.image,
      href: card.href,
      imageOnly: card.imageOnly,
      title: t(`home.sections.${section.key}.cards.${card.key}.title`),
      description: t(`home.sections.${section.key}.cards.${card.key}.description`),
      imageAlt: t(`home.sections.${section.key}.cards.${card.key}.imageAlt`),
    })),
  }))
}

/** Stable across languages — the beam network only needs the shape. */
export const SECTION_COUNT = SECTION_LAYOUT.length
export const CARD_COUNTS = SECTION_LAYOUT.map((section) => section.cards.length)

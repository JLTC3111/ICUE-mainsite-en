import { articleUrl, projectCardUrl } from '../lib/siteLinks'
import { withUiLang } from '@icue/i18n/withUiLang'
import recruitmentOffice from '../../../public/recruitment/office.jpg?url'
import recruitmentEvent from '../../../public/recruitment/event.jpg?url'
import recruitmentSurvey from '../../../public/recruitment/survey.jpg?url'
import {
  CONTACT_APP_URL,
  NEWSROOM_URL,
  OUR_WORK_APP_URL,
  PAST_PROJECTS_APP_URL,
  RECRUITMENT_APP_URL,
} from '../lib/routes'

/**
 * Layout and assets live here; English titles, descriptions, and labels live
 * under `home.*` in src/locales/en.json. Card keys join the two structures.
 */
const SECTION_LAYOUT = [
  {
    id: 'home-past-projects',
    key: 'pastProjects',
    linkHref: PAST_PROJECTS_APP_URL,
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
    linkHref: RECRUITMENT_APP_URL,
    cards: [
      { key: 'culture', image: recruitmentOffice, href: RECRUITMENT_APP_URL, imageOnly: true },
      { key: 'growth', image: recruitmentEvent, href: RECRUITMENT_APP_URL, imageOnly: true },
      { key: 'impact', image: recruitmentSurvey, href: RECRUITMENT_APP_URL, imageOnly: true },
    ],
  },
]

export function buildHero(t, lang = 'en') {
  return {
    bannerLabel: t('home.hero.bannerLabel'),
    bannerHref: withUiLang(NEWSROOM_URL, lang),
    title: t('home.hero.title'),
    subtitle: t('home.hero.subtitle'),
    ariaLabel: t('home.hero.ariaLabel'),
    actions: [
      { label: t('home.hero.actions.contact'), href: withUiLang(CONTACT_APP_URL, lang), variant: 'primary' },
      { label: t('home.hero.actions.pastProjects'), href: withUiLang(PAST_PROJECTS_APP_URL, lang), variant: 'ghost' },
    ],
  }
}

export function buildHomeSections(t, lang = 'en') {
  return SECTION_LAYOUT.map((section) => ({
    id: section.id,
    alt: section.alt,
    linkHref: withUiLang(section.linkHref, lang),
    title: t(`home.sections.${section.key}.title`),
    description: t(`home.sections.${section.key}.description`),
    linkLabel: t(`home.sections.${section.key}.linkLabel`),
    cards: section.cards.map((card) => ({
      image: card.image,
      href: withUiLang(card.href, lang),
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

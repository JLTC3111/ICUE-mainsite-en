import { articleUrl, projectCardUrl } from '../lib/siteLinks'
import { OUR_WORK_APP_URL, ROUTE_PATHS } from '../lib/routes'

export const HERO = {
  bannerLabel: 'Latest News',
  bannerHref: 'https://icue.vn/newsroom/?from=en-news',
  title: 'iCUE Vietnam',
  subtitle:
    'Building impactful research, community initiatives, and real-world solutions that move society forward.',
  actions: [
    { label: 'Contact Us', href: ROUTE_PATHS.contact, variant: 'primary' },
    { label: 'Past Projects', href: ROUTE_PATHS.pastProjects, variant: 'ghost' },
  ],
}

export const HOME_SECTIONS = [
  {
    id: 'home-past-projects',
    title: 'Past Projects',
    description:
      'Highlights from cross-disciplinary collaborations and community-driven initiatives.',
    linkLabel: 'View all projects →',
    linkHref: ROUTE_PATHS.pastProjects,
    cards: [
      {
        image: '/public/pastProjects/pp_1.jpg',
        imageAlt: 'Project preview 1',
        href: projectCardUrl(1),
        title: 'Master Plan Adjustment for Lao Cai City',
        description:
          '28,162.64 ha master plan targeting 2045 with optimized land use and upgraded infrastructure.',
      },
      {
        image: '/public/pastProjects/pp_3.jpg',
        imageAlt: 'Project preview 2',
        href: projectCardUrl(3),
        title: 'Subdivision Planning Area 6B (Nguyen Ai Quoc Ward)',
        description:
          'Over 1,100 ha plan focused on integrated infrastructure and expanded green urban space.',
      },
      {
        image: '/public/pastProjects/pp_5.jpg',
        imageAlt: 'Project preview 3',
        href: projectCardUrl(5),
        title: 'General Planning for Dong Yen Urban Area, Bac Giang District',
        description:
          'Nearly 4,500 ha with a 2050 vision for a smart satellite city.',
      },
    ],
  },
  {
    id: 'home-our-work',
    alt: true,
    title: 'Our Work',
    description: 'Research, product development, and experiences built with purpose.',
    linkLabel: 'Explore our work →',
    linkHref: OUR_WORK_APP_URL,
    cards: [
      {
        image: '/public/work/ourWork_img1.jpg',
        imageAlt: 'Our work preview 1',
        href: OUR_WORK_APP_URL,
        title: 'Evaluation & Reports',
        description:
          'Design and evaluation of data networks for reliable digital infrastructure.',
      },
      {
        image: '/public/work/ourWork_img2.jpg',
        imageAlt: 'Our work preview 2',
        href: OUR_WORK_APP_URL,
        title: 'Quantity Surveying',
        description:
          'Specialized services supporting infrastructure projects from QS to BIM.',
      },
      {
        image: '/public/work/ourWork_img3.jpg',
        imageAlt: 'Our work preview 3',
        href: OUR_WORK_APP_URL,
        title: 'Infrastructure Gap Analysis',
        description:
          'Cost estimation, budget control, and standards-based structural assessment.',
      },
    ],
  },
  {
    id: 'home-news',
    title: 'Latest News',
    description: 'Announcements, events, and insights from iCUE Vietnam.',
    linkLabel: 'Read all news →',
    linkHref: 'https://icue.vn/newsroom/?from=en-news',
    cards: [
      {
        image: '/public/news/articles/Card_1.jpg',
        imageAlt: 'News preview 1',
        href: articleUrl(1),
        title: 'IKI-GIZ-ICUE Completion Ceremony',
        description:
          'Completion ceremony and handover of Au Co Park in Hoi An with provincial leaders in attendance.',
      },
      {
        image: '/public/news/articles/Card_2.jpg',
        imageAlt: 'News preview 2',
        href: articleUrl(2),
        title: '8th Asia Regional Conservation Forum Opens in Thailand',
        description:
          'RCF 2024 opened in Bangkok with nearly 600 conservation leaders across the region.',
      },
      {
        image: '/public/news/articles/Card_3.jpg',
        imageAlt: 'News preview 3',
        href: articleUrl(3),
        title: 'Aiding People & Areas Affected by Yagi Storm',
        description:
          'ICUE called on staff, partners, and benefactors to support communities affected by Typhoon Yagi.',
      },
    ],
  },
  {
    id: 'home-recruitment',
    alt: true,
    title: 'Recruitment',
    description: 'Join a mission-driven team focused on innovation and social impact.',
    linkLabel: 'See open roles →',
    linkHref: ROUTE_PATHS.recruitment,
    cards: [
      {
        image: '/public/recruitment/office.jpg',
        imageAlt: 'Recruitment preview 1',
        href: ROUTE_PATHS.recruitment,
        title: 'Collaborative Culture',
        description: 'Work alongside researchers, designers, and community builders.',
        imageOnly: true,
      },
      {
        image: '/public/recruitment/event.jpg',
        imageAlt: 'Recruitment preview 2',
        href: ROUTE_PATHS.recruitment,
        title: 'Learning & Growth',
        description: 'Continuous learning through workshops and mentorship.',
        imageOnly: true,
      },
      {
        image: '/public/recruitment/survey.jpg',
        imageAlt: 'Recruitment preview 3',
        href: ROUTE_PATHS.recruitment,
        title: 'Make an Impact',
        description: 'Contribute to programs that create real change.',
        imageOnly: true,
      },
    ],
  },
]

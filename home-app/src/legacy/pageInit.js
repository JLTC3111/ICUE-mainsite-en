let pastProjectsSliderApi = null
let pastProjectsSliderPromise = null
let newsArchiveSliderApi = null
let newsArchiveSliderPromise = null

function getPastProjectsSlider() {
  if (!pastProjectsSliderPromise) {
    pastProjectsSliderPromise = import('./pastProjectsSlider').then((api) => {
      pastProjectsSliderApi = api
      return api
    })
  }
  return pastProjectsSliderPromise
}

let pastProjectsAosApi = null
let pastProjectsAosPromise = null

function getPastProjectsAos() {
  if (!pastProjectsAosPromise) {
    pastProjectsAosPromise = import('./pastProjectsAos').then((api) => {
      pastProjectsAosApi = api
      return api
    })
  }
  return pastProjectsAosPromise
}

function getNewsArchiveSlider() {
  if (!newsArchiveSliderPromise) {
    newsArchiveSliderPromise = import('./newsArchiveSlider').then((api) => {
      newsArchiveSliderApi = api
      return api
    })
  }
  return newsArchiveSliderPromise
}

export function preloadLegacyPage(pageName) {
  if (pageName === 'newsArchive') return getNewsArchiveSlider()
  if (pageName === 'pastProjects') {
    return Promise.all([getPastProjectsSlider(), getPastProjectsAos()])
  }
  if (pageName === 'notableAwards') return import('./awardsPage')
  return Promise.resolve()
}

const PAGE_INIT = {
  pastProjects: async () => {
    // Skip the sluggish custom touch slider in legacy/script.js —
    // Swiper is initialized from LegacyHtmlPage after HTML is painted.
    const slider = await getPastProjectsSlider()
    await slider.initPastProjectsSlider()
    const aos = await getPastProjectsAos()
    aos.initPastProjectsAos()
  },
  newsArchive: async () => {
    // Skip legacy/script.js logo + mobile card sliders — use Swiper modules.
    const api = await getNewsArchiveSlider()
    await api.initNewsArchiveSlider()
  },
  notableAwards: async () => {
    const awards = await import('./awardsPage')
    awards.initAwardsPage()
  },
}

const PAGE_CLEANUP = {
  notableAwards: () => {
    void import('./awardsPage').then((awards) => awards.destroyAwardsPage())
  },
  pastProjects: () => {
    pastProjectsAosApi?.destroyPastProjectsAos?.()
    if (!pastProjectsAosApi) {
      void getPastProjectsAos().then((api) => api.destroyPastProjectsAos())
    }
    // Prefer sync destroy if module already loaded; otherwise load then destroy
    // so a mid-flight dynamic import cannot leave a dangling Swiper.
    if (pastProjectsSliderApi) {
      pastProjectsSliderApi.destroyPastProjectsSlider()
      return
    }
    void getPastProjectsSlider().then((api) => api.destroyPastProjectsSlider())
  },
  newsArchive: () => {
    if (newsArchiveSliderApi) {
      newsArchiveSliderApi.destroyNewsArchiveSlider()
      return
    }
    void getNewsArchiveSlider().then((api) => api.destroyNewsArchiveSlider())
  },
}

export async function initLegacyPage(pageName) {
  window.currentPage = pageName
  window.__mainSiteNav?.setPage?.(pageName)
  const init = PAGE_INIT[pageName]
  if (init) await init()
}

export function cleanupLegacyPage(pageName) {
  PAGE_CLEANUP[pageName]?.()
}

let runtimePromise = null
let pastProjectsSliderApi = null
let pastProjectsSliderPromise = null
let newsArchiveSliderApi = null
let newsArchiveSliderPromise = null
let gsapRuntimePromise = null

const LEGACY_RUNTIME_PAGES = new Set([
  'aboutUs',
])

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
  if (pageName === 'recruitment') return import('./jobBoard')
  if (pageName === 'FAQs') return import('./faqPage')
  if (pageName === 'notableAwards') return import('./awardsPage')
  return Promise.resolve()
}

function loadGsapRuntime() {
  if (window.gsap) return Promise.resolve(window.gsap)
  if (!gsapRuntimePromise) {
    gsapRuntimePromise = Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([gsapModule, scrollTriggerModule]) => {
      const gsap = gsapModule.default
      gsap.registerPlugin(scrollTriggerModule.ScrollTrigger)
      window.gsap = gsap
      return gsap
    })
  }
  return gsapRuntimePromise
}

async function loadLegacyRuntime() {
  if (window.__icueLegacyRuntimeLoaded) {
    return
  }

  await loadGsapRuntime()

  if (!runtimePromise) {
    window.__ICUE_SKIP_HASH_ROUTER__ = true
    runtimePromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = '/legacy/script.js'
      script.async = true
      script.onload = () => {
        window.__icueLegacyRuntimeLoaded = true
        resolve()
      }
      script.onerror = () => reject(new Error('Failed to load legacy page runtime'))
      document.head.appendChild(script)
    })
  }

  await runtimePromise
}

const PAGE_INIT = {
  aboutUs: async () => {
    window.initHomeTextSlider?.()
    window.AboutUsBackgroundVideoManager?.bindToggleUI?.()
    window.AboutUsBackgroundVideoManager?.init?.()
  },
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
  recruitment: async () => {
    const jobs = await import('./jobBoard')
    jobs.initJobBoard()
  },
  FAQs: async () => {
    const faq = await import('./faqPage')
    faq.initFaqPage()
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
  recruitment: () => {
    void import('./jobBoard').then((jobs) => jobs.destroyJobBoard())
  },
  FAQs: () => {
    void import('./faqPage').then((faq) => faq.destroyFaqPage())
  },
  aboutUs: () => {
    window.AboutUsBackgroundVideoManager?.destroy?.()
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
  // Static/legal pages and the migrated sliders do not need the 305 KB legacy
  // runtime or its global timers. Load it only for pages with legacy-only init code.
  if (LEGACY_RUNTIME_PAGES.has(pageName)) {
    await loadLegacyRuntime()
  }
  window.currentPage = pageName
  window.__mainSiteNav?.setPage?.(pageName)
  const init = PAGE_INIT[pageName]
  if (init) await init()
}

export function cleanupLegacyPage(pageName) {
  PAGE_CLEANUP[pageName]?.()
}

import Swiper from 'swiper'
import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-coverflow'
import './newsArchiveSlider.css'

const STORAGE_KEY = 'newsSliderIndex'
const MOBILE_QUERY = '(max-width: 1024px)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const logoState = {
  swiper: null,
  observer: null,
  motionQuery: null,
  onMotionChange: null,
  onVisibilityChange: null,
  inView: false,
  generation: 0,
}

const cardsState = {
  swiper: null,
  swiperEl: null,
  wrapEl: null,
  infoEl: null,
  cardMeta: null,
  grid: null,
  cards: [],
  mode: null,
  mq: null,
  onMqChange: null,
  onKeydown: null,
  generation: 0,
}

function findLogoEl() {
  return (
    document.querySelector('.legacy-page #newsLogoSwiper') ||
    document.getElementById('newsLogoSwiper')
  )
}

function findGrid() {
  return (
    document.querySelector('.legacy-page main.grid') ||
    document.querySelector('main.grid')
  )
}

function readInitialIndex(cardCount) {
  const raw = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)
  if (Number.isNaN(raw)) return 0
  return Math.max(0, Math.min(cardCount - 1, raw))
}

function hydrateResponsiveImage(image, priority = 'auto') {
  if (!image) return

  const picture = image.closest('picture')
  picture?.querySelectorAll('source[data-srcset]').forEach((source) => {
    source.srcset = source.dataset.srcset
    if (source.dataset.sizes) source.sizes = source.dataset.sizes
    delete source.dataset.srcset
    delete source.dataset.sizes
  })

  if (image.dataset.srcset) {
    image.srcset = image.dataset.srcset
    delete image.dataset.srcset
  }
  if (image.dataset.sizes) {
    image.sizes = image.dataset.sizes
    delete image.dataset.sizes
  }
  if (image.dataset.src) {
    image.src = image.dataset.src
    delete image.dataset.src
  }

  image.loading = priority === 'high' ? 'eager' : 'lazy'
  image.fetchPriority = priority
}

function hydrateCardWindow(index) {
  const count = cardsState.cards.length
  if (!count) return

  const normalized = ((index % count) + count) % count
  const nearby = [normalized, (normalized + 1) % count, (normalized - 1 + count) % count]
  nearby.forEach((cardIndex, position) => {
    const image = cardsState.cards[cardIndex]?.querySelector('[data-news-card-image]')
    hydrateResponsiveImage(image, position === 0 ? 'high' : 'low')
  })
}

function cardTitleText(card) {
  const h3 = card.querySelector('.card-info h3')
  if (!h3) return ''
  const clone = h3.cloneNode(true)
  clone.querySelectorAll('svg').forEach((el) => el.remove())
  return clone.textContent.trim()
}

function readLabel() {
  return cardsState.grid?.dataset?.readLabel || 'Read article →'
}

function buildCardMeta(cards) {
  return cards.map((card) => {
    const dateEl = card.querySelector('.card-info .date')
    const locationEl = card.querySelector('.card-info .location')
    const parts = [dateEl?.textContent?.trim(), locationEl?.textContent?.trim()].filter(Boolean)
    return {
      title: cardTitleText(card),
      meta: parts.join('  ·  '),
      href: card.href || '#',
    }
  })
}

function buildRankBadge(index) {
  const rank = document.createElement('span')
  rank.className = 'news-coverflow-rank'
  rank.textContent = String(index + 1)
  rank.setAttribute('aria-hidden', 'true')
  return rank
}

function updateCoverflowInfo(swiper) {
  if (!cardsState.infoEl || !cardsState.cardMeta?.length) return

  const index = typeof swiper.realIndex === 'number' ? swiper.realIndex : swiper.activeIndex
  const meta = cardsState.cardMeta[index]
  if (!meta) return

  const infoTitle = cardsState.infoEl.querySelector('.news-coverflow-info__title')
  const infoMeta = cardsState.infoEl.querySelector('.news-coverflow-info__meta')
  const infoBtn = cardsState.infoEl.querySelector('.news-coverflow-info__btn')

  if (infoTitle) infoTitle.textContent = meta.title
  if (infoMeta) infoMeta.textContent = meta.meta
  if (infoBtn) {
    infoBtn.href = meta.href
    infoBtn.textContent = readLabel()
  }
}

function refreshCoverflowLoop(swiper) {
  if (!swiper?.params?.loop) return
  swiper.loopFix()
  swiper.updateSlidesClasses()
  swiper.updateProgress()
  swiper.update()
}

function finalizeCoverflowInit(swiper, initialIndex, useLoop) {
  if (useLoop && initialIndex > 0) {
    swiper.slideToLoop(initialIndex, 0, false)
  }
  refreshCoverflowLoop(swiper)
  updateCoverflowInfo(swiper)
  requestAnimationFrame(() => {
    refreshCoverflowLoop(swiper)
  })
}

function isEditableTarget(target) {
  if (!target || !(target instanceof Element)) return false
  return Boolean(target.closest('input, textarea, select, option, [contenteditable="true"]'))
}

function handleCoverflowKeydown(event) {
  if (cardsState.mode !== 'desktop' || !cardsState.swiper || cardsState.swiper.destroyed) return
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return
  if (isEditableTarget(event.target)) return

  const wrap = cardsState.wrapEl
  if (!wrap) return

  const rect = wrap.getBoundingClientRect()
  const inView = rect.top < window.innerHeight && rect.bottom > 0
  if (!inView) return

  const swiper = cardsState.swiper
  const slideCount = cardsState.cards.length

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    swiper.slidePrev()
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    swiper.slideNext()
  } else if (event.key === 'Home' && slideCount > 0) {
    event.preventDefault()
    swiper.slideToLoop(0)
  } else if (event.key === 'End' && slideCount > 0) {
    event.preventDefault()
    swiper.slideToLoop(slideCount - 1)
  }
}

function attachCoverflowKeyboard() {
  if (cardsState.onKeydown) return
  cardsState.onKeydown = handleCoverflowKeydown
  document.addEventListener('keydown', cardsState.onKeydown)
}

function detachCoverflowKeyboard() {
  if (!cardsState.onKeydown) return
  document.removeEventListener('keydown', cardsState.onKeydown)
  cardsState.onKeydown = null
}

function syncLogoAutoplay() {
  const swiper = logoState.swiper
  if (!swiper || swiper.destroyed) return

  const shouldRun = logoState.inView
    && !logoState.motionQuery?.matches
    && document.visibilityState !== 'hidden'

  if (shouldRun && !swiper.autoplay.running) swiper.autoplay.start()
  if (!shouldRun && swiper.autoplay.running) swiper.autoplay.stop()
}

function teardownLogoAutoplayLifecycle() {
  logoState.observer?.disconnect()
  logoState.observer = null
  if (logoState.motionQuery && logoState.onMotionChange) {
    logoState.motionQuery.removeEventListener('change', logoState.onMotionChange)
  }
  if (logoState.onVisibilityChange) {
    document.removeEventListener('visibilitychange', logoState.onVisibilityChange)
  }
  logoState.motionQuery = null
  logoState.onMotionChange = null
  logoState.onVisibilityChange = null
  logoState.inView = false
}

function setupLogoAutoplayLifecycle(el) {
  teardownLogoAutoplayLifecycle()
  logoState.motionQuery = window.matchMedia(REDUCED_MOTION_QUERY)
  logoState.onMotionChange = syncLogoAutoplay
  logoState.onVisibilityChange = syncLogoAutoplay
  logoState.motionQuery.addEventListener('change', logoState.onMotionChange)
  document.addEventListener('visibilitychange', logoState.onVisibilityChange)

  if (typeof IntersectionObserver !== 'function') {
    logoState.inView = true
  } else {
    logoState.observer = new IntersectionObserver((entries) => {
      logoState.inView = entries.some((entry) => entry.isIntersecting)
      syncLogoAutoplay()
    }, { threshold: 0.05 })
    logoState.observer.observe(el)
  }

  syncLogoAutoplay()
}

function initLogoSwiper(generation) {
  const el = findLogoEl()
  if (!el || generation !== logoState.generation) return
  const wrap = el.closest('.news-logo-swiper-wrap')
  wrap?.setAttribute('data-news-logo-state', 'pending')

  teardownLogoAutoplayLifecycle()
  if (logoState.swiper) {
    logoState.swiper.destroy(true, true)
    logoState.swiper = null
  }

  logoState.swiper = new Swiper(el, {
    modules: [Autoplay, Pagination],
    slidesPerView: 'auto',
    spaceBetween: 28,
    speed: 600,
    loop: true,
    autoHeight: true,
    grabCursor: true,
    watchOverflow: true,
    autoplay: {
      delay: 2200,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    pagination: {
      el: el.querySelector('.swiper-pagination'),
      clickable: true,
    },
    breakpoints: {
      0: { spaceBetween: 16 },
      551: { spaceBetween: 22 },
      1025: { spaceBetween: 36 },
    },
    on: {
      init(swiper) {
        requestAnimationFrame(() => {
          if (generation !== logoState.generation || swiper.destroyed) return
          swiper.update()
          requestAnimationFrame(() => {
            if (generation === logoState.generation && !swiper.destroyed) {
              wrap?.setAttribute('data-news-logo-state', 'ready')
            }
          })
        })
      },
    },
  })
  setupLogoAutoplayLifecycle(el)
}

function enableMobileCardsSwiper() {
  if (cardsState.mode === 'mobile') return
  if (cardsState.mode === 'desktop') disableDesktopCoverflow()
  if (cardsState.swiper || !cardsState.grid || !cardsState.cards.length) return

  const swiperEl = document.createElement('div')
  swiperEl.className = 'swiper news-cards-swiper'

  const wrapper = document.createElement('div')
  wrapper.className = 'swiper-wrapper'

  cardsState.cards.forEach((card) => {
    const slide = document.createElement('div')
    slide.className = 'swiper-slide'
    slide.appendChild(card)
    wrapper.appendChild(slide)
  })

  const pagination = document.createElement('div')
  pagination.className = 'swiper-pagination'

  swiperEl.appendChild(wrapper)
  swiperEl.appendChild(pagination)

  cardsState.grid.replaceChildren(swiperEl)
  cardsState.grid.classList.add('news-cards-swiper-active')
  cardsState.swiperEl = swiperEl

  const initialIndex = readInitialIndex(cardsState.cards.length)
  hydrateCardWindow(initialIndex)
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches

  cardsState.swiper = new Swiper(swiperEl, {
    modules: [Pagination],
    slidesPerView: 1,
    spaceBetween: 20,
    speed: reducedMotion ? 0 : 280,
    resistanceRatio: 0.55,
    threshold: 8,
    grabCursor: true,
    watchOverflow: true,
    initialSlide: initialIndex,
    pagination: {
      el: pagination,
      clickable: true,
    },
    on: {
      slideChange(swiper) {
        localStorage.setItem(STORAGE_KEY, String(swiper.activeIndex))
        hydrateCardWindow(swiper.activeIndex)
      },
    },
  })

  cardsState.mode = 'mobile'
}

function disableMobileCardsSwiper() {
  if (cardsState.mode !== 'mobile') return

  if (cardsState.swiper) {
    cardsState.swiper.destroy(true, true)
    cardsState.swiper = null
  }

  if (cardsState.grid && cardsState.cards.length) {
    cardsState.grid.classList.remove('news-cards-swiper-active')
    cardsState.grid.replaceChildren(...cardsState.cards)
  }

  cardsState.swiperEl = null
  cardsState.mode = null
}

function enableDesktopCoverflow() {
  if (cardsState.mode === 'desktop') return
  if (cardsState.mode === 'mobile') disableMobileCardsSwiper()
  if (cardsState.swiper || !cardsState.grid || !cardsState.cards.length) return

  const wrap = document.createElement('div')
  wrap.className = 'news-coverflow-wrap'

  const swiperEl = document.createElement('div')
  swiperEl.className = 'swiper news-coverflow-swiper'

  const wrapper = document.createElement('div')
  wrapper.className = 'swiper-wrapper'

  cardsState.cards.forEach((card, index) => {
    const slide = document.createElement('div')
    slide.className = 'swiper-slide'
    card.appendChild(buildRankBadge(index))
    slide.appendChild(card)
    wrapper.appendChild(slide)
  })

  const pagination = document.createElement('div')
  pagination.className = 'swiper-pagination'

  swiperEl.appendChild(wrapper)
  swiperEl.appendChild(pagination)

  const info = document.createElement('div')
  info.className = 'news-coverflow-info'
  info.setAttribute('aria-live', 'polite')
  info.innerHTML = `
    <div class="news-coverflow-info__text">
      <h2 class="news-coverflow-info__title"></h2>
      <p class="news-coverflow-info__meta"></p>
    </div>
    <a class="news-coverflow-info__btn" href="#"></a>
  `

  wrap.appendChild(swiperEl)
  wrap.appendChild(info)

  wrap.setAttribute('role', 'region')
  wrap.setAttribute('aria-roledescription', 'carousel')
  wrap.setAttribute('aria-label', 'News articles')
  wrap.setAttribute('tabindex', '0')
  swiperEl.setAttribute('aria-live', 'polite')

  cardsState.grid.replaceChildren(wrap)
  cardsState.grid.classList.add('news-coverflow-active')
  cardsState.wrapEl = wrap
  cardsState.swiperEl = swiperEl
  cardsState.infoEl = info
  cardsState.cardMeta = buildCardMeta(cardsState.cards)

  const slideCount = cardsState.cards.length
  const initialIndex = readInitialIndex(slideCount)
  const useLoop = slideCount > 2
  const loopBuffer = useLoop ? Math.min(4, Math.max(2, slideCount - 2)) : 0
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches
  hydrateCardWindow(initialIndex)

  cardsState.swiper = new Swiper(swiperEl, {
    modules: [EffectCoverflow, Pagination],
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    speed: reducedMotion ? 0 : 320,
    resistanceRatio: 0.72,
    threshold: 6,
    longSwipesMs: 260,
    loop: useLoop,
    loopAdditionalSlides: loopBuffer,
    loopAddBlankSlides: true,
    watchSlidesProgress: !reducedMotion,
    initialSlide: useLoop ? 0 : initialIndex,
    coverflowEffect: {
      rotate: 42,
      stretch: -22,
      depth: 170,
      modifier: 1.08,
      slideShadows: false,
    },
    pagination: {
      el: pagination,
      clickable: true,
    },
    on: {
      init(swiper) {
        finalizeCoverflowInit(swiper, initialIndex, useLoop)
      },
      slideChange(swiper) {
        const index = typeof swiper.realIndex === 'number' ? swiper.realIndex : swiper.activeIndex
        localStorage.setItem(STORAGE_KEY, String(index))
        hydrateCardWindow(index)
      },
      slideChangeTransitionEnd(swiper) {
        updateCoverflowInfo(swiper)
        const index = typeof swiper.realIndex === 'number' ? swiper.realIndex : swiper.activeIndex
        const last = cardsState.cards.length - 1
        if (index === 0 || index === last) {
          refreshCoverflowLoop(swiper)
        }
      },
    },
  })

  attachCoverflowKeyboard()
  cardsState.mode = 'desktop'
}

function disableDesktopCoverflow() {
  if (cardsState.mode !== 'desktop') return

  detachCoverflowKeyboard()

  if (cardsState.swiper) {
    cardsState.swiper.destroy(true, true)
    cardsState.swiper = null
  }

  if (cardsState.grid && cardsState.cards.length) {
    cardsState.cards.forEach((card) => {
      card.querySelectorAll('.news-coverflow-rank').forEach((rank) => rank.remove())
    })
    cardsState.grid.classList.remove('news-coverflow-active')
    cardsState.grid.replaceChildren(...cardsState.cards)
  }

  cardsState.wrapEl = null
  cardsState.swiperEl = null
  cardsState.infoEl = null
  cardsState.cardMeta = null
  cardsState.mode = null
}

function syncCardsMode() {
  if (!cardsState.mq) return
  if (cardsState.mq.matches) enableMobileCardsSwiper()
  else enableDesktopCoverflow()
}

/**
 * Logo strip + article cards (mobile swiper / desktop coverflow) for legacy news.
 */
export async function initNewsArchiveSlider() {
  destroyNewsArchiveSlider()
  const logoGen = ++logoState.generation
  const cardsGen = ++cardsState.generation

  initLogoSwiper(logoGen)
  if (logoGen !== logoState.generation) return

  const grid = findGrid()
  if (!grid || cardsGen !== cardsState.generation) return

  const cards = Array.from(grid.querySelectorAll('a.card.image-card'))
  if (!cards.length) return

  cardsState.grid = grid
  cardsState.cards = cards
  cardsState.mq = window.matchMedia(MOBILE_QUERY)
  cardsState.onMqChange = () => {
    if (cardsGen === cardsState.generation) syncCardsMode()
  }

  if (cardsGen !== cardsState.generation) return

  syncCardsMode()
  cardsState.mq.addEventListener('change', cardsState.onMqChange)
}

export function destroyNewsArchiveSlider() {
  logoState.generation += 1
  cardsState.generation += 1

  teardownLogoAutoplayLifecycle()
  if (logoState.swiper) {
    logoState.swiper.destroy(true, true)
    logoState.swiper = null
  }

  if (cardsState.mq && cardsState.onMqChange) {
    cardsState.mq.removeEventListener('change', cardsState.onMqChange)
  }

  disableMobileCardsSwiper()
  disableDesktopCoverflow()

  cardsState.grid = null
  cardsState.cards = []
  cardsState.mq = null
  cardsState.onMqChange = null
}

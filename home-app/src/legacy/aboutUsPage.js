const SLIDE_INTERVAL = 25_000
const STORAGE_KEY = 'aboutUs_bg_video_enabled'

const MESSAGES = [
  '10+ years of urban excellence. Dedicated Professionals who are passionate about <strong class="highlight-text-phrase"> urban planning </strong>, construction, and <strong class="highlight-text-phrase"> climate change. </strong>',
  'Built on Unity, <strong class="highlight-text-phrase"> Driven by Values! </strong> We believe in <strong class="highlight-text-phrase"> giving back </strong>, and constantly striving for self-improvement. These <strong class="highlight-text-phrase"> core values </strong> shape our approach & inspire our partnerships with local professionals, government agencies.',
  'Smart Cities, Smarter Solutions. We use technology and <strong class="highlight-text-phrase"> data-driven insights </strong> to improve <strong class="highlight-text-phrase"> efficiency </strong>, connectivity, and future-ready cities.',
  'Led <strong class="highlight-text-phrase"> Đà Nẵng citywide </strong> planning initiative for both tier 1 and tier 2 cities — a transformational project that reflects our commitment to <strong class="highlight-text-phrase"> big-picture </strong> strategy and real results.',
  'Shaping cities, <strong class="highlight-text-phrase"> improving lives. </strong> Every solution we deliver is rooted in a mission: to create a better urban future that is inclusive, <strong class="highlight-text-phrase"> sustainable </strong> and <strong class="highlight-text-phrase"> people-centered. </strong>',
  '💥 Create beautiful <strong class="highlight-text-phrase"> experiences </strong> that last forever.',
]

const BALLOON_COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeead', '#d4a5a5', '#9b5de5']

let sliderController = null
let slideIntervalId = null
let slideResumeId = null
let balloonController = null
const activeBalloons = new Set()

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function clearSliderTimers() {
  if (slideIntervalId) window.clearInterval(slideIntervalId)
  if (slideResumeId) window.clearTimeout(slideResumeId)
  slideIntervalId = null
  slideResumeId = null
}

function initTextSlider() {
  sliderController?.abort()
  clearSliderTimers()

  const slider = document.getElementById('homeTextSlider')
  const text = document.querySelector('#homeSliderText .highlight-text')
  const dots = [...document.querySelectorAll('#sliderDots .dot')]
  if (!slider || !text || !dots.length) return

  sliderController = new AbortController()
  const { signal } = sliderController
  let index = 0
  let manuallyPaused = false

  const render = (nextIndex) => {
    index = (nextIndex + MESSAGES.length) % MESSAGES.length
    text.innerHTML = MESSAGES[index]
    text.getAnimations?.().forEach((animation) => animation.cancel())
    if (!prefersReducedMotion()) {
      text.animate(
        [
          { opacity: 0, transform: 'translateY(10px) scale(.97)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' },
        ],
        { duration: 280, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' },
      )
    }

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index)
      dot.style.animation = 'none'
      if (dotIndex === index && !prefersReducedMotion()) {
        void dot.offsetWidth
        dot.style.animation = `slide-progress ${SLIDE_INTERVAL / 1000}s linear forwards`
      }
    })
  }

  const startInterval = () => {
    if (slideIntervalId) window.clearInterval(slideIntervalId)
    if (!manuallyPaused && !document.hidden) {
      slideIntervalId = window.setInterval(() => render(index + 1), SLIDE_INTERVAL)
    }
  }

  const navigate = (direction) => {
    render(index + direction)
    startInterval()
  }

  dots.forEach((dot, dotIndex) => {
    dot.setAttribute('role', 'button')
    dot.setAttribute('tabindex', '0')
    dot.setAttribute('aria-label', `Show About message ${dotIndex + 1}`)
    const select = () => {
      manuallyPaused = true
      render(dotIndex)
      clearSliderTimers()
      slideResumeId = window.setTimeout(() => {
        manuallyPaused = false
        startInterval()
      }, SLIDE_INTERVAL)
    }
    dot.addEventListener('click', select, { signal })
    dot.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        select()
      }
    }, { signal })
  })

  slider.addEventListener('click', (event) => {
    if (event.target.closest('.dot')) return
    const rect = slider.getBoundingClientRect()
    navigate(event.clientX - rect.left < rect.width / 2 ? -1 : 1)
  }, { signal })
  slider.addEventListener('mouseenter', () => {
    if (slideIntervalId) window.clearInterval(slideIntervalId)
    slideIntervalId = null
  }, { signal })
  slider.addEventListener('mouseleave', startInterval, { signal })
  document.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
    if (event.key === 'ArrowLeft') navigate(-1)
    if (event.key === 'ArrowRight') navigate(1)
  }, { signal })
  document.addEventListener('visibilitychange', startInterval, { signal })

  text.setAttribute('aria-live', 'polite')
  render(0)
  startInterval()
}

function destroyTextSlider() {
  sliderController?.abort()
  sliderController = null
  clearSliderTimers()
  document.querySelector('#homeSliderText .highlight-text')?.getAnimations?.()
    .forEach((animation) => animation.cancel())
}

function createBalloons() {
  for (let index = 0; index < 15; index += 1) {
    const balloon = document.createElement('div')
    balloon.className = 'balloon'
    balloon.style.backgroundColor = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)]
    balloon.style.left = `${Math.random() * 80 + 10}%`
    balloon.style.animationDelay = `${index * 0.2}s`
    activeBalloons.add(balloon)
    document.body.appendChild(balloon)
    balloon.addEventListener('animationend', () => {
      activeBalloons.delete(balloon)
      balloon.remove()
    }, { once: true })
  }
}

function initBalloonButton() {
  balloonController?.abort()
  balloonController = new AbortController()
  document.getElementById('balloonButton')?.addEventListener('click', createBalloons, {
    signal: balloonController.signal,
  })
}

function destroyBalloonButton() {
  balloonController?.abort()
  balloonController = null
  activeBalloons.forEach((balloon) => balloon.remove())
  activeBalloons.clear()
}

function readEnabled() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored == null || ['1', 'true', 'on'].includes(stored)
  } catch {
    return true
  }
}

let videoEnabled = typeof window === 'undefined' ? true : readEnabled()
let videoController = null
let videoObserver = null
let videoInViewport = true

function getVideo() {
  return document.querySelector('#content .about-container video.video-bg')
}

function canPlayVideo() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  const constrainedNetwork = connection
    && (connection.saveData || /(slow-2g|2g|3g)/i.test(connection.effectiveType || ''))
  return !prefersReducedMotion() && !constrainedNetwork
}

function shouldPlayVideo() {
  return videoEnabled && canPlayVideo() && videoInViewport && !document.hidden
}

function sourceFor(video) {
  const mobile = window.matchMedia('(max-width: 767px)').matches
  const sources = [...(video?.querySelectorAll('source') || [])]
  const desktopSource = sources.find((source) => source.hasAttribute('media'))?.getAttribute('src')
  const mobileSource = sources.find((source) => !source.hasAttribute('media'))?.getAttribute('src')
  return mobile
    ? (mobileSource || desktopSource || '/public/bgVideos/bg9-mobile.mp4')
    : (desktopSource || mobileSource || '/public/bgVideos/bg9.mp4')
}

function updateRootState() {
  // Must be the literal string "off" — backgroundSampling.js and
  // useAdaptiveIconColor.js both compare the value, and toggleAttribute()
  // sets "" instead, which silently defeats the video-off check and leaves
  // the music icon sampling a video that is not playing.
  if (!videoEnabled || !canPlayVideo()) {
    document.documentElement.setAttribute('data-aboutus-bg-video', 'off')
  } else {
    document.documentElement.removeAttribute('data-aboutus-bg-video')
  }
}

function syncToggleUI() {
  const canPlay = canPlayVideo()
  for (const id of ['aboutUsVideoToggleDesktop', 'aboutUsVideoToggleMobile']) {
    const toggle = document.getElementById(id)
    if (!toggle) continue
    toggle.checked = videoEnabled
    toggle.disabled = !canPlay
  }
  updateRootState()
}

async function syncVideoPlayback({ reloadSource = false } = {}) {
  const video = getVideo()
  if (!video) return

  updateRootState()
  if (!shouldPlayVideo()) {
    video.pause()
    video.style.display = (!videoEnabled || !canPlayVideo()) ? 'none' : ''
    return
  }

  video.style.display = ''
  video.muted = true
  video.playsInline = true
  video.preload = 'auto'
  const source = sourceFor(video)
  if (reloadSource || video.dataset.activeSrc !== source) {
    video.src = source
    video.dataset.activeSrc = source
    video.load()
  }
  await video.play().catch(() => {})
}

function setVideoEnabled(enabled) {
  videoEnabled = Boolean(enabled)
  try {
    localStorage.setItem(STORAGE_KEY, videoEnabled ? '1' : '0')
  } catch {
    // Storage may be unavailable in private browsing.
  }
  syncToggleUI()
  void syncVideoPlayback()
  window.dispatchEvent(new CustomEvent('icue:aboutUsVideoEnabled', {
    detail: { enabled: videoEnabled },
  }))
}

function initBackgroundVideo() {
  destroyBackgroundVideo()
  videoController = new AbortController()
  const { signal } = videoController

  document.addEventListener('change', (event) => {
    const target = event.target
    if (!(target instanceof HTMLInputElement)) return
    if (!['aboutUsVideoToggleDesktop', 'aboutUsVideoToggleMobile'].includes(target.id)) return
    if (!target.disabled) setVideoEnabled(target.checked)
  }, { capture: true, signal })

  const viewport = window.matchMedia('(max-width: 767px)')
  const onViewportChange = () => void syncVideoPlayback({ reloadSource: true })
  viewport.addEventListener?.('change', onViewportChange, { signal })
  if (!viewport.addEventListener) {
    viewport.addListener(onViewportChange)
    signal.addEventListener('abort', () => viewport.removeListener(onViewportChange), { once: true })
  }

  document.addEventListener('visibilitychange', () => void syncVideoPlayback(), { signal })
  const video = getVideo()
  const container = video?.closest('.about-container')
  if (container && typeof IntersectionObserver === 'function') {
    videoObserver = new IntersectionObserver((entries) => {
      videoInViewport = Boolean(entries[0]?.isIntersecting)
      void syncVideoPlayback()
    }, { rootMargin: '100px 0px', threshold: 0.01 })
    videoObserver.observe(container)
  }

  syncToggleUI()
  void syncVideoPlayback({ reloadSource: true })
}

function destroyBackgroundVideo() {
  videoController?.abort()
  videoController = null
  videoObserver?.disconnect()
  videoObserver = null
  videoInViewport = true
  const video = getVideo()
  if (video) {
    video.pause()
    video.removeAttribute('src')
    delete video.dataset.activeSrc
    video.preload = 'none'
    try { video.load() } catch { /* Browser may reject load during teardown. */ }
  }
  document.documentElement.removeAttribute('data-aboutus-bg-video')
}

export const AboutUsBackgroundVideoManager = {
  init: initBackgroundVideo,
  destroy: destroyBackgroundVideo,
  bindToggleUI: syncToggleUI,
  setEnabled: setVideoEnabled,
  isEnabled: () => videoEnabled,
  canToggleVideos: canPlayVideo,
}

export function initAboutUsPage() {
  initTextSlider()
  initBalloonButton()
  initBackgroundVideo()
}

export function destroyAboutUsPage() {
  destroyTextSlider()
  destroyBalloonButton()
  destroyBackgroundVideo()
}

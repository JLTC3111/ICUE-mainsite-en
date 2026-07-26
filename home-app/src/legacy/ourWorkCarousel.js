let cleanup = null

export function initOurWorkCarousel() {
  destroyOurWorkCarousel()

  const nextButton = document.getElementById('work-next')
  const prevButton = document.getElementById('work-prev')
  const carousel = document.querySelector('.work-carousel')
  const slider = carousel?.querySelector('.work-list')
  const thumbnails = carousel?.querySelector('.work-thumbnail')
  const timeBar = carousel?.querySelector('.work-time')

  if (!nextButton || !prevButton || !carousel || !slider || !thumbnails || !timeBar) {
    return
  }

  let autoAdvanceTimeout = null
  let animationTimeout = null
  const timeRunning = 7000
  const timeAutoNext = 8000

  const resetAutoAdvance = () => {
    window.clearTimeout(autoAdvanceTimeout)
    autoAdvanceTimeout = window.setTimeout(() => nextButton.click(), timeAutoNext)
  }

  const finishAnimationLater = (className) => {
    window.clearTimeout(animationTimeout)
    carousel.classList.add(className)
    animationTimeout = window.setTimeout(() => {
      carousel.classList.remove('work-next', 'work-prev', 'work-jump')
    }, timeRunning)
  }

  const showSlide = (direction) => {
    const items = slider.querySelectorAll('.work-item')
    const thumbs = thumbnails.querySelectorAll('.work-item')
    if (!items.length || !thumbs.length) return

    if (direction === 'work-next') {
      slider.appendChild(items[0])
      thumbnails.appendChild(thumbs[0])
    } else {
      slider.prepend(items[items.length - 1])
      thumbnails.prepend(thumbs[thumbs.length - 1])
    }
    finishAnimationLater(direction)
    resetAutoAdvance()
  }

  const goToSlide = (targetIndex) => {
    const currentSlide = slider.querySelector('.work-item')
    const totalItems = slider.querySelectorAll('.work-item').length
    const currentIndex = Number.parseInt(currentSlide?.dataset.index ?? '', 10)
    if (!Number.isInteger(currentIndex) || targetIndex === currentIndex || !totalItems) return

    let steps = targetIndex - currentIndex
    if (steps < 0) steps += totalItems
    for (let index = 0; index < steps; index += 1) {
      slider.appendChild(slider.firstElementChild)
      thumbnails.appendChild(thumbnails.firstElementChild)
    }
    finishAnimationLater('work-jump')
    resetAutoAdvance()
  }

  const thumbHandlers = [...thumbnails.querySelectorAll('.work-item')].map((thumb) => {
    const handler = () => goToSlide(Number.parseInt(thumb.dataset.index ?? '', 10))
    thumb.addEventListener('click', handler)
    return [thumb, handler]
  })
  const onNext = () => showSlide('work-next')
  const onPrev = () => showSlide('work-prev')
  nextButton.addEventListener('click', onNext)
  prevButton.addEventListener('click', onPrev)
  carousel.setAttribute('data-loaded', 'true')
  resetAutoAdvance()

  cleanup = () => {
    window.clearTimeout(autoAdvanceTimeout)
    window.clearTimeout(animationTimeout)
    nextButton.removeEventListener('click', onNext)
    prevButton.removeEventListener('click', onPrev)
    thumbHandlers.forEach(([thumb, handler]) => thumb.removeEventListener('click', handler))
    carousel.classList.remove('work-next', 'work-prev', 'work-jump')
    carousel.removeAttribute('data-loaded')
  }
}

export function destroyOurWorkCarousel() {
  cleanup?.()
  cleanup = null
}

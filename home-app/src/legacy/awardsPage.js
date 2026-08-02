let observer = null

export function initAwardsPage() {
  destroyAwardsPage()

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const cards = document.querySelectorAll('.award-card, .cert-card')
  const timelineItems = document.querySelectorAll('.timeline-item')

  if (reduceMotion || !('IntersectionObserver' in window)) {
    cards.forEach((card) => {
      card.style.opacity = '1'
      card.style.transform = 'none'
    })
    timelineItems.forEach((item) => item.classList.add('animate'))
    return
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      if (entry.target.classList.contains('timeline-item')) {
        entry.target.classList.add('animate')
      } else {
        entry.target.style.opacity = '1'
        entry.target.style.transform = 'translateY(0)'
      }
      observer?.unobserve(entry.target)
    })
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })

  cards.forEach((card, index) => {
    card.style.opacity = '0'
    card.style.transform = 'translateY(30px)'
    card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`
    observer.observe(card)
  })
  timelineItems.forEach((item, index) => {
    item.style.transitionDelay = `${index * 0.1}s`
    observer.observe(item)
  })
}

export function destroyAwardsPage() {
  observer?.disconnect()
  observer = null
}

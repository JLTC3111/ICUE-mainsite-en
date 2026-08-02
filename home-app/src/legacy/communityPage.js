let observer = null
let observedFloatingElement = null
let pageVisible = true
let scrollRaf = null
let abortController = null

function updateFloatingElement() {
  scrollRaf = null
  if (!pageVisible || !observedFloatingElement) return
  observedFloatingElement.style.transform = `translateY(${window.scrollY * -0.5}px)`
}

function handleScroll() {
  if (!scrollRaf) scrollRaf = requestAnimationFrame(updateFloatingElement)
}

export function initCommunityPage() {
  destroyCommunityPage()
  abortController = new AbortController()
  const { signal } = abortController
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const photoItems = document.querySelectorAll('.photo-item')

  if (!reduceMotion && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.style.opacity = '1'
        entry.target.style.transform = 'translateY(0)'
        observer?.unobserve(entry.target)
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })

    photoItems.forEach((item, index) => {
      item.style.opacity = '0'
      item.style.transform = 'translateY(20px)'
      item.style.transition = `opacity 0.6s ease ${index * 0.05}s, transform 0.6s ease ${index * 0.05}s`
      observer.observe(item)
    })
  }

  observedFloatingElement = document.querySelector('.floating-elements')
  if (observedFloatingElement && !reduceMotion) {
    document.addEventListener('visibilitychange', () => {
      pageVisible = !document.hidden
      if (pageVisible) handleScroll()
    }, { signal })
    window.addEventListener('scroll', handleScroll, { passive: true, signal })
    handleScroll()
  }

  document.querySelectorAll('.community-btn[href="#"]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault()
      const labelNode = [...button.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)
      if (!labelNode) return
      const original = labelNode.textContent
      labelNode.textContent = ' Searching…'
      window.setTimeout(() => {
        if (labelNode.isConnected) labelNode.textContent = original
      }, 1200)
    }, { signal })
  })
}

export function destroyCommunityPage() {
  abortController?.abort()
  abortController = null
  observer?.disconnect()
  observer = null
  if (scrollRaf) cancelAnimationFrame(scrollRaf)
  scrollRaf = null
  observedFloatingElement = null
  pageVisible = true
}

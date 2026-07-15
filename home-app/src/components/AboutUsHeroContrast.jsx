import { useEffect, useRef, useState } from 'react'
import { useAdaptiveTextColor } from '@icue/contact-sidebar'

const TITLE_SELECTORS = [
  '.about-legacy-hero .cursive-default',
  '.about-legacy-hero .sub-text',
  '.about-legacy-hero .hero-body',
  '.about-legacy-hero #rainText',
]

function paintHeroTitle(color) {
  const hero = document.querySelector('.about-legacy-hero')
  if (!hero) return null

  hero.style.setProperty('--about-hero-fg', color)
  hero.classList.add('about-legacy-hero--adaptive-fg')

  TITLE_SELECTORS.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      el.style.color = color
      el.style.webkitTextFillColor = color
      el.style.background = 'none'
      el.style.webkitBackgroundClip = 'border-box'
      el.style.backgroundClip = 'border-box'
      el.querySelectorAll('span').forEach((span) => {
        span.style.color = color
        span.style.webkitTextFillColor = color
      })
    })
  })

  return hero
}

function clearHeroTitlePaint(hero) {
  if (!hero) return
  hero.classList.remove('about-legacy-hero--adaptive-fg')
  hero.style.removeProperty('--about-hero-fg')
  TITLE_SELECTORS.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      el.style.removeProperty('color')
      el.style.removeProperty('-webkit-text-fill-color')
      el.style.removeProperty('background')
      el.style.removeProperty('-webkit-background-clip')
      el.style.removeProperty('background-clip')
      el.querySelectorAll('span').forEach((span) => {
        span.style.removeProperty('color')
        span.style.removeProperty('-webkit-text-fill-color')
      })
    })
  })
}

/**
 * Applies adaptive black/white text color on the About Us hero title so it
 * stays readable over the background video (or static backdrop).
 */
export default function AboutUsHeroContrast({ active }) {
  const titleRef = useRef(null)
  const [bindKey, setBindKey] = useState(0)

  useEffect(() => {
    if (!active) {
      titleRef.current = null
      return undefined
    }

    const bind = () => {
      const next = document.querySelector('.about-legacy-hero .cursive-default')
      if (next === titleRef.current) return
      titleRef.current = next
      setBindKey((n) => n + 1)
    }

    bind()
    window.addEventListener('icue:legacy-page-ready', bind)
    const content = document.getElementById('content')
    const observer = content
      ? new MutationObserver(bind)
      : null
    observer?.observe(content, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('icue:legacy-page-ready', bind)
      observer?.disconnect()
      titleRef.current = null
    }
  }, [active])

  const color = useAdaptiveTextColor(titleRef, active, `${bindKey}`)

  useEffect(() => {
    if (!active) return undefined
    const hero = paintHeroTitle(color)
    return () => clearHeroTitlePaint(hero)
  }, [active, color, bindKey])

  return null
}

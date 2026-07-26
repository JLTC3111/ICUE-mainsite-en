import { useEffect, useRef } from 'react'
import './AnimatedContent.css'

export default function AnimatedContent({
  children,
  container,
  distance = 100,
  direction = 'vertical',
  reverse = false,
  duration = 0.8,
  ease = 'power3.out',
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  threshold = 0.1,
  delay = 0,
  disappearAfter = 0,
  disappearDuration = 0.5,
  disappearEase = 'power3.in',
  onComplete,
  onDisappearanceComplete,
  className = '',
  ...props
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      el.style.opacity = '1'
      el.style.visibility = 'visible'
      el.style.transform = 'none'
      return undefined
    }

    let scrollerTarget = container || document.getElementById('snap-main-container') || null
    if (typeof scrollerTarget === 'string') {
      scrollerTarget = document.querySelector(scrollerTarget)
    }

    const axis = direction === 'horizontal' ? 'x' : 'y'
    const offset = reverse ? -distance : distance
    const translate = axis === 'x'
      ? `translate3d(${offset}px, 0, 0)`
      : `translate3d(0, ${offset}px, 0)`
    const exitTranslate = axis === 'x'
      ? `translate3d(${reverse ? distance : -distance}px, 0, 0)`
      : `translate3d(0, ${reverse ? distance : -distance}px, 0)`

    el.style.visibility = 'visible'
    el.style.opacity = String(animateOpacity ? initialOpacity : 1)
    el.style.transform = `${translate} scale(${scale})`

    let entranceAnimation = null
    let exitAnimation = null
    let exitTimer = null

    const play = () => {
      entranceAnimation = el.animate(
        [
          { transform: `${translate} scale(${scale})`, opacity: animateOpacity ? initialOpacity : 1 },
          { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
        ],
        {
          duration: duration * 1000,
          delay: delay * 1000,
          easing: ease === 'power3.out' ? 'cubic-bezier(0.16, 1, 0.3, 1)' : 'ease-out',
          fill: 'forwards',
        },
      )

      entranceAnimation.finished.then(() => {
        onComplete?.()
        if (disappearAfter <= 0) return
        exitTimer = window.setTimeout(() => {
          exitAnimation = el.animate(
            [
              { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
              { transform: `${exitTranslate} scale(0.8)`, opacity: animateOpacity ? initialOpacity : 0 },
            ],
            {
              duration: disappearDuration * 1000,
              easing: disappearEase === 'power3.in' ? 'cubic-bezier(0.7, 0, 0.84, 0)' : 'ease-in',
              fill: 'forwards',
            },
          )
          exitAnimation.finished.then(() => onDisappearanceComplete?.()).catch(() => {})
        }, disappearAfter * 1000)
      }).catch(() => {})
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        play()
      },
      {
        root: scrollerTarget instanceof Element ? scrollerTarget : null,
        threshold: Math.max(0, Math.min(1, threshold)),
      },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      entranceAnimation?.cancel()
      exitAnimation?.cancel()
      if (exitTimer) window.clearTimeout(exitTimer)
    }
  }, [
    container,
    distance,
    direction,
    reverse,
    duration,
    ease,
    initialOpacity,
    animateOpacity,
    scale,
    threshold,
    delay,
    disappearAfter,
    disappearDuration,
    disappearEase,
    onComplete,
    onDisappearanceComplete,
  ])

  return (
    <div ref={ref} className={`animated-content ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

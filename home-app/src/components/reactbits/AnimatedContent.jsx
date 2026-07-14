import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './AnimatedContent.css'

gsap.registerPlugin(ScrollTrigger)

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
      gsap.set(el, { opacity: 1, visibility: 'visible', x: 0, y: 0, scale: 1 })
      return undefined
    }

    let scrollerTarget = container || document.getElementById('snap-main-container') || null
    if (typeof scrollerTarget === 'string') {
      scrollerTarget = document.querySelector(scrollerTarget)
    }

    const axis = direction === 'horizontal' ? 'x' : 'y'
    const offset = reverse ? -distance : distance
    const startPct = (1 - threshold) * 100

    gsap.set(el, {
      [axis]: offset,
      scale,
      opacity: animateOpacity ? initialOpacity : 1,
      visibility: 'visible',
    })

    const tl = gsap.timeline({
      paused: true,
      delay,
      onComplete: () => {
        onComplete?.()
        if (disappearAfter > 0) {
          gsap.to(el, {
            [axis]: reverse ? distance : -distance,
            scale: 0.8,
            opacity: animateOpacity ? initialOpacity : 0,
            delay: disappearAfter,
            duration: disappearDuration,
            ease: disappearEase,
            onComplete: () => onDisappearanceComplete?.(),
          })
        }
      },
    })

    tl.to(el, {
      [axis]: 0,
      scale: 1,
      opacity: 1,
      duration,
      ease,
    })

    const playReveal = () => {
      if (tl.progress() === 0 && !tl.isActive()) {
        tl.play()
      }
    }

    const stConfig = {
      trigger: el,
      start: `top ${startPct}%`,
      once: true,
      onEnter: playReveal,
    }
    if (scrollerTarget) {
      stConfig.scroller = scrollerTarget
    }

    const st = ScrollTrigger.create(stConfig)

    const revealIfNeeded = () => {
      ScrollTrigger.refresh()
      if (st.isActive || st.progress > 0) {
        playReveal()
        return
      }

      const rect = el.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight
      if (rect.top < viewportHeight * (startPct / 100) && rect.bottom > 0) {
        playReveal()
      }
    }

    const frameId = requestAnimationFrame(revealIfNeeded)
    const onLoad = () => revealIfNeeded()
    window.addEventListener('load', onLoad, { once: true })

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('load', onLoad)
      st.kill()
      tl.kill()
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

import { createRef, useEffect, useMemo, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HERO, HOME_SECTIONS } from '../data/homeContent'
import HomeHero from '../components/HomeHero'
import HomeSection from '../components/HomeSection'
import HomeBeamNetwork from '../components/HomeBeamNetwork'
import ErrorBoundary from '../components/ErrorBoundary'
import { useHomeBackgroundVideo } from '../hooks/useHomeBackgroundVideo'
import { useVisualEffectsTier } from '../hooks/useHeavyVisualEffects'

export default function HomePage() {
  useHomeBackgroundVideo()
  const effectsTier = useVisualEffectsTier()

  const containerRef = useRef(null)
  const heroRef = useRef(null)

  const sectionRefs = useMemo(
    () => HOME_SECTIONS.map(() => createRef()),
    [],
  )

  const cardRefs = useMemo(
    () => HOME_SECTIONS.map((section) => section.cards.map(() => createRef())),
    [],
  )

  useEffect(() => {
    const frameId = requestAnimationFrame(() => ScrollTrigger.refresh())
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad, { once: true })
    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('load', onLoad)
    }
  }, [])

  return (
    <div className="home-page" ref={containerRef}>
      <HomeHero hero={HERO} beamRef={heroRef} />
      <ErrorBoundary fallback={null}>
        <HomeBeamNetwork
          tier={effectsTier}
          containerRef={containerRef}
          heroRef={heroRef}
          sectionRefs={sectionRefs}
          cardRefs={cardRefs}
        />
      </ErrorBoundary>
      {HOME_SECTIONS.map((section, sectionIndex) => (
        <HomeSection
          key={section.id}
          {...section}
          beamRef={sectionRefs[sectionIndex]}
          cardBeamRefs={cardRefs[sectionIndex]}
          enableCardGlow={effectsTier === 'full'}
        />
      ))}
    </div>
  )
}

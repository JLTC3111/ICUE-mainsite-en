import { useEffect, useId, useLayoutEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'

const BEAM_BEND = 72
const MOBILE_BEAM_SECTION_INDICES = [0, 2]

function createBeamBalancer() {
  let left = 0
  let right = 0
  return {
    assignNext(magnitude = BEAM_BEND) {
      if (left <= right) {
        left += 1
        return -magnitude
      }
      right += 1
      return magnitude
    },
    assignForCard(cardIndex, cardCount, magnitude = BEAM_BEND) {
      if (cardCount <= 1) return this.assignNext(magnitude)
      const center = (cardCount - 1) / 2
      const offset = cardIndex - center
      if (offset < -0.01) {
        left += 1
        return -magnitude * (Math.abs(offset) / (center || 1))
      }
      if (offset > 0.01) {
        right += 1
        return magnitude * (offset / (center || 1))
      }
      return this.assignNext(magnitude * 0.7)
    },
  }
}

function getPath(containerRect, connection) {
  const from = connection.fromRef.current?.getBoundingClientRect()
  const to = connection.toRef.current?.getBoundingClientRect()
  if (!from || !to) return null
  const startX = from.left - containerRect.left + from.width / 2
  const startY = from.top - containerRect.top + from.height / 2 + (connection.startYOffset || 0)
  const endX = to.left - containerRect.left + to.width / 2
  const endY = to.top - containerRect.top + to.height / 2 + (connection.endYOffset || 0)
  const controlX = (startX + endX) / 2 + connection.curvature
  const controlY = (startY + endY) / 2
  return `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`
}

export default function HomeBeamNetwork({
  tier = 'none',
  containerRef,
  heroRef,
  sectionRefs,
  cardRefs,
}) {
  const idPrefix = useId().replace(/:/g, '')
  const [ready, setReady] = useState(false)
  const [allowMotion, setAllowMotion] = useState(true)
  const [layout, setLayout] = useState({ width: 1, height: 1, paths: [] })

  const connections = useMemo(() => {
    const pairs = []
    const balance = createBeamBalancer()
    sectionRefs.forEach((sectionRef, sectionIndex) => {
      const heroCurvature = balance.assignNext()
      pairs.push({
        key: `hero-section-${sectionIndex}`,
        fromRef: heroRef,
        toRef: sectionRef,
        curvature: heroCurvature,
        reverse: heroCurvature > 0,
        delay: sectionIndex * 0.35,
        startYOffset: 24,
        mobileAllowed: MOBILE_BEAM_SECTION_INDICES.includes(sectionIndex),
      })
      const cards = cardRefs[sectionIndex] || []
      cards.forEach((cardRef, cardIndex) => {
        const curvature = balance.assignForCard(cardIndex, cards.length)
        pairs.push({
          key: `section-${sectionIndex}-card-${cardIndex}`,
          fromRef: sectionRef,
          toRef: cardRef,
          curvature,
          reverse: curvature > 0,
          delay: sectionIndex * 0.2 + cardIndex * 0.18,
          endYOffset: -20,
          mobileAllowed: false,
        })
      })
    })
    return pairs
  }, [heroRef, sectionRefs, cardRefs])

  const visibleConnections = useMemo(() => {
    if (tier === 'none') return []
    return tier === 'light'
      ? connections.filter((connection) => connection.mobileAllowed)
      : connections
  }, [connections, tier])

  useLayoutEffect(() => {
    const first = requestAnimationFrame(() => {
      requestAnimationFrame(() => setReady(true))
    })
    return () => cancelAnimationFrame(first)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setAllowMotion(!media.matches && !document.hidden)
    update()
    media.addEventListener('change', update)
    document.addEventListener('visibilitychange', update)
    return () => {
      media.removeEventListener('change', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  useLayoutEffect(() => {
    if (!ready || !allowMotion || !visibleConnections.length) return undefined
    let frameId = 0
    const update = () => {
      frameId = 0
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const next = {
        width: Math.max(1, container.scrollWidth, rect.width),
        height: Math.max(1, container.scrollHeight, rect.height),
        paths: visibleConnections
          .map((connection) => ({ ...connection, path: getPath(rect, connection) }))
          .filter((connection) => connection.path),
      }
      const signature = `${next.width}|${next.height}|${next.paths.map((item) => item.path).join('|')}`
      setLayout((previous) => (
        previous.signature === signature ? previous : { ...next, signature }
      ))
    }
    const schedule = () => {
      if (!frameId) frameId = requestAnimationFrame(update)
    }
    const observer = new ResizeObserver(schedule)
    const nodes = new Set([containerRef.current])
    visibleConnections.forEach(({ fromRef, toRef }) => {
      nodes.add(fromRef.current)
      nodes.add(toRef.current)
    })
    nodes.forEach((node) => node && observer.observe(node))
    window.addEventListener('resize', schedule)
    window.addEventListener('scroll', schedule, { passive: true })
    schedule()
    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      window.removeEventListener('resize', schedule)
      window.removeEventListener('scroll', schedule)
    }
  }, [allowMotion, containerRef, ready, visibleConnections])

  if (!ready || !allowMotion || tier === 'none' || !layout.paths.length) return null

  return (
    <div className="home-beam-layer" aria-hidden="true">
      <svg
        className="home-beam-network-svg"
        width={layout.width}
        height={layout.height}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
      >
        <defs>
          {layout.paths.map((connection) => {
            const coordinates = connection.reverse
              ? { x1: ['90%', '-10%'], x2: ['100%', '0%'] }
              : { x1: ['10%', '110%'], x2: ['0%', '100%'] }
            return (
              <motion.linearGradient
                key={connection.key}
                id={`${idPrefix}-${connection.key}`}
                gradientUnits="userSpaceOnUse"
                initial={{ x1: '0%', x2: '0%', y1: '0%', y2: '0%' }}
                animate={{ ...coordinates, y1: ['0%', '0%'], y2: ['0%', '0%'] }}
                transition={{
                  delay: connection.delay,
                  duration: 4.5,
                  ease: [0.16, 1, 0.3, 1],
                  repeat: Infinity,
                  repeatType: 'mirror',
                }}
              >
                <stop stopColor="#1db7ff" stopOpacity="0" />
                <stop stopColor="#1db7ff" />
                <stop offset="32.5%" stopColor="#c8ff00" />
                <stop offset="100%" stopColor="#c8ff00" stopOpacity="0" />
              </motion.linearGradient>
            )
          })}
        </defs>
        {layout.paths.flatMap((connection) => [
          <path
            key={`${connection.key}-base`}
            d={connection.path}
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="2"
            strokeOpacity="0.3"
            strokeLinecap="round"
          />,
          <path
            key={`${connection.key}-active`}
            d={connection.path}
            fill="none"
            stroke={`url(#${idPrefix}-${connection.key})`}
            strokeWidth="2"
            strokeLinecap="round"
          />,
        ])}
      </svg>
    </div>
  )
}

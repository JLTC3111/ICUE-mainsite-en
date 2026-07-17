import { useEffect, useState } from 'react'

function readGridScanVisible() {
  if (typeof document === 'undefined') return false
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false
  }
  return document.documentElement.getAttribute('data-home-bg-video') === 'off'
}

export function useHomeGridScanVisible() {
  const [visible, setVisible] = useState(readGridScanVisible)

  useEffect(() => {
    const sync = () => setVisible(readGridScanVisible())

    sync()
    window.addEventListener('icue:homeVideoEnabled', sync)

    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-home-bg-video'],
    })

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    motionQuery.addEventListener?.('change', sync)

    return () => {
      window.removeEventListener('icue:homeVideoEnabled', sync)
      observer.disconnect()
      motionQuery.removeEventListener?.('change', sync)
    }
  }, [])

  return visible
}

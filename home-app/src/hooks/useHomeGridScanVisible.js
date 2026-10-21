import { useEffect, useState } from 'react'

function readGridScanVisible() {
  if (typeof document === 'undefined') return false
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

    return () => {
      window.removeEventListener('icue:homeVideoEnabled', sync)
      observer.disconnect()
    }
  }, [])

  return visible
}

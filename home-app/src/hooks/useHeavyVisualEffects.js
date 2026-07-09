import { useEffect, useState } from 'react'

/** @returns {'full' | 'light' | 'none'} */
export function getVisualEffectsTier() {
  if (typeof window === 'undefined') return 'none'
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'none'
  if (window.matchMedia('(max-width: 768px)').matches) return 'light'
  if (window.matchMedia('(pointer: coarse)').matches) return 'light'
  return 'full'
}

export function useVisualEffectsTier() {
  const [tier, setTier] = useState('none')

  useEffect(() => {
    const queries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(max-width: 768px)'),
      window.matchMedia('(pointer: coarse)'),
    ]

    const update = () => setTier(getVisualEffectsTier())

    update()
    queries.forEach((query) => query.addEventListener('change', update))
    return () => queries.forEach((query) => query.removeEventListener('change', update))
  }, [])

  return tier
}

/** @deprecated use useVisualEffectsTier */
export function useHeavyVisualEffects() {
  const tier = useVisualEffectsTier()
  return tier === 'full'
}

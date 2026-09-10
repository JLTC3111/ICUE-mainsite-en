import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { DEFAULT_META, ROUTE_META_BY_PATH } from '../lib/routeMeta'

/** Keeps the English home metadata stable if the client renders a 404 shell. */
export default function RouteHead() {
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = ROUTE_META_BY_PATH[pathname] || DEFAULT_META
    document.title = meta.title

    const descriptionTag = document.querySelector('meta[name="description"]')
    if (descriptionTag) descriptionTag.setAttribute('content', meta.description)

    const canonicalTag = document.querySelector('link[rel="canonical"]')
    if (canonicalTag) {
      canonicalTag.setAttribute('href', 'https://en.icue.vn/')
    }
  }, [pathname])

  return null
}

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cleanupLegacyPage, initLegacyPage, preloadLegacyPage } from '../legacy/pageInit'
import {
  loadLegacyPageSource,
  readEmbeddedLegacyPageSource,
} from '../legacy/pageHtml'
import { LEGACY_PAGE_FILES, pageFromPathname, prepareLegacyHtml } from '../lib/routes'

export default function LegacyHtmlPage() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const lang = i18n.resolvedLanguage || i18n.language
  const pageName = pageFromPathname(pathname)
  const [pageContent, setPageContent] = useState(() => {
    const raw = readEmbeddedLegacyPageSource(pageName)
    if (!raw) return null
    return { pageName, lang, ...prepareLegacyHtml(raw, lang) }
  })
  const [error, setError] = useState(null)
  const legacyRootRef = useRef(null)
  const pageNameRef = useRef(pageName)

  useEffect(() => {
    pageNameRef.current = pageName
  }, [pageName])

  useEffect(() => {
    if (!pageName) return undefined

    const file = LEGACY_PAGE_FILES[pageName]
    let cancelled = false

    // Load route-specific behavior and route-split markup concurrently. Direct
    // visits use the source embedded by postbuild, avoiding a second HTML request.
    void preloadLegacyPage(pageName).catch(() => {})

    async function load() {
      setError(null)

      if (pageContent?.pageName === pageName && pageContent?.lang === lang) return
      if (pageContent?.pageName !== pageName) setPageContent(null)

      try {
        const raw = readEmbeddedLegacyPageSource(pageName)
          || await loadLegacyPageSource(pageName)
        if (cancelled) return

        const prepared = prepareLegacyHtml(raw, lang)
        setPageContent({ pageName, lang, ...prepared })

      } catch (err) {
        if (cancelled) return
        setError(err.message || `Failed to load ${file}`)
      }
    }

    load()

    return () => {
      cancelled = true
      cleanupLegacyPage(pageName)
    }
  }, [lang, pageName])

  const html = pageContent?.pageName === pageName ? pageContent.html : ''
  const legacyBodyClass = pageContent?.pageName === pageName
    ? pageContent.bodyClass
    : ''

  // Init after HTML is committed to the DOM (fixes empty querySelector race).
  useLayoutEffect(() => {
    if (!html || !pageName) return undefined

    let cancelled = false
    const frameId = requestAnimationFrame(() => {
      if (cancelled) return
      window.dispatchEvent(
        new CustomEvent('icue:legacy-page-ready', { detail: { pageName } }),
      )
      void initLegacyPage(pageName).catch((err) => {
        if (!cancelled && pageNameRef.current === pageName) {
          console.error('Legacy page init failed:', err)
        }
      })
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frameId)
    }
  }, [html, pageName])

  if (!pageName) {
    return <p>Page not found.</p>
  }

  if (error) {
    return <p role="alert">{error}</p>
  }

  const legacyClassName = ['legacy-page', legacyBodyClass].filter(Boolean).join(' ')

  const getInternalDestination = (event) => {
    const anchor = event.target.closest?.('a[href]')
    if (!anchor || anchor.target || anchor.hasAttribute('download')) return null

    const destination = new URL(anchor.href, window.location.href)
    if (destination.origin !== window.location.origin) return null
    if (!pageFromPathname(destination.pathname)) return null
    return destination
  }

  const handleLinkClick = (event) => {
    if (event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const destination = getInternalDestination(event)
    if (!destination) return
    event.preventDefault()
    navigate(`${destination.pathname}${destination.search}${destination.hash}`)
  }

  return (
    <div
      ref={legacyRootRef}
      className={legacyClassName}
      onClick={handleLinkClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

import { BrowserRouter, Link, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { lazy, Suspense, useEffect, useLayoutEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import MainSiteNav from '@icue/main-site-nav/MainSiteNav'
import HomeLayoutGuard from '@icue/home-layout/HomeLayoutGuard'
import Footer from '@icue/site-footer/Footer'
import ContactSidebar from '@icue/contact-sidebar'
import { PEOPLE_SUBMENU, STANDALONE_DRAWER_LINKS } from '@icue/main-site-nav/navLinks'
import PillSiteHeader from './components/PillSiteHeader'
import RouteHead from './components/RouteHead'
import SiteLanguageMenu from './components/SiteLanguageMenu'
import { preloadLegacyPageSource } from './legacy/pageHtml'
import { preloadLegacyPage } from './legacy/pageInit'
import LegacyHtmlPage from './pages/LegacyHtmlPage'
import { ABOUT_US_APP_URL, pageFromPathname, pathFromLegacyHash, ROUTE_PATHS } from './lib/routes'

const HomePage = lazy(() => import('./pages/HomePage'))

function RouteFallback() {
  return <div className="route-loading" role="status" aria-label="Loading page" />
}

function LegacyHashRedirect() {
  const { i18n } = useTranslation()
  const lang = i18n.resolvedLanguage || i18n.language

  useLayoutEffect(() => {
    const target = pathFromLegacyHash(window.location.hash, lang)
    if (!target) return
    if (/^https?:\/\//i.test(target)) {
      window.location.replace(target)
      return
    }
    window.history.replaceState(null, '', target)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, [lang])
  return null
}

function NotFoundPage() {
  return (
    <section className="route-not-found" aria-labelledby="route-not-found-title">
      <h1 id="route-not-found-title">Page not found</h1>
      <p>The page you requested does not exist or has moved.</p>
      <Link to={ROUTE_PATHS.home}>Return home</Link>
    </section>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function NavSync() {
  const { pathname } = useLocation()

  useEffect(() => {
    const page = pageFromPathname(pathname) || 'Home'
    window.__mainSiteNav?.setPage?.(page)
  }, [pathname])

  return null
}

function RoutePrefetch() {
  useEffect(() => {
    const prefetch = (event) => {
      const anchor = event.target.closest?.('a[href]')
      if (!anchor) return
      const destination = new URL(anchor.href, window.location.href)
      if (destination.origin !== window.location.origin) return
      const pageName = pageFromPathname(destination.pathname)
      if (!pageName || pageName === 'Home') return
      void preloadLegacyPageSource(pageName).catch(() => {})
      void preloadLegacyPage(pageName).catch(() => {})
    }

    document.addEventListener('pointerover', prefetch, { passive: true })
    document.addEventListener('focusin', prefetch)
    return () => {
      document.removeEventListener('pointerover', prefetch)
      document.removeEventListener('focusin', prefetch)
    }
  }, [])
  return null
}

function AppShell() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage || i18n.language

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // The nav and footer are injected chrome shared with the other ICUE apps —
  // they take their copy as a prop. Without these both fall back to their
  // English defaults, which would strand a reader who picked Korean in an
  // English menu.
  const navLabels = useMemo(() => t('nav', { returnObjects: true }), [t, lang])

  const footerLabels = useMemo(
    () => ({
      company: t('footer.company'),
      otherPages: t('footer.otherPages'),
      awards: t('footer.awards'),
      news: t('footer.news'),
      archive: t('footer.archive'),
      faqs: t('footer.faqs'),
      recruitment: t('footer.recruitment'),
      privacy: t('footer.privacy'),
      terms: t('footer.terms'),
      gdpr: t('footer.gdpr'),
      cookies: t('footer.cookies'),
      partner: t('footer.partner'),
      rights: t('footer.rights'),
      instituteName: t('instituteName'),
    }),
    [t, lang],
  )

  return (
    <>
      <ScrollToTop />
      <LegacyHashRedirect />
      <RouteHead />
      <NavSync />
      <RoutePrefetch />
      <MainSiteNav
        variant="standalone"
        usePillNav
        drawerLinks={STANDALONE_DRAWER_LINKS}
        homeHref={ROUTE_PATHS.home}
        aboutUsHref={ABOUT_US_APP_URL}
        onNavigate={navigate}
        PillHeaderComponent={PillSiteHeader}
        pillOverflowItems={PEOPLE_SUBMENU.items}
        LanguageControl={SiteLanguageMenu}
        labels={navLabels}
        lang={lang}
      />
      <HomeLayoutGuard />
      <main id="content">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path={ROUTE_PATHS.home} element={<HomePage />} />
            {/* No /contact or /about-us route: both are redirected to shared
                apps on icue.vn before they ever reach the router. */}
            <Route path={ROUTE_PATHS.pastProjects} element={<LegacyHtmlPage />} />
            <Route path={ROUTE_PATHS.newsArchive} element={<LegacyHtmlPage />} />
            <Route path={ROUTE_PATHS.newsArchiveLegacyHtml} element={<LegacyHtmlPage />} />
            <Route path={ROUTE_PATHS.newsArchiveLegacyAlt} element={<LegacyHtmlPage />} />
            <Route path={ROUTE_PATHS.notableAwards} element={<LegacyHtmlPage />} />
            {/* No /community-activities, /faqs or /recruitment route either:
                all three are redirected before reaching the router. */}
            <Route path={ROUTE_PATHS.privacy} element={<LegacyHtmlPage />} />
            <Route path={ROUTE_PATHS.terms} element={<LegacyHtmlPage />} />
            <Route path={ROUTE_PATHS.gdpr} element={<LegacyHtmlPage />} />
            <Route path={ROUTE_PATHS.cookies} element={<LegacyHtmlPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer linkMode="standalone" onNavigate={navigate} labels={footerLabels} lang={lang} />
      <ContactSidebar contentKey={pathname} />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

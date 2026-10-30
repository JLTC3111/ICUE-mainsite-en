import { Suspense, useCallback, useMemo, useState } from 'react'
import { lazyWithRecovery } from '../resilience/lazyWithRecovery.jsx'
import { resolveMainSiteLink } from '../site-routes/mainSitePaths.js'
import Chatbot from './Chatbot.jsx'
import BackgroundMusicBanner from '../contact-sidebar/BackgroundMusicBanner.jsx'
import en from './locales/en.json'
import './SiteChatbot.css'

const CustomerAccountDialog = lazyWithRecovery(() => import('../customer-account/CustomerAccountDialog.jsx'))

/** Host adapter; the chat UI, retrieval engine, and bird are the VN originals. */
export default function SiteChatbot({ i18n }) {
  const locale = 'en'
  const [accountOpen, setAccountOpen] = useState(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('account') === 'chat')
  const closeAccount = useCallback(() => {
    setAccountOpen(false)
    const url = new URL(window.location.href)
    if (url.searchParams.get('account') === 'chat') {
      url.searchParams.delete('account')
      window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
    }
  }, [])
  const labels = useMemo(() => ({ ...en, ...i18n.getResource(locale, 'translation', 'chat') }), [i18n])
  const links = useMemo(() => ({ faqs: resolveMainSiteLink('FAQs', locale), contact: resolveMainSiteLink('Contact', locale) }), [locale])
  return (
    <>
      <div onClickCapture={event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
        const anchor = event.target.closest?.('a[href]')
        if (!anchor) return
        const url = new URL(anchor.href, window.location.href)
        if (url.origin === window.location.origin && url.searchParams.get('account') === 'chat') {
          event.preventDefault()
          setAccountOpen(true)
        }
      }}>
        <Chatbot locale={locale} labels={labels} links={links} />
      </div>
      <BackgroundMusicBanner locale={locale} />
      {accountOpen && <Suspense fallback={null}><CustomerAccountDialog onClose={closeAccount} /></Suspense>}
    </>
  )
}

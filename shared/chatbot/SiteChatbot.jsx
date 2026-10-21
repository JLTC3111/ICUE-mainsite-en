import { useMemo } from 'react'
import { resolveMainSiteLink } from '../site-routes/mainSitePaths.js'
import Chatbot from './Chatbot.jsx'
import en from './locales/en.json'

/** Host adapter; the chat UI, retrieval engine, and bird are the VN originals. */
export default function SiteChatbot({ i18n }) {
  const locale = 'en'
  const labels = useMemo(() => ({ ...en, ...i18n.getResource(locale, 'translation', 'chat') }), [i18n])
  const links = useMemo(() => ({ faqs: resolveMainSiteLink('FAQs', locale), contact: resolveMainSiteLink('Contact', locale) }), [locale])
  return <Chatbot locale={locale} labels={labels} links={links} />
}

import vi from '../../public/chatbot/kb.vi.json' with { type: 'json' }
import en from '../../public/chatbot/kb.en.json' with { type: 'json' }
import de from '../../public/chatbot/kb.de.json' with { type: 'json' }
import fr from '../../public/chatbot/kb.fr.json' with { type: 'json' }
import ko from '../../public/chatbot/kb.ko.json' with { type: 'json' }
import ja from '../../public/chatbot/kb.ja.json' with { type: 'json' }
import { withUiLang } from '../../shared/i18n/withUiLang.js'

const snapshot = { vi, en, de, fr, ko, ja }
const LOCALES = new Set(['vi', 'en', 'de', 'fr', 'ko', 'ja'])
const headers = { 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff' }

export async function sharedKnowledge(request, fetchUpstream = globalThis.fetch) {
  if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } })
  const locale = new URL(request.url).searchParams.get('lang')
  if (!LOCALES.has(locale)) return new Response(null, { status: 404 })
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 3500)
  try {
    const response = await fetchUpstream(`https://icue.vn/public/chatbot/kb.${locale}.json`, {
      signal: controller.signal, credentials: 'omit', redirect: 'error',
    })
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('knowledge_unavailable')
    const knowledge = await response.json()
    if (knowledge.language !== locale || !Array.isArray(knowledge.intents)) throw new Error('knowledge_invalid')
    return knowledgeResponse(knowledge, request, 'live')
  } catch {
    return knowledgeResponse(snapshot[locale], request, 'snapshot')
  } finally { clearTimeout(timer) }
}

function knowledgeResponse(knowledge, request, source) {
  // VN-authored links are often relative. Make them canonical here so a
  // French/Japanese answer cannot lose its language at the EN HTTP redirect.
  const localized = { ...knowledge, intents: knowledge.intents.map(intent => {
    if (!Array.isArray(intent.links)) return intent
    return { ...intent, links: intent.links.map(link => {
      if (typeof link.url !== 'string') return link
      const url = new URL(link.url, 'https://icue.vn')
      if (!['icue.vn', 'www.icue.vn', 'en.icue.vn'].includes(url.hostname)) return link
      return { ...link, url: withUiLang(url.href, knowledge.language) }
    }) }
  }) }
  return new Response(request.method === 'HEAD' ? null : JSON.stringify(localized), {
    headers: { ...headers, 'X-ICUE-Knowledge': source, 'Cache-Control': source === 'live' ? 'public, max-age=60, stale-while-revalidate=300' : 'no-store' },
  })
}

export default request => sharedKnowledge(request)

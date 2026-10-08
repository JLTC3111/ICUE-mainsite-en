import knowledge from '../../netlify/functions/chat-knowledge.mjs'
import history from '../../netlify/functions/chat-history.mjs'

/** Local Vite/Express parity with the two deployed Netlify handlers. */
export function createChatMiddleware() {
  return async (req, res, next) => {
    const pathname = (req.url || '').split('?')[0]
    const locale = /^\/chatbot\/shared\/(vi|en|de|fr|ko|ja)$/.exec(pathname)?.[1]
    const isHistory = pathname === '/.netlify/functions/chat-history'
    if (!locale && !isHistory) return next()
    try {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
      if (locale) url.searchParams.set('lang', locale)
      const request = new Request(url, {
        method: req.method, headers: req.headers,
        ...(!['GET', 'HEAD'].includes(req.method) ? { body: req, duplex: 'half' } : {}),
      })
      const response = await (locale ? knowledge : history)(request)
      res.statusCode = response.status
      response.headers.forEach((value, key) => res.setHeader(key, value))
      res.end(Buffer.from(await response.arrayBuffer()))
    } catch (error) { next(error) }
  }
}

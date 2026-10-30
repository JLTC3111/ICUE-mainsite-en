import knowledge from '../../netlify/functions/chat-knowledge.mjs'
import history from '../../netlify/functions/chat-history.mjs'
import config from '../../netlify/functions/chat-config.mjs'

/** Local Vite/Express parity with the deployed Netlify chat handlers. */
export function createChatMiddleware({ publicOrigin } = {}) {
  const configuredOrigin = publicOrigin ? new URL(publicOrigin).origin : null
  if (configuredOrigin && !/^https?:\/\//.test(configuredOrigin)) throw new Error('Public site origin must use HTTP or HTTPS')
  return async (req, res, next) => {
    const pathname = (req.url || '').split('?')[0]
    const isKnowledge = pathname.startsWith('/chatbot/shared/') || pathname === '/.netlify/functions/chat-knowledge'
    const isHistory = pathname === '/.netlify/functions/chat-history'
    const isConfig = pathname === '/newsroom/supabase-config.json' || pathname === '/.netlify/functions/chat-config'
    if (!isKnowledge && !isHistory && !isConfig) return next()
    try {
      // req.protocol respects Express's explicit trust-proxy configuration.
      // Never trust forwarding headers directly; production can pin its origin.
      const protocol = req.protocol || (req.socket?.encrypted ? 'https' : 'http')
      const url = new URL(req.url, configuredOrigin || `${protocol}://${req.headers.host || 'localhost'}`)
      const request = new Request(url, {
        method: req.method, headers: req.headers,
        ...(!['GET', 'HEAD'].includes(req.method) ? { body: req, duplex: 'half' } : {}),
      })
      const response = await (isKnowledge ? knowledge : isConfig ? config : history)(request)
      res.statusCode = response.status
      response.headers.forEach((value, key) => res.setHeader(key, value))
      res.end(Buffer.from(await response.arrayBuffer()))
    } catch (error) { next(error) }
  }
}

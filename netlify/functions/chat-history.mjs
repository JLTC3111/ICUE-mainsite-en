const UPSTREAM = 'https://vi.icue.vn/.netlify/functions/chat-history'
const HEADERS = { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' }
const reply = (status, error) => new Response(JSON.stringify({ error }), { status, headers: HEADERS })

export const config = { rateLimit: { windowLimit: 90, windowSize: 60, aggregateBy: ['ip', 'domain'] } }

/** Reuse the existing encrypted vault. No database keys or visitor cookies
 * are forwarded, and the destination cannot be supplied by a caller. */
export async function relayChatHistory(request, fetchUpstream = globalThis.fetch) {
  if (!['GET', 'PUT', 'DELETE'].includes(request.method)) return reply(405, 'method_not_allowed')
  const authorization = request.headers.get('authorization') || ''
  if (!/^Bearer [a-f0-9]{64}$/.test(authorization)) return reply(401, 'unauthorized')
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return reply(403, 'origin_mismatch')
  if (Number(request.headers.get('content-length')) > 1_501_000) return reply(413, 'too_large')
  let body
  if (request.method === 'PUT') {
    const reader = request.body?.getReader()
    const chunks = []
    let size = 0
    if (!reader) return reply(400, 'invalid_payload')
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 1_501_000) { await reader.cancel(); return reply(413, 'too_large') }
      chunks.push(value)
    }
    body = new Blob(chunks)
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)
  try {
    const response = await fetchUpstream(UPSTREAM, {
      method: request.method, signal: controller.signal, redirect: 'error',
      credentials: 'omit', cache: 'no-store',
      headers: { Authorization: authorization, Origin: 'https://vi.icue.vn', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body } : {}),
    })
    if (!response.headers.get('content-type')?.includes('application/json')) return reply(503, 'sync_unavailable')
    return new Response(await response.text(), { status: response.status, headers: HEADERS })
  } catch { return reply(503, 'sync_unavailable') }
  finally { clearTimeout(timer) }
}

export default request => relayChatHistory(request)

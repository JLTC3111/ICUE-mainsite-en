const CONFIG_URL = 'https://vi.icue.vn/newsroom/supabase-config.json'

/** Relay only the public configuration for the existing VN support service. */
export async function sharedChatConfig(request, fetchUpstream = globalThis.fetch) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } })
  }
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 3500)
  try {
    const response = await fetchUpstream(CONFIG_URL, { credentials: 'omit', redirect: 'error', signal: controller.signal })
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Invalid configuration')
    const { url, anonKey } = await response.json()
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.supabase.co') || parsed.pathname !== '/') throw new Error('Invalid service URL')
    if (typeof anonKey !== 'string' || !anonKey) throw new Error('Missing public key')
    if (!anonKey.startsWith('sb_publishable_')) {
      const claims = JSON.parse(Buffer.from(anonKey.split('.')[1] || '', 'base64url').toString())
      if (claims.role !== 'anon') throw new Error('Not a public key')
    }
    return new Response(request.method === 'HEAD' ? null : JSON.stringify({ url: parsed.origin, anonKey }), { headers })
  } catch {
    return Response.json({ error: 'Chat configuration unavailable' }, { status: 503, headers })
  } finally { clearTimeout(timer) }
}

export default request => sharedChatConfig(request)

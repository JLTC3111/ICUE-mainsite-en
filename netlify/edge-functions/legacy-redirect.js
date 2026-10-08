import { getBootstrapExternalRedirect } from '../../home-app/src/lib/bootstrapExternalRedirect.js'

// Edge functions run before _redirects, so the selected locale and legacy
// detail id are retained before the English-default compatibility rules run.
export default function legacyRedirect(request, context) {
  if (request.method === 'GET' || request.method === 'HEAD') {
    const url = new URL(request.url)
    const target = getBootstrapExternalRedirect(url.pathname, url.search)
    if (target) {
      return new Response(null, {
        status: 301,
        headers: { Location: new URL(target, url.origin).href },
      })
    }
  }
  return context.next()
}

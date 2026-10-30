Domain routing check — 30 October 2026

Follow-up: the chatbot rewrite defect below has a local fix with regression
coverage. See the [remediation record](audit-remediation-2026-10-30.md).
Deployment is still needed before the live endpoint changes. The observations
below retain the original production evidence.

The page redirects agree with the new domain split. No redirect loop was
observed in the tested live routes. No application configuration was changed.

| Domain | Intended role | Observed live behavior |
| --- | --- | --- |
| `https://icue.vn/` | Company landing page | HTTP 200; landing-page HTML |
| `https://www.icue.vn/` | Alias of company landing | HTTP 301 to `https://icue.vn/`, then 200 |
| `https://vi.icue.vn/` | Main website and shared section apps | HTTP 200; main-site HTML |
| `https://en.icue.vn/` | English homepage | HTTP 200; non-home sections forward to `vi.icue.vn` |

The current English `_redirects`, `home-app/public/_redirects`, and built
`dist-home/_redirects` are identical. All 117 HTTP 301 rules match the shared
bootstrap redirect helper after substituting representative detail IDs and
suffixes. `npm run check:routes` passes.

The other local repositories match this arrangement:

- `/Users/skycastle3/Desktop/icue-landingpage-react/public/_redirects` forwards
  old company-site section paths from the apex domain to `vi.icue.vn`.
- `/Users/skycastle3/Desktop/ICUE-mainsite-vn/_redirects` serves the main website
  and shared apps locally on the Vietnamese host.
- The English repository forwards sections to `vi.icue.vn`, keeps the English
  home on `en.icue.vn`, and sends non-English home requests to `vi.icue.vn`.

Representative live HTTP chains:

| Request | Result |
| --- | --- |
| `icue.vn/contact?lang=ja&utm_source=domain-check` | 301 to the same path/query on `vi.icue.vn`, 301 to `/contact/`, 200 |
| `icue.vn/about-us?lang=en` | 301 to `vi.icue.vn/about-us?lang=en`, 200 |
| `icue.vn/people/core-team?lang=fr` | 301 to the same path/query on `vi.icue.vn`, 200 |
| `icue.vn/newsroom/` | 301 to `vi.icue.vn/newsroom/`, 200 |
| `en.icue.vn/?lang=ja` | 301 to `vi.icue.vn/?lang=ja`, 200 |
| `en.icue.vn/contact?lang=ja&utm_source=domain-check` | 301 to `vi.icue.vn/contact?utm_source=domain-check&lang=ja`, trailing-slash canonicalization, 200 |
| `en.icue.vn/past-projects/6?lang=fr&utm_source=domain-check` | 301 to the same path/query on `vi.icue.vn`, 200 |
| `en.icue.vn/legacy/pages/card.html?id=6&lang=ja` | 301 to `vi.icue.vn/past-projects/6?lang=ja`, 200 |
| `en.icue.vn/legacy/pages/article_template.html?id=2&lang=ko` | 301 to `vi.icue.vn/news-archive/2?lang=ko`, 200 |
| `en.icue.vn/legal/privacy?lang=fr` | 301 to `vi.icue.vn/legal/privacy?lang=fr`, trailing-slash canonicalization, 200 |

Twenty-eight live HEAD redirect chains were checked, followed by targeted GET
checks. Languages, representative legacy IDs, and campaign parameters survived
the tested page migrations. The VN host's extra slash redirects are finite.
Public video compatibility and both public Supabase configuration URLs also
returned their expected content types. No credentials or private data were
requested.

**P2 — The chatbot knowledge rewrite fails without an explicit query locale.**

Locations: `_redirects:2`, `netlify/functions/chat-knowledge.mjs:15`, and
`scripts/lib/chat-routes.mjs:15`.

This page-domain migration is correct, but the first rewrite has a separate
production defect:

```text
GET /chatbot/shared/en                            -> 404, empty body
GET /chatbot/shared/ja                            -> 404, empty body
GET /.netlify/functions/chat-knowledge?lang=en    -> 200, language "en"
GET /chatbot/shared/en?lang=en                    -> 200, language "en"
GET /chatbot/shared/en?lang=fr                    -> 200, language "fr"
GET /chatbot/shared/fr?lang=en                    -> 200, language "en"
```

The function reads only the incoming URL's `lang` query parameter. The observed
behavior indicates that the query added by the rewrite target is not reaching
the handler as assumed. The normal browser knowledge URLs in
`shared/chatbot/lib/knowledgeAssets.js` have no query, so they receive 404.
The direct function is deployed and successfully fetches the VN JSON; this is
a routing/locale extraction issue, not an unavailable destination domain.

The local middleware hides the discrepancy by explicitly inserting the locale
into the query before invoking the handler. The current integration tests also
construct a query-bearing request, so passing local tests do not validate the
actual deployed rewrite.

Recommended correction: derive and validate the locale from the original
`/chatbot/shared/:lang` path, retaining query-based routing for direct function
URLs, or configure the function's custom path and use its path parameters.
Netlify documents named function paths and `context.params` in its
[function routing reference](https://docs.netlify.com/build/functions/configuration/#routing).
Test the query-free public URL and a conflicting query locale on deployment.

The English edge function runs before `_redirects`, preserving incoming page
languages before the manifest's English-default rules. This ordering is
documented in Netlify's
[redirect reference](https://docs.netlify.com/manage/routing/redirects/overview/#rule-processing-order).

The domain assignments must remain separate: the English edge helper is
hostname-agnostic and would redirect `vi.icue.vn/contact?lang=en` to itself if
the Vietnamese domain were assigned to the English deployment. The live
responses show the intended separate applications, not that configuration.

An intentional future link to the company landing page should also avoid the
legacy main-site normalization in `shared/i18n/withUiLang.js:55`, which converts
old `icue.vn` links to `vi.icue.vn`. No current production navigation link was
found incorrectly pointing at the landing domain.

Audit remediation — 30 October 2026

All seven findings in the codebase audit and the additional chatbot rewrite
finding in the domain-routing check have local fixes. This record describes
source changes and local validation; no production deployment was performed.

| Finding | Change |
| --- | --- |
| Public knowledge URL returned 404 | The function validates the locale in `/chatbot/shared/<locale>` directly. A conflicting query cannot change that language. Direct function calls still support `?lang=`. The rewrite no longer adds a query, and local middleware no longer injects one. |
| Signed-in first-message loss after reload | Account-scoped storage keeps the creation capability until the server acknowledges a conversation ID. The same capability and client message ID survive an uncertain first send and reload; acknowledged account records stop persisting the capability. |
| Composer stuck after changing threads | Selecting or starting a conversation clears send/pagination flags while invalidating older responses. A late response cannot replace the new conversation. |
| Attachment response bodies could hang | The deadline and cancellation remain active while buffering the upload acknowledgement or downloaded file, including after response headers arrive. |
| Hidden drawer/People links remained keyboard accessible | The real React 19 DOM now receives boolean `inert` for the closed drawer and collapsed People submenu. The submenu is also marked hidden from assistive technology until expanded. |
| HTTPS Express origin mismatch | The adapter accepts a configured public origin and respects trusted Express protocol information without reading forwarding headers itself. Production defaults to `https://en.icue.vn`; `PUBLIC_SITE_ORIGIN` supports other HTTPS deployments. Foreign history origins remain rejected. |
| Dependency advisories | Both lockfiles use Vite 6.4.5. Express is 4.22.3, body-parser is 1.20.9, and qs is 6.17.1. The unused markdown-it dependency was removed. Both dependency trees report zero npm vulnerabilities. |
| Upstream integrity mismatch | The homepage's hover override moved from the mirrored LiveChat.css into SiteChatbot.css, restoring the recorded CSS hash. Live-chat recovery changes are documented as a local patch; tests reverse that patch in a temporary directory and verify all 64 original upstream hashes. The sync command reapplies the patch after copying upstream source. |

Regression coverage exercises query-free knowledge URLs for all six locales,
conflicting query/path locales, invalid routes, direct function access, outage
fallback, signed-in creation both before and after a server commit, a late send
response after a thread change, upload/download body stalls, cancellation after
headers, the real drawer/navigation DOM, HTTPS history requests, and rejection
of foreign origins or untrusted forwarded-protocol headers.

The domain arrangement is preserved: `icue.vn` is the company landing page,
`vi.icue.vn` hosts the main site and shared sections, and `en.icue.vn` owns the
English homepage. No sibling repositories or domain settings were changed.

Validation:

- Clean `npm ci` in both package trees succeeded in a temporary copy with the
  patched lockfiles; `npm ls --depth=0` passed in both trees.
- Both clean-install dependency audits reported zero vulnerabilities.
- Production build and route/output checks passed.
- Audit suite: 132 passed, zero failed.
- Recovery suite: 45 passed, zero failed.
- The Netlify handlers/edge bundle compiled for Node 22, and the bundled
  knowledge handler returned 200 for all six query-free public locale URLs
  using controlled upstream fallback.
- Source diff whitespace check passed.

The checkout tracks dependency files despite its ignore rules. Clean-install
validation used an isolated copy so the source patch does not include vendor
churn. Run `npm ci` and `npm ci --prefix home-app` when aligning the main
checkout's existing installation with the new lockfiles. Production CI must
install from these lockfiles and deploy the Netlify functions/edge code along
with the static build. Uploading only static output cannot update the
knowledge handler.

The main checkout's generated build output and redirect mirror were refreshed
from the verified clean build. Existing index.html and profile-photo changes
were preserved. Live accounts, production support messages, and private files
were not used for verification.

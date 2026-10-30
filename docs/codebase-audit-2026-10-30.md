Codebase audit — 30 October 2026

Follow-up: all seven findings below have local fixes. The additional chatbot
rewrite finding from the domain check is also fixed locally. See the
[remediation record](audit-remediation-2026-10-30.md) for implementation and
validation. The original audit evidence below describes the earlier code;
production deployment has not been performed.

Audited revision: `c3d764ef` and the current working tree. Five functional
findings and two maintenance findings are recorded below. P2 denotes a normal
priority fix; P3 denotes a lower priority maintenance correction. No application
fixes, dependency updates, deployment, or database changes were made.

The review covered the active English React homepage, shared navigation and
accessibility, contact controls, startup/media recovery, customer account and
live chat state, encrypted history integration, Express and Netlify handlers,
redirects, build scripts/output, and both dependency lockfiles. Retired page
sources were considered as compatibility inputs. Remote database/RLS policies
and the implementation of the Vietnamese site's services are outside this
repository and were not audited. Existing profile-photo changes were preserved.

1. **P2 — Reloading loses a signed-in visitor's unacknowledged first message.**

   Location: `shared/chatbot/lib/liveChat.js:104`; restoration validation at
   line 75 and authenticated restoration at line 265.

   The client correctly saves a pending message and its retry ID before sending.
   For authenticated records, however, `persist()` always replaces the creation
   capability with `token: null`. Before the first `open` response arrives, the
   conversation ID is also null. `readSaved()` rejects that combination on reload,
   discarding the saved draft, pending message, and retry identity.

   Confirmed using the actual client implementation with controlled RPC and
   storage: sign in, send a first message, lose the creation acknowledgement,
   recreate the client, and restore the account. Storage had the text and client
   message ID with `{ token: null, id: null, ownerId: ... }`; the restored client
   had an empty draft and no pending message. If the server committed the first
   request, retrying as a new enquiry can create a duplicate. If it did not commit,
   the visitor has lost the local message. The existing guest reload test does
   not cover this authenticated path.

   Fix: retain a recoverable, account-scoped creation identity until the server
   acknowledges creation, and restore pending authenticated messages safely.
   Verify both a committed request whose response is lost and a request that
   never commits, including stable retry IDs across reload.

2. **P2 — Changing conversations during a send leaves the composer busy.**

   Location: `shared/chatbot/lib/liveChat.js:313`; send cleanup at line 217.
   The account dialog invokes thread selection at
   `shared/customer-account/CustomerAccountDialog.jsx:109`.

   `selectConversation()` aborts the old send and increments `generation`, but
   does not clear `state.sending`. The old send's `finally` deliberately skips
   state updates after a generation change, so neither operation resets the
   flag. Account conversation buttons remain available while sending.

   Confirmed using the actual client: start a delayed send, select another
   account conversation, settle the aborted request, then attempt a new send.
   The new conversation reached `status: 'ready'` while `sending` stayed true,
   and the next `send()` returned false. The composer consequently stays read-only
   and shows its Stop control. Stopping again cannot clear the stale flag;
   reloading or another account transition is needed. `newConversation()` has
   the same missing reset.

   Fix: reset operation flags when switching/resetting a conversation while
   retaining the generation guard that prevents stale responses from applying.
   Exercise cancellation and a successful send on the newly selected thread.

3. **P2 — Attachment timeouts stop at response headers.**

   Location: `shared/chatbot/lib/liveChatFiles.js:13`; body consumption at
   lines 25 and 29. Deadline cleanup is in `shared/resilience/requests.js:20`.

   `supportFileRequest()` returns a `Response` from inside `withDeadline()`.
   Fetch resolves when headers arrive; the wrapper then removes its timeout
   and caller-abort listener. Upload JSON and download blobs are consumed after
   that cleanup. A stalled response body therefore has neither the configured
   deadline nor cancellation propagated from the calling operation.

   Confirmed with a controlled response stream: return successful headers but
   leave the body open. After the configured timeout the upload promise remained
   unresolved and its request signal was not aborted. In the actual chat store
   that leaves an attachment `uploading`, which makes the composer busy and
   blocks sends. Stop cannot interrupt the body once the wrapper has removed
   its abort listener. Downloads can similarly remain unresolved.

   Fix: parse JSON/read the blob inside the deadline, or buffer the response
   there as the existing `fetchWithDeadline()` helper does. Cover a stalled body
   and cancellation after headers, not only delayed response headers.

4. **P2 — Closed drawer controls remain keyboard focusable.**

   Location: `shared/drawer-menu/DrawerMenuPanel.jsx:146`.

   `inert={open ? undefined : ''}` supplies an empty string for a boolean React
   19 property. React omits `inert` and emits a warning. The closed drawer is
   moved offscreen using a transform (`DrawerMenu.css:256`); it remains mounted
   with focusable descendants and `aria-hidden="true"`. Keyboard focus can enter
   invisible navigation that is hidden from assistive technology.

   Confirmed by mounting the real drawer, navigation, and hooks using
   `react-dom/client` in jsdom. The closed aside had no inert attribute;
   Close, Home, and Contact retained `tabIndex=0`; focusing Home succeeded.
   The existing drawer regression replaces navigation with a span, so it does
   not detect this failure.

   Fix: use `inert={!open}` and verify focusable descendants in a DOM regression.
   Also address the collapsed People submenu in `LineSidebarNav.jsx:105`:
   it keeps its anchors mounted while hiding the grid with zero rows/opacity,
   without inertness or removing them from keyboard navigation.

5. **P2 — HTTPS proxying breaks history writes in the Express runtime.**

   Location: `scripts/lib/chat-routes.mjs:14`; rejection at
   `netlify/functions/chat-history.mjs:14`.

   The local adapter unconditionally builds the internal request URL with
   `http://`. When Express runs behind HTTPS termination, a browser's PUT or
   DELETE carries an HTTPS Origin. The history handler compares that Origin to
   the reconstructed HTTP URL and rejects a legitimate request with 403.
   Express `trust proxy` alone does not fix this because the adapter ignores
   `req.protocol`.

   Confirmed with the actual middleware and a Node readable request fixture:
   PUT and DELETE to `/.netlify/functions/chat-history`, Host `en.icue.vn`,
   Origin `https://en.icue.vn`, `X-Forwarded-Proto: https`, `req.protocol: https`,
   and a syntactically valid 64-hex-character bearer each returned
   `403 {"error":"origin_mismatch"}` before an upstream fetch.

   This affects history uploads and vault deletion in the optional Express
   deployment configuration. The native Netlify handler is unaffected.

   Fix: use a configured public origin, or derive the protocol through an
   explicitly trusted proxy configuration while retaining Origin validation.
   Cover requests through the adapter as well as direct function requests.

6. **P2 — Both lockfiles retain packages with current security advisories.**

   Locations: `package-lock.json:4258` and
   `home-app/package-lock.json:2061` (Vite 6.4.3);
   `package-lock.json:1907` (body-parser 1.20.6), `:3174`
   (markdown-it 14.3.1), and `:3562` (qs 6.16.0).

   On this audit date, root `npm audit --json` reported five affected package
   entries: three high and two moderate. The home-app audit reported one high
   entry, Vite, which overlaps the root tree. Counts include transitive effects
   and do not represent six independent vulnerabilities.

   Vite's maintainer identifies 6.4.4 as patched for the reported development
   server issues. The non-Windows file disclosure advisory requires a reachable
   dev server and specific imported project paths that coincide with readable
   host paths; those conditions were not established here. Editor issues also
   have platform/editor prerequisites. Static Netlify output does not run the
   Vite dev server.
   [Vite maintainer advisory](https://github.com/vitejs/vite/security/advisories/GHSA-rq7h-c2jc-7f22).

   body-parser's compressed-body crash is fixed in 1.20.9. The current Express
   application does not mount body-parser/express.json middleware, so the
   affected decompression flow was not found in this server.
   [body-parser maintainer advisory](https://github.com/expressjs/body-parser/security/advisories/GHSA-27r3-jxmh-p828).

   markdown-it's multiline-reference denial of service is fixed in 14.3.3.
   No active application import of markdown-it was found; the reported
   qs.stringify path was also not found. These package advisories are maintenance
   findings, not confirmation of a remotely exploitable production endpoint.
   [markdown-it maintainer advisory](https://github.com/markdown-it/markdown-it/security/advisories/GHSA-gfr2-rv44-r23c).

   Fix: refresh both lockfiles to patched compatible versions, remove unused
   parser dependencies, and rerun dependency audits and the existing checks.
   Avoid a forced major-version update as the default remedy.

7. **P3 — The chatbot provenance check fails on the current checkout.**

   Location: `shared/chatbot/upstream.json:11`, validated by
   `scripts/tests/chatbot-integration.test.mjs:23`.

   The manifest records LiveChat.css SHA-256
   `f1b5c97fdf13c92013a1dfc209d45266926969dbf9ea28e69468af4a97434d41`.
   The checked-in stylesheet hashes to
   `38973dc0730a349b9404366cdbfacbcd709425a147b9434ded65385be784e935`.
   Recomputing all 64 manifest entries found this one mismatch. Consequently
   `npm run test:audit` exits nonzero even though the production build passes.

   Fix: establish whether the stylesheet is an intended host customization or
   an upstream update. Keep host overrides outside mirrored source files, or
   sync from the actual upstream revision and regenerate its provenance.
   Merely replacing the expected hash would not substantiate the recorded
   upstream commit. Retain the integrity test.

Validation completed:

- `npm run build`: passed, including route and production checks; generated
  zero subpage shells, eight entry asset references, and 14 JavaScript bundles.
- `npm run test:audit`: 123 passed, one failed, 124 total. The sole failure is
  the LiveChat.css provenance mismatch above.
- `npm run test:recovery`: all 45 passed.
- Root and home-app `npm ls --depth=0`: both passed; their installed direct
  dependencies satisfy their declared ranges.
- Both dependency audits completed; results are described above.
- Focused source/DOM/request reproductions established the five functional
  findings without production writes or external account actions.

Validation limits: no physical browser layout or mobile-device interaction
audit, clean CI install, live authentication, attachment upload, or remote
database security review was performed. React focus evidence used jsdom;
request/state evidence used controlled boundaries around the actual source.
Build output and temporary logs were generated; application source was not
modified. Previously reported traversal, denied-storage drawer crash, calendar
modal behavior, localized redirects, and GET/HEAD parity have passing regression
coverage in this checkout.

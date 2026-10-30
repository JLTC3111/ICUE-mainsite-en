# Shared ICUE chatbot

The English homepage mounts the Vietnamese site's original `Chatbot.jsx` and
bird mascot. The component, artwork, expressions, motion, localized copy,
retrieval engine, FAQ corpus, and encrypted history code are reused without
redesigning a separate mascot. `shared/chatbot/upstream.json` records the source
commit and SHA-256 hashes; regression tests verify those files still match
after reversing the documented local recovery patches. The original source
hashes remain tied to the upstream bytes.
Only the host adapters choose English by default, supply canonical localized
links, connect to the homepage's existing background music, and handle account
sign-in on the English origin.

`SiteChatbot.css` contains English homepage style overrides. Keep these outside
the mirrored stylesheets so upstream refreshes preserve both provenance and
the homepage's hover contrast.

## Live support and portals

The shared **Talk to our team** tab uses the same support service and inbox as
the Vietnamese site, including presence, typing, retries, private PDF/image
attachments, downloads, and account ownership. Opening the assistant does not
start a support conversation or forward the assistant transcript.

`/newsroom/supabase-config.json` is a same-origin `chat-config` relay of the VN
site's public configuration. It returns only the service URL and public key,
rejects privileged keys, and forwards no cookies. The edge redirect and local
runtimes leave this JSON endpoint local. No separate database or service key is
required. The support API validates guest capabilities and account sessions.

The contact bar's **Staff login and chat management** link opens
`https://vi.icue.vn/newsroom/portal?mode=staff&lang=en`. The People/Staff header links
open `https://vi.icue.vn/people/experts?lang=en` in the pill, mobile, and dock headers;
the drawer retains both Experts and Core Team.

**Sign in to keep this conversation** opens the English customer account dialog
without leaving the current chat. This matters because guest capabilities and
auth sessions are stored separately on each origin. Successful sign-in claims
the English guest thread on the shared backend. The dialog also lists saved
conversations; signing out clears the private chat view. The same account can
then access its saved threads on the VN customer portal after signing in there.
Signup email confirmation and password recovery use that existing portal.

## Knowledge

All six languages request `/chatbot/shared/<locale>`. Netlify rewrites this to
`chat-knowledge`, which reads the current public knowledge from
`https://vi.icue.vn/public/chatbot/kb.<locale>.json`. This same-origin relay avoids
requiring CORS changes on the Vietnamese site. Answers continue to be selected
locally by the original retrieval engine; visitors' questions are not sent to
the knowledge service.

The handler validates the locale from the original public URL path, including
when Netlify retains that URL during a rewrite. A conflicting `?lang=` cannot
change the path's language. Direct calls to `/.netlify/functions/chat-knowledge`
continue to accept `?lang=`. Local middleware follows the same rules without
injecting a query parameter.

Successful live knowledge can be cached for 60 seconds, with up to five minutes
of stale content during revalidation. After a 3.5-second upstream timeout,
invalid response, or outage, the relay uses the last synced VN snapshot bundled
with this deployment. Snapshot responses are not cached. ICUE links in both
sources become canonical links with the answer's language. The embedded FAQ
corpus retains the VN review flags excluding variable commercial/legal claims.

## Optional shared history

History remains local until the visitor enables sync. The `chat-history`
function relays the original capability token and encrypted payload to
`https://vi.icue.vn/.netlify/functions/chat-history`. It forwards no cookies or
Supabase keys. It validates methods, token format, caller origin, and payload
size before forwarding; the existing service performs vault authorization and
revision checks. Existing upstream rate limits and encryption remain in use.

Use the same pairing code in the Sync settings on each site to access the same
encrypted vault. Browser storage on `vi.icue.vn` and `en.icue.vn` is separate, so
transcripts do not automatically appear across domains without that pairing.
No second Supabase project, table, or backend secret is needed in this repo.
If the VN sync backend is unavailable, the original UI retains local history
and offers its existing retry/error handling.

## Maintenance and deployment

Run `npm run sync:chatbot` to refresh the component, mascot, FAQ corpus, and
fallback knowledge from the sibling `../ICUE-mainsite-vn` checkout. The script
reads that checkout without modifying it. Set `ICUE_VN_REPO` to use another
path. The EN host adapters and tests remain in place. Live knowledge updates
automatically when the VN site's knowledge is published; component/FAQ and
fallback changes require the explicit sync command and the next EN deployment.
Builds do not require the VN checkout to exist.

`scripts/chatbot-patches/live-chat-recovery.patch` retains the reviewed local
fixes for authenticated first-message retries, conversation-switch cleanup,
and attachment response deadlines. The sync command applies this patch after
copying VN source and fails if it no longer applies cleanly; review/rebase it
when upstream changes. The provenance test reverses the patch in a temporary
directory and verifies the original hashes, including the unmodified artwork.

Use Node 22.12 or newer. `npm ci`, `npm ci --prefix home-app`, and `npm run build`
produce the homepage; a normal Netlify deployment also bundles the three functions
and the locale-preserving edge redirect declared in `netlify.toml`. Publishing
only the static `dist-home` directory to another host requires equivalent
handlers for `/chatbot/shared/<locale>`, the public configuration relay, and the history endpoint. Vite dev,
Vite preview, and the optional Express server already use the same handlers.

For Express behind HTTPS termination, production defaults its public origin to
`https://en.icue.vn`. Set `PUBLIC_SITE_ORIGIN` to the browser-facing origin for a
different hostname or an HTTPS proxy used outside production. The adapter also
respects `req.protocol` from an explicitly trusted Express proxy configuration;
it does not trust forwarding headers directly. Foreign origins remain rejected
by the history handler.

Validation commands: `npm run test:audit`, `npm run test:recovery`,
`npm run check:production`, and `npm audit` in both dependency trees.

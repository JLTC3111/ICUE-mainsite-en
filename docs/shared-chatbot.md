# Shared ICUE chatbot

The English homepage mounts the Vietnamese site's original `Chatbot.jsx` and
bird mascot. The component, artwork, expressions, motion, localized copy,
retrieval engine, FAQ corpus, and encrypted history code are reused without
redesigning a separate mascot. `shared/chatbot/upstream.json` records the source
commit and SHA-256 hashes; regression tests verify those files still match.
Only the host adapters choose English by default, supply canonical localized
links, and connect to the homepage's existing background music.

## Knowledge

All six languages request `/chatbot/shared/<locale>`. Netlify rewrites this to
`chat-knowledge`, which reads the current public knowledge from
`https://icue.vn/public/chatbot/kb.<locale>.json`. This same-origin relay avoids
requiring CORS changes on the Vietnamese site. Answers continue to be selected
locally by the original retrieval engine; visitors' questions are not sent to
the knowledge service.

Successful live knowledge can be cached for 60 seconds, with up to five minutes
of stale content during revalidation. After a 3.5-second upstream timeout,
invalid response, or outage, the relay uses the last synced VN snapshot bundled
with this deployment. Snapshot responses are not cached. ICUE links in both
sources become canonical links with the answer's language. The embedded FAQ
corpus retains the VN review flags excluding variable commercial/legal claims.

## Optional shared history

History remains local until the visitor enables sync. The `chat-history`
function relays the original capability token and encrypted payload to
`https://icue.vn/.netlify/functions/chat-history`. It forwards no cookies or
Supabase keys. It validates methods, token format, caller origin, and payload
size before forwarding; the existing service performs vault authorization and
revision checks. Existing upstream rate limits and encryption remain in use.

Use the same pairing code in the Sync settings on each site to access the same
encrypted vault. Browser storage on `icue.vn` and `en.icue.vn` is separate, so
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

Use Node 22.12 or newer. `npm ci`, `npm ci --prefix home-app`, and `npm run build`
produce the homepage; a normal Netlify deployment also bundles the two functions
and the locale-preserving edge redirect declared in `netlify.toml`. Publishing
only the static `dist-home` directory to another host requires equivalent
handlers for `/chatbot/shared/<locale>` and the history endpoint. Vite dev,
Vite preview, and the optional Express server already use the same handlers.

Validation commands: `npm run test:audit`, `npm run test:recovery`,
`npm run check:production`, and `npm audit` in both dependency trees.

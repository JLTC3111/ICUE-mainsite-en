# Codebase audit — 8 October 2026

Follow-up: all six findings below have been fixed in this working tree. The
original audit evidence is retained here; it describes the code before these
fixes. See the remediation record at the end and [shared chatbot setup](shared-chatbot.md).

Audited commit: `297159e5`. The working tree was clean when the audit started.
This repository owns the English homepage; other sections redirect to apps on
`icue.vn`. The audit covered the active React entry, homepage, shared navigation,
language handling, media and recovery code, build scripts, server configuration,
redirects, published output, and both dependency lockfiles. Retired HTML and
legacy scripts were inspected as compatibility/deployment inputs, not treated
as active production applications. No application fixes or dependency changes
were made during the initial audit.

There are six actionable findings. P1 means address promptly; P2 means a normal
fix is warranted; P3 means a lower-priority correctness fix.

1. **P1 — The development server can serve files outside the project.**

   Location: `vite.config.js:37–42`; the second fallback also constructs file
   candidates from request paths at `vite.config.js:88–105`.

   `publicDevFallback` joins the raw URL suffix onto the public directory and
   reads the resulting file without checking containment or applying Vite's
   filesystem access policy. A request containing parent-directory segments
   therefore escapes the public directory. Any client that can reach this dev
   server can retrieve readable files with an extension outside the repository.

   Confirmed with an HTTP request whose path was preserved literally:

   ```text
   GET /public/../../../../../private/tmp/icue-en-audit-canary.json
   HTTP 200
   {"audit":"public-path-canary-only"}
   ```

   The canary was created expressly for this check. No personal or credential
   file was read. The reproduction succeeded with both the root's installed
   Vite 6.3.2 and home-app's locked/installed Vite 6.4.3. This is a defect in the
   custom middleware, so updating Vite alone does not fix it. These hooks run
   only in development; this reproduction does not demonstrate an exposure in
   the static Netlify deployment.

   Fix: resolve and validate every candidate against its approved root before
   reading it, handle encoded paths and symlink escape, reject denied/dotfiles,
   and avoid a blanket repository-file fallback. Add an HTTP regression that
   requests an outside-root canary and expects denial.

2. **P2 — Opening the desktop drawer can replace the entire page with an error.**

   Location: `shared/drawer-menu/useDrawerResize.js:36–40`.

   Both storage reads in `loadSavedWidth` occur outside a `try/catch`. On a
   viewport of at least 1441 pixels, opening the resizable menu invokes this
   function. If browser policy denies localStorage, its `SecurityError` escapes
   the effect and reaches the app-level recovery boundary. The homepage and
   navigation disappear behind a recovery notice. Retrying and opening the
   menu repeats the failure.

   Confirmed using the actual `DrawerMenuPanel` and recovery boundary with real
   React, a desktop matchMedia environment, and a localStorage implementation
   that throws. No storage read occurred while closed; opening caused one read,
   a `SecurityError`, and removal of the wrapped main content.

   Fix: guard access to the storage object and both reads, use `DEFAULT_WIDTH`
   when storage is unavailable, and retain in-memory resizing. Cover opening
   the actual drawer with denied storage.

3. **P2 — Compatibility redirects discard an explicitly requested language.**

   Locations: `_redirects:71–73`, `server.js:15–16`,
   `home-app/src/lib/bootstrapExternalRedirect.js:152–160`, and their callers in
   both Vite configurations.

   Edge/server destinations hardcode `lang=en`. The client bootstrap wrapper
   can preserve an incoming language, but HTTP redirects occur before that
   wrapper runs. A reader opening an old English-host URL with `lang=ja`,
   `lang=fr`, or another supported language is sent to the English UI.

   Confirmed in the actual Express application over localhost:

   ```text
   GET /contact?lang=ja
   HTTP 301
   Location: https://vi.icue.vn/contact?lang=en
   ```

   The live Netlify deployment returned the same Location on 8 October 2026.
   A live legacy project request with `id=6&lang=ja` preserved project 6 but also
   changed the requested language to English. No project-id loss was observed.

   Fix: preserve and normalize an explicit supported language at every HTTP
   redirect layer, defaulting to English only when there is no valid request.
   Test actual responses for localized direct paths and legacy detail URLs.

4. **P2 — The calendar modal lacks keyboard dismissal and focus management.**

   Location: `shared/contact-sidebar/ContactSidebar.jsx:210–233`.

   The calendar claims `aria-modal="true"`, but opening it does not move focus
   into the dialog, contain keyboard focus, make background controls inert, or
   register Escape dismissal. Keyboard users can keep activating obscured page
   controls while the modal remains open. Closing does not explicitly restore
   focus to the calendar trigger.

   Confirmed with the actual component and real React: after activating Open
   calendar and dispatching an Escape keydown, the dialog remained mounted.
   The focus-management omissions were established by source review; a browser
   focus traversal check was not available in this session.

   Fix: use an accessible dialog implementation or implement initial focus,
   containment, Escape handling, background inertness, and focus restoration.

5. **P2 — Both lockfiles retain dependencies with current security advisories.**

   Locations include `package-lock.json:3593` (`proxy-addr` 2.0.7),
   `package-lock.json:3622` (`qs` 6.15.3), `package-lock.json:4157`
   (`source-map-js` 1.2.1), and `home-app/package-lock.json:1240` and `:1253`
   (baseline-browser-mapping and browserslist).

   `npm audit --json` reported 15 affected package entries in the root tree:
   1 critical, 10 high, and 4 moderate. `npm audit --json --prefix home-app`
   reported 3 entries: 2 high and 1 moderate. These counts include transitive
   effects and overlap between the trees; they are not 18 independent exploits.

   The critical proxy-addr advisory requires a particular IPv6 trust-subnet
   configuration. This server does not configure trust proxy or implement
   IP-based authorization, and Netlify publishes static files. The audited
   configuration therefore does not establish a remotely exploitable critical
   production vulnerability. The maintainer identifies 2.0.8 as the patched
   version. [proxy-addr maintainer advisory](https://github.com/advisories/GHSA-jqcg-44mw-7w3h).

   The qs advisory concerns parsing hostile input and then serializing it with
   `qs.stringify`; that application flow was not found here. Its patched
   version is 6.16.0. [qs maintainer advisory](https://github.com/advisories/GHSA-4mjr-xmp4-gh2g).

   source-map-js has a denial-of-service advisory when consuming malicious
   indexed source maps; 1.2.2 is patched. In this repository the relevant use is
   build tooling, not a public source-map upload endpoint.
   [source-map-js advisory](https://github.com/advisories/GHSA-68fv-2mgg-jv7q).

   Fix: refresh the affected dependencies in both lockfiles, remove unused
   dependencies where appropriate, and rerun the build/recovery checks. Some
   npm suggestions downgrade cpy or nodemon across major versions; investigate
   their dependency chains instead of applying a blanket forced fix.

6. **P3 — Express HEAD requests bypass compatibility redirects.**

   Location: `server.js:146–149`.

   The redirect middleware accepts only GET. For an externally hosted route
   with no local static file, HEAD therefore falls through to the 404 handler.
   Monitoring, link validation, or other HTTP clients using HEAD receive a
   different route result from a normal request.

   Confirmed against the actual Express application: GET `/contact?lang=ja`
   returned a 301 with Location, while HEAD returned 404 without Location.
   This finding concerns the optional Express runtime, not Netlify's edge.

   Fix: apply the redirect decision to both GET and HEAD and test both methods.

Validation completed:

- `npm run test:recovery`: all 37 tests passed.
- `npm run build`: completed; subsequent route and production checks passed.
- `npm run check:production`: passed for six locales, 18 externally hosted page
  identifiers, zero local subpage shells, seven entry assets, and nine JavaScript
  bundles, plus the existing sitemap, redirects, footer, and graphics checks.
- Focused temporary checks reproduced the drawer error, calendar Escape
  omission, Express language/HEAD behavior, and dev path traversal. Existing
  tests were not changed to make these checks pass.
- Read-only live HTTP probes confirmed the Netlify language change. No external
  form submission, authentication change, publishing, or deployment occurred.
- No matches were found for the specific private-key/token patterns scanned in
  nonignored repository files. This is a pattern check, not a comprehensive
  secret-history audit.

Validation limits and follow-up:

The root node_modules directory differs from the lockfile. `npm ls --depth=0`
failed with invalid installed nodemon 2.0.22 (declared ^3.1.14), invalid swiper
11.2.10 (declared ^14.2.0), and several extraneous packages. Root Vite is 6.3.2
versus locked 6.4.3; Express is 4.21.2 versus locked 4.22.2. Home-app has its
locked Vite 6.4.3 installed. Passing checks describe the current installation;
a clean CI installation was not performed. Align the installation with the
lockfiles before relying on local runtime parity with deployment.

Browser controls were retried after the user reported granting browser access.
The tool still returned no available browser surfaces and reported native
Computer Use permissions unavailable. No screenshot was requested or captured.
Browser layout, actual focus traversal, and physical mobile behavior were not
validated in this audit. Reproduced React failures used real components with
mocked browser boundaries, and HTTP findings used real request/response paths.

The supplied route/production checks inspect many strings and output files;
they do not exercise denied storage, modal keyboard interaction, localized HTTP
redirects, HEAD parity, or filesystem containment. Add behavior checks for
those cases when addressing the findings. Address the dev file exposure first,
then the drawer failure, redirect languages, and calendar accessibility.

## Remediation record

- File serving now validates decoded paths and real-path containment, denies
  dotfiles and escaping symlinks, streams files, and restricts the fallback to
  built public output. Actual Vite HTTP tests deny the outside-root canary and
  encoded variants while retaining normal asset, HEAD, and range responses.
- Drawer storage reads now fall back to 340 pixels when access is denied.
  Opening the actual drawer preserves the homepage and recovery boundary.
- Express, both Vite configurations, the client guard, and a Netlify edge
  function use the same locale-aware redirect decision. GET and HEAD retain
  normalized languages and legacy detail IDs; English remains the default.
  The Netlify edge function runs before the compatibility manifest, following
  [Netlify's request order](https://docs.netlify.com/resources/troubleshooting/request-chain/).
- The calendar is portaled outside the app root, receives initial focus,
  contains Tab navigation, dismisses on Escape, makes the background inert,
  and restores prior focus, inertness, and scrolling on close.
- Both lockfiles report zero npm vulnerabilities. Unused cpy/nodemon chains
  were removed; the development server uses Node's watch mode. The qs override
  selects the patched 6.16 series despite Express's restricted dependency
  range. Vite's minimum is now 6.4.3.
- The VN chatbot's original component, motion/effects, bird assets, translations,
  FAQ corpus, and encrypted-history implementation are reused. Live knowledge
  and optional history use the existing icue.vn service. No new mascot or
  Supabase database was created.

Validation after remediation: 53 audit/chatbot tests and all 37 recovery tests
pass (90 total). Both root and home-app lockfiles were installed with `npm ci`
in a clean temporary checkout; `npm ls --depth=0` passed there. The production
build, route audit, production checks, and Node 22 function/edge bundling passed.
Read-only HTTP checks confirmed the live public knowledge endpoint and the
existing history API's authentication requirement. History writes were tested
against controlled fetch responses, not visitors' production vaults.

The checkout tracks 11,431 dependency files despite its ignore rules. Installed
dependency files were kept out of this patch; clean-install validation used a
temporary checkout so it did not produce thousands of vendor-file changes.
Run `npm ci` and `npm ci --prefix home-app` when aligning a local installation.
The new edge/function configuration still requires the normal deployment to
affect the live English site. Browser controls continued to report pending
permissions; no screenshots or physical browser layout verification occurred.

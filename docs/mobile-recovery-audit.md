# English mobile recovery audit

Date: 2026-09-21. Branch: `fix/english-mobile-recovery`.
Baseline: `cec49fe645ab80452c6f1c8bb1eb07db20d382ab`.

## Scope and findings

The English repository serves the homepage. Other sections redirect to `icue.vn`;
its five local translation bundles are imported synchronously. The Vietnamese
newsroom, authentication, forms, API caches, and lazy locale loaders therefore
have no corresponding active English application to patch.

The applicable recovery layer from the Vietnamese main branch was adapted to:

- Retry failed or timed-out page and optional graphics downloads after reconnect,
  background/foreground transitions, page restoration, and an explicit Retry.
  The build supplies emitted chunk URLs so a retry bypasses the browser's cached
  failed ESM fetch. Successful imports retain their identity. Failed bundled CSS
  also retries; replacing only the JavaScript was insufficient in browser QA.
- Keep error recovery inside the failed component; navigation state survives a
  recovered homepage download. An explicit page reload remains available when
  previously deployed assets no longer exist.
- Cancel stale video promises, timers, idle preloads, and event listeners. Failed
  background/title/wordmark video can reload on recovery and retain its position.
  Playback still respects visibility, the viewport, the background-video switch,
  reduced motion, and the existing data-saving checks.
- Rebuild the metallic menu shader/texture after WebGL context restoration, show
  an SVG fallback while unavailable, and retry the optional grid download while
  keeping its CSS fallback. Existing privacy-browser canvas restrictions remain.
- Refresh the clock on resume, retry failed images without changing their URLs,
  and resync music playback state without autoplaying a deliberately paused track.

The sidebar calendar uses the current UI locale for its month, day, time format,
and accessible open/close/dialog labels. It updates when the reader switches
language. Music uses four independently eased SVG bars, tied to actual media
playback, with buffering, pause/end, tab visibility, and reduced-motion handling.
The English music track, media paths, routes, redirects, and publishing
configuration are preserved.

## Validation

- `npm run test:recovery`: 37 source-level regression tests using real React where
  component behavior matters. Covers deadlines, retries, retained sibling state,
  lifecycle cleanup, hidden/offscreen/disabled video, playback position, clock,
  audio pause intent, media URLs, and CSS recovery limits.
- `npm run build`: production build and existing route/production audits pass.
  Audits include six language routes, 18 pages hosted on `icue.vn`, redirect
  ordering, published assets, sitemap, footer copy, and GridScan fallback.
- Production-preview Chrome checks: desktop and iPhone 13 viewport, interrupted
  page JS/CSS, optional grid JS, menu-state preservation, actual WebGL
  context loss/restoration, video position and viewport behavior, video switch,
  reduced motion, independent music/video, Japanese copy, and mobile CSS fallback.
  Normal interaction paths produced no unhandled JavaScript errors. Deliberately
  failed requests produced the expected recovery notices/logs.

Browser tests used a regular user-agent because the existing HTML intentionally
shows a static preview to headless crawlers. Mobile viewport and lifecycle events
were simulated; this audit does not claim a physical iPhone/Safari suspension test.

The three production dynamic imports are declared in `home-app/recoveryChunks.js`.
Add future lazy entry points there to give them the same fresh-URL retry behavior.
The plugin uses this site's existing `/` Vite base. No deployment was performed.

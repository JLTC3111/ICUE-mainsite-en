# English shared component refresh — 2026-10-20

The English repository serves React Home locally. Its other routes redirect to
the shared Vietnamese-hosted apps with an English language selection. Awards,
Structure (including Lanyard), People and Magic Bento therefore receive their
updates in the shared app repository; no retired English HTML pages are revived.

Applied locally:

- Current React Bits Animated Content reveal engine, with subtle Home card
  blur/tilt, the existing snap scroller, scoped cleanup and live reduced motion.
- Line Sidebar falloff and nested-link positioning; animation stops when closed.
- Monochrome Zalo/Messenger artwork and a calendar matching the other icon sizes.
- Music contrast responds to theme attributes, visibility and completed CSS
  background transitions, using CSS colors without canvas readback or video polling.
- Shared hamburger, floating controls, calendar dialog and footer contrast.
- Independent light/dark recovery colors and an early, bounded startup fallback
  that works before the application modules or styles load.

English text, links, route redirects, calendar focus handling and the Home
GridScan renderer are preserved. The Home background itself is unchanged.

Source registry snapshots checked on 2026-10-20:

| Component | Registry | SHA-256 of registry response |
| --- | --- | --- |
| Animated Content | https://reactbits.dev/r/AnimatedContent-JS-CSS.json | `2f07597b8ba28e90251607176d7eabd5fbb508c3876ddfda4bd9606cf70372e9` |
| Line Sidebar | https://reactbits.dev/r/LineSidebar-JS-CSS.json | `9d8877a490ca089b5be70d3a1981d49ab32b7f30a61bedcd0d59e1f867324b1c` |

Adapted from React Bits by David Haz and contributors under
[MIT + Commons Clause](third-party/react-bits-LICENSE.md).

Verification uses source-level React/DOM regression tests, the existing recovery
and audit suites, and the production build/route audit. Browser/GPU visual
inspection was unavailable in this session.

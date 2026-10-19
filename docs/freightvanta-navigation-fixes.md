# Language navigation and runtime fixes — 2026-10-13

Completed the requested switching/error fixes while preserving the existing page designs.

- EN/DE imported topics retain the current route across all six CMS language sites; native localized topic headers expose matching links as well. Selecting the current language avoids a document reload. Browser Back restores the previous topic scroll position.
- German homepage and imported topic navigation expose six service and four industry destinations, with mobile disclosures, Escape/focus restoration and outside-click closing. German and Dutch topic/home language controls are available at narrow widths.
- Moved the native homepage copy updater into an external script. The existing `script-src self` policy stays in force. Added a favicon fallback that yields to the configured CMS favicon.
- Existing FR/ES/IT/NL home compositions are pre-rendered and hydrated instead of replacing a generic text fallback. CMS language URLs are supplied identically to server and client. Anchor routing uses the current language. Consent hydration uses a stable server snapshot; each origin retains its own consent choice.
- Dutch homepage fonts are self-hosted via Fontsource, with license texts under `frontend/reference-template-nl/public/font-licenses` and generated assets. Hero/body font preloads and topic CSS/JS content versions reduce layout movement and stale-cache hydration failures.
- Added immediate navigation progress feedback without delaying links or fetching other language origins. Independent ports/domains still perform normal document navigation. Remote Pexels images retain their original URLs.

Validation:

- Type checks and production/prerender builds passed for topic-template, reference-template and reference-template-nl.
- `.tools/go/bin/go.exe test ./cmd/... ./internal/... ./frontend/...` passed, including new language-route and no-inline-script/full-homepage regression checks. Spanish homepage copy verification now accepts text split by its existing highlighted span.
- 24 desktop/mobile homepage and sourcing-page captures across six languages recorded no JavaScript/console errors. Eight language clicks, current-language no-op, Back scroll restoration and four homes with JavaScript disabled passed.
- The broad scan found one existing long German industry title overflowing at 320px; automatic hyphenation/wrapping fixed it. Targeted confirmation at 320/390/1120/1440px passed, including service links and outside-click industry-menu closure. Historical scan failures remain in verification.json; finalConfirmation records their resolution.
- Local first contentful paint during the final broad scan ranged from 420 to 744 ms. These are local observations, not production speed guarantees.

Artifacts: `output/navigation-review/verification.json`, `after.json`, screenshots and `8082-home-320-confirmation.png`. Local review was performed directly; prior skill reviewer task delivery was unavailable in this conversation.

## German dropdown refinement

Following the user's screenshot feedback, the desktop service/industry panel is now limited to 880px and uses two columns, restrained separators, clearer titles, SVG link arrows and a highlighted current topic. German homepage and topic panels share the same styling. Existing copy, routes, fonts and palette are preserved. Escape now closes a nested mobile disclosure before closing the entire mobile navigation.

Typecheck/build and existing Go navigation/topic tests passed. Browser review covers German home, sourcing and packaging at desktop/intermediate/mobile widths, six service/four industry links, focus restoration, topic navigation, console errors and overflow. Captures/report: `output/menu-polish`.

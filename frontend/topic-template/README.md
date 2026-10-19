# FreightVanta English/German topic templates

Imported from `freightvanta-english-homepage-development (18).zip`, supplied by the user. Scope: all 10 English and 10 German topic pages. The original topic content, compositions, photos and responsive variants are retained. The ZIP's `.env` is excluded.

## Build

```powershell
cd frontend/topic-template
npm ci
npm run typecheck
npm run build
```

The build generates external CSS/JS, fonts and 20 prerendered HTML bodies, then copies them to `frontend/assets/freightvanta-topic-v18`. Rebuild the Go executable afterward because frontend assets are embedded. `src/prerender.tsx` generates the page manifest; `src/TopicApp.tsx` selects the English or German source records.

## CMS integration

`internal/httpserver/imported_topics.go` renders the package on the `global` and `germany` sites, including public domains, local language ports and `/preview/{site}` routes. The imported topics override the Germany site's Atlas theme for these routes. Other pages still use their existing templates.

The server owns canonical URLs, hreflang, robots, structured data and a site-bound enquiry token. English/German topic bodies are present before JavaScript loads; React hydrates the same markup. `src/lib/cms.ts` adapts the supplied links to independent site URLs and existing CMS homepage sections.

Enquiries POST JSON to `/topic-enquiry` or `/preview/{site}/topic-enquiry`. Valid enquiries are encrypted and stored in the existing CMS form submissions. The built-in `topic-enquiry` form is created on the first valid submission. Disabling an existing form remains effective. The reference-file control sends filenames, sizes and MIME types only; it does not upload file contents, and its UI states that explicitly.

## Assets and provenance

Local JPEGs under `public/images` are unchanged user-supplied ZIP assets. `src/content/media.ts` retains the original Pexels photo IDs, responsive URLs and fallback IDs. No new raster images were generated. Some images therefore require access to Pexels.

IBM Plex Sans, Serif and Mono and Barlow Semi Condensed are served locally through Fontsource. Their license texts are retained in `public/font-licenses` and the shipped assets. The fallback SVG favicons reproduce the original English/German vector logo geometry.

## Verification

`internal/app/imported_topics_test.go` covers all 20 topics on public, generic-preview and local handlers, including Germany's installed Atlas binding and regional locale. It also verifies enquiry validation, site-token isolation, encrypted persistence and duplicate rejection against temporary databases.

`review.mjs` records desktop/mobile screenshots and compares sourcing/packaging with the supplied template. `interactions.mjs` checks mobile navigation, FAQ, validation and submission feedback with an intercepted response. `recapture-tall.mjs` tiles the two mobile sourcing captures whose height exceeds Chromium's texture limit.

Final captures and reports: `output/topic18-review`. Delivery index and limitations: `docs/freightvanta-topic-v18-delivery.md`. The local finish review replaced failed agent message delivery; see `docs/freightvanta-topic-v18-review.md`.

## Scope limits

This import does not create the ZIP's unrelated homepage, legal-policy, newsroom or demo article pages. Existing CMS guides and homepage sections receive corresponding links. Privacy, cookies, terms, Impressum and Datenschutz destinations need actual published CMS pages or configured policy URLs. French, Spanish, Italian and Dutch topics are not replicated in this change.

## Language navigation update (2026-10-13)

`languageHref` retains the topic route for all six enabled CMS language sites. German desktop and mobile navigation now expose six service and four industry destinations. Shared external `public-navigation.js` controls native disclosures, Escape, outside clicks and document navigation feedback; normal browser links and modified clicks remain native. CMS topic pages retain automatic browser scroll restoration. The topic manifest versions CSS/JS using content hashes to avoid stale assets after an embedded server rebuild.

`verify-navigation.mjs` checks desktop/mobile rendering, actual language clicks, current-language no-op, Back scroll restoration and four JavaScript-disabled pre-rendered homepages. `confirm-navigation.mjs` records the targeted narrow-screen and German industry-menu confirmation. Reports: `output/navigation-review`.

# Multilingual editorial archives and reading pages

Request: improve all column/index pages and content pages in the other languages as well, using the English guide listing screenshot as the problem example. Existing user instruction: retain supplied copy and each market's established identity.

Mode: Read. Local extension of the established FreightVanta public editorial system; no replacement identity, generated imagery, or commercial copy rewrite.

THESIS: help a visitor find a useful guide, read it comfortably, and reach the appropriate enquiry form.
OWN-WORLD: existing local fonts and palette: English Plex/Barlow, German Plex/Plex Serif, French Source Sans/Source Serif, Spanish Archivo, Italian Manrope/Bodoni, Dutch Plex/Archivo Black. White reading field; existing market paper and action colors.
STORY: localized title and introduction, real category filters, one lead entry, remaining entries in editorial rows, existing subscription form, shipment preparation and enquiry. Detail pages retain title, summary, dates, body, directory and adjacent published content.
FIRST VIEWPORT: a clear reading-library title and introduction, with category choices and the lead story immediately below. Long German/French article titles use the available width before the summary.
FORM: semantic server-rendered links, real query filters and 12-entry pagination. Shared templates across six languages, local type and color. Native anchors and links work without client-side routing.

## Implementation boundaries

- No CMS records, publication statuses, uploaded media, source copy or original images changed.
- Index aliases /guides, /articles and /insights share the new library. Category and tag archives share the same editorial shell.
- Guide listing uses a dedicated public article/product query, independent of the six-entry homepage fallback. Count, filter choices and pages share public visibility rules. Bodies are available for consistent reading-time estimates; cover media URLs use the public-media boundary.
- A feature appears only on page one and is not repeated in the remaining list. Unknown subjects have a text layout when no cover exists. The three existing English service briefs use their existing subject-specific logistics plates in the library; their CMS media is retained.
- Other-language reading pages use the shared directory, localized enquiry and same-site/locale/type neighbor rules. Disabled languages, drafts, future scheduling and deleted entries remain excluded.
- Subscription forms retain the existing receiver, form-token context, loading/result messages and local email labels. No browser form was submitted during visual checks.
- Empty languages are rendered truthfully: ES/IT/NL currently have no published articles. No placeholder articles, fabricated reading time or translated content was published.

## Verification

`go test ./internal/... ./cmd/... ./frontend` passed. New catalog tests cover more than 12 entries, non-overlapping pages, category filtering, drafts, scheduling, deletion, disabled languages and utility-page exclusion. New app tests create temporary entries in all six markets and cover localized empty/list/category/detail pages, headings, enquiry anchors and both neighbor directions. The existing homepage/subscription/inbox workflow test passes. Final targeted app/catalog/httpserver tests passed after the correction batch.

One Impeccable CSS detector pass on editorial-common.css and editorial-index.css returned `[]`.

Screenshots and browser observations are saved under `.impeccable/review/editorial-suite/`. Desktop and mobile observations cover all six markets and all seven published entries. Capture limitations: the `*-guides-1440.jpg` files are viewport captures, not full documents; earlier mobile captures precede the final CTA spacing correction and English lead-image replacement. `user-491-final.jpg` is the final valid full-page capture, and `final-preview.jpg` is the final normal viewport. `en-guides-mobile-viewport.jpg` is malformed and excluded from evidence. Closed lazy-loaded gallery images are not classified as broken visible images.

The final read-only route audit passed 46 actual URLs: 18 index aliases, 21 category/tag archives and seven content pages. All seven normalized article bodies match the CMS originals. Final asset versions are editorial-common/editorial-index `20261015.2` and article-reading `20261015.1`.

## Finish review

Two fresh reviewer handoffs and one documenter handoff failed to receive their task packets, returning requests for a task instead of a review. An inline degraded review and documentation pass substituted; this is not an independent reviewer approval.

Disposition: ship at the inspected extension scope, with the screenshot freshness limits above.

- persistence: PRODUCT.md and the surface brief exist. This is a local extension; no new world or comp approval is required. Global design files are preserved.
- fidelity: TYPE matches the inherited local font families; MATERIAL uses existing logistics plates or honest text layouts; GROUND inherits country surfaces with a white reading field. Featured entry, editorial rows, localized empty states and enquiry close match the contract. Content bodies are unchanged.
- ceiling: deliberate reading hierarchy and restrained editorial rows suit the Read task. No additional decorative effects are needed for this extension.
- material_fixes: none identified in the inspected extension. Original unrelated CMS gallery screenshots remain a content-quality limitation, outside this layout change.
- keep: retain real public visibility rules, country identity, original copy, useful reading navigation and actual local enquiry destinations.

## Documentation outcome

Checked PRODUCT.md, DESIGN.md, editorial.html, editorial-common.css, editorial-index.css and the route audit. Only this surface brief changed during documentation.

- Palette: inherited market colors, white reading field, market action color and enquiry section.
- Type: existing local display/body pairs; masthead clamp 2.5–4rem; list titles 1.5–1.9rem; body 16–18px.
- Layout: one lead entry followed by editorial rows; single column below 700px; no repeated lead on page two.
- Components: real topic links, 44px reading links, pagination, labelled newsletter input and local enquiry link.
- States: truthful localized empty states, visible focus, subscription loading/result handling and reduced-motion support.

Not canonized or repaired: incumbent admin-seed DESIGN.md drift and unrelated original CMS gallery media. Neither belongs to the approved scope of the multilingual editorial extension.

## Documentation boundary

Ordinary extension: preserve DESIGN.md and .impeccable/design.json. The incumbent DESIGN.md is still an admin seed; this pre-existing drift is reported here without rewriting it. Page-specific reading typography is recorded in this brief and the scoped stylesheets, not promoted into unrelated admin design rules.

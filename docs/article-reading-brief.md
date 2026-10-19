# Article reading experience

Request: redesign the content page at /temperature-controlled-cargo-planning, provide an enquiry path and real previous/next content beneath the article.

Mode: Read. This is an extension of the existing public editorial template, retaining each country's established palette, navigation, source content, dates and media. No new visual identity or generated asset is required.

Direction contract: THESIS — an article should lead with its subject and help the reader take the next useful step. OWN-WORLD — FreightVanta typography, white space, market colors and restrained rules. STORY — title and summary, visible contents, readable body, enquiry preparation, adjacent published articles. FIRST VIEWPORT — breadcrumb, title, summary and publication facts, with body entering immediately below. FORM — shared Go template and semantic HTML, progressive enhancement only. FINISH — bounded desktop/mobile verification, fresh finish review and documentation comparison with the incumbent system.

Implementation boundaries: preserve CMS data; move existing product galleries below the body into an expandable area; retain inline media. Previous means immediately older, next means immediately newer, ordered by publication timestamp and ID within the same site, locale and content type. Do not wrap at the ends or expose drafts, scheduled, deleted or disabled content. Consultation links target the real localized homepage enquiry section. Utility/contact pages keep their existing template.

Validation: Go project package tests passed (`go test ./internal/... ./cmd/... ./frontend`), with targeted packages rerun after the final enquiry anchor adjustment. Outline tests preserve existing heading IDs, media and links; neighbor tests cover date ties, content types, drafts, future scheduling, deletion, disabled language and end boundaries. CSS detector returned no findings and the enhancement script passed syntax checking.

Browser evidence: desktop 1440×1000, mobile 390×844 and the user's 491×672 viewport. Screenshots under `.impeccable/review/article-reading/`: desktop.jpg, mobile.jpg, user-491.jpg. The browser fullPage capture omitted a scrollbar-width strip during capture; final evidence uses explicit full-document clip dimensions. No code changes were needed for this capture issue. Document width was no wider than its viewport. One H1, no console errors. Table of contents opens on mobile and jumps to a real server-rendered heading. Customs Documentation Support links both backward to Express Freight Coordination and forward to Temperature-Controlled Cargo Planning. The temperature entry is currently newest in its content type, so it legitimately has only a previous entry. The enquiry CTA opens the English homepage's real #enquiry form without submitting data.

## Finish review

disposition: ship

Substitution: two fresh reviewer handoffs returned empty-task responses; the final evidence and implementation were reviewed inline using the degraded finish-reviewer contract. This is a local extension, with no approved comp, quality-bar card or concept seed required.

### persistence

Pass for this extension: PRODUCT.md and the scoped brief exist. Existing DESIGN.md describes the admin system and retains a pre-existing seed marker; it is not authoritative for the public site's editorial composition. Incumbent public template and market variables provide the visual authority. No system files were rewritten.

### fidelity

| Element | Verdict | Evidence |
| --- | --- | --- |
| Type | Match | Existing site font inherited; body 18px/17px and 70ch measure; clear title and section hierarchy. |
| Material | Match | Flat editorial rules and existing imagery; no simulated physical materials or added image assets. |
| Ground | Match | White page field and inherited market brand color; visible in all three captures. |
| Reading order | Match | Title, summary, publication information, body, guidance, adjacent content. |
| Mobile contents | Adaptation | Collapsible directory before the body replaces the desktop sidebar to preserve readable width. |
| Guidance | Match | Sidebar and body links lead to the lower preparation block; its primary action opens the real enquiry form. |
| Adjacent entries | Adaptation | Missing next entry omitted for the newest item; live middle entry demonstrated both directions. |
| Media placement | Adaptation | Existing product gallery moved after body and collapsed; inline media retained under the preservation boundary. |

### ceiling

Reached for the scoped reading extension: readable column, desktop wayfinding, mobile collapse, restrained section separation and a concrete enquiry path. No decorative motion is needed for this reading task.

### material_fixes

None within this implementation scope. Existing inline and gallery screenshots are unrelated to the cargo subject; flag for an editorial asset replacement rather than silently deleting user media.

### keep

Preserve CMS copy and media, localized colors and labels, native anchors, and same-site/same-language published-only navigation.

## Documentation comparison

The documenter handoff and one follow-up also returned empty-task responses, so the documentation comparison was completed inline. Checked PRODUCT.md, DESIGN.md, public.html, article-reading.css, article-reading.js, reading.go and content_neighbors.go. Write boundary: this brief only; DESIGN.md and .impeccable/design.json preserved.

- Palette: inherited --surface, --ink, --ink-soft, --brand and --brand-dark; no new global color system.
- Type: inherited font family; fluid title up to 4.5rem; body 18px desktop / 17px mobile at 1.85 line-height.
- Layout: body plus sidebar above 960px, one column below, 600px phone adjustments.
- Components: semantic contents details, optional gallery details, enquiry preparation block, previous/next links.
- Rules: visible keyboard focus, native server-rendered links, no navigation wrapping, no unpublished neighbors.

Pre-existing drift not repaired or canonized: DESIGN.md is still an admin seed rather than an extracted public-site system; unrelated uploaded media remains source content, not a recommended visual pattern.

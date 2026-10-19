# French topic delivery — 2026-10-14

The user supplied French copy and requested design/layout for all six service and four industry topics. The implementation extends the actual French Atelier Maritime homepage. Preview runs at `http://localhost:8083`; generic CMS previews use `/preview/france`.

## Pages

| Kind | Path | French label |
| --- | --- | --- |
| Service | `/product-sourcing` | Sourcing en Chine |
| Service | `/services/bulk-procurement` | Achat en volume depuis la Chine |
| Service | `/services/packaging-branding` | Emballage et image de marque |
| Service | `/services/inventory-storage` | Stockage et libération des stocks |
| Service | `/services/private-white-label` | Marque propre et marque blanche |
| Service | `/services/worldwide-fulfillment` | Préparation de commandes |
| Industry | `/industries/cross-border-ecommerce` | E-commerce transfrontalier |
| Industry | `/industries/consumer-goods` | Biens de consommation |
| Industry | `/industries/industrial-components` | Composants industriels |
| Industry | `/industries/time-critical-cargo` | Fret urgent |

## Copy and layout

Source snapshot: `docs/freightvanta-fr-topic-copy-source.md`. Importer: `frontend/topic-template/import-fr-copy.py`. Nine attached pages supply complete SEO title/meta/H1/lead/body and 54 FAQ pairs. Sourcing preserves its existing complete French body and four FAQs, applying the attachment's secondary CTA wording. The source audit verified 408 supplied phrases against actual static HTML with no omissions; all 58 FAQ pairs match visible content and schema. Production/CMS/image notes remain in the source document.

The pages use readable complete headings, equal desktop introduction/photo columns, a process rail, same-page navigation, decision splits, scenario ledgers, numbered workflows, dark scope sections, preparation/model lists, native FAQs, related topics and a French enquiry form. Phones place the full introduction and actions before photography. Source business wording and confirmation boundaries remain intact.

Homepage and topic menus expose six services and four sectors. Native links support both country-site roots and generic preview mounts. Language switching preserves the current topic. Nested Escape closes a submenu before mobile navigation. Accueil returns to the French homepage; the final review corrected an inherited Spanish breadcrumb target.

Form labels, validation, consent, loading/error/success text and file controls are French. The form uses the real CMS endpoint/token. Reference files transmit filenames only, with that limitation stated beside the control. The browser success check intercepts its request; real encrypted enquiry persistence and locale are verified in isolated backend tests, without inserting review requests into the user's live database.

## Verification evidence

- Frontend typechecks and production builds passed. The topic build prerenders 40 EN/DE/ES/FR pages.
- Go build and `go test ./cmd/... ./internal/... ./frontend/...` passed after the final breadcrumb correction. Coverage includes French routes, route-preserving language destinations, enquiry persistence and cross-site token rejection.
- `output/fr-topics/copy-audit.json`: ten pages, 408 phrases, 58 FAQ pairs, no reported missing source phrases.
- `output/fr-topics/browser-review.json`: twenty topic cases at 1440/390px, 320px overflow checks, metadata/schema/visible-copy agreement, decoded images, working FAQ and focused anchors below the sticky header. Desktop/mobile homepage-to-topic and German transitions, six French empty-form errors, successful intercepted submission and file selection/removal passed. All ten topics render their headings and FAQs with JavaScript disabled.
- `output/fr-topics/regression.json`: English, German and Spanish packaging pages retain their fonts and headings at desktop/mobile widths, with no overflow or recorded errors; France generic preview navigation succeeds.
- `frontend/topic-template/review-fr-breadcrumb.mjs` and `output/fr-topics/breadcrumb-review.json` provide the targeted final correction evidence. The script checks all ten topics at both widths plus both preview-width cases, clicks back to the French homepage, checks German destinations retain the route, and refreshes the required packaging hero captures.

Functional checks use the production CSP. The initial screenshot-only inline-style fixture produced CSP warnings; these are retained separately as `captureFixtureWarnings`, with the reason in `captureNote`. Clean representative body captures use a dedicated screenshot-only context to prevent the sticky header covering a section. Production CSP was unchanged.

Existing bundle-size and reference-template VITE_SITE_URL notices remain. No commit or push was requested or performed.

## Design documentation pass

System files: **No changes**. This is an ordinary extension of an existing identity. Preserve root `DESIGN.md` / its sidecar (CMS administration) and `frontend/topic-template/DESIGN.md` (existing EN/DE/ES topic decisions). Sources checked: `src/fr-topics.css`, `FrenchTopicPage.tsx`, `FrenchTopicChrome.tsx`, the shared enquiry implementation, reference-template French tokens and final/homepage screenshots. The surface brief is `docs/freightvanta-fr-topics-brief.md`.

1. Palette: ivory `#f9f6ef`, linen `#f3eee3`, ink `#1c1f27`, muted `#4e5464`, ultramarine `#17369a`, sienna `#b45a24`, hover `#9a4a1c`, fine border `#ddd3bf`.
2. Type: local Source Serif 4 display at weight 600 and Source Sans 3 body; H1 2.1–3.25rem/1.17, H2 1.8–2.3rem/1.22, body 16–17px/1.75.
3. Layout: shared shell, equal hero columns, 4:6 content splits, 52–78px section rhythm; phone content/actions precede imagery.
4. Shapes and depth: round primary controls, 12px photographic corners, fine rules/tonal fields; menu shadows are soft, form frame has no shadow.
5. Behavior: native disclosures, visible keyboard focus, sticky-header anchor offsets, meaningful workflow numbering, themed selection/caret/scrollbar, reduced-motion support and real localized form states.

Not canonized or repaired: topic DESIGN.md's pre-existing omission of the incumbent French identity and the independent review/documentation dispatch failure. The French evidence is recorded here; unrelated design-system files are preserved. No newly invented kickers, claims or decorative physical effects are promoted into rules.

Independent reviewer dispatch and its retry delivered empty task payloads. Review was replaced with the skill's in-thread degraded finish-reviewer contract; this is not independent approval. The review and targeted verdict are recorded in `docs/freightvanta-fr-topics-review.md`.

## Media provenance

Reuse the original topic package's `src/content/media.ts` registry and asset/license records. Local service images are explicitly marked as generated in that registry and retain Pexels fallbacks. Fulfillment/ecommerce use stock photo 4483862; consumer goods 6958455; industrial components 28752152; urgent cargo 36194618. These are illustrative topic images, not proof of company-owned facilities. No new raster images were generated for the French extension.

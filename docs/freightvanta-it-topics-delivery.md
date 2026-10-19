# Italian topic delivery — 2026-10-14

All six service and four industry topics now use the supplied Italian copy and the running Italian homepage's Grafica Italiana identity. Preview: `http://localhost:8085`; generic CMS preview: `/preview/italy`.

## Pages

| Kind | Path | Italian label |
| --- | --- | --- |
| Service | `/product-sourcing` | Ricerca fornitori in Cina |
| Service | `/services/bulk-procurement` | Acquisto all'ingrosso in Cina |
| Service | `/services/packaging-branding` | Imballaggio e immagine di marca |
| Service | `/services/inventory-storage` | Stoccaggio e rilascio delle scorte |
| Service | `/services/private-white-label` | Marca privata e white label |
| Service | `/services/worldwide-fulfillment` | Preparazione degli ordini |
| Industry | `/industries/cross-border-ecommerce` | E-commerce transfrontaliero |
| Industry | `/industries/consumer-goods` | Beni di consumo |
| Industry | `/industries/industrial-components` | Componenti industriali |
| Industry | `/industries/time-critical-cargo` | Spedizione urgente |

## Copy and interface

Source snapshot: `docs/freightvanta-it-topic-copy-source.md`. Repeatable importer: `frontend/topic-template/import-it-copy.py`. Nine complete supplied pages preserve their SEO title/meta/keywords/H1/lead/body, approval boundaries, preparation and54 FAQs. Sourcing retains its existing complete Italian body and4 FAQs, as the attachment requests. `audit-it-copy.py` verifies483 source/content phrases and58 FAQ pairs against actual prerendered HTML. CMS/image-production guidance stays in the source document rather than becoming visitor copy.

The readable topic-family layout uses full Bodoni headings, equal desktop text/photo columns, process rail, same-page navigation, split decision sections, scenario ledgers, meaningful numbered workflows, dark scope fields, preparation/model lists, native FAQ, related services/sectors and enquiry. Phones place the complete introduction and actions before photography. Italian actions and image frames remain square; the brand wordmark uses bold Manrope matching the homepage.

Homepage and topic menus expose6 services and4 sectors. New homepage topic links are native anchors including mobile menus and footer; root and generic-preview base paths are preserved. Topic language selection keeps the current route. Breadcrumb and brand mark return to Italy. Nested Escape closes a submenu before mobile navigation.

Form labels/validation/consent/loading/error/success and file selection/removal/error text are Italian. The form uses the real CMS endpoint/token. Reference files transmit filename metadata only, with an explicit hint. Empty topic-context fields are hidden for Italian pages. The browser success review intercepts submission; isolated backend tests verify actual encrypted persistence and it-IT locale without inserting review enquiries in the live database.

## Verification

- Both frontend typechecks and production builds pass.50 EN/DE/ES/FR/IT topic pages prerender.
- Go build and `go test ./cmd/... ./internal/... ./frontend/...` pass, including all10 Italian routes on local/generic/public-domain hosts, language preservation, encrypted enquiry persistence and cross-site token rejection.
- `output/it-topics/copy-audit.json`:10 pages,483 phrases,58 FAQ pairs; no missing source/content phrases.
- `output/it-topics/browser-review.json`:20 cases at1440/390px, with320px overflow checks; matching metadata/FAQ schema, decoded imagery, native FAQ, anchor focus below the sticky header, correct home/logo URLs and visible red submit actions. Desktop/mobile homepage-to-packaging and French route-preserving switching, generic-preview home navigation and nested Escape pass. Empty form displays6 Italian errors; invalid attachment feedback, PDF selection/removal and intercepted success pass. All10 pages render headings/FAQs without JavaScript.
- `output/it-topics/regression.json`:8 English/German/French/Spanish packaging cases preserve their headings/fonts, with no horizontal overflow or recorded page errors.
- `output/it-topics/confirmation.json`: targeted final wordmark correction evidence;20 refreshed hero captures with Manrope logo, Bodoni headings, correct Italy home links and no overflow. Required review images: `.impeccable/review/it/desktop.png`, `mobile.png`.

Functional checks retain production CSP. Representative body screenshots use a separate capture-only context with a static header to prevent sticky navigation covering section content. The initial browser script's image-decode check raced one remote stock load; it resumed the unfinished case with a load wait. No image or production CSP change was needed.

Existing frontend bundle-size and VITE_SITE_URL notices remain. No commit or push was requested or performed.

## Design documentation pass

System files: **No changes**. This ordinary extension preserves root CMS DESIGN.md/sidecar and existing EN/DE/ES topic DESIGN.md. Sources checked: Italian scoped CSS, topic chrome/page/shared form, homepage Italian tokens and final/homepage screenshots. Current French/Italian values are omitted by the older topic DESIGN; that pre-existing drift is recorded here without repairing unrelated design-system files.

1. Palette: white `#ffffff`, fog `#f8f8f7`/`#f1f1ef`, graphite `#1b1c1d`, muted `#4d5155`, fine lines `#d0d4d7`, petrol `#0a5866`, red `#c02620` and hover `#a51f1a`.
2. Type: local Bodoni Moda600 display, Manrope400/600/700 body/controls/wordmark; H1 2.1–3.25rem/1.17, H2 1.8–2.3rem/1.22, body16–17px/1.75.
3. Layout: shared shell; equal hero columns,4:6 decision/enquiry splits,52–78px section rhythm; phone single-column reflow with text/actions first.
4. Components: square buttons/photo frames, quiet tonal sections, fine separators, meaningful workflow numbers, native FAQs and scoped form accents; soft menu shadow only.
5. Rules: preserve supplied confirmation boundaries; use native topic links and real CMS submissions; theme keyboard focus/selection/caret/scrollbar; retain reduced-motion support.

Not canonized or repaired: older topic DESIGN's omission of Italian homepage values. The single detector reports only those undocumented incumbent fonts/colors. No new decorative kickers, artificial counters, claims or simulated physical effects become system rules.

Independent finish-reviewer dispatch and retry failed to receive task content. The skill's degraded in-thread review substitutes for it; the review and scoped final fix verdict are in `docs/freightvanta-it-topics-review.md`. Independent documenter dispatch has the same limitation; this evidence-based documentation pass is performed in-thread.

## Media provenance

Reuse the original topic media registry and asset/license records. Local service imagery is explicitly marked as generated; registry Pexels fallbacks remain. Fulfillment/ecommerce use stock4483862, consumer goods6958455, industrial components28752152 and urgent cargo36194618. These are illustrative topic images, not evidence of company-owned facilities. No new raster imagery was generated for this extension.

# Spanish topic delivery — 2026-10-13

The user supplied Spanish copy and requested page design/layout. All six service topics and four industry topics now use the live Spanish homepage's Archivo, paper/sand, pine and red ochre identity. English/German retain their existing compositions. The source snapshot is `freightvanta-es-topic-copy-source.md`; `frontend/topic-template/import-es-copy.py` imports the content and Spanish homepage menu records.

## Pages

The local Spanish site runs at `http://localhost:8084`. Public country hosts use these same paths; generic preview mounts them under `/preview/spain`.

| Kind | Path | Spanish label |
| --- | --- | --- |
| Service | `/product-sourcing` | Sourcing de productos en China |
| Service | `/services/bulk-procurement` | Compra al por mayor en China |
| Service | `/services/packaging-branding` | Embalaje e imagen de marca |
| Service | `/services/inventory-storage` | Almacenaje y liberación de stock |
| Service | `/services/private-white-label` | Marca propia y marca blanca |
| Service | `/services/worldwide-fulfillment` | Preparación de pedidos |
| Industry | `/industries/cross-border-ecommerce` | Comercio electrónico transfronterizo |
| Industry | `/industries/consumer-goods` | Bienes de consumo |
| Industry | `/industries/industrial-components` | Componentes industriales |
| Industry | `/industries/time-critical-cargo` | Carga urgente |

## Content and layout

Nine pages preserve the supplied SEO title, description, H1, lead, body sections, preparation requirements, confirmation boundaries and 54 FAQ pairs. Sourcing keeps the existing complete Spanish page copy and its four FAQs because the attachment explicitly references that implementation. A normalized source audit verified 421 supplied body phrases, and the content fields were checked against the generated static HTML. Results: `output/es-topics/copy-audit.json`.

The layout presents full headings, introduction/actions with photography, a process rail, same-page navigation, split decision sections, scenario ledgers, numbered workflows, pine scope sections, preparation/model lists, native FAQ, related services/sectors and a Spanish enquiry form. Phones stack text/actions before images. The homepage and topic menus expose all ten pages. Topic destinations use native links on desktop and in the dynamically rendered mobile homepage menu; placeholder replacement preserves root and preview bases without creating a protocol-relative domain.

SEO metadata, canonical/hreflang, breadcrumb/FAQ schema and enquiry tokens remain server-owned. FAQ schema text matches the visible answers. Production notes, CMS field names and image briefs stay in the source document. The enquiry form uses the real CMS endpoint, Spanish validation and feedback, and filename-only reference attachments.

## Verification

- Both frontend TypeScript checks and production builds passed; 30 EN/DE/ES topic pages are prerendered.
- `go test ./cmd/... ./internal/... ./frontend/...` passed. Coverage includes ten Spanish routes on public/local/generic-preview hosts, route-preserving language links, encrypted Spanish enquiry persistence, cross-site token rejection and root/preview homepage link regression.
- Twenty browser cases cover every Spanish page at 1440px and 390px. All titles/meta/H1 match, all 58 FAQs match schema, images decode, FAQ opens, anchors/primary CTA focus their visible target, and 320px checks show no horizontal overflow. No recorded page errors, console errors or failed HTTP responses. Evidence: `output/es-topics/browser-review.json` and its screenshots.
- Desktop/mobile homepage → packaging → German transitions succeeded and retained the topic path. Nested Escape preserved mobile navigation. Empty-form submission displayed six Spanish field errors. An intercepted successful submission carried locale `es`, packaging route/prefill and a CMS token, then showed the Spanish success message. No UI review submission was written to the user's live database; isolated backend tests verify actual persistence.
- JavaScript-disabled checks rendered all ten pages and FAQ content. Confirmation captures checked EN/DE/ES packaging at both widths, preserving their respective fonts with no overflow/runtime errors; generic preview homepage → topic also succeeded. Evidence: `output/es-topics/confirmation.json` and `confirmed-packaging-*.png`.

Build output retains the existing bundle-size and reference-template `VITE_SITE_URL` notices. SEO for the running site comes from the CMS. No commit or push was requested or performed.

## Media provenance

Reuse the supplied topic package's `src/content/media.ts` registry without adding new image assets. Five service heroes use its existing local assets (`service-product-sourcing.jpg`, `service-warehousing.jpg`, `service-packaging.jpg`, `service-private-label.jpg`); the registry labels these entries as generated and retains Pexels fallbacks. Fulfillment/ecommerce use stock photo 4483862; consumer goods 6958455; industrial components 28752152; urgent cargo 36194618. These are illustrative topic images, not evidence of FreightVanta-owned facilities or guaranteed capabilities. Preserve the package's asset/license records.

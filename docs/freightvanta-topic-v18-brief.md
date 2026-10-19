# FreightVanta ZIP v18 topic integration

Scope: reproduce the supplied English and German topic pages in CZCMS, 10 topics per language. Visitor mode: Persuade. The user's confirmed answer is to reproduce all English and German topics from the package first. Other languages and the existing homepages are outside this change.

## German refinement authorised on 2026-10-13

The user supplied the German copy document and requested a further improvement to topic appearance and layout. This authorises a narrow refinement of all 10 German pages after the original reproduction. Preserve all business copy, section order, photographs, IBM Plex typography and paper/graphite/brick/petrol identity. English topic compositions remain unchanged.

For this revision, the exact-composition constraints below describe the original reproduction, not the new German spacing rules. Improve long-title wrapping, hero text/photo balance, section rhythm, workflow and FAQ typography, scope semantics, related-service links and enquiry framing. Add accessible same-page navigation. SEO fields belong in metadata; CMS and production notes remain documentation. Record copy audit and final review in `freightvanta-de-topic-refinement.md` and `output/de-topic-refinement`.

## Direction contract

THESIS: preserve the exact source compositions and copy from `freightvanta-english-homepage-development (18).zip`; replace the previously inconsistent topic rendering with the supplied React templates.

OWN-WORLD: English uses navy, signal orange, Barlow Semi Condensed and IBM Plex Sans/Mono; German uses paper, graphite, brick red, petrol, and IBM Plex Serif/Sans/Mono. Existing grids, labels, photographs, tables and section order are user-pinned source design.

STORY: buyers assess sourcing, procurement, packaging, inventory, branding, fulfillment or an industry-specific handoff, read scope and FAQ, and send a topic-aware enquiry.

FIRST VIEWPORT: use the original hero composition for each topic and language, including the source wordmarks, line breaks, picture crop and primary action. Desktop 1440 x 1000 and mobile 390 x 844 captures compare with a runnable copy of the supplied ZIP.

FORM: exact source reproduction, no concept roll or new art direction. The supplied template is the visual authority. Adapt only CMS URLs, local assets/fonts, SSR metadata and a real enquiry endpoint. Reference files send names and metadata only, explicitly described in the UI.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Evidence and constraints

- Source: `frontend/topic-template`; output: `frontend/assets/freightvanta-topic-v18`.
- Final browser packet: `output/topic18-review/report.json`, 40 actual desktop/mobile captures; original reference captures for product sourcing and packaging in both languages.
- Interaction evidence: `output/topic18-review/interactions.json`; menus, FAQ, validation and intercepted submission feedback. Backend persistence, site isolation and encrypted values are covered by Go integration tests against a temporary database.
- One detector warning concerned the original form error summary's `border-l-4`; the user's instruction to preserve the supplied design takes precedence.
- The root DESIGN.md describes the CMS admin, which is outside this public-topic surface. Document source typography and tokens within the imported template boundary; preserve the admin design files.
- Stock pictures remain the supplied Pexels URLs. Imported JPEG files retain the package's provenance; they are not newly generated.

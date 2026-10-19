disposition: fix

Review substitution: independent agent dispatch and its retry delivered empty task payloads. This is an in-thread review using the Impeccable degraded finish-reviewer contract, not independent approval.

## persistence

PRODUCT.md and the French surface brief exist. This is a code-led extension of the running French homepage; no comp, concept tournament or build-phase gate applies. The topic DESIGN.md records EN/DE/ES and omits the incumbent French identity. That documentation drift predates this extension; preserve those system files and document the evidence separately.

## fidelity

| Element | Finding | Evidence |
| --- | --- | --- |
| TYPE | match | Required packaging desktop/mobile captures use the homepage's Source Serif 4 display and Source Sans 3 body voices. Full supplied headings remain readable. |
| MATERIAL | match | Photography remains photographic, with the existing media registry's generated/stock provenance. No simulated physical effects replace content. |
| GROUND | match | Ivory/linen/ink fields, sienna actions and ultramarine links match the homepage and scoped CSS. |
| Responsive hierarchy | adaptation | Equal desktop introduction/photo columns; mobile introduction and actions precede photos, as the surface brief specifies. |
| Scenarios/workflow/scope | match | Representative industrial scenarios, packaging workflow/scope and sourcing preparation captures show clear ledgers, meaningful sequence numbers and confirmation boundaries. |
| FAQ/form | match | Native disclosures, full French form labels, visible action, explicit filename-only hint and localized validation/submission evidence. |
| Homepage breadcrumb | contradicted | FrenchTopicPage.tsx uses `to="/es"` for Accueil; cmsHref maps that to the Spanish site. The French chrome logo already correctly uses `/fr`. |

## ceiling

Reached at the existing topic family's scope: varied section density, strong serif headings, quiet fields, meaningful workflow numerals, genuine imagery and usable enquiries. Homepage decorative charts and kickers are not required in these content-led extensions. No new decorative motion or claims are needed.

## material_fixes

1. Replace the French Accueil breadcrumb destination `/es` with `/fr`; rebuild the topic bundle and embedded server, verify all ten breadcrumb URLs on the French host plus the generic France preview mount, and confirm clicking returns to the French homepage. This is a route fidelity failure.

## keep

Preserve all supplied business copy, French typography/palette, text-first phone hierarchy, scope boundaries, native FAQ and real CMS enquiry behavior while correcting the link.

---

Final verdict pass — 2026-10-14. The same in-thread substitution applies; this scores the named fix only.

## verdict

1. Resolved — FrenchTopicPage.tsx now uses `/fr`. `output/fr-topics/breadcrumb-review.json` records 22 successful desktop/mobile round trips: all ten French topics plus France preview at both widths return to the French homepage. German language links preserve each topic. The required `.impeccable/review/fr/desktop.png` and `mobile.png` were recaptured and reopened; the visible hierarchy, copy, imagery and controls remain intact. Frontend typecheck/build, embedded-server build and scoped Go tests pass after the correction.

## remaining

Clear for the named route fix; no visual regressions observed in its required captures. The inherited design-document omission remains recorded as pre-existing drift, with current French evidence in the delivery note.

disposition: ship

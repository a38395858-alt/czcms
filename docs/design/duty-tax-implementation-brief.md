# Import duty & tax calculator — implementation brief

Mode: Operate. User approved the generated desktop and mobile comps on 2026-11-10 with “按照图片…复刻出来”. This is one responsive feature with sample/partial result states, not two unrelated tools.

Approved visual references: [desktop](<duty-tax-desktop-v1.png>) and [mobile](<duty-tax-mobile-v1.png>). Use semantic Go HTML/CSS/JS, not an image as the UI. No new generation needed. Existing FreightVanta public header is authoritative; global admin DESIGN.md is not a reason to replace public identity.

## Direction contract

THESIS: Make every charge and every missing charge legible beside an editable shipment form. Preserve the approved two-column desktop composition and the mobile single-column summary/result flow. Reject marketing heroes and decorative data charts.

OWN-WORLD: Existing navy #102b4c, cobalt #155bc6, pale blue-gray canvas, white surfaces and fine cool borders; familiar fields, restrained corners, tabular amounts and practical sans-serif typography. Amber only marks unresolved costs.

STORY: Customer inspects destination/origin/code and costs, recalculates, understands known versus unknown, then explicitly requests verification. FR and US examples remain clearly synthetic; real evidence never implies complete tax coverage.

FIRST VIEWPORT: Shared header, breadcrumb/title and preview notice. Shipment form left; breakdown, subtotal and quote action right. Mobile collapses to shipment summary above result, with Edit details and a full-width quote action. Unknown states use info icons, not the generated image's misleading blue checkmarks.

FORM: User-pinned approved comps, code-led Operate implementation with no visual-world replacement. Sample scenario is selectable separately from a user's shipment. DDP/DAP only changes responsibility text.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Scope and exclusions

This implementation phase delivers local functional responsive UI, exact decimal arithmetic, explicit demonstration/manual scenarios, verified US base-rate evidence where safe, partial results elsewhere, code lookup and prefilled contact handoff. It must not claim completion of the entire planned tax-data governance/admin/sync system. No deploy, push or replacement of existing live data. Preserve all pre-existing uncommitted work.

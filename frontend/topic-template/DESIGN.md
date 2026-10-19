---
name: FreightVanta EN, DE and ES topics
description: Imported English/German templates and Spanish topics extending the live Mediterráneo homepage
colors:
  navy-deep: "#050f1f"
  navy: "#0a1b33"
  signal: "#1552b8"
  safety: "#ff7a1a"
  mist: "#f5f8fc"
  paper: "#fbfaf7"
  paper-layer: "#f6f4ee"
  graphite: "#16181c"
  brick: "#a83019"
  petrol: "#0e5f66"
  es-paper: "#fffdf9"
  es-sand: "#fbf7ef"
  es-pine: "#0b3027"
  es-ink: "#1c2320"
  es-muted: "#4f5a54"
  es-action: "#a33a1b"
  es-sea: "#0a6480"
  es-yellow: "#efc976"
typography:
  display-en:
    fontFamily: "Barlow Semi Condensed, IBM Plex Sans, sans-serif"
    fontWeight: 700
  display-de:
    fontFamily: "IBM Plex Serif, Georgia, serif"
    fontWeight: 700
  display-es:
    fontFamily: "Archivo, sans-serif"
    fontWeight: 800
  body:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontWeight: 400
  label:
    fontFamily: "IBM Plex Mono, monospace"
rounded:
  en-button: "3px"
  de-button: "2px"
spacing:
  shell-mobile: "1.25rem"
  shell-tablet: "2rem"
  shell-desktop: "2.5rem"
components:
  button-primary-en:
    backgroundColor: "{colors.safety}"
    textColor: "{colors.navy-deep}"
    rounded: "{rounded.en-button}"
  button-primary-de:
    backgroundColor: "{colors.brick}"
    textColor: "#ffffff"
    rounded: "{rounded.de-button}"
---

# Design System: FreightVanta EN, DE and ES topics

## Overview

**Creative North Star: "Pacific Operations / Speicherstadt Präzision"**

This document records the actual supplied source templates. English uses condensed display typography, navy fields and orange actions. German uses serif headings, paper fields and brick actions. The user requested reproduction, so these remain separate language identities. The root CZCMS admin DESIGN.md is a different surface and is preserved.

**Key Characteristics:**

- Distinct English and German display faces.
- Source photography, grids, section order and topic-specific compositions.
- Responsive tables, timelines, comparison sections and native FAQ disclosure.
- Local fonts and server-rendered content with hydrated controls.

## Colors

### Primary

Safety is the English primary action. Brick is the German primary action.

### Secondary

Signal marks English links and focus. Petrol marks German supporting links.

### Neutral

Navy and mist alternate English section fields. Paper and graphite alternate German fields. Exact reused values are recorded in the frontmatter and `src/index.css`.

## Typography

English display uses Barlow Semi Condensed, German display uses IBM Plex Serif. Both use IBM Plex Sans for body copy and IBM Plex Mono for source labels. All shipped fonts are local.

Topic variants set their own hero sizes. The 2026-10-13 German refinement uses H1 at 2.1–3.1rem / 1.16 with a 34ch maximum measure, and H2 at 1.7–2.2rem / 1.22. German workflow titles, scenario labels and FAQ questions use Plex Sans for easier scanning. German mobile headings use native hyphenation; English variants retain the supplied condensed hierarchy. German hero body text uses 16–17px and 1.72–1.75 line height.

## Layout

The shared shell has an 80rem maximum width, automatic inline margins and the responsive padding scale above. Multi-column desktop sections reflow into one column on phones. Source tables expose row labels when their desktop header is hidden. Native disclosure elements retain keyboard behavior.

German refinement adds equal-width hero text/photo columns, a full-width process rail with all source notes, native same-page navigation and a 52–80px section spacing range. Decision sections pair the heading with the body on desktop; related-service links use two columns. The photo and enquiry frames use fine borders without hard offset shadows. These rules are scoped in `src/de-topic-refinement.css` to the German topics.

## Elevation & Depth

Section fields and fine borders establish most depth. Primary buttons have a small inset lower edge. Sticky navigation changes with scroll. Source photographs retain their original framing; no substitute illustrations were introduced.

## Shapes

Controls use the small language-specific corner scale. Photographs and table frames preserve the source variants. Vector wordmarks and line icons come from the original components.

## Components

### Buttons

English primary actions use safety on navy-deep text; German primary actions use brick with white text. English has outline, dark and light ghost variants. Minimum interactive heights generally start at 44px. Focus uses the original three-pixel signal outline with a three-pixel offset.

### Inputs / Fields

White fields have fine mist borders and localised labels. The form exposes idle, validation, loading, request-error and success states, with focus moved to the relevant summary. File references retain filename-only behavior.

### Navigation

English has desktop dropdowns and a phone dialog. German has a desktop row and expandable phone navigation. Escape closes open menus. CMS adaptations change destinations, preserving the source labels and treatment.

German topic navigation exposes overview, workflow, scope, preparation, FAQ and enquiry when their corresponding sections exist. Targets have a scroll offset below the sticky header and support keyboard focus. Scope lists use checks for included items and arrows for items requiring confirmation.

### FAQ

Native details/summary controls use the supplied plus icon and section variant. Source focus behavior and minimum target heights are retained.

## Do's and Don'ts

- **Do** retain the language-specific families and source token values.
- **Do** preserve source photos, copy and per-topic responsive variants.
- **Do** use the CMS context for URLs, metadata and enquiry storage.
- **Don't** replace this public-topic system with the separate admin design.
- **Don't** add unsupported languages, commercial claims or demo-success submissions.

Source kickers, grids and the form error stripe are documented as imported source details, not generic rules for future unrelated surfaces. Ancillary policy destinations require real CMS content; this document does not establish legal copy.

## Spanish topics

Spanish extends the actual Mediterráneo homepage captured on 2026-10-13 in `output/es-topics/before-home-1440.png` and `before-home-390.png`. Its authority is Archivo, whitewash/sand surfaces, pine structure, sea links, ochre accents and red ochre actions. The old blue/Bricolage Spanish components from the source ZIP do not define this surface. The surface brief is `docs/freightvanta-es-topics-brief.md`; mode is Persuade.

`SpanishTopicChrome` and `SpanishTopicPage` own this composition; `src/es-topics.css` scopes its rules under `.es-topic-site`. Archivo is self-hosted at weights 400/600/700/800. H1 uses 2.05–3.3rem, 1.12 line height and a 34ch maximum measure; H2 uses 1.7–2.15rem. Body copy uses 16–17px with a 1.75 line height. Full titles precede equal text/photo columns on desktop; phones place introduction and actions before the image. Long factual copy remains intact.

The content sequence is decision explanation, scenario ledger, numbered process, scope, preparation/model lists, native FAQ, related services/sectors and enquiry. Fine separators and alternating paper/sand fields organize the page; pine scope sections distinguish included work from items requiring confirmation. Process numbers describe an actual sequence. Same-page navigation targets sit below the sticky header and receive keyboard focus. The process rail preserves its source labels and notes.

Six service and four industry links appear in both the topic and homepage menus. New topic destinations use native anchors, including the dynamically created mobile homepage menu. CMS URL replacement normalizes the boundary between a home base and an appended topic path. Language selection uses the CMS network and preserves the current topic. Menus support Escape; closing a nested menu preserves its containing mobile navigation.

The shared enquiry form receives Spanish labels, validation, consent, submission and success copy; its success heading inherits Archivo. It uses the actual CMS endpoint and token. Reference files transmit filenames only and state that behavior. SEO fields and visible FAQ answers are also used by the server metadata and schema. Preserve the original source wording and confirmation boundaries; CMS field names and production/image notes remain in the source document.

Source copy is captured in `docs/freightvanta-es-topic-copy-source.md` and imported by `frontend/topic-template/import-es-copy.py`. The attachment supplies nine complete pages; sourcing keeps its existing complete Spanish copy. Photography reuses the local source package and media registry. English and German retain their own type, palette and compositions.

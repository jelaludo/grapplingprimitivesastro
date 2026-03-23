---
role: arch
owner: Gerald
status: active
last-updated: 2026-03-23
---

# Architecture

## Scope
System structure, module patterns, data model, component boundaries, and cross-module consistency.

## Decisions
| Date | Decision | Rationale | Linked roles |
|---|---|---|---|
| 2026-03-18 | Story modules follow act-based scrollytelling pattern with IntersectionObserver | Established by ideal-partner, proven across jibunwotsukure. Consistent UX, deep-linkable via URL hash. | [[dev]], [[ux]] |
| 2026-03-18 | Primitives as Astro Content Collections with MD + YAML frontmatter | Build-time type safety via Zod, serialized to JS for client viz. Existing pattern for 248+ concepts. | [[dev]] |
| 2026-03-18 | Homepage sections: coreSections (always rendered) vs purgatorySections (DEV only) | purgatorySections gated behind `import.meta.env.DEV`. New public modules must go in coreSections. | [[dev]] |
| 2026-03-19 | Pure SVG (baked viewBox) over hybrid HTML+SVG for diagrams with connecting lines | Hybrid approach failed 3+ times: CSS grid positions nodes, but SVG coordinates for edges require runtime DOM measurement that CLI cannot provide and that desyncs on resize/font changes. Pure SVG with a fixed viewBox scales as a single unit. Trade-off: editing coordinates requires manual pixel work or an external SVG tool. | [[dev]], [[ux]] |
| 2026-03-19 | Purgatory->experiments is a one-way promotion; remove from purgatory once promoted | Avoids duplication across both lists. Lifecycle: purgatory (dev-only) -> experiments (live) -> possibly featured carousel later. | [[dev]], [[pm]] |
| 2026-03-18 | "Toolbox" as reusable conceptual framework | User's coined terminology for "simultaneous battles with intermediary goals and tool options". Will be reused across other position frameworks beyond back control. | [[pm]] |
| 2026-03-19 | Taxonomy audit revealed tags and related fields 100% empty | Biggest structural gap: 256 concepts with zero cross-references. Priority is populating `related` for grappling-primitives (38 concepts) first, then expanding. | [[pm]], [[dev]] |
| 2026-03-19 | Future: Concept Hover-Cards as `<ConceptLink>` component | Build-time lookup table from Content Collections. Manual `<ConceptLink id="BJJ-261">` tagging or remark plugin for auto-linking. Hover = short_description, click = full content. | [[dev]], [[ux]] |
| 2026-03-19 | Future: Move Deconstruction as new content collection | `technique-deconstructions` collection: technique name, position context, list of primitive IDs + role. Tree/graph viz. Start with 3-5 iconic techniques. | [[dev]], [[pm]] |
| 2026-03-20 | Two-tab pattern for companion articles within a single module | flow-bjj and flow-theory are distinct articles with different visual origins but share a conceptual dependency (theory -> application). Combined into one module with sticky tab bar at top:36px (below toolbar). Alternative rejected: two separate module pages cross-linking each other (loses the "companion" relationship, user may never find the second piece). | [[dev]], [[ux]] |
| 2026-03-20 | CSS custom properties scoped with `--fr-` prefix for module-specific palette | Avoids leaking into global scope or conflicting with other modules. Pattern: `--fr-bg`, `--fr-surface`, `--fr-accent`, etc. Mirrors site palette values but scoped to the module. | [[dev]] |
| 2026-03-20 | Condition/characteristic/consequence tab JS scoped to `#tab-research` | Page-level tab switcher uses `.fr-tab` class. Inner tab toggles in Tab 2 use `.fr-tab-btn` class scoped with `#tab-research .fr-tab-btn` selectors to avoid conflict. | [[dev]] |
| 2026-03-23 | `module-text` content collection: frontmatter-as-content pattern for Obsidian editability | `.md` files with `type: 'content'`, en/ja text in frontmatter (not body). Enables Obsidian editing while Astro consumes at build time. Alternative rejected: `.yaml` data files (Obsidian doesn't render them). Alternative rejected: markdown body with delimiter convention for bilingual split (fragile parsing). | [[dev]], [[pm]] |
| 2026-03-23 | `mdInline` utility over Astro's built-in markdown rendering for frontmatter strings | Astro's `<Content />` component only renders the markdown body. Frontmatter strings need separate inline parsing. `marked.parseInline()` handles bold/italic/links without `<p>` wrapping. Lightweight (35kb). | [[dev]] |
| 2026-03-23 | `resolve()` helper for content blocks with dynamic values | Chains: placeholder replacement (`{{conceptCount}}`) → relative link resolution (`](/` → `](${base}/`) → `mdInline()`. Keeps .md files clean of build-time concerns. | [[dev]] |
| 2026-03-23 | Shared calligraphy assets at `public/images/calligraphy/`, module-specific at `public/images/{module}/` | Landing page calligraphy (used across the site) lives in shared directory. Module-specific artwork (enso circle, shingitai painting) stays scoped to its module directory. | [[dev]], [[ux]] |
| 2026-03-23 | Shared essay `.act-*` CSS in `global.css`, modules override only what differs | Base pattern: .act (100vh flex center, opacity animation, border), .act-inner (780px), .act-number, .act-title, .act-lead, .act-subtitle + em styling. Modules override max-width, font-size, text-align as needed. Alternative rejected: keep duplicated per-module (accumulates drift as modules evolve independently). | [[dev]], [[ux]] |
| 2026-03-23 | Toolbar component extraction deferred | 14 modules have near-identical toolbars with minor variations (gap, extra buttons). Abstracting requires flexible slot pattern. Risk of edge cases outweighs immediate benefit. Revisit in dedicated session. | [[dev]] |
| 2026-03-23 | WebP as default image format, originals deleted post-conversion | All non-article PNG/JPG replaced with WebP at quality 80. Article PNGs kept because Obsidian `![[image.png]]` embeds reference them by original filename. Alternative rejected: update rehype plugin to prefer .webp (more invasive, breaks Obsidian preview). | [[dev]], [[devops]] |
| 2026-03-23 | `optimize-images.mjs` as manual script, not build-time step | Run once to convert batch, not on every build. Avoids sharp as a build dependency. New images should be added as WebP directly or run the script again. | [[devops]] |

## Dead Ends
<!-- APPEND ONLY. Never delete. -->
| Date | What was tried | Why it failed / was rejected |
|---|---|---|
| 2026-03-18 | Placed Experiments section in purgatorySections | Did not render in production. purgatorySections are dev-only. Moved to coreSections. |

## Lessons
- Check which array a homepage section belongs to before assuming it will render in production — from dead end on 2026-03-18

## Open Questions

## Assumptions
- Single-file module pattern scales to ~3000 lines before needing decomposition
- The "toolbox" framework generalizes to guard passing, mount control, and other positions

## Dependencies
Blocked by:
Feeds into: [[dev]], [[pm]]

## Session Log
<!-- One line per session, newest first -->
2026-03-23 (session 5 optimization) — WebP as default format. optimize-images.mjs as manual script (not build-time). Article PNGs kept for Obsidian compat.
2026-03-23 (session 5 audit) — Shared .act-* CSS extracted to global.css. Toolbar extraction evaluated and deferred (14 modules, too many variations for safe abstraction now). Audit baseline captured: 19216 lines, 669 inline styles, 432 hardcoded colors — deferred items logged.
2026-03-23 (session 5) — module-text content collection: frontmatter-as-content for Obsidian editability. mdInline utility for inline markdown in YAML strings. resolve() helper for dynamic placeholders + link resolution. Shared vs module-specific asset directory convention. :global() pattern for set:html content styling.
2026-03-20 (session 4) — Two-tab module pattern for companion articles. CSS variable scoping with --fr- prefix. Inner tab JS scoping to avoid page-level tab conflicts.
2026-03-19 (session 3) — Pure SVG architecture for CLD diagram resolved long-standing hybrid layout failures. Purgatory->experiments promotion lifecycle formalized.
2026-03-19 — Taxonomy audit findings. Future architecture: ConceptLink hover-cards, Move Deconstruction collection. Related-field population strategy defined.
2026-03-18 — Established back-control module architecture, homepage section fix

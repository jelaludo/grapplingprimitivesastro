---
role: dev
owner: Gerald
status: active
last-updated: 2026-03-23
---

# Development

## Scope
Implementation of modules, primitives, visualizations, and interactive elements. Inline script architecture (no separate JS files). Canvas/SVG rendering. Content Collections for data. Astro 5 + Tailwind.

## Decisions
| Date | Decision | Rationale | Linked roles |
|---|---|---|---|
| 2026-03-18 | Back control module as single .astro file with inline scripts | Matches existing pattern (ideal-partner, jibunwotsukure). Keeps all module logic co-located. | [[arch]] |
| 2026-03-18 | Simulation IDs/classes/functions prefixed with `sim-` | Avoids DOM conflicts when embedding complex standalone viz into a scrollytelling page with its own elements. | [[arch]] |
| 2026-03-18 | Simulation starts on IntersectionObserver visibility, not page load | Prevents CPU waste and avoids autoplay running while user reads earlier acts. | [[ux]] |
| 2026-03-18 | Images use `filter:invert(1) brightness(0.85)` for dark theme | PNGs are black-on-white originals. CSS inversion avoids maintaining separate dark versions. | [[ux]] |
| 2026-03-19 | Deleted 3 placeholder concepts (BJJ-202, BJJ-252, BJJ-253) | Broken entries with no content. IDs freed for reuse. | [[pm]] |
| 2026-03-19 | Expanded 10 physics stubs to ~130 words each | Physics category was 83% stubs (3-4 word definitions). Now all have grappling examples. | [[pm]] |
| 2026-03-19 | Created 10 new primitives (BJJ-262 through BJJ-271) across 4 categories | grappling-primitives (4), training (2), strategy (1), learning-methods (3). Corpus now 256 concepts. | [[pm]], [[arch]] |
| 2026-03-19 | Experiments section moved from purgatorySections to coreSections, status set to 'live' | purgatorySections are DEV-only gated. Back-control card was invisible in production. Also created webp thumbnail via sharp-cli. | [[arch]] |
| 2026-03-19 | CLD diagram rebuilt as pure SVG with baked viewBox coordinates | Runtime DOM measurement (getBoundingClientRect) was root cause of all prior CLD failures. CLI cannot reason about rendered layout. Pure SVG with fixed coordinates scales as a unit, no JS dependency for positioning. Alternative: CSS grid + JS-drawn SVG overlay (failed, coordinates desync from layout). | [[arch]], [[ux]] |
| 2026-03-19 | where-to-start promoted from purgatory to experiments tab | Module is functional. Thumbnail generated via sharp-cli (PNG->webp). Removed from index.astro purgatory to avoid duplication. Rule: once in experiments, remove from purgatory. | [[pm]], [[arch]] |
| 2026-03-20 | Flow-Roll module: two standalone HTML articles ported into single tabbed .astro page | Source: two finished jelastyle HTML files (flow-bjj + flow-theory). Combined into `/modules/flow-roll` with tab switching. Tab 1 (Sparring) is primary, Tab 2 (Research) is secondary. All content preserved exactly, visual identity adapted to site palette. 1683 lines. | [[arch]], [[ux]] |
| 2026-03-20 | Interactive slider uses explicit `hoverFill` property instead of opacity string-replace hack | Source HTML used `ch.fill.replace('0.8','1')` for hover brightness. With new rgba fill values at different opacities, the string-replace breaks. Replaced with per-channel `hoverFill` property. | [[arch]] |
| 2026-03-20 | Canvas font strings updated from Google Fonts to site monospace stack | Source used `Space Mono, monospace` in canvas `ctx.font` calls. Google Fonts removed; canvas now uses `"Courier New", Consolas, Monaco, monospace`. Same update applied to all SVG `font-family` attributes. | [[ux]] |
| 2026-03-23 | `module-text` content collection for Obsidian-editable text blocks | Type `content` (.md files), frontmatter carries `module`, `block`, `en`, `ja` fields. Body unused. Replaces inline text in .astro files. | [[arch]], [[pm]] |
| 2026-03-23 | `marked` installed + `src/lib/md-inline.ts` utility for inline markdown in frontmatter | `marked.parseInline()` converts `**bold**`, `*italic*`, `[links](url)` in frontmatter strings to HTML at build time. Needed because YAML frontmatter values are plain strings with no markdown processing. | [[arch]] |
| 2026-03-23 | Calligraphy assets reorganized: renamed existing, moved landing-page set to `public/images/calligraphy/` | Module-specific calligraphy (enso, shingitai artwork) stays in `public/images/jibunwotsukure/`. Shared landing-page calligraphy (3 vertical brush pieces) moved to `public/images/calligraphy/`. All files prefixed `calligraphy_`. | [[ux]] |
| 2026-03-23 | Back-control orange dot (Rotational Control) made clickable, links to QuadTree `#cat=Grappling%20Primitives` | SVG `<a>` wrapping the dot + label + invisible hit area circle. Hover glow via CSS `filter: drop-shadow`. | [[ux]] |
| 2026-03-23 | Landing page text blocks extracted to `src/content/module-text/` (6 files) | tagline, principle-1/2/3, intro (with `{{conceptCount}}`/`{{categoryCount}}` placeholders), cta (with markdown links). `resolve()` helper does placeholder replacement + link path resolution + mdInline. | [[arch]], [[ux]] |
| 2026-03-23 | `:global()` required for CSS selectors targeting `set:html` injected elements | Astro scoped styles add `data-astro-cid` attributes, but `set:html` content lacks them. Parent selector is scoped, child selectors use `:global()`. | [[arch]] |

## Dead Ends
<!-- APPEND ONLY. Never delete. -->
| Date | What was tried | Why it failed / was rejected |
|---|---|---|
| 2026-03-18 | SVG stick figures for ACT 0/1 asymmetry and rotation diagrams | Too schematic, lacked visual quality. Replaced with hand-drawn PNG illustrations that better convey the concept. |
| 2026-03-18 | Canvas drag interactive for ACT 1 hip/shoulder rotation | Added complexity without proportional value. Static annotated illustration communicates the concept more clearly. |
| 2026-03-19 | CSS grid + runtime SVG overlay for CLD diagram (3 iterations) | getBoundingClientRect returns nothing meaningful without a rendered DOM. CSS custom properties (--text-sm etc.) defined in BaseLayout are invisible to coordinate calculations. Lines drew from 0,0 or desynchronized on resize. The two positioning systems (CSS grid, SVG coordinates) are fundamentally decoupled. |
| 2026-03-19 | Animated border-width pulse on Confidence node | border-width animation causes layout reflow, making all surrounding nodes jitter. Dropped immediately. |

## Lessons

## Open Questions
- [ ] Simulation probability tuning: current values are starting defaults, need playtesting to find balanced settings — owner: Gerald — since: 2026-03-18

## Assumptions
- Inline scripts at current scale (~2300 lines) remain manageable without code splitting
- CSS inversion of PNGs will hold across all target browsers

## Dependencies
Blocked by:
Feeds into: [[ux]], [[qa]]

## Session Log
<!-- One line per session, newest first -->
2026-03-23 (session 5) — Content collection system: `module-text` collection + `mdInline` utility for Obsidian-editable text blocks with inline markdown. TLDRs for jibunwotsukure + ideal-partner. Landing page text (6 blocks) extracted. Calligraphy assets reorganized. Landing page: 3 principles with flanking calligraphy, module reorder, clickable principle links. Back-control orange dot linked to QuadTree. Vault README at `src/content/README.md`.
2026-03-20 (session 4) — Flow-Roll module: ported two standalone HTML articles (flow-bjj + flow-theory) into single tabbed Astro page. 1683 lines. Interactive slider (6 zones), 8-channel canvas diagram, 3 SVG vis-cards, evidence cards, verdict table, 10 paper references. All content preserved, visual identity adapted to site terminal palette. Registered in experiments page.
2026-03-19 (session 3) — CLD diagram rebuilt as pure SVG (baked coordinates, no runtime DOM dependency). where-to-start promoted to experiments tab with thumbnail. Purgatory->experiments promotion rule established.
2026-03-19 (session 2) — All 256 concepts: related fields populated + 345 bidirectional back-links. Global font scale bumped (monospace readability on large monitors). where-to-start module created (WIP, CLD diagram needs rebuild). Landing page cycling animation. Purgatory toggle on experiments page.
2026-03-19 — Taxonomy cleanup: deleted 3 placeholders, expanded 10 physics stubs, created 10 new primitives. Fixed Experiments section visibility in production. Thumbnail via sharp-cli.
2026-03-18 — Created back-control module (5 acts, simulation, BJJ-261 primitive)

---
project: Grappling Primitives
created: 2026-03-18
status: active
mode: solo
stale_threshold_days: 30
---

# Grappling Primitives — Index

## Brief
An Astro-based interactive learning platform that treats grappling knowledge as a multidimensional concept space. 248+ primitives across 22 categories, visualized via QuadTree maps, interactive story modules (scrollytelling with inline canvas/SVG), and data-driven tools. The site avoids technique catalogs in favor of unpacking mechanisms and principles — the "invisible architecture" of grappling. Bilingual (EN/JA), dark theme, monospace aesthetic.

## Active Roles
- [[dev]] — owner: Gerald
- [[arch]] — owner: Gerald
- [[pm]] — owner: Gerald
- [[ux]] — owner: Gerald
- [[qa]] — owner: Gerald
- [[devops]] — owner: Gerald

## Key Decisions
- Pure SVG with baked viewBox for any diagram with connecting lines (2026-03-19, [[arch]])
- Module lifecycle: purgatory (dev-only) -> experiments (live) -> featured. Remove from prior stage on promotion. (2026-03-19, [[arch]])
- Two-tab pattern for companion articles within a single module (2026-03-20, [[arch]])
- CSS custom properties scoped with module-specific prefix (--fr-) to avoid global conflicts (2026-03-20, [[arch]])
- `module-text` content collection: Obsidian-editable .md files with en/ja frontmatter + mdInline for inline markdown (2026-03-23, [[arch]], [[dev]])
- Shared calligraphy at `public/images/calligraphy/`, module-specific at `public/images/{module}/` (2026-03-23, [[arch]])

## Open Questions (cross-role)
- Future CLD addition: "Understanding of Escapes" node feeding into Maintain Dominant Positions (knowing escapes = better at shutting them down)

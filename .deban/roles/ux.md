---
role: ux
owner: Gerald
status: active
last-updated: 2026-03-23
---

# User Experience

## Scope
Readability, interaction design, responsive behavior, visual hierarchy, and information density.

## Decisions
| Date | Decision | Rationale | Linked roles |
|---|---|---|---|
| 2026-03-18 | Event log uses fixed height (140px) instead of max-height | Prevents simulation from shifting vertically as log entries append. Log scrolls internally. | [[dev]] |
| 2026-03-18 | Hover tooltip on simulation stage columns | Simulation text is necessarily small (5 columns). Tooltip shows enlarged stage name, goal, state, and active tools on hover. | [[dev]] |
| 2026-03-18 | Toolbox section placed below simulation, not above | User sees the simulation first (experiential), then reads the structural breakdown. Show then explain. | [[pm]] |
| 2026-03-18 | Quadrant SVG label positioned above dot, not to the right | Right-positioned label was clipped. Top placement fits within viewBox. | [[dev]] |
| 2026-03-18 | Primitive card clickable with confirmation modal before navigation | Prevents accidental navigation away from the essay. Modal confirms intent to leave for QuadTree. | [[dev]] |
| 2026-03-23 | Landing page principles section: calligraphy flanking each principle, alternating left/right | Calligraphy images at 85% opacity (hover to 100%) alongside numbered principles. Creates visual rhythm. Principles are clickable links to their corresponding modules. | [[dev]] |
| 2026-03-23 | Hero module card order: Build Yourself → Ideal Partner → QuadTree | Matches the "three things" priority order in the principles section. Previously was Ideal Partner → QuadTree → Build Yourself. | [[pm]] |
| 2026-03-23 | TLDRs placed at top of page (above hero), collapsed by default | Reader sees the option immediately without scrolling. Collapsible `<details>` so it doesn't compete with the hero. Alternative rejected: TLDR inside hero section (buried below the visual centerpiece). | [[dev]] |
| 2026-03-23 | Jibunwotsukure hero: "Build Yourself First" text repositioned to top-left of enso image | Occupies blank space above the brush circle. Previously overlaid left-center of the image. | [[dev]] |

## Dead Ends
<!-- APPEND ONLY. Never delete. -->
| Date | What was tried | Why it failed / was rejected |
|---|---|---|
| 2026-03-20 | Keeping original article visual identities (paper-light theme for bjj, dark-amber for theory) | User explicitly wanted both adapted to site terminal palette. Preserving original themes would create visual inconsistency with the rest of the site. Both articles now use the same dark/monospace/accent-blue identity. |
| 2026-03-18 | Small font sizes across toolbox (10-11px, --text-xs) | User reported "extremely hard to read on desktop." Bumped to --text-sm/--text-base throughout. |
| 2026-03-18 | Toolbox placed above simulation | Disrupted flow. User wanted simulation first, explanation after. Moved below. |
| 2026-03-19 | ModuleCard status 'wip' renders as greyed-out and unclickable in production | Back-control card was invisible on the Experiments tab. Changed to status 'live' and unified homepage section with Experiments tab page. |
| 2026-03-19 | SVG overlay + absolute positioned HTML nodes for CLD diagram | Font size changes break node positions, mobile stacking makes no semantic sense, coordinates are fragile. Tried 3 times, failed 3 times. Needs pure flexbox or static image approach. |
| 2026-03-19 | CSS grid + JS-drawn SVG overlay (second attempt at hybrid) | Same root cause as above. getBoundingClientRect depends on rendered DOM; CLI cannot provide it. Edges drew from wrong positions. Resolved by switching to pure SVG with baked coordinates. |
| 2026-03-19 | Animated border-width on Confidence node to show "confidence growing" | border-width changes cause layout reflow, making surrounding elements jitter unnaturally. User rejected immediately. |
| 2026-03-19 | Global font scale with low clamp ceilings (max 16-18px) | Unreadable on 2560px+ monitors. Monospace needs larger sizes than sans-serif. Bumped to 16-24px range with vw+px formula. |

## Lessons
- Default font sizes for data-dense sections should start at --text-sm minimum, not --text-xs — from dead end on 2026-03-18
- "Show then explain" ordering: let the user experience the interactive before reading the structural breakdown — from dead end on 2026-03-18
- Never mix SVG coordinate positioning with HTML nodes styled by CSS font variables. The two systems are decoupled and will break independently. — from dead end on 2026-03-19
- For diagrams with connecting lines, use pure SVG with a fixed viewBox. Edit coordinates in an external tool, not in code. The trade-off (manual pixel work) is worth the reliability. — from dead end on 2026-03-19
- Never animate border-width or any box-model property that causes reflow. Use transforms, opacity, or box-shadow instead. — from dead end on 2026-03-19
- Monospace fonts need 20-30% larger pixel sizes than sans-serif to achieve equivalent readability. Compare against real sites (claude.ai, submeta.io) not just "looks OK on my screen." — from dead end on 2026-03-19

## Open Questions
- [ ] Mobile (iPhone) readability not yet tested. Simulation 5-column layout may need further work. — owner: Gerald — since: 2026-03-18

## Assumptions
- Desktop is the primary consumption device for this content
- CSS filter inversion of black-on-white PNGs reads well on dark backgrounds

## Dependencies
Blocked by:
Feeds into: [[dev]], [[qa]]

## Session Log
<!-- One line per session, newest first -->
2026-03-23 (session 5) — Landing page: calligraphy-flanked principles layout, module reorder, clickable principle links. TLDRs moved to page top. Jibunwotsukure hero text repositioned top-left. "Basic Components" dropped from title rotation (now 3 words).
2026-03-20 (session 4) — Flow-Roll module visual adaptation: two articles with distinct themes (paper-light, dark-amber) unified under site terminal palette. Slider zones mapped to 6 distinguishable colors (dim/green/cyan/amber/accent/red). Cyan used for Tab 2 hero em to visually differentiate research tab from sparring tab. Chinese characters use system CJK fallback (platform-dependent rendering, accepted).
2026-03-19 (session 3) — CLD diagram resolved via pure SVG. Animated border-width rejected (reflow jitter). Title changed from "Confidence Creates a Fork" to "Confidence Creates Options" (Gerald's correction: confidence opens possibilities, not a binary choice). explore/exploit labels color-coded and linked to BJJ-265.
2026-03-19 (session 2) — Font scale overhaul (3 iterations to get right). CLD diagram failed 3 times (SVG overlay approach is dead). where-to-start module text/UX is solid, diagram WIP.
2026-03-19 — Fixed Experiments card visibility (wip->live). Unified homepage section with Experiments tab.
2026-03-18 — Fixed readability issues (font sizes, log shifting, label clipping), reordered toolbox
